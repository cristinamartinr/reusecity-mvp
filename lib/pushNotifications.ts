function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Este navegador no admite notificaciones push.");
  }

  if (!("Notification" in window)) {
    throw new Error("Las notificaciones no están disponibles.");
  }

  if (Notification.permission !== "granted") {
    throw new Error("Debes permitir las notificaciones antes de suscribirte.");
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  console.log("VAPID pública - longitud:", publicKey?.length);
console.log(
  "VAPID pública - formato:",
  /^[A-Za-z0-9_-]+$/.test(publicKey ?? "")
);

  if (!publicKey) {
    throw new Error("No se ha configurado la clave VAPID pública.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");

  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}