import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { sendPushToUser } from '@/app/lib/push/server'
import { startLog } from '@/app/lib/cron-logger'
import { MESSAGES, PUSH_NOTIFICATION_TYPES } from '@/app/lib/constants'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: MESSAGES.sync.unauthorized }, { status: 401 })
  }

  const log      = startLog('notify_scored')
  const supabase = createServiceClient()

  try {
    // 1. Buscar fixture_ids que ya tienen predicciones calculadas (scored_at poblado)
    // Garantiza que los puntos existen antes de notificar
    const { data: scoredPredictions, error: predsError } = await supabase
      .from('predictions')
      .select('fixture_id')
      .not('scored_at', 'is', null)

    if (predsError) {
      await log.error(predsError.message)
      return NextResponse.json({ error: predsError.message }, { status: 500 })
    }

    if (!scoredPredictions?.length) {
      await log.skip('Sin predicciones calculadas aún')
      return NextResponse.json({ ok: true, notified: 0 })
    }

    const scoredFixtureIds = [...new Set(scoredPredictions.map((p) => p.fixture_id))]

    // 2. De esos fixtures, traer los que aún no han notificado
    const { data: toNotify, error } = await supabase
      .from('fixtures')
      .select('id, home_name, away_name, real_home, real_away, league_id')
      .in('id', scoredFixtureIds)
      .eq('status', 'finished')
      .not('real_home', 'is', null)
      .not('real_away', 'is', null)
      .is('notified_at', null)

    if (error) {
      await log.error(error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!toNotify?.length) {
      await log.skip('Sin partidos pendientes de notificación')
      return NextResponse.json({ ok: true, notified: 0 })
    }

    let notified     = 0
    let notifyFailed = 0

    for (const fixture of toNotify) {
      // Marcar ANTES de enviar — evita duplicados si el proceso falla a medias
      const { error: markError } = await supabase
        .from('fixtures')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', fixture.id)

      if (markError) continue

      const { data: pools } = await supabase
        .from('pools')
        .select('id')
        .eq('league_id', fixture.league_id)
        .in('status', ['open', 'active'])

      if (!pools?.length) continue

      const poolIds = pools.map((p) => p.id)

      const [membersResult, subscriptionsResult] = await Promise.all([
        supabase
          .from('pool_members')
          .select('user_id, pool_id')
          .in('pool_id', poolIds)
          .eq('active', true),
        supabase
          .from('push_subscriptions')
          .select('user_id'),
      ])

      const activeMembers     = membersResult.data ?? []
      const subscribedUserIds = new Set(
        (subscriptionsResult.data ?? []).map((s: { user_id: string }) => s.user_id),
      )

      if (!activeMembers.length) continue

      const body = `${fixture.home_name} ${fixture.real_home} - ${fixture.real_away} ${fixture.away_name} · Revisa cuánto ganaste`

      await Promise.all(
        activeMembers
          .filter((m) => subscribedUserIds.has(m.user_id))
          .map(async (member) => {
            const { error: logError } = await supabase
              .from('push_notification_logs')
              .insert({
                user_id:    member.user_id,
                pool_id:    member.pool_id,
                fixture_id: fixture.id,
                type:       PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED,
              })

            if (logError) return

            try {
              await sendPushToUser({
                userId: member.user_id,
                payload: {
                  title: '🏆 ¡Ya están los puntos!',
                  body,
                  url:  `/liga/${member.pool_id}/partidos/${fixture.id}`,
                  type: PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED,
                },
              })
              notified++
            } catch {
              notifyFailed++
              await supabase
                .from('push_notification_logs')
                .delete()
                .eq('user_id', member.user_id)
                .eq('pool_id', member.pool_id)
                .eq('fixture_id', fixture.id)
                .eq('type', PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED)
            }
          }),
      )
    }

    await log.success({ fixtures: toNotify.length, notified, notifyFailed })

    return NextResponse.json({ ok: true, fixtures: toNotify.length, notified, notifyFailed })

  } catch (err) {
    await log.error(err)
    return NextResponse.json({ error: 'Error al enviar notificaciones' }, { status: 500 })
  }
}