'use client'

import Image from 'next/image'
import { formatTimeOnly, formatDate } from '@/app/lib/dates'
import { STATUS_BG, DURATION_LABEL, getGroupLabel } from '@/app/lib/constants'
import type { Fixture } from '@/app/lib/types'
import type { FixturePredictionSummary } from '@/app/lib/queries/predictions'
import FixturePredictions from './FixturePredictions'

type Props = {
  fixture:          Fixture
  userPred?:        { home: number; away: number; points_won?: number | null }
  predLabel?:       string
  poolPredictions?: FixturePredictionSummary[]
  currentUserId?:   string
  poolId?:          string
  onClick?:         () => void
}

export default function MatchCard({ fixture, userPred, predLabel, poolPredictions, currentUserId, poolId, onClick }: Props) {
  const isFinished  = fixture.status === 'finished'
  const isLive      = fixture.status === 'live'
  const isScheduled = fixture.status === 'scheduled'

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-gray-900 border rounded-xl p-4 transition-all
        ${onClick ? 'cursor-pointer hover:border-gray-600 active:scale-[0.99]' : ''}
        ${isLive   ? 'border-emerald-500/50 shadow-emerald-900/30 shadow-lg' : 'border-gray-800'}
      `}
    >
      {/* Grupo (GROUP_A, etc.) si aplica */}
      {fixture.group && (
        <p className="text-xs text-gray-500 mb-2">{getGroupLabel(fixture.group)}</p>
      )}

      {/* Fila principal: local — marcador — visitante */}
      <div className="flex items-center gap-3">

        {/* Equipo local */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <TeamCrest crest={fixture.home_crest} name={fixture.home_name} />
          <span className="text-white text-xs font-medium text-center leading-tight truncate w-full text-center">
            {fixture.home_name}
          </span>
        </div>

        {/* Centro: marcador o tiempo */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-24">
          {isFinished || isLive ? (
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold tabular-nums ${isLive ? 'text-emerald-400' : 'text-white'}`}>
                {fixture.real_home ?? '—'}
              </span>
              <span className="text-gray-600 text-lg">:</span>
              <span className={`text-2xl font-bold tabular-nums ${isLive ? 'text-emerald-400' : 'text-white'}`}>
                {fixture.real_away ?? '—'}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white font-bold text-sm">{formatTimeOnly(fixture.kickoff_at)}</p>
              <p className="text-gray-500 text-xs">{formatDate(fixture.kickoff_at)}</p>
            </div>
          )}

          {/* Badge de status */}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BG[fixture.status]}`}>
            {isLive      ? '● En vivo'  :
             isFinished  ? fixture.duration && fixture.duration !== 'REGULAR'
                           ? DURATION_LABEL[fixture.duration]
                           : 'Final'
                         : ''}
          </span>

          {/* Duración si fue a extra o penales */}
        </div>

        {/* Equipo visitante */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <TeamCrest crest={fixture.away_crest} name={fixture.away_name} />
          <span className="text-white text-xs font-medium text-center leading-tight truncate w-full text-center">
            {fixture.away_name}
          </span>
        </div>

      </div>

      {/* Predicción del usuario si existe */}
      {userPred !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xs">🎯</span>
            <span className="text-gray-500 text-xs">
              {predLabel ?? 'Tu predicción'}:
            </span>
            <span className="text-purple-400 text-xs font-bold">
              {userPred.home} — {userPred.away}
            </span>
          </div>
          {isFinished && userPred.points_won !== undefined && (
            <span className={`text-xs font-bold ${
              userPred.points_won && userPred.points_won > 0
                ? 'text-emerald-400'
                : 'text-gray-500'
            }`}>
              {userPred.points_won !== null
                ? `+${userPred.points_won} pts`
                : 'Sin puntuar'}
            </span>
          )}
        </div>
      )}

      {/* CTA para predecir si está pendiente y no hay predicción */}
      {isScheduled && userPred === undefined && onClick && (
        <div className="mt-3 pt-3 border-t border-gray-800 text-center">
          <span className="text-purple-400 text-xs font-medium">Toca para predecir →</span>
        </div>
      )}

    </div>
  )
}

// ─── Subcomponente: escudo del equipo ──────────────────────────────────────────
function TeamCrest({ crest, name }: { crest: string | null; name: string }) {
  if (crest) {
    return (
      <div className="w-10 h-10 relative">
        <Image
        src={crest}
        alt={name}
        width={40}
        height={40}
        className="w-10 h-10 object-contain"
        onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
        }}
        />
      </div>
    )
  }

  // Fallback: iniciales del equipo
  return (
    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
      <span className="text-gray-400 text-xs font-bold">{name.slice(0, 2).toUpperCase()}</span>
    </div>
  )
}
