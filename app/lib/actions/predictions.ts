"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MESSAGES } from "@/app/lib/constants";
import type { ActionResult } from "@/app/lib/types";
import { getPredictionLockDate } from "@/app/lib/dates";

export async function upsertPrediction(
  poolId: string,
  fixtureId: string,
  predHome: number,
  predAway: number,
): Promise<ActionResult> {
  if (
    !Number.isInteger(predHome) ||
    !Number.isInteger(predAway) ||
    predHome < 0 ||
    predAway < 0 ||
    predHome > 25 ||
    predAway > 25
  ) {
    return { error: "Pronóstico inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: MESSAGES.prediction.unauthorized };

  const { data: fixture } = await supabase
    .from("fixtures")
    .select("kickoff_at, status, league_id")
    .eq("id", fixtureId)
    .single();

  if (!fixture) return { error: MESSAGES.prediction.notFound };
  if (fixture.status !== "scheduled")
    return { error: MESSAGES.prediction.notScheduled };

  const predictionLockAt = getPredictionLockDate(fixture.kickoff_at);

  if (Date.now() >= predictionLockAt.getTime()) {
    return { error: MESSAGES.prediction.locked };
  }

  const { data: membership } = await supabase
    .from("pool_members")
    .select("user_id")
    .eq("pool_id", poolId)
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!membership) {
    return { error: "No perteneces a esta liguilla." };
  }

  const { data: pool } = await supabase
    .from("pools")
    .select("league_id")
    .eq("id", poolId)
    .single();

  if (fixture.league_id !== pool?.league_id) {
    return { error: "Partido inválido para esta liguilla." };
  }

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      pool_id: poolId,
      fixture_id: fixtureId,
      pred_home: predHome,
      pred_away: predAway,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,pool_id,fixture_id",
    },
  );

  if (error) return { error: MESSAGES.prediction.error };

  revalidatePath(`/liga/${poolId}/partidos`);
  return { success: MESSAGES.prediction.saved };
}
