import { supabase } from './supabaseClient';

// PushManager.subscribe espera la VAPID public key como Uint8Array, no
// como el string base64url que se genera/distribuye normalmente.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// Registra el service worker, pide permiso de notificaciones y suscribe al
// conductor a push. Falla en silencio (solo consola) si el navegador no
// soporta push o el usuario niega el permiso — la app sigue funcionando
// con la notificación en tiempo real por Supabase Realtime de todas
// formas, mientras la pestaña esté abierta.
export async function subscribeDriverToPush(driverId) {
  try {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    const json = subscription.toJSON();
    await supabase.from('push_subscriptions').upsert({
      driver_id: driverId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    }, { onConflict: 'endpoint' });
  } catch (err) {
    console.error('No se pudo suscribir a notificaciones push:', err);
  }
}
