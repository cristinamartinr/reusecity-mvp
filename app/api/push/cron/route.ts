import { NextRequest, NextResponse } from "next/server";
import { processNextPushJob } from "@/lib/processPushJobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Comprobar que existe una clave configurada.
  const cronSecret = process.env.CRON_SECRET_KEY;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "Servicio no configurado" },
      { status: 503 }
    );
  }

  // Comprobar la autorización.
  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const result = await processNextPushJob();

    return NextResponse.json(result);
  } catch {
    console.error("Error procesando notificaciones automáticas");

    return NextResponse.json(
      { error: "Error interno procesando notificaciones" },
      { status: 500 }
    );
  }
}