# Testing – ReUseCity MVP

Este documento recoge los escenarios de prueba del MVP y los resultados obtenidos durante la fase de validación.

## OBJETIVO DE LAS PRUEBAS

Validar que el MVP permite:

- Publicar avisos de forma rápida y sin fricción
- Detectar automáticamente la ubicación cuando es posible
- Consultar objetos cercanos de forma clara
- Gestionar alertas por zona de interés

Las pruebas se han centrado en escenarios reales de uso en entorno urbano.

## PRUEBAS FUNCIONALES

### CREACIÓN DE AVISOS

- Crear aviso con foto + ubicación → OK
  - Se publica correctamente y aparece en lista, mapa y alertas
- Crear aviso solo con foto → OK
  - Flujo rápido y sin fricción
- Crear aviso sin foto → OK
  - Se muestra correctamente el fallback visual
- Crear aviso sin coordenadas → OK
  - No aparece en mapa ni alertas, comportamiento esperado

### PROCESAMIENTO DE IMÁGENES

- Subida de imagen JPG → OK
- Subida de imagen HEIC → OK
  - Se convierte automáticamente a JPG antes de almacenarse
- Extracción de coordenadas EXIF → OK
  - Se detecta la ubicación automáticamente cuando está disponible
- Imagen sin metadatos → OK
  - No rompe el flujo, el usuario puede continuar manualmente

### VISUALIZACIÓN

- Lista ordenada por cercanía → OK
- Distancias correctas → OK
- Mapa muestra avisos con coordenadas → OK
- Avisos sin coordenadas no aparecen en mapa → OK

### ESTADOS DE AVISOS

- Aviso expirado no aparece → OK
- Aviso con estado REMOVED no aparece → OK
- Botón "Ya no está" actualiza estado → OK

### ALERTAS POR ZONA

- Creación de zona → OK
- Cálculo de avisos dentro de 300 m → OK
- Avisos cercanos ordenados por distancia → OK

## DATASET DE PRUEBAS

Se han utilizado dos tipos de datos:

### DATOS REALES AJUSTADOS

Distribuidos en distintas zonas para simular uso real:

- San Juan de Aznalfarache (cluster cercano para pruebas de proximidad)
- Tomares
- Mairena del Aljarafe
- Gelves
- Triana y Los Remedios

Estos datos permiten validar:

- agrupación de avisos cercanos
- separación entre zonas
- funcionamiento de alertas

### EDGE CASES

Se han creado avisos específicos:

- test - sin foto
- test - sin coordenadas
- test - expirado
- test - removed

Estos casos permiten validar el comportamiento del sistema en situaciones límite.

## TEST CON USUARIOS

### ESCENARIOS PROPUESTOS

- Encontrar un objeto cercano
- Publicar un objeto
- Consultar avisos en una zona guardada

### OBSERVACIONES

Facilidad de uso:
La publicación de avisos es rápida y comprensible, especialmente al priorizar la foto
Comprensión del flujo:
Los usuarios entienden la relación entre mapa, lista y alertas
Dudas detectadas:
La opción de usar la ubicación puede pasar desapercibida inicialmente
Mejoras sugeridas:
Aumentar la visibilidad de la geolocalización y mejorar mensajes cuando no hay avisos cercanos
CONCLUSIONES

El sistema permite:

Publicar avisos de forma rápida
Consultar objetos cercanos
Gestionar alertas por zona

Se confirma que el MVP cumple los objetivos funcionales planteados para esta fase del proyecto.

El sistema es estable y adecuado para validación con usuarios en entorno real.
