"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ItemReport = {
  id: string;
  title: string | null;
  description: string | null;
  status: "AVAILABLE" | "REMOVED" | "EXPIRED" | string;
  created_at: string;
  photo_url: string | null;
};

export default function ListaPage() {
  const [items, setItems] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,status,created_at,photo_url")
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

  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>
        ← Volver
      </a>

      <h1 style={styles.h1}>Lista</h1>
      <p style={styles.p}>
        Esta vista lee los avisos desde Supabase (tabla <code>item_reports</code>).
      </p>

      {loading ? <p>Cargando…</p> : null}
      {msg ? <p style={styles.msg}>{msg}</p> : null}

      {!loading && !msg && items.length === 0 ? (
        <p>No hay avisos todavía.</p>
      ) : null}

      <ul style={styles.list}>
        {items.map((it) => (
          <li key={it.id} style={styles.item}>
            {it.photo_url ? (
              <img
                src={it.photo_url}
                alt={it.title ?? "foto"}
                style={styles.thumb}
              />
            ) : (
              <div style={styles.thumbPlaceholder}>Sin foto</div>
            )}

            <div style={{ flex: 1 }}>
              <div style={styles.rowTop}>
                <strong style={styles.title}>{it.title ?? "(sin título)"}</strong>
                <span style={styles.status}>{it.status}</span>
              </div>

              {it.description ? (
                <p style={styles.desc}>{it.description}</p>
              ) : (
                <p style={styles.descEmpty}>(sin descripción)</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "48px 16px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  back: { textDecoration: "none" },
  h1: { marginTop: 16 },
  p: { opacity: 0.8, lineHeight: 1.5, marginBottom: 18 },
  msg: { color: "crimson" },
  list: { listStyle: "none", padding: 0, margin: 0 },
  item: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  thumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid #ddd",
    background: "#fff",
  },
  thumbPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    border: "1px dashed #bbb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    opacity: 0.7,
  },
  rowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "baseline",
  },
  title: { fontSize: 16 },
  status: { fontSize: 12, opacity: 0.7 },
  desc: { margin: "6px 0 0", opacity: 0.85 },
  descEmpty: { margin: "6px 0 0", opacity: 0.5, fontStyle: "italic" },
};