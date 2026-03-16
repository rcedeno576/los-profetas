import { createClient } from '@/app/lib/supabase/server'
import type { Profile } from '@/app/lib/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()

const { data, error } = await supabase
  .from('profiles')
  .select('id, username, avatar_id, total_pts, created_at')
  .eq('id', userId)
  .single()

  if (error) return null
  return data as Profile
}