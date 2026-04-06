"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ItemReport = {
  id: string;
  title: string | null;
  description: string | null;
  status: "AVAILABLE" | "REMOVED" | "EXPIRED";
  created_at: string;
};

export default function ListaPage() {
  const [items, setItems] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,status,created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) setItems(data as ItemReport[]);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← Volver</a>

      <h1 style={styles.h1}>Lista</h1>
      <p style={styles.p}>
        Esta vista lee los avisos desde Supabase (tabla <code>item_reports</code>).
      </p>

      {loading ? (
        <p style={{ opacity: 0.7 }}>Cargando…</p>
      ) : items.length === 0 ? (
        <p style={{ opacity: 0.7 }}>
          No hay avisos todavía. Crea 1–3 filas en Supabase para verlos aquí.
        </p>
      ) : (
        <ul style={styles.ul}>
          {items.map((it) => (
            <li key={it.id} style={styles.li}>
              <strong>{it.title ?? "Objeto reutilizable"}</strong>{" "}
              <span style={{ opacity: 0.7 }}>— {it.status}</span>
              {it.description ? <div style={{ opacity: 0.8 }}>{it.description}</div> : null}
            </li>
          ))}
        </ul>
      )}
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
  p: { opacity: 0.8, lineHeight: 1.5 },
  ul: { marginTop: 18, paddingLeft: 18, lineHeight: 1.8 },
  li: { marginBottom: 12 },
};