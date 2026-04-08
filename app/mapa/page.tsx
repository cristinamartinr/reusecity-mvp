"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ItemReport = {
  id: string;
  title: string | null;
  description: string | null;
  status: "AVAILABLE" | "REMOVED" | "EXPIRED" | string;
  created_at: string;
  lat: number | null;
  lng: number | null;
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

function statusLabel(status: string) {
  if (status === "AVAILABLE") return "AVAILABLE";
  if (status === "REMOVED") return "REMOVED";
  if (status === "EXPIRED") return "EXPIRED";
  return status || "—";
}

export default function MapaPage() {
  const [items, setItems] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Centro por defecto (Sevilla)
  const center = useMemo(() => ({ lat: 37.3891, lng: -5.9845 }), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,lat,lng,status,created_at")
        .eq("status", "AVAILABLE")
        .order("created_at", { ascending: false });

      if (error) {
        setMsg("Error cargando avisos: " + error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      setItems((data ?? []) as ItemReport[]);
      setLoading(false);
    };

    load();
  }, []);

  const itemsWithCoords = items.filter((it) => it.lat != null && it.lng != null);

  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>

      <h1 style={styles.h1}>Mapa</h1>
      <p style={styles.p}>
        Vista de mapa (placeholder). En la PR mostraremos marcadores con las coordenadas guardadas en{" "}
        <code>item_reports</code>.
      </p>

      {loading ? <p>Cargando…</p> : null}
      {msg ? <p style={styles.msg}>{msg}</p> : null}

      <div style={styles.mapBox}>
        <div style={styles.mapHeader}>
          <div>
            <strong>Centro (Sevilla):</strong> {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </div>
          <div style={styles.subHeader}>
            {itemsWithCoords.length} avisos con coordenadas
          </div>
        </div>

        {itemsWithCoords.length === 0 ? (
          <div style={styles.empty}>
            No hay avisos con coordenadas todavía. (Añade <code>lat</code> y <code>lng</code> a algún registro para ver
            “marcadores”.)
          </div>
        ) : (
          <ul style={styles.markerList}>
            {itemsWithCoords.map((it) => (
              <li key={it.id} style={styles.markerItem}>
                <span style={styles.pin}>📍</span>
                <div style={styles.markerText}>
                  <div style={styles.markerTitleRow}>
                    <strong style={styles.title}>{it.title ?? "(sin título)"}</strong>
                    <span style={styles.badge}>{statusLabel(it.status)}</span>
                    <span style={styles.ago}>{timeAgo(it.created_at)}</span>
                  </div>

                  {it.description ? (
                    <div style={styles.desc}>{it.description}</div>
                  ) : null}

                  <div style={styles.coords}>
                    ({it.lat!.toFixed(5)}, {it.lng!.toFixed(5)})
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p style={styles.note}>
        Nota: aquí mostraremos el mapa real en una fase posterior (Leaflet/MapLibre). Para el MVP de PR, lo importante es
        que el “mapa” sea funcional y los avisos se carguen sin errores.
      </p>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 900, margin: "0 auto", padding: "48px 16px", fontFamily: "system-ui" },
  back: { textDecoration: "none", display: "inline-block", marginBottom: 8 },
  h1: { marginTop: 8, marginBottom: 8 },
  p: { opacity: 0.85, lineHeight: 1.6, marginBottom: 18 },
  msg: { color: "crimson" },

  mapBox: {
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 16,
    minHeight: 320,
    background: "#fafafa",
  },

  mapHeader: { marginBottom: 14, opacity: 0.9 },
  subHeader: { marginTop: 6, opacity: 0.75 },

  empty: { opacity: 0.75, fontStyle: "italic", padding: 12 },

  markerList: { margin: 0, padding: 0, listStyle: "none" },

  markerItem: {
    display: "flex",
    gap: 10,
    padding: "10px 8px",
    borderRadius: 12,
    marginBottom: 8,
    background: "white",
    border: "1px solid #eee",
  },

  pin: { width: 24, textAlign: "center" },

  markerText: { flex: 1 },

  markerTitleRow: {
    display: "flex",
    gap: 10,
    alignItems: "baseline",
    flexWrap: "wrap",
  },

  title: { fontSize: 16 },

  badge: {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#f4f4f4",
    opacity: 0.9,
  },

  ago: { fontSize: 12, opacity: 0.7 },

  desc: { marginTop: 4, opacity: 0.85 },

  coords: { marginTop: 4, opacity: 0.7, fontSize: 12 },

  note: { marginTop: 18, opacity: 0.75, lineHeight: 1.6 },
};