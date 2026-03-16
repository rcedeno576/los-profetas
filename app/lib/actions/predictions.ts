'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MESSAGES, PREDICTION_LOCK_MINUTES } from '@/app/lib/constants'
import type { ActionResult } from '@/app/lib/types'

export async function upsertPrediction(
  poolId:    string,
  fixtureId: string,
  predHome:  number,
  predAway:  number
): Promise<ActionResult> {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: MESSAGES.prediction.unauthorized }

  const { data: fixture } = await supabase
    .from('fixtures')
    .select('kickoff_at, status')
    .eq('id', fixtureId)
    .single()

  if (!fixture)                      return { error: MESSAGES.prediction.notFound }
  if (fixture.status !== 'scheduled') return { error: MESSAGES.prediction.notScheduled }

  const minutesUntilKickoff = (new Date(fixture.kickoff_at).getTime() - Date.now()) / 60000
  if (minutesUntilKickoff < PREDICTION_LOCK_MINUTES) return { error: MESSAGES.prediction.locked }

  const { error } = await supabase
    .from('predictions')
    .upsert({
      user_id:    user.id,
      pool_id:    poolId,
      fixture_id: fixtureId,
      pred_home:  predHome,
      pred_away:  predAway,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,pool_id,fixture_id'
    })

  if (error) return { error: MESSAGES.prediction.error }

  revalidatePath(`/liga/${poolId}/partidos`)
  return { success: MESSAGES.prediction.saved }
}