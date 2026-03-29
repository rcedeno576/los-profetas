'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#051126] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold">Sin conexión</h1>
        <p className="mt-3 text-sm text-white/80">
          No pudimos cargar esta sección porque parece que no tienes internet.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-violet-600 px-4 py-3 font-medium hover:bg-violet-500 transition"
          >
            Reintentar
          </button>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-3 font-medium hover:bg-white/5 transition"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}