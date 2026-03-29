import { createServiceClient } from '@/app/lib/supabase/service'
import type { Profile } from '@/app/lib/types'

export type ProfetaStats = {
  pool_id:         string
  pool_name:       string
  league_name:     string
  total_pts:       number
  predictions:     number
  aciertos:        number
  exactos:         number
}

export type ProfetaProfile = {
  profile:  Profile
  liguillas: ProfetaStats[]
}

export async function getProfetaProfile(userId: string): Promise<ProfetaProfile | null> {
  const supabase = createServiceClient()

  // 1. Traer perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_id, total_pts, created_at')
    .eq('id', userId)
    .single()

  if (!profile) return null

  // 2. Traer liguillas donde es miembro con sus pts
  const { data: memberships } = await supabase
    .from('pool_members')
    .select('pool_id, total_pts, pool:pools(id, name, league:leagues(name))')
    .eq('user_id', userId)
    .eq('active', true)

  if (!memberships?.length) return { profile, liguillas: [] }

  // 3. Traer predicciones puntuadas por liguilla
  const poolIds = memberships.map((m: any) => m.pool_id)

  const { data: predictions } = await supabase
    .from('predictions')
    .select('pool_id, points_won, pred_home, pred_away, fixture:fixtures(real_home, real_away)')
    .eq('user_id', userId)
    .in('pool_id', poolIds)
    .not('scored_at', 'is', null)

  // 4. Calcular stats por liguilla
  const liguillas: ProfetaStats[] = memberships.map((m: any) => {
    const poolPreds = (predictions ?? []).filter((p: any) => p.pool_id === m.pool_id)
    const aciertos  = poolPreds.filter((p: any) => (p.points_won ?? 0) > 0).length
    const exactos   = poolPreds.filter((p: any) =>
      p.fixture &&
      p.pred_home === p.fixture.real_home &&
      p.pred_away === p.fixture.real_away
    ).length

    return {
      pool_id:     m.pool_id,
      pool_name:   m.pool?.name ?? '—',
      league_name: m.pool?.league?.name ?? '—',
      total_pts:   m.total_pts,
      predictions: poolPreds.length,
      aciertos,
      exactos,
    }
  })

  return { profile, liguillas }
}