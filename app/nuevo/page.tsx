"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NuevoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toString());
        setLng(pos.coords.longitude.toString());
      },
      () => {
        alert("No se pudo obtener la ubicación");
      }
    );
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setMsg("Añade al menos una descripción.");
      return;
    }

    setLoading(true);
    setMsg(null);

    let photoUrl: string | null = null;

    if (photo) {
      const fileName = `items/${Date.now()}-${photo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("item-photos")
        .upload(fileName, photo);

      if (uploadError) {
        setMsg("Error subiendo imagen: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("item-photos")
        .getPublicUrl(fileName);

      photoUrl = data.publicUrl;
    }

    const { error } = await supabase.from("item_reports").insert([
      {
        title,
        description,
        photo_url: photoUrl,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        status: "AVAILABLE",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    if (error) {
      setMsg("Error creando aviso: " + error.message);
      setLoading(false);
      return;
    }

    router.push("/lista?created=1");
  };

  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>

      <h1 style={styles.h1}>Nuevo aviso</h1>

      <div style={styles.card}>
        <input
          type="text"
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Describe el objeto..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={handleLocation} style={styles.secondaryBtn}>
          Usar mi ubicación
        </button>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={styles.primaryBtn}
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>

        {/* 🔥 AQUÍ va el bloque de normas */}
        <p style={styles.notice}>
          Al publicar aceptas las{" "}
          <Link href="/normas" style={styles.link}>
            normas de uso y privacidad
          </Link>.
        </p>

        {msg && <p style={styles.error}>{msg}</p>}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "48px 16px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  back: {
    textDecoration: "none",
    display: "inline-block",
    marginBottom: 12,
  },
  h1: {
    marginBottom: 16,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    minHeight: 100,
  },
  primaryBtn: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "0",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
  notice: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 6,
  },
  link: {
    textDecoration: "underline",
  },
  error: {
    color: "crimson",
    fontSize: 14,
  },
};