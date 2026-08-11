// Service worker de Turapp Conductor — solo maneja notificaciones push.
// El caché offline no es necesario para esta app (siempre requiere
// conexión en vivo para recibir/aceptar viajes), así que este SW se
// mantiene deliberadamente simple.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Turapp', body: 'Tienes una notificación nueva.', url: '/driver' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    // payload no era JSON, usamos los valores por defecto
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'turapp-trip',
      data: { url: data.url || '/driver' },
      vibrate: [200, 100, 200],
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/driver';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
