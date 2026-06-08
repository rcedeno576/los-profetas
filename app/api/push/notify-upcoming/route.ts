import { NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/supabase/service'
import { sendPushToUser } from '@/app/lib/push/server'
import {
  PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF,
  PUSH_NOTIFICATION_TYPES,
  UPCOMING_FIXTURE_REMINDER_MINUTES_BEFORE_KICKOFF,
  UPCOMING_FIXTURE_REMINDER_WINDOW_MINUTES,
} from '@/app/lib/constants'
import type {
  Fixture,
  Pool,
  PoolMember,
  Prediction,
  PushNotificationLog,
} from '@/app/lib/types'

type FixtureReminderRow = Pick<
  Fixture,
  'id' | 'league_id' | 'home_name' | 'away_name' | 'kickoff_at'
>

type PoolReminderRow = Pick<Pool, 'id'>

type PoolMemberReminderRow = Pick<PoolMember, 'user_id' | 'pool_id'>

type PredictionReminderRow = Pick<Prediction, 'user_id' | 'pool_id'>

type PushNotificationLogReminderRow = Pick<
  PushNotificationLog,
  'user_id' | 'pool_id'
>

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const now = new Date()

  const reminderFrom = new Date(
    now.getTime() +
      UPCOMING_FIXTURE_REMINDER_MINUTES_BEFORE_KICKOFF * 60 * 1000
  )

  const reminderTo = new Date(
    reminderFrom.getTime() +
      UPCOMING_FIXTURE_REMINDER_WINDOW_MINUTES * 60 * 1000
  )

  const { data: fixtures, error: fixturesError } = await supabase
    .from('fixtures')
    .select('id, league_id, home_name, away_name, kickoff_at')
    .eq('status', 'scheduled')
    .gte('kickoff_at', reminderFrom.toISOString())
    .lt('kickoff_at', reminderTo.toISOString())
    .returns<FixtureReminderRow[]>()

  if (fixturesError) {
    return NextResponse.json({ error: fixturesError.message }, { status: 500 })
  }

  if (!fixtures.length) {
    return NextResponse.json({
      ok: true,
      fixtures: 0,
      notified: 0,
    })
  }

  let notified = 0
  let skippedAlreadyPredicted = 0
  let skippedAlreadyNotified = 0
  let skippedPredictionLocked = 0

  for (const fixture of fixtures) {
    const kickoffAt = new Date(fixture.kickoff_at)

    const predictionLockAt = new Date(
      kickoffAt.getTime() -
        PREDICTION_LOCK_MINUTES_BEFORE_KICKOFF * 60 * 1000
    )

    if (now >= predictionLockAt) {
      skippedPredictionLocked++
      continue
    }

    const minutesUntilLock = Math.max(
      0,
      Math.floor((predictionLockAt.getTime() - now.getTime()) / 60_000)
    )

    const { data: pools, error: poolsError } = await supabase
      .from('pools')
      .select('id')
      .eq('league_id', fixture.league_id)
      .eq('status', 'active')
      .returns<PoolReminderRow[]>()

    if (poolsError) {
      return NextResponse.json({ error: poolsError.message }, { status: 500 })
    }

    const poolIds = pools.map((pool) => pool.id)

    if (!poolIds.length) continue

    const { data: members, error: membersError } = await supabase
      .from('pool_members')
      .select('user_id, pool_id')
      .eq('active', true)
      .in('pool_id', poolIds)
      .returns<PoolMemberReminderRow[]>()

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 })
    }

    if (!members.length) continue

    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('user_id, pool_id')
      .eq('fixture_id', fixture.id)
      .in('pool_id', poolIds)
      .returns<PredictionReminderRow[]>()

    if (predictionsError) {
      return NextResponse.json(
        { error: predictionsError.message },
        { status: 500 }
      )
    }

    const predictedKeys = new Set(
      predictions.map(
        (prediction) => `${prediction.user_id}:${prediction.pool_id}`
      )
    )

    const candidates = members.filter((member) => {
      const key = `${member.user_id}:${member.pool_id}`
      return !predictedKeys.has(key)
    })

    skippedAlreadyPredicted += members.length - candidates.length

    if (!candidates.length) continue

    const { data: logs, error: logsError } = await supabase
      .from('push_notification_logs')
      .select('user_id, pool_id')
      .eq('fixture_id', fixture.id)
      .eq('type', PUSH_NOTIFICATION_TYPES.FIXTURE_REMINDER)
      .in('pool_id', poolIds)
      .returns<PushNotificationLogReminderRow[]>()

    if (logsError) {
      return NextResponse.json({ error: logsError.message }, { status: 500 })
    }

    const notifiedKeys = new Set(
      logs.map((log) => `${log.user_id}:${log.pool_id}`)
    )

    const pending = candidates.filter((candidate) => {
      const key = `${candidate.user_id}:${candidate.pool_id}`
      return !notifiedKeys.has(key)
    })

    skippedAlreadyNotified += candidates.length - pending.length

    if (!pending.length) continue

    for (const item of pending) {
      await sendPushToUser({
        userId: item.user_id,
        payload: {
          title: '⏰ ¡Último momento para predecir!',
          body: `${fixture.home_name} vs ${fixture.away_name} empieza pronto. Tienes ${minutesUntilLock} min para pronosticar.`,
          url: `/liga/${item.pool_id}/partidos`,
          type: PUSH_NOTIFICATION_TYPES.FIXTURE_REMINDER,
        },
      })

      const { error: logError } = await supabase
        .from('push_notification_logs')
        .insert({
          user_id: item.user_id,
          pool_id: item.pool_id,
          fixture_id: fixture.id,
          type: PUSH_NOTIFICATION_TYPES.FIXTURE_REMINDER,
        })

      if (!logError) notified++
    }
  }

  return NextResponse.json({
    ok: true,
    fixtures: fixtures.length,
    notified,
    skippedAlreadyPredicted,
    skippedAlreadyNotified,
    skippedPredictionLocked,
  })
}