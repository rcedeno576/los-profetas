'use client'

import { useEffect, useState } from 'react'
import {
  createPushSubscription,
  deletePushSubscription,
  getPushSubscription,
  isPushSupported,
  requestNotificationPermission,
  savePushSubscription,
} from '@/app/lib/push/client'

type PushStatus =
  | ''
  | 'unsupported'
  | 'requesting'
  | 'checking'
  | 'saving'
  | 'enabled'
  | 'disabled'
  | 'blocked'
  | 'error'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [status, setStatus] = useState<PushStatus>('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!isPushSupported()) {
        if (!mounted) return
        setStatus('unsupported')
        setMessage('Este navegador no soporta notificaciones push.')
        return
      }

      const currentPermission = Notification.permission
      const subscription = await getPushSubscription().catch(() => null)

      if (!mounted) return

      setPermission(currentPermission)
      setSubscribed(Boolean(subscription))

      if (currentPermission === 'denied') {
        setStatus('blocked')
        setMessage('Notificaciones bloqueadas. Actívalas desde la configuración del navegador.')
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  async function subscribe() {
    try {
      if (!isPushSupported()) {
        setStatus('unsupported')
        setMessage('Este navegador no soporta notificaciones push.')
        return
      }

      setStatus('requesting')
      setMessage('Solicitando permiso...')

      const result = await requestNotificationPermission()
      setPermission(result)

      setStatus('checking')
      setMessage('Revisando service worker...')

      const subscription = await createPushSubscription()

      setStatus('saving')
      setMessage('Guardando suscripción...')

      await savePushSubscription(subscription)

      setSubscribed(true)
      setStatus('enabled')
      setMessage('Notificaciones activadas correctamente.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error activando notificaciones.')
    }
  }

  async function unsubscribe() {
    try {
      const subscription = await getPushSubscription()

      if (!subscription) {
        setSubscribed(false)
        setStatus('disabled')
        setMessage('No hay una suscripción activa.')
        return
      }

      await deletePushSubscription(subscription.endpoint)
      await subscription.unsubscribe()

      setSubscribed(false)
      setStatus('disabled')
      setMessage('Notificaciones desactivadas.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error desactivando notificaciones.')
    }
  }

  return {
    permission,
    subscribed,
    status,
    message,
    subscribe,
    unsubscribe,
  }
}