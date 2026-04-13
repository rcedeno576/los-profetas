'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getAvatar } from '@/app/lib/constants'
import type { FixturePredictionSummary } from '@/app/lib/queries/predictions'
import Avatar from '../ui/Avatar'

type Props = {
  predictions:   FixturePredictionSummary[]
  currentUserId: string
  poolId:        string
}

export default function FixturePredictions({ predictions, currentUserId, poolId }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (predictions.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-gray-800">
      {/* Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setExpanded(prev => !prev)
        }}
        className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <span>👥 Predicciones del grupo ({predictions.length})</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Lista expandida */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {predictions.map(p => {
            const avatar = getAvatar(p.avatar_id)
            const isMe   = p.user_id === currentUserId

            return (
              <Link
                href={`/liga/${poolId}/profeta/${p.user_id}`}
                onClick={(e) => e.stopPropagation()}
                key={p.user_id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isMe ? 'bg-purple-500/10 hover:bg-purple-500/20' : 'bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                {/* Avatar */}
                <span className="text-base"><Avatar avatar={avatar} size='lg' /></span>

                {/* Nombre */}
                <span className={`text-xs flex-1 truncate ${isMe ? 'text-purple-300' : 'text-gray-300'}`}>
                  {p.username}{isMe && ' (tú)'}
                </span>

                {/* Predicción */}
                <span className="text-xs text-gray-400 tabular-nums">
                  {p.pred_home} — {p.pred_away}
                </span>

                {/* Puntos */}
                {p.scored_at !== null ? (
                  <span className={`text-xs font-bold tabular-nums w-12 text-right ${
                    p.points_won && p.points_won > 0 ? 'text-emerald-400' : 'text-gray-500'
                  }`}>
                    +{p.points_won ?? 0} pts
                  </span>
                ) : (
                  <span className="text-xs text-gray-600 w-12 text-right">—</span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}