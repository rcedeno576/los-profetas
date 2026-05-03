'use client'

import { usePushNotifications } from '@/app/hooks/usePushNotifications'
import { Bell, BellOff } from 'lucide-react'

export default function PushToggle() {
  const { permission, subscribed, subscribe, unsubscribe } = usePushNotifications()

  if (permission === 'denied') return (
    <p className="text-xs text-gray-500 text-center px-4">
      Notificaciones bloqueadas. Actívalas desde la configuración de tu navegador.
    </p>
  )

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition ${
        subscribed
          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          : 'bg-violet-600 text-white hover:bg-violet-500'
      }`}
    >
      {subscribed ? <BellOff size={18} /> : <Bell size={18} />}
      {subscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
    </button>
  )
}