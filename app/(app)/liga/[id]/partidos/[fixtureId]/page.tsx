import { createClient } from "@/app/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getPoolById } from "@/app/lib/queries/pools";
import { getFixtureDetail } from "@/app/lib/queries/predictions";
import { STATUS_BG, DURATION_LABEL } from "@/app/lib/constants";
import { formatDate, formatTimeOnly } from "@/app/lib/dates";
import BackButton from "@/app/components/ui/BackButton";
import PredictionRow from "@/app/components/matches/PredictionRow";
import Image from "next/image";
import { createServiceClient } from "@/app/lib/supabase/service";
import type { FixtureStatus } from "@/app/lib/types";
import {
  compareByPtsAndSeniority,
  compareByPtsWonAndPtsAndSeniority,
} from "@/app/lib/sorting";

type Props = { params: Promise<{ id: string; fixtureId: string }> };

export default async function FixtureDetailPage({ params }: Props) {
  const { id: poolId, fixtureId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [pool, fixtureResult] = await Promise.all([
    getPoolById(poolId),
    createServiceClient()
      .from("fixtures")
      .select("*")
      .eq("id", fixtureId)
      .single(),
  ]);

  if (!pool) notFound();
  const fixture = fixtureResult.data;
  if (!fixture) notFound();

  const isFinished = fixture.status === "finished";

  let predictions = await getFixtureDetail(fixtureId, poolId);

  if (isFinished) {
    predictions.sort((a, b) =>
      compareByPtsWonAndPtsAndSeniority(
        {
          points_won: a.points_won ?? -1,
          total_pts: a.pool_pts,
          joined_at: a.joined_at,
        },
        {
          points_won: b.points_won ?? -1,
          total_pts: b.pool_pts,
          joined_at: b.joined_at,
        },
      ),
    );
  } else {
    predictions.sort((a, b) =>
      compareByPtsAndSeniority(
        { total_pts: a.pool_pts, joined_at: a.joined_at },
        { total_pts: b.pool_pts, joined_at: b.joined_at },
      ),
    );
  }

  const rules = (pool as any).rules ?? [];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-4 sticky top-0 bg-gray-950/95 backdrop-blur z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <BackButton fallback={`/liga/${poolId}/partidos`} />
          <div>
            <h1 className="text-white font-bold text-sm">{pool.name}</h1>
            <p className="text-gray-500 text-xs">Detalle del partido</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Partido */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            {/* Local */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {fixture.home_crest && (
                <Image
                  src={fixture.home_crest}
                  alt={fixture.home_name}
                  width={52}
                  height={52}
                  className="object-contain"
                />
              )}
              <p className="text-white text-xs font-medium text-center leading-tight">
                {fixture.home_name}
              </p>
            </div>

            {/* Marcador */}
            <div className="flex flex-col items-center gap-2 shrink-0 w-28">
              {isFinished || fixture.status === "live" ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-3xl font-bold tabular-nums ${
                      fixture.status === "live"
                        ? "text-emerald-400"
                        : "text-white"
                    }`}
                  >
                    {fixture.real_home ?? "—"}
                  </span>
                  <span className="text-gray-600 text-xl">:</span>
                  <span
                    className={`text-3xl font-bold tabular-nums ${
                      fixture.status === "live"
                        ? "text-emerald-400"
                        : "text-white"
                    }`}
                  >
                    {fixture.real_away ?? "—"}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-white font-bold">
                    {formatTimeOnly(fixture.kickoff_at)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatDate(fixture.kickoff_at)}
                  </p>
                </div>
              )}
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  STATUS_BG[fixture.status as FixtureStatus]
                }`}
              >
                {fixture.status === "live"
                  ? "● En vivo"
                  : isFinished
                    ? fixture.duration && fixture.duration !== "REGULAR"
                      ? DURATION_LABEL[fixture.duration]
                      : "Final"
                    : ""}
              </span>
            </div>

            {/* Visitante */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {fixture.away_crest && (
                <Image
                  src={fixture.away_crest}
                  alt={fixture.away_name}
                  width={52}
                  height={52}
                  className="object-contain"
                />
              )}
              <p className="text-white text-xs font-medium text-center leading-tight">
                {fixture.away_name}
              </p>
            </div>
          </div>
        </div>

        {/* Predicciones del grupo */}
        <div>
          <h2 className="text-white font-bold mb-3">
            {isFinished
              ? "🏆 Resultados del grupo"
              : "🔮 Predicciones del grupo"}
          </h2>
          <div className="space-y-2">
            {predictions.map((p, i) => (
              <PredictionRow
                key={p.user_id}
                prediction={p}
                position={i + 1}
                isCurrentUser={p.user_id === user.id}
                isFinished={isFinished}
                realHome={fixture.real_home}
                realAway={fixture.real_away}
                rules={rules}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
