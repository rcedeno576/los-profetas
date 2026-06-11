"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStageLabel } from "@/app/lib/constants";
import type { FixturesByStage } from "@/app/lib/queries/fixtures";
import type { FixturePredictionSummary } from "@/app/lib/queries/predictions";
import type { Fixture, Prediction } from "@/app/lib/types";
import MatchCard from "./MatchCard";
import PredictionModal from "./PredictionModal";

type Tab = "today" | "upcoming" | "phases";

type Props = {
  groupedStages: FixturesByStage;
  fixtures: Fixture[];
  poolId: string;
  predictions: Record<string, Prediction>;
  allPredictions: Record<string, FixturePredictionSummary[]>;
  currentUserId: string;
};

function isSameLocalDay(kickoffUtc: string): boolean {
  const kickoff = new Date(kickoffUtc);
  const now = new Date();
  return (
    kickoff.getFullYear() === now.getFullYear() &&
    kickoff.getMonth() === now.getMonth() &&
    kickoff.getDate() === now.getDate()
  );
}

export default function FixturesTabs({
  groupedStages,
  fixtures,
  poolId,
  predictions,
  allPredictions,
  currentUserId,
}: Props) {
  const todayFixtures = fixtures.filter((f) => isSameLocalDay(f.kickoff_at));

  const [tab, setTab] = useState<Tab>(
    todayFixtures.length > 0 ? "today" : "upcoming",
  );
  const [selected, setSelected] = useState<Fixture | null>(null);

  const upcoming = fixtures
    .filter((f) => (f.status === "scheduled" || f.status === "live") && !isSameLocalDay(f.kickoff_at))
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
      setSelected(fixture);
    } else {
      router.push(`/liga/${poolId}/partidos/${fixture.id}`);
    }
  }

  function renderMatchCards(list: Fixture[]) {
    return list.map((fixture) => (
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
    ));
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "today", label: "Hoy" },
    { key: "upcoming", label: "Próximos" },
    { key: "phases", label: "Por fase" },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${
              tab === key ? "bg-gray-800 text-white" : "text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Hoy */}
      {tab === "today" && (
        <div className="space-y-2">
          {todayFixtures.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-white font-bold mb-1">No hay partidos hoy</p>
              <p className="text-gray-500 text-sm">
                Revisa la pestaña de próximos partidos
              </p>
            </div>
          ) : (
            renderMatchCards(todayFixtures)
          )}
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
            renderMatchCards(upcoming)
          )}
        </div>
      )}

      {/* Por fase */}
      {tab === "phases" && (
        <div className="space-y-8">
          {groupedStages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-white font-bold mb-1">
                Sin partidos disponibles
              </p>
              <p className="text-gray-500 text-sm">
                Aún no hay fixtures cargados para esta liga
              </p>
            </div>
          ) : (
            groupedStages.map(({ stage, fixtures }) => (
              <section key={stage}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-white font-bold text-sm">
                    {getStageLabel(stage)}
                  </h2>
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-gray-600 text-xs">
                    {fixtures.length}
                  </span>
                </div>
                <div className="space-y-2">{renderMatchCards(fixtures)}</div>
              </section>
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
