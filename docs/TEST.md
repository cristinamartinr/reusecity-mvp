# Testing – ReUseCity MVP

Este documento recoge los escenarios de prueba del MVP y los resultados obtenidos durante la fase de validación.

---

## Objetivo de las pruebas

Validar que el MVP permite:

- Publicar avisos de forma rápida y sin fricción
- Detectar automáticamente la ubicación cuando es posible
- Consultar objetos cercanos de forma clara
- Gestionar alertas por zona de interés

Las pruebas se han centrado en escenarios reales de uso en entorno urbano.

---

## Pruebas funcionales

### Creación de avisos

| Escenario | Resultado |
| --------- | --------- |
| Crear aviso con foto + ubicación | ✅ OK |
| Crear aviso solo con foto | ✅ OK |
| Crear aviso sin foto | ✅ OK |
| Crear aviso sin coordenadas | ✅ OK |

- **Crear aviso con foto + ubicación** → Se publica correctamente y aparece en lista, mapa y alertas
- **Crear aviso solo con foto** → Flujo rápido y sin fricción
- **Crear aviso sin foto** → Se muestra correctamente el fallback visual
- **Crear aviso sin coordenadas** → No aparece en mapa ni alertas, comportamiento esperado

### Procesamiento de imágenes

| Escenario | Resultado |
| --------- | --------- |
| Subida de imagen JPG | ✅ OK |
| Subida de imagen HEIC | ✅ OK |
| Extracción de coordenadas EXIF | ✅ OK |
| Imagen sin metadatos | ✅ OK |

- **JPG** → OK
- **HEIC** → Se convierte automáticamente a JPG antes de almacenarse
- **EXIF** → Se detecta la ubicación automáticamente cuando está disponible
- **Sin metadatos** → No rompe el flujo, el usuario puede continuar manualmente

### Visualización

| Escenario | Resultado |
| --------- | --------- |
| Lista ordenada por cercanía | ✅ OK |
| Distancias correctas | ✅ OK |
| Mapa muestra avisos con coordenadas | ✅ OK |
| Avisos sin coordenadas no aparecen en mapa | ✅ OK |

### Estados de avisos

| Escenario | Resultado |
| --------- | --------- |
| Aviso expirado no aparece | ✅ OK |
| Aviso con estado REMOVED no aparece | ✅ OK |
| Botón "Ya no está" actualiza estado | ✅ OK |

### Alertas por zona

| Escenario | Resultado |
| --------- | --------- |
| Creación de zona | ✅ OK |
| Cálculo de avisos dentro de 300 m | ✅ OK |
| Avisos cercanos ordenados por distancia | ✅ OK |

---

## Dataset de pruebas

Se han utilizado dos tipos de datos:

### Datos reales ajustados

Distribuidos en distintas zonas para simular uso real:

- San Juan de Aznalfarache (cluster cercano para pruebas de proximidad)
- Tomares
- Mairena del Aljarafe
- Gelves
- Triana y Los Remedios

Estos datos permiten validar:

- Agrupación de avisos cercanos
- Separación entre zonas
- Funcionamiento de alertas

### Edge cases

Se han creado avisos específicos:

- `test - sin foto`
- `test - sin coordenadas`
- `test - expirado`
- `test - removed`

Estos casos permiten validar el comportamiento del sistema en situaciones límite.

---

## Test con usuarios

### Escenarios propuestos

1. Encontrar un objeto cercano
2. Publicar un objeto
3. Consultar avisos en una zona guardada

### Resultados

#### Perfil 1 – Usuario no técnico

| Campo | Valor |
| --------- | --------- |
| Edad | 52 |
| Contexto | Trabajo de campo (encuestas en calle) |
| Escenario | Publicación de un objeto real junto a contenedor |

**Resultado:** Completó el flujo sin ayuda. Publicó el aviso correctamente. No reportó incidencias.

**Observaciones:** Percibe la app como intuitiva y sencilla. No hubo fricción en los pasos principales.

---

#### Perfil 2 – Usuario técnico

| Campo | Valor |
| --------- | --------- |
| Edad | 45 |
| Perfil | Informática |
| Escenario | Navegación general y revisión de interfaz |

**Resultado:** Navegación completada correctamente. Identificó mejoras de UX.

**Observaciones:** El botón "Volver" tiene baja visibilidad y se confunde con texto. El botón principal ("Publicar") se percibe como visualmente dominante respecto al resto de la interfaz.

---

## Observaciones generales

### Facilidad de uso

La publicación de avisos es rápida y comprensible, especialmente al priorizar la foto.

### Comprensión del flujo

Los usuarios entienden la relación entre mapa, lista y alertas.

### Dudas detectadas

La opción de usar la ubicación puede pasar desapercibida inicialmente.

### Mejoras sugeridas

Aumentar la visibilidad de la geolocalización y ajustar la jerarquía visual de algunos elementos secundarios.

---

## Conclusiones

El sistema permite:

- ✅ Publicar avisos de forma rápida
- ✅ Consultar objetos cercanos
- ✅ Gestionar alertas por zona

Se valida que el flujo principal es comprensible tanto para usuarios no técnicos como para perfiles técnicos.

Los usuarios técnicos identifican pequeñas mejoras de UX relacionadas con la visibilidad de elementos y la jerarquía visual, sin impacto en la funcionalidad principal.

Se confirma que el MVP cumple los objetivos funcionales planteados para esta fase del proyecto.

El sistema es estable y adecuado para validación con usuarios en entorno real.
