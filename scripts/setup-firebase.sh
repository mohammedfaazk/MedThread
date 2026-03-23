#!/bin/bash

echo "🔥 Firebase Setup Script"
echo "========================"
echo ""

echo "This script will help you set up Firebase for push notifications."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Creating from .env.example..."
  cp .env.example .env
fi

echo "📝 Please provide your Firebase configuration:"
echo ""

read -p "Firebase API Key: " FIREBASE_API_KEY
read -p "Firebase Auth Domain: " FIREBASE_AUTH_DOMAIN
read -p "Firebase Project ID: " FIREBASE_PROJECT_ID
read -p "Firebase Storage Bucket: " FIREBASE_STORAGE_BUCKET
read -p "Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
read -p "Firebase App ID: " FIREBASE_APP_ID
read -p "Firebase VAPID Key: " FIREBASE_VAPID_KEY

echo ""
echo "📝 Please provide your Firebase Admin SDK credentials:"
echo ""

read -p "Firebase Client Email: " FIREBASE_CLIENT_EMAIL
read -p "Firebase Private Key (paste entire key): " FIREBASE_PRIVATE_KEY

# Update .env file
echo "" >> .env
echo "# Firebase Configuration" >> .env
echo "NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY" >> .env
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN" >> .env
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" >> .env
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET" >> .env
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID" >> .env
echo "NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID" >> .env
echo "NEXT_PUBLIC_FIREBASE_VAPID_KEY=$FIREBASE_VAPID_KEY" >> .env
echo "" >> .env
echo "# Firebase Admin SDK" >> .env
echo "FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" >> .env
echo "FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL" >> .env
echo "FIREBASE_PRIVATE_KEY=\"$FIREBASE_PRIVATE_KEY\"" >> .env

echo ""
echo "✅ Firebase configuration added to .env file"
echo ""

# Create firebase-messaging-sw.js
echo "📝 Creating firebase-messaging-sw.js..."

cat > apps/web/public/firebase-messaging-sw.js << 'EOF'
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
EOF

echo "✅ Created firebase-messaging-sw.js"
echo ""

echo "🎉 Firebase setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure you have enabled Cloud Messaging in Firebase Console"
echo "2. Add your domain to Firebase authorized domains"
echo "3. Test notifications by running: npm run dev"
echo "4. Request notification permission in your app"
echo ""
echo "📚 Documentation: https://firebase.google.com/docs/cloud-messaging"
