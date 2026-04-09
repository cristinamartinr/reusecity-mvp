"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function getDefaultExpiryIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

export default function NuevoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const uploadPhotoIfAny = async (): Promise<string | null> => {
    if (!file) return null;

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `items/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("item-photos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error("Error subiendo foto: " + uploadError.message);
    }

    const { data } = supabase.storage.from("item-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLat("");
    setLng("");
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);

    try {
      const latNum = lat ? Number(lat) : null;
      const lngNum = lng ? Number(lng) : null;

      const photoUrl = await uploadPhotoIfAny();
      const expiresAt = getDefaultExpiryIso();

      const { error } = await supabase.from("item_reports").insert({
        title: title || null,
        description: description || null,
        lat: latNum,
        lng: lngNum,
        status: "AVAILABLE",
        photo_url: photoUrl,
        expires_at: expiresAt,
      });

      if (error) throw new Error("Error guardando aviso: " + error.message);

      resetForm();
      router.push("/lista");
      router.refresh();
    } catch (e: any) {
      setMsg(e?.message || "Error desconocido.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← Volver</a>
      <h1 style={styles.h1}>Nuevo</h1>
      <p style={styles.p}>
        Publica un aviso rápido. Si añades foto, se sube a Supabase Storage y se guarda su URL.
      </p>

      <div style={styles.card}>
        <label style={styles.label}>Foto (opcional)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

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

        <p style={styles.helper}>
          Caducidad automática: 24 horas desde la publicación.
        </p>

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
  helper: { marginTop: 12, fontSize: 13, opacity: 0.7 },
  msg: { marginTop: 12, opacity: 0.9 },
};