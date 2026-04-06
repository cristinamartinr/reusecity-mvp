export default function MapaPage() {
  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← Volver</a>

      <h1 style={styles.h1}>Mapa (placeholder)</h1>

      <p style={styles.p}>
        Aquí se mostrará el mapa con avisos cercanos y marcadores geolocalizados.
        En el MVP de la PR se integrará el mapa y la lectura de avisos desde la base de datos.
      </p>

      <div style={styles.mapBox}>
        <span style={styles.mapText}>MAPA</span>
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
  mapBox: {
    marginTop: 18,
    border: "1px dashed rgba(0,0,0,0.25)",
    borderRadius: 12,
    height: 420,
    display: "grid",
    placeItems: "center",
  },
  mapText: { opacity: 0.6 },
};