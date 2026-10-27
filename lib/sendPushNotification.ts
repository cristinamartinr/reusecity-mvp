import "server-only";
import webpush from "web-push";

type PushRecipient = {
  subscription_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPushNotification(
  recipient: PushRecipient,
  itemTitle: string
): Promise<void> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Falta la configuración VAPID del servidor");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

    const subscription = {
      endpoint: recipient.endpoint,
      keys: {
        p256dh: recipient.p256dh,
        auth: recipient.auth,
      },
    };

    const payload = JSON.stringify({
      title: "¡Nuevo objeto cerca de ti! ♻️",
      body: `Se ha publicado un objeto: ${itemTitle}`,
      url: "/",
    });

    try {
    await webpush.sendNotification(subscription, payload);
  } catch (error: unknown) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : null;

    if (statusCode === 404 || statusCode === 410) {
      throw new Error("PUSH_SUBSCRIPTION_EXPIRED");
    }

    if (statusCode === 429 || (statusCode !== null && statusCode >= 500)) {
      throw new Error("PUSH_TEMPORARY_ERROR");
    }

    throw new Error("PUSH_DELIVERY_ERROR");
  }
}