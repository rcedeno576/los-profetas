import { createClient } from '@/app/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getPoolById } from '@/app/lib/queries/pools'
import { getFixturesByLeague } from '@/app/lib/queries/fixtures'
import { getAvatar } from '@/app/lib/constants'
import { createServiceClient } from '@/app/lib/supabase/service'
import Link from 'next/link'
import MatchCard from '@/app/components/matches/MatchCard'

type Props = {
  params: Promise<{ id: string; userId: string }>
}

export default async function MemberPage({ params }: Props) {
  const { id, userId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const pool = await getPoolById(id)
  if (!pool) notFound()

  // Traer perfil del miembro
  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('id, username, avatar_id, total_pts')
    .eq('id', userId)
    .single()

  if (!profile) notFound()

  // Traer fixtures y predicciones del miembro
  const fixtures = await getFixturesByLeague(pool.league.external_id)
  const { data: predRows } = await serviceClient
    .from('predictions')
    .select('fixture_id, pred_home, pred_away, points_won, scored_at')
    .eq('user_id', userId)
    .eq('pool_id', id)

  const predMap = Object.fromEntries(
    (predRows ?? []).map(p => [p.fixture_id, p])
  )

  const avatar  = getAvatar(profile.avatar_id)
  const isMe    = userId === user.id

  // Solo mostrar fixtures donde el miembro tiene predicción
  const fixturesWithPred = isMe
    ? fixtures.filter(f => predMap[f.id])  // yo puedo ver todas mis predicciones
    : fixtures.filter(f => predMap[f.id] && f.status === 'finished')

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-4 sticky top-0 bg-gray-950/95 backdrop-blur z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href={`/liga/${id}/partidos`} className="text-gray-400 hover:text-white transition-colors">
            ←
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">{avatar.emoji}</span>
            <div>
              <h1 className="text-white font-bold text-sm">
                {profile.username}{isMe && ' (tú)'}
              </h1>
              <p className="text-gray-500 text-xs">
                {(pool.league as any)?.name} · {fixturesWithPred.length} predicciones
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-8 space-y-3">
        {fixturesWithPred.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-white font-bold mb-1">Sin predicciones aún</p>
            <p className="text-gray-500 text-sm">Este miembro no ha predicho ningún partido</p>
          </div>
        ) : (
          fixturesWithPred.map(fixture => (
            <MatchCard
              key={fixture.id}
              fixture={fixture}
              userPred={predMap[fixture.id] ? {
                home:       predMap[fixture.id].pred_home,
                away:       predMap[fixture.id].pred_away,
                points_won: predMap[fixture.id].points_won,
              } : undefined}
              predLabel={isMe ? 'Tu predicción' : `Predicción de ${profile.username}`}
            />
          ))
        )}
      </div>

    </div>
  )
}