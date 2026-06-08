'use client'

import { Bell, BellOff } from 'lucide-react'
import { usePushNotifications } from '@/app/hooks/usePushNotifications'

export default function PushNotificationsButton() {
  const {
    permission,
    subscribed,
    message,
    subscribe,
    unsubscribe,
  } = usePushNotifications()

  if (permission === 'denied') {
    return (
      <p className="px-4 text-center text-xs text-gray-500">
        Notificaciones bloqueadas. Actívalas desde la configuración de tu navegador.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
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

      {message && (
        <p className="text-center text-xs text-gray-500">
          {message}
        </p>
      )}
    </div>
  )
}