'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '../actions'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Card from '@/app/components/ui/Card'
import Alert from '@/app/components/ui/Alert'

export default function LoginPage() {
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(new FormData(e.currentTarget))

    if (result?.error) setError(result.error)

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔮</div>
          <h1 className="text-3xl font-bold text-white">Los Profetas</h1>
          <p className="text-gray-400 mt-2">Ingresa a tu cuenta</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">

            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              required
            />

            <Input
              name="password"
              label="Contraseña"
              type="password"
              placeholder="Tu contraseña"
              required
            />

            {error && <Alert variant="error" message={error} />}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <p className="text-center text-gray-500 text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300">
                Regístrate
              </Link>
            </p>

          </form>
        </Card>

      </div>
    </div>
  )
}