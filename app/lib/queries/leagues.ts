import { createClient } from '@/app/lib/supabase/server'
import type { League } from '@/app/lib/types'

// Ligas activas — para el formulario de crear liguilla
export async function getActiveLeagues(): Promise<League[]> {
  const supabase = await createClient()

const { data, error } = await supabase
  .from('leagues')
  .select('id, code, name, active')
  .eq('active', true)
  .order('id')

  if (error || !data) return []
  return data as League[]
}