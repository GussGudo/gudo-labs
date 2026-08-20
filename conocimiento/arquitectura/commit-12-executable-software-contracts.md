# Commit #12 — Contratos Executables de Software, Puertos, Adaptadores y Reconciliación Epistémica v1.0

> **Principio Maestro**
>
> FlowCore nunca convierte la incertidumbre en un hecho simplemente porque el sistema necesita una respuesta.
>
> La frontera de software debe preservar la diferencia entre intención, transmisión, aceptación, ejecución, observación y conocimiento.

---

## 1. Propósito

Este documento define la frontera ejecutable entre el Kernel de FlowCore y los sistemas externos que reciben, transmiten, procesan, ejecutan o reportan acciones operacionales.

El objetivo es establecer contratos capaces de operar bajo condiciones reales de sistemas distribuidos:

* pérdida de mensajes;
* reintentos;
* duplicación;
* concurrencia;
* respuestas ambiguas;
* consistencia eventual;
* pérdida de observabilidad;
* divergencia semántica;
* fallos de compensación;
* revocaciones durante la transmisión;
* ejecución física no reversible;
* contradicciones entre fuentes de información.

El sistema debe conservar la trazabilidad causal sin convertir una afirmación técnica en un hecho material no demostrado.

---

## 2. Continuidad Arquitectónica

Los commits anteriores establecen la progresión conceptual del Kernel:

```text
#08 — WHAT EXISTS
      Realidad material + evidencia

#09 — WHAT CAN ACT
      Recursos + capacidades + restricciones

#10 — WHAT HAPPENS
      Intención + ejecución + observación + evaluación

#11 — WHO MAY ACT
      Política + autoridad + autorización + estabilidad

#12 — HOW INTENT CROSSES THE SOFTWARE BOUNDARY
      Command
        ↓
      DeliveryAttempt
        ↓
      ExternalPort / Adapter
        ↓
      Acceptance / ExternalClaim
        ↓
      PhysicalExecution
        ↓
      PhysicalEvidence
        ↓
      Reconciliation
```

El Commit #12 no sustituye los modelos anteriores.

Define la frontera mediante la cual una intención autorizada puede intentar producir efectos fuera del Kernel.

---

# 3. Principio de Separación de Capas

FlowCore debe distinguir explícitamente:

```text
DOMAIN / GOVERNANCE
    Proposal
       ↓
    Decision
       ↓
    Authorization
       ↓

SOFTWARE BOUNDARY
    Command
       ↓
    DeliveryAttempt
       ↓
    ExternalPort / Adapter
       ↓
    Acceptance / ExternalClaim
       ↓

MATERIAL REALITY
    PhysicalExecution
       ↓
    PhysicalEvidence
       ↓

EPISTEMIC SPACE
    KnowledgeState
       ↓
    Reconciliation
```

Ninguna capa puede reclamar automáticamente la autoridad ontológica de otra.

En particular:

```text
Acceptance ≠ Execution

ExternalClaim ≠ PhysicalEvidence

KnowledgeState ≠ ExecutionState

CancellationRequest ≠ PhysicalCancellation

CompensatingAction ≠ Rollback
```

---

# 4. Axiomas de la Frontera de Software

## Axioma 1 — Aislamiento Operacional

La red, los protocolos de transporte, los brokers, las APIs y los sistemas externos constituyen fronteras no confiables.

FlowCore gobierna sus propios estados, contratos y autorizaciones, pero no asume control directo sobre sistemas externos ni sobre la realidad física.

---

## Axioma 2 — Asimetría Epistémica

Una confirmación de transporte demuestra comunicación o aceptación contractual, pero no demuestra por sí misma la ejecución física.

```text
HTTP 200 OK
    ↓
Communication / Acceptance

NO IMPLICA

Physical Execution
```

---

## Axioma 3 — Irreversibilidad Física

Los sistemas de software pueden eliminar estados lógicos, revertir transacciones o cancelar operaciones internas.

La realidad material no proporciona necesariamente una operación equivalente a `rollback`.

Toda acción destinada a neutralizar un efecto físico previo debe considerarse una nueva acción operacional y someterse nuevamente a gobernanza.

---

# 5. Las 9 Leyes Invariantes de la Frontera

## Ley 1 — Acceptance

> **Acceptance proves communication, not execution.**

La aceptación demuestra que una infraestructura externa recibió, validó o registró una solicitud de acuerdo con su contrato.

No demuestra que la acción haya ocurrido físicamente.

---

## Ley 2 — Evidence

> **Execution requires evidence.**

Un estado `EXECUTED` requiere evidencia suficiente conforme a las reglas del dominio.

Una respuesta HTTP, por sí sola, no constituye evidencia física salvo que el propio dominio haya establecido explícitamente que dicha fuente posee autoridad suficiente para ese hecho.

---

## Ley 3 — Reconciliation

> **Reconciliation preserves disagreement until causality is established.**

La reconciliación no debe fabricar una explicación cuando las fuentes son incompatibles.

Si no existe causalidad demostrable:

```text
DISAGREEMENT → PRESERVE
```

y no:

```text
DISAGREEMENT → GUESS
```

---

## Ley 4 — Authority Boundary

> **FlowCore governs the transitions it controls; it does not invent authority over systems it does not control.**

La autorización interna puede ser revocada por FlowCore.

La cancelación de un efecto externo depende de las capacidades contractuales del puerto.

---

## Ley 5 — Compensation

> **A compensating action is a new governed action, not a guaranteed rollback.**

Una `CompensatingAction` posee:

* nueva identidad;
* nueva autorización;
* nuevo riesgo;
* nuevo ciclo de entrega;
* nuevas posibilidades de fallo;
* nueva evidencia de ejecución.

No representa una operación mágica de restauración.

---

## Ley 6 — Knowledge Degradation

> **Loss of observation degrades knowledge; it does not manufacture a fact.**

La pérdida de telemetría no significa automáticamente:

```text
STOPPED
FAILED
EXECUTED
```

Puede significar únicamente:

```text
UNKNOWN
STALE
CONFLICTING
```

---

## Ley 7 — Semantic Integrity

> **Successful transport does not prove semantic preservation of intent.**

Un mensaje puede ser transportado correctamente y aun así ser interpretado incorrectamente por el sistema receptor.

Por lo tanto:

```text
Transport Success ≠ Semantic Success
```

---

## Ley 8 — Irreversibility

> **Reconciliation cannot rewrite an irreversible fact; it governs its actionable consequences.**

Cuando un hecho físico irreversible ya ocurrió, FlowCore no modifica la historia para hacerla coincidir con la autorización original.

Registra:

1. lo autorizado;
2. lo transmitido;
3. lo reclamado;
4. lo observado;
5. la desviación;
6. las consecuencias gobernables.

---

## Ley 9 — Causal Identity

> **Operational intent has immutable identity independent of its delivery attempts.**

La identidad de la intención pertenece al `Command`.

Los reintentos pertenecen al mecanismo de entrega.

```text
CommandId
    │
    ├── DeliveryAttempt #1
    ├── DeliveryAttempt #2
    ├── DeliveryAttempt #3
    └── DeliveryAttempt #N
```

Un retry nunca crea una nueva intención operacional.

---

# 6. Entidades Fundamentales

## 6.1 Command

`Command` representa una intención operacional autorizada que cruza la frontera del software.

Propiedades conceptuales:

```text
CommandId
AuthorizationId
Intent
Target
CreatedAt
ValidityWindow
```

El `CommandId` permanece inmutable durante todo el ciclo causal.

---

## 6.2 CommandId

`CommandId` identifica de manera única una intención operacional.

La unicidad y no reutilización son invariantes del dominio.

UUIDv7, ULID u otros mecanismos pueden utilizarse como implementación técnica, pero no constituyen la regla de dominio.

```text
Domain Rule:
CommandId must never be reused.
```

La expiración de la validez operacional no implica la expiración de la identidad histórica.

---

## 6.3 DeliveryAttempt

`DeliveryAttempt` representa un intento específico de transportar un `Command` hacia una frontera externa.

Cada intento puede contener:

```text
DeliveryAttemptId
CommandId
AttemptNumber
SentAt
Transport
Destination
Result
ReceivedAt
```

Un `DeliveryAttempt` no posee autoridad para modificar la identidad causal del comando.

---

## 6.4 IdempotencyKey

La `IdempotencyKey` debe estar vinculada al `CommandId`, no al `DeliveryAttemptId`.

```text
IdempotencyKey = function(CommandId)
```

Por lo tanto:

```text
Command CMD-8472
    ↓
IdempotencyKey IK-CMD-8472
    ├── Attempt #1
    ├── Attempt #2
    └── Attempt #3
```

La existencia de una `IdempotencyKey` interna no garantiza que el proveedor externo respete dicha propiedad.

---

## 6.5 ExternalClaim

`ExternalClaim` representa una afirmación realizada por un sistema externo.

Ejemplos:

```text
HTTP 200 ACCEPTED
JOB_QUEUED
STATUS=EXECUTED
DUPLICATE_PROCESSED
FAILED
```

Una `ExternalClaim` es información proveniente de una fuente externa.

No debe convertirse automáticamente en `PhysicalEvidence`.

---

## 6.6 PhysicalEvidence

`PhysicalEvidence` representa evidencia utilizada para establecer conocimiento sobre la realidad material.

Puede incluir:

* telemetría;
* sensores;
* firmas digitales;
* geocercas;
* registros físicos;
* dispositivos de medición;
* eventos independientes;
* fotografías;
* comprobantes;
* sistemas de control físico.

Su autoridad depende del dominio.

---

# 7. Separación entre ExecutionState y KnowledgeState

Una de las invariantes centrales de este commit es que:

```text
ExecutionState ≠ KnowledgeState
```

El primero describe el estado del proceso o hecho material.

El segundo describe lo que FlowCore puede afirmar justificadamente sobre dicho estado.

---

# 8. ExecutionState

`ExecutionState` representa el estado operacional conocido o determinado del proceso de ejecución.

Estados mínimos:

```text
PENDING
DISPATCHED
EXECUTING
PARTIALLY_EXECUTED
EXECUTED
FAILED
DIVERGED
INTERRUPTED
```

No todos los estados deben estar disponibles para todos los dominios.

El modelo concreto debe ser restringido por las reglas del dominio correspondiente.

---

# 9. KnowledgeState

`KnowledgeState` representa la condición epistemológica de la información disponible.

Estados mínimos:

```text
CONFIRMED
STALE
UNKNOWN
CONFLICTING
DEVIATED
EFFECT_UNCERTAIN
IRREVERSIBLE_FACT
```

### CONFIRMED

Existe evidencia suficiente para sostener la afirmación conforme a las reglas del dominio.

### STALE

Existe información previa, pero ha superado su ventana de frescura.

### UNKNOWN

No existe información suficiente para determinar el estado actual.

### CONFLICTING

Existen afirmaciones incompatibles sin causalidad suficiente para resolverlas.

### DEVIATED

La ejecución observada difiere de la intención autorizada.

### EFFECT_UNCERTAIN

Existe evidencia de que una operación pudo haber producido un efecto, pero no es posible determinar todavía cuál fue el resultado.

### IRREVERSIBLE_FACT

Existe evidencia suficiente de que un hecho material irreversible ocurrió.

---

# 10. Tetralogía Temporal

FlowCore debe evitar asumir que el orden de recepción equivale al orden causal.

Los eventos pueden contener cuatro dimensiones temporales:

| Campo         | Significado                                                 |
| ------------- | ----------------------------------------------------------- |
| `OccurredAt`  | Momento declarado en el origen                              |
| `ObservedAt`  | Momento en que la evidencia fue observada/capturada         |
| `ReceivedAt`  | Momento en que FlowCore recibió la información              |
| `EffectiveAt` | Momento o ventana en que el hecho posee validez operacional |

Estos campos no son intercambiables.

```text
OccurredAt ≠ ReceivedAt
ObservedAt ≠ ReceivedAt
EffectiveAt ≠ ReceivedAt
```

El orden de llegada de mensajes no debe utilizarse como prueba automática de causalidad.

---

# 11. Calidad Temporal

Una fuente externa puede proporcionar información temporal de distinta calidad.

El sistema puede clasificarla mediante atributos como:

```text
NTP_SYNCED
HARDWARE_RTC
SERVER_CLOCK
CLIENT_CLOCK
UNTRUSTED_CLIENT
UNKNOWN
```

La calidad temporal debe considerarse al evaluar causalidad.

Un timestamp externo no adquiere autoridad únicamente por existir.

---

# 12. ExternalPort y Adapter

Todo sistema externo debe ser accesible mediante un `ExternalPort`.

El `Adapter` implementa técnicamente dicho puerto.

El puerto define el contrato que el dominio espera.

El adaptador conoce:

* protocolos;
* DTOs;
* autenticación;
* transporte;
* serialización;
* reintentos;
* timeouts;
* mecanismos externos de idempotencia;
* capacidades de cancelación;
* modelos de consistencia.

El adaptador no debe convertirse en autoridad del dominio.

---

# 13. Capacidades del Puerto

Las capacidades técnicas relevantes deben declararse explícitamente.

```typescript
interface ExternalPortCapability {
  cancellationCapability:
    | 'SUPPORTED'
    | 'CONDITIONAL'
    | 'UNSUPPORTED'
    | 'UNKNOWN';

  idempotencyCapability:
    | 'GUARANTEED'
    | 'BEST_EFFORT'
    | 'UNSUPPORTED'
    | 'UNKNOWN';

  consistencyModel:
    | 'STRONG'
    | 'EVENTUAL'
    | 'UNKNOWN';

  contractVersion: string;
}
```

La declaración de capacidades permite al Kernel seleccionar una estrategia compatible con las garantías reales del proveedor.

---

# 14. Idempotencia Asimétrica

La idempotencia debe analizarse en dos niveles:

```text
INTERNAL IDEMPOTENCY
        ≠
EXTERNAL IDEMPOTENCY GUARANTEE
```

FlowCore puede garantizar que sus retries compartan el mismo `CommandId`.

No puede garantizar que un proveedor externo implemente correctamente la deduplicación.

Por ello:

### GUARANTEED

El proveedor declara una garantía contractual de idempotencia.

Los retries pueden ser considerados seguros bajo los límites del contrato.

### BEST_EFFORT

El proveedor intenta deduplicar, pero la garantía no es absoluta.

Los retries pueden requerir consulta previa o reconciliación.

### UNSUPPORTED

El proveedor no garantiza idempotencia.

Los retries automáticos que puedan producir efectos duplicados deben estar restringidos.

### UNKNOWN

La garantía no puede establecerse.

El sistema debe tratar la operación como incierta hasta obtener información suficiente.

---

# 15. Preservación Semántica

El adaptador debe preservar la intención del dominio al convertirla al contrato externo.

```text
DomainIntent
      ↓
Semantic Mapping
      ↓
ExternalDTO
```

La traducción debe ser verificable.

Si la traducción no preserva la semántica:

```text
SEMANTIC_CONTRACT_MISMATCH
```

Debe impedirse el despacho cuando el riesgo sea incompatible con las políticas del dominio.

Un:

```text
HTTP 200
```

no corrige un error semántico.

---

# 16. Versionado de Contratos

Todo comando externo debe asociarse a una versión contractual explícita.

```text
Command
 ├── DomainVersion
 ├── ContractVersion
 └── AdapterVersion
```

El adaptador debe validar compatibilidad antes del despacho.

Cuando exista una incompatibilidad:

```text
CONTRACT_VERSION_MISMATCH
```

o:

```text
SEMANTIC_CONTRACT_MISMATCH
```

El sistema no debe asumir compatibilidad únicamente porque el payload sea sintácticamente válido.

---

# 17. Revocación y CancellationRequest

Una revocación interna afecta la autorización dentro de FlowCore.

```text
Authorization
    ↓
REVOKED
```

Sin embargo:

```text
Authorization Revoked
        ≠
Physical Action Cancelled
```

Cuando el comando ya cruzó la frontera, FlowCore puede emitir:

```text
CancellationRequest
```

La efectividad de esa solicitud depende de las capacidades contractuales del `ExternalPort`.

---

# 18. Carrera entre Command y CancellationRequest

Una cancelación puede llegar después de que el comando haya sido procesado.

Por ejemplo:

```text
t0  Command sent
t1  Authorization revoked
t2  CancellationRequest sent
t3  External system executes Command
t4  CancellationRequest arrives
```

No existe garantía de que el orden lógico interno de FlowCore coincida con el orden físico de recepción externo.

Por lo tanto, la arquitectura debe conservar ambos hechos:

```text
Authorization = REVOKED
Command = DELIVERED / EXECUTED
```

La contradicción se resuelve mediante reconciliación y gobernanza, no mediante reescritura histórica.

---

# 19. CompensatingAction

Cuando la cancelación no puede detener un efecto externo, puede ser necesaria una `CompensatingAction`.

Una compensación:

* posee nuevo `CommandId`;
* requiere nueva `Authorization`;
* posee nuevo riesgo;
* puede fallar;
* puede requerir nueva evidencia;
* puede producir nuevos efectos;
* puede necesitar una nueva compensación.

Por lo tanto:

```text
Compensation ≠ Rollback
```

La compensación forma parte del ciclo operacional normal del dominio.

---

# 20. Fallo de la Compensación

Si una compensación produce:

```text
TIMEOUT
500
503
UNKNOWN
DELIVERY_UNKNOWN
```

FlowCore no debe declarar:

```text
ROLLED_BACK
```

sin evidencia suficiente.

El estado epistemológico puede degradarse a:

```text
EFFECT_UNCERTAIN
```

o:

```text
UNKNOWN
```

dependiendo del conocimiento disponible.

La compensación fallida debe regresar al ciclo de evaluación y gobernanza.

---

# 21. Pérdida de Observabilidad

La ausencia de telemetría no constituye automáticamente una transición de ejecución.

Por ejemplo:

```text
11:00 ACCEPTED
11:05 TELEMETRY AVAILABLE
11:30 TELEMETRY LOST
12:00 TTL EXPIRED
```

El sistema no puede concluir:

```text
STOPPED
FAILED
EXECUTED
```

únicamente porque dejó de recibir información.

Debe representar:

```text
KnowledgeState = STALE
```

o:

```text
KnowledgeState = UNKNOWN
```

según el contexto.

---

# 22. Knowledge Degradation

La pérdida progresiva de información puede representarse conceptualmente como:

```text
CONFIRMED
    ↓
STALE
    ↓
UNKNOWN
```

La transición no describe necesariamente un cambio físico.

Describe un deterioro del conocimiento del Kernel.

Esta distinción es obligatoria.

---

# 23. Claims Contradictorios

Un proveedor puede presentar información inconsistente debido a:

* réplicas;
* consistencia eventual;
* caches;
* particiones de red;
* retrasos;
* relojes divergentes;
* errores de sincronización.

Ejemplo:

```text
Replica A → IN_PROGRESS
Replica B → NOT_FOUND
```

FlowCore no debe seleccionar arbitrariamente una respuesta como verdadera.

Debe registrar:

```text
KnowledgeState = CONFLICTING
```

y conservar las reclamaciones individuales.

---

# 24. Autoridad de Evidencia

No existe una fuente universalmente superior.

La autoridad de una evidencia depende del dominio.

Por ejemplo:

```text
Cold Chain
    Temperature Sensor
        > Generic Software Report

Legal Delivery
    Recognized Digital Signature
        > Estimated Geofence

Vehicle Position
    Certified Physical Sensor
        > Unverified External Claim
```

La precedencia debe definirse mediante políticas del dominio.

No debe reducirse a una fórmula universal.

---

# 25. ReconciliationEngine

El `ReconciliationEngine` es un mecanismo de comparación y preservación de conocimiento.

No es un generador arbitrario de verdades.

Su función conceptual es:

```text
Authorized Intent
        +
External Claims
        +
Physical Evidence
        +
Temporal Context
        +
Authority Rules
        ↓
Reconciliation
        ↓
Knowledge State
```

---

# 26. Regla Fundamental de Reconciliación

> **La Reconciliación no es un segundo cerebro que inventa verdades. Es un espejo epistemológico.**

Su función es:

1. comparar;
2. identificar coincidencias;
3. identificar divergencias;
4. preservar contradicciones;
5. evaluar causalidad;
6. determinar si existe evidencia suficiente;
7. producir conocimiento explícito;
8. derivar consecuencias gobernables.

No debe inventar causas.

---

# 27. Triple Espacio de Afirmaciones

La reconciliación debe poder distinguir:

```text
AUTHORIZED INTENT
       │
       ├── Expected: Route-B
       │
       ▼
EXTERNAL CLAIM
       │
       ├── Reported: Route-B / EXECUTED
       │
       ▼
PHYSICAL EVIDENCE
       │
       └── Observed: Route-C
```

El resultado no debe reemplazar ninguna de las tres afirmaciones.

Debe conservarlas.

---

# 28. Deviation

Cuando existe divergencia:

```text
Expected State ≠ Observed State
```

FlowCore genera una `Deviation`.

Una `Deviation` debe conservar:

```text
DeviationId
CommandId
ExpectedState
ObservedState
ExternalClaims
EvidenceSet
DetectedAt
KnowledgeSnapshotId
CausalStatus
```

La causa puede permanecer:

```text
UNKNOWN
```

hasta que exista evidencia suficiente.

---

# 29. ReconciliationResult

Una reconciliación puede producir:

```text
MATCH
DEVIATION_DETECTED
CONFLICTING_EVIDENCE
INSUFFICIENT_EVIDENCE
EFFECT_UNCERTAIN
IRREVERSIBLE_DEVIATION
```

El resultado no debe borrar las observaciones originales.

---

# 30. Anti-Churning

La reconciliación no debe producir ciclos infinitos ante la misma evidencia.

Cada evaluación debe poder asociarse a:

```text
KnowledgeSnapshotId
EvidenceSetId
ReconciliationId
```

Si exactamente el mismo conjunto de conocimiento ya fue evaluado y no existe nueva información causal:

```text
RECONCILIATION_NO_CHANGE
```

Esto evita que el sistema convierta la incertidumbre persistente en actividad infinita.

---

# 31. Irreversibilidad Material

Cuando ocurre un hecho irreversible:

```text
Physical Fact
      ↓
Evidence
      ↓
Reconciliation
```

FlowCore no debe intentar modificar el pasado.

Ejemplo:

```text
Authorized:
OpenValve(V-01)

Observed:
OpenValve(V-02)

Physical consequence:
Chemical released
```

La reconciliación registra:

```text
IRREVERSIBLE_DEVIATION
```

y conserva:

```text
Authorized Intent
Observed Execution
Physical Consequence
Evidence
```

---

# 32. Gobernanza Posterior a un Hecho Irreversible

La reconciliación transmite la consecuencia al sistema de gobernanza del Commit #11.

```text
Reconciliation
      ↓
Deviation
      ↓
Evaluation
      ↓
Proposal
      ↓
Decision
      ↓
Authorization
      ↓
New Governed Action
```

La acción posterior puede estar orientada a:

* contención;
* mitigación;
* recuperación;
* seguridad;
* reparación;
* investigación;
* suspensión;
* compensación contractual.

Nunca representa una modificación del hecho histórico.

---

# 33. Invariantes DDD / Hexagonales

Los adaptadores no poseen autoridad sobre invariantes de dominio.

```text
Domain
  │
  │ Port
  ▼
Adapter
  │
  ▼
External System
```

El flujo de información puede regresar:

```text
External System
  │
  ▼
Adapter
  │
  ▼
Port
  │
  ▼
Domain
```

Pero la información externa entra como:

```text
Claim
Observation
Evidence
Result
```

y no como una orden directa para mutar arbitrariamente el dominio.

---

# 34. Responsabilidad del Domain

El dominio determina:

* qué constituye una intención válida;
* qué constituye una autorización válida;
* qué estados son legítimos;
* qué evidencia posee autoridad;
* qué divergencias son relevantes;
* qué acciones compensatorias son permitidas;
* qué riesgos requieren gobernanza adicional.

---

# 35. Responsabilidad del Adapter

El adaptador determina:

* cómo transportar;
* cómo serializar;
* cómo autenticar;
* cómo interpretar códigos técnicos;
* cómo realizar retries permitidos;
* cómo consultar estados externos;
* cómo traducir DTOs;
* cómo aplicar capacidades declaradas del puerto.

El adaptador no debe decidir por sí mismo que una operación física fue ejecutada.

---

# 36. Regla de No Confusión

Los siguientes pares nunca deben fusionarse:

```text
CommandId
    ≠
DeliveryAttemptId

Authorization
    ≠
CancellationRequest

ExternalClaim
    ≠
PhysicalEvidence

ExecutionState
    ≠
KnowledgeState

CompensatingAction
    ≠
Rollback

InternalIdempotency
    ≠
ExternalGuarantee
```

Estos límites constituyen invariantes arquitectónicas.

---

# 37. Estados de Incertidumbre

La incertidumbre debe ser explícita.

Estados como:

```text
UNKNOWN
STALE
CONFLICTING
EFFECT_UNCERTAIN
```

no representan errores de diseño.

Representan estados válidos del conocimiento.

El sistema debe preferir:

```text
UNKNOWN
```

sobre una afirmación falsa.

---

# 38. Principio de No Fabricación Epistémica

> **FlowCore never converts uncertainty into fact merely because the system needs an answer.**

La necesidad operacional de una respuesta no constituye evidencia.

Si el sistema necesita tomar una decisión bajo incertidumbre, dicha decisión debe pasar por el mecanismo de gobernanza correspondiente y conservar explícitamente la incertidumbre que la motivó.

---

# 39. Prueba de Choque Integrada

El modelo debe resistir simultáneamente:

```text
1. Retry
2. Duplicate delivery
3. Lost ACK
4. Delayed ACK
5. Revoked authorization
6. Late cancellation
7. Failed compensation
8. Lost telemetry
9. Eventual consistency
10. Contradictory claims
11. Semantic contract drift
12. Partial execution
13. Human intervention
14. Irreversible physical effect
```

En todos los casos, el sistema debe conservar:

```text
Causal Identity
Authorization History
Delivery History
External Claims
Physical Evidence
Knowledge State
Reconciliation Result
Governance Consequences
```

---

# 40. Prueba de Consistencia Arquitectónica

## ¿Un retry crea una nueva intención?

No.

```text
CommandId permanece constante.
DeliveryAttemptId cambia.
```

## ¿Un HTTP 200 demuestra ejecución?

No.

```text
Acceptance ≠ Execution
```

## ¿La pérdida de telemetría demuestra que el activo se detuvo?

No.

```text
Loss of Observation ≠ State Change
```

## ¿Una compensación es rollback?

No.

```text
Compensation = New Governed Action
```

## ¿Una réplica externa contradictoria debe resolverse arbitrariamente?

No.

```text
Conflict → Preserve Disagreement
```

## ¿Una acción física irreversible puede deshacerse mediante software?

No necesariamente.

```text
Irreversible Fact → Govern Consequences
```

## ¿Un payload sintácticamente válido garantiza preservación semántica?

No.

```text
Transport Success ≠ Semantic Success
```

---

# 41. Límites del Commit #12

Este commit no define:

* algoritmos específicos de retry;
* proveedores concretos;
* protocolos específicos de transporte;
* implementación de brokers;
* bases de datos;
* mecanismos físicos particulares;
* lógica de negocio específica;
* políticas regulatorias concretas.

Este commit define las invariantes que deberán respetar esas implementaciones.

---

# 42. Relación con los Commits Anteriores

```text
#08
WHAT EXISTS
    ↓
What is real?

#09
WHAT CAN ACT
    ↓
What can operate?

#10
WHAT HAPPENS
    ↓
What happens and how is it observed?

#11
WHO MAY ACT
    ↓
Who is authorized to act?

#12
HOW INTENT CROSSES THE SOFTWARE BOUNDARY
    ↓
How does authorized intent become an executable request
without confusing communication, execution and knowledge?
```

---

# 43. Principios de Cierre

La frontera ejecutable de FlowCore queda definida por las siguientes relaciones:

```text
Intent
    ≠
Command
    ≠
DeliveryAttempt
    ≠
Acceptance
    ≠
Execution
    ≠
Observation
    ≠
Knowledge
```

Cada etapa posee una identidad, autoridad y responsabilidad diferente.

La arquitectura debe preservar esas diferencias incluso bajo:

* fallos;
* concurrencia;
* pérdida de mensajes;
* retrasos;
* duplicación;
* contradicciones;
* degradación de observabilidad;
* errores de terceros;
* efectos físicos irreversibles.

---

# 44. Declaración Final

> **FlowCore governs intent, authorization, contracts and reconciliation within the boundaries of its authority.**
>
> **It does not confuse communication with execution, claims with evidence, or lack of knowledge with a fact.**
>
> **When reality and expectation disagree, FlowCore preserves the disagreement until sufficient causal evidence exists to justify a conclusion.**
>
> **When an irreversible fact occurs, FlowCore does not rewrite history; it governs the consequences.**

---

## Estado del documento

```text
Commit: #12
Nombre: Executable Software Contracts, Ports, Adapters & Epistemic Reconciliation
Versión: v1.0
Estado: ARCHITECTURE DRAFT
Dependencias:
  #08 — Physical Reality & Evidence
  #09 — Resources, Capacity & Eligibility
  #10 — Execution, Observation & Operational Causality
  #11 — Authority Policy & Decision Governance
```

Este documento establece las invariantes conceptuales de la frontera ejecutable de FlowCore y constituye la base para futuras implementaciones de `ExternalPort`, `Adapter`, `Command`, `DeliveryAttempt` y `ReconciliationEngine`.
