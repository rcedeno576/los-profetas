import { STATUS_MAP } from './constants'
import type { ApiMatch, ApiResponse, FixtureInsert } from './types'

const BASE_URL = 'https://api.football-data.org/v4'
const API_KEY  = process.env.FOOTBALL_DATA_API_KEY!

if (!API_KEY) {
  throw new Error('FOOTBALL_DATA_API_KEY no está definida en las variables de entorno.')
}

// ─── Cliente base ──────────────────────────────────────────────────────────────
async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`football-data.org error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ─── Mapper: ApiMatch → FixtureInsert ─────────────────────────────────────────
// Retorna FixtureInsert (sin id — Supabase genera el UUID)
// El upsert usa external_id para detectar duplicados
export function mapMatch(match: ApiMatch, leagueId: number): FixtureInsert {
  return {
    external_id: String(match.id),   // ID de football-data.org
    league_id:   leagueId,

    home_team:  match.homeTeam.tla ?? match.homeTeam.shortName ?? match.homeTeam.name,
    away_team:  match.awayTeam.tla ?? match.awayTeam.shortName ?? match.awayTeam.name,
    home_name:  match.homeTeam.name,
    away_name:  match.awayTeam.name,
    home_crest: match.homeTeam.crest ?? null,
    away_crest: match.awayTeam.crest ?? null,

    kickoff_at: match.utcDate,
    status:     STATUS_MAP[match.status] ?? 'scheduled',

    stage:    match.stage,
    group:    match.group    ?? null,
    matchday: match.matchday ?? null,

    // Siempre fullTime = tiempo reglamentario (90 min).
    // Si hubo tiempo extra o penales, fullTime sigue siendo el resultado
    // al min 90. `duration` es solo informativo para mostrar en la UI.
    real_home: match.score.fullTime.home ?? null,
    real_away: match.score.fullTime.away ?? null,
    duration:  match.score.duration      ?? null,
  }
}

// ─── Fetch todos los fixtures de una competición ───────────────────────────────
export async function fetchFixtures(
  leagueCode: string,
  leagueId:   number
): Promise<FixtureInsert[]> {
  const data = await fetchApi<ApiResponse>(
    `/competitions/${leagueCode}/matches`
  )

  return data.matches
    .filter(m => m.homeTeam?.id && m.awayTeam?.id)
    .map(m => mapMatch(m, leagueId))
}

// ─── Fetch por jornada ─────────────────────────────────────────────────────────
export async function fetchFixturesByMatchday(
  leagueCode: string,
  leagueId:   number,
  matchday:   number
): Promise<FixtureInsert[]> {
  const data = await fetchApi<ApiResponse>(
    `/competitions/${leagueCode}/matches?matchday=${matchday}`
  )

  return data.matches
    .filter(m => m.homeTeam?.id && m.awayTeam?.id)
    .map(m => mapMatch(m, leagueId))
}

// ─── Fetch por fase ────────────────────────────────────────────────────────────
export async function fetchFixturesByStage(
  leagueCode: string,
  leagueId:   number,
  stage:      string
): Promise<FixtureInsert[]> {
  const data = await fetchApi<ApiResponse>(
    `/competitions/${leagueCode}/matches?stage=${stage}`
  )

  return data.matches
    .filter(m => m.homeTeam?.id && m.awayTeam?.id)
    .map(m => mapMatch(m, leagueId))
}

// ─── Fetch partidos en vivo ────────────────────────────────────────────────────
export async function fetchLiveFixtures(
  leagueCode: string,
  leagueId:   number
): Promise<FixtureInsert[]> {
  const data = await fetchApi<ApiResponse>(
    `/competitions/${leagueCode}/matches?status=IN_PLAY,PAUSED,EXTRA_TIME,PENALTY_SHOOTOUT`
  )

  return data.matches
    .filter(m => m.homeTeam?.id && m.awayTeam?.id)
    .map(m => mapMatch(m, leagueId))
}