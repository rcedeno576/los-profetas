import { createClient } from '@/app/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getFixturesByLeague, groupFixturesByStage } from '@/app/lib/queries/fixtures'
import { getUserPredictions, getPoolPredictions } from '@/app/lib/queries/predictions'
import FixturesTabs from '@/app/components/matches/FixturesTabs'
import { getPoolById } from '@/app/lib/queries/pools'

type Props = { params: Promise<{ id: string }> }

export default async function PoolFixturesPage({ params }: Props) {
  const { id }   = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const pool = await getPoolById(id)
  if (!pool) notFound()

  // Traer fixtures de la liga de esta liguilla
  if (!pool.league) notFound()
  if (!pool.league.external_id) notFound()
  const fixtures = await getFixturesByLeague(pool.league.external_id)
  const groupedStages   = groupFixturesByStage(fixtures)
  const predictions = await getUserPredictions(user.id, id)
  const allPredictions = await getPoolPredictions(id)
  
  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-4 sticky top-0 bg-gray-950/95 backdrop-blur z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href={`/liga/${id}`} className="text-gray-400 hover:text-white transition-colors">
            ←
          </Link>
          <div>
            <h1 className="text-white font-bold text-sm">{pool.name}</h1>
            <p className="text-gray-500 text-xs">{(pool.league as any)?.name} · {fixtures.length} partidos</p>
          </div>
        </div>
      </div>

      {/* Tabs: Próximos / Todos */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
        <FixturesTabs
          groupedStages={groupedStages}
          fixtures={fixtures}
          poolId={id}
          predictions={predictions}
          allPredictions={allPredictions}
          currentUserId={user.id}
        />
      </div>

    </div>
  )
}
