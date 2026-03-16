import { getActiveLeagues } from '@/app/lib/queries/leagues'
import NuevaLiguillaForm from './NuevaLiguillaForm'

export default async function NuevaLiguillaPage() {
  const leagues = await getActiveLeagues()

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-lg mx-auto pt-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Nueva Liguilla</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configura tu liguilla — podrás editar las reglas antes de abrirla
          </p>
        </div>

        <NuevaLiguillaForm leagues={leagues} />

      </div>
    </div>
  )
}