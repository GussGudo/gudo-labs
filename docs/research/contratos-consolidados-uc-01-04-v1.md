# Contratos Consolidados — UC-01 a UC-04 + Integración

**Proyecto:** Gudo Labs / FlowCore
**Alcance:** Estado consolidado de ApplicationEnvelope, UC-01..UC-04 e integración FlowCore ↔ GeoWorkbench
**Versión:** v1.0 — consolidación tras cierre de 18.6.7 y 18.6.8
**Estado:** 🟢 CONSOLIDADO
**Fuente histórica:** `docs/research/fase-18.6.6-contratos-de-intercambio.md` (v0.9 revisión 4)
**Naturaleza:** Documento de consolidación vigente. No sustituye la fuente histórica. Registra lo consolidado, lo diferido y los contextos de negocio ya definidos.

---

## 0. Cómo leer este documento

- **CONSOLIDADO**: contrato con solicitud, respuesta, errores y reglas suficientes para implementar.
- **DIFERIDO**: reconocido, explícitamente fuera de v1.
- **CONTEXTO**: definición de negocio registrada para contratos futuros. No es contrato.

Regla: `CONSOLIDADO` ≠ `IMPLEMENTADO` ≠ `VERIFICADO`.

**Estado actual:** ningún contrato tiene código asociado ni verificación de ejecución.

---

## 1. ApplicationEnvelope — CONSOLIDADO

### Estructura

```
envelope {
  // Enviados por cliente
  contractVersion: string (obligatorio)
  idempotencyKey: string (obligatorio en UC con idempotencia)
  correlationId: string (opcional, servidor puede sustituir)
  declaredActor: string (no confiable, informativo)
  clientVersion: string (informativo)
  clientDeclaredTimestamp: string ISO-8601 (no confiable)

  // Enviados por servidor en respuesta
  requestId: string (servidor)
  receivedAt: string ISO-8601 (servidor)
  respondedAt: string ISO-8601 (servidor)
  processingStatus: "SUCCESS" | "ERROR"
  result: object (en SUCCESS)
  error: object (en ERROR)
}
```

### `result` / `error` / `INVALID_INPUT`

```
result: {
  outcome: string
  payload: object
}

error: {
  code: string
  message: string
  field?: string
  reasonCode?: string
  retryable: boolean
  details?: object
}

INVALID_INPUT: mismo shape de error, con `field` y `reasonCode` obligatorios.
```

### `RequestContext` (construido por servidor)

```
{
  actor: string (autenticado)
  session: string
  receivedAt: string ISO-8601
}
```

Extensible: `tenant`, `permissions[]` cuando un UC lo requiera.

### Reglas ratificadas

- `declaredActor` nunca es autoridad.
- `requestId`, `receivedAt`, `respondedAt`, `processingStatus`, `result`/`error` los genera el servidor.
- `correlationId`: validado o sustituido por servidor. No es causa de rechazo por sí mismo.
- `contractVersion` obligatoria en toda solicitud inbound.
- Identidad autenticada **no** viaja en el envelope. Se obtiene del `RequestContext`.

---

## 2. UC-01 — `InitializeScenarioCommand` — CONSOLIDADO

### Solicitud

| Campo | Tipo | Obligatorio |
|---|---|---|
| `scenarioId` | string | Sí |
| `scenarioFormatVersion` | string | No (default `"1.0"`) |
| `source` | `SYNTHETIC` \| `IMPORTED` \| `MANUAL` | Sí |
| `seed` | string | No |
| `data` | object (ver abajo) | Sí |
| Envelope | — | Sí |

### `data`

```
data {
  summary:    { vehicleCount, packageCount, stopCount, taskCount }
  vehicles:   [{ id, metadata? }]
  packages:   [{ id, metadata? }]
  stops:      [{ id, metadata? }]
  tasks:      [{ taskId, taskType, locationRef?, cargoRefs?, status, metadata }]
}
```

Reglas:
- Conteos de `summary` coinciden con tamaño de colecciones.
- `id` único dentro de cada colección.
- Referencias resuelven a elementos existentes.
- `taskType` extensible; tipo desconocido válido estructuralmente no invalida el escenario.
- `locationRef` y `cargoRefs` opcionales. `cargoRefs` sin duplicados.
- `status: "PENDING"` como valor sintético inicial.

### Respuesta

```
{
  scenarioId, scenarioVersion (=1), scenarioFormatVersion, initializedAt,
  source, seed?, warnings?: [{code, message, field?}]
}
```

### Errores

**A (no replayables):** `INVALID_INPUT`, `UNSUPPORTED_CONTRACT_VERSION`, `UNAUTHENTICATED`, `FORBIDDEN`, `IDEMPOTENCY_CONFLICT`, `SERVICE_UNAVAILABLE`, `INVALID_SCENARIO_DATA`, `UNSUPPORTED_SCENARIO_VERSION`.

**B (replayables si consolidados):** `SCENARIO_ALREADY_EXISTS`.

### Idempotencia

Identidad: `(actor autenticado, contractVersion, idempotencyKey)`.

- Misma identidad + mismos argumentos + resultado consolidado → replay.
- Misma identidad + argumentos distintos → `IDEMPOTENCY_CONFLICT`.
- Misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT`.
- Búsqueda idempotente precede a `SCENARIO_ALREADY_EXISTS`.
- `SERVICE_UNAVAILABLE` no se persiste.

### Precondiciones (orden)

1. Estructura básica del envelope
2. `contractVersion`
3. Autenticación
4. Autorización
5. Estructura del payload
6. Idempotencia
7. Dominio (existencia, coherencia)
8. Atomicidad

Bloqueo del replay: pasos 1–5.

---

## 3. UC-02 — `QueryScenarioRequest` — CONSOLIDADO

### Solicitud

| Campo | Tipo | Obligatorio |
|---|---|---|
| `scenarioId` | string | Sí |
| `expectedScenarioVersion` | number | No |
| `include` | string[] | No |
| Envelope | — | Sí |

**Sin idempotencia.** Consulta pura.

### Respuesta

```
{
  scenarioId, scenarioVersion,
  includedSections: string[],
  ...secciones solicitadas
}
```

### Secciones

| Sección | Estructura |
|---|---|
| `activeProposals` | `[{ proposalId, proposalVersion, status, proposedAt }]` |
| `activeAssignments` | `[{ assignmentId, proposalId, vehicleId, status, recognizedAt }]` |
| `assignedVehicles` | Derivado de `activeAssignments` |
| `scenario_projection` | `{ totalDistanceKm }` — solo con `include` explícito |

- `activeProposals`: `PROPOSED` + `AUTHORIZED`. No `REVOKED` ni históricas.
- `activeAssignments`: asignaciones **reconocidas** no `REVOKED`. No propuestas.
- `scenario_projection` es **proyección sintética**, no medición operacional.

### Default con `include` omitido

```
{ scenarioId, scenarioVersion, includedSections: [] }
```

Sin secciones.

### Errores

**A:** `INVALID_INPUT`, `UNSUPPORTED_CONTRACT_VERSION`, `UNAUTHENTICATED`, `FORBIDDEN`, `SERVICE_UNAVAILABLE`.

**B (sin replay por ausencia de idempotencia):** `SCENARIO_NOT_FOUND`, `SCENARIO_VERSION_MISMATCH`.

### Precondiciones

1. Envelope, 2. `contractVersion`, 3. auth, 4. authz, 5. payload, 6. dominio, 7. atomicidad. Sin paso de idempotencia.

---

## 4. UC-03 — `ProposeRoutesCommand` — CONSOLIDADO

### Solicitud

| Campo | Tipo | Obligatorio |
|---|---|---|
| `scenarioId` | string | Sí |
| `expectedScenarioVersion` | number | No |
| `vehicleId` | string | Sí |
| `taskSequence` | string[] | Sí (no vacía, sin repeticiones) |
| `proposalSource` | object (ver abajo) | Sí |
| `requestedWindow` | `{startsAt, endsAt}` ISO-8601 | No |
| Envelope | — | Sí |

### `proposalSource`

```
{
  type: "GEOWORKBENCH_GREEDY" | "GEOWORKBENCH_2OPT" | "MANUAL" | "EXTERNAL"
  producerVersion?: string
  producerReference?: string
}
```

Extensible: `GEOWORKBENCH_BINPACKING`, `GEOWORKBENCH_LIFO` reservados (ver §8.4).

### `requestedWindow`

- `startsAt` estrictamente anterior a `endsAt`.
- Omisión: no inventar intervalo. Puede producir `availability: UNDETERMINED`.
- `INVALID_INPUT` con `reasonCode: "INVALID_TIME_WINDOW"` solo para entrada malformada.
- Único por propuesta.

### Respuesta

```
{
  proposalId, proposalVersion, proposedAt, proposedBy,
  evaluation: {
    globalVerdict: "ELIGIBLE" | "INELIGIBLE" | "CONDITIONAL" | "UNDETERMINED"
    dimensions: { capacity, availability, eligibility, constraints }
    contextRef: string (opaco)
  }
}
```

Dimensiones: `PASS` | `FAIL` | `CONDITIONAL` | `UNDETERMINED` | `NOT_EVALUATED`.
Precedencia: `FAIL > UNDETERMINED > CONDITIONAL > ELIGIBLE`. `NOT_EVALUATED` no contribuye.

**Ningún veredicto impide el registro.** La propuesta inicia en `PROPOSED`.

### Errores

**A:** `INVALID_INPUT`, `UNSUPPORTED_CONTRACT_VERSION`, `UNAUTHENTICATED`, `FORBIDDEN`, `IDEMPOTENCY_CONFLICT`, `SERVICE_UNAVAILABLE`, `TASK_SEQUENCE_EMPTY`, `DUPLICATE_TASK_IN_SEQUENCE`, `UNSUPPORTED_PROPOSAL_SOURCE`, `EVALUATION_EXECUTION_FAILED`.

**B:** `TASK_NOT_FOUND`, `VEHICLE_NOT_FOUND`, `SCENARIO_NOT_FOUND`, `SCENARIO_VERSION_MISMATCH`.

### Idempotencia y precondiciones

Misma identidad y reglas que UC-01. Bloqueo: pasos 1–5.

Orden: envelope → `contractVersion` → auth → authz → payload → idempotencia → dominio → atomicidad.

Atomicidad: propuesta registrada + evaluación + resultado idempotente = unidad lógica. Falla técnica en evaluación → no se registra nada.

---

## 5. UC-04 — `AuthorizeProposalCommand` — CONSOLIDADO

### Solicitud

| Campo | Tipo | Obligatorio |
|---|---|---|
| `proposalId` | string | Sí |
| `proposalVersion` | number | Sí |
| `expectedEvaluationId` | string | No |
| `note` | string | No (no confiable) |
| Envelope | — | Sí |

### Respuesta

**`AUTHORIZED`:**

```
{
  outcome: "AUTHORIZED",
  authorizationId, proposalId, proposalVersion,
  authorizedBy, authorizedAt, expiresAt,
  policyVersion, policyRef, evaluationReference
}
```

**`DENIED`:**

```
{
  outcome: "DENIED",
  proposalId, proposalVersion,
  denialReason: "INSUFFICIENT_COMPETENCE",
  evaluationReference?
}
```

**`CONDITIONAL`** — **no emitido en v1.** DTO diferido (ver §7).

### Errores

**A:** `INVALID_INPUT`, `UNSUPPORTED_CONTRACT_VERSION`, `UNAUTHENTICATED`, `FORBIDDEN`, `IDEMPOTENCY_CONFLICT`, `SERVICE_UNAVAILABLE`.

**B:** `PROPOSAL_NOT_FOUND`, `PROPOSAL_VERSION_MISMATCH`, `PROPOSAL_NOT_AUTHORIZABLE`, `EVALUATION_EXPIRED`, `EVALUATION_VERSION_MISMATCH`, `AUTHORIZATION_ALREADY_ACTIVE`.

### Precondiciones (orden)

1. Envelope + payload
2. `contractVersion`
3. Autenticación
4. Autorización
5. Idempotencia
6. Existencia de Proposal
7. Coincidencia `proposalVersion`
8. Evaluación vigente `ELIGIBLE`
9. Ausencia de autorización activa
10. Competencia + creación atómica

Bloqueo del replay: pasos 1–4.

**Diferencia con UC-01/UC-03:** UC-04 valida payload en paso 1 (payload simple, no version-specific). UC-01/UC-03 lo validan en paso 5. Cada orden ratificado por su propio dictamen (D5 vs Etapa 5).

### Replay de errores terminales

| Resultado | Tratamiento |
|---|---|
| `AUTHORIZED` | Persistir y reproducir |
| `DENIED` | Persistir y reproducir |
| Errores terminales deterministas de negocio | Persistir y reproducir |
| `INVALID_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN` | Rechazar antes de idempotencia |
| `IDEMPOTENCY_CONFLICT` | No sustituir resultado original |
| `SERVICE_UNAVAILABLE` | `retryable: true`; no persistir como resultado terminal |

### Atomicidad

Creación de Authorization + consolidación de su resultado idempotente = unidad lógica. Éxito: ambos existen. Fallo: ninguno.

---

## 6. Integración FlowCore ↔ GeoWorkbench (18.6.8) — CONSOLIDADO

| # | Punto | Decisión |
|---|---|---|
| 1 | Transporte | Application Layer expone endpoint por UC. Tecnología concreta diferida a implementación. |
| 2 | DTO | JSON por UC, derivado del contrato consolidado. Sin schema formal en v1. |
| 3 | Autenticación | `Authorization: Bearer <token>` → Application Layer valida → construye `RequestContext`. |
| 4 | Error de transporte | Ante ausencia de respuesta o timeout, el cliente puede reintentar la solicitud. En UC con idempotencia, conserva la misma `idempotencyKey`; en UC-02 (consulta pura sin idempotencia), realiza una nueva consulta. Application Layer aplica las reglas correspondientes al UC. |
| 5 | Estados de UI | `idle` / `loading` / `success` / `error` / `stale` (datos antiguos, no error). |

**Alcance de 18.6.8:** flujo de Vo.Bo. (Planeación autoriza propuesta vía UC-04). No absorbe el ciclo logístico completo.

---

## 7. Diferidos

| Elemento | Estado |
|---|---|
| DTO de `CONDITIONAL` en UC-04 | Diferido. UC-04 no emite `CONDITIONAL` en v1. |
| `retryAfter` | Diferido. Cliente gestiona sus propios intervalos. |
| Formato de cadena de `contractVersion` | Diferido. |
| Política de incremento y publicación de versiones | Diferido. |
| Mecanismo técnico de detección cross-versión | Diferido a implementación. |
| Persistencia idempotente / recuperación de resultados inciertos | Diferido a implementación. |
| Tecnología de Application Layer | Diferido a fase de implementación. |
| Numeración 18.6.9/18.6.10 vs 18.7/18.8 (T6) | Provisional. Se resuelve cuando toque. |

Los diferidos no bloquean la consolidación de UC-01..UC-04.

---

## 8. Contextos de negocio registrados (no contratos)

Estas definiciones están registradas para los contratos futuros. **No son contrato ni implican apertura de UC.**

### 8.1 Ciclo operativo

1. **Planificar** — FlowCore propone y evalúa. Planeación autoriza (UC-04) y libera.
2. **Preparar** — Operaciones: etiquetado, pesca, auditoría, control. Libera rutas para despacho.
3. **Despachar** — Operaciones + Logística/Flota + Operador de unidad. Proceso coordinado.
4. **Distribuir** — Ejecución, seguimiento, resultados reales.
5. **Mejorar** — Comparación plan vs realidad.

### 8.2 Dos liberaciones distintas

| Responsable | Acción | Resultado |
|---|---|---|
| Planeación | Autoriza propuesta | Ruta aprobada |
| FlowCore/Application | Registra la autorización | Propuesta autorizada, pendiente de reconocimiento operativo |
| Operaciones | Prepara y libera | Rutas listas para despacho |
| Logística/Flota | Recibe plan, inicia carga | Unidades en preparación |
| Operador de unidad | Participa en la carga y confirma los acontecimientos que le correspondan según la configuración operativa | Acontecimientos de despacho atribuidos |

**`AUTHORIZED` ≠ `RECOGNIZED`.** La autorización no implica reconocimiento operativo.

### 8.3 Tres mediciones separadas (no colapsables)

- **Ruta completa:** paquetes requeridos y preparados.
- **Carga completa:** paquetes efectivamente cargados y verificados.
- **Despacho efectivo:** unidad y operador confirmados en salida.

Una no implica las otras.

### 8.4 Motores de propuesta

`3D Bin Packing` y `LIFO` se modelan como nuevos `proposalSource.type` cuando existan: `GEOWORKBENCH_BINPACKING`, `GEOWORKBENCH_LIFO`. No requieren UC nuevo.

La representación y referencia de resultados específicos de Bin Packing y LIFO (posiciones, orientaciones, distribución de carga) se definirán cuando se concrete su integración. Esta reserva no modifica el contrato vigente de UC-03 ni crea un UC independiente.

### 8.5 Planeador vs Operador

La distinción Planeador/Operador será principalmente de proyección de información y permisos. Al abrir UC-07..UC-09 se determinarán los `include` y controles de autorización correspondientes, evitando duplicaciones por rol.

### 8.6 Métricas de Operaciones

Tiempos de etiquetado, pesca, auditoría, despacho, puntualidad, incidencias. Las métricas operacionales son contexto de negocio. Su captura, persistencia y utilización como evidencia se determinarán al diseñar los contratos correspondientes. No se incorporan automáticamente a `constraints`.

---

## 9. Estado

```
Fase 18.6.6           — Contratos de intercambio (base): CERRADA
Fase 18.6.7           — Consolidación UC-01..UC-04: CERRADA
Fase 18.6.8           — Contrato de integración (Vo.Bo.): CERRADA

ApplicationEnvelope:   CONSOLIDADO
UC-01 InitializeScenarioCommand:      CONSOLIDADO
UC-02 QueryScenarioRequest:           CONSOLIDADO
UC-03 ProposeRoutesCommand:           CONSOLIDADO
UC-04 AuthorizeProposalCommand:       CONSOLIDADO

UC-05..UC-09:         SIN ABRIR
Contextos §8:         registrados, no contratos
Diferidos §7:         no bloqueantes

Implementación:       ninguna
Verificación:         ninguna
```

---

## 10. Referencia

**Fuente histórica:** `docs/research/fase-18.6.6-contratos-de-intercambio.md` (v0.9 revisión 4, commit `2e22636`).

Este documento **no sustituye** la fuente. La consolida, reduciendo el estado vigente a lo accionable.

**Historial completo del proyecto:**
```
git log -- docs/research/
```