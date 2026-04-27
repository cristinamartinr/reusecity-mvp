"use client";

import Link from "next/link";

export default function NormasPage() {
  return (
    <main style={styles.main}>
      <Link href="/" style={styles.back}>
        ← Volver
      </Link>

      <h1 style={styles.h1}>Normas y privacidad</h1>

      <p style={styles.p}>
        ReUseCity es una herramienta para fomentar la reutilización urbana. Para
        un uso responsable, ten en cuenta lo siguiente:
      </p>

      <section style={styles.card}>
        <h3 style={styles.title}>Uso responsable</h3>
        <p style={styles.text}>
          Publica únicamente objetos reutilizables que estén realmente disponibles
          en la vía pública.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.title}>Privacidad y ubicación</h3>
        <p style={styles.text}>
          La ubicación es aproximada y se utiliza únicamente para facilitar la
          búsqueda de objetos cercanos.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.title}>Fotos y datos personales</h3>
        <p style={styles.text}>
          Evita incluir información personal, matrículas, caras o datos sensibles
          en las imágenes.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.title}>Objetos no permitidos</h3>
        <p style={styles.text}>
          No publiques objetos peligrosos, ilegales o que puedan suponer un riesgo
          para otras personas.
        </p>
      </section>

      <section style={styles.card}>
        <h3 style={styles.title}>Limitaciones del MVP</h3>
        <p style={styles.text}>
          Este es un prototipo. La disponibilidad de los objetos puede variar y no
          se garantiza su existencia en el momento de la recogida.
        </p>
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
    marginBottom: 12,
  },
  h1: {
    marginBottom: 16,
  },
  p: {
    marginBottom: 20,
    opacity: 0.85,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    marginBottom: 6,
  },
  text: {
    opacity: 0.85,
    lineHeight: 1.5,
  },
};