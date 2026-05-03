import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServiceClient } from '@/app/lib/supabase/service'

export async function POST(req: Request) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const in15 = new Date(now.getTime() + 15 * 60 * 1000)
  const in16 = new Date(now.getTime() + 16 * 60 * 1000)

  // Partidos que empiezan en ~15 minutos
  const { data: fixtures } = await supabase
    .from('fixtures')
    .select('id, home_name, away_name')
    .eq('status', 'scheduled')
    .gte('kickoff_at', in15.toISOString())
    .lte('kickoff_at', in16.toISOString())

  if (!fixtures?.length) return NextResponse.json({ notified: 0 })

  let notified = 0

  for (const fixture of fixtures) {
    // Usuarios que NO han predicho este partido en ninguna liguilla activa
    const { data: poolMembers } = await supabase
      .from('pool_members')
      .select('user_id')
      .eq('active', true)

    const { data: predicted } = await supabase
      .from('predictions')
      .select('user_id')
      .eq('fixture_id', fixture.id)

    const predictedIds = new Set((predicted ?? []).map(p => p.user_id))
    const unpredicted = (poolMembers ?? [])
      .filter(m => !predictedIds.has(m.user_id))
      .map(m => m.user_id)

    if (!unpredicted.length) continue

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .in('user_id', unpredicted)

    const payload = JSON.stringify({
      title: '⏰ ¡Último momento para predecir!',
      body: `${fixture.home_name} vs ${fixture.away_name} empieza en 15 min`
    })

    await Promise.allSettled(
      (subs ?? []).map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch(async (err: any) => {
          if (err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          }
        })
      )
    )

    notified += subs?.length ?? 0
  }

  return NextResponse.json({ notified })
}