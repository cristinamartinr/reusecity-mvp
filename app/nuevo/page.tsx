"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function NuevoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  /**
   * Obtiene la ubicación actual del usuario.
   */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setMsg("Tu navegador no soporta geolocalización.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
      },
      () => {
        setMsg("No se pudo obtener la ubicación.");
      }
    );
  };

  /**
   * Sube la foto a Supabase Storage y devuelve la URL pública.
   */
  const uploadPhoto = async () => {
    if (!photo) return null;

    const fileName = `items/${Date.now()}-${photo.name}`;

    const { error } = await supabase.storage
      .from("item-photos")
      .upload(fileName, photo);

    if (error) {
      throw new Error("Error subiendo la imagen");
    }

    const { data } = supabase.storage
      .from("item-photos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  /**
   * Guarda el aviso en la base de datos.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lat || !lng) {
      setMsg("Necesitas añadir una ubicación.");
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const photoUrl = await uploadPhoto();

      const { error } = await supabase.from("item_reports").insert({
        title: title || null,
        description: description || null,
        lat: Number(lat),
        lng: Number(lng),
        status: "AVAILABLE",
        photo_url: photoUrl,
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(),
      });

      if (error) {
        setMsg("Error al guardar: " + error.message);
        setLoading(false);
        return;
      }

      router.push("/lista?created=1");
    } catch (err: any) {
      setMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>

      <h1 style={styles.h1}>Nuevo aviso</h1>
      <p style={styles.p}>
        Publica un objeto reutilizable en unos pocos pasos.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
        />

        {/* BOTÓN DE FOTO MEJORADO */}
        <label style={styles.fileBtn}>
          Seleccionar foto
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            style={styles.fileInputHidden}
          />
        </label>

        {photo ? (
          <p style={styles.fileName}>
            Foto seleccionada: {photo.name}
          </p>
        ) : (
          <p style={styles.fileHint}>
            Opcional: añade una foto del objeto.
          </p>
        )}

        <button
          type="button"
          onClick={handleGetLocation}
          style={styles.secondaryBtn}
        >
          Usar mi ubicación
        </button>

        <input
          type="text"
          placeholder="Latitud"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Longitud"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          style={styles.input}
        />

        <button
          type="submit"
          disabled={loading}
          style={styles.primaryBtn}
        >
          {loading ? "Publicando…" : "Publicar aviso"}
        </button>

        {msg && <p style={styles.msg}>{msg}</p>}
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "48px 16px",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  back: {
    textDecoration: "none",
    display: "inline-block",
    marginBottom: 16,
  },
  h1: {
    marginBottom: 8,
  },
  p: {
    opacity: 0.8,
    marginBottom: 20,
  },
  form: {
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
    minHeight: 80,
  },

  /* BOTÓN FOTO */
  fileBtn: {
    display: "inline-block",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontWeight: 500,
    textAlign: "center",
  },

  fileInputHidden: {
    display: "none",
  },

  fileName: {
    fontSize: 13,
    opacity: 0.8,
  },

  fileHint: {
    fontSize: 13,
    opacity: 0.6,
  },

  primaryBtn: {
    padding: "12px 14px",
    borderRadius: 10,
    border: 0,
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

  msg: {
    color: "crimson",
  },
};