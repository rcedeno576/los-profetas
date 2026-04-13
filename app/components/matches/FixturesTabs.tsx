"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStageLabel } from "@/app/lib/constants";
import type { FixturesByStage } from "@/app/lib/queries/fixtures";
import type { FixturePredictionSummary } from "@/app/lib/queries/predictions";
import type { Fixture, Prediction } from "@/app/lib/types";
import MatchCard from "./MatchCard";
import PredictionModal from "./PredictionModal";

type Props = {
  groupedStages: FixturesByStage;
  fixtures: Fixture[];
  poolId: string;
  predictions: Record<string, Prediction>;
  allPredictions: Record<string, FixturePredictionSummary[]>;
  currentUserId: string;
};

export default function FixturesTabs({
  groupedStages,
  fixtures,
  poolId,
  predictions,
  allPredictions,
  currentUserId,
}: Props) {
  const [tab, setTab] = useState<"phases" | "upcoming">("phases");
  const [selected, setSelected] = useState<Fixture | null>(null);

  const upcoming = fixtures
    .filter((f) => f.status === "scheduled" || f.status === "live")
    .sort(
      (a, b) =>
        new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime(),
    );

  const router = useRouter();

  function handleClick(fixture: Fixture) {
    const now = new Date();
    const kickoff = new Date(fixture.kickoff_at);
    const minutesUntilKickoff = (kickoff.getTime() - now.getTime()) / 60000;

    if (fixture.status === "scheduled" && minutesUntilKickoff > 5) {
      // Abierto para predecir → modal
      setSelected(fixture);
    } else {
      // Cerrado, en vivo o finalizado → pantalla de detalle
      router.push(`/liga/${poolId}/partidos/${fixture.id}`);
    }
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-6">
        <button
          onClick={() => setTab("phases")}
          className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${
            tab === "phases" ? "bg-gray-800 text-white" : "text-gray-400"
          }`}
        >
          Por fase
        </button>
        <button
          onClick={() => setTab("upcoming")}
          className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${
            tab === "upcoming" ? "bg-gray-800 text-white" : "text-gray-400"
          }`}
        >
          Próximos
        </button>
      </div>

      {/* Por fase */}
      {tab === "phases" && (
        <div className="space-y-8">
          {groupedStages.map(({ stage, fixtures }) => (
            <section key={stage}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-white font-bold text-sm">
                  {getStageLabel(stage)}
                </h2>
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs">{fixtures.length}</span>
              </div>
              <div className="space-y-2">
                {fixtures.map((fixture) => (
                  <MatchCard
                    key={fixture.id}
                    fixture={fixture}
                    userPred={
                      predictions[fixture.id]
                        ? {
                            home: predictions[fixture.id].pred_home,
                            away: predictions[fixture.id].pred_away,
                            points_won: predictions[fixture.id].points_won,
                          }
                        : undefined
                    }
                    poolPredictions={allPredictions[fixture.id]}
                    currentUserId={currentUserId}
                    poolId={poolId}
                    onClick={() => handleClick(fixture)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Próximos */}
      {tab === "upcoming" && (
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-white font-bold mb-1">Sin próximos partidos</p>
              <p className="text-gray-500 text-sm">
                Todos los partidos han finalizado
              </p>
            </div>
          ) : (
            upcoming.map((fixture) => (
              <MatchCard
                key={fixture.id}
                fixture={fixture}
                userPred={
                  predictions[fixture.id]
                    ? {
                        home: predictions[fixture.id].pred_home,
                        away: predictions[fixture.id].pred_away,
                        points_won: predictions[fixture.id].points_won,
                      }
                    : undefined
                }
                poolPredictions={allPredictions[fixture.id]}
                currentUserId={currentUserId}
                poolId={poolId}
                onClick={() => handleClick(fixture)}
              />
            ))
          )}
        </div>
      )}

      {/* Modal de predicción */}
      {selected && (
        <PredictionModal
          fixture={selected}
          poolId={poolId}
          existing={predictions[selected.id]}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
