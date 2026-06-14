import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { calculatePoints } from '@/app/lib/scoring'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { fixture_id } = await req.json()
  if (!fixture_id) {
    return NextResponse.json({ error: 'fixture_id requerido' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1. Traer el fixture
  const { data: fixture } = await supabase
    .from('fixtures')
    .select('id, status, real_home, real_away')
    .eq('id', fixture_id)
    .single()

  if (!fixture) {
    return NextResponse.json({ error: 'Fixture no encontrado' }, { status: 404 })
  }

  if (fixture.status !== 'finished' || fixture.real_home === null || fixture.real_away === null) {
    return NextResponse.json({ error: 'El partido no ha finalizado aún' }, { status: 400 })
  }

  // 2. Traer TODAS las predicciones del fixture (con o sin scored_at)
  const { data: predictions, error: predsError } = await supabase
    .from('predictions')
    .select('id, user_id, pool_id, pred_home, pred_away, points_won, pool:pools(rules:pool_rules(pts, rule:scoring_rules(code)))')
    .eq('fixture_id', fixture_id)

  if (predsError) {
    return NextResponse.json({ error: predsError.message }, { status: 500 })
  }

  if (!predictions?.length) {
    return NextResponse.json({ message: 'Sin predicciones para este fixture', rescored: 0 })
  }

  let rescored  = 0
  let skipped   = 0
  let failed    = 0

  for (const pred of predictions) {
    const rules = (pred.pool as any)?.rules ?? []

    const { total: expected } = calculatePoints({
      predHome: pred.pred_home,
      predAway: pred.pred_away,
      realHome: fixture.real_home,
      realAway: fixture.real_away,
      rules,
    })

    const stored = pred.points_won ?? 0

    // Si ya está correcto, no hacer nada
    if (stored === expected && pred.points_won !== null) {
      skipped++
      continue
    }

    // Delta: puede ser positivo o negativo
    const delta = expected - stored

    // 3. Actualizar la predicción
    const { error: updateError } = await supabase
      .from('predictions')
      .update({
        points_won: expected,
        scored_at:  new Date().toISOString(),
      })
      .eq('id', pred.id)

    if (updateError) {
      console.error(`[rescore] failed to update prediction ${pred.id}:`, updateError.message)
      failed++
      continue
    }

    // 4. Ajustar el total del miembro con el delta (puede restar si delta es negativo)
    const { error: rpcError } = await supabase.rpc('increment_member_pts', {
      p_pool_id: pred.pool_id,
      p_user_id: pred.user_id,
      p_pts:     delta,
    })

    if (rpcError) {
      console.error(`[rescore] failed to increment_member_pts for user ${pred.user_id}:`, rpcError.message)
      failed++
      continue
    }

    rescored++
  }

  return NextResponse.json({
    ok: true,
    fixture_id,
    total:    predictions.length,
    rescored,
    skipped,
    failed,
  })
}