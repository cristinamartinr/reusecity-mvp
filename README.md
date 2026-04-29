# ReUseCity MVP

Aplicación web para publicar y encontrar objetos reutilizables cercanos en tiempo real.

El objetivo del proyecto es facilitar la reutilización urbana mediante avisos geolocalizados, reduciendo residuos y fomentando la economía circular.

## Funcionalidades principales

- Publicación de avisos con foto, título y descripción (todos opcionales)
- Extracción automática de coordenadas desde imágenes (EXIF)
- Soporte para imágenes HEIC (conversión a JPG en cliente)
- Uso de geolocalización del navegador
- Redondeo de coordenadas (privacidad aproximada de 10 m)
- Visualización en mapa (OpenStreetMap + Leaflet)
- Listado de avisos ordenado por proximidad
- Sistema de alertas por zona (radio de 300 m)
- Caducidad automática de avisos (24 h)
- Estados de aviso: `AVAILABLE`, `REMOVED`, `EXPIRED`
- Fallback visual para imágenes inexistentes o rotas

## Stack tecnológico

- Frontend: Next.js (App Router + TypeScript)
- Base de datos: Supabase (PostgreSQL)
- Storage: Supabase Storage
- Mapas: Leaflet + OpenStreetMap
- Procesamiento de imágenes:
  - `exifr` (lectura EXIF)
  - `heic2any` (conversión HEIC a JPG)

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir en navegador: `http://localhost:3000`

## Build de producción

```bash
npm run build
npm start
```

## Estructura del proyecto

- `/app`
- `/lista`
- `/mapa`
- `/alertas`
- `/nuevo`

- `/docs`
- `TEST.md`
- `CHANGELOG.md`

- `/lib`
  - `supabaseClient.ts`

## Testing

Los escenarios de prueba se documentan en `/docs/TEST.md`.

Incluyen:

- Creación de avisos:
  - con foto y ubicación
  - solo foto
  - solo texto
  - sin datos (bloqueado)
- Subida de imágenes JPG y HEIC
- Extracción de coordenadas EXIF
- Visualización en lista, mapa y alertas
- Estados: expirado y eliminado
- Distancias y orden por proximidad

## Dataset de pruebas

Datos reales ajustados:

- San Juan de Aznalfarache
- Tomares
- Mairena del Aljarafe
- Gelves
- Triana y Los Remedios

Edge cases:

- `test - sin foto`
- `test - sin coordenadas`
- `test - expirado`
- `test - removed`

## Consultas útiles

- Borrado completo:

```sql
delete from public.item_reports;
```

- Borrado de tests:

```sql
delete from public.item_reports where title like 'test - %';
```

## Decisiones de diseño

- Flujo rápido de publicación (prioridad a la foto)
- Campos opcionales para reducir fricción
- Redondeo de coordenadas para privacidad
- Persistencia local de alertas (`localStorage`)
- Exclusión de avisos expirados en frontend
- Exclusión de avisos sin coordenadas en mapa y alertas

## Estado del proyecto

Versión actual: `v0.1-alpha`

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
