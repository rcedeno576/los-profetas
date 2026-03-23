export default function LoadingPartidos() {
  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header skeleton */}
      <div className="border-b border-gray-800 px-4 py-4 sticky top-0 bg-gray-950/95 backdrop-blur z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-800 rounded animate-pulse" />
          <div>
            <div className="w-32 h-4 bg-gray-800 rounded animate-pulse mb-1" />
            <div className="w-48 h-3 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
        {/* Tabs skeleton */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-6">
          <div className="flex-1 h-9 bg-gray-800 rounded-md animate-pulse" />
          <div className="flex-1 h-9 bg-gray-900 rounded-md animate-pulse" />
        </div>

        {/* Stage header skeleton */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-24 h-4 bg-gray-800 rounded animate-pulse" />
          <div className="flex-1 h-px bg-gray-800" />
          <div className="w-6 h-3 bg-gray-800 rounded animate-pulse" />
        </div>

        {/* MatchCard skeletons */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                {/* Equipo local */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
                  <div className="w-20 h-3 bg-gray-800 rounded animate-pulse" />
                </div>
                {/* Centro */}
                <div className="flex flex-col items-center gap-2 w-24">
                  <div className="w-16 h-6 bg-gray-800 rounded animate-pulse" />
                  <div className="w-12 h-4 bg-gray-800 rounded-full animate-pulse" />
                </div>
                {/* Equipo visitante */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
                  <div className="w-20 h-3 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}