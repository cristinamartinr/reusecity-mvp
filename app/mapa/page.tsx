export default function MapaPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <a href="/" style={{ textDecoration: "none" }}>← Volver</a>
      <h1 style={{ marginTop: 16 }}>Mapa (placeholder)</h1>
      <p style={{ opacity: 0.8, lineHeight: 1.5 }}>
        Aquí se mostrará el mapa con avisos cercanos y marcadores geolocalizados.
        En el MVP de la PR se integrará el mapa y la lectura de avisos desde la base de datos.
      </p>

      <div style={{ marginTop: 18, border: "1px dashed rgba(0,0,0,0.25)", borderRadius: 12, height: 420, display: "grid", placeItems: "center" }}>
        <span style={{ opacity: 0.6 }}>MAPA</span>
      </div>
    </main>
  );
}