"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
});

type ItemReport = {
  id: string;
  title: string | null;
  description: string | null;
  status: "AVAILABLE" | "REMOVED" | "EXPIRED" | string;
  created_at: string;
  expires_at: string | null;
  lat: number | null;
  lng: number | null;
};

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;

  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return false;

  return expiresMs <= Date.now();
}

export default function MapaPage() {
  const [items, setItems] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const center = useMemo(() => ({ lat: 37.3891, lng: -5.9845 }), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,lat,lng,status,created_at,expires_at")
        .eq("status", "AVAILABLE")
        .order("created_at", { ascending: false });

      if (error) {
        setMsg("Error cargando avisos: " + error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      const safeItems = ((data ?? []) as ItemReport[]).filter(
        (it) =>
          it.lat != null &&
          it.lng != null &&
          !isExpired(it.expires_at)
      );

      setItems(safeItems);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>

      <h1 style={styles.h1}>Mapa</h1>
      <p style={styles.p}>
        Mapa real de avisos disponibles con marcadores sobre OpenStreetMap.
      </p>

      {loading ? <p>Cargando mapa…</p> : null}
      {msg ? <p style={styles.msg}>{msg}</p> : null}

      {!loading && !msg && items.length === 0 ? (
        <div style={styles.empty}>
          No hay avisos disponibles con coordenadas.
        </div>
      ) : null}

      {!loading && !msg && items.length > 0 ? (
        <>
          <MapClient
            center={center}
            items={items.map((it) => ({
              id: it.id,
              title: it.title,
              description: it.description,
              created_at: it.created_at,
              lat: it.lat as number,
              lng: it.lng as number,
            }))}
          />

          <p style={styles.note}>
            Consejo: toca un marcador para ver el aviso y abrir su detalle.
          </p>
        </>
      ) : null}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "48px 16px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  back: {
    textDecoration: "none",
    display: "inline-block",
    marginBottom: 8,
  },
  h1: {
    marginTop: 8,
    marginBottom: 8,
  },
  p: {
    opacity: 0.85,
    lineHeight: 1.6,
    marginBottom: 18,
  },
  msg: {
    color: "crimson",
  },
  empty: {
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 20,
    opacity: 0.75,
    fontStyle: "italic",
  },
  note: {
    marginTop: 14,
    opacity: 0.75,
    lineHeight: 1.6,
  },
};