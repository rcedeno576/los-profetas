import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { calculatePoints } from '@/app/lib/scoring'
import { startLog } from '@/app/lib/cron-logger'
import { MESSAGES } from '@/app/lib/constants'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: MESSAGES.sync.unauthorized }, { status: 401 })
  }

  const { fixture_id } = await req.json()
  if (!fixture_id) {
    return NextResponse.json({ error: 'fixture_id requerido' }, { status: 400 })
  }

  const log      = startLog('score', { fixture_id })
  const supabase = createServiceClient()

  // 1. Traer el fixture
  const { data: fixture } = await supabase
    .from('fixtures')
    .select('id, status, real_home, real_away')
    .eq('id', fixture_id)
    .single()

  if (!fixture) {
    await log.skip('Fixture no encontrado')
    return NextResponse.json({ error: MESSAGES.prediction.notFound }, { status: 404 })
  }

  if (fixture.status !== 'finished' || fixture.real_home === null || fixture.real_away === null) {
    await log.skip('Partido no finalizado aún')
    return NextResponse.json({ error: 'El partido no ha finalizado aún' }, { status: 400 })
  }

  // 2. Traer todas las predicciones de este fixture (sin puntuar aún)
  const { data: predictions } = await supabase
    .from('predictions')
    .select('id, user_id, pool_id, pred_home, pred_away, pool:pools(rules:pool_rules(pts, rule:scoring_rules(code)))')
    .eq('fixture_id', fixture_id)
    .is('scored_at', null)

  if (!predictions?.length) {
    await log.skip('Sin predicciones pendientes')
    return NextResponse.json({ message: 'Sin predicciones pendientes', scored: 0 })
  }

  // 3. Calcular y actualizar puntos para cada predicción
  let scored = 0

  try {
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

    await log.success({ fixture_id, scored })

    // 4. Disparar notify-scored una vez que los puntos están calculados
    // Fire and forget — no bloqueamos la respuesta
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    fetch(`${baseUrl}/api/notify-scored`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.SYNC_SECRET}`,
      },
    }).catch(() => {})

    return NextResponse.json({
      message: MESSAGES.sync.success,
      fixture_id,
      scored,
    })
  } catch (err) {
    await log.error(err)
    return NextResponse.json({ error: 'Error al calcular puntos' }, { status: 500 })
  }
}
