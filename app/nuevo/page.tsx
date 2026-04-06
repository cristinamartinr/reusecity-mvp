import React from "react";

export default function NuevoPage() {
  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← Volver</a>

      <h1 style={styles.h1}>Nuevo aviso (placeholder)</h1>

      <p style={styles.p}>
        Flujo MVP: el usuario pulsa “+”, se abre la cámara/galería (funcionalidad nativa del dispositivo)
        y se publica el aviso. En esta fase se prioriza rapidez: foto + ubicación aproximada y caducidad.
      </p>

      <div style={styles.card}>
        <label style={styles.label}>¿Qué es? (opcional)</label>
        <input
          placeholder="Ej.: silla, carrito, libro..."
          style={styles.input}
        />

        <button style={styles.button} type="button">
          Publicar (demo)
        </button>
      </div>
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
  card: {
    marginTop: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: 16,
  },
  label: { display: "block", fontSize: 14, marginTop: 12, opacity: 0.75 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
  },
  button: {
    marginTop: 12,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
    background: "white",
    cursor: "pointer",
  },
};