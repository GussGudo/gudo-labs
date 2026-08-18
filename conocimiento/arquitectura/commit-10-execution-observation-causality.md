# Execution, Observation, Epistemology & Operational Causal Chain
## Modelo de Ejecución, Observación, Epistemología y Causalidad Operacional v1.0 — Gudo Labs / FlowCore

---

## 1. Propósito

Este documento define el modelo ontológico de ejecución operacional de FlowCore.

Establece cómo el sistema mantiene explícita la relación entre:

- `Intent`
- `Plan`
- `Task`
- `Assignment`
- `Execution`
- `Observation`
- `KnowledgeState`
- `Deviation`
- `Evaluation`
- `Proposal`
- `Decision`
- `Action`
- `Outcome`
- `Evidence`

El objetivo fundamental es evitar que FlowCore confunda:

- intención con planificación,
- planificación con ejecución,
- observación con realidad absoluta,
- inferencia con hecho,
- propuesta con autoridad,
- desviación con excepción,
- y resultado con modificación retroactiva de la historia.

### Axioma Fundamental de Ejecución

> **"The past is immutable. The present is observable. The future is revisable."**

> *El pasado es inmutable. El presente es observable. El futuro es revisable.*

FlowCore no intenta mantener la realidad alineada artificialmente con un plan.

FlowCore mantiene explícita la relación entre **Intent, Plan, Execution, Observation y Decision** mientras la realidad evoluciona.

---

## 2. Alcance

### Dentro del Alcance (In Scope)

- Persistencia conceptual del `Intent` independientemente del éxito o fracaso de un `Plan`.
- Versionamiento inmutable de `Plan`.
- Distinción entre proyección futura, ejecución presente y evidencia histórica.
- Modelado temporal de `Task`.
- Ejecución concurrente frente a modificaciones de planificación.
- Observaciones provenientes de telemetría, sensores, sistemas externos y operadores humanos.
- Distinción entre `Fact`, `Inference` y `Unknown`.
- Estados epistemológicos de conocimiento.
- Cálculo contextual de `Deviation`.
- Evaluación de desviaciones y riesgo operacional.
- Separación entre `Proposal` y `Decision`.
- Cadena causal operacional trazable.
- Acciones derivadas de decisiones.
- Resultados respaldados por evidencia.
- Manejo de información tardía, contradictoria o incompleta.
- Prevención de oscilación y replanning excesivo.

### Fuera del Alcance (Explicitly Out of Scope)

- Implementación concreta de algoritmos de optimización.
- Implementación de motores de Machine Learning.
- Diseño de APIs de telemetría.
- Diseño de interfaces de usuario para despachadores.
- Persistencia física concreta de eventos.
- Implementación de bases de datos.
- Algoritmos de navegación GPS.
- Resolución geométrica 3D de carga.

---

## 3. Intent como Invariante de Negocio

`Intent` representa el objetivo de negocio que debe cumplirse.

Ejemplo:

> Entregar 120 paquetes en Zona Norte antes de las 14:00.

El `Intent` no describe:

- qué vehículo será utilizado,
- qué conductor ejecutará la operación,
- qué ruta será utilizada,
- cuántos planes serán necesarios,
- ni qué estrategia operacional será adoptada.

### Regla de Persistencia del Intent

> **El fracaso de un `Plan` no implica el fracaso del `Intent`.**

Un `Intent` puede sobrevivir:

- cancelación de un plan,
- reasignación de recursos,
- fragmentación operacional,
- pérdida de conectividad,
- desviaciones,
- excepciones,
- múltiples versiones de planificación,
- y múltiples ejecuciones concurrentes.

El `Intent` solamente cambia cuando una autoridad operacional determina que el objetivo de negocio ya no es válido, alcanzable o requerido.

---

## 4. Plan como Hipótesis Operacional

`Plan` representa una proyección de cómo se pretende alcanzar un `Intent`.

Un plan es una hipótesis operacional sobre el futuro.

```text
INTENT
  │
  ├── PLAN V1
  ├── PLAN V2
  ├── PLAN V3
  └── PLAN Vn
Cada versión de Plan conserva:
    • el Intent al que responde,
    • las condiciones conocidas al momento de su formulación,
    • los recursos proyectados,
    • las tareas esperadas,
    • las restricciones consideradas,
    • y la estrategia operacional propuesta.
Un Plan no reescribe otro Plan.
Cuando la realidad invalida una proyección futura, FlowCore puede emitir una nueva versión.
PLAN V1
  │
  ├── invalidated by observation/evaluation
  │
  ▼
PLAN V2
  │
  ├── revised future projection
  │
  ▼
PLAN V3
La existencia de Plan V2 no elimina el valor histórico de Plan V1.
Regla de Inmutabilidad del Plan
Un plan histórico explica qué se pretendía hacer en un momento determinado; una nueva versión explica qué se pretende hacer después.

## 5. Task y sus Manifestaciones Temporales
Task representa una unidad operacional de trabajo asociada al cumplimiento de un Intent.
FlowCore no modela Task como un registro mutable cuyo único significado depende de un campo status.
La misma unidad conceptual puede manifestarse temporalmente en diferentes dominios:
                    TASK
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    PROJECTION     PRESENT        PAST
       │             │             │
       ▼             ▼             ▼
      PLAN        EXECUTION    EVENT HISTORY
   Expected Task  Live Work    Recorded Facts
5.1 Task en Plan
Representa la proyección futura:
    • qué trabajo debería realizarse,
    • cuándo debería ocurrir,
    • qué recursos se esperan,
    • qué condiciones se proyectan.
5.2 Task en Execution
Representa el trabajo operacional en curso:
    • inicio real,
    • progreso observable,
    • interrupciones,
    • cambios de contexto,
    • finalización o abandono.
5.3 Task en Event History
No representa una "Task mutable".
Registra hechos ocurridos relacionados con ella:
    • TaskStarted
    • TaskCompleted
    • TaskInterrupted
    • TaskCancelled
    • TaskReassigned
    • TaskObserved
Estos hechos son inmutables.
Regla Temporal de Task
La identidad conceptual de la Task puede persistir mientras sus proyecciones, ejecuciones y hechos históricos pertenecen a dimensiones temporales distintas.

## 6. Execution como Presente Operacional
Execution representa el despliegue del trabajo en el mundo físico durante el presente operacional.
No es una copia mutable del Plan.
La relación conceptual es:
INTENT
  │
  ▼
PLAN
  │
  ▼
EXECUTION
  │
  ├── Observations
  ├── Actions
  ├── Deviations
  └── Outcomes
Una Execution puede continuar mientras una nueva versión del Plan está siendo calculada.
Regla de Ejecución Concurrente
La ejecución física no entra en pausa ontológica porque FlowCore esté calculando una nueva proyección.
Si el vehículo está detenido mientras se calcula una nueva ruta, la Execution continúa existiendo en el presente.
La realidad física puede incluso avanzar antes de que una Decision o Action alcance al recurso.

## 7. Assignment como Relación Operacional
En continuidad con el Commit #9:
Assignment representa la relación operacional vigente entre recursos y trabajo.
No constituye por sí mismo la historia completa de cómo se llegó a esa relación.
Los cambios de asignación son hechos históricos:
ResourceAssigned
ResourceReassigned
ResourceReleased
El estado operacional actual puede ser reconstruido a partir de dichos hechos.
Por lo tanto:
EVENT HISTORY
      │
      ▼
CURRENT OPERATIONAL STATE
      │
      ▼
ASSIGNMENT
Una nueva asignación no modifica retrospectivamente una asignación anterior.

## 8. Deviation no es Exception
Deviation representa una diferencia entre lo esperado y lo observado.
Ejemplo:
Expected Arrival = 10:15
Observed Arrival = 10:19

Deviation = +4 min
Una desviación es una medición.
No constituye automáticamente una excepción.
Regla Fundamental
Deviation != Exception
La clasificación depende del contexto operacional.
OBSERVED
   │
   ▼
DEVIATION
   │
   ▼
EVALUATION
   │
   ├── TOLERATED
   ├── ADAPTATION REQUIRED
   └── EXCEPTION
Una desviación pequeña puede ser tolerada.
Una desviación mayor puede requerir adaptación.
Una desviación crítica puede invalidar la estrategia operacional.
Los umbrales no pertenecen a la medición de la desviación; pertenecen a la evaluación contextual.

## 9. Observation como Evidencia Parcial
Observation representa información obtenida sobre el mundo mediante una fuente determinada.
Puede provenir de:
    • GPS,
    • sensores,
    • telemetría,
    • cámaras,
    • sistemas externos,
    • operadores humanos,
    • escáneres,
    • dispositivos móviles,
    • registros operacionales.
Una observación siempre debe conservar su contexto epistemológico:
    • fuente,
    • timestamp,
    • alcance temporal,
    • confiabilidad conocida,
    • calidad de señal,
    • y relación con otras observaciones.
Axioma Epistemológico
FlowCore no observa directamente la realidad; observa señales sobre la realidad.
Por lo tanto:
REAL WORLD
    │
    ▼
OBSERVATION
    │
    ▼
KNOWLEDGE STATE
Una observación no equivale automáticamente a una verdad absoluta.

## 10. KnowledgeState y Epistemología Abierta
FlowCore adopta explícitamente el principio:
Unknown != False
La ausencia de evidencia no constituye evidencia de ausencia.
KnowledgeState representa el estado de conocimiento disponible para una determinada proposición operacional en un momento determinado.
Estados conceptuales mínimos:
KNOWN
STALE
UNKNOWN
CONFLICTING
KNOWN
Existe evidencia suficiente y vigente para considerar la proposición operacionalmente conocida.
STALE
Existe evidencia, pero su antigüedad o decay temporal reduce su valor para decisiones presentes.
UNKNOWN
No existe evidencia suficiente para determinar el estado.
CONFLICTING
Existen fuentes relevantes que presentan afirmaciones incompatibles.
OBSERVATION A ─────┐
                   ├──► KNOWLEDGE STATE = CONFLICTING
OBSERVATION B ─────┘
Regla Epistemológica
El Kernel nunca debe convertir automáticamente UNKNOWN en FALSE ni INFERENCE en FACT.

## 11. Fact, Inference y Unknown
FlowCore distingue estrictamente entre tres categorías epistemológicas.
Fact
Información directamente respaldada por evidencia disponible.
Ejemplo:
La cámara LPR registró al vehículo cruzando la salida a las 10:15.
Inference
Conclusión derivada mediante razonamiento sobre hechos u observaciones.
Ejemplo:
El vehículo probablemente se encuentra en ruta.
La inferencia puede ser correcta, pero sigue siendo una inferencia.
Unknown
Una proposición para la cual la evidencia disponible no permite establecer una conclusión suficiente.
Ejemplo:
No sabemos si el vehículo permaneció refrigerado durante los 47 minutos sin telemetría.
Regla de Integridad Epistemológica
Inference != Fact
Una correlación temporal, una predicción algorítmica o una inferencia probabilística nunca debe promoverse automáticamente a hecho histórico.

## 12. Observation Tardía y Corrección del Conocimiento
El conocimiento disponible en el presente puede ser diferente del conocimiento disponible cuando una decisión fue tomada.
Por ejemplo:
14:00
GPS LOST
KnowledgeState = UNKNOWN
        │
        ▼
Decision made with available evidence
        │
        ▼
6 MONTHS LATER
Recovered GPS evidence
        │
        ▼
KnowledgeState updated
La nueva evidencia puede cambiar lo que FlowCore conoce actualmente.
No puede cambiar retroactivamente lo que FlowCore conocía en el momento de la decisión.
Regla de Asimetría Temporal
New evidence may revise present knowledge, but it must not rewrite historical decision context.

## 13. Evaluation como Interpretación Contextual
Evaluation interpreta observaciones, conocimiento y desviaciones frente a reglas y objetivos operacionales.
Puede considerar:
    • severidad,
    • tolerancias,
    • restricciones,
    • riesgo,
    • ventanas temporales,
    • disponibilidad,
    • criticidad de mercancía,
    • incertidumbre,
    • impacto sobre el Intent,
    • y consecuencias de no actuar.
La Evaluation no es una observación.
Es una interpretación operacional.
OBSERVATIONS
     │
     ▼
KNOWLEDGE STATE
     │
     ▼
DEVIATION
     │
     ▼
EVALUATION
Una evaluación puede concluir:
    • TOLERATED_VARIATION
    • ADAPTATION_REQUIRED
    • CRITICAL_EXCEPTION
    • CRITICAL_UNCERTAINTY
Los nombres anteriores representan categorías conceptuales y no constituyen todavía contratos de código.

## 14. Proposal no es Decision
Proposal representa una alternativa de acción sugerida por una fuente con capacidad de análisis.
Puede provenir de:
    • algoritmo de optimización,
    • sistema experto,
    • modelo predictivo,
    • IA,
    • operador humano,
    • o una combinación de ellos.
Ejemplo:
Reasignar las paradas 6 y 7 al vehículo C-09.
Una Proposal no posee autoridad operacional por el simple hecho de existir.
EVALUATION
    │
    ▼
PROPOSAL
    │
    ▼
AUTHORITY
    │
    ▼
DECISION
Regla de Autoridad
Proposal != Decision
Un algoritmo puede recomendar.
La autoridad operacional decide.

## 15. Decision como Autoridad Operacional
Decision representa el acto mediante el cual una autoridad válida determina que una alternativa operacional debe ser adoptada, rechazada o modificada.
La decisión debe conservar:
    • autoridad que decidió,
    • momento de decisión,
    • contexto epistemológico,
    • evidencia disponible,
    • evaluación que la motivó,
    • propuesta considerada,
    • y resultado autorizado.
La decisión no debe depender de información que solamente apareció posteriormente.
Regla de Contexto de Decisión
Una decisión debe ser evaluada contra el conocimiento disponible en el momento en que fue tomada.
Esto protege la trazabilidad operacional y evita la decisión retrospectiva.

## 16. Action como Consecuencia Operacional
Action representa la materialización operacional de una Decision.
DECISION
   │
   ▼
ACTION
   │
   ▼
WORLD
   │
   ▼
OBSERVATION
Una Action puede ser:
    • reasignar un recurso,
    • emitir una nueva proyección,
    • desviar una ejecución,
    • solicitar verificación física,
    • suspender una operación,
    • activar una contingencia.
La ejecución física de una acción puede ocurrir después de la decisión.
Por lo tanto, una Decision no garantiza que el mundo haya obedecido inmediatamente.

## 17. DAG Causal de Control Operacional
FlowCore modela la trazabilidad operacional como un grafo causal y no como una simple cadena lineal.
La forma conceptual mínima es:
OBSERVATION ───────┐
                   │
OBSERVATION ───────┼──► KNOWLEDGE STATE
                   │          │
OBSERVATION ───────┘          ▼
                         EVALUATION
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
             PROPOSAL                 OTHER EVALUATION
                 │                         │
                 └────────────┬────────────┘
                              ▼
                          DECISION
                              │
                              ▼
                            ACTION
                              │
                              ▼
                         OBSERVATION
El grafo permite responder preguntas como:
¿Por qué se ejecutó esta acción?
Y recorrer causalmente:
Action
  ← Decision
  ← Proposal
  ← Evaluation
  ← KnowledgeState
  ← Observations
  ← Evidence
Propiedad del DAG
La causalidad debe permanecer trazable sin permitir ciclos históricos que reescriban sus propias causas.
Las nuevas observaciones pueden desencadenar nuevas evaluaciones y decisiones, pero no alteran retrospectivamente los hechos que originaron decisiones anteriores.

## 18. Fragmentación Operacional del Plan
Un Intent no se fragmenta por el hecho de que su estrategia operacional se distribuya.
Un mismo Intent puede ser satisfecho mediante múltiples planes y ejecuciones.
                    INTENT #100
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
           PLAN V2-A             PLAN V2-B
              │                     │
              ▼                     ▼
         EXECUTION C-04        EXECUTION C-09
              │                     │
              └──────────┬──────────┘
                         ▼
                     OUTCOME
Esto permite:
    • transferencia parcial de carga,
    • múltiples vehículos,
    • múltiples conductores,
    • ejecuciones concurrentes,
    • contingencias,
    • y estrategias distribuidas.
Regla
La estrategia puede fragmentarse; el Intent permanece conceptualmente único.

## 19. Concurrente y Offline Execution
FlowCore debe aceptar que el mundo físico puede continuar operando mientras existe latencia de comunicación.
Ejemplo:
12:00:00  Decision: Abort Plan V1
12:00:03  Offline scan: Task #12 completed physically
12:00:07  Satellite command reaches vehicle
El hecho físico de las 12:00:03 no es eliminado por la decisión de las 12:00:00.
Debe registrarse como hecho observado.
Posteriormente:
EXPECTED
Task #12 = Cancelled

OBSERVED
Task #12 = Completed

DEVIATION
Execution occurred after cancellation decision
La discrepancia debe ser evaluada contextualmente.
Regla de Inercia Física
Una decisión de control no puede borrar una acción física que ya ocurrió.

## 20. Prevención de Oscilación Operacional
El ciclo de control:
OBSERVE
   ↓
EVALUATE
   ↓
PROPOSE
   ↓
DECIDE
   ↓
ACT
   ↓
OBSERVE
puede generar inestabilidad si toda desviación produce una nueva decisión.
FlowCore debe distinguir entre:
    • variación tolerable,
    • adaptación necesaria,
    • excepción crítica.
Una desviación menor no debe justificar automáticamente una nueva versión de Plan.
La estabilidad operacional tiene prioridad sobre la hiper-reactividad.
Principio de Histeresis Operacional
No toda mejora teórica justifica el costo físico de cambiar una operación que ya está en ejecución.
Los mecanismos concretos de hysteresis, cooldown, thresholding o rate limiting quedan fuera del alcance de este documento y pertenecen a futuras políticas de control.

## 21. Outcome como Resultado de Ejecución
Outcome representa el resultado operacional de una ejecución respecto del Intent.
Ejemplos conceptuales:
    • FULFILLED
    • PARTIAL_FULFILLMENT
    • FAILED
    • ABORTED
El Outcome debe estar respaldado por evidencia.
EXECUTION
    │
    ▼
OBSERVATIONS
    │
    ▼
EVIDENCE
    │
    ▼
OUTCOME
Un resultado no debe derivarse únicamente de una intención o de una proyección.
Debe existir una relación trazable entre:
Intent
  ↓
Plan
  ↓
Execution
  ↓
Observed Reality
  ↓
Outcome

## 22. Expected vs. Observed
FlowCore conserva explícitamente la diferencia entre:
Expected
Lo que el Plan proyectaba.
Ejemplo:
Expected Arrival = 10:15
Expected Temperature = -18°C
Observed
Lo que la ejecución y las fuentes de evidencia registraron.
Ejemplo:
Observed Arrival = 10:42
Observed Temperature = -12°C
La comparación produce:
EXPECTED
   │
   ├──────────────┐
   │              │
   ▼              ▼
OBSERVED       OBSERVED
   │
   ▼
DEVIATION
El valor de Expected no se modifica para hacer coincidir el histórico con Observed.

## 23. Cadena Causal Completa
La cadena de control operacional de FlowCore queda expresada conceptualmente como:
INTENT
  │
  ▼
PLAN
  │
  ▼
ASSIGNMENT
  │
  ▼
EXECUTION
  │
  ├───────────────┐
  ▼               ▼
EXPECTED       OBSERVATION
                  │
                  ▼
            KNOWLEDGE STATE
                  │
                  ▼
              DEVIATION
                  │
                  ▼
              EVALUATION
                  │
                  ▼
              PROPOSAL
                  │
                  ▼
              DECISION
                  │
                  ▼
                ACTION
                  │
                  ▼
               OBSERVE
                  │
                  └──────► nuevo ciclo
EXECUTION
    │
    ▼
  OUTCOME
    │
    ▼
  EVIDENCE
Esta cadena no debe interpretarse como una secuencia estrictamente lineal.
El control operacional real es un DAG causal donde múltiples observaciones pueden alimentar una evaluación y una acción puede generar múltiples consecuencias observables.

## 24. Las Cuatro Leyes Invariantes de FlowCore
Ley A — Invariancia del Intent
El Intent es la meta de negocio invariante; el Plan es una hipótesis operacional revisable, reemplazable y potencialmente distribuida.
Ley B — Multidimensionalidad Temporal
Task no es un registro mutable de progreso; sus manifestaciones pertenecen a la proyección del Plan, al presente de Execution y a los hechos inmutables del Event History.
Ley C — Causalidad de Control
Observation → KnowledgeState → Evaluation → Proposal → Decision → Action constituye una cadena causal trazable de control operacional.
La estructura real puede ser un DAG y no una secuencia 1:1.
Ley D — Epistemología Abierta
FlowCore debe distinguir explícitamente entre Fact, Inference, Unknown y Conflicting Knowledge.
Unknown != False.

## 25. Principios de Integridad Temporal
FlowCore adopta las siguientes reglas:
    1. El pasado no se reescribe.
    2. Una nueva observación no modifica una observación histórica.
    3. Una nueva evidencia puede modificar el conocimiento actual.
    4. Una nueva evidencia no modifica el contexto epistemológico disponible durante una decisión histórica.
    5. Un nuevo Plan no elimina versiones anteriores.
    6. Una Action no garantiza obediencia inmediata del mundo físico.
    7. Una ejecución física ocurrida offline sigue siendo un hecho válido.
    8. Una inferencia posterior no se convierte automáticamente en un hecho histórico.
    9. Una desviación no se convierte automáticamente en excepción.
    10. Una propuesta no se convierte automáticamente en decisión.

## 26. Frontera entre Modelo y Mundo Físico
FlowCore no controla directamente la realidad.
FlowCore:
OBSERVES
   ↓
INTERPRETS
   ↓
EVALUATES
   ↓
PROPOSES
   ↓
DECIDES
   ↓
ACTS
   ↓
OBSERVES AGAIN
La realidad física conserva capacidad de:
    • retrasar,
    • rechazar,
    • contradecir,
    • superar,
    • o adelantarse
a las proyecciones del sistema.
Por ello, el Kernel debe ser diseñado para aprender de la diferencia entre expectativa y realidad, no para ocultarla.

## 27. Frontera de Autoridad
FlowCore distingue entre:
    • fuente de información,
    • fuente de inferencia,
    • autoridad de decisión,
    • ejecutor físico,
    • y evidencia de resultado.
Un sensor puede observar.
Un algoritmo puede inferir.
Un optimizador puede proponer.
Un despachador puede decidir.
Un conductor puede ejecutar.
Una cámara puede evidenciar.
Ninguno debe asumir automáticamente la autoridad ontológica de los demás.

## 28. Declaración Arquitectónica
La ejecución operacional de FlowCore no constituye una simple transición de estados.
Es una interacción continua entre:
INTENT
PLAN
EXECUTION
OBSERVATION
KNOWLEDGE
EVALUATION
DECISION
ACTION
OUTCOME
donde cada dimensión conserva su responsabilidad temporal y epistemológica.
El objetivo no es construir un sistema que "siempre tenga razón".
El objetivo es construir un sistema capaz de:
    • reconocer cuándo no sabe,
    • distinguir hechos de inferencias,
    • conservar la historia,
    • explicar sus decisiones,
    • adaptarse sin perder trazabilidad,
    • y continuar operando mientras el mundo físico cambia.

## 29. Declaración de Estado
COMMIT #10 OFICIALMENTE FORMULADO, VALIDADO CONCEPTUALMENTE Y LISTO PARA CONGELACIÓN.
"The past is immutable. The present is observable. The future is revisable."
Gudo Labs Architecture Group — August 2026