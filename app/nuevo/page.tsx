"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import exifr from "exifr";
import { supabase } from "@/lib/supabaseClient";

type PhotoGps = {
  latitude?: number;
  longitude?: number;
};

function isHeicFile(file: File) {
  const name = file.name.toLowerCase();

  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(4));
}

/**
 * Intenta leer coordenadas GPS desde los metadatos EXIF de la imagen original.
 * Se ejecuta antes de convertir HEIC, porque la conversión puede eliminar metadatos.
 */
async function extractGpsFromPhoto(file: File) {
  try {
    const gps = (await exifr.gps(file)) as PhotoGps | undefined;

    if (
      gps?.latitude == null ||
      gps?.longitude == null ||
      !Number.isFinite(gps.latitude) ||
      !Number.isFinite(gps.longitude)
    ) {
      return null;
    }

    return {
      lat: roundCoordinate(gps.latitude),
      lng: roundCoordinate(gps.longitude),
    };
  } catch {
    return null;
  }
}

/**
 * Convierte HEIC/HEIF a JPG en cliente para asegurar compatibilidad.
 * Se importa dinámicamente para evitar errores de SSR/prerender.
 */
async function normalizeImageFile(file: File) {
  if (!isHeicFile(file)) {
    return file;
  }

  const heic2anyModule = await import("heic2any");
  const heic2any = heic2anyModule.default;

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });

  const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

  return new File(
    [convertedBlob],
    file.name.replace(/\.(heic|heif)$/i, ".jpg"),
    { type: "image/jpeg" }
  );

}

export default function NuevoPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  /**
   * Obtiene la ubicación actual del usuario desde el navegador.
   */
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(roundCoordinate(pos.coords.latitude).toString());
        setLng(roundCoordinate(pos.coords.longitude).toString());
        setMsg("Ubicación actual añadida.");
      },
      () => {
        alert("No se pudo obtener la ubicación");
      }
    );
  };

  /**
   * Gestiona la foto seleccionada:
   * - intenta extraer coordenadas GPS desde EXIF,
   * - convierte HEIC/HEIF a JPG,
   * - guarda el archivo final en estado para subirlo a Supabase Storage.
   */
  const handlePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0] ?? null;

    if (!selectedFile) {
      setPhoto(null);
      return;
    }

    setProcessingPhoto(true);
    setMsg(null);

    try {
      const gps = await extractGpsFromPhoto(selectedFile);

      if (gps) {
        setLat(gps.lat.toString());
        setLng(gps.lng.toString());
      }

      const normalizedFile = await normalizeImageFile(selectedFile);
      setPhoto(normalizedFile);

      if (gps && isHeicFile(selectedFile)) {
        setMsg("Foto seleccionada. Imagen HEIC convertida a JPG y ubicación detectada.");
      } else if (gps) {
        setMsg("Foto seleccionada. Ubicación detectada desde la imagen.");
      } else if (isHeicFile(selectedFile)) {
        setMsg("Foto seleccionada. Imagen HEIC convertida a JPG.");
      } else {
        setMsg("Foto seleccionada.");
      }
    } catch {
      setPhoto(null);
      setMsg("No se pudo procesar la imagen. Prueba con JPG o PNG.");
    } finally {
      setProcessingPhoto(false);
    }
  };

  /**
   * Crea el aviso en Supabase y sube la imagen a Storage si existe.
   */
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
        lat: lat ? Number(Number(lat).toFixed(4)) : null,
        lng: lng ? Number(Number(lng).toFixed(4)) : null,
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

        <label style={styles.fileBtn}>
          {processingPhoto ? "Procesando foto..." : "Seleccionar foto"}
          <input
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handlePhotoChange}
            style={styles.fileInputHidden}
            disabled={processingPhoto}
          />
        </label>

        {photo ? (
          <p style={styles.fileName}>Foto seleccionada: {photo.name}</p>
        ) : (
          <p style={styles.fileHint}>Opcional: añade una foto del objeto.</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || processingPhoto}
          style={{
            ...styles.primaryBtn,
            ...(loading || processingPhoto ? styles.disabledBtn : {}),
          }}
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>

        <p style={styles.notice}>
          Al publicar aceptas las{" "}
          <Link href="/normas" style={styles.link}>
            normas de uso y privacidad
          </Link>
          .
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
    color: "inherit",
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
    color: "#171717",
    background: "#fff",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    minHeight: 100,
    color: "#171717",
    background: "#fff",
  },
  primaryBtn: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "0",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontWeight: 500,
  },
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
    margin: 0,
  },
  fileHint: {
    fontSize: 13,
    opacity: 0.65,
    margin: 0,
  },
  disabledBtn: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  notice: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 6,
  },
  link: {
    textDecoration: "underline",
    color: "inherit",
  },
  error: {
    color: "crimson",
    fontSize: 14,
  },
};