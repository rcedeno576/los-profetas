import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { MESSAGES } from '@/app/lib/constants'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: MESSAGES.sync.unauthorized }, { status: 401 })
  }

  const supabase = createServiceClient()
  const results = { synced: 0, scored: 0, errors: [] as string[] }
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

  if (!unscored?.length) {
    return NextResponse.json({ message: 'Sin predicciones pendientes', ...results })
  }

  const fixtureIds = [...new Set(unscored.map(p => p.fixture_id))]

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

  return NextResponse.json({
    message: 'Cron ejecutado correctamente',
    ...results,
  })
}