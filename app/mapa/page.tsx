"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
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

      const { data: reports, error } = await supabase
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

      // ✅ FIX: aquí era "data" y NO existía. Tiene que ser "reports".
      setItems((reports ?? []) as ItemReport[]);
      setLoading(false);
    };

    load();
  }, []);

  // ✅ PASO C: nos quedamos solo con avisos que tengan coordenadas
  const itemsWithCoords = useMemo(
    () => items.filter((it) => it.lat != null && it.lng != null),
    [items]
  );

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
            <strong>Centro:</strong> {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </div>
          <div style={styles.count}>
            <strong>{itemsWithCoords.length}</strong> avisos con coordenadas
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
                📍 <strong>{it.title ?? "(sin título)"}</strong>{" "}
                <span style={styles.coords}>
                  ({Number(it.lat).toFixed(5)}, {Number(it.lng).toFixed(5)})
                </span>
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

const styles: Record<string, CSSProperties> = {
  main: { maxWidth: 900, margin: "0 auto", padding: "48px 16px", fontFamily: "system-ui" },
  back: { textDecoration: "none" },
  h1: { marginTop: 16 },
  p: { opacity: 0.8, lineHeight: 1.5, marginBottom: 18 },
  msg: { color: "crimson" },

  mapBox: {
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    padding: 16,
    minHeight: 320,
    background: "#fafafa",
  },
  mapHeader: { marginBottom: 12, opacity: 0.9 },
  count: { opacity: 0.75, marginTop: 6 },

  empty: { opacity: 0.7, fontStyle: "italic", padding: 12 },
  markerList: { margin: 0, paddingLeft: 18 },
  markerItem: { marginBottom: 8 },
  coords: { opacity: 0.7, fontSize: 12 },

  note: { marginTop: 18, opacity: 0.7, lineHeight: 1.5 },
};