import Link from "next/link";

/**
 * Página principal del MVP.
 *
 * Actúa como punto de entrada a las funcionalidades principales:
 * - consultar el mapa,
 * - publicar un nuevo aviso,
 * - ver el listado,
 * - gestionar alertas,
 * - acceder a normas y privacidad.
 */
export default function HomePage() {
  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.h1}>ReUseCity MVP</h1>

        <p style={styles.subtitle}>
          Encuentra y comparte objetos reutilizables cerca de ti.
        </p>

        <p style={styles.intro}>
          Prototipo funcional para publicar avisos geolocalizados de objetos
          reutilizables y ayudar a que otras personas los recojan a tiempo.
        </p>
      </header>

      {/* Acceso principal: publicar debe destacar como acción prioritaria. */}
      <div style={styles.primaryAction}>
        <Link href="/nuevo" style={styles.primaryCard}>
          <h2 style={styles.primaryTitle}>Publicar objeto</h2>
          <p style={styles.primaryText}>
            Crea un aviso rápido con foto, descripción y ubicación.
          </p>
        </Link>
      </div>

      {/* Navegación secundaria hacia las pantallas de consulta. */}
      <section style={styles.grid} aria-label="Secciones principales">
        <Link href="/mapa" style={styles.card}>
          <h2 style={styles.h2}>Mapa</h2>
          <p style={styles.p}>Ver avisos disponibles sobre OpenStreetMap.</p>
        </Link>

        <Link href="/lista" style={styles.card}>
          <h2 style={styles.h2}>Lista</h2>
          <p style={styles.p}>Explorar avisos recientes en formato listado.</p>
        </Link>

        <Link href="/alertas" style={styles.card}>
          <h2 style={styles.h2}>Alertas</h2>
          <p style={styles.p}>Guardar zonas de interés y revisar avisos cercanos.</p>
        </Link>
      </section>

      <hr style={styles.separator} />

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Esta versión prioriza funcionalidad y estabilidad para el MVP.
        </p>

        <Link href="/normas" style={styles.footerLink}>
          Normas y privacidad
        </Link>
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
  header: {
    marginBottom: 28,
  },
  h1: {
    fontSize: 40,
    margin: 0,
    lineHeight: 1.1,
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 18,
    lineHeight: 1.4,
    fontWeight: 600,
    color: "#111",
  },
  intro: {
    margin: 0,
    maxWidth: 680,
    fontSize: 16,
    lineHeight: 1.5,
    opacity: 0.85,
  },
  primaryAction: {
    marginTop: 24,
    marginBottom: 14,
  },
  primaryCard: {
    display: "block",
    padding: 18,
    borderRadius: 14,
    textDecoration: "none",
    color: "#fff",
    background: "#111",
  },
  primaryTitle: {
    fontSize: 22,
    margin: "0 0 6px 0",
  },
  primaryText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.4,
    opacity: 0.85,
  },
  grid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  card: {
    display: "block",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    textDecoration: "none",
    color: "inherit",
    background: "white",
  },
  h2: {
    fontSize: 20,
    margin: "0 0 6px 0",
  },
  p: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.4,
    opacity: 0.8,
  },
  separator: {
    margin: "28px 0",
    opacity: 0.25,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 32,
  },
  footerText: {
    margin: 0,
    fontSize: 14,
    opacity: 0.75,
  },
  footerLink: {
    fontSize: 14,
    opacity: 0.75,
    color: "inherit",
  },
};