# Modelo Espacial Operacional

## Propósito

FlowCore no debe interpretar el mundo físico como un simple plano
cartesiano ni limitarse a calcular distancias entre puntos.

El modelo espacial operacional representa el entorno físico donde
ocurre la operación logística y permite considerar sus características,
restricciones, comportamiento y evolución.

## Principio fundamental

> El mundo físico es una restricción del sistema, no una representación gráfica.

## El mapa y la operación

Un mapa puede representar la existencia y geometría de una calle,
pero la operación necesita comprender cómo se comporta esa calle.

Por ello el modelo espacial considera:

- geometría;
- topología;
- sentidos de circulación;
- límites de velocidad;
- restricciones;
- giros;
- intersecciones;
- semáforos;
- accesibilidad por tipo de vehículo;
- zonas restringidas;
- condiciones históricas;
- eventos dinámicos;
- conocimiento operacional.

## Capas del modelo espacial

### 1. Capa geográfica

Representa elementos relativamente permanentes del mundo físico.

Ejemplos:

- calles;
- carreteras;
- intersecciones;
- puentes;
- túneles;
- infraestructura;
- geometría;
- sentidos de circulación.

OpenStreetMap puede utilizarse como una fuente geográfica base,
sin convertirse en una dependencia arquitectónica de FlowCore.

### 2. Capa dinámica

Representa condiciones que cambian con el tiempo.

Ejemplos:

- tráfico;
- accidentes;
- obras;
- bloqueos;
- inundaciones;
- cierres;
- eventos;
- restricciones temporales;
- condiciones climáticas.

### 3. Capa histórica

Representa el comportamiento observado de la red.

Ejemplos:

- tiempos reales de recorrido;
- congestión recurrente;
- comportamiento por horario;
- comportamiento por día;
- impacto de lluvia;
- incidencias recurrentes;
- variabilidad de ETA.

### 4. Capa de conocimiento operacional

Representa experiencia y conocimiento adquirido por la operación.

Ejemplos:

- rutas alternativas conocidas por operadores;
- calles que conviene evitar bajo determinadas condiciones;
- accesos preferentes;
- restricciones operativas;
- conocimiento aportado por operadores experimentados.

## Principio de aprendizaje

El conocimiento humano no sustituye automáticamente al modelo matemático.

Una observación debe poder ser:

1. registrada;
2. contrastada;
3. validada;
4. comparada con datos;
5. convertida en conocimiento cuando exista evidencia suficiente.

## Routing

FlowCore no debe depender de un único proveedor o motor de routing.

El acceso al routing debe realizarse mediante un contrato abstracto
que permita utilizar diferentes implementaciones.

Ejemplos de posibles motores:

- OSRM;
- GraphHopper;
- Valhalla;
- otros motores futuros.

OpenStreetMap puede ser una fuente de datos geográficos, mientras que
Leaflet puede utilizarse para visualización.

Estas responsabilidades no deben confundirse.

## Principio

> El mapa conoce las calles; la operación conoce el camino.

FlowCore debe combinar ambas perspectivas.

## Objetivo

Construir una representación espacial capaz de considerar el mundo
real, sus restricciones, sus cambios y el conocimiento adquirido
durante la operación.
