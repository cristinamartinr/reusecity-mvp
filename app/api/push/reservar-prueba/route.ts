import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Solo disponible en desarrollo.
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

  // Reservamos el siguiente trabajo pendiente.
  const { data, error } = await supabaseAdmin.rpc(
    "claim_next_push_job"
  );

  if (error) {
    console.error("Error reservando trabajo:", error.message);

    return NextResponse.json(
      { error: "No se pudo reservar el trabajo" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    reservado: (data?.length ?? 0) > 0,
    trabajos: data?.length ?? 0,
  });
}