export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-spin" style={{ animationDuration: '1.5s' }}>
          ⚽
        </div>
        <div className="space-y-1">
          <p className="text-white font-bold text-sm">Consultando a los astros...</p>
          <p className="text-gray-600 text-xs">Preparando los partidos</p>
        </div>
      </div>
    </div>
  )
}