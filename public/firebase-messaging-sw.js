importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
// v1.0.2 - Forzando actualización para evitar duplicados


firebase.initializeApp({
  apiKey: "AIzaSyB_Vr9jpvK3VplRRcrS9GYa3rbHpurpGJY",
  authDomain: "app-activa-5adbe.firebaseapp.com",
  projectId: "app-activa-5adbe",
  storageBucket: "app-activa-5adbe.firebasestorage.app",
  messagingSenderId: "219903622114",
  appId: "1:219903622114:web:5a15ba7f2e84ca1ba857bb"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recibido mensaje:', payload);
  
  // Extraemos los datos del objeto 'data' (enviado desde el servidor)
  // o del objeto 'notification' (por compatibilidad)
  const title = payload.data?.title || payload.notification?.title || "Actualización de Reclamo";
  const body = payload.data?.body || payload.notification?.body || "";
  
  const notificationOptions = {
    body: body,
    icon: '/icon-192x192.png', // Usamos el ícono oficial consistente
    badge: '/icon-192x192.png',
    data: {
      url: payload.data?.link || '/mensajes'
    },
    tag: 'reclamo-update', // El 'tag' evita que se amontonen si llegan varias iguales
    renotify: true
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Al hacer clic en la notificación, abrir la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Forzar actualización inmediata
self.addEventListener('install', () => {
  self.skipWaiting();
});

