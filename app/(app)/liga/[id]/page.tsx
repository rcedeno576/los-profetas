import { createClient } from '@/app/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPoolById, getPoolLeaderboard } from '@/app/lib/queries/pools'
import { getAvatar, POOL_STATUS_LABEL, POOL_STATUS_COLOR } from '@/app/lib/constants'
import { formatDate } from '@/app/lib/dates'
import { updatePoolStatus } from '@/app/(app)/actions'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import CopyInviteCode from './CopyInviteCode'
import Link from 'next/link'
import BackButton from '@/app/components/ui/BackButton'

type Props = {
  params: Promise<{ id: string }>
}

export default async function LiguillaPage({ params }: Props) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [pool, leaderboard] = await Promise.all([
    getPoolById(id),
    getPoolLeaderboard(id),
  ])
  if (!pool) notFound()

  const isOwner   = pool.owner_id === user.id
  const rules     = (pool.rules as any[]) ?? []

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <BackButton fallback="/dashboard" />
          {isOwner && pool.status === 'draft' && (
            <form action={async () => {
              'use server'
              await updatePoolStatus(pool.id, 'open')
            }}>
              <Button type="submit" size="sm">
                Abrir inscripciones
              </Button>
            </form>
          )}
          {isOwner && pool.status === 'open' && (
            <form action={async () => {
              'use server'
              await updatePoolStatus(pool.id, 'active')
            }}>
              <Button type="submit" size="sm" variant="secondary">
                Cerrar inscripciones
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Info principal */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-1">
            <h1 className="text-2xl font-bold text-white">{pool.name}</h1>
            <span className={`text-sm font-medium shrink-0 ${POOL_STATUS_COLOR[pool.status]}`}>
              ● {POOL_STATUS_LABEL[pool.status]}
            </span>
          </div>
          {pool.description && (
            <p className="text-gray-400 text-sm">{pool.description}</p>
          )}
          <p className="text-gray-600 text-xs mt-1">
            {(pool.league as any)?.name} · Creada {formatDate(pool.created_at)}
          </p>
        </div>

        {/* Código de invitación — solo si está abierta */}
        {pool.status === 'open' && (
          <CopyInviteCode code={pool.invite_code} />
        )}

        {/* Acceso rápido a partidos */}
        <Link
          href={`/liga/${id}/partidos`}
          className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⚽</span>
            <div>
              <p className="text-white text-sm font-medium">Ver partidos</p>
              <p className="text-gray-500 text-xs">Predicciones y resultados</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">→</span>
        </Link>

        {/* Tabla de posiciones */}
        <Card>
          <h2 className="text-white font-bold mb-4">
            🏆 Tabla de posiciones
          </h2>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Aún no hay miembros
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((member: any, index: number) => {
                const avatar   = getAvatar(member.avatar_id ?? 'avatar_1')
                const isMe     = member.user_id === user.id
                const medals   = ['🥇', '🥈', '🥉']
                const position = medals[index] ?? `${index + 1}.`

                return (
                  <Link
                    key={member.user_id}
                    href={`/profeta/${member.user_id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors
                      ${isMe ? 'bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20' : 'bg-gray-800/50 hover:bg-gray-800'}`}
                  >
                    <span className="text-lg w-8 text-center">{position}</span>
                    <span className="text-xl">{avatar.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {member.username}
                        {isMe && <span className="text-purple-400 text-xs ml-1">(tú)</span>}
                      </p>
                    </div>
                    <p className="text-white font-bold">{member.total_pts} pts</p>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        {/* Reglas de puntuación */}
        <Card>
          <h2 className="text-white font-bold mb-4">📋 Reglas de puntuación</h2>
          {rules.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin reglas configuradas</p>
          ) : (
            <div className="space-y-2">
              {rules
                .sort((a, b) => (a.rule?.order ?? 0) - (b.rule?.order ?? 0))
                .map((pr: any) => (
                  <div key={pr.rule?.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-white text-sm">{pr.rule?.name}</p>
                      <p className="text-gray-500 text-xs">{pr.rule?.description}</p>
                    </div>
                    <span className="text-purple-400 font-bold text-sm shrink-0 ml-4">
                      +{pr.pts} pts
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}