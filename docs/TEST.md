# Testing – ReUseCity MVP

Este documento recoge los escenarios de prueba del MVP y los resultados obtenidos durante la fase de validación.

---

## 1. Pruebas funcionales

### Creación de avisos

- Crear aviso con foto + ubicación → OK
- Crear aviso solo con foto → OK
- Crear aviso sin foto → OK (fallback visual)
- Crear aviso sin coordenadas → OK (no aparece en mapa ni alertas)

### Procesamiento de imágenes

- Subida de imagen JPG → OK
- Subida de imagen HEIC → OK (convertida a JPG)
- Extracción de coordenadas EXIF → OK
- Imagen sin metadatos → OK (no rompe flujo)

### Visualización

- Lista ordenada por cercanía → OK
- Distancias correctas → OK
- Mapa muestra avisos con coordenadas → OK
- Avisos sin coordenadas no aparecen en mapa → OK

### Estados de avisos

- Aviso expirado no aparece → OK
- Aviso con estado REMOVED no aparece → OK
- Botón "Ya no está" actualiza estado → OK

### Alertas por zona

- Creación de zona → OK
- Cálculo de avisos dentro de 300 m → OK
- Avisos cercanos ordenados por distancia → OK

---

## 2. Dataset de pruebas

Se han creado avisos de test para validar edge cases:

- test - sin foto
- test - sin coordenadas
- test - expirado
- test - removed

También se han utilizado datos reales con coordenadas ajustadas para simular escenarios urbanos.

---

## 3. Test con usuarios

Escenarios planteados:

1. Encontrar un objeto cercano
2. Publicar un objeto
3. Consultar avisos en una zona guardada

Observaciones (a completar):

- Facilidad de uso:
- Comprensión del flujo:
- Dudas detectadas:
- Mejoras sugeridas:

---

## 4. Conclusiones

El sistema permite:

- Publicar avisos de forma rápida
- Consultar objetos cercanos
- Gestionar alertas por zona

El MVP es funcional y estable para validación con usuarios.
