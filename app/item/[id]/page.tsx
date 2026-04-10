"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ItemReport = {
  id: string;
  title: string | null;
  description: string | null;
  photo_url: string | null;
  lat: number | null;
  lng: number | null;
  status: "AVAILABLE" | "REMOVED" | "EXPIRED" | string;
  created_at: string;
  expires_at: string | null;
};

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  if (Number.isNaN(diffMs)) return "";

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  if (hr < 24) return `hace ${hr} h`;
  return `hace ${day} d`;
}

function isExpiredByDate(expiresAt: string | null) {
  if (!expiresAt) return false;
  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return false;
  return expiresMs < Date.now();
}

function timeLeft(expiresAt: string | null) {
  if (!expiresAt) return null;

  const diffMs = new Date(expiresAt).getTime() - Date.now();

  if (diffMs <= 0) return "Caducado";

  const min = Math.floor(diffMs / (1000 * 60));
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (min < 60) return `Caduca en ${min} min`;
  if (hr < 24) return `Caduca en ${hr} h`;
  return `Caduca en ${day} d`;
}

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [item, setItem] = useState<ItemReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { id } = await params;

      setLoading(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,photo_url,lat,lng,status,created_at,expires_at")
        .eq("id", id)
        .single();

      if (error) {
        setMsg("Error cargando el aviso: " + error.message);
        setItem(null);
        setLoading(false);
        return;
      }

      setItem(data as ItemReport);
      setLoading(false);
    };

    load();
  }, [params]);

  const markAsRemoved = async () => {
    if (!item) return;

    const ok = window.confirm("¿Marcar este aviso como 'ya no está'?");
    if (!ok) return;

    setUpdating(true);
    setMsg(null);

    const { error } = await supabase
      .from("item_reports")
      .update({ status: "REMOVED" })
      .eq("id", item.id);

    if (error) {
      setMsg("No se pudo actualizar el aviso: " + error.message);
      setUpdating(false);
      return;
    }

    setItem({ ...item, status: "REMOVED" });
    setMsg("✅ Aviso marcado como ya no está.");
    setUpdating(false);
  };

  const expired =
    item != null &&
    (item.status === "EXPIRED" || isExpiredByDate(item.expires_at));

  const visualStatus = item ? (expired ? "EXPIRED" : item.status) : "";

  const canMarkAsRemoved =
    item != null && item.status === "AVAILABLE" && !expired;

  return (
    <main style={styles.main}>
      <div style={styles.topNav}>
        <Link href="/lista" style={styles.back}>
          ← Lista
        </Link>
        <Link href="/mapa" style={styles.back}>
          ← Mapa
        </Link>
      </div>

      <h1 style={styles.h1}>Detalle del aviso</h1>

      {loading ? <p>Cargando…</p> : null}
      {msg ? <p style={styles.msg}>{msg}</p> : null}

      {!loading && !item ? <p>No se encontró el aviso.</p> : null}

      {item ? (
        <article style={styles.card}>
          {item.photo_url ? (
            <img
              src={item.photo_url}
              alt={item.title ?? "foto del objeto"}
              style={styles.image}
            />
          ) : (
            <div style={styles.imagePlaceholder}>Sin foto</div>
          )}

          <div style={styles.metaRow}>
            <strong style={styles.title}>{item.title ?? "(sin título)"}</strong>
            <span style={styles.badge}>{visualStatus}</span>
          </div>

          <p style={styles.time}>Publicado {timeAgo(item.created_at)}</p>

          {item.expires_at ? (
            <>
              <p style={styles.expiry}>
                Caduca: {new Date(item.expires_at).toLocaleString("es-ES")}
              </p>
              <p style={{ ...styles.expiry, fontWeight: 600 }}>
                {timeLeft(item.expires_at)}
              </p>
            </>
          ) : null}

          {item.description ? (
            <p style={styles.description}>{item.description}</p>
          ) : (
            <p style={styles.descriptionEmpty}>(sin descripción)</p>
          )}

          {(item.lat != null || item.lng != null) && (
            <p style={styles.coords}>
              Coordenadas:{" "}
              {item.lat != null ? item.lat.toFixed(5) : "—"},{" "}
              {item.lng != null ? item.lng.toFixed(5) : "—"}
            </p>
          )}

          <div style={styles.actions}>
            {canMarkAsRemoved ? (
              <button
                type="button"
                onClick={markAsRemoved}
                disabled={updating}
                style={styles.primaryBtn}
              >
                {updating ? "Actualizando…" : "Ya no está"}
              </button>
            ) : (
              <div style={styles.infoBox}>
                {expired
                  ? "Este aviso ha caducado."
                  : "Este aviso ya no está disponible."}
              </div>
            )}
          </div>
        </article>
      ) : null}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "48px 16px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  topNav: {
    display: "flex",
    gap: 16,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  back: { textDecoration: "none" },
  h1: { marginTop: 16, marginBottom: 20 },
  msg: { color: "crimson" },

  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 16,
  },

  image: {
    width: "100%",
    maxHeight: 360,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid #ddd",
    display: "block",
    background: "#fff",
  },

  imagePlaceholder: {
    width: "100%",
    minHeight: 220,
    borderRadius: 12,
    border: "1px dashed #bbb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "baseline",
    flexWrap: "wrap",
    marginTop: 16,
  },

  title: { fontSize: 22 },
  badge: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#f6f6f6",
  },

  time: { opacity: 0.7, marginTop: 8 },
  expiry: { opacity: 0.7, marginTop: 6, fontSize: 14 },
  description: { lineHeight: 1.6, marginTop: 16 },
  descriptionEmpty: { lineHeight: 1.6, marginTop: 16, opacity: 0.5, fontStyle: "italic" },
  coords: { marginTop: 16, fontSize: 14, opacity: 0.75 },

  actions: {
    marginTop: 20,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "0",
    cursor: "pointer",
    background: "#111",
    color: "white",
  },

  infoBox: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fafafa",
    opacity: 0.85,
  },
};