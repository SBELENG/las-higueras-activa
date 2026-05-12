importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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
  console.log('[firebase-messaging-sw.js] Recibido mensaje en segundo plano:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
