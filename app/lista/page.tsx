"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ItemReport = {
  id: string;
  title: string | null;
  description: string | null;
  status: "AVAILABLE" | "REMOVED" | "EXPIRED" | string;
  created_at: string;
  expires_at: string | null;
  photo_url: string | null;
  lat: number | null;
  lng: number | null;
};

type FreshnessFilter = "all" | "24h" | "48h" | "7d";

type Coordinates = {
  lat: number;
  lng: number;
};

type ItemWithDistance = ItemReport & {
  distanceKm: number | null;
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

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;

  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return false;

  return expiresMs <= Date.now();
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(from: Coordinates, to: Coordinates) {
  const earthRadiusKm = 6371;

  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm == null) return null;

  if (distanceKm < 1) {
    return `a ${Math.round(distanceKm * 1000)} m`;
  }

  return `a ${distanceKm.toFixed(1).replace(".", ",")} km`;
}

function ListaContent() {
  const searchParams = useSearchParams();
  const created = searchParams.get("created");
  const removed = searchParams.get("removed");

  const [items, setItems] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [hasTriedAutoLocation, setHasTriedAutoLocation] = useState(false);
  const [freshness, setFreshness] = useState<FreshnessFilter>("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,status,created_at,expires_at,photo_url,lat,lng")
        .eq("status", "AVAILABLE")
        .order("created_at", { ascending: false });

      if (error) {
        setMsg("Error cargando avisos: " + error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      const safeItems = ((data ?? []) as ItemReport[]).filter(
        (it) => !isExpired(it.expires_at)
      );

      setItems(safeItems);
      setLoading(false);
    };

    load();
  }, []);

  const requestLocation = (isAutomatic = false) => {
    if (!navigator.geolocation) {
      if (!isAutomatic) {
        setGeoMsg("Tu navegador no soporta geolocalización.");
      }
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        if (!isAutomatic) {
          setGeoMsg("📍 Lista ordenada por cercanía a tu ubicación.");
        }

        setGettingLocation(false);
      },
      () => {
        if (!isAutomatic) {
          setGeoMsg("No se pudo obtener tu ubicación (permiso denegado o error).");
        }
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  useEffect(() => {
    if (hasTriedAutoLocation) return;

    setHasTriedAutoLocation(true);
    requestLocation(true);
  }, [hasTriedAutoLocation]);

  const updateMyLocation = () => {
    setGeoMsg(null);
    requestLocation(false);
  };

  const visibleItems = useMemo(() => {
    const filtered = items.filter((it) =>
      isWithinFreshness(it.created_at, freshness)
    );

    const enriched: ItemWithDistance[] = filtered.map((it) => {
      if (
        !userLocation ||
        it.lat == null ||
        it.lng == null
      ) {
        return {
          ...it,
          distanceKm: null,
        };
      }

      return {
        ...it,
        distanceKm: getDistanceKm(userLocation, {
          lat: it.lat,
          lng: it.lng,
        }),
      };
    });

    if (userLocation) {
      enriched.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return enriched;
  }, [items, freshness, userLocation]);

  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>

      <h1 style={styles.h1}>Lista</h1>
      <p style={styles.p}>
        Explora avisos disponibles publicados recientemente.
      </p>

      {created && (
        <div style={styles.success}>
          ✅ Aviso publicado correctamente
        </div>
      )}

      {removed && (
        <div style={styles.success}>
          ✅ Aviso marcado como retirado
        </div>
      )}

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

        <button
          type="button"
          onClick={updateMyLocation}
          disabled={gettingLocation}
          style={styles.locationBtn}
        >
          {gettingLocation ? "Localizando…" : "Actualizar mi ubicación"}
        </button>
      </div>

      {geoMsg ? <div style={styles.info}>{geoMsg}</div> : null}

      {loading ? <p>Cargando…</p> : null}
      {msg ? <p style={styles.msg}>{msg}</p> : null}

      {!loading && !msg && visibleItems.length === 0 ? (
        <p>No hay avisos para este filtro.</p>
      ) : null}

      <ul style={styles.list}>
        {visibleItems.map((it) => {
          const cleanTitle = it.title?.trim() || "";
          const cleanDescription = it.description?.trim() || "";
          const mainLabel = cleanTitle || cleanDescription || "Objeto reutilizable";
          const showDescription =
            !!cleanDescription && cleanDescription !== cleanTitle;

          return (
            <li key={it.id} style={styles.item}>
              {it.photo_url ? (
                <img
                  src={it.photo_url}
                  alt={mainLabel}
                  style={styles.thumb}
                />
              ) : (
                <div style={styles.thumbPlaceholder}>Sin foto</div>
              )}

              <div style={styles.content}>
                <div style={styles.rowTop}>
                  <strong style={styles.title}>{mainLabel}</strong>
                  <div style={styles.metaGroup}>
                    <span style={styles.meta}>{timeAgo(it.created_at)}</span>
                    {it.distanceKm != null ? (
                      <span style={styles.distance}>
                        {formatDistance(it.distanceKm)}
                      </span>
                    ) : null}
                  </div>
                </div>

                {showDescription ? (
                  <p style={styles.desc}>{cleanDescription}</p>
                ) : null}

                <div style={styles.actions}>
                  <Link href={`/item/${it.id}`} style={styles.linkBtn}>
                    Ver detalle
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function ListaFallback() {
  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>
      <h1 style={styles.h1}>Lista</h1>
      <p style={styles.p}>Cargando avisos…</p>
    </main>
  );
}

export default function ListaPage() {
  return (
    <Suspense fallback={<ListaFallback />}>
      <ListaContent />
    </Suspense>
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

  success: {
    margin: "12px 0 16px",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1fae5",
    background: "#ecfdf5",
    color: "#065f46",
  },

  info: {
    marginBottom: 16,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
  },

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
  locationBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
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
  metaGroup: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  meta: { fontSize: 12, opacity: 0.7 },
  distance: {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    opacity: 0.9,
  },
  desc: { margin: "6px 0 0", opacity: 0.85 },
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