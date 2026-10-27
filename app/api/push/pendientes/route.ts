import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // API disponible únicamente en desarrollo.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Ruta no disponible" },
      { status: 404 }
    );
  }

  // Verificamos la clave de pruebas.
  const secret = process.env.PUSH_TEST_SECRET;
  const providedSecret = request.headers.get("x-push-test-secret");

  if (!secret || !providedSecret || providedSecret !== secret) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  // Recuperamos un trabajo pendiente.
  const { data: trabajo, error: errorTrabajo } = await supabaseAdmin
    .from("push_notification_jobs")
    .select("id, item_id, status")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (errorTrabajo) {
    return NextResponse.json(
      { error: "Error consultando la cola" },
      { status: 500 }
    );
  }

  if (!trabajo) {
    return NextResponse.json({
      ok: true,
      pendientes: 0,
      destinatarios: 0,
    });
  }

  // Buscamos los navegadores que deben recibir la alerta.
  const { data: destinatarios, error: errorDestinatarios } =
    await supabaseAdmin.rpc("get_push_recipients", {
      p_item_id: trabajo.item_id,
    });

  if (errorDestinatarios) {
    console.error(
      "Error buscando destinatarios:",
      errorDestinatarios.message
    );

    return NextResponse.json(
      { error: "Error consultando destinatarios" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    pendientes: 1,
    destinatarios: destinatarios?.length ?? 0,
  });
}