self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title ?? 'Los Profetas'
  const body  = data.body  ?? ''

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})