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
      /* 
        CAMBIOS EN CONTENEDOR PADRE:
        1. z-[100] para sobrepasar la barra de navegación inferior.
        2. items-end px-4 pb-24 (en móvil flotará despegado de la barra inferior).
        3. sm:items-center sm:p-4 (en pantallas medianas/grandes se centrará perfectamente).
      */
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-24 sm:items-center sm:p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        /* 
          CAMBIOS EN EL MODAL:
          1. rounded-2xl en lugar de rounded-t-2xl (ahora tiene bordes redondeados abajo también ya que flota).
          2. border-b (se agrega el borde inferior que antes faltaba).
          3. En pantallas sm: max-height y comportamiento responsivo limpio.
        */
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm overflow-y-auto overscroll-contain shadow-2xl"
        style={{
          maxHeight: "calc(100dvh - 140px)", // Evita que choque con los extremos del viewport en móviles muy pequeños
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle visual móvil */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:pt-5">
          <div>
            <p className="text-white font-bold">{username}</p>
            <p className="text-gray-500 text-xs">Desglose de puntos</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-lg leading-none p-1.5 bg-gray-800/40 rounded-full sm:bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 space-y-4 pb-5">
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
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
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