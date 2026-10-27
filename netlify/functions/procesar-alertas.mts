import type { Config } from "@netlify/functions";

export default async function () {
  const siteUrl = process.env.URL;
  const cronSecret = process.env.CRON_SECRET_KEY;

  if (!siteUrl || !cronSecret) {
    console.error("Faltan variables de entorno para procesar alertas");
    return;
  }

  try {
    const response = await fetch(`${siteUrl}/api/push/cron`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Error procesando alertas. HTTP ${response.status}`
      );
      return;
    }

    console.log("Procesamiento de alertas completado");
  } catch {
    console.error("Error de conexión al procesar alertas");
  }
}

export const config: Config = {
  schedule: "*/5 * * * *",
};