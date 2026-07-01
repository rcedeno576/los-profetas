import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { startLog } from '@/app/lib/cron-logger'
import { MESSAGES } from '@/app/lib/constants'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: MESSAGES.sync.unauthorized }, { status: 401 })
  }

  const log      = startLog('cron')
  const supabase = createServiceClient()
  const baseUrl  = process.env.NEXT_PUBLIC_APP_URL
  const headers  = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${process.env.SYNC_SECRET}`,
  }

  try {
    // 1. Traer ligas activas
    const { data: leagues } = await supabase
      .from('leagues')
      .select('id, code, external_id')
      .eq('active', true)

    if (!leagues?.length) {
      await log.skip('Sin ligas activas')
      return NextResponse.json({ message: 'Sin ligas activas' })
    }

    // 2. Disparar sync por liga — fire and forget
    for (const league of leagues) {
      fetch(`${baseUrl}/api/sync-fixtures`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ leagueCode: league.code, leagueId: league.id }),
      }).catch(() => {})
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

      // 5. Disparar scoring por fixture — fire and forget
      // score-predictions se encarga de disparar notify-scored al terminar
      for (const fixture of finishedFixtures ?? []) {
        fetch(`${baseUrl}/api/score-predictions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ fixture_id: fixture.id }),
        }).catch(() => {})
      }
    }

    await log.success({ leagues: leagues.length })

    return NextResponse.json({
      message: 'Cron disparado correctamente',
      leagues: leagues.length,
    })

  } catch (err) {
    await log.error(err)
    return NextResponse.json({ error: 'Error interno del cron' }, { status: 500 })
  }
}
