"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type AlertZone = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
};

type ItemReport = {
  id: string;
  title: string | null;
  description: string | null;
  status: "AVAILABLE" | "REMOVED" | "EXPIRED" | string;
  lat: number | null;
  lng: number | null;
  expires_at: string | null;
};

const STORAGE_KEY = "reusecity_alerts";

function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;

  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return false;

  return expiresMs <= Date.now();
}

function formatDistanceMeters(distance: number) {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(distance / 1000).toFixed(1).replace(".", ",")} km`;
}

function getMainLabel(item: ItemReport) {
  const cleanTitle = item.title?.trim() || "";
  const cleanDescription = item.description?.trim() || "";

  return cleanTitle || cleanDescription || "Objeto reutilizable";
}

export default function AlertasPage() {
  const [zones, setZones] = useState<AlertZone[]>([]);
  const [items, setItems] = useState<ItemReport[]>([]);
  const [name, setName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setZones(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      setLoadingItems(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,status,lat,lng,expires_at")
        .eq("status", "AVAILABLE");

      if (error) {
        setMsg("No se pudieron cargar los avisos: " + error.message);
        setItems([]);
        setLoadingItems(false);
        return;
      }

      const validItems = ((data ?? []) as ItemReport[]).filter(
        (item) =>
          item.lat != null &&
          item.lng != null &&
          !isExpired(item.expires_at)
      );

      setItems(validItems);
      setLoadingItems(false);
    };

    loadItems();
  }, []);

  const saveZones = (newZones: AlertZone[]) => {
    setZones(newZones);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newZones));
  };

  const handleAddZone = () => {
    if (!name.trim()) {
      alert("Pon un nombre a la zona.");
      return;
    }

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newZone: AlertZone = {
          id: Date.now().toString(),
          name: name.trim(),
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radius: 1000,
        };

        saveZones([...zones, newZone]);
        setName("");
        setLoadingLocation(false);
      },
      () => {
        alert("No se pudo obtener la ubicación.");
        setLoadingLocation(false);
      }
    );
  };

  const handleDelete = (id: string) => {
    const filtered = zones.filter((z) => z.id !== id);
    saveZones(filtered);
  };

  const zonesWithNearbyInfo = useMemo(() => {
    return zones.map((zone) => {
      const nearbyItems = items
        .map((item) => {
          if (item.lat == null || item.lng == null) return null;

          const distance = getDistanceMeters(
            zone.lat,
            zone.lng,
            item.lat,
            item.lng
          );

          if (distance > zone.radius) return null;

          return {
            ...item,
            distanceMeters: distance,
          };
        })
        .filter(
          (
            item
          ): item is ItemReport & {
            distanceMeters: number;
          } => item !== null
        )
        .sort((a, b) => a.distanceMeters - b.distanceMeters);

      const nearestItem = nearbyItems[0] ?? null;

      return {
        ...zone,
        nearbyCount: nearbyItems.length,
        nearestItem,
      };
    });
  }, [zones, items]);

  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>

      <h1 style={styles.h1}>Alertas por zona</h1>
      <p style={styles.p}>
        Guarda zonas de interés para consultar cuántos avisos disponibles hay cerca.
      </p>

      <div style={styles.card}>
        <label style={styles.label}>Nombre de la zona</label>
        <input
          type="text"
          placeholder="Ej.: Casa, Trabajo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={handleAddZone}
          disabled={loadingLocation}
          style={styles.primaryBtn}
        >
          {loadingLocation ? "Obteniendo ubicación…" : "Guardar mi ubicación"}
        </button>
      </div>

      {loadingItems ? <p style={styles.info}>Cargando avisos cercanos…</p> : null}
      {msg ? <p style={styles.error}>{msg}</p> : null}

      <section style={styles.section}>
        {zonesWithNearbyInfo.length === 0 ? (
          <p style={styles.empty}>No tienes alertas guardadas.</p>
        ) : (
          zonesWithNearbyInfo.map((zone) => (
            <article key={zone.id} style={styles.zoneCard}>
              <strong style={styles.zoneTitle}>{zone.name}</strong>

              <p style={styles.zoneMeta}>
                {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)} · {zone.radius} m
              </p>

              <p style={styles.zoneCount}>
                📍 {zone.nearbyCount} aviso{zone.nearbyCount === 1 ? "" : "s"} cerca
              </p>

              {zone.nearestItem ? (
                <div style={styles.nearestBox}>
                  <div style={styles.nearestTitle}>Más cercano</div>
                  <div style={styles.nearestMain}>
                    {getMainLabel(zone.nearestItem)}
                  </div>
                  <div style={styles.nearestMeta}>
                    a {formatDistanceMeters(zone.nearestItem.distanceMeters)}
                  </div>

                  <Link
                    href={`/item/${zone.nearestItem.id}`}
                    style={styles.linkBtn}
                  >
                    Ver detalle
                  </Link>
                </div>
              ) : (
                <div style={styles.noNearbyBox}>
                  No hay avisos dentro del radio de esta zona.
                </div>
              )}

              <button
                onClick={() => handleDelete(zone.id)}
                style={styles.secondaryBtn}
              >
                Eliminar
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 720,
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
  card: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    marginBottom: 12,
  },
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "0",
    cursor: "pointer",
    background: "#111",
    color: "#fff",
  },
  secondaryBtn: {
    background: "#eee",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    cursor: "pointer",
    marginTop: 14,
  },
  linkBtn: {
    display: "inline-block",
    marginTop: 10,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    textDecoration: "none",
    color: "inherit",
    background: "white",
  },
  info: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  error: {
    color: "crimson",
  },
  section: {
    marginTop: 12,
  },
  empty: {
    opacity: 0.7,
    fontStyle: "italic",
  },
  zoneCard: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  zoneTitle: {
    display: "block",
    fontSize: 18,
    marginBottom: 8,
  },
  zoneMeta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  zoneCount: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 12,
  },
  nearestBox: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  nearestTitle: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  nearestMain: {
    fontSize: 16,
    fontWeight: 600,
  },
  nearestMeta: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.8,
  },
  noNearbyBox: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fafafa",
    opacity: 0.75,
  },
};