import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { getProfetaProfile } from '@/app/lib/queries/profeta'
import { getAvatar } from '@/app/lib/constants'
import Link from 'next/link'
import BackButton from '@/app/components/ui/BackButton'

type Props = {
  params: Promise<{ userId: string }>
}

export default async function ProfetaPublicPage({ params }: Props) {
  const { userId } = await params
  const supabase   = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getProfetaProfile(userId)
  if (!data) notFound()

  const { profile, liguillas } = data
  const avatar = getAvatar(profile.avatar_id)
  const isMe   = userId === user.id

  const totalPredictions = liguillas.reduce((a, l) => a + l.predictions, 0)
  const totalAciertos    = liguillas.reduce((a, l) => a + l.aciertos, 0)
  const pctAciertos      = totalPredictions > 0
    ? Math.round((totalAciertos / totalPredictions) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-4 sticky top-0 bg-gray-950/95 backdrop-blur z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <BackButton fallback="/dashboard" />
          <h1 className="text-white font-bold text-sm">
            {isMe ? 'Mi perfil público' : `Perfil de ${profile.username}`}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Perfil */}
        <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <span className="text-5xl">{avatar.emoji}</span>
          <div>
            <p className="text-white font-bold text-lg">{profile.username}</p>
            <p className="text-gray-500 text-sm">{profile.total_pts} pts totales</p>
            <p className="text-gray-600 text-xs mt-1">
              Profeta desde {new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl">{totalPredictions}</p>
            <p className="text-gray-500 text-xs mt-1">Predicciones</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl">{pctAciertos}%</p>
            <p className="text-gray-500 text-xs mt-1">Aciertos</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl">
              {liguillas.reduce((a, l) => a + l.exactos, 0)}
            </p>
            <p className="text-gray-500 text-xs mt-1">Exactos</p>
          </div>
        </div>

        {/* Liguillas */}
        <div>
          <h2 className="text-white font-bold mb-3">🏆 Liguillas</h2>
          {liguillas.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Sin liguillas aún
            </div>
          ) : (
            <div className="space-y-3">
              {liguillas.map(l => (
                <Link
                  key={l.pool_id}
                  href={`/liga/${l.pool_id}/profeta/${userId}`}
                  className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-bold text-sm">{l.pool_name}</p>
                      <p className="text-gray-500 text-xs">{l.league_name}</p>
                    </div>
                    <span className="text-purple-400 font-bold text-sm">{l.total_pts} pts</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-white font-bold text-sm">{l.predictions}</p>
                      <p className="text-gray-600 text-xs">Predicciones</p>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        {l.predictions > 0
                          ? `${Math.round((l.aciertos / l.predictions) * 100)}%`
                          : '—'}
                      </p>
                      <p className="text-gray-600 text-xs">Aciertos</p>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{l.exactos}</p>
                      <p className="text-gray-600 text-xs">Exactos</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs text-right mt-2">Ver predicciones →</p>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}