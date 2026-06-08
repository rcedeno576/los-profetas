self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {}

  const title = data.title || 'Los Profetas'
  const options = {
    body: data.body || 'Tienes una nueva notificación.',
    icon: '/icons/LosProfetas-icon-192.png',
    badge: '/icons/LosProfetas-badge-icon-48.png',
    data: {
      url: data.url || '/',
      type: data.type || 'general',
    },
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.openWindow(url)
  )
})