import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 40, margin: 0 }}>ReUseCity MVP</h1>
      <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.5, opacity: 0.85 }}>
        Prototipo funcional para publicar avisos geolocalizados de objetos reutilizables
        y ayudar a que otras personas los recojan a tiempo.
      </p>

      <section
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Link href="/mapa" style={cardStyle}>
          <h2 style={h2Style}>Mapa</h2>
          <p style={pStyle}>Ver avisos disponibles con coordenadas.</p>
        </Link>

        <Link href="/nuevo" style={cardStyle}>
          <h2 style={h2Style}>Nuevo</h2>
          <p style={pStyle}>Publicar un aviso en pocos pasos.</p>
        </Link>

        <Link href="/lista" style={cardStyle}>
          <h2 style={h2Style}>Lista</h2>
          <p style={pStyle}>Explorar avisos recientes en formato listado.</p>
        </Link>

        <Link href="/alertas" style={cardStyle}>
          <h2 style={h2Style}>Alertas</h2>
          <p style={pStyle}>Guardar zonas de interés para futuros avisos.</p>
        </Link>
      </section>

      <hr style={{ margin: "28px 0", opacity: 0.25 }} />

      <p style={{ fontSize: 14, opacity: 0.75 }}>
        Esta versión prioriza funcionalidad y estabilidad para el MVP.
      </p>

      <div style={{ marginTop: 24 }}>
        <Link href="/normas" style={{ fontSize: 14, opacity: 0.7 }}>
          Normas y privacidad
        </Link>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  display: "block",
  padding: 16,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  textDecoration: "none",
  color: "inherit",
  background: "white",
};

const h2Style: React.CSSProperties = {
  fontSize: 20,
  margin: "0 0 6px 0",
};

const pStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.4,
  opacity: 0.8,
};