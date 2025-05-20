// Wait for document load to ensure Firebase scripts have loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase has loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Check script tags and network connection.');

        // Create an error message for the user
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.backgroundColor = '#f44336';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.zIndex = '9999';
        errorDiv.textContent = 'Error: Firebase failed to load. The application may not work correctly.';
        document.body.prepend(errorDiv);
        return;
    }

    // Firebase configuration - REPLACE WITH YOUR OWN CONFIG
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

    try {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully');
            
            // Initialize Firebase Analytics
            if (firebase.analytics) {
                window.firebaseAnalytics = firebase.analytics();
                console.log('Firebase Analytics initialized');
            }
            
            // Initialize Firebase Messaging (for notifications) if supported
            if (firebase.messaging && 'serviceWorker' in navigator) {
                initializeFirebaseMessaging();
            }
        } else {
            console.log('Firebase already initialized');
        }
    } catch (error) {
        console.error('Error initializing Firebase:', error);

        // Show error to the user
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '0';
        errorDiv.style.left = '0';
        errorDiv.style.width = '100%';
        errorDiv.style.backgroundColor = '#f44336';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.zIndex = '9999';
        errorDiv.textContent = 'Error initializing Firebase. The application may not work correctly.';
        document.body.prepend(errorDiv);
    }

    // Optional: Create global references to Firebase services for easier access
    window.firebaseServices = {
        auth: firebase.auth(),
        db: firebase.firestore(),
        storage: firebase.storage(),
        analytics: firebase.analytics ? firebase.analytics() : null,
        messaging: firebase.messaging ? firebase.messaging() : null
    };
    
    // Track page view with Firebase Analytics
    if (window.firebaseServices.analytics) {
        window.firebaseServices.analytics.logEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
});

// Initialize Firebase Cloud Messaging
function initializeFirebaseMessaging() {
    const messaging = firebase.messaging();
    
    // Register service worker
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            messaging.useServiceWorker(registration);
            console.log('Firebase Messaging service worker registered');
            
            // Request permission for notifications
            requestNotificationPermission();
        })
        .catch((err) => {
            console.error('Service worker registration failed:', err);
        });
}

// Request permission for notifications
function requestNotificationPermission() {
    const messaging = firebase.messaging();
    
    messaging.requestPermission()
        .then(() => {
            console.log('Notification permission granted.');
            
            // Get FCM token
            return messaging.getToken();
        })
        .then((token) => {
            console.log('FCM Token:', token);
            
            // Save the token to the user's document in Firestore
            saveTokenToDatabase(token);
            
            // Handle token refresh
            messaging.onTokenRefresh(() => {
                messaging.getToken().then((refreshedToken) => {
                    console.log('Token refreshed:', refreshedToken);
                    saveTokenToDatabase(refreshedToken);
                }).catch((err) => {
                    console.error('Unable to retrieve refreshed token:', err);
                });
            });
            
            // Handle incoming messages when the app is in the foreground
            messaging.onMessage((payload) => {
                console.log('Message received:', payload);
                showNotification(payload);
            });
        })
        .catch((err) => {
            console.log('Unable to get permission to notify:', err);
        });
}

// Save FCM token to Firestore
function saveTokenToDatabase(token) {
    const user = firebase.auth().currentUser;
    
    if (user) {
        const tokenData = {
            token: token,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        firebase.firestore().collection('users').doc(user.uid)
            .collection('tokens').doc(token)
            .set(tokenData)
            .then(() => {
                console.log('Token saved to database');
            })
            .catch((error) => {
                console.error('Error saving token to database:', error);
            });
    } else {
        // Store token temporarily in local storage until user logs in
        localStorage.setItem('fcm_token', token);
    }
}

// Display a notification in the UI
function showNotification(payload) {
    // Create a notification element
    const notifContainer = document.createElement('div');
    notifContainer.className = 'in-app-notification';
    notifContainer.innerHTML = `
        <div class="notification-header">
            <strong>${payload.notification.title}</strong>
            <span class="notification-close">&times;</span>
        </div>
        <div class="notification-body">
            <p>${payload.notification.body}</p>
        </div>
    `;
    
    // Add close button functionality
    const closeBtn = notifContainer.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(notifContainer);
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notifContainer)) {
            document.body.removeChild(notifContainer);
        }
    }, 5000);
    
    // Add to the page
    document.body.appendChild(notifContainer);
}