export default function ListaPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <a href="/" style={{ textDecoration: "none" }}>← Volver</a>
      <h1 style={{ marginTop: 16 }}>Lista (placeholder)</h1>
      <p style={{ opacity: 0.8, lineHeight: 1.5 }}>
        Aquí se mostrará el listado de avisos cercanos con foto, categoría y tiempo (frescura).
        En PR se conectará a base de datos y filtros básicos.
      </p>

      <ul style={{ marginTop: 18, paddingLeft: 18, lineHeight: 1.8 }}>
        <li>Aviso ejemplo: “Silla” — hace 20 min</li>
        <li>Aviso ejemplo: “Carrito bebé” — hace 1 h</li>
        <li>Aviso ejemplo: “Libros” — hace 2 h</li>
      </ul>
    </main>
  );
}