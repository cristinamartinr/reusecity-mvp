import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPushNotification } from "@/lib/sendPushNotification";

export async function processNextPushJob() {
  // 0. Recuperar trabajos interrumpidos antes de procesar la cola.
  const { data: recovered, error: recoveryError } =
    await supabaseAdmin.rpc("recover_stuck_push_jobs");

  if (recoveryError) {
    throw new Error(
      `Error recuperando trabajos: ${recoveryError.message}`
    );
  }

  if (recovered > 0) {
    console.log(
      `Trabajos interrumpidos recuperados: ${recovered}`
    );
  }
  // Recuperar entregas con errores temporales,
  // respetando el límite de intentos y el tiempo de espera.
  const { data: retried, error: retryError } =
    await supabaseAdmin.rpc("retry_temporary_push_deliveries");

  if (retryError) {
    throw new Error(
      `Error preparando reintentos: ${retryError.message}`
    );
  }

  if (retried > 0) {
    console.log(
      `Entregas preparadas para reintento: ${retried}`
    );
  }
  // 1. Reservar un trabajo pendiente.
  const { data: jobs, error: claimError } =
    await supabaseAdmin.rpc("claim_next_push_job");

  if (claimError) {
    throw new Error(`Error reservando trabajo: ${claimError.message}`);
  }

  const job = jobs?.[0];

  if (!job) {
    return {
      ok: true,
      message: "No hay trabajos pendientes",
      processed: 0,
    };
  }

  let sent = 0;
  let failed = 0;

  try {
    // 2. Recuperar el objeto.
    const { data: item, error: itemError } = await supabaseAdmin
      .from("item_reports")
      .select("title")
      .eq("id", job.item_id)
      .single();

    if (itemError || !item) {
      throw new Error("No se pudo recuperar el objeto");
    }

    // 3. Registrar los destinatarios del trabajo.
    const { error: prepareError } = await supabaseAdmin.rpc(
      "prepare_push_deliveries",
      {
        p_job_id: job.job_id,
      }
    );

    if (prepareError) {
      throw new Error(
        `Error preparando entregas: ${prepareError.message}`
      );
    }

    // 4. Procesar las entregas individualmente.
    while (true) {
      const { data: deliveries, error: deliveryError } =
        await supabaseAdmin.rpc("claim_next_push_delivery", {
          p_job_id: job.job_id,
        });

      if (deliveryError) {
        throw new Error(
          `Error reservando entrega: ${deliveryError.message}`
        );
      }

      const delivery = deliveries?.[0];

      // No quedan entregas pendientes.
      if (!delivery) {
        break;
      }

      let deliveryStatus: "SENT" | "FAILED" = "SENT";
      let errorMessage: string | null = null;

      try {
        // 5. Enviar la notificación.
        await sendPushNotification(
          {
            subscription_id: delivery.subscription_id,
            endpoint: delivery.endpoint,
            p256dh: delivery.p256dh,
            auth: delivery.auth,
          },
          item.title
        );

        sent++;
      } catch (error: unknown) {
        deliveryStatus = "FAILED";
        failed++;

        if (error instanceof Error) {
          const allowedErrors = [
            "PUSH_SUBSCRIPTION_EXPIRED",
            "PUSH_TEMPORARY_ERROR",
            "PUSH_DELIVERY_ERROR",
          ];

          errorMessage = allowedErrors.includes(error.message)
            ? error.message
            : "PUSH_UNKNOWN_ERROR";
        } else {
          errorMessage = "PUSH_UNKNOWN_ERROR";
        }
      }

      // 6. Registrar el resultado individual.
      const { data: finished, error: finishDeliveryError } =
        await supabaseAdmin.rpc("finish_push_delivery", {
          p_delivery_id: delivery.delivery_id,
          p_status: deliveryStatus,
          p_error: errorMessage,
        });

      if (finishDeliveryError || finished !== true) {
        throw new Error(
          "No se pudo registrar el resultado de una entrega"
        );
      }
    }

    // 7. Determinar el estado final del trabajo.
    const { data: deliveryStates, error: statesError } =
      await supabaseAdmin
        .from("push_notification_deliveries")
        .select("status")
        .eq("job_id", job.job_id);

    if (statesError) {
      throw new Error("No se pudieron comprobar las entregas");
    }

    const allSent = (deliveryStates ?? []).every(
      (delivery) => delivery.status === "SENT"
    );

    const finalStatus = allSent ? "SENT" : "FAILED";

    // 8. Finalizar el trabajo.
    const { data: jobFinished, error: finishJobError } =
      await supabaseAdmin.rpc("finish_push_job", {
        p_job_id: job.job_id,
        p_status: finalStatus,
      });

    if (finishJobError || jobFinished !== true) {
      throw new Error("No se pudo finalizar el trabajo");
    }

    return {
      ok: finalStatus === "SENT",
      processed: 1,
      sent,
      failed,
      status: finalStatus,
    };
  } catch (error) {
    // Intentar registrar el fallo del trabajo.
    const { error: recoveryError } = await supabaseAdmin.rpc(
      "finish_push_job",
      {
        p_job_id: job.job_id,
        p_status: "FAILED",
      }
    );

    if (recoveryError) {
      console.error(
        "No se pudo marcar el trabajo como fallido"
      );
    }

    throw error;
  }
}