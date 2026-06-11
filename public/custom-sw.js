self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {}

  const title = data.title || 'Los Profetas'
  const options = {
    body: data.body || 'Tienes una nueva notificación.',
    icon: '/icons/LosProfetas-icon-192.png',
    badge: '/icons/LosProfetas-badge-icon-96.png',
    vibrate: [200, 100, 200],
    tag: data.type || 'general', // agrupa notificaciones del mismo tipo
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
    // Focus the app if already open, otherwise open a new window.
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        return clients.openWindow(url)
      })
  )
})