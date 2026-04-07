"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NuevoPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const useMyLocation = () => {
    setMsg(null);
    if (!navigator.geolocation) {
      setMsg("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
      },
      () => setMsg("No se pudo obtener tu ubicación (permiso denegado o error).")
    );
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);

    const latNum = lat ? Number(lat) : null;
    const lngNum = lng ? Number(lng) : null;

    const { error } = await supabase.from("item_reports").insert({
      title: title || null,
      description: description || null,
      lat: latNum,
      lng: lngNum,
      status: "AVAILABLE",
      // expires_at: null (lo dejamos vacío por simplicidad)
    });

    setSaving(false);

    if (error) {
      setMsg("Error al guardar: " + error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setMsg("✅ Aviso creado en Supabase.");
  };

  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← Volver</a>
      <h1 style={styles.h1}>Nuevo</h1>
      <p style={styles.p}>Crea un aviso rápido (sin login). La foto la añadimos en el siguiente paso.</p>

      <div style={styles.card}>
        <label style={styles.label}>¿Qué es? (opcional)</label>
        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej.: silla, libros, carrito…"
        />

        <label style={styles.label}>Descripción (opcional)</label>
        <textarea
          style={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej.: junto al contenedor azul"
        />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Lat</label>
            <input
              style={styles.input}
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="37.3891"
            />
          </div>
          <div style={{ width: 12 }} />
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Lng</label>
            <input
              style={styles.input}
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-5.9845"
            />
          </div>
        </div>

        <div style={styles.row}>
          <button style={styles.btnSecondary} onClick={useMyLocation} type="button">
            Usar mi ubicación
          </button>
          <div style={{ width: 12 }} />
          <button style={styles.btnPrimary} onClick={save} disabled={saving} type="button">
            {saving ? "Guardando…" : "Publicar"}
          </button>
        </div>

        {msg ? <p style={styles.msg}>{msg}</p> : null}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "48px 16px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  back: { textDecoration: "none" },
  h1: { marginTop: 16 },
  p: { opacity: 0.8, lineHeight: 1.5, marginBottom: 18 },
  card: { border: "1px solid #ddd", borderRadius: 12, padding: 16 },
  label: { display: "block", fontSize: 12, opacity: 0.8, marginTop: 10, marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc", minHeight: 80 },
  row: { display: "flex", alignItems: "center", marginTop: 14 },
  btnPrimary: { flex: 1, padding: "10px 12px", borderRadius: 10, border: "0", cursor: "pointer" },
  btnSecondary: { flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer", background: "white" },
  msg: { marginTop: 12, opacity: 0.9 },
};