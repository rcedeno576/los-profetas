import { createClient } from '@/app/lib/supabase/server'
import { STAGE_ORDER } from '@/app/lib/constants'
import type { Fixture } from '@/app/lib/types'

// Todos los fixtures de una liga, ordenados por fecha
export async function getFixturesByLeague(leagueId: number): Promise<Fixture[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('fixtures')
    .select('*')
    .eq('league_id', leagueId)
    .order('kickoff_at', { ascending: true })

  if (error) {
    console.error('[getFixturesByLeague]', error.message)
    return []
  }

  return data as Fixture[]
}

// Fixtures agrupados por stage, ordenados por STAGE_ORDER
export type FixturesByStage = {
  stage:    string
  fixtures: Fixture[]
}[]

export function groupFixturesByStage(fixtures: Fixture[]): FixturesByStage {
  const map = new Map<string, Fixture[]>()

  for (const f of fixtures) {
    const key = f.stage ?? 'OTHER'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(f)
  }

  return Array.from(map.entries())
    .map(([stage, fixtures]) => ({
      stage,
      fixtures: fixtures.sort((a, b) =>
        new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime()
      )
    }))
    .sort((a, b) => {
      const orderA = STAGE_ORDER[a.stage] ?? 99
      const orderB = STAGE_ORDER[b.stage] ?? 99
      return orderB - orderA
    })
}

// Solo los próximos fixtures (scheduled + live) de una liga
export async function getUpcomingFixtures(leagueId: number): Promise<Fixture[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('fixtures')
    .select('*')
    .eq('league_id', leagueId)
    .in('status', ['scheduled', 'live'])
    .order('kickoff_at', { ascending: true })
    .limit(20)

  if (error) {
    console.error('[getUpcomingFixtures]', error.message)
    return []
  }

  return data as Fixture[]
}