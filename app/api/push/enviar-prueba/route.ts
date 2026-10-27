import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPushNotification } from "@/lib/sendPushNotification";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Esta ruta solo funciona en desarrollo.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Ruta no disponible" },
      { status: 404 }
    );
  }

  // Comprobamos la clave de autorización.
  const secret = process.env.PUSH_TEST_SECRET;
  const providedSecret = request.headers.get("x-push-test-secret");

  if (!secret || !providedSecret || providedSecret !== secret) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  // Recuperamos el primer trabajo pendiente.
  const { data: trabajo, error: errorTrabajo } = await supabaseAdmin
    .from("push_notification_jobs")
    .select("id, item_id")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (errorTrabajo || !trabajo) {
    return NextResponse.json(
      { error: "No se encontró un trabajo pendiente" },
      { status: 404 }
    );
  }

  // Recuperamos el título del objeto.
  const { data: objeto, error: errorObjeto } = await supabaseAdmin
    .from("item_reports")
    .select("title")
    .eq("id", trabajo.item_id)
    .single();

  if (errorObjeto || !objeto) {
    return NextResponse.json(
      { error: "No se encontró el objeto" },
      { status: 404 }
    );
  }

  // Identificamos las suscripciones dentro del radio.
  const { data: destinatarios, error: errorDestinatarios } =
    await supabaseAdmin.rpc("get_push_recipients", {
      p_item_id: trabajo.item_id,
    });

  if (errorDestinatarios) {
    return NextResponse.json(
      { error: "No se pudieron consultar los destinatarios" },
      { status: 500 }
    );
  }

  // Enviamos las notificaciones.
  let enviados = 0;
  let fallidos = 0;

  for (const destinatario of destinatarios ?? []) {
    try {
      await sendPushNotification(destinatario, objeto.title);
      enviados++;
    } catch (error) {
      console.error("Error enviando notificación:", error);
      fallidos++;
    }
  }

  return NextResponse.json({
    ok: fallidos === 0,
    destinatarios: destinatarios?.length ?? 0,
    enviados,
    fallidos,
  });
}