export default function ListaPage() {
  return (
    <main style={styles.main}>
      <a href="/" style={styles.back}>← Volver</a>

      <h1 style={styles.h1}>Lista (placeholder)</h1>

      <p style={styles.p}>
        Aquí se mostrará el listado de avisos cercanos con foto, categoría y tiempo (frescura).
        En PR se conectará a base de datos y filtros básicos.
      </p>

      <ul style={styles.ul}>
        <li>Aviso ejemplo: “Silla” — hace 20 min</li>
        <li>Aviso ejemplo: “Carrito bebé” — hace 1 h</li>
        <li>Aviso ejemplo: “Libros” — hace 2 h</li>
      </ul>
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
  ul: { marginTop: 18, paddingLeft: 18, lineHeight: 1.8 },
};