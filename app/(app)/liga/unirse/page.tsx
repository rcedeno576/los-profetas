import UnirseForm from './UnirseForm'

export default function UnirsePage() {
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-lg mx-auto pt-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Unirse a una Liguilla</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ingresa el código de invitación que te compartieron
          </p>
        </div>

        <UnirseForm />

      </div>
    </div>
  )
}