"use client";

import { useState } from "react";
import Avatar from "@/app/components/ui/Avatar";
import ScoreBreakdownModal from "./ScoreBreakdownModal";
import { getAvatar } from "@/app/lib/constants";
import type { PoolRule } from "@/app/lib/types";

type Prediction = {
  user_id: string;
  username: string;
  avatar_id: string;
  pool_pts: number;
  pred_home: number | null;
  pred_away: number | null;
  points_won: number | null;
};

type Props = {
  prediction: Prediction;
  position: number;
  isCurrentUser: boolean;
  isFinished: boolean;
  realHome: number;
  realAway: number;
  rules: PoolRule[];
};

export default function PredictionRow({
  prediction: p,
  position,
  isCurrentUser,
  isFinished,
  realHome,
  realAway,
  rules,
}: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const avatar = getAvatar(p.avatar_id);
  const hasPred = p.pred_home !== null && p.pred_away !== null;
  const canShowBreakdown = isFinished && hasPred;

  return (
    <>
      <div
        onClick={() => canShowBreakdown && setShowBreakdown(true)}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${
          isCurrentUser
            ? "bg-violet-950/40 border-violet-700/40"
            : "bg-gray-900 border-gray-800"
        } ${canShowBreakdown ? "cursor-pointer hover:border-gray-600 active:scale-[0.99]" : ""}`}
      >
        {/* Posición */}
        <span className="text-gray-500 text-xs w-4 text-center">{position}</span>

        {/* Avatar */}
        <Avatar avatar={avatar} size="lg" />

        {/* Nombre */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {p.username}
            {isCurrentUser && (
              <span className="text-violet-400 text-xs ml-1">(tú)</span>
            )}
          </p>
          {!isFinished && (
            <p className="text-gray-500 text-xs">{p.pool_pts} pts en campeonato</p>
          )}
          {canShowBreakdown && (
            <p className="text-gray-600 text-xs">Ver desglose →</p>
          )}
        </div>

        {/* Predicción o puntos */}
        <div className="text-right shrink-0">
          {hasPred ? (
            <>
              <p className="text-violet-400 text-sm font-bold">
                {p.pred_home} — {p.pred_away}
              </p>
              {isFinished && (
                <p
                  className={`text-xs font-bold ${
                    p.points_won && p.points_won > 0
                      ? "text-emerald-400"
                      : "text-gray-500"
                  }`}
                >
                  {p.points_won !== null ? `+${p.points_won} pts` : "Sin puntuar"}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-xs">Sin predicción</p>
          )}
        </div>
      </div>

      {/* Modal de desglose */}
      {showBreakdown && hasPred && (
        <ScoreBreakdownModal
          username={p.username}
          predHome={p.pred_home!}
          predAway={p.pred_away!}
          realHome={realHome}
          realAway={realAway}
          rules={rules}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </>
  );
}
