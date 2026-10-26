export async function GET() {
  return Response.json({
    ok: true,
    message: "API de ReUseCity funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
}