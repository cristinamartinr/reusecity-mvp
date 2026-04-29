# Changelog — ReUseCity MVP

Este documento recoge la evolución del MVP de ReUseCity durante el desarrollo del Proyecto 3.

---

## v0.1-testing — Base para pruebas funcionales

### Funcionalidad

- Implementación de alertas por zona con geolocalización
- Cálculo de distancia entre usuario y avisos (Haversine)
- Filtrado de avisos dentro de un radio de 300 metros
- Exclusión de avisos caducados en frontend
- Persistencia de zonas en localStorage

### Datos y testing

- Generación de dataset de prueba con:
  - Clusters cercanos (< 50 m)
  - Avisos dentro de 300 m
  - Avisos distribuidos en distintas zonas (Sevilla y Aljarafe)
- Validación de comportamiento realista en mapa y lista

### UX/UI

- Mejora de la pantalla `/lista`:
  - Orden por proximidad
  - Visualización de distancia
  - Mejora de espaciado y legibilidad

- Mejora de la pantalla `/alertas`:
  - Cards alineadas con `/lista`
  - Indicador de número de avisos cercanos
  - Mejora de copy ("Mostrando avisos dentro de X m")

- Mejora de la pantalla `/nuevo`:
  - Botón visible para selección de foto
  - Eliminación de fricción en subida de imágenes

- Añadido fallback de imagen para avisos sin foto

### Accesibilidad y contraste

- Corrección de problemas de visibilidad en modo oscuro (Chrome)
- Ajuste de contraste en botones e inputs

### Decisiones de diseño

- Eliminación de login para reducir fricción en el MVP
- Enfoque mobile-first
- Uso de la distancia como eje principal de interacción
- Persistencia local para alertas en lugar de backend

---

## v0.0-initial — MVP base

### Funcionalidad inicial

- Creación de avisos con título, descripción, foto y ubicación
- Subida de imágenes a Supabase Storage
- Listado de avisos desde base de datos
- Mapa con visualización básica de avisos
- Estados de aviso (AVAILABLE, REMOVED)

### Arquitectura

- Frontend en Next.js (App Router + TypeScript)
- Backend en Supabase (Postgres + Storage)
- Deploy en Netlify

### Objetivo

- Validar el flujo completo: crear → almacenar → visualizar
  