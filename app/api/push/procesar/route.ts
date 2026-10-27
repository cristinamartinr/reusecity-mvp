import { NextRequest, NextResponse } from "next/server";
import { processNextPushJob } from "@/lib/processPushJobs";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Por ahora, solo permitimos ejecutar el procesador en desarrollo.
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

  try {
    const result = await processNextPushJob();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error procesando notificaciones:", error);

    return NextResponse.json(
      { error: "No se pudo procesar el trabajo" },
      { status: 500 }
    );
  }
}