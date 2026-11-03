# Fase 18.6.6 — Contratos de Intercambio

**Proyecto:** Gudo Labs / FlowCore
**Alcance:** Contratos de intercambio entre GeoWorkbench, Application Layer, Logistics Domain y FlowCore Kernel
**Versión:** v0.7 — B-18 incorporada sobre v0.6 (UC-04 §7.7: replay explícito de `CONDITIONAL`)
**Estado:** 🟢 APROBADO — listo para materialización por Guss
**Naturaleza:** Registro contractual de la frontera inbound. Complementa —no sustituye— `commit-12-executable-software-contracts.md` (outbound ejecución) y `routing-port.md` (outbound consulta).
**Fecha de corte:** Fase 18.6.6, tras revisiones de Etapa 3 y aprobación técnica de Kael.

---

## 0. Cómo leer este documento

Cada contrato, sección o afirmación va acompañada, cuando corresponde, de una etiqueta:

| Etiqueta | Significado |
|---|---|
| **RATIFICADO CONCEPTUALMENTE** | Existe un conjunto de decisiones arquitectónicas cerradas. **No implica contrato formal completo.** |
| **EN CONSOLIDACIÓN** | Contrato en proceso de redacción y revisión; sus partes ratificadas conviven con partes todavía no cerradas. |
| **SIN ABRIR** | Caso de uso reconocido en el catálogo, sin contrato iniciado. |
| **IMPLEMENTADO** | Existe código correspondiente. |
| **VERIFICADO** | Existe evidencia de funcionamiento. Actualmente: ninguna en esta fase. |
| **PENDIENTE** | Sin decisión o resolución suficiente. |
| **DIFERIDO** | Reconocido, explícitamente postergado. |

Regla de lectura: **RATIFICADO CONCEPTUALMENTE ≠ CONSOLIDADO ≠ IMPLEMENTADO ≠ VERIFICADO**. Ningún contrato de esta fase tiene código asociado ni verificación de ejecución a la fecha del corte.

**Nota terminológica (v0.7):** el término `CONSOLIDADO` se retira como etiqueta de estado de UC. Un contrato solo puede declararse `CONSOLIDADO` cuando contiene definición suficiente de solicitud, respuesta, resultados, errores y reglas aplicables. Ninguno de los UC alcanza ese nivel en v0.7.

**Nota metodológica (v0.7):** en los UC con decisiones ratificadas se registran explícitamente los campos y reglas ya cerrados (con la etiqueta **Ratificado**), junto a los aspectos que permanecen pendientes de consolidación formal. "Consolidación formal pendiente" **no significa borrar decisiones ya cerradas**; significa completar el contrato con los elementos faltantes sin perder los ratificados.

**Nota de corrección (v0.7):** recuperar una decisión ratificada no significa introducir una decisión nueva; tampoco completar silenciosamente lo que aún no se ha decidido. Cuando un dato no está ratificado, se marca como PENDIENTE, no se rellena por inferencia. No se cierra por redacción lo que sigue abierto por decisión, ni se deja ambiguo lo que ya está decidido.

---

## 1. Propósito y alcance

Este documento consolida los **contratos de intercambio** de Fase 18.6.6: la frontera **inbound** entre GeoWorkbench, Application Layer, Logistics Domain y FlowCore Kernel.

**Queda dentro del alcance:**
- `ApplicationEnvelope`.
- UC-01 a UC-09 como contratos de aplicación.

**Queda fuera del alcance:**
- Puertos outbound de ejecución (→ `commit-12-executable-software-contracts.md`).
- Puertos outbound de consulta (→ `routing-port.md`).
- Implementación de Application Layer.
- Tecnología de transporte, serialización o persistencia.
- Reglas del Logistics Domain (se referencian, no se redefinen).

---

## 2. Tres familias de contratos

La frontera de software del proyecto contiene tres familias arquitectónicamente distintas. No deben confundirse:

| Familia | Dirección | Ejemplo | Documento fuente |
|---|---|---|---|
| **Contratos inbound de aplicación** | GeoWorkbench → Application Layer → (Logistics Domain + FlowCore Kernel) | `ApplicationEnvelope`, UC-01..UC-09 | **Este documento** |
| **Contratos outbound de consulta** | Dominio → proveedor externo de datos | `routing-port.md` | `motores/flow-core/puertos/routing-port.md` |
| **Contratos outbound de ejecución** | Kernel → sistema externo con efecto físico | `ExternalPort`, `Command`, `DeliveryAttempt` | `conocimiento/arquitectura/commit-12-executable-software-contracts.md` |

### 2.1 Reglas de no confusión

- Un **Command de UC** (inbound) **no** es un `Command` de Commit #12 (outbound ejecución). Comparten nombre, no semántica.
- La `idempotencyKey` de UC (cliente, identifica intención de solicitud) **no** es la `IdempotencyKey` de Commit #12 (`= f(CommandId)`, invariante de dominio).
- Los veredictos `ELIGIBLE/INELIGIBLE/CONDITIONAL/UNDETERMINED` **no** son `KnowledgeState` de Commit #12 ni `ExecutionState`.
- `ExternalClaim` de Commit #12 **no** es una respuesta de Application Layer ni un `result.outcome` de UC.
- Un puerto de consulta **no** evalúa elegibilidad operacional. Aporta datos; el dominio evalúa.
- La **Application Layer coordina** Logistics Domain y FlowCore Kernel. No introduce una dependencia lineal entre ellos por omisión.

### 2.2 Lo que este documento no hace

- No convierte Commit #12 en contrato de intercambio.
- No convierte `routing-port.md` en evaluador de elegibilidad.
- No introduce entidades de dominio nuevas.
- No fija JSON Schema, HTTP, ni estructuras Rust.

---

## 3. ApplicationEnvelope — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

Envoltorio común de todas las solicitudes y respuestas inbound entre GeoWorkbench y Application Layer. Esta sección consolida los principios ratificados; no constituye JSON Schema ni fija tecnología de transporte.

### 3.1 Estructura conceptual

El envelope distingue **cuatro capas de información** según su origen y confiabilidad, y **separa solicitud de respuesta**.

#### 3.1.1 Campos de solicitud

**(a) Metadatos declarados por el cliente — siempre no confiables**

- `declaredActor` — declaración del cliente; **nunca** es fuente de autoridad.
- `clientVersion` — versión declarada del cliente; informativa, no autoritativa.
- `clientDeclaredTimestamp` — timestamp declarado por el cliente. Es **metadato no confiable**; **nunca** sustituye a `receivedAt` ni a `respondedAt`.
- Otros metadatos de cliente no listados explícitamente: **no confiables**.

Estos campos pueden registrarse para diagnóstico o trazabilidad, pero **no participan en decisiones de negocio ni de autorización**.

**(b) Identificadores de correlación e intención**

- `correlationId` — puede originarse en el cliente. Agrupa solicitudes relacionadas. No autoriza.
  - **Regla ratificada:** el servidor **valida** el `correlationId` recibido y puede **generar uno alternativo** cuando no sea válido o no esté disponible.
- `idempotencyKey` — cuando el caso de uso lo requiera. Suministrado por el cliente. Reconoce reintentos de una misma intención.
- `contractVersion` — versión del contrato de intercambio. **No** debe confundirse con:
  - `scenarioFormatVersion` — versión del formato de escenario (UC-01).
  - `scenarioVersion` — versión del estado del escenario.
  Estos tres identificadores son independientes.
  - **PENDIENTE:** obligatoriedad, valor/versionado concreto y mecanismo de compatibilidad de `contractVersion` **no están ratificados** en esta fase. No se rellenan por inferencia.

**(c) Campos específicos por caso de uso (cuando correspondan)**

- `expectedScenarioVersion` — expectativa de versión declarada por el cliente en UC que la requieran. Su carácter opcional u obligatorio se define **por UC**, no aquí. Su ausencia o incompatibilidad se trata conforme a las reglas del UC correspondiente.
- Otros campos específicos de caso de uso se documentan en la sección de cada UC.

#### 3.1.2 Campos de respuesta

**(a) Campos determinados por el servidor**

- `requestId` — **generado por el servidor o gateway** en el ingreso de la solicitud. Identifica una solicitud individual. **No lo suministra el cliente.**
- `receivedAt` — momento en que el servidor recibió la solicitud.
- `respondedAt` — momento en que el servidor emitió la respuesta.
- `processingStatus` — `SUCCESS` o `ERROR`.
- `result` — estructura diferenciada para resultados de negocio (presente cuando `processingStatus = SUCCESS`).
- `error` — estructura diferenciada para errores técnicos (presente cuando `processingStatus = ERROR`).

**(b) Trazabilidad**

- `correlationId` — devuelto en la respuesta, sea el recibido del cliente (si es válido) o el generado por el servidor.

### 3.2 Reglas ratificadas

- La identidad autenticada **no** viaja como autoridad confiable dentro del envelope. Se obtiene del `RequestContext` construido por el servidor.
- `declaredActor` del cliente **nunca** es fuente de autoridad.
- `requestId`, `receivedAt`, `respondedAt`, `processingStatus` y la estructura de `result`/`error` son determinados por el servidor.
- `requestId` **no** es un campo de solicitud; es un identificador de respuesta asignado por el servidor o gateway.
- El servidor valida `correlationId`; si es inválido o ausente, puede generar uno alternativo.
- Un `clientDeclaredTimestamp` (si se recibe) es metadato no confiable y no sustituye `receivedAt` ni `respondedAt`.
- `contractVersion`, `scenarioFormatVersion` y `scenarioVersion` son tres identificadores distintos y no intercambiables.
- `processingStatus` distingue `SUCCESS` y `ERROR`.
- Los resultados de negocio se expresan dentro de `result`, no como error técnico.
- `error` es estructura diferenciada, no mezclada con `result`.
- `PARTIAL` queda **fuera** de la primera versión.
- Los errores tienen códigos estables, mensajes descriptivos y detalles estructurados opcionales.
- `retryable` es recomendación del servidor, **no** garantía.

### 3.3 Elementos pendientes de consolidación formal

- Obligatoriedad, valor/versionado concreto y mecanismo de compatibilidad de `contractVersion` (no ratificado).
- Modelo completo de `result` por caso de uso (campos específicos ratificados por UC; ver §4, §5, §6).
- Modelo completo de `error` más allá del catálogo de códigos (§13).
- Modelo de metadatos adicionales del cliente, si se incorporan en el futuro.

### 3.4 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin JSON Schema ni contrato formal completo. Sin implementación. Sin verificación.

---

## 4. UC-01 — `InitializeScenarioCommand` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 4.1 Semántica

Inicialización atómica de un escenario. No evalúa elegibilidad operacional.

### 4.2 Decisiones conceptuales ratificadas

- Inicialización atómica.
- `scenarioFormatVersion` ≠ `contractVersion` ≠ `scenarioVersion` son tres versiones distintas.
- La colección `tasks` debe existir en el formato 1.0, incluso si está vacía.
- Se valida integridad estructural y coherencia del escenario.
- **No** se evalúa elegibilidad operacional en UC-01.
- La idempotencia evita duplicar la misma inicialización.
- La inicialización exitosa asigna **`scenarioVersion = 1`**.

### 4.3 Solicitud — campos ratificados

| Campo | Obligatorio | Fuente | Notas |
|---|---|---|---|
| `scenarioId` | Sí | Cliente | Identificador del escenario a inicializar. |
| `scenarioFormatVersion` | **Opcional** | Cliente | Si se proporciona, indica la versión del formato de escenario esperada. Su omisión se trata según la política por defecto del UC (pendiente de consolidación formal). Independiente de `contractVersion`. |
| `source` | Sí | Cliente | Origen declarado del escenario (p. ej. `SYNTHETIC`, `IMPORTED`, `MANUAL`). |
| `seed` | Opcional | Cliente | Semilla utilizada por el generador del escenario, si aplica. |
| `data` | Sí | Cliente | Contenido del escenario en el formato indicado. Ver estructura mínima en §4.4. |
| Envelope | Sí | Envelope | Ver §3.1.1. |

**Explícitamente ausentes del request:**
- `requestId` (generado por el servidor).
- `receivedAt`, `respondedAt` (determinados por el servidor).
- Cualquier campo de autoridad; la identidad se obtiene del `RequestContext`.

### 4.4 Estructura mínima de `data` y de `Task`

#### 4.4.1 Estructura mínima de `data` — ratificada

`data` debe contener, como mínimo:

- `summary`
- `vehicles`
- `packages`
- `stops`
- `tasks`

**Reglas de coherencia ratificadas:**

- Los conteos declarados en `summary` deben coincidir con el tamaño de las colecciones correspondientes.
- Los identificadores deben ser únicos dentro de su colección (`vehicles`, `packages`, `stops`, `tasks`).
- Las referencias entre colecciones (p. ej. `task.locationRef`, `task.cargoRefs`) deben resolver a elementos existentes en las colecciones correspondientes.

**Regla de separación estructura/evaluación:**

La validación en UC-01 es **estructural y de coherencia**. La evaluación semántica pertenece al Logistics Domain y **no** se ejecuta en UC-01.

#### 4.4.2 Estructura mínima de `Task` — ratificada

```json
{
  "taskId": "task-001",
  "taskType": "DELIVERY",
  "locationRef": {
    "type": "STOP",
    "id": "stop-001"
  },
  "cargoRefs": ["pkg-001", "pkg-002"],
  "status": "PENDING",
  "metadata": {}
}
```

Esta estructura es **mínima**, no una restricción universal ni un conjunto exhaustivo de restricciones. Reglas ratificadas:

1. **`taskId`** — identificador **único y estable**. No cambia a lo largo de la vida de la tarea. Su unicidad se verifica dentro de la colección `tasks` del escenario.
2. **`taskType`** — pertenece a un **catálogo controlado y extensible**. Un `taskType` desconocido pero estructuralmente válido **no invalida el escenario** y **no** se rechaza en UC-01. Su evaluación semántica corresponde al Logistics Domain (conducirá a `UNDETERMINED` donde aplique).
3. **`locationRef` y `cargoRefs`** — **opcionales**. Cuando se proporcionan:
   - sus referencias deben resolver a elementos existentes en las colecciones correspondientes (`stops` para `locationRef`, `packages` para `cargoRefs`);
   - `cargoRefs` **no** debe contener duplicados;
   - la exigibilidad de `locationRef` y `cargoRefs` **por tipo de tarea** pertenece a la evaluación del dominio, no a la validación estructural de UC-01.
4. **`status`** — admite `PENDING` como **valor sintético inicial**. `PENDING` **no** es el único estado permitido para escenarios futuros; el catálogo completo de estados de tarea pertenece al dominio y podrá extenderse.
5. **`metadata`** — acotado a **información de trazabilidad**. No es vehículo para reglas de dominio ni para sustituir campos de negocio.

**Nota de separación:** la estructura mínima anterior **no** impone que toda tarea `DELIVERY` tenga ubicación y carga. La estructura es laxa; las restricciones por tipo son del dominio.

### 4.5 Respuesta — campos ratificados

| Campo | Presente cuando | Notas |
|---|---|---|
| `scenarioId` | `SUCCESS` | Eco del identificador. |
| `scenarioVersion` | `SUCCESS` | Versión asignada al escenario tras la inicialización. En creación inicial es `1`. |
| `scenarioFormatVersion` | `SUCCESS` | Versión de formato aplicada (eco si se proporcionó; política por defecto si se omitió — pendiente de consolidación formal). |
| `initializedAt` | `SUCCESS` | Momento de inicialización, determinado por el servidor. |
| `source` | `SUCCESS` | Origen declarado. |
| `seed` | `SUCCESS` (si se proporcionó) | Eco de la semilla. |
| `warnings` | `SUCCESS` (opcional) | Lista de advertencias no bloqueantes. |
| Envelope de respuesta | Siempre | Ver §3.1.2. |

### 4.6 Errores ratificados

- `INVALID_INPUT` (con `field`/`reasonCode` cuando aplique).
- `SCENARIO_ALREADY_EXISTS` — si el `scenarioId` ya existe y no procede la reproducción idempotente.
- `UNSUPPORTED_SCENARIO_VERSION` — si la `scenarioFormatVersion` proporcionada no es soportada.
- `INVALID_SCENARIO_DATA` — si `data` no cumple con el formato declarado o con las reglas de coherencia.
- `IDEMPOTENCY_CONFLICT` — misma clave, argumentos distintos.
- `UNAUTHENTICATED`.
- `FORBIDDEN`.
- `SERVICE_UNAVAILABLE`.

### 4.7 Reglas de idempotencia ratificadas

Las reglas ratificadas son las siguientes:

1. **Precedencia de la búsqueda idempotente** — la comprobación de idempotencia **precede** a la comprobación de existencia del `scenarioId`. Un reintento con la misma clave y argumentos no produce `SCENARIO_ALREADY_EXISTS`; se resuelve conforme a la regla 2 o la regla 5.
2. **Misma `idempotencyKey` + mismos argumentos + resultado exitoso original** → **reproducir el resultado exitoso original**. Esta regla está **ratificada**: la respuesta de la operación original se devuelve sin reejecutar la inicialización.
3. **Misma `idempotencyKey` + argumentos distintos** → `IDEMPOTENCY_CONFLICT`.
4. **`idempotencyKey` nueva + `scenarioId` ya existente** → `SCENARIO_ALREADY_EXISTS`.
5. **Misma `idempotencyKey` + mismos argumentos + resultado original fue un error terminal** → tratamiento **PENDIENTE de ratificación**. No se decide aquí si el error terminal se persiste y se reproduce, ni bajo qué condiciones. Esta sección no rellena por inferencia.

**Regla de honestidad documental:** las reglas 1–4 están ratificadas y no dependen de la política pendiente del punto 5. La política pendiente **solo** afecta a la reproducción de errores terminales; **no** deja ambiguo el replay de resultados exitosos, que ya está ratificado en la regla 2.

### 4.8 Elementos pendientes de consolidación formal

- Política por defecto cuando `scenarioFormatVersion` se omite.
- Modelo completo de `warnings`.
- Forma específica de `summary` y `metadata` (se referencia el formato 1.0; no se duplica aquí).
- **Replay de errores terminales** (coherente con UC-04 §7.7) — PENDIENTE. El replay de **resultados exitosos** está ratificado (regla 2 de §4.7) y no forma parte de esta deuda.
- Catálogo completo de `taskType` y de estados de tarea — pertenecen al dominio; aquí solo se referencia el mínimo estructural.
- Precondiciones detalladas más allá de las ratificadas.

### 4.9 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin implementación. Sin verificación.

---

## 5. UC-02 — `QueryScenarioRequest` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 5.1 Semántica

Consulta del estado de un escenario. Permite solicitar secciones mediante `include`.

### 5.2 Decisiones conceptuales ratificadas

- La respuesta informa las secciones incluidas.
- Un `expectedScenarioVersion` incompatible genera `SCENARIO_VERSION_MISMATCH`.
- Las métricas deben derivarse de sus fuentes correctas.
- `activeProposals` y `activeAssignments` tienen **semánticas diferentes**. No son intercambiables.
- No debe presentarse una proyección sintética como hecho operacional verificado.

### 5.3 Solicitud — campos ratificados

| Campo | Obligatorio | Fuente | Notas |
|---|---|---|---|
| `scenarioId` | Sí | Cliente | Escenario a consultar. |
| `expectedScenarioVersion` | Opcional | Cliente | Si se proporciona y no coincide con la versión actual → `SCENARIO_VERSION_MISMATCH`. |
| `include` | Opcional | Cliente | Lista de secciones solicitadas. Si se omite, se aplica la política por defecto del UC (pendiente de consolidación formal). |
| Envelope | Sí | Envelope | Ver §3.1.1. |

### 5.4 Respuesta — campos ratificados

| Campo | Presente cuando | Notas |
|---|---|---|
| `scenarioId` | `SUCCESS` | Eco del identificador. |
| `scenarioVersion` | `SUCCESS` | Versión actual del escenario. |
| `includedSections` | `SUCCESS` | Lista de secciones efectivamente incluidas en la respuesta. |
| Secciones solicitadas | `SUCCESS` | Solo las secciones presentes en `include` (o las de la política por defecto). **Las secciones no solicitadas se omiten.** |

#### 5.4.1 Semántica de secciones — ratificada

- **`activeProposals`** — propuestas del escenario en estados **`PROPOSED`** y **`AUTHORIZED`**. No incluye propuestas `REVOKED` ni históricas sin estado activo.
- **`activeAssignments`** — asignaciones **reconocidas** que **no** están en estado `REVOKED`.
- **`assignedVehicles`** — **derivado de las asignaciones reconocidas activas**, no del estado sintético del vehículo.
- **`totalDistanceKm`** — cuando se expone bajo la sección `scenario_projection`, debe identificarse explícitamente como **proyección sintética**. **No** debe presentarse como medición operacional verificada.

### 5.5 Errores ratificados

- `INVALID_INPUT` (con `field`/`reasonCode` cuando aplique).
- `SCENARIO_NOT_FOUND`.
- `SCENARIO_VERSION_MISMATCH`.
- `UNAUTHENTICATED`.
- `FORBIDDEN`.
- `SERVICE_UNAVAILABLE`.

### 5.6 Elementos pendientes de consolidación formal

- Estructura detallada de cada sección (campos internos de `activeProposals`, `activeAssignments`, etc.).
- Política por defecto de `include` cuando se omite.
- Modelo de paginación si aplica a alguna sección.
- Modelo de `warnings` si aplica.
- Estructura completa de `scenario_projection`.

### 5.7 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin implementación. Sin verificación.

---

## 6. UC-03 — `ProposeRoutesCommand` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 6.1 Semántica

Registro de una propuesta de rutas sobre un escenario. La propuesta se registra y se evalúa en una operación lógica atómica.

### 6.2 Decisiones conceptuales ratificadas

- Valida estructura, escenario, versión esperada, vehículo y tareas.
- Rechaza secuencias vacías o con tareas repetidas.
- Registra la propuesta aunque su evaluación sea `INELIGIBLE`, `CONDITIONAL` o `UNDETERMINED`.
- La propuesta siempre comienza en estado `PROPOSED`.
- La evaluación pertenece al **Logistics Domain**.
- El autor se obtiene del **contexto autenticado** (`proposedBy`), nunca de `declaredActor`.
- Registro y evaluación constituyen una **operación lógica atómica**.
- Si la evaluación falla técnicamente, **no se registra** la propuesta.
- Si la evaluación devuelve un veredicto válido, se registra la propuesta junto con su evaluación.
- `contextRef` permite rastrear el contexto de evaluación, sujeto a políticas de retención.
- Un `taskType` desconocido pero válido **no** se rechaza estructuralmente. Conduce a `UNDETERMINED` en la evaluación del dominio.

### 6.3 Solicitud — campos ratificados

| Campo | Obligatorio | Fuente | Notas |
|---|---|---|---|
| `scenarioId` | Sí | Cliente | Escenario sobre el que se propone. |
| `expectedScenarioVersion` | **Opcional** | Cliente | Si se proporciona, se compara con la versión actual del escenario; si no coincide → `SCENARIO_VERSION_MISMATCH`. Si se omite, **no se inventa** una expectativa del cliente ni se transforma su ausencia en error. |
| `vehicleId` | Sí | Cliente | Vehículo para el que se propone. |
| `taskSequence` | Sí | Cliente | Secuencia ordenada de tareas. Debe ser no vacía y sin repeticiones. |
| `proposalSource` | Sí | Cliente | Estructura con `type`, `producerVersion`, `producerReference` (ver §6.4). |
| `requestedWindow` | Opcional | Cliente | Estructura `{ startsAt, endsAt }`. Reglas en §6.5. |
| Envelope | Sí | Envelope | Ver §3.1.1. |

**Explícitamente ausentes del request:**
- `requestId` (generado por el servidor).
- `proposedBy` (se obtiene del `RequestContext` autenticado).
- `proposalId`, `proposalVersion` (los asigna el servidor).
- `receivedAt`, `respondedAt` (servidor).

### 6.4 `proposalSource.type` — catálogo inicial ratificado

- `GEOWORKBENCH_GREEDY`
- `GEOWORKBENCH_2OPT`
- `MANUAL`
- `EXTERNAL`

`producerVersion` y `producerReference` son **metadatos de procedencia**, no autoridad ni prueba de legitimidad.

### 6.5 `requestedWindow` — ratificado

```json
"requestedWindow": {
  "startsAt": "2026-11-03T08:00:00Z",
  "endsAt": "2026-11-03T12:00:00Z"
}
```

Reglas ratificadas:

1. Si se proporciona, `startsAt` debe ser estrictamente anterior a `endsAt`.
2. Si se omite, la aplicación **no** debe inventar un intervalo.
3. Si la evaluación necesita un intervalo y no está disponible, la dimensión Availability será `UNDETERMINED`.
4. Solo puede utilizarse un horizonte por defecto cuando exista una política explícita y quede registrado en el contexto de evaluación.
5. `INVALID_INPUT` con `field: "arguments.requestedWindow"` y `reasonCode: "INVALID_TIME_WINDOW"` corresponde **exclusivamente** a entrada malformada (intervalo invertido o instante sin offset). No se confunde con `UNDETERMINED`, que es veredicto válido de evaluación.
6. Aceptar offsets no equivale a aceptar tiempos ambiguos: todo instante identifica inequívocamente zona u offset. La normalización a UTC corresponde a **Application Layer**.
7. `requestedWindow` es **opcional en v1.0**. Su omisión no es error; puede producir `UNDETERMINED` cuando la evaluación necesite el intervalo.
8. Es **único por propuesta**, aplicable a toda la `taskSequence`.

### 6.6 Dimensiones de evaluación y veredictos globales — ratificado

La evaluación de UC-03 opera en dos niveles:

**(a) Dimensiones de evaluación (por dimensión evaluada):**

| Dimensión | Significado |
|---|---|
| `PASS` | La dimensión se cumple sin reservas. |
| `FAIL` | La dimensión no se cumple. |
| `CONDITIONAL` | La dimensión se cumpliría bajo condiciones explícitas. |
| `UNDETERMINED` | No hay información suficiente para determinar la dimensión. |
| `NOT_EVALUATED` | La dimensión no se evaluó en este contexto. |

**(b) Veredictos globales:**

| Veredicto | Significado |
|---|---|
| `ELIGIBLE` | Todas las dimensiones relevantes son `PASS`. |
| `INELIGIBLE` | Al menos una dimensión relevante es `FAIL`. |
| `CONDITIONAL` | Alguna dimensión es `CONDITIONAL` y ninguna relevante es `FAIL`. |
| `UNDETERMINED` | Alguna dimensión relevante es `UNDETERMINED` (o todo es `NOT_EVALUATED`) y ninguna es `FAIL`. |

**Regla ratificada:** ninguna combinación de dimensiones conduce automáticamente a rechazo de registro. La propuesta se registra aunque el veredicto global sea `INELIGIBLE`, `CONDITIONAL` o `UNDETERMINED`.

**Regla de `taskType` desconocido:** un `taskType` desconocido pero válido estructuralmente conduce a la dimensión correspondiente (p. ej. `eligibility` o `constraints`) como `UNDETERMINED`, y por tanto contribuye al veredicto global sin producir `FAIL` por sí mismo. No se rechaza la propuesta por esta causa.

**Regla de precedencia `CONDITIONAL` vs `UNDETERMINED` — PENDIENTE:** cuando en una misma evaluación coexisten dimensiones `CONDITIONAL` y `UNDETERMINED`, la precedencia entre ambas para determinar el veredicto global **no está ratificada**. No se decide aquí. La tabla de veredictos globales describe cada caso por separado; la combinación simultánea queda **PENDIENTE de ratificación** y no debe resolverse por inferencia durante la consolidación formal.

### 6.7 Respuesta — campos ratificados

| Campo | Presente cuando | Notas |
|---|---|---|
| `proposalId` | `SUCCESS` | Identificador asignado por el servidor. |
| `proposalVersion` | `SUCCESS` | Versión inicial de la propuesta. |
| `proposedAt` | `SUCCESS` | Momento del registro, determinado por el servidor. |
| `proposedBy` | `SUCCESS` | Referencia a la identidad autenticada (no al `declaredActor`). |
| `evaluation.globalVerdict` | `SUCCESS` | Uno de `ELIGIBLE`, `INELIGIBLE`, `CONDITIONAL`, `UNDETERMINED`. |
| `evaluation.dimensions` | `SUCCESS` | Mapa de dimensiones evaluadas → valor (`PASS`/`FAIL`/`CONDITIONAL`/`UNDETERMINED`/`NOT_EVALUATED`). |
| `evaluation.contextRef` | `SUCCESS` | Referencia opaca al contexto de evaluación (sujeta a retención). |
| Envelope de respuesta | Siempre | Ver §3.1.2. |

### 6.8 Errores ratificados

- `INVALID_INPUT` (con `field`/`reasonCode` cuando aplique)
- `TASK_SEQUENCE_EMPTY`
- `DUPLICATE_TASK_IN_SEQUENCE`
- `TASK_NOT_FOUND`
- `VEHICLE_NOT_FOUND`
- `SCENARIO_NOT_FOUND`
- `SCENARIO_VERSION_MISMATCH`
- `IDEMPOTENCY_CONFLICT`
- `UNSUPPORTED_PROPOSAL_SOURCE`
- `EVALUATION_EXECUTION_FAILED`

`retryable` se conserva como **recomendación del servidor**, no como garantía.

### 6.9 Reglas de idempotencia ratificadas

Las reglas de idempotencia de UC-03 quedan expresamente ratificadas:

1. **Misma `idempotencyKey` + mismos argumentos + resultado exitoso original** → **reproducir el resultado exitoso original**. La respuesta de la operación original se devuelve sin reejecutar el registro ni la evaluación.
2. **Misma `idempotencyKey` + argumentos distintos** → `IDEMPOTENCY_CONFLICT`.
3. **Misma `idempotencyKey` + mismos argumentos + resultado original fue un error terminal** → tratamiento **PENDIENTE de ratificación**. No se decide aquí si el error terminal se persiste y se reproduce, ni bajo qué condiciones.

**Regla de honestidad documental:** las reglas 1 y 2 están ratificadas y no dependen de la política pendiente del punto 3. La política pendiente **solo** afecta a la reproducción de errores terminales; **no** deja ambiguo el replay de resultados exitosos, que ya está ratificado.

### 6.10 Elementos pendientes de consolidación formal

- Estructura detallada de `evaluation.dimensions` (qué dimensiones específicas se reportan, p. ej. `capacity`, `availability`, `eligibility`, `constraints`).
- Estructura de `contextRef` (contenido y política de retención).
- Reglas específicas de atomicidad más allá de las ratificadas.
- **Replay de errores terminales** — PENDIENTE. El replay de resultados exitosos está ratificado (§6.9 regla 1).
- **Precedencia entre dimensiones `CONDITIONAL` y `UNDETERMINED` cuando coexisten** — PENDIENTE (§6.6).

### 6.11 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin implementación. Sin verificación.

---

## 7. UC-04 — `AuthorizeProposalCommand` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 7.1 Semántica

Crea una `Authorization`: entidad con identidad propia, vinculada a una versión concreta de `Proposal`. No modifica la Proposal. No crea ni modifica `Assignment`. No ejecuta `Recognition`. No utiliza `FenceEpoch` como autoridad logística.

### 7.2 Decisiones conceptuales ratificadas

- `Authorization` es una entidad independiente, con identidad propia.
- Se vincula a una **versión específica** de `Proposal`.
- Requiere evaluación vigente `ELIGIBLE`.
- **No** se autoriza una Proposal `INELIGIBLE`, `CONDITIONAL` sin resolver ni `UNDETERMINED`.
- La autorización tiene vigencia **obligatoria**, determinada por política del dominio.
- Una autorización vencida permanece en el historial. No se elimina ni se reescribe.
- **La expiración posterior de una evaluación no invalida retroactivamente una Authorization ya emitida.** El `Recognition` vuelve a comprobar las condiciones que correspondan al momento del reconocimiento.
- Solo puede existir **una autorización activa por versión** de Proposal.
- La competencia logística se evalúa **separadamente** de la autenticación.
- Una denegación de competencia es resultado de negocio (`DENIED`), **no** error técnico.
- Solo `AUTHORIZED` crea una Authorization.
- Los fallos técnicos no se convierten en `DENIED`.
- **Un resultado `CONDITIONAL` debe identificar condiciones concretas pendientes.** El DTO que transportará estas condiciones permanece diferido, pero un `CONDITIONAL` no puede producirse sin explicitar qué condiciones lo generan.
- UC-04 no produce `Recognition` ni `Assignment`.
- No se permite sustitución de autorización activa en v1. Una autorización expirada permanece como antecedente histórico; una nueva puede emitirse después de su vencimiento. Revocación anticipada fuera del alcance inicial.
- Relación conceptual: `Proposal 1 — 0..N Authorization`. Una propuesta puede acumular autorizaciones históricas; solo una activa.

### 7.3 Solicitud — campos ratificados

| Campo | Obligatorio | Fuente | Notas |
|---|---|---|---|
| `proposalId` | Sí | Cliente | |
| `proposalVersion` | Sí | Cliente | Debe coincidir. |
| `expectedEvaluationId` | **Opcional** | Cliente | Si se envía y no coincide con la evaluación vigente vinculada a esa versión → `EVALUATION_VERSION_MISMATCH`. Si se omite, el servidor resuelve la evaluación vigente. |
| `note` | No | Cliente | Metadato declarativo, **no confiable**, sin valor de autoridad. |
| Envelope | Sí | Envelope | Ver §3.1.1. **El cliente no suministra `requestId`**; ese campo lo genera el servidor. |

**Explícitamente ausentes del request:**

- `requestId` — generado por el servidor/gateway en el ingreso (no es campo que el cliente envíe).
- `authorizedAt`, `expiresAt` — los fija el dominio/aplicación por política.
- `authorizedBy` — se obtiene del `RequestContext` autenticado.
- Representaciones de competencia, autoridad o `FenceEpoch`.
- `declaredActor` del envelope no participa.

**Aclaración sobre `contractVersion`:** es la versión del contrato de intercambio (envelope). **No** es `scenarioFormatVersion` ni `scenarioVersion`. Los tres identificadores son independientes. Su obligatoriedad, valor/versionado concreto y mecanismo de compatibilidad están **pendientes** (ver §3.3).

### 7.4 Respuesta — estructura conceptual

- **`AUTHORIZED`** (`SUCCESS`): `authorizationId`, `proposalId`, `proposalVersion`, `authorizedBy`, `authorizedAt`, `expiresAt`, `policyVersion`, `policyRef`, `evaluationReference`.
  - `policyVersion` y `policyRef` documentan la política de vigencia aplicada. `policyRef` identifica la referencia concreta a la política; `policyVersion` identifica su versión.
- **`DENIED`** (`SUCCESS`): `proposalId`, `proposalVersion`, `denialReason: "INSUFFICIENT_COMPETENCE"`, `evaluationReference` opcional. **No crea Authorization.**
- **`CONDITIONAL`** (`SUCCESS`): `proposalId`, `proposalVersion`, y **las condiciones concretas pendientes que generan el resultado**. El DTO específico de esas condiciones permanece **DIFERIDO**, pero un `CONDITIONAL` **debe** explicitar qué condiciones lo producen. **No crea Authorization.**
- **`ERROR`** (`ERROR`): catálogo §7.5.

### 7.5 Catálogo de errores ratificados

- `INVALID_INPUT` (con `field`/`reasonCode` cuando aplique)
- `PROPOSAL_NOT_FOUND`
- `PROPOSAL_VERSION_MISMATCH`
- `IDEMPOTENCY_CONFLICT`
- `PROPOSAL_NOT_AUTHORIZABLE`
- `EVALUATION_EXPIRED`
- `EVALUATION_VERSION_MISMATCH`
- `AUTHORIZATION_ALREADY_ACTIVE`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `SERVICE_UNAVAILABLE`

**Falta de competencia → `DENIED` de negocio, no error.** `PROPOSAL_NOT_AUTHORIZABLE` es exclusivo de condiciones propias de la Proposal.

**Nota:** la **política de replay de errores terminales** (incluido `SERVICE_UNAVAILABLE` y otros errores técnicos) permanece **PENDIENTE**. No se presenta aquí como decisión cerrada. El replay de resultados exitosos —`AUTHORIZED`, `DENIED` de negocio y `CONDITIONAL`— **sí** está ratificado como reproducción del resultado original, coherente con UC-01 §4.7 regla 2 y UC-03 §6.9 regla 1.

### 7.6 Orden de precondiciones

**Ratificado:**

- Validación estructural del request → `INVALID_INPUT`.
- Autenticación → `UNAUTHENTICATED`.
- Permiso de operación → `FORBIDDEN`.
- **Idempotencia precede** a la comprobación de conflicto por autorización activa.
- Una repetición con la misma clave y los mismos argumentos devuelve el resultado original (éxito ratificado; errores terminales pendientes).
- La misma clave con argumentos diferentes produce `IDEMPOTENCY_CONFLICT`.
- Un `DENIED` de negocio debe conservar su resultado para el replay correspondiente.
- Solo `AUTHORIZED` crea una Authorization.
- Los fallos técnicos no se convierten en `DENIED`.

**Propuesta sujeta a ratificación final — no consolidada:**

El siguiente orden completo de verificaciones se propone como orientación, pero **no está ratificado** como secuencia obligatoria:

1. Validación estructural → `INVALID_INPUT`.
2. Autenticación → `UNAUTHENTICATED`.
3. Permiso → `FORBIDDEN`.
4. Idempotencia (ratificada como prioritaria sobre autorización activa).
5. `proposalId` existe → `PROPOSAL_NOT_FOUND`.
6. `proposalVersion` coincide → `PROPOSAL_VERSION_MISMATCH`.
7. Evaluación vigente `ELIGIBLE` vinculada a la versión → `PROPOSAL_NOT_AUTHORIZABLE` / `EVALUATION_EXPIRED` / `EVALUATION_VERSION_MISMATCH` según corresponda.
8. Sin Authorization activa → `AUTHORIZATION_ALREADY_ACTIVE`.
9. Evaluación de competencia → `AUTHORIZED` / `DENIED` / `CONDITIONAL`.

**Ninguna parte de esta secuencia, salvo los puntos ratificados arriba, queda cerrada.** Es material de consolidación.

### 7.7 Atomicidad e idempotencia

**Ratificado:**

- La creación de Authorization y las verificaciones que la condicionan constituyen una **operación lógica atómica**.
- **Replay de `AUTHORIZED`**: misma `idempotencyKey` + mismos argumentos + resultado original `AUTHORIZED` → reproducir el resultado `AUTHORIZED` original (incluidos `authorizationId`, `policyRef`, `evaluationReference`). No se crea una segunda Authorization.
- **Replay de `DENIED` de negocio**: misma `idempotencyKey` + mismos argumentos + resultado original `DENIED` → reproducir el resultado `DENIED` original con su `denialReason`. **No crea Authorization.**
- **Replay de `CONDITIONAL`**: misma `idempotencyKey` + mismos argumentos + resultado original `CONDITIONAL` → reproducir el resultado `CONDITIONAL` original, **incluidas las condiciones concretas que lo generaron**. **No crea Authorization.** El DTO específico de esas condiciones permanece **DIFERIDO** (ver §7.9), pero el replay reproduce las condiciones tal como fueron emitidas en el resultado original.
- Solo `AUTHORIZED` crea Authorization.
- Fallos técnicos no se convierten en `DENIED`.

**Pendiente de ratificación:**

- Política de replay idempotente de **errores terminales técnicos** (p. ej. `SERVICE_UNAVAILABLE`). ¿Se persisten para replay idempotente, o no se reproducen y se permite reintento?
- Comportamiento específico de `SERVICE_UNAVAILABLE` frente a reintentos con la misma clave.

**Regla de honestidad documental:** el replay de los tres resultados de negocio exitosos —`AUTHORIZED`, `DENIED` y `CONDITIONAL`— está ratificado. La política pendiente **solo** afecta a los errores técnicos terminales. Un resultado de negocio exitoso no queda fuera de la regla general de replay por la existencia de una política pendiente sobre errores técnicos.

### 7.8 Sustitución de autorización

- **No** se permite sustitución de autorización activa en v1.
- Una autorización expirada permanece histórica.
- Una nueva autorización puede emitirse después del vencimiento de la anterior.
- Revocación anticipada fuera del alcance inicial de v1.

### 7.9 Aspectos pendientes de consolidación formal

- Integración completa del contrato UC-04 en este Documento B.
- **DTO de `CONDITIONAL`** — estructura **DIFERIDA**, aunque el resultado ya esté obligado a explicitar condiciones concretas y su replay ya esté ratificado (§7.7).
- **Política de replay idempotente de errores terminales técnicos** — **PENDIENTE**.
- **Comportamiento específico de `SERVICE_UNAVAILABLE`** frente a reintentos — **PENDIENTE**.
- **Secuencia completa de precondiciones** más allá de lo ratificado — **propuesta a ratificar**.
- Ratificación textual final del catálogo de errores §7.5 como cierre de UC-04.

### 7.10 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Las decisiones enumeradas están ratificadas; su consolidación documental no equivale al cierre del contrato. Sin implementación. Sin verificación.

---

## 8. UC-05 — `RecognizeProposalCommand` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Su contrato específico no se ha iniciado.

Contexto ratificado por 18.6.4 (no contrato):

- `Recognition` es un **hecho logístico**.
- Requiere autorización válida.
- La evaluación debe revisarse nuevamente antes del reconocimiento.
- La primera versión será atómica: todas las asignaciones se reconocen o ninguna.
- `Recognition` referencia una `Transition` mediante una **referencia opaca**.
- `AUTHORIZED` ≠ `RECOGNIZED`.
- La expiración posterior de una evaluación no invalida retroactivamente una Authorization emitida, pero el Recognition vuelve a comprobar las condiciones que correspondan.

Lo que **no** está definido y queda pendiente:

- Request/response conceptual.
- Precondiciones operativas.
- Catálogo de errores de UC-05.
- Atomicidad específica más allá de la ya ratificada.
- Relación con `contextRef` de la evaluación vigente.

**Estado:** SIN ABRIR. **No se anticipan decisiones.**

---

## 9. UC-06 — `RevokeAssignmentCommand` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Su contrato específico no se ha iniciado.

Contexto ratificado por 18.6.2 y 18.6.4 (no contrato):

- `REVOKED` **no** significa eliminado.
- Una revocación afecta una autorización o asignación dentro de FlowCore; no cancela automáticamente un efecto físico externo (coherente con Commit #12 §17).
- Compensación externa, si procede, es **acción gobernada nueva**, no rollback.

Lo que **no** está definido:

- Si UC-06 opera sobre `Assignment` o sobre `Authorization`, o ambos, con comandos separados.
- Si la revocación anticipada de `Authorization` es parte de UC-06 o un UC distinto.
- Request/response, precondiciones, errores.
- Relación con `Recognition` previo.

**Estado:** SIN ABRIR. **No se anticipan decisiones.**

---

## 10. UC-07 — `QueryProposalsRequest` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Consulta de propuestas. Contrato no iniciado.

Lo que **no** está definido:

- Filtros, paginación, `include`.
- Visibilidad según identidad autenticada y competencia.
- Semántica de "activas" vs "históricas" (referencia a §5.4.1 de UC-02, pero sin contrato propio).
- Request/response, errores.

**Estado:** SIN ABRIR.

---

## 11. UC-08 — `QueryAssignmentsRequest` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Consulta de asignaciones. Contrato no iniciado.

Lo que **no** está definido:

- Relación con `Recognition` (asignaciones reconocidas vs propuestas).
- Visibilidad según identidad y competencia.
- Filtros, paginación, `include`.
- Request/response, errores.

**Estado:** SIN ABRIR.

---

## 12. UC-09 — `QueryEvidenceRequest` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Consulta de evidencia. Contrato no iniciado.

Contexto ratificado por 18.6.5 (no contrato):

- Evidence original, `EvidenceAssessment`, `EvidenceLink` son entidades distintas.
- La aceptación de evidencia depende de la afirmación o decisión a la que se vincula.
- Un hash prueba integridad respecto de una referencia, no identidad ni procedencia por sí solo.
- La invalidación no reescribe historia ni revoca automáticamente.

Lo que **no** está definido:

- Cómo se consulta evidencia vinculada a una Proposal, Authorization o Recognition.
- Cómo se expone la distinción original / assessment / link.
- Request/response, errores.

**Estado:** SIN ABRIR.

---

## 13. Catálogo consolidado de errores (referencial, no cerrado)

Errores utilizados o ratificados en UC-01..UC-04. **No** es un catálogo cerrado del contrato completo; se completará con UC-05..UC-09.

| Código | Origen | Notas |
|---|---|---|
| `INVALID_INPUT` | Envelope / UC | Con `field` y `reasonCode` cuando aplique. |
| `TASK_SEQUENCE_EMPTY` | UC-03 | |
| `DUPLICATE_TASK_IN_SEQUENCE` | UC-03 | |
| `TASK_NOT_FOUND` | UC-03 | |
| `VEHICLE_NOT_FOUND` | UC-03 | |
| `SCENARIO_NOT_FOUND` | UC-01/02/03 | |
| `SCENARIO_VERSION_MISMATCH` | UC-02/03 | |
| `SCENARIO_ALREADY_EXISTS` | UC-01 | |
| `UNSUPPORTED_SCENARIO_VERSION` | UC-01 | Código ratificado. |
| `INVALID_SCENARIO_DATA` | UC-01 | |
| `IDEMPOTENCY_CONFLICT` | Envelope / UC | Misma clave, argumentos distintos. |
| `UNSUPPORTED_PROPOSAL_SOURCE` | UC-03 | |
| `EVALUATION_EXECUTION_FAILED` | UC-03 | |
| `PROPOSAL_NOT_FOUND` | UC-04 | |
| `PROPOSAL_VERSION_MISMATCH` | UC-04 | |
| `PROPOSAL_NOT_AUTHORIZABLE` | UC-04 | Exclusivo de condiciones de la Proposal. |
| `EVALUATION_EXPIRED` | UC-04 | |
| `EVALUATION_VERSION_MISMATCH` | UC-04 | |
| `AUTHORIZATION_ALREADY_ACTIVE` | UC-04 | |
| `UNAUTHENTICATED` | Envelope / UC | |
| `FORBIDDEN` | Envelope / UC | |
| `SERVICE_UNAVAILABLE` | Envelope / UC | Transitorio. Comportamiento frente a replay idempotente: **PENDIENTE**. |

**`INVALID_TIME_WINDOW` no es un código de error de primer nivel.** Es un `reasonCode` que aparece bajo `INVALID_INPUT`, con `field: "arguments.requestedWindow"`, exclusivamente para entrada malformada en UC-03 (intervalo invertido o instante sin offset).

**Política de replay de errores terminales:** PENDIENTE de ratificación. No se presenta como decisión cerrada. **No** afecta al replay de resultados exitosos, que está ratificado en UC-01 §4.7 regla 2, UC-03 §6.9 regla 1 y UC-04 §7.7 (incluye `AUTHORIZED`, `DENIED` de negocio y `CONDITIONAL`).

Consolidación definitiva: pendiente de UC-05..UC-09.

---

## 14. Relaciones con contratos outbound

Referencia explícita para evitar colapso de vocabulario:

| Concepto inbound (este documento) | Concepto outbound relacionado | Diferencia |
|---|---|---|
| `Command` de UC (inbound) | `Command` de Commit #12 (outbound ejecución) | Distinta dirección, distinto origen de autoridad, distintas invariantes. |
| `idempotencyKey` (cliente) | `IdempotencyKey = f(CommandId)` (Commit #12) | Distinta semántica, distinta fuente. |
| `requestId` (servidor) | `CommandId` (Commit #12) | `requestId` identifica una solicitud inbound; `CommandId` identifica una intención outbound. |
| Veredictos `ELIGIBLE/INELIGIBLE/CONDITIONAL/UNDETERMINED` | `KnowledgeState` (Commit #12) | Veredicto de evaluación logística vs estado epistemológico de ejecución física. |
| `Authorization` de UC-04 | `Authorization` de Commit #12 | UC-04 autoriza una Proposal; Commit #12 asume autorización para despachar un Command outbound. La primera es upstream de la segunda en una cadena posible, pero no son la misma entidad. |
| Consultas de routing | `routing-port.md` | Proveedor aporta datos; dominio evalúa. `routing-port` no evalúa elegibilidad operacional. |

---

## 15. Estado consolidado por caso de uso

| UC | Nombre | Estado | Implementación | Verificación |
|---|---|---|---|---|
| ApplicationEnvelope | (contrato de envoltorio) | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-01 | `InitializeScenarioCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-02 | `QueryScenarioRequest` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-03 | `ProposeRoutesCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-04 | `AuthorizeProposalCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-05 | `RecognizeProposalCommand` | SIN ABRIR | No | No |
| UC-06 | `RevokeAssignmentCommand` | SIN ABRIR | No | No |
| UC-07 | `QueryProposalsRequest` | SIN ABRIR | No | No |
| UC-08 | `QueryAssignmentsRequest` | SIN ABRIR | No | No |
| UC-09 | `QueryEvidenceRequest` | SIN ABRIR | No | No |

---

## 16. Deudas y pendientes de esta fase

| Deuda | Estado |
|---|---|
| `contractVersion`: obligatoriedad, valor/versionado concreto y compatibilidad | PENDIENTE |
| Consolidación formal de ApplicationEnvelope (modelo de `result`/`error` por UC) | PENDIENTE |
| Consolidación formal de UC-01 (política por defecto si `scenarioFormatVersion` se omite; modelo de `warnings`; forma específica de `summary`/`metadata`; catálogo completo de `taskType` y estados de tarea como referencia al dominio) | PENDIENTE |
| Replay de **errores terminales** (transversal a UC-01..UC-04) | PENDIENTE |
| Replay de **resultados exitosos** (UC-01: éxito; UC-03: éxito; UC-04: `AUTHORIZED`, `DENIED`, `CONDITIONAL`) | **RATIFICADO**; no es deuda |
| Precedencia entre dimensiones `CONDITIONAL` y `UNDETERMINED` en UC-03 §6.6 | PENDIENTE |
| Consolidación formal de UC-02 (estructura interna de secciones; política por defecto de `include`; estructura de `scenario_projection`) | PENDIENTE |
| Consolidación formal de UC-03 (dimensiones específicas de `evaluation.dimensions`; estructura de `contextRef`) | PENDIENTE |
| Consolidación formal de UC-04 | PENDIENTE |
| DTO de `CONDITIONAL` en UC-04 | DIFERIDO |
| Comportamiento de `SERVICE_UNAVAILABLE` frente a reintentos | PENDIENTE |
| Secuencia completa de precondiciones de UC-04 | PROPUESTA A RATIFICAR |
| Contrato de UC-05 | SIN ABRIR |
| Contrato de UC-06 | SIN ABRIR |
| Contrato de UC-07 | SIN ABRIR |
| Contrato de UC-08 | SIN ABRIR |
| Contrato de UC-09 | SIN ABRIR |
| Catálogo consolidado de errores (tras UC-05..UC-09) | PENDIENTE |
| Revisión de coherencia transversal entre los nueve UC | PENDIENTE |
| Decisiones sobre tecnología de Application Layer | PENDIENTE |
| Materialización de este documento en el repositorio | PENDIENTE (Guss) |

---

## 17. Notas de honestidad documental

1. Este documento ha sido revisado técnicamente por Kael y **aprobado como registro contractual de decisiones conceptuales**. Su materialización en el repositorio corresponde a Guss.
2. **Ningún** UC tiene implementación ni verificación a la fecha del corte.
3. **`CONSOLIDADO` no se utiliza en v0.7** como etiqueta de estado de UC. Un contrato solo puede declararse `CONSOLIDADO` cuando contiene definición suficiente de solicitud, respuesta, resultados, errores y reglas aplicables. Ninguno de los UC alcanza ese nivel en v0.7.
4. UC-01 a UC-04 están **RATIFICADOS CONCEPTUALMENTE**, pero **no consolidados formalmente**. Sus decisiones ratificadas se registran explícitamente; sus elementos pendientes se identifican por UC.
5. UC-05 a UC-09 están **SIN ABRIR**. Lo que aparece como "contexto ratificado" en §8–§12 proviene de 18.6.1–18.6.5 y **no constituye contrato** de esos UC.
6. Las referencias a Commit #12 y `routing-port.md` son **de contexto**, no de importación. Ningún concepto outbound se reutiliza como contrato inbound.
7. Los códigos de error listados en §13 son los ratificados en UC-01..UC-04. El catálogo definitivo se cierra tras UC-05..UC-09. La política de replay de errores terminales permanece **pendiente**. El replay de resultados exitosos está ratificado.
8. **`INVALID_TIME_WINDOW`** es un `reasonCode` bajo `INVALID_INPUT`, no un código de error de primer nivel.
9. **`requestId`** es generado por el servidor/gateway; **nunca** lo suministra el cliente.
10. **`contractVersion` ≠ `scenarioFormatVersion` ≠ `scenarioVersion`**: tres identificadores independientes. La obligatoriedad, valor/versionado y compatibilidad de `contractVersion` están **pendientes**.
11. Historial de correcciones incorporadas hasta v0.7:
    - **B-01 a B-05** (v0.2): retiro de `CONSOLIDADO` como etiqueta de UC; ampliación de ApplicationEnvelope; separación ratificado vs propuesta en UC-04; aclaración de `INVALID_TIME_WINDOW` como `reasonCode`; delimitación de UC-05..UC-09 sin anticipación.
    - **B-06 a B-09** (v0.3): separación solicitud/respuesta en ApplicationEnvelope; recuperación de campos ratificados de UC-01..UC-03; `CONDITIONAL` obligado a explicitar condiciones; expiración de evaluación no invalida Authorization; `requestId` generado por servidor; `contractVersion` ≠ `scenarioFormatVersion` ≠ `scenarioVersion`.
    - **B-10 a B-14** (v0.4): `scenarioFormatVersion` opcional en UC-01; `UNSUPPORTED_SCENARIO_VERSION`; `scenarioVersion = 1` en inicialización; estructura mínima de `data` y `Task`; tres casos de idempotencia en UC-01; `activeProposals` incluye `PROPOSED` y `AUTHORIZED`; `expectedScenarioVersion` opcional en UC-03; `taskType` desconocido → `UNDETERMINED`.
    - **B-15, B-16, B-17** (v0.5–v0.6): precisiones de `Task` en UC-01; replay de resultados exitosos ratificado y separado del replay de errores terminales pendiente; idempotencia explícita en UC-03 con la misma separación.
    - **B-18** (v0.7): replay explícito de `CONDITIONAL` en UC-04, reproduciendo las condiciones concretas originales y sin crear Authorization. Los tres replays de resultados de negocio (`AUTHORIZED`, `DENIED`, `CONDITIONAL`) quedan agrupados como ratificados; el replay de errores técnicos terminales permanece pendiente.
12. La numeración de secciones es estable dentro de v0.7; cambios futuros se harán por revisión completa del documento (regla de entrega documental).

---

## 18. Estado del documento

```
Documento: fase-18.6.6-contratos-de-intercambio.md
Versión:   v0.7 — B-18 incorporada sobre v0.6
Estado:    🟢 APROBADO — listo para materialización por Guss
Cobertura: ApplicationEnvelope, UC-01..UC-09 (con estados diferenciados)
Ratificado conceptualmente:   ApplicationEnvelope, UC-01, UC-02, UC-03, UC-04 (consolidación formal pendiente)
Replay de resultados exitosos: RATIFICADO en UC-01 §4.7, UC-03 §6.9, UC-04 §7.7
  (UC-04 cubre expresamente AUTHORIZED, DENIED y CONDITIONAL)
Sin abrir:                    UC-05, UC-06, UC-07, UC-08, UC-09
Pendiente: materialización por Guss; consolidación formal de contratos; apertura de UC-05..UC-09
No crea:   decisiones nuevas fuera de las ratificadas en Fase 18
No modifica: código, FlowCore, GeoWorkbench, Greedy, Commit #12, routing-port.md
```