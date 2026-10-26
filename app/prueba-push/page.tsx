"use client";

import { useState } from "react";
import { subscribeToPushNotifications } from "@/lib/pushNotifications";
import { supabase } from "@/lib/supabaseClient";

export default function PruebaPushPage() {
  const [resultado, setResultado] = useState("");

  async function probarSuscripcion() {
    setResultado("Registrando suscripción...");

    try {
      // 1. Recuperar la sesión de Supabase
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      let session = sessionData.session;

      // 2. Crear usuario anónimo si todavía no existe
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) throw error;

        session = data.session;
      }

      if (!session) {
        throw new Error("No se ha podido iniciar sesión en Supabase.");
      }

      // 3. Crear o recuperar la suscripción Web Push
      const subscription = await subscribeToPushNotifications();
      const subscriptionData = subscription.toJSON();

      if (
        !subscriptionData.endpoint ||
        !subscriptionData.keys?.p256dh ||
        !subscriptionData.keys?.auth
      ) {
        throw new Error("La suscripción Web Push está incompleta.");
      }

      // 4. Guardar la suscripción en Supabase
      const { error } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: session.user.id,
            endpoint: subscriptionData.endpoint,
            p256dh: subscriptionData.keys.p256dh,
            auth: subscriptionData.keys.auth,
          },
          {
            onConflict: "user_id,endpoint",
          }
        );

      if (error) throw error;

      setResultado("✅ Suscripción guardada correctamente en Supabase");
    } catch (error) {
      console.error("Error al registrar Web Push:", error);

      setResultado(
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }

  async function enviarNotificacion() {
  setResultado("Enviando notificación...");

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      throw new Error("Primero debes activar las notificaciones push.");
    }

    const secret = window.prompt(
      "Introduce la clave PUSH_TEST_SECRET de .env.local:"
    );

    if (!secret) {
      setResultado("Envío cancelado.");
      return;
    }

    const response = await fetch("/api/push/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-push-test-secret": secret,
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al enviar la notificación.");
    }

    setResultado("✅ Notificación enviada desde el servidor");
  } catch (error) {
    console.error("Error de envío Web Push:", error);

    setResultado(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
}

  return (
    <main style={{ padding: 40 }}>
      <h1>Prueba de notificaciones ReUseCity 🔔</h1>

      <button onClick={probarSuscripcion}>
        Activar notificaciones push
      </button>

      <button onClick={enviarNotificacion} style={{ marginLeft: 12 }}>
        🔔 Enviar notificación de prueba
      </button>

      <p>{resultado}</p>
    </main>
  );
}