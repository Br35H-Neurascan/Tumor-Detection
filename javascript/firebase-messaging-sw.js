// Firebase Messaging Service Worker

// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging-compat.js');

// Firebase configuration - MUST MATCH the one in firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyBfrmXp6RcFM4IVmj8XcWqtJu26PcO1yek",
  authDomain: "vertex-ai-436310.firebaseapp.com",
  databaseURL: "https://vertex-ai-436310-default-rtdb.firebaseio.com",
  projectId: "vertex-ai-436310",
  storageBucket: "vertex-ai-436310.firebasestorage.app",
  messagingSenderId: "620803031302",
  appId: "1:620803031302:web:0fd85b835dce2a438dde87",
  measurementId: "G-DGHLCN0FTM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title || 'NeuraScan Notification';
  const notificationOptions = {
    body: payload.notification.body || 'New notification from NeuraScan',
    icon: '/path/to/icon.png', // Replace with the actual path to your app icon
    badge: '/path/to/badge.png', // Replace with the actual path to a badge icon
    tag: payload.data && payload.data.tag ? payload.data.tag : 'default-tag',
    data: payload.data
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked', event);
  
  event.notification.close();
  
  // This looks to see if the current window is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      // Get notification data
      const data = event.notification.data;
      let url = '/';
      
      // Set custom URL if provided in the notification data
      if (data && data.url) {
        url = data.url;
      }
      
      // If a window already exists with this URL, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Optional: Handle service worker update
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  // Skip waiting to ensure the newest version activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  // Claim clients to ensure the service worker takes control immediately
  event.waitUntil(clients.claim());
}); 