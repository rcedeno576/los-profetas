"use client";

import type { PoolRule } from "@/app/lib/types";
import { calculatePoints } from "@/app/lib/scoring";

type Props = {
  username: string;
  predHome: number;
  predAway: number;
  realHome: number;
  realAway: number;
  rules: PoolRule[];
  onClose: () => void;
};

type BreakdownRow = {
  label: string;
  earned: boolean;
  pts: number;
};

export default function ScoreBreakdownModal({
  username,
  predHome,
  predAway,
  realHome,
  realAway,
  rules,
  onClose,
}: Props) {
  const breakdown = calculatePoints({
    predHome,
    predAway,
    realHome,
    realAway,
    rules,
  });

  const rows: BreakdownRow[] = [
    {
      label: "Ganador correcto",
      earned: breakdown.winner > 0,
      pts: breakdown.winner,
    },
    {
      label: "Goles local exacto",
      earned: breakdown.home_goals > 0,
      pts: breakdown.home_goals,
    },
    {
      label: "Goles visitante exacto",
      earned: breakdown.away_goals > 0,
      pts: breakdown.away_goals,
    },
    {
      label: "Diferencia de goles",
      earned: breakdown.goal_diff > 0,
      pts: breakdown.goal_diff,
    },
    ...(breakdown.exact > 0
      ? [{ label: "Marcador exacto", earned: true, pts: breakdown.exact }]
      : []),
  ];

  return (
    <div
      /* CAMBIO: Se usa fixed top-0 left-0 w-full h-[100dvh] para forzar el viewport dinámico real en móvil */
      className="fixed top-0 left-0 w-full h-dvh z-100 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        /* CAMBIO: Eliminado paddingBottom inline molesto. Agregada la clase pb-[calc(1.5rem+env(safe-area-inset-bottom))] vía Tailwind o mantenido un max-height seguro */
        className="bg-gray-900 border border-gray-800 border-b-0 rounded-t-2xl w-full max-w-sm overflow-y-auto overscroll-contain"
        style={{
          maxHeight: "85dvh", /* Aumentado un poco para que respire, ya que el viewport ahora está bien calculado */
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle visual */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-white font-bold">{username}</p>
            <p className="text-gray-500 text-xs">Desglose de puntos {breakdown.total} - 13</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-lg leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 space-y-4 pb-4"> {/* CAMBIO: Subido un poco el padding inferior interno aquí */}
          {/* Predicción vs real */}
          <div className="flex items-center justify-center gap-6 bg-gray-800/60 rounded-xl py-3">
            <div className="text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">
                Predicción
              </p>
              <p className="text-violet-400 text-xl font-bold tabular-nums">
                {predHome} — {predAway}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">
                Real
              </p>
              <p className="text-white text-xl font-bold tabular-nums">
                {realHome} — {realAway}
              </p>
            </div>
          </div>

          {/* Criterios */}
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${
                  row.earned
                    ? "bg-emerald-950/40 border border-emerald-800/40"
                    : "bg-gray-800/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{row.earned ? "✅" : "❌"}</span>
                  <span className={`text-sm ${row.earned ? "text-white" : "text-gray-500"}`}>
                    {row.label}
                  </span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${row.earned ? "text-emerald-400" : "text-gray-600"}`}>
                  {row.earned ? `+${row.pts}` : "+0"}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-gray-800 pt-3">
            <span className="text-white font-bold">Total</span>
            <span className={`text-lg font-bold ${breakdown.total > 0 ? "text-emerald-400" : "text-gray-500"}`}>
              +{breakdown.total} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}