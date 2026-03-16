import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { fetchFixtures } from '@/app/lib/api-football'
import type { FixtureInsert } from '@/app/lib/types'

// ─── POST /api/sync-fixtures ───────────────────────────────────────────────────
// Protegido con Bearer token (SYNC_SECRET en .env.local)
// Body JSON opcional: { leagueCode: 'CL', leagueId: 2 }
// Sin body → sincroniza todas las ligas activas de la BD

export async function POST(req: NextRequest) {

  const auth   = req.headers.get('Authorization') ?? ''
  const secret = process.env.SYNC_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const supabase = createServiceClient()

  try {
    let leaguesToSync: { id: number; code: string; name: string }[] = []

    const body = await req.json().catch(() => null)

    if (body?.leagueCode && body?.leagueId) {
      leaguesToSync = [{ id: body.leagueId, code: body.leagueCode, name: body.leagueCode }]
    } else {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, code, name')
        .eq('active', true)

      if (error) throw new Error(`Error leyendo leagues: ${error.message}`)
      leaguesToSync = data ?? []
    }

    const results: Record<string, { upserted: number; error?: string }> = {}

    for (const league of leaguesToSync) {
      try {
        const fixtures: FixtureInsert[] = await fetchFixtures(league.code, league.id)

        if (fixtures.length === 0) {
          results[league.code] = { upserted: 0 }
          continue
        }

        // Upsert usando external_id como campo de conflicto
        // Si el partido ya existe (mismo external_id) → actualiza
        // Si no existe → inserta con nuevo UUID
        const { error: upsertError } = await supabase
          .from('fixtures')
          .upsert(fixtures, { onConflict: 'external_id' })

        if (upsertError) throw new Error(upsertError.message)

        results[league.code] = { upserted: fixtures.length }

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        results[league.code] = { upserted: 0, error: msg }
        console.error(`[sync-fixtures] Error en ${league.code}:`, msg)
      }
    }

    return NextResponse.json({
      ok:     true,
      synced: new Date().toISOString(),
      results,
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[sync-fixtures] Error general:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}