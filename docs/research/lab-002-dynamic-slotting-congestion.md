# 🧪 LAB-002 — El Fantasma del Slotting Dinámico en Temporada Alta

## Laboratorio de Realidad Operacional — Gudo Labs

**Proyecto:** Gudo Labs
**Laboratorio:** Realidad Operacional
**Caso:** LAB-002
**Título:** El Fantasma del Slotting Dinámico en Temporada Alta
**Entorno:** Almacén 3PL Multi-Inquilino — Fulfillment e-Commerce & Retail
**Estado:** 🟡 SUSPENDIDO POR AUSENCIA DE EVIDENCIA
**Relación con FlowCore:** 🟢 SIN IMPACTO CONSTITUCIONAL DEMOSTRADO
**Implementación FlowCore:** 🔒 SIN CAMBIOS

---

# 1. Propósito del expediente

LAB-002 registra una investigación operacional sobre una posible divergencia entre:

```text
OPTIMIZACIÓN LOCAL
        ↓
DISTANCIA INDIVIDUAL DE PICKING
        ↓
CONCENTRACIÓN ESPACIAL
        ↓
INTERACCIÓN ENTRE AGENTES
        ↓
CONGESTIÓN
        ↓
TIEMPO OPERACIONAL EFECTIVO
```

El propósito del expediente es preservar la investigación hasta el punto en que pudo desarrollarse de manera metodológicamente válida.

El expediente **no constituye una conclusión causal**.

No constituye una demostración de que un WMS específico haya fallado.

No constituye una demostración de que el slotting dinámico sea incorrecto.

No constituye evidencia de que una determinada estrategia de asignación sea universalmente inferior.

Su función es conservar:

* la pregunta de investigación;
* el contexto;
* las observaciones iniciales;
* las hipótesis;
* la matriz de evidencia;
* los criterios de falsación;
* el protocolo experimental;
* las variables necesarias;
* la evidencia requerida;
* y la razón por la cual la investigación no pudo continuar.

---

# 2. Estado epistemológico

LAB-002 debe distinguir explícitamente entre:

```text
DATO
  ↓
INFERENCIA
  ↓
HIPÓTESIS
  ↓
EVIDENCIA REQUERIDA
  ↓
RESULTADO
  ↓
CONCLUSIÓN
```

En este expediente se alcanzaron las etapas:

```text
DATO / OBSERVACIÓN
        ↓
INFERENCIA
        ↓
HIPÓTESIS
        ↓
EVIDENCIA REQUERIDA
        ↓
PROTOCOLO
```

Pero no se alcanzaron:

```text
EVIDENCIA OBSERVADA
        ↓
RESULTADO EXPERIMENTAL
        ↓
CONCLUSIÓN
```

Por tanto:

> **LAB-002 no posee conclusión experimental.**

---

# 3. Pregunta de investigación

La pregunta central quedó formulada como:

> **¿Puede una optimización que minimiza la distancia individual de picking producir una solución subóptima cuando los recursos físicos son compartidos y la interacción entre agentes modifica el costo efectivo de ejecutar las tareas?**

La pregunta no presupone una respuesta.

No presupone que la congestión sea causada por el slotting.

No presupone que la distancia individual sea una métrica incorrecta.

Su objetivo es determinar si una métrica local puede resultar insuficiente cuando existen recursos físicos compartidos y efectos de interacción.

---

# 4. Contexto operacional

El caso considera un operador logístico 3PL que administra un centro de distribución de aproximadamente:

```text
15,000 m²
```

En el centro conviven cuatro clientes:

```text
Inquilino A
Inquilino B
Inquilino C
Inquilino D
```

Durante una temporada de alta demanda, el sistema de gestión de almacén reporta:

```text
Ocupación de posiciones       ≈ 91.4 %
Wave Completion               ≈ 98 %
```

Mientras que en la operación física se plantea la observación de:

```text
Incremento significativo
del tiempo de ciclo por pedido
```

El escenario inicial plantea una posible divergencia entre las métricas agregadas del sistema y la experiencia operacional en piso.

Estas cifras forman parte del **escenario de investigación** y no fueron tratadas como una base de datos histórica validada.

---

# 5. Observación inicial

El escenario de investigación planteó la siguiente relación:

```text
MÉTRICA WMS
─────────────────────────
Ocupación racks      91.4 %
Pickings asignados   100 %
SLA teórico          2.5 h
─────────────────────────

             ↓

REALIDAD OPERACIONAL
─────────────────────────
Saturación de pasillos
Congestión de MHE
Mayor tiempo de ciclo
Cuellos de botella
─────────────────────────
```

La observación inicial sugería que una métrica espacial agregada podía no representar completamente la capacidad operacional efectiva.

Sin embargo:

> **La observación no permite determinar por sí misma la causa de la divergencia.**

---

# 6. Hipótesis inicial sobre slotting

El escenario planteó que el sistema podía concentrar SKUs de alta rotación de distintos inquilinos en zonas centrales para minimizar la distancia recorrida.

La hipótesis se expresa de manera neutral:

> **Se plantea como hipótesis que una estrategia de slotting orientada principalmente a minimizar la distancia individual puede concentrar demanda espacial en determinadas zonas y generar efectos de congestión que no estén representados por la métrica de distancia.**

No se afirma que esto haya ocurrido realmente en un sistema específico.

No se afirma que el algoritmo haya causado congestión.

No se afirma que la concentración sea necesariamente incorrecta.

---

# 7. Hipótesis experimentales

## H1 — Interferencia topológica

> **La concentración de pickers en determinados pasillos puede generar tiempos de espera que degraden el rendimiento individual y sistémico.**

### Evidencia requerida

* Ubicación temporal de pickers.
* Conteo de pickers por zona.
* Tiempo de inicio y finalización de tareas.
* Tiempo de espera.
* Tiempo total de picking.
* Características físicas del layout.
* Tipo de MHE utilizado.

### Indicadores

```text
Densidad de pickers por zona
Tiempo de espera por zona
Tiempo total de picking
```

### Confirmación

La hipótesis recibiría respaldo si los datos muestran una relación consistente entre:

```text
Densidad ↑
      ↓
Tiempo de espera ↑
      ↓
Tiempo de picking ↑
```

y si dicha relación se mantiene después de considerar variables relevantes del entorno.

### Falsación

La hipótesis se debilitaría o sería descartada si:

* no aparece relación significativa entre densidad y espera;
* el tiempo de picking no aumenta con la densidad;
* o los efectos desaparecen al controlar otras variables relevantes.

### Lo que no permitiría concluir

Incluso una correlación significativa no demostraría automáticamente causalidad directa.

Tampoco establecería un umbral universal de congestión.

El umbral dependería de factores como:

* ancho de pasillo;
* layout;
* tipo de MHE;
* radios de giro;
* sentidos de circulación;
* reglas operacionales;
* comportamiento de los operadores.

---

# 8. H2 — Desbalance de staging

> **La asignación de staging sin considerar la demanda simultánea de múltiples inquilinos puede generar bloqueos operacionales que afecten el flujo general.**

### Evidencia requerida

* Ocupación de staging por inquilino.
* Tiempo de permanencia.
* Tiempo de espera.
* Capacidad disponible.
* Inicio y fin de operaciones.
* Incidencias de bloqueo.
* Secuencia de despacho.

### Indicadores

```text
Ocupación de staging
Tiempo de espera
Tiempo de permanencia
Bloqueos operacionales
```

### Confirmación

La hipótesis recibiría respaldo si se observa una relación consistente entre la ocupación de staging de un inquilino y el incremento del tiempo de espera de otros.

### Falsación

La hipótesis se debilitaría o sería descartada si:

* no existe relación observable;
* los tiempos de espera permanecen independientes de la ocupación;
* o los efectos desaparecen al controlar otras variables.

### Lo que no permitiría concluir

Una relación entre ocupación y espera no demostraría:

* intención del sistema;
* incapacidad del WMS para prevenir el fenómeno;
* ni que el staging sea la causa primaria.

---

# 9. H3 — Colisión de slotting dinámico

H3 constituye la hipótesis central del expediente.

> **Una optimización que minimiza la distancia individual de picking puede producir una solución subóptima al concentrar demanda espacial y generar congestión sistémica.**

### Evidencia requerida

* Historial de slotting.
* Ubicación de cada SKU.
* Demanda por SKU.
* Demanda por inquilino.
* Distancia de picking.
* Tiempo de picking.
* Densidad de operadores.
* Tiempo de espera.
* Ocupación de zonas.
* Datos comparables entre estrategias.

### Indicadores

```text
Distancia promedio de picking
Tiempo total de picking
Densidad por zona
Tiempo de espera
Concentración de demanda
```

### Confirmación

La hipótesis recibiría respaldo si una estrategia orientada a minimizar distancia:

```text
reduce distancia
        ↓
pero aumenta concentración
        ↓
aumenta congestión
        ↓
aumenta tiempo total
```

mientras una estrategia alternativa produce un costo sistémico menor, aun recorriendo una distancia individual ligeramente superior.

### Falsación

La hipótesis se debilitaría o sería descartada si:

* la estrategia de distancia reduce simultáneamente distancia y tiempo total;
* no produce una diferencia significativa en congestión;
* o una estrategia alternativa no presenta mejora operacional.

### Lo que no permitiría concluir

Incluso si H3 recibiera respaldo, no permitiría afirmar que:

* minimizar distancia sea siempre incorrecto;
* el slotting sea la única causa de congestión;
* una estrategia determinada sea universalmente superior;
* o el fenómeno requiera modificación del kernel de FlowCore.

---

# 10. Modelo experimental

Se planteó el siguiente modelo conceptual:

```text
T_total = Σ d_i + Σ τ_espera(C(z_i))
```

donde:

```text
d_i
=
distancia recorrida por el picker i

C(z_i)
=
densidad de operadores en la zona z_i

τ_espera(C)
=
función de espera asociada a la congestión
```

La forma de la función:

```text
τ_espera = f(C)
```

se mantiene deliberadamente abierta.

No se asumió que la función sea:

```text
lineal
exponencial
logarítmica
```

ni de ninguna otra forma específica.

La forma funcional debe ser determinada por evidencia.

---

# 11. Diseño comparativo propuesto

Para H3 se planteó comparar dos estrategias:

```text
ESTRATEGIA A
Minimización de distancia individual

versus

ESTRATEGIA B
Minimización de distancia
+
distribución de demanda espacial
```

Para cada estrategia deberían observarse:

```text
Distancia promedio
Tiempo total
Densidad espacial
Tiempo de espera
Concentración de demanda
```

La comparación tendría que realizarse bajo condiciones suficientemente equivalentes para evitar que diferencias externas expliquen el resultado.

---

# 12. Variables de control

Las variables identificadas fueron:

* layout del almacén;
* ancho y configuración de pasillos;
* tipo de MHE;
* número de pickers;
* volumen de órdenes;
* demanda por SKU;
* demanda por inquilino;
* ventanas de despacho;
* prioridades;
* capacidad de staging;
* reglas de operación;
* estrategia de slotting.

La inclusión de estas variables tiene como finalidad reducir la posibilidad de atribuir al slotting un fenómeno producido por otra condición operacional.

---

# 13. Matriz de evidencia

| Hipótesis                     | Evidencia necesaria                       | Indicador principal             | Confirmación                                        | Falsación                                       |
| ----------------------------- | ----------------------------------------- | ------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| H1 — Interferencia topológica | Ubicación y tiempos de pickers            | Densidad / espera               | Densidad asociada a mayor espera y picking          | Sin relación consistente                        |
| H2 — Staging                  | Ocupación y tiempos de staging            | Ocupación / espera              | Mayor ocupación asociada a mayor espera de terceros | Sin relación consistente                        |
| H3 — Slotting                 | Historial de slotting + demanda + tiempos | Distancia / tiempo / congestión | Menor distancia pero mayor costo sistémico          | Menor distancia y menor o igual costo sistémico |

---

# 14. Criterios de falsación

Los criterios fueron establecidos antes de disponer de resultados.

Esto es importante porque evita modificar retrospectivamente la definición de éxito.

La investigación no podrá considerarse confirmada simplemente porque aparezca:

```text
congestión
```

o:

```text
alta ocupación
```

Debe existir evidencia que permita relacionar los fenómenos bajo condiciones comparables.

De igual forma, la ausencia de evidencia suficiente no será interpretada como falsación.

Debe distinguirse:

```text
NO DEMOSTRADO
        ≠
FALSADO
```

---

# 15. Evidencia disponible

Al momento de cierre de este expediente:

```text
Datos históricos internos       🔴 NO DISPONIBLES
Datos WMS                       🔴 NO DISPONIBLES
Trazas de picking              🔴 NO DISPONIBLES
Datos de ubicación              🔴 NO DISPONIBLES
Datos de staging               🔴 NO DISPONIBLES
Datos de MHE                   🔴 NO DISPONIBLES
Comparación experimental       🔴 NO REALIZADA
```

No se dispone de una base de datos operacional que permita ejecutar el protocolo.

Tampoco se dispone de un conjunto histórico suficientemente detallado para reconstruir el experimento de manera confiable.

---

# 16. Decisión metodológica

Debido a la ausencia de evidencia suficiente, la investigación queda suspendida.

La decisión es:

```text
NO FABRICAR DATOS
NO SIMULAR RESULTADOS COMO EVIDENCIA
NO DECLARAR CAUSALIDAD
NO CERRAR LAS HIPÓTESIS ARTIFICIALMENTE
```

La ausencia de datos no constituye un fracaso del laboratorio.

Constituye una condición epistemológica que limita legítimamente el alcance de la investigación.

---

# 17. Estado final de LAB-002

```text
══════════════════════════════════════════════════════
                     LAB-002
══════════════════════════════════════════════════════

Pregunta de investigación       🟢 DEFINIDA

Contexto                        🟢 DEFINIDO

H1 — Interferencia              🟢 FORMALIZADA
H2 — Staging                    🟢 FORMALIZADA
H3 — Slotting                   🟢 FORMALIZADA

Matriz de evidencia             🟢 COMPLETA
Criterios de falsación          🟢 DEFINIDOS
Protocolo experimental          🟢 DEFINIDO

Datos históricos                🔴 NO DISPONIBLES
Datos operacionales             🔴 NO DISPONIBLES
Ejecución                       🔴 NO REALIZADA
Resultados                      🔒 PENDIENTES
Conclusión                      🔒 NO EMITIDA

Causalidad                      🔒 NO DEMOSTRADA

Impacto sobre FlowCore          🟢 NINGUNO DEMOSTRADO

ESTADO                           🟡 SUSPENDIDO
══════════════════════════════════════════════════════
```

---

# 18. Condiciones para reabrir LAB-002

LAB-002 podrá reabrirse únicamente si aparece evidencia suficiente para ejecutar o reconstruir el protocolo.

Por ejemplo:

```text
Historial de WMS
        +
Tiempos de picking
        +
Ubicación de operadores
        +
Slotting histórico
        +
Demanda por SKU
        +
Datos de staging
```

La aparición de nuevos datos no implica automáticamente una conclusión.

Al reabrirse, deberá conservarse la separación entre:

```text
EVIDENCIA ORIGINAL
        ↓
NUEVO ANÁLISIS
        ↓
RESULTADO
```

La investigación no deberá modificarse retrospectivamente para hacer parecer que la evidencia siempre estuvo disponible.

---

# 19. Posibles estados futuros

LAB-002 puede evolucionar a cualquiera de los siguientes estados:

```text
                    LAB-002
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      REABRIR       CERRAR       REPLANTEAR
          │            │            │
       datos       evidencia      nueva
       nuevos       insuficiente  formulación
```

Ninguna de estas posibilidades debe asumirse anticipadamente.

---

# 20. Relación con FlowCore

LAB-002 no ha demostrado una necesidad constitucional.

No se justifica modificar:

```text
State<C>
Transition<C,L,A,E>
FenceEpoch
NormativeContent
DomainLaw
```

Tampoco se justifica introducir:

```text
Capacity
Congestion
Picker
Staging
Slotting
Resource
OperationalState
```

dentro del kernel.

El laboratorio puede continuar estudiando estos conceptos en su propio dominio sin convertirlos automáticamente en conceptos constitutivos de FlowCore.

---

# 21. Principio de no transferencia automática

LAB-002 establece una separación explícita:

```text
FENÓMENO OPERACIONAL
        ≠
CONCEPTO DEL KERNEL
```

La existencia de un fenómeno logístico interesante no constituye por sí misma una razón para introducir una nueva entidad o relación en FlowCore.

Debe existir una investigación independiente que demuestre:

1. existencia conceptual;
2. irreducibilidad;
3. necesidad de representación;
4. necesidad de pertenencia al kernel;
5. compatibilidad con la Constitución existente.

Mientras esa demostración no exista:

```text
CONCEPTO OPERACIONAL
        ↓
LABORATORIO
        ↓
FUERA DEL KERNEL
```

---

# 22. Lección metodológica

LAB-002 deja una conclusión metodológica, pero no una conclusión sobre sus hipótesis.

La lección es:

> **Una hipótesis bien formulada no equivale a una hipótesis demostrada.**

Y:

> **Un protocolo experimental completo no equivale a un experimento ejecutado.**

Finalmente:

> **La ausencia de evidencia debe detener la inferencia antes de que la imaginación ocupe el lugar de los datos.**

---

# 23. Trazabilidad

El expediente conserva la evolución de LAB-002 hasta su límite legítimo:

```text
OBSERVACIÓN
    ↓
PREGUNTA
    ↓
HIPÓTESIS
    ↓
MATRIZ DE EVIDENCIA
    ↓
CRITERIOS DE FALSACIÓN
    ↓
PROTOCOLO
    ↓
AUSENCIA DE DATOS
    ↓
SUSPENSIÓN
```

Por tanto:

> **LAB-002 no quedó inconcluso por falta de metodología; quedó suspendido porque la metodología llegó al punto donde necesitaba evidencia que no estaba disponible.**

---

# 24. Estado del Laboratorio de Realidad Operacional

Después de LAB-002:

```text
LAB-001
🟢 DOCUMENTADO
Caso de capacidad nominal vs viabilidad operacional


LAB-002
🟡 SUSPENDIDO
Hipótesis de congestión, staging y slotting
sin evidencia operacional suficiente


LAB-003
🟢 DOCUMENTADO
Caso histórico de capacidad efectiva
durante la crisis del Mar Rojo
```

El laboratorio conserva tanto los casos con evidencia como los casos que debieron detenerse por insuficiencia de información.

---

# 25. Principio final

LAB-002 queda cerrado únicamente en cuanto a su **estado documental actual**.

No queda cerrada ninguna de sus hipótesis.

No queda demostrada ninguna causalidad.

No queda descartada ninguna hipótesis.

No se emite una conclusión operacional definitiva.

El estado correcto es:

```text
LAB-002
     │
     ▼
INVESTIGACIÓN DISEÑADA
     │
     ▼
EVIDENCIA INSUFICIENTE
     │
     ▼
SUSPENSIÓN METODOLÓGICA
     │
     ▼
ESPERA DE DATOS
```

El expediente permanece disponible para futura reapertura si la realidad proporciona evidencia suficiente.

```text
El laboratorio no inventa.
El protocolo no sustituye al dato.
La hipótesis no sustituye a la evidencia.
La ausencia de evidencia no se convierte en conclusión.

El dominio habla.
El laboratorio escucha.
La evidencia decide.
FlowCore permanece en reposo.
```

🐉🔬🏛️

**Fin del expediente LAB-002.**
