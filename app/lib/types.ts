// ─── Usuario ───────────────────────────────────────────────────────────────────
export type Profile = {
  id:         string
  username:   string
  avatar_id:  string
  total_pts:  number
  created_at: string
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
export type Avatar = {
  id:     string
  emoji:  string
  label:  string
  image?: string  // ruta a /public/avatars/
}

// ─── Liga de fútbol ────────────────────────────────────────────────────────────
export type League = {
  id:     number
  code:   string   // 'PL', 'CL', 'WC' — exacto de football-data.org
  name:   string
  active: boolean
  external_id?: number
}

// ─── Regla de puntuación global ────────────────────────────────────────────────
export type ScoringRule = {
  id:          number
  code:        string
  name:        string
  description: string | null
  active:      boolean
  order:       number
}

// ─── Regla por liguilla ────────────────────────────────────────────────────────
export type PoolRule = {
  pool_id: string
  rule_id: number
  pts:     number
  rule?:   ScoringRule
}

// ─── Estado de liguilla ────────────────────────────────────────────────────────
export type PoolStatus = 'draft' | 'open' | 'active' | 'finished'

// ─── Liguilla ──────────────────────────────────────────────────────────────────
export type Pool = {
  id:          string
  name:        string
  description: string | null
  invite_code: string
  owner_id:    string
  league_id:   number
  status:      PoolStatus
  created_at:  string
  league?:     League
  rules?:      PoolRule[]
  members?:    PoolMember[]
}

// ─── Miembro de liguilla ───────────────────────────────────────────────────────
export type PoolMember = {
  pool_id:   string
  user_id:   string
  total_pts: number
  active:    boolean
  joined_at: string
  left_at:   string | null
  profile?:  Profile
  pool?:     Pool
}

// ─── Partido ───────────────────────────────────────────────────────────────────
export type FixtureStatus = 'scheduled' | 'live' | 'finished' | 'suspended' | 'cancelled'

export type MatchStage =
  | 'LEAGUE_STAGE' | 'GROUP_STAGE' | 'PRELIMINARY_ROUND'
  | 'QUALIFICATION' | 'QUALIFICATION_ROUND_1' | 'QUALIFICATION_ROUND_2' | 'QUALIFICATION_ROUND_3'
  | 'PLAYOFFS' | 'PLAYOFF_ROUND_1' | 'PLAYOFF_ROUND_2'
  | 'LAST_64' | 'LAST_32' | 'LAST_16'
  | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'THIRD_PLACE' | 'FINAL'
  | 'REGULAR_SEASON' | 'CLAUSURA' | 'APERTURA'
  | 'CHAMPIONSHIP' | 'RELEGATION' | 'RELEGATION_ROUND'
  | 'ROUND_1' | 'ROUND_2' | 'ROUND_3' | 'ROUND_4'
  | string

export type MatchDuration = 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT'

// Lo que guardamos en BD
export type Fixture = {
  id:          string          // UUID interno — PK de nuestra app
  external_id: string          // ID de football-data.org
  league_id:   number
  home_team:   string          // TLA  (ej: 'ARS')
  away_team:   string
  home_name:   string          // Nombre completo
  away_name:   string
  home_crest:  string | null
  away_crest:  string | null
  kickoff_at:  string
  status:      FixtureStatus
  stage:       MatchStage
  group:       string | null
  matchday:    number | null
  // Siempre tiempo reglamentario (90 min) — duration es solo informativo
  real_home:   number | null
  real_away:   number | null
  duration:    MatchDuration | null
  fetched_at:  string
}

// Para insertar — sin id (Supabase lo genera) ni fetched_at (tiene default)
export type FixtureInsert = Omit<Fixture, 'id' | 'fetched_at'>

// ─── Respuesta de football-data.org ────────────────────────────────────────────
export type ApiTeam = {
  id:        number
  name:      string
  shortName: string
  tla:       string
  crest:     string
}

export type ApiScore = {
  winner:   'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  duration: MatchDuration
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
}

export type ApiMatch = {
  id:          number
  utcDate:     string
  status:      string
  matchday:    number | null
  stage:       string
  group:       string | null
  homeTeam:    ApiTeam
  awayTeam:    ApiTeam
  score:       ApiScore
  lastUpdated: string
}

export type ApiResponse = {
  competition: { id: number; name: string; code: string }
  season:      { id: number; startDate: string; endDate: string; currentMatchday: number | null }
  matches:     ApiMatch[]
}

// ─── Predicción ────────────────────────────────────────────────────────────────
export type Prediction = {
  id:         string
  user_id:    string
  pool_id:    string
  fixture_id: string   // FK → fixtures.id (nuestro UUID)
  pred_home:  number
  pred_away:  number
  points_won: number | null
  scored_at:  string | null
  created_at: string
  updated_at: string
  fixture?:   Fixture
  profile?:   Profile
}

// ─── Respuestas de actions ─────────────────────────────────────────────────────
export type ActionResult = {
  error?:   string
  success?: string
  data?:    Record<string, unknown>
}
