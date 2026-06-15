import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { calculatePoints } from '@/app/lib/scoring'
import { sendPushToUser } from '@/app/lib/push/server'
import { MESSAGES, PUSH_NOTIFICATION_TYPES } from '@/app/lib/constants'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: MESSAGES.sync.unauthorized }, { status: 401 })
  }

  const { fixture_id } = await req.json()
  if (!fixture_id) {
    return NextResponse.json({ error: 'fixture_id requerido' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1. Traer el fixture (incluyendo nombres para la notificación)
  const { data: fixture } = await supabase
    .from('fixtures')
    .select('id, status, real_home, real_away, home_name, away_name')
    .eq('id', fixture_id)
    .single()

  if (!fixture) {
    return NextResponse.json({ error: MESSAGES.prediction.notFound }, { status: 404 })
  }

  if (fixture.status !== 'finished' || fixture.real_home === null || fixture.real_away === null) {
    return NextResponse.json({ error: 'El partido no ha finalizado aún' }, { status: 400 })
  }

  // 2. Traer todas las predicciones de este fixture (sin puntuar aún)
  const { data: predictions } = await supabase
    .from('predictions')
    .select('id, user_id, pool_id, pred_home, pred_away, pool:pools(rules:pool_rules(pts, rule:scoring_rules(code)))')
    .eq('fixture_id', fixture_id)
    .is('scored_at', null)

  if (!predictions?.length) {
    return NextResponse.json({ message: 'Sin predicciones pendientes', scored: 0 })
  }

  // 3. Calcular y actualizar puntos para cada predicción
  let scored = 0

  for (const pred of predictions) {
    const rules = (pred.pool as any)?.rules ?? []

    const { total } = calculatePoints({
      predHome: pred.pred_home,
      predAway: pred.pred_away,
      realHome: fixture.real_home,
      realAway: fixture.real_away,
      rules,
    })

    await supabase
      .from('predictions')
      .update({
        points_won: total,
        scored_at:  new Date().toISOString(),
      })
      .eq('id', pred.id)

    await supabase.rpc('increment_member_pts', {
      p_pool_id: pred.pool_id,
      p_user_id: pred.user_id,
      p_pts:     total,
    })

    scored++
  }

  // 4. Notificar a todos los miembros activos de los pools involucrados
  const poolIds = [...new Set(predictions.map((p) => p.pool_id))]

  const { data: activeMembers } = await supabase
    .from('pool_members')
    .select('user_id, pool_id')
    .in('pool_id', poolIds)
    .eq('active', true)

  // Solo notificar usuarios con suscripción push activa
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('user_id')

  const subscribedUserIds = new Set(
    (subscriptions ?? []).map((s: { user_id: string }) => s.user_id),
  )

  const notificationBody = `${fixture.home_name} ${fixture.real_home} - ${fixture.real_away} ${fixture.away_name} · Revisa cuánto ganaste`

  let notified = 0
  let notifyFailed = 0

  await Promise.all(
    (activeMembers ?? [])
      .filter((m) => subscribedUserIds.has(m.user_id))
      .map(async (member) => {
        const logPayload = {
          user_id:    member.user_id,
          pool_id:    member.pool_id,
          fixture_id: fixture_id,
          type:       PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED,
        }

        const { error: logError } = await supabase
          .from('push_notification_logs')
          .insert(logPayload)

        // Si ya fue notificado (unique constraint), saltar
        if (logError) return

        try {
          await sendPushToUser({
            userId: member.user_id,
            payload: {
              title: '🏆 ¡Ya están los puntos!',
              body:  notificationBody,
              url:   `/liga/${member.pool_id}/partidos/${fixture_id}`,
              type:  PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED,
            },
          })
          notified++
        } catch {
          notifyFailed++
          // Rollback del log para que pueda reintentarse
          await supabase
            .from('push_notification_logs')
            .delete()
            .eq('user_id', member.user_id)
            .eq('pool_id', member.pool_id)
            .eq('fixture_id', fixture_id)
            .eq('type', PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED)
        }
      }),
  )

  return NextResponse.json({
    message: MESSAGES.sync.success,
    fixture_id,
    scored,
    notified,
    notifyFailed,
  })
}