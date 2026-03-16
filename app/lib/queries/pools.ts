import { createClient } from '@/app/lib/supabase/server'
import type { Pool, PoolMember } from '@/app/lib/types'

// Liguillas donde el usuario es miembro activo
export async function getMyPools(userId: string): Promise<{
  pool: Pool
  total_pts: number
  joined_at: string
}[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pool_members')
    .select(`
      total_pts,
      joined_at,
      pool:pools (
        id, name, description, status, invite_code, owner_id,
        league:leagues (id, code, name)
      )
    `)
    .eq('user_id', userId)
    .eq('active', true)

  if (error || !data) return []
  return data as any
}

// Detalle de una liguilla con reglas y miembros
export async function getPoolById(poolId: string): Promise<Pool | null> {
  const supabase = await createClient()

const { data, error } = await supabase
  .from('pools')
  .select(`
    id, name, description, status, invite_code, owner_id, created_at,
    league:leagues (id, code, name, external_id),
    rules:pool_rules (
      pts,
      rule:scoring_rules (id, code, name, description, order)
    ),
    members:pool_members (
      total_pts, active, joined_at,
      profile:profiles (id, username, avatar_id)
    )
  `)
  .eq('id', poolId)
  .single()

  if (error || !data) return null
  return data as any
}

// Verificar si un usuario es miembro activo de una pool
export async function isPoolMember(
  poolId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('pool_members')
    .select('user_id')
    .eq('pool_id', poolId)
    .eq('user_id', userId)
    .eq('active', true)
    .single()

  return !!data
}

// Leaderboard de una pool ordenado por puntos
export async function getPoolLeaderboard(poolId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_pool_leaderboard', { p_pool_id: poolId })

  if (error || !data) return []
  return data
}