'use client'

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#051126] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur">
        <div className="text-5xl mb-4">📡</div>
        <h1 className="text-2xl font-bold">Sin conexión</h1>
        <p className="mt-3 text-sm text-white/80">
          Los Profetas necesita internet para funcionar. Revisa tu conexión e intenta de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 font-medium hover:bg-violet-500 transition"
        >
          Reintentar
        </button>
      </div>
    </main>
  )
}