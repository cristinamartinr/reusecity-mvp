# ReUseCity MVP

Aplicación web para publicar y encontrar objetos reutilizables cercanos en tiempo real.

El objetivo del proyecto es facilitar la reutilización urbana mediante avisos geolocalizados, reduciendo residuos y fomentando la economía circular.

## Demo y repositorio

[Prototipo funcional](https://reusecity-mvp.netlify.app/)

[Repositorio del proyecto](https://github.com/cristinamartinr/reusecity-mvp)

## Funcionalidades principales

- Publicación de avisos con foto, título y descripción (todos opcionales)
- Extracción automática de coordenadas desde imágenes (EXIF)
- Soporte para imágenes HEIC (conversión a JPG en cliente)
- Uso de geolocalización del navegador
- Redondeo de coordenadas (privacidad aproximada de 10 m)
- Visualización en mapa (OpenStreetMap + Leaflet)
- Listado de avisos ordenado por proximidad
- Sistema de alertas por zona (radio de 300 m)
- Caducidad automática de avisos
- Estados de aviso: AVAILABLE, REMOVED, EXPIRED
- Fallback visual para imágenes inexistentes o rotas

## Stack tecnológico

- Frontend: Next.js (App Router + TypeScript)
- Base de datos: Supabase (PostgreSQL)
- Storage: Supabase Storage
- Mapas: Leaflet + OpenStreetMap
- Procesamiento de imágenes:
  - exifr (lectura EXIF)
  - heic2any (conversión HEIC a JPG)

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir en navegador: [http://localhost:3000](http://localhost:3000)

## Build de producción

```bash
npm run build
npm start
```

## Variables de entorno

Para ejecutar el proyecto en local es necesario configurar las variables de entorno de Supabase en un archivo `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

Estas claves no se incluyen en el repositorio.

## Estructura del proyecto

- `/app`
  - `/lista`
  - `/mapa`
  - `/alertas`
  - `/nuevo`
  - `/normas`
- `/components`
  - componentes reutilizables de interfaz y mapa
- `/docs`
  - TEST.md
  - CHANGELOG.md
- `/lib`
  - supabaseClient.ts

## Testing

Los escenarios de prueba se documentan en `/docs/TEST.md`.

Incluyen:

- Creación de avisos con distintas combinaciones
- Subida de imágenes JPG y HEIC
- Extracción de coordenadas EXIF
- Visualización en lista, mapa y alertas
- Estados de avisos (expirado y eliminado)
- Distancias y orden por proximidad

## Dataset de pruebas

La aplicación incluye un conjunto de datos de prueba persistente para facilitar la evaluación en cualquier momento.

Los avisos se han distribuido en distintas ubicaciones para simular un uso real y validar el comportamiento del sistema:

- Sevilla / Aljarafe
- Madrid
- Barcelona
- Valencia
- Galicia
- País Vasco

El objetivo es que la aplicación siempre muestre contenido suficiente durante la revisión, sin depender del momento exacto de la corrección.

## Consultas útiles

### Borrado completo

```sql
delete from public.item_reports;
```

## Decisiones de diseño

- Flujo rápido de publicación (prioridad a la foto)
- Campos opcionales para reducir fricción
- Redondeo de coordenadas para privacidad
- Persistencia local de alertas (localStorage)
- Exclusión de avisos expirados en frontend
- Exclusión de avisos sin coordenadas en mapa y alertas

## Estado del proyecto

Versión actual: v0.1-alpha

El MVP permite validar:

- publicación de avisos
- consulta por proximidad
- alertas por zona

## Limitaciones actuales

- Sin autenticación
- Sin validación de contenido
- Sin notificaciones
- Alertas solo en cliente
- No edición de avisos

## Futuras mejoras

- Pantalla de detalle más completa
- Feedback de usuario
- Métricas de impacto
- Mejora UX en móvil
- Sistema de reputación
- Integración con datos abiertos

## Objetivo académico

Proyecto del grado Técnica Digital de Interacción y Multimedia (UOC)

Base para el TFG orientado a:

- reutilización urbana
- datos geolocalizados
- economía circular
- impacto social

## Licencia

Proyecto académico.

