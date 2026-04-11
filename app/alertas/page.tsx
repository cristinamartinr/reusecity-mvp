"use client";

import { useEffect, useState } from "react";

type AlertZone = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
};

const STORAGE_KEY = "reusecity_alerts";

export default function AlertasPage() {
  const [zones, setZones] = useState<AlertZone[]>([]);
  const [name, setName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 🔹 Cargar de localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setZones(JSON.parse(stored));
    }
  }, []);

  // 🔹 Guardar en localStorage
  const saveZones = (newZones: AlertZone[]) => {
    setZones(newZones);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newZones));
  };

  // 📍 Obtener ubicación y guardar alerta
  const handleAddZone = () => {
    if (!name.trim()) {
      alert("Pon un nombre a la zona");
      return;
    }

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newZone: AlertZone = {
          id: Date.now().toString(),
          name,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radius: 1000, // 1km por defecto
        };

        saveZones([...zones, newZone]);
        setName("");
        setLoadingLocation(false);
      },
      () => {
        alert("No se pudo obtener la ubicación");
        setLoadingLocation(false);
      }
    );
  };

  // ❌ Eliminar zona
  const handleDelete = (id: string) => {
    const filtered = zones.filter((z) => z.id !== id);
    saveZones(filtered);
  };

  return (
    <div style={{ padding: "1rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Alertas por zona</h1>

      {/* FORM */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Ej: Casa, Trabajo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
          }}
        />

        <button
          onClick={handleAddZone}
          disabled={loadingLocation}
          style={{
            width: "100%",
            padding: "0.7rem",
            background: "#000",
            color: "#fff",
            borderRadius: "8px",
          }}
        >
          {loadingLocation ? "Obteniendo ubicación..." : "Guardar mi ubicación"}
        </button>
      </div>

      {/* LISTA */}
      <div>
        {zones.length === 0 && <p>No tienes alertas guardadas.</p>}

        {zones.map((zone) => (
          <div
            key={zone.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "0.8rem",
              marginBottom: "0.8rem",
            }}
          >
            <strong>{zone.name}</strong>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)} · {zone.radius} m
            </p>

            <button
              onClick={() => handleDelete(zone.id)}
              style={{
                background: "#eee",
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}