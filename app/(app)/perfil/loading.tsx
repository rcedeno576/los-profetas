import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingPerfil() {
  return (
    <div className="min-h-screen bg-gray-950">
      
      {/* 1. Header Skeleton */}
      <div className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" /> {/* Botón atrás */}
          <Skeleton className="w-24 h-5" />             {/* Título */}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* 2. Card de Usuario (Avatar + Stats) */}
        <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <Skeleton className="w-24 h-24 rounded-full shrink-0" /> {/* Avatar Hero */}
          <div className="flex-1 space-y-3">
            <Skeleton className="w-3/4 h-6" /> {/* Nombre */}
            <Skeleton className="w-1/2 h-4" /> {/* Puntos */}
            <Skeleton className="w-2/3 h-3" /> {/* Fecha registro */}
          </div>
        </div>

        {/* 3. Card de Formulario */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-5">
          <Skeleton className="w-32 h-5" /> {/* Título "Editar" */}

          {/* Input placeholder */}
          <div className="space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>

          {/* Grid de Avatares (8 miniaturas) */}
          <div className="space-y-3">
            <Skeleton className="w-28 h-3" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 border border-gray-800 bg-gray-800/50 rounded-xl">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="w-8 h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Botón Guardar */}
          <Skeleton className="w-full h-12 rounded-xl mt-4" />
        </div>

        {/* 4. Botones inferiores */}
        <Skeleton className="w-full h-14 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />

      </div>
    </div>
  )
}