'use client'

import { useState, useTransition } from 'react'
import { AVATARS } from '@/app/lib/constants'
import { updateProfile } from '@/app/lib/actions/profile'
import Avatar from '@/app/components/ui/Avatar'

type Props = {
  currentUsername: string
  currentAvatarId: string
}

export default function EditProfileForm({ currentUsername, currentAvatarId }: Props) {
  const [username,  setUsername]  = useState(currentUsername)
  const [avatarId,  setAvatarId]  = useState(currentAvatarId)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await updateProfile(username, avatarId)
      if (result.error) setError(result.error)
      if (result.success) setSuccess(result.success)
    })
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-5">
      <h2 className="text-white font-bold">Editar perfil</h2>

      {/* Username */}
      <div>
        <label className="text-gray-400 text-xs mb-1 block">Nombre de profeta</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="Tu nombre"
          maxLength={30}
        />
      </div>

      {/* Selector de avatar */}
      <div>
        <label className="text-gray-400 text-xs mb-2 block">Elige tu avatar</label>
        <div className="grid grid-cols-4 gap-2">
          {AVATARS.map(avatar => (
            <button
              key={avatar.id}
              onClick={() => setAvatarId(avatar.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                avatarId === avatar.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl"><Avatar avatar={avatar} size="xl" /></span>
              <span className="text-gray-400 text-xs">{avatar.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error / Success */}
      {error   && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-emerald-400 text-xs">{success}</p>}

      {/* Botón */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}