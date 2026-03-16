'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinPool } from '@/app/(app)/actions'
import Button from '@/app/components/ui/Button'
import Card from '@/app/components/ui/Card'
import Alert from '@/app/components/ui/Alert'

export default function UnirseForm() {
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleCodeChange(value: string) {
    // Solo letras y números, máximo 9 chars (XXXX-XXXX)
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length <= 4) {
      setCode(clean)
    } else {
      setCode(clean.slice(0, 4) + '-' + clean.slice(4, 8))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length < 9) return

    setError('')
    setLoading(true)

    const formData = new FormData()
    formData.set('invite_code', code.trim())

    const result = await joinPool(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result?.poolId) {
      router.push(`/liga/${result.poolId}`)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-300">
            Código de invitación
          </label>
          <input
            type="text"
            value={code}
            onChange={e => handleCodeChange(e.target.value)}
            placeholder="XXXX-XXXX"
            maxLength={9}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl
                       px-4 py-3 text-white placeholder-gray-500 text-center
                       text-2xl font-bold tracking-widest
                       focus:outline-none focus:border-purple-500
                       transition-colors"
          />
          <p className="text-gray-600 text-xs text-center">
            El guión se agrega automáticamente
          </p>
        </div>

        {error && <Alert variant="error" message={error} />}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={loading || code.length < 9}
          >
            {loading ? 'Buscando...' : 'Unirse'}
          </Button>
        </div>

      </form>
    </Card>
  )
}