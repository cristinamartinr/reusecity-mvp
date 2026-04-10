"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";
import L from "leaflet";

type MapItem = {
  id: string;
  title: string | null;
  description: string | null;
  created_at: string;
  lat: number;
  lng: number;
  photo_url?: string | null;
};

type Props = {
  items: MapItem[];
  center: { lat: number; lng: number };
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

const customIcon = L.divIcon({
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #ff5a36;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    "></div>
  `,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

export default function MapClient({ items, center }: Props) {
  return (
    <div
      style={{
        height: 520,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #e5e5e5",
      }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {items.map((it) => (
          <Marker
            key={it.id}
            position={[it.lat, it.lng]}
            icon={customIcon}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                {it.photo_url ? (
                  <img
                    src={it.photo_url}
                    alt={it.title ?? "foto del objeto"}
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 10,
                      marginBottom: 10,
                      display: "block",
                      border: "1px solid #e5e5e5",
                    }}
                  />
                ) : null}

                <strong style={{ display: "block", marginBottom: 6 }}>
                  {it.title ?? "(sin título)"}
                </strong>

                {it.description ? (
                  <p style={{ margin: "0 0 6px", opacity: 0.85 }}>
                    {it.description}
                  </p>
                ) : (
                  <p style={{ margin: "0 0 6px", opacity: 0.55, fontStyle: "italic" }}>
                    (sin descripción)
                  </p>
                )}

                <p style={{ margin: "0 0 8px", fontSize: 12, opacity: 0.7 }}>
                  {timeAgo(it.created_at)}
                </p>

                <Link
                  href={`/item/${it.id}`}
                  style={{
                    display: "inline-block",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    textDecoration: "none",
                    color: "inherit",
                    background: "white",
                    fontSize: 14,
                  }}
                >
                  Ver detalle
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}