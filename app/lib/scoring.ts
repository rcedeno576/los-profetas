import type { PoolRule } from '@/app/lib/types'

type ScoreInput = {
  predHome:  number
  predAway:  number
  realHome:  number
  realAway:  number
  rules:     PoolRule[]
}

type ScoreBreakdown = {
  total:      number
  winner:     number
  home_goals: number
  away_goals: number
  goal_diff:  number
  exact:      number
}

// Obtener puntos configurados para una regla en esta liguilla
function getRulePts(rules: PoolRule[], code: string): number {
  return rules.find(r => r.rule?.code === code)?.pts ?? 0
}

// Calcular ganador de un resultado
function getWinner(home: number, away: number): 'home' | 'away' | 'draw' {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

// Motor principal de puntuación
export function calculatePoints(input: ScoreInput): ScoreBreakdown {
  const { predHome, predAway, realHome, realAway, rules } = input

  let winner     = 0
  let home_goals = 0
  let away_goals = 0
  let goal_diff  = 0
  let exact      = 0

  // 1. Ganador correcto
  if (getWinner(predHome, predAway) === getWinner(realHome, realAway)) {
    winner = getRulePts(rules, 'winner')
  }

  // 2. Goles local exacto
  if (predHome === realHome) {
    home_goals = getRulePts(rules, 'home_goals')
  }

  // 3. Goles visitante exacto
  if (predAway === realAway) {
    away_goals = getRulePts(rules, 'away_goals')
  }

  // 4. Diferencia de goles exacta
  if ((predHome - predAway) === (realHome - realAway)) {
    goal_diff = getRulePts(rules, 'goal_diff')
  }

  // 5. Bonus marcador exacto (ambos goles correctos)
  if (predHome === realHome && predAway === realAway) {
    exact = getRulePts(rules, 'exact')
  }

  const total = winner + home_goals + away_goals + goal_diff + exact

  return { total, winner, home_goals, away_goals, goal_diff, exact }
}