// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');

  if (!event.data) {
    console.log('[ServiceWorker] Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, data: notificationData } = data;

    const options = {
      body: body || 'You have a new notification',
      icon: icon || '/medthread-logo-1.jpeg',
      badge: '/medthread-logo-1.jpeg',
      data: notificationData || {},
      vibrate: [200, 100, 200],
      tag: notificationData?.notificationId || 'notification',
      requireInteraction: false,
    };

    event.waitUntil(
      self.registration.showNotification(title || 'MedThread', options)
    );
  } catch (error) {
    console.error('[ServiceWorker] Error parsing push data:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked');
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[ServiceWorker] Notification closed');
});
