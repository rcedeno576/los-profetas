import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { sendPushToUser } from '@/app/lib/push/server'
import { MESSAGES, PUSH_NOTIFICATION_TYPES } from '@/app/lib/constants'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: MESSAGES.sync.unauthorized }, { status: 401 })
  }

  const supabase = createServiceClient()
  const results = {
    synced:      0,
    scored:      0,
    notified:    0,
    notifyFailed: 0,
    errors:      [] as string[],
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  // 1. Traer ligas activas
  const { data: leagues } = await supabase
    .from('leagues')
    .select('id, code, external_id')
    .eq('active', true)

  if (!leagues?.length) {
    return NextResponse.json({ message: 'Sin ligas activas', ...results })
  }

  // 2. Sync de fixtures por liga
  for (const league of leagues) {
    try {
      const res = await fetch(`${baseUrl}/api/sync-fixtures`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${process.env.SYNC_SECRET}`,
        },
        body: JSON.stringify({ leagueCode: league.code, leagueId: league.id }),
      })
      if (res.ok) results.synced++
    } catch (e) {
      results.errors.push(`Sync ${league.code}: ${e}`)
    }
  }

  // 3. Buscar predicciones sin puntuar
  const { data: unscored } = await supabase
    .from('predictions')
    .select('fixture_id')
    .is('scored_at', null)

  if (unscored?.length) {
    const fixtureIds = [...new Set(unscored.map((p) => p.fixture_id))]

    // 4. Verificar cuáles están finished
    const { data: finishedFixtures } = await supabase
      .from('fixtures')
      .select('id')
      .in('id', fixtureIds)
      .eq('status', 'finished')
      .not('real_home', 'is', null)
      .not('real_away', 'is', null)

    // 5. Score por cada fixture finished
    for (const fixture of finishedFixtures ?? []) {
      try {
        const res = await fetch(`${baseUrl}/api/score-predictions`, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${process.env.SYNC_SECRET}`,
          },
          body: JSON.stringify({ fixture_id: fixture.id }),
        })
        if (res.ok) results.scored++
      } catch (e) {
        results.errors.push(`Score ${fixture.id}: ${e}`)
      }
    }
  }

  // 6. Notificar partidos terminados que aún no enviaron notificación
  //    Independiente del scoring — solo depende de notified_at
  const { data: toNotify, error: notifyQueryError } = await supabase
    .from('fixtures')
    .select('id, home_name, away_name, real_home, real_away, league_id')
    .eq('status', 'finished')
    .not('real_home', 'is', null)
    .not('real_away', 'is', null)
    .is('notified_at', null)

  if (notifyQueryError) {
    results.errors.push(`Notify query: ${notifyQueryError.message}`)
  }

  for (const fixture of toNotify ?? []) {
    // Marcar como notificado ANTES de enviar — evita duplicados si el proceso
    // falla a medias y el cron vuelve a correr en 30 min
    const { error: markError } = await supabase
      .from('fixtures')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', fixture.id)

    if (markError) {
      results.errors.push(`Mark notified ${fixture.id}: ${markError.message}`)
      continue
    }

    // Traer miembros activos de los pools de esta liga
    const { data: pools } = await supabase
      .from('pools')
      .select('id')
      .eq('league_id', fixture.league_id)
      .in('status', ['open', 'active'])

    if (!pools?.length) continue

    const poolIds = pools.map((p) => p.id)

    const { data: activeMembers } = await supabase
      .from('pool_members')
      .select('user_id, pool_id')
      .in('pool_id', poolIds)
      .eq('active', true)

    if (!activeMembers?.length) continue

    // Solo usuarios con suscripción push
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('user_id')

    const subscribedUserIds = new Set(
      (subscriptions ?? []).map((s: { user_id: string }) => s.user_id),
    )

    const notificationBody = `${fixture.home_name} ${fixture.real_home} - ${fixture.real_away} ${fixture.away_name} · Revisa cuánto ganaste`

    await Promise.all(
      activeMembers
        .filter((m) => subscribedUserIds.has(m.user_id))
        .map(async (member) => {
          const logPayload = {
            user_id:    member.user_id,
            pool_id:    member.pool_id,
            fixture_id: fixture.id,
            type:       PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED,
          }

          const { error: logError } = await supabase
            .from('push_notification_logs')
            .insert(logPayload)

          if (logError) return

          try {
            await sendPushToUser({
              userId: member.user_id,
              payload: {
                title: '🏆 ¡Ya están los puntos!',
                body:  notificationBody,
                url:   `/liga/${member.pool_id}/partidos/${fixture.id}`,
                type:  PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED,
              },
            })
            results.notified++
          } catch {
            results.notifyFailed++
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

  return NextResponse.json({
    message: 'Cron ejecutado correctamente',
    ...results,
  })
}