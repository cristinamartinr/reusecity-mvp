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
  photo_url: string | null;
};

type FreshnessFilter = "all" | "24h" | "48h" | "7d";

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

function isWithinFreshness(createdAt: string, filter: FreshnessFilter) {
  if (filter === "all") return true;

  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) return true;

  const now = Date.now();
  const diff = now - createdMs;

  const hours24 = 24 * 60 * 60 * 1000;
  const hours48 = 48 * 60 * 60 * 1000;
  const days7 = 7 * 24 * 60 * 60 * 1000;

  if (filter === "24h") return diff <= hours24;
  if (filter === "48h") return diff <= hours48;
  if (filter === "7d") return diff <= days7;

  return true;
}

export default function ListaPage() {
  const [items, setItems] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [freshness, setFreshness] = useState<FreshnessFilter>("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,status,created_at,photo_url")
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

  const visibleItems = useMemo(() => {
    return items.filter((it) => isWithinFreshness(it.created_at, freshness));
  }, [items, freshness]);

  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>

      <h1 style={styles.h1}>Lista</h1>
      <p style={styles.p}>
        Explora avisos disponibles publicados recientemente.
      </p>

      <div style={styles.toolbar}>
        <label htmlFor="freshness" style={styles.filterLabel}>
          Mostrar:
        </label>
        <select
          id="freshness"
          value={freshness}
          onChange={(e) => setFreshness(e.target.value as FreshnessFilter)}
          style={styles.select}
        >
          <option value="all">Todos</option>
          <option value="24h">Últimas 24 h</option>
          <option value="48h">Últimas 48 h</option>
          <option value="7d">Últimos 7 días</option>
        </select>
      </div>

      {loading ? <p>Cargando…</p> : null}
      {msg ? <p style={styles.msg}>{msg}</p> : null}

      {!loading && !msg && visibleItems.length === 0 ? (
        <p>No hay avisos para este filtro.</p>
      ) : null}

      <ul style={styles.list}>
        {visibleItems.map((it) => (
          <li key={it.id} style={styles.item}>
            {it.photo_url ? (
              <img
                src={it.photo_url}
                alt={it.title ?? "foto del objeto"}
                style={styles.thumb}
              />
            ) : (
              <div style={styles.thumbPlaceholder}>Sin foto</div>
            )}

            <div style={styles.content}>
              <div style={styles.rowTop}>
                <strong style={styles.title}>{it.title ?? "(sin título)"}</strong>
                <span style={styles.meta}>{timeAgo(it.created_at)}</span>
              </div>

              {it.description ? (
                <p style={styles.desc}>{it.description}</p>
              ) : (
                <p style={styles.descEmpty}>(sin descripción)</p>
              )}

              <div style={styles.actions}>
                <Link href={`/item/${it.id}`} style={styles.linkBtn}>
                  Ver detalle
                </Link>
              </div>
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

  toolbar: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 18,
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: 14,
    opacity: 0.85,
  },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "white",
  },

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
    flexShrink: 0,
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
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  title: { fontSize: 16 },
  meta: { fontSize: 12, opacity: 0.7 },
  desc: { margin: "6px 0 0", opacity: 0.85 },
  descEmpty: { margin: "6px 0 0", opacity: 0.5, fontStyle: "italic" },
  actions: {
    marginTop: 12,
    display: "flex",
    gap: 10,
  },
  linkBtn: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    textDecoration: "none",
    color: "inherit",
    background: "white",
  },
};