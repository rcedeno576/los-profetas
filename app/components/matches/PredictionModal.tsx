'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { upsertPrediction } from '@/app/lib/actions/predictions'
import type { Fixture, Prediction } from '@/app/lib/types'

type Props = {
  fixture:    Fixture
  poolId:     string
  existing?:  Prediction
  onClose:    () => void
}

export default function PredictionModal({ fixture, poolId, existing, onClose }: Props) {
  const [home, setHome] = useState(existing?.pred_home ?? 0)
  const [away, setAway] = useState(existing?.pred_away ?? 0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await upsertPrediction(poolId, fixture.id, home, away)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl p-6 mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold">Tu predicción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Equipos */}
        <div className="flex items-center justify-between mb-6 gap-3">

          {/* Local */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {fixture.home_crest && (
              <Image src={fixture.home_crest} alt={fixture.home_name} width={48} height={48} className="object-contain" />
            )}
            <p className="text-white text-xs font-medium text-center leading-tight">{fixture.home_name}</p>
          </div>

          {/* Inputs de goles */}
          <div className="flex items-center gap-3 shrink-0">
            <ScoreInput value={home} onChange={setHome} />
            <span className="text-gray-600 font-bold">:</span>
            <ScoreInput value={away} onChange={setAway} />
          </div>

          {/* Visitante */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {fixture.away_crest && (
              <Image src={fixture.away_crest} alt={fixture.away_name} width={48} height={48} className="object-contain" />
            )}
            <p className="text-white text-xs font-medium text-center leading-tight">{fixture.away_name}</p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs text-center mb-4">{error}</p>
        )}

        {/* Botón */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {isPending ? 'Guardando...' : existing ? 'Actualizar predicción' : 'Guardar predicción'}
        </button>

      </div>
    </div>
  )
}

// Subcomponente: input de goles con +/-
function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold transition-colors"
      >
        +
      </button>
      <span className="text-white text-2xl font-bold tabular-nums w-8 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold transition-colors"
      >
        −
      </button>
    </div>
  )
}