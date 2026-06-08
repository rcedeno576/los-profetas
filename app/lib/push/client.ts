export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export async function requestNotificationPermission() {
  if (!isPushSupported()) {
    throw new Error('Este navegador no soporta notificaciones push.')
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('El permiso de notificaciones no fue concedido.')
  }

  return permission
}

async function getServiceWorkerRegistration() {
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('El service worker no está activo todavía. Recarga la página o prueba con npm run build && npm run start.')),
        5000
      )
    ),
  ])

  return registration
}

export async function getPushSubscription() {
  if (!isPushSupported()) {
    throw new Error('Este navegador no soporta notificaciones push.')
  }

  const registration = await getServiceWorkerRegistration()
  return registration.pushManager.getSubscription()
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export async function createPushSubscription() {
  if (!isPushSupported()) {
    throw new Error('Este navegador no soporta notificaciones push.')
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  if (!vapidPublicKey) {
    throw new Error('Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY.')
  }

  const registration = await getServiceWorkerRegistration()

  const existingSubscription = await registration.pushManager.getSubscription()

  if (existingSubscription) {
    return existingSubscription
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })
}

export async function savePushSubscription(subscription: PushSubscription) {
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error ?? 'No se pudo guardar la suscripción push.')
  }

  return response.json()
}

export async function deletePushSubscription(endpoint: string) {
  const response = await fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error ?? 'No se pudo eliminar la suscripción push.')
  }

  return response.json()
}