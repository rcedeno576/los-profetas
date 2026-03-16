import { calculatePoints } from '../app/lib/scoring'

// ─── Unit Tests: motor de puntuación ──────────────────────────────────────────
// Estas pruebas no tocan la BD — solo validan la lógica pura

const RULES_MOCK = [
  { pts: 3, rule: { code: 'winner'     } },
  { pts: 2, rule: { code: 'home_goals' } },
  { pts: 2, rule: { code: 'away_goals' } },
  { pts: 1, rule: { code: 'goal_diff'  } },
  { pts: 2, rule: { code: 'exact'      } },
] as any

type TestCase = {
  label:    string
  pred:     [number, number]
  real:     [number, number]
  expected: { total: number; winner: number; home_goals: number; away_goals: number; goal_diff: number; exact: number }
}

const cases: TestCase[] = [
  {
    label:    'Marcador exacto 2-1',
    pred:     [2, 1],
    real:     [2, 1],
    expected: { total: 10, winner: 3, home_goals: 2, away_goals: 2, goal_diff: 1, exact: 2 },
  },
  {
    label:    'Ganador correcto pero marcador distinto',
    pred:     [3, 1],
    real:     [2, 0],
    expected: { total: 4, winner: 3, home_goals: 0, away_goals: 0, goal_diff: 1, exact: 0 },
  },
  {
    label:    'Empate exacto 1-1',
    pred:     [1, 1],
    real:     [1, 1],
    expected: { total: 10, winner: 3, home_goals: 2, away_goals: 2, goal_diff: 1, exact: 2 },
  },
  {
    label:    'Empate correcto pero distinto marcador',
    pred:     [2, 2],
    real:     [0, 0],
    expected: { total: 4, winner: 3, home_goals: 0, away_goals: 0, goal_diff: 1, exact: 0 },
  },
  {
    label:    'Solo goles local correcto',
    pred:     [2, 0],
    real:     [2, 1],
    expected: { total: 5, winner: 3, home_goals: 2, away_goals: 0, goal_diff: 0, exact: 0 },
  },
  {
    label:    'Todo incorrecto',
    pred:     [0, 3],
    real:     [2, 1],
    expected: { total: 0, winner: 0, home_goals: 0, away_goals: 0, goal_diff: 0, exact: 0 },
  },
  {
    label:    'Ganador incorrecto pero goles visitante correctos',
    pred:     [4, 2],
    real:     [1, 2],
    expected: { total: 2, winner: 0, home_goals: 0, away_goals: 2, goal_diff: 0, exact: 0 },
  },
]

// ─── Runner ───────────────────────────────────────────────────────────────────
let passed = 0
let failed = 0

console.log('\n🧪 Unit Tests — Motor de puntuación\n')

for (const tc of cases) {
  const result = calculatePoints({
    predHome: tc.pred[0],
    predAway: tc.pred[1],
    realHome: tc.real[0],
    realAway: tc.real[1],
    rules:    RULES_MOCK,
  })

  const ok =
    result.total      === tc.expected.total      &&
    result.winner     === tc.expected.winner     &&
    result.home_goals === tc.expected.home_goals &&
    result.away_goals === tc.expected.away_goals &&
    result.goal_diff  === tc.expected.goal_diff  &&
    result.exact      === tc.expected.exact

  if (ok) {
    console.log(`  ✅ ${tc.label}`)
    passed++
  } else {
    console.log(`  ❌ ${tc.label}`)
    console.log(`     Esperado: ${JSON.stringify(tc.expected)}`)
    console.log(`     Obtenido: ${JSON.stringify(result)}`)
    failed++
  }
}

console.log(`\n─────────────────────────────────────`)
console.log(`  ${passed} pasados · ${failed} fallados`)
console.log(`─────────────────────────────────────\n`)

if (failed > 0) process.exit(1)