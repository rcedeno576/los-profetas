import { createClient } from '@/app/lib/supabase/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import type { Prediction } from '@/app/lib/types'

export async function getUserPredictions(
  userId: string,
  poolId: string
): Promise<Record<string, Prediction>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('pool_id', poolId)

  if (error) return {}

  // Indexado por fixture_id para acceso O(1)
  return Object.fromEntries(data.map(p => [p.fixture_id, p]))
}

export type FixturePredictionSummary = {
  user_id:    string
  username:   string
  avatar_id:  string
  pred_home:  number
  pred_away:  number
  points_won: number | null
  scored_at:  string | null
}

export async function getFixturePredictions(
  fixtureId: string,
  poolId:    string
): Promise<FixturePredictionSummary[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('predictions')
    .select(`
      user_id, pred_home, pred_away, points_won, scored_at,
      profile:profiles (username, avatar_id)
    `)
    .eq('fixture_id', fixtureId)
    .eq('pool_id', poolId)
    .order('points_won', { ascending: false, nullsFirst: false })

  if (error || !data) return []

  return data.map((p: any) => ({
    user_id:    p.user_id,
    username:   p.profile.username,
    avatar_id:  p.profile.avatar_id,
    pred_home:  p.pred_home,
    pred_away:  p.pred_away,
    points_won: p.points_won,
    scored_at:  p.scored_at,
  }))
}

export async function getPoolPredictions(
  poolId: string
): Promise<Record<string, FixturePredictionSummary[]>> {
  const supabase = createServiceClient()

  // 1. Traer predicciones
  const { data, error } = await supabase
    .from('predictions')
    .select('fixture_id, user_id, pred_home, pred_away, points_won, scored_at')
    .eq('pool_id', poolId)
    .order('points_won', { ascending: false, nullsFirst: false })

  if (error || !data || data.length === 0) return {}

  // 2. Traer perfiles de los usuarios únicos
  const userIds = [...new Set(data.map(p => p.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_id')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  // 3. Combinar
  const map: Record<string, FixturePredictionSummary[]> = {}

  for (const p of data) {
    const profile = profileMap[p.user_id]
    if (!profile) continue
    if (!map[p.fixture_id]) map[p.fixture_id] = []
    map[p.fixture_id].push({
      user_id:    p.user_id,
      username:   profile.username,
      avatar_id:  profile.avatar_id,
      pred_home:  p.pred_home,
      pred_away:  p.pred_away,
      points_won: p.points_won,
      scored_at:  p.scored_at,
    })
  }

  return map
}