'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPool } from '@/app/(app)/actions'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Card from '@/app/components/ui/Card'
import Alert from '@/app/components/ui/Alert'
import type { League } from '@/app/lib/types'

type Props = {
  leagues: League[]
}

export default function NuevaLiguillaForm({ leagues }: Props) {
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await createPool(new FormData(e.currentTarget))

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">

        <Input
          name="name"
          label="Nombre de la liguilla"
          placeholder="Ej: Los Crack de la Oficina"
          required
        />

        {/* Liga */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">
            Liga de fútbol
          </label>
          <select
            name="league_id"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl
                       px-4 py-3 text-white focus:outline-none
                       focus:border-purple-500 transition-colors text-base"
          >
            <option value="">Selecciona una liga...</option>
            {leagues.map(league => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">
            Descripción <span className="text-gray-600">(opcional)</span>
          </label>
          <textarea
            name="description"
            placeholder="Una descripción breve de tu liguilla..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl
                       px-4 py-3 text-white placeholder-gray-500
                       focus:outline-none focus:border-purple-500
                       transition-colors text-base resize-none"
          />
        </div>

        {error && <Alert variant="error" message={error} />}

        <Alert
          variant="info"
          message="Se crearán las reglas por defecto. Podrás editarlas antes de abrir la liguilla."
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Creando...' : 'Crear liguilla'}
          </Button>
        </div>

      </form>
    </Card>
  )
}