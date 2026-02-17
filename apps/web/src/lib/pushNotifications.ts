/**
 * Browser Push Notification Support
 * 
 * This module handles browser push notification subscription and management.
 * Requires VAPID keys to be configured on the backend.
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PushNotifications] Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('[PushNotifications] Service worker registration failed:', error);
    throw error;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  vapidPublicKey: string
): Promise<PushSubscriptionData> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  // Request permission
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  // Register service worker
  const registration = await registerServiceWorker();

  // Wait for service worker to be ready
  await navigator.serviceWorker.ready;

  // Subscribe to push notifications
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Convert subscription to JSON
    const subscriptionJSON = subscription.toJSON();

    if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
      throw new Error('Invalid subscription data');
    }

    const subscriptionData: PushSubscriptionData = {
      endpoint: subscriptionJSON.endpoint,
      keys: {
        p256dh: subscriptionJSON.keys.p256dh || '',
        auth: subscriptionJSON.keys.auth || '',
      },
    };

    console.log('[PushNotifications] Subscribed to push notifications');
    return subscriptionData;
  } catch (error) {
    console.error('[PushNotifications] Failed to subscribe:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (!isPushSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('[PushNotifications] Unsubscribed from push notifications');
    }
  } catch (error) {
    console.error('[PushNotifications] Failed to unsubscribe:', error);
    throw error;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('[PushNotifications] Failed to get subscription:', error);
    return null;
  }
}

/**
 * Send subscription to backend
 */
export async function sendSubscriptionToBackend(
  subscription: PushSubscriptionData,
  token: string
): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/push/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send subscription to backend');
    }

    console.log('[PushNotifications] Subscription sent to backend');
  } catch (error) {
    console.error('[PushNotifications] Failed to send subscription:', error);
    throw error;
  }
}

/**
 * Remove subscription from backend
 */
export async function removeSubscriptionFromBackend(token: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/push/unsubscribe`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove subscription from backend');
    }

    console.log('[PushNotifications] Subscription removed from backend');
  } catch (error) {
    console.error('[PushNotifications] Failed to remove subscription:', error);
    throw error;
  }
}

/**
 * Show a test notification
 */
export async function showTestNotification(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('MedThread Test Notification', {
    body: 'This is a test notification',
    icon: '/medthread-logo-1.jpeg',
    badge: '/medthread-logo-1.jpeg',
    vibrate: [200, 100, 200],
    tag: 'test-notification',
  });
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
