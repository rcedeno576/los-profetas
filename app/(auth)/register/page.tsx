'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '../actions'
import AvatarPicker from '@/app/components/ui/AvatarPicker'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Card from '@/app/components/ui/Card'
import Alert from '@/app/components/ui/Alert'

export default function RegisterPage() {
  const [avatarId, setAvatarId] = useState('avatar_1')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('avatar_id', avatarId)

    const result = await register(formData)

    if (result?.error)   setError(result.error)
    if (result?.success) setSuccess(result.success)

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔮</div>
          <h1 className="text-3xl font-bold text-white">Los Profetas</h1>
          <p className="text-gray-400 mt-2">Crea tu cuenta y empieza a predecir</p>
        </div>

        <Card>
          {success ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-xl font-bold text-white mb-2">¡Revisa tu email!</h2>
              <p className="text-gray-400 text-sm">{success}</p>
              <Link
                href="/login"
                className="mt-6 inline-block text-purple-400 hover:text-purple-300 text-sm"
              >
                Ir al login →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              <AvatarPicker selected={avatarId} onChange={setAvatarId} />

              <Input
                name="username"
                label="Nombre de profeta"
                placeholder="Como te verán los demás"
                required
              />

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
                placeholder="Mínimo 8 caracteres"
                required
                showStrength
              />

              {error && <Alert variant="error" message={error} />}

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>

              <p className="text-center text-gray-500 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300">
                  Inicia sesión
                </Link>
              </p>

            </form>
          )}
        </Card>

      </div>
    </div>
  )
}