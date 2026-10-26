import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Esta API solo debe funcionar en desarrollo.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Ruta no disponible" },
      { status: 404 }
    );
  }

  // Comprobar autorización.
  const secret = process.env.PUSH_TEST_SECRET;
  const providedSecret = request.headers.get("x-push-test-secret");

  if (!secret || !providedSecret || providedSecret !== secret) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const { subscription } = await request.json();

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Suscripción inválida" },
        { status: 400 }
      );
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
      throw new Error("Configuración VAPID incompleta");
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "¡Primera alerta real de ReUseCity! ♻️",
        body: "¡Notificación enviada desde el servidor! 🔔",
        url: "/",
      })
    );

    return NextResponse.json({
      ok: true,
      message: "Notificación enviada correctamente",
    });
  } catch (error) {
    console.error("Error al enviar Web Push:", error);

    return NextResponse.json(
      { error: "No se ha podido enviar la notificación" },
      { status: 500 }
    );
  }
}