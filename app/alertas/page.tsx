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
  photo_url: string | null;
};

type NearbyItem = ItemReport & {
  distanceMeters: number;
};

const STORAGE_KEY = "reusecity_alerts";
const DEFAULT_RADIUS_METERS = 300;

const FALLBACK_IMAGE =
  "https://via.placeholder.com/300x300?text=Objeto";

/**
 * Calcula la distancia entre dos coordenadas usando Haversine.
 * El resultado se devuelve en metros.
 */
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

/**
 * Evita mostrar avisos cuya fecha de caducidad ya ha pasado.
 */
function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;

  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return false;

  return expiresMs <= Date.now();
}

/**
 * Formatea distancias en metros o kilómetros.
 */
function formatDistanceMeters(distance: number) {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(distance / 1000).toFixed(1).replace(".", ",")} km`;
}

/**
 * Devuelve el texto principal de un aviso.
 */
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

  /**
   * Recupera las alertas guardadas en localStorage.
   * También normaliza zonas antiguas al radio actual de 300 metros.
   */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsedZones = JSON.parse(stored) as AlertZone[];

        const normalizedZones = parsedZones.map((zone) => ({
          ...zone,
          radius: DEFAULT_RADIUS_METERS,
        }));

        setZones(normalizedZones);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedZones));
      } catch {
        setZones([]);
      }
    }
  }, []);

  /**
   * Carga avisos disponibles desde Supabase.
   * Se excluyen avisos sin coordenadas y avisos caducados.
   */
  useEffect(() => {
    const loadItems = async () => {
      setLoadingItems(true);
      setMsg(null);

      const { data, error } = await supabase
        .from("item_reports")
        .select("id,title,description,status,lat,lng,expires_at,photo_url")
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

  /**
   * Guarda zonas en estado y localStorage.
   */
  const saveZones = (newZones: AlertZone[]) => {
    setZones(newZones);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newZones));
  };

  /**
   * Crea una nueva alerta usando la ubicación actual del usuario.
   */
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
          radius: DEFAULT_RADIUS_METERS,
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

  /**
   * Elimina una alerta guardada.
   */
  const handleDelete = (id: string) => {
    const filtered = zones.filter((z) => z.id !== id);
    saveZones(filtered);
  };

  /**
   * Calcula los avisos cercanos para cada alerta.
   */
  const zonesWithNearbyInfo = useMemo(() => {
    return zones.map((zone) => {
      const nearbyItems: NearbyItem[] = items
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
        .filter((item): item is NearbyItem => item !== null)
        .sort((a, b) => a.distanceMeters - b.distanceMeters);

      return {
        ...zone,
        nearbyCount: nearbyItems.length,
        nearbyItems,
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
        Guarda zonas de interés para consultar avisos disponibles a menos de{" "}
        {DEFAULT_RADIUS_METERS} metros.
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
          style={{
            ...styles.primaryBtn,
            ...(loadingLocation ? styles.disabledBtn : {}),
          }}
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
              <div style={styles.zoneHeader}>
                <div>
                  <strong style={styles.zoneTitle}>{zone.name}</strong>

                  <p style={styles.zoneMeta}>
                    {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)} · radio de{" "}
                    {zone.radius} m
                  </p>
                </div>

                <span style={styles.zoneBadge}>
                  {zone.nearbyCount} aviso
                  {zone.nearbyCount === 1 ? "" : "s"}
                </span>
              </div>

              <p style={styles.zoneCount}>
                Mostrando avisos dentro de {zone.radius} m
              </p>

              {zone.nearbyItems.length > 0 ? (
                <ul style={styles.list}>
                  {zone.nearbyItems.map((item) => {
                    const mainLabel = getMainLabel(item);
                    const cleanDescription = item.description?.trim() || "";
                    const showDescription =
                      !!cleanDescription && cleanDescription !== item.title;

                    return (
                      <li key={item.id} style={styles.item}>
                        <img
                          src={item.photo_url || FALLBACK_IMAGE}
                          alt={mainLabel}
                          style={styles.thumb}
                        />

                        <div style={styles.content}>
                          <div style={styles.rowTop}>
                            <strong style={styles.itemTitle}>{mainLabel}</strong>

                            <span style={styles.distance}>
                              {item.distanceMeters < 50 ? "Muy cerca · " : ""}
                              a {formatDistanceMeters(item.distanceMeters)}
                            </span>
                          </div>

                          {showDescription ? (
                            <p style={styles.desc}>{cleanDescription}</p>
                          ) : null}

                          <Link href={`/item/${item.id}`} style={styles.linkBtn}>
                            Ver detalle
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div style={styles.noNearbyBox}>
                  No hay avisos dentro del radio de esta zona.
                </div>
              )}

              <button
                onClick={() => handleDelete(zone.id)}
                style={styles.secondaryBtn}
              >
                Eliminar alerta
              </button>
            </article>
          ))
        )}
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Las alertas se guardan en este dispositivo mediante almacenamiento local.
        </p>
      </footer>
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
  back: {
    textDecoration: "none",
    display: "inline-block",
    marginBottom: 16,
    color: "inherit",
  },
  h1: {
    marginTop: 0,
    marginBottom: 6,
    fontSize: 24,
  },
  p: {
    opacity: 0.85,
    lineHeight: 1.5,
    marginTop: 0,
    marginBottom: 18,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    background: "white",
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
    fontWeight: 600,
  },
  disabledBtn: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  secondaryBtn: {
    background: "#eee",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    cursor: "pointer",
    marginTop: 14,
    fontWeight: 500,
  },
  linkBtn: {
    display: "inline-block",
    marginTop: 10,
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    textDecoration: "none",
    color: "inherit",
    background: "white",
    fontWeight: 500,
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    background: "white",
  },
  zoneHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  zoneTitle: {
    display: "block",
    fontSize: 18,
    marginBottom: 6,
  },
  zoneMeta: {
    fontSize: 14,
    opacity: 0.7,
    margin: 0,
  },
  zoneBadge: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  zoneCount: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 0,
    marginBottom: 12,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    border: "1px solid #e5e5e5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    background: "#fff",
  },
  thumb: {
    width: 86,
    height: 86,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid #ddd",
    background: "#fff",
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
  itemTitle: {
    fontSize: 16,
  },
  distance: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    fontWeight: 600,
    opacity: 0.95,
    whiteSpace: "nowrap",
  },
  desc: {
    margin: "6px 0 0",
    opacity: 0.85,
    lineHeight: 1.4,
  },
  noNearbyBox: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fafafa",
    opacity: 0.8,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: "1px solid #eee",
    fontSize: 13,
    opacity: 0.7,
  },
  footerText: {
    margin: 0,
  },
};