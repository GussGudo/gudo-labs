# Fase 18.6.6 — Contratos de Intercambio

**Proyecto:** Gudo Labs / FlowCore
**Alcance:** Contratos de intercambio entre GeoWorkbench, Application Layer, Logistics Domain y FlowCore Kernel
**Versión:** v0.8 — cuarta corrección (aprobada por Kael)
**Estado:** 🟢 APROBADO — pendiente de materialización por Guss
**Naturaleza:** Registro contractual de la frontera inbound. Complementa —no sustituye— `commit-12-executable-software-contracts.md` (outbound ejecución) y `routing-port.md` (outbound consulta).
**Fecha de corte:** Fase 18.6.6, tras revisión final de Kael de Etapa 4.

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

**Nota terminológica (v0.8):** el término `CONSOLIDADO` se retira como etiqueta de estado de UC. Un contrato solo puede declararse `CONSOLIDADO` cuando contiene definición suficiente de solicitud, respuesta, resultados, errores y reglas aplicables. Ninguno de los UC alcanza ese nivel en v0.8.

**Nota metodológica (v0.8):** en los UC con decisiones ratificadas se registran explícitamente los campos y reglas ya cerrados, junto a los aspectos que permanecen pendientes de consolidación formal. "Consolidación formal pendiente" **no significa borrar decisiones ya cerradas**; significa completar el contrato con los elementos faltantes sin perder los ratificados.

**Nota de corrección (v0.8):** recuperar una decisión ratificada no significa introducir una decisión nueva; tampoco completar silenciosamente lo que aún no se ha decidido. Cuando un dato no está ratificado, se marca como PENDIENTE, no se rellena por inferencia. No se cierra por redacción lo que sigue abierto por decisión, ni se deja ambiguo lo que ya está decidido. Una decisión ratificada para un UC específico no se extiende a otros UC sin ratificación expresa.

**Nota de alcance (v0.8):** esta versión integra las cuatro deudas transversales cerradas en Etapa 4, las correcciones K-01 a K-04, la precisión sobre el alcance del actor en la identidad idempotente, las correcciones K-05 a K-07, las correcciones K-08 y K-09 derivadas de la cuarta iteración, las dos precisiones menores de la revisión final, y la observación editorial de §7.10. No abre UC-05 ni anticipa decisiones de Recognition. No introduce implementación, JSON Schema ni estructuras Rust.

---

## 1. Propósito y alcance

Este documento consolida los **contratos de intercambio** de Fase 18.6.6: la frontera **inbound** entre GeoWorkbench, Application Layer, Logistics Domain y FlowCore Kernel.

**Queda dentro del alcance:**
- `ApplicationEnvelope` (incluida `contractVersion` ratificada en D1).
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

Envoltorio común de todas las solicitudes y respuestas inbound entre GeoWorkbench y Application Layer.

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
- `contractVersion` — **obligatoria** en toda solicitud inbound. Ver §3.3.

**(c) Campos específicos por caso de uso (cuando correspondan)**

- `expectedScenarioVersion` — expectativa de versión declarada por el cliente en UC que la requieran. Su carácter opcional u obligatorio se define **por UC**, no aquí.
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

### 3.2 Reglas generales del envelope — ratificadas

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

### 3.3 `contractVersion` — RATIFICADO (D1)

#### 3.3.1 Definición

`contractVersion` identifica la versión del **contrato de intercambio inbound completo**.

**No** es `scenarioFormatVersion` (versión del formato de escenario, UC-01) ni `scenarioVersion` (versión del estado del escenario). Los tres identificadores son independientes.

#### 3.3.2 Obligatoriedad

`contractVersion` es **obligatoria en toda solicitud inbound**, independientemente de si es consulta o comando. Esto incluye UC-01, UC-02, UC-03, UC-04 y los casos de uso futuros.

Consecuencias:

- Campo ausente: `INVALID_INPUT`.
- Campo malformado: `INVALID_INPUT`.
- No se admite versión predeterminada silenciosa.
- El servidor **no debe inferir** la versión a partir de los campos del payload.

La uniformidad del envelope prevalece sobre la conveniencia de hacer opcional el campo en consultas.

#### 3.3.3 Alcance

Una **versión global del contrato inbound**. En esta etapa **no** existen:

- Versiones independientes por UC.
- Versiones independientes para comandos y consultas.
- Versiones por familia de operaciones.

Una modificación incompatible de cualquiera de las familias puede requerir una nueva versión del contrato inbound. Esto **no** implica que debamos incrementar la versión ante cualquier modificación interna o documental.

#### 3.3.4 Versión no soportada

| Situación | Resultado |
|---|---|
| Campo ausente | `INVALID_INPUT` |
| Campo malformado | `INVALID_INPUT` |
| Versión válida, pero no soportada | `UNSUPPORTED_CONTRACT_VERSION` |
| Versión válida y soportada | Continúa el procesamiento |

`UNSUPPORTED_CONTRACT_VERSION` identifica un **problema de compatibilidad contractual**, no un rechazo de negocio. Ver §13.

#### 3.3.5 Compatibilidad

El servidor acepta una versión cuando esa versión exacta está **explícitamente soportada**.

Puede mantener varias versiones soportadas simultáneamente, pero **no se presume compatibilidad** entre ellas.

Ejemplo conceptual:

| Versión solicitada | Versiones soportadas | Resultado |
|---|---|---|
| 1.0 | 1.0 | Aceptada |
| 1.0 | 1.0 y 1.1 | Aceptada |
| 1.0 | 1.1 | `UNSUPPORTED_CONTRACT_VERSION` |
| 1.2 | 1.0 y 1.1 | `UNSUPPORTED_CONTRACT_VERSION` |

**No se incorpora** en esta etapa:

- Negociación cliente-servidor.
- Compatibilidad semántica automática.
- Conversión implícita entre versiones.
- Descubrimiento dinámico de capacidades.

La coexistencia de versiones será responsabilidad del servidor y de su política explícita de soporte.

#### 3.3.6 `contractVersion` forma parte de la identidad idempotente

`contractVersion` participa en la identidad idempotente en todos los UC que usen idempotencia. Ratificado por **D1**.

En particular, una misma `idempotencyKey` presentada bajo dos versiones contractuales distintas produce `IDEMPOTENCY_CONFLICT`. Ver §3.5.

#### 3.3.7 Asuntos diferidos de `contractVersion`

- Formato concreto de la cadena de versión.
- Política de incremento y publicación de versiones.
- Periodos de coexistencia y retirada de versiones antiguas.
- Mecanismo técnico para detectar la reutilización de una misma clave bajo versiones contractuales distintas.

Estos detalles no bloquean las decisiones ratificadas.

### 3.4 Elementos pendientes de consolidación formal

- Modelo completo de `result` por caso de uso (campos específicos ratificados por UC; ver §4, §5, §6).
- Modelo completo de `error` más allá del catálogo de códigos (§13).
- Modelo de metadatos adicionales del cliente, si se incorporan en el futuro.

### 3.5 Identidad idempotente — definición transversal (K-01, K-04, K-08, D1, D5)

Esta sección define el **alcance transversal** de la identidad idempotente. Distingue lo ratificado por D1 (aplicable a todos los UC con idempotencia) de lo ratificado por D5 (aplicable solo a UC-04), y de lo que permanece pendiente.

#### 3.5.1 Componentes de la identidad

La identidad idempotente se compone de:

```
(componentes ratificados) + argumentos de la solicitud
```

Componentes y estado de ratificación:

| Componente | Ratificación | Alcance |
|---|---|---|
| **`contractVersion`** | **D1** | Todos los UC que usen idempotencia (UC-01, UC-03, UC-04). |
| **`idempotencyKey`** | Ratificado para UC-01, UC-03, UC-04 | Suministrada por el cliente. |
| **`actor autenticado`** | **D5** solo para **UC-04** | **PENDIENTE** para UC-01 y UC-03. |
| **`argumentos`** | Ratificado por UC | Campos específicos que definen la intención operacional. |

**`actor autenticado`** se obtiene del `RequestContext` construido por el servidor. **Nunca** de `declaredActor` ni de campos del payload.

#### 3.5.2 Reglas ratificadas transversalmente

Aplicables a los UC que usen idempotencia (**UC-01, UC-03, UC-04**). UC-02 **no** tiene idempotencia ratificada actualmente (ver §3.5.3).

1. **Precedencia de autenticación sobre idempotencia — alcance distinto por UC.**
   - **UC-04: RATIFICADO por D5.** La consulta de idempotencia se ejecuta **después** de la autenticación y del permiso de operación. Sin identidad autenticada no se puede buscar replay.
   - **UC-01 y UC-03: PENDIENTE.** D5 no extendió esa precedencia a estos UC. El orden de autenticación, permiso e idempotencia no está ratificado en esta versión (§3.5.7, §4.9, §6.10).
2. **Misma identidad + mismos argumentos + resultado de negocio consolidado** → **reproducir el resultado consolidado original**. No se reejecuta la operación.
3. **Misma identidad + argumentos distintos** → `IDEMPOTENCY_CONFLICT`.
4. **Misma `idempotencyKey` + `contractVersion` distinta** → `IDEMPOTENCY_CONFLICT` (ratificado por D1). **No** se trata como identidad nueva ni como intención nueva implícita. **No** se asume equivalencia semántica entre versiones distintas.
5. **Misma identidad + error técnico sin resultado de negocio consolidado** → no hay resultado que reproducir; el reintento puede reejecutar. **`SERVICE_UNAVAILABLE` no se persiste** como resultado terminal replayable (D4).

#### 3.5.3 Alcance por UC — distinción explícita

| UC | Idempotencia en el contrato | `contractVersion` en identidad | `actor autenticado` en identidad | Precedencia auth/permiso antes de idempotencia | Estado global |
|---|---|---|---|---|---|
| **UC-01** | Sí | **Ratificado (D1)** | **PENDIENTE** | **PENDIENTE** | Identidad parcialmente ratificada: `(contractVersion, idempotencyKey)` + argumentos. Actor y orden de precondiciones PENDIENTES. |
| **UC-02** | No | N/A (UC-02 no tiene idempotencia ratificada en esta versión) | N/A | N/A | No aplica actualmente. |
| **UC-03** | Sí | **Ratificado (D1)** | **PENDIENTE** | **PENDIENTE** | Identidad parcialmente ratificada: `(contractVersion, idempotencyKey)` + argumentos. Actor y orden de precondiciones PENDIENTES. |
| **UC-04** | Sí | **Ratificado (D1)** | **Ratificado (D5)** | **Ratificado (D5)** | **Identidad y orden de precondiciones completos ratificados:** `(actor autenticado, contractVersion, idempotencyKey)` + argumentos, con precondiciones en el orden de §7.6. |

#### 3.5.4 Consecuencia pendiente de decisión en UC-01 y UC-03 (actor)

Mientras la inclusión del `actor autenticado` en la identidad idempotente de **UC-01 y UC-03** no se ratifique mediante decisión transversal o ratificación expresa, la identidad idempotente ratificada para esos UC es `(contractVersion, idempotencyKey)` + argumentos.

**Dependencia explícita que este documento registra sin resolver:** si esa ratificación no se produce antes de implementar UC-01 o UC-03, dos actores distintos que presenten la misma `idempotencyKey`, la misma `contractVersion` y los mismos argumentos podrían ser tratados como la misma solicitud idempotente. Esta es una cuestión de seguridad que debe resolverse **antes** de materializar la implementación de esos UC. Este documento **no decide** el resultado; solo registra la dependencia y el estado de ratificación.

#### 3.5.5 Consecuencia de diseño visible (K-01)

La implementación tendrá que poder detectar la reutilización de la misma `idempotencyKey` con una `contractVersion` distinta, aunque la versión forme parte de la identidad idempotente. El mecanismo técnico para conseguirlo **no queda definido** en este contrato conceptual; pertenece a implementación y queda registrado como asunto diferido (§16.2).

#### 3.5.6 No equivalencia semántica entre versiones

No se compara el payload byte a byte entre versiones ni se intenta traducirlo para fabricar equivalencias. Una misma intención de negocio expresada bajo contratos diferentes **no** constituye automáticamente la misma solicitud idempotente. Si el cliente quiere reutilizar la intención bajo una nueva versión contractual, debe usar una nueva `idempotencyKey`.

#### 3.5.7 Orden de precondiciones por UC — estado ratificado (K-08)

El orden completo de precondiciones (validación estructural → `contractVersion` → autenticación → permiso → idempotencia) fue ratificado por **D5 solo para UC-04** (§7.6).

Para **UC-01 y UC-03** no existe ratificación equivalente en esta versión. En particular, la precedencia de autenticación y permiso sobre la consulta idempotente, y el bloqueo del replay por esos pasos previos, quedan **PENDIENTES de ratificación expresa o decisión transversal**. Este documento **no invierte** el orden ni decide uno nuevo; solo registra que ese orden no está ratificado para esos dos UC.

La diferencia entre UC-04 y UC-01/UC-03 es sobre el **orden de ejecución** de las precondiciones, no sobre la identidad idempotente:
- La inclusión de `contractVersion` en la identidad está ratificada por D1 para todos.
- La inclusión del `actor autenticado` está ratificada por D5 solo para UC-04; PENDIENTE para UC-01 y UC-03.
- El orden de ejecución de las precondiciones está ratificado por D5 solo para UC-04; PENDIENTE para UC-01 y UC-03.

### 3.6 Estado

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
| Envelope | Sí | Envelope | Incluye `contractVersion` obligatoria (§3.3). |

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

**Errores o resultados no replayables:**
- `INVALID_INPUT` (con `field`/`reasonCode` cuando aplique).
- `UNSUPPORTED_CONTRACT_VERSION`.
- `UNAUTHENTICATED`.
- `FORBIDDEN`.
- `IDEMPOTENCY_CONFLICT`.
- `SERVICE_UNAVAILABLE`.

**Rechazos de negocio (replayables si quedan consolidados):**
- `SCENARIO_ALREADY_EXISTS` — si el `scenarioId` ya existe y no procede la reproducción idempotente.

**Clasificación pendiente — no se asigna por conveniencia documental (ver §13.3):**
- `INVALID_SCENARIO_DATA` — su semántica apunta a validación de datos; su clasificación definitiva (validación estructural vs rechazo de negocio) no está ratificada.
- `UNSUPPORTED_SCENARIO_VERSION` — su relación con incompatibilidad contractual vs rechazo de negocio no está ratificada.

**Nota de trazabilidad (K-07):** `SCENARIO_NOT_FOUND` **no** se lista como error de UC-01. UC-01 crea un escenario; su conflicto de existencia es `SCENARIO_ALREADY_EXISTS`, no `SCENARIO_NOT_FOUND`. Ver §13.2.

La clasificación distingue por naturaleza del resultado, no por la palabra "error" en el código. Ver §13.

### 4.7 Reglas de idempotencia ratificadas (D1 + D2+D4 + K-01 + K-08)

**Identidad idempotente de UC-01 (estado ratificado actual):**

`(contractVersion, idempotencyKey)` + argumentos.

- `contractVersion` participa en la identidad idempotente (ratificado por **D1**).
- **`actor autenticado` en la identidad: PENDIENTE** (§3.5.3, §3.5.4). Mientras no se ratifique, la identidad de UC-01 no incluye al actor.
- **Misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT`** (ratificado por D1).
- **Orden de precondiciones (autenticación, permiso, idempotencia): NO RATIFICADO para UC-01.** D5 ratificó ese orden solo para UC-04. Para UC-01 queda **PENDIENTE** (§3.5.7, §4.9).

**Reglas específicas de UC-01:**

1. **Precedencia de la búsqueda idempotente sobre `SCENARIO_ALREADY_EXISTS`.** Un reintento con la misma identidad y argumentos no produce `SCENARIO_ALREADY_EXISTS`; se resuelve conforme a las reglas 2–4.
2. **Misma identidad + mismos argumentos + resultado de negocio consolidado** (éxito o rechazo de negocio consolidado) → **reproducir el resultado consolidado original**. No se reejecuta la operación.
3. **Misma identidad + argumentos distintos** → `IDEMPOTENCY_CONFLICT`.
4. **`idempotencyKey` nueva + `scenarioId` ya existente** → `SCENARIO_ALREADY_EXISTS` (rechazo de negocio, replayable bajo la nueva clave si se consolida).
5. **Misma identidad + error técnico sin resultado de negocio consolidado** → no hay resultado que reproducir; el reintento puede reejecutar. **`SERVICE_UNAVAILABLE` no se persiste** como resultado terminal replayable (D4).

**Bloqueo del replay por pasos previos — PENDIENTE de ratificación para UC-01 (K-08):**
- D5 ratificó ese bloqueo para UC-04 (§7.6, §7.7).
- Para UC-01, la secuencia de autenticación, permiso e idempotencia **no está ratificada** en esta versión (§3.5.7).
- Este documento **no decide** el orden; lo registra como asunto pendiente (§4.9).

### 4.8 Atomicidad (D2+D4)

El resultado de negocio y la consolidación de los efectos de la operación constituyen **una sola unidad lógica**.

Si la operación no llegó a consolidarse, no existe resultado de negocio que reproducir. Si se consolidó el resultado, el registro idempotente permite recuperar ese resultado original. Si la respuesta se pierde después de consolidar la operación, el siguiente intento con la misma identidad recupera el resultado original. El servidor **no debe ejecutar nuevamente** una operación cuyo resultado ya quedó consolidado.

El **mecanismo técnico** de esa atomicidad pertenece a implementación, no a este contrato.

### 4.9 Elementos pendientes de consolidación formal

- Política por defecto cuando `scenarioFormatVersion` se omite.
- Modelo completo de `warnings`.
- Forma específica de `summary` y `metadata` (se referencia el formato 1.0; no se duplica aquí).
- Catálogo completo de `taskType` y de estados de tarea — pertenecen al dominio; aquí solo se referencia el mínimo estructural.
- Clasificación definitiva de `INVALID_SCENARIO_DATA` y `UNSUPPORTED_SCENARIO_VERSION` (§4.6, §13.3).
- **Inclusión del `actor autenticado` en la identidad idempotente de UC-01** (§3.5.4) — PENDIENTE de ratificación expresa o decisión transversal.
- **Orden de precondiciones de autenticación, permiso e idempotencia de UC-01** (§3.5.7) — PENDIENTE de ratificación (K-08).
- **Bloqueo del replay por pasos previos en UC-01** — PENDIENTE de ratificación, coherente con el punto anterior.
- Precondiciones detalladas más allá de las ratificadas.

### 4.10 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin implementación. Sin verificación.

---

## 5. UC-02 — `QueryScenarioRequest` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 5.1 Semántica

Consulta del estado de un escenario. Permite solicitar secciones mediante `include`.

**Nota de alcance (v0.8):** UC-02 **no tiene idempotencia ratificada** en esta versión. No se define `idempotencyKey` ni `IDEMPOTENCY_CONFLICT` para UC-02. La precisión sobre identidad idempotente (§3.5) no aplica actualmente a este UC. Si en el futuro se incorpora idempotencia a UC-02, se aplicaría la regla transversal con la distinción de §3.5.3 (actor y orden de precondiciones PENDIENTES para UC-02, igual que para UC-01 y UC-03).

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
| Envelope | Sí | Envelope | Incluye `contractVersion` obligatoria (§3.3). |

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

**Errores o resultados no replayables:**
- `INVALID_INPUT` (con `field`/`reasonCode` cuando aplique).
- `UNSUPPORTED_CONTRACT_VERSION`.
- `UNAUTHENTICATED`.
- `FORBIDDEN`.
- `SERVICE_UNAVAILABLE`.

**Rechazos de negocio (sin política de replay en UC-02, porque no hay idempotencia):**
- `SCENARIO_NOT_FOUND`.
- `SCENARIO_VERSION_MISMATCH`.

**Nota de alcance (K-09):** estos dos códigos son de naturaleza de negocio, pero **no** tienen política de replay en UC-02 porque la consulta **no utiliza idempotencia** en esta versión (§5.1). En UC-03 sí son replayables si quedan consolidados (§13.2).

### 5.6 Elementos pendientes de consolidación formal

- Estructura detallada de cada sección (campos internos de `activeProposals`, `activeAssignments`, etc.).
- Política por defecto de `include` cuando se omite.
- Modelo de paginación si aplica a alguna sección.
- Modelo de `warnings` si aplica.
- Estructura completa de `scenario_projection`.
- Si en el futuro se incorpora idempotencia a UC-02, definición de la identidad y precisión sobre el actor y el orden de precondiciones (§3.5.3).

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
| Envelope | Sí | Envelope | Incluye `contractVersion` obligatoria (§3.3). |

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

### 6.6 Dimensiones de evaluación y veredictos globales — RATIFICADO (D3)

La evaluación de UC-03 opera en dos niveles.

#### 6.6.1 Dimensiones de evaluación

| Dimensión | Significado |
|---|---|
| `PASS` | La dimensión se cumple sin reservas. |
| `FAIL` | La dimensión no se cumple. |
| `CONDITIONAL` | La dimensión se cumpliría bajo condiciones explícitas. |
| `UNDETERMINED` | No hay información suficiente para determinar la dimensión. |
| `NOT_EVALUATED` | La dimensión no se evaluó en este contexto. |

#### 6.6.2 Veredictos globales — precedencia ratificada

La prioridad es **global**, no contextual ni dependiente del nombre de la dimensión.

| Prioridad | Condición | Veredicto global |
|---|---|---|
| 1 | Alguna dimensión relevante presenta `FAIL` | `INELIGIBLE` |
| 2 | Sin `FAIL`, alguna dimensión relevante presenta `UNDETERMINED` | `UNDETERMINED` |
| 3 | Sin `FAIL` ni `UNDETERMINED`, alguna dimensión presenta `CONDITIONAL` | `CONDITIONAL` |
| 4 | Todas las dimensiones relevantes presentan `PASS` | `ELIGIBLE` |
| 5 | Todas las dimensiones están en `NOT_EVALUATED` | `UNDETERMINED` |

#### 6.6.3 Tratamiento de `NOT_EVALUATED` — ratificado

`NOT_EVALUATED` **no equivale** a `UNDETERMINED`.

- `NOT_EVALUATED`: la dimensión no fue evaluada en el contexto correspondiente.
- `UNDETERMINED`: la dimensión es relevante, pero no puede determinarse su resultado.

Por tanto:

- `NOT_EVALUATED` **no contribuye por sí mismo** al veredicto global.
- Si coexiste con `PASS` y `CONDITIONAL`, el resultado es `CONDITIONAL`.
- Si coexiste con `PASS` y `UNDETERMINED`, el resultado es `UNDETERMINED`.
- Si todas las dimensiones están en `NOT_EVALUATED`, el resultado es `UNDETERMINED`.

Esta regla **no autoriza** a marcar como `NOT_EVALUATED` una dimensión relevante que no pudo determinarse. En ese caso corresponde `UNDETERMINED`.

#### 6.6.4 Regla de `taskType` desconocido

Un `taskType` desconocido pero válido estructuralmente conduce a la dimensión correspondiente (p. ej. `eligibility` o `constraints`) como `UNDETERMINED`, y por tanto contribuye al veredicto global conforme a la prioridad 2, sin producir `FAIL` por sí mismo. No se rechaza la propuesta por esta causa.

#### 6.6.5 Consecuencias contractuales ratificadas

1. Una dimensión `FAIL` determina `INELIGIBLE`, independientemente de las demás.
2. Una dimensión relevante `UNDETERMINED` impide declarar `CONDITIONAL` o `ELIGIBLE`.
3. `CONDITIONAL` solo puede ser el veredicto global cuando no existen dimensiones relevantes `FAIL` ni `UNDETERMINED`.
4. `NOT_EVALUATED` no altera el resultado de las dimensiones efectivamente evaluadas.
5. **Ninguno de estos veredictos impide el registro** de la propuesta en UC-03.
6. `UNDETERMINED` **no significa rechazo**. Es una determinación válida de que la elegibilidad no pudo establecerse con la información disponible.
7. No se introduce un quinto veredicto ni se modifican las cuatro categorías existentes.

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

**Errores o resultados no replayables:**
- `INVALID_INPUT` (con `field`/`reasonCode` cuando aplique)
- `UNSUPPORTED_CONTRACT_VERSION`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `IDEMPOTENCY_CONFLICT`
- `SERVICE_UNAVAILABLE`
- `TASK_SEQUENCE_EMPTY` — validación estructural de la entrada
- `DUPLICATE_TASK_IN_SEQUENCE` — validación estructural de la entrada

**Rechazos de negocio (replayables si quedan consolidados):**
- `SCENARIO_NOT_FOUND`
- `SCENARIO_VERSION_MISMATCH`

**Clasificación pendiente — no se asigna por conveniencia documental (ver §13.3):**
- `TASK_NOT_FOUND` — la semántica específica (inexistencia semántica de la tarea dentro del escenario vs formato inválido de la referencia) **no está ratificada** en el contrato actual. No se presume como rechazo de negocio replayable.
- `VEHICLE_NOT_FOUND` — misma precisión que `TASK_NOT_FOUND`. La semántica específica no está ratificada.
- `UNSUPPORTED_PROPOSAL_SOURCE` — su relación con validación de campo vs rechazo de negocio no está ratificada.
- `EVALUATION_EXECUTION_FAILED` — la ausencia de resultado de negocio impide el replay, pero su clasificación específica de causas y política de reintento queda diferida (K-03).

`retryable` se conserva como **recomendación del servidor**, no como garantía.

### 6.9 Reglas de idempotencia ratificadas (D1 + D2+D4 + K-01 + K-08)

**Identidad idempotente de UC-03 (estado ratificado actual):**

`(contractVersion, idempotencyKey)` + argumentos.

- `contractVersion` participa en la identidad idempotente (ratificado por **D1**).
- **`actor autenticado` en la identidad: PENDIENTE** (§3.5.3, §3.5.4). Mientras no se ratifique, la identidad de UC-03 no incluye al actor.
- **Misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT`** (ratificado por D1).
- **Orden de precondiciones (autenticación, permiso, idempotencia): NO RATIFICADO para UC-03.** D5 ratificó ese orden solo para UC-04. Para UC-03 queda **PENDIENTE** (§3.5.7, §6.10).

**Reglas específicas de UC-03:**

1. **Misma identidad + mismos argumentos + resultado de negocio consolidado conforme a D2** (éxito o rechazo de negocio) → **reproducir el resultado consolidado original**. No se reejecuta el registro ni la evaluación.
2. **Misma identidad + argumentos distintos** → `IDEMPOTENCY_CONFLICT`.
3. **Misma identidad + error técnico sin resultado de negocio consolidado** → no hay resultado que reproducir; el reintento puede reejecutar. **`SERVICE_UNAVAILABLE` no se persiste** como resultado terminal replayable.

**Bloqueo del replay por pasos previos — PENDIENTE de ratificación para UC-03 (K-08):**
- D5 ratificó ese bloqueo para UC-04 (§7.6, §7.7).
- Para UC-03, la secuencia de autenticación, permiso e idempotencia **no está ratificada** en esta versión (§3.5.7).
- Este documento **no decide** el orden; lo registra como asunto pendiente (§6.10).

**Atomicidad (D2+D4):** la propuesta registrada y su evaluación, junto con el resultado idempotente, constituyen una unidad lógica. Si la evaluación falla técnicamente, **no se registra** la propuesta ni el resultado idempotente.

### 6.10 Elementos pendientes de consolidación formal

- Estructura detallada de `evaluation.dimensions` (qué dimensiones específicas se reportan, p. ej. `capacity`, `availability`, `eligibility`, `constraints`).
- Estructura de `contextRef` (contenido y política de retención).
- **Semántica específica de `TASK_NOT_FOUND` y `VEHICLE_NOT_FOUND`** (K-06): aclarar si se refieren a inexistencia semántica del recurso dentro del escenario (rechazo de negocio) o a formato inválido de la referencia (validación estructural).
- Clasificación definitiva de `UNSUPPORTED_PROPOSAL_SOURCE` (§6.8, §13.3).
- Clasificación específica de `EVALUATION_EXECUTION_FAILED` — política de reintento y clasificación de causas deterministas vs transitorias (K-03).
- Clasificación de otros errores técnicos distintos de `SERVICE_UNAVAILABLE`.
- **Inclusión del `actor autenticado` en la identidad idempotente de UC-03** (§3.5.4) — PENDIENTE de ratificación expresa o decisión transversal.
- **Orden de precondiciones de autenticación, permiso e idempotencia de UC-03** (§3.5.7) — PENDIENTE de ratificación (K-08).
- **Bloqueo del replay por pasos previos en UC-03** — PENDIENTE de ratificación, coherente con el punto anterior.

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
| Envelope | Sí | Envelope | Incluye `contractVersion` obligatoria (§3.3). **El cliente no suministra `requestId`**; ese campo lo genera el servidor. |

**Explícitamente ausentes del request:**

- `requestId` — generado por el servidor/gateway en el ingreso (no es campo que el cliente envíe).
- `authorizedAt`, `expiresAt` — los fija el dominio/aplicación por política.
- `authorizedBy` — se obtiene del `RequestContext` autenticado.
- Representaciones de competencia, autoridad o `FenceEpoch`.
- `declaredActor` del envelope no participa.

**Identidad idempotente de UC-04 (ratificada por D5):**

`(actor autenticado, contractVersion, idempotencyKey)` + argumentos.

**Orden de precondiciones de UC-04:** el de §7.6, ratificado por D5. La autenticación y el permiso preceden a la consulta de idempotencia. **Misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT`**.

### 7.4 Respuesta — estructura conceptual

- **`AUTHORIZED`** (`SUCCESS`): `authorizationId`, `proposalId`, `proposalVersion`, `authorizedBy`, `authorizedAt`, `expiresAt`, `policyVersion`, `policyRef`, `evaluationReference`.
- **`DENIED`** (`SUCCESS`): `proposalId`, `proposalVersion`, `denialReason: "INSUFFICIENT_COMPETENCE"`, `evaluationReference` opcional. **No crea Authorization.** Es rechazo de negocio, replayable.
- **`CONDITIONAL`** (`SUCCESS`): `proposalId`, `proposalVersion`, y **las condiciones concretas pendientes que generan el resultado**. El DTO específico de esas condiciones permanece **DIFERIDO**, pero un `CONDITIONAL` **debe** explicitar qué condiciones lo producen. **No crea Authorization.** Es resultado de negocio, replayable.
- **`ERROR`** (`ERROR`): catálogo §7.5.

### 7.5 Catálogo de errores ratificados

**Errores o resultados no replayables:**
- `INVALID_INPUT` (con `field`/`reasonCode` cuando aplique)
- `UNSUPPORTED_CONTRACT_VERSION`
- `UNAUTHENTICATED`
- `FORBIDDEN` — denegación de acceso; **no** confundir con `DENIED`
- `IDEMPOTENCY_CONFLICT`
- `SERVICE_UNAVAILABLE` — `retryable: true`, no replayable

**Rechazos de negocio replayables (si quedan consolidados):**
- `PROPOSAL_NOT_FOUND`
- `PROPOSAL_VERSION_MISMATCH`
- `PROPOSAL_NOT_AUTHORIZABLE`
- `EVALUATION_EXPIRED`
- `EVALUATION_VERSION_MISMATCH`
- `AUTHORIZATION_ALREADY_ACTIVE`

La clasificación depende de la **naturaleza del resultado**, no de que el código contenga la palabra "error". `FORBIDDEN` ≠ `DENIED`.

### 7.6 Orden de precondiciones — RATIFICADO (D5)

La secuencia es **contractual**, no una prescripción de implementación interna. No obliga a utilizar una transacción específica ni determina cómo se recuperan estados intermedios.

| Orden | Verificación | Resultado |
|---|---|---|
| 1 | Validación estructural del envelope y request | `INVALID_INPUT` |
| 2 | Validación de `contractVersion` | `INVALID_INPUT` / `UNSUPPORTED_CONTRACT_VERSION` |
| 3 | Autenticación | `UNAUTHENTICATED` |
| 4 | Permiso de operación | `FORBIDDEN` |
| 5 | Consulta de idempotencia | Replay original / `IDEMPOTENCY_CONFLICT` / continuar |
| 6 | Existencia de propuesta | `PROPOSAL_NOT_FOUND` |
| 7 | Coincidencia de versión de propuesta | `PROPOSAL_VERSION_MISMATCH` |
| 8 | Evaluación vinculada y condiciones de autorización | `PROPOSAL_NOT_AUTHORIZABLE` / `EVALUATION_EXPIRED` / `EVALUATION_VERSION_MISMATCH` |
| 9 | Ausencia de Authorization activa | `AUTHORIZATION_ALREADY_ACTIVE` |
| 10 | Evaluación de competencia logística | `AUTHORIZED` / `DENIED` / `CONDITIONAL` |
| 11 | Consolidación atómica | Resultado y efectos consolidados conjuntamente |

**Alcance de D5:** este orden aplica a **UC-04**. No se extiende a UC-01 ni a UC-03 en esta versión (§3.5.7, §4.9, §6.10).

**Nota de orden (D1 + D5):** `contractVersion` (paso 2) precede a la consulta de idempotencia (paso 5). Ausente o malformada → `INVALID_INPUT`. Válida pero no soportada → `UNSUPPORTED_CONTRACT_VERSION`. Soportada → se continúa con autenticación, permiso e idempotencia.

### 7.7 Reglas de replay e idempotencia — RATIFICADO (D2+D4 + D5 + K-01)

**Identidad idempotente de UC-04 (ratificada por D5):**

`(actor autenticado, contractVersion, idempotencyKey)` + argumentos.

Regla transversal ratificada:

- **Misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT`.** No se trata como identidad nueva ni como intención nueva implícita. No se asume equivalencia semántica entre versiones. **No se compara byte a byte el payload ni se traduce entre versiones para fabricar equivalencias.**

El mecanismo técnico para detectar la reutilización de la misma clave bajo versiones distintas pertenece a implementación y queda registrado como asunto diferido (§16.2).

**Replay con resultado consolidado:**

Cuando existe un resultado de negocio consolidado para la identidad idempotente y los argumentos coinciden:

1. Se devuelve el resultado original.
2. **No se reevalúan** las precondiciones de recurso ni las condiciones de negocio (pasos 6–10).
3. No se repiten efectos de la operación.
4. La evolución posterior del dominio no altera el resultado histórico.

**Replay por tipo de resultado de negocio consolidado:**

- **`AUTHORIZED`**: se reproduce el resultado original (incluidos `authorizationId`, `policyRef`, `evaluationReference`). No se crea una segunda Authorization.
- **`DENIED` de negocio** (competencia insuficiente): se reproduce el resultado original con su `denialReason`. **No crea Authorization.**
- **`CONDITIONAL`**: se reproduce el resultado original **incluidas las condiciones concretas que lo generaron**. **No crea Authorization.**
- **Rechazos de negocio de precondición** (`PROPOSAL_NOT_FOUND`, `PROPOSAL_VERSION_MISMATCH`, `PROPOSAL_NOT_AUTHORIZABLE`, `EVALUATION_EXPIRED`, `EVALUATION_VERSION_MISMATCH`, `AUTHORIZATION_ALREADY_ACTIVE`): se reproduce el rechazo original. **No crea Authorization.**

**Consecuencia ratificada:** un replay de `AUTHORIZED` sigue devolviendo la autorización original aunque posteriormente expire. Un replay de `PROPOSAL_NOT_FOUND` conserva ese rechazo aunque la propuesta se cree después. Una nueva intención operacional requiere una nueva `idempotencyKey`.

**Errores técnicos sin resultado de negocio consolidado:**

No se reproducen como resultado idempotente. Si no hay resultado consolidado, el reintento con la misma identidad y argumentos puede reejecutar la operación. **`SERVICE_UNAVAILABLE` no se persiste** (D4).

**Bloqueo del replay por pasos previos (D5, aplicable a UC-04):**

Los errores de los pasos 1–4 (estructura, `contractVersion`, autenticación, permiso) **preceden** al replay. Un resultado previo consolidado **no concede permiso** para saltarse las garantías actuales de interpretación contractual, identidad y acceso. Si una solicitud falla en cualquiera de esos pasos, se devuelve el error correspondiente, aunque exista un resultado consolidado bajo una clave que aparentemente coincide.

### 7.8 Atomicidad — RATIFICADO (D2+D4 + D5)

Para UC-04, la creación de Authorization y la consolidación de su resultado idempotente constituyen **una sola unidad lógica**.

- Consolidación exitosa: existe Authorization y existe el resultado idempotente correspondiente.
- Consolidación fallida: no queda una Authorization consolidada sin su resultado idempotente, ni un resultado idempotente que apunte a una Authorization inexistente.

El **mecanismo técnico** permanece fuera del contrato conceptual.

### 7.9 Sustitución de autorización

- **No** se permite sustitución de autorización activa en v1.
- Una autorización expirada permanece histórica.
- Una nueva autorización puede emitirse después del vencimiento de la anterior.
- Revocación anticipada fuera del alcance inicial de v1.

### 7.10 Aspectos pendientes de consolidación formal

- **Consolidación formal completa del contrato UC-04.** Las secciones §7.1–§7.11 registran las decisiones ratificadas; la consolidación formal completará los elementos diferidos y pendientes identificados en esta misma sección.
- **DTO de `CONDITIONAL`** — estructura **DIFERIDA**, aunque el resultado ya esté obligado a explicitar condiciones concretas y su replay ya esté ratificado.
- **Clasificación específica de `EVALUATION_EXECUTION_FAILED`** y otros errores técnicos distintos de `SERVICE_UNAVAILABLE` — DIFERIDA.
- **Detalles técnicos de persistencia y recuperación** — fuera del contrato conceptual; pertenecen a implementación.
- **Semántica y formato de `retryAfter`** — DIFERIDO por D4.
- **Incremento, publicación y retirada de versiones contractuales** — DIFERIDO por D1.
- **Mecanismo técnico para detectar reutilización de clave bajo versiones distintas** — DIFERIDO por K-01 (ver §3.3.7 y §16.2).
- **Persistencia idempotente y recuperación de resultados inciertos** — DIFERIDO por D2+D4.

### 7.11 Estado

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

Tres categorías conforme a K-02 y K-05:

- **Categoría A** — Resultados no replayables (validación, acceso, conflicto o fallo técnico sin resultado de negocio consolidado): no se registran para replay idempotente.
- **Categoría B** — Rechazo de negocio confirmado: replayable si queda consolidado. **Salvo en UC-02, donde la naturaleza de negocio se mantiene pero no hay política de replay por ausencia de idempotencia (K-09).**
- **Categoría C** — Clasificación pendiente: no se asigna por conveniencia documental.

### 13.1 Categoría A — Resultados no replayables (validación, acceso, conflicto o fallo técnico sin resultado de negocio consolidado)

| Código | Origen | Notas |
|---|---|---|
| `INVALID_INPUT` | Envelope / UC | Validación contractual/estructural. Con `field` y `reasonCode` cuando aplique. |
| `UNSUPPORTED_CONTRACT_VERSION` | Envelope | Incompatibilidad contractual. D1 ratificado. |
| `UNAUTHENTICATED` | Envelope / UC | Fallo de autenticación. |
| `FORBIDDEN` | Envelope / UC | Denegación de acceso. **No** confundir con `DENIED`. |
| `IDEMPOTENCY_CONFLICT` | Envelope / UC | Conflicto de identidad o argumentos; también misma `idempotencyKey` con `contractVersion` distinta (K-01). |
| `SERVICE_UNAVAILABLE` | Envelope / UC | Fallo técnico transitorio. `retryable: true`. No replayable. |
| `TASK_SEQUENCE_EMPTY` | UC-03 | Validación estructural de la entrada. |
| `DUPLICATE_TASK_IN_SEQUENCE` | UC-03 | Validación estructural de la entrada. |

### 13.2 Categoría B — Rechazo de negocio confirmado (replayable si consolidado, salvo UC-02)

| Código | Origen | Notas |
|---|---|---|
| `SCENARIO_ALREADY_EXISTS` | UC-01 | Conflicto de existencia al crear. Replayable si consolidado. |
| `SCENARIO_NOT_FOUND` | UC-02/03 | **K-09:** En **UC-03** es rechazo de negocio replayable si queda consolidado. En **UC-02** es rechazo de negocio, pero la política de replay **no aplica** porque UC-02 no tiene idempotencia en esta versión (§5.1). **UC-01 no incluido** (K-07): UC-01 crea el escenario; su conflicto es `SCENARIO_ALREADY_EXISTS`. |
| `SCENARIO_VERSION_MISMATCH` | UC-02/03 | **K-09:** En **UC-03** replayable si consolidado. En **UC-02** rechazo de negocio sin política de replay por ausencia de idempotencia. |
| `PROPOSAL_NOT_FOUND` | UC-04 | Replayable si consolidado. |
| `PROPOSAL_VERSION_MISMATCH` | UC-04 | Replayable si consolidado. |
| `PROPOSAL_NOT_AUTHORIZABLE` | UC-04 | Replayable si consolidado. |
| `EVALUATION_EXPIRED` | UC-04 | Replayable si consolidado. |
| `EVALUATION_VERSION_MISMATCH` | UC-04 | Replayable si consolidado. |
| `AUTHORIZATION_ALREADY_ACTIVE` | UC-04 | Replayable si consolidado. |

### 13.3 Categoría C — Clasificación pendiente (no asignada por conveniencia documental)

| Código | Origen | Motivo de la clasificación pendiente |
|---|---|---|
| `INVALID_SCENARIO_DATA` | UC-01 | Su semántica apunta a validación de datos; su clasificación definitiva (validación estructural vs rechazo de negocio) no está ratificada (K-02). |
| `UNSUPPORTED_SCENARIO_VERSION` | UC-01 | Su relación con incompatibilidad contractual vs rechazo de negocio no está ratificada (K-02). |
| `TASK_NOT_FOUND` | UC-03 | Su semántica específica (inexistencia semántica de la tarea dentro del escenario vs formato inválido de la referencia) no está ratificada en el contrato actual (K-06). |
| `VEHICLE_NOT_FOUND` | UC-03 | Misma precisión que `TASK_NOT_FOUND` (K-06). |
| `UNSUPPORTED_PROPOSAL_SOURCE` | UC-03 | Su relación con validación de campo vs rechazo de negocio no está ratificada (K-02). |
| `EVALUATION_EXECUTION_FAILED` | UC-03 | La ausencia de resultado de negocio impide el replay, pero su clasificación específica de causas y política de reintento queda diferida (K-03). |

### 13.4 Notas sobre el catálogo

- **`INVALID_TIME_WINDOW` no es un código de error de primer nivel.** Es un `reasonCode` bajo `INVALID_INPUT`, con `field: "arguments.requestedWindow"`, exclusivamente para entrada malformada en UC-03 (intervalo invertido o instante sin offset).
- **`FORBIDDEN` ≠ `DENIED`**: el primero es denegación de acceso (técnico); el segundo es resultado de negocio por insuficiencia de competencia logística (replayable).
- **`IDEMPOTENCY_CONFLICT`** cubre dos casos: (i) misma identidad + argumentos distintos; (ii) misma `idempotencyKey` + `contractVersion` distinta (K-01).
- **`SCENARIO_NOT_FOUND`** no aplica a UC-01 (K-07). UC-01 produce `SCENARIO_ALREADY_EXISTS`.
- **`SCENARIO_NOT_FOUND` y `SCENARIO_VERSION_MISMATCH`:** en UC-03 son replayables si consolidados; en UC-02 son rechazos de negocio sin política de replay por ausencia de idempotencia (K-09).
- **Política de replay de errores técnicos distintos de `SERVICE_UNAVAILABLE`**: DIFERIDA.
- **`retryAfter`**: DIFERIDO.
- Consolidación definitiva del catálogo: pendiente de UC-05..UC-09.

---

## 14. Relaciones con contratos outbound

Referencia explícita para evitar colapso de vocabulario:

| Concepto inbound (este documento) | Concepto outbound relacionado | Diferencia |
|---|---|---|
| `Command` de UC (inbound) | `Command` de Commit #12 (outbound ejecución) | Distinta dirección, distinto origen de autoridad, distintas invariantes. |
| `idempotencyKey` (cliente) | `IdempotencyKey = f(CommandId)` (Commit #12) | Distinta semántica, distinta fuente. La identidad idempotente inbound incluye `contractVersion` (D1); la inclusión del actor está ratificada por D5 para UC-04 y PENDIENTE para UC-01 y UC-03 (§3.5.3). El orden de precondiciones está ratificado por D5 solo para UC-04 (§3.5.7). |
| `requestId` (servidor) | `CommandId` (Commit #12) | `requestId` identifica una solicitud inbound; `CommandId` identifica una intención outbound. |
| Veredictos `ELIGIBLE/INELIGIBLE/CONDITIONAL/UNDETERMINED` | `KnowledgeState` (Commit #12) | Veredicto de evaluación logística vs estado epistemológico de ejecución física. |
| `Authorization` de UC-04 | `Authorization` de Commit #12 | UC-04 autoriza una Proposal; Commit #12 asume autorización para despachar un Command outbound. La primera es upstream de la segunda en una cadena posible, pero no son la misma entidad. |
| Consultas de routing | `routing-port.md` | Proveedor aporta datos; dominio evalúa. `routing-port` no evalúa elegibilidad operacional. |

---

## 15. Estado consolidado por caso de uso

| UC | Nombre | Estado | Implementación | Verificación |
|---|---|---|---|---|
| ApplicationEnvelope | (contrato de envoltorio) | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-01 | `InitializeScenarioCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente (actor y orden de precondiciones PENDIENTES, §3.5.3, §3.5.7) | No | No |
| UC-02 | `QueryScenarioRequest` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente (sin idempotencia en esta versión) | No | No |
| UC-03 | `ProposeRoutesCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente (actor y orden de precondiciones PENDIENTES, §3.5.3, §3.5.7) | No | No |
| UC-04 | `AuthorizeProposalCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-05 | `RecognizeProposalCommand` | SIN ABRIR | No | No |
| UC-06 | `RevokeAssignmentCommand` | SIN ABRIR | No | No |
| UC-07 | `QueryProposalsRequest` | SIN ABRIR | No | No |
| UC-08 | `QueryAssignmentsRequest` | SIN ABRIR | No | No |
| UC-09 | `QueryEvidenceRequest` | SIN ABRIR | No | No |

---

## 16. Deudas y pendientes de esta fase

### 16.1 Deudas cerradas en Etapa 4

| Deuda | Estado |
|---|---|
| D1 — `contractVersion` | **RATIFICADA** |
| D2 — Política de replay de resultados y errores | **RATIFICADA** |
| D4 — Política de `SERVICE_UNAVAILABLE` y reintentos | **RATIFICADA** |
| D5 — Precondiciones de UC-04 | **RATIFICADA** |
| D3 — Precedencia `CONDITIONAL` vs `UNDETERMINED` | **RATIFICADA** |

### 16.2 Asuntos diferidos de Etapa 4

| Asunto | Estado |
|---|---|
| Formato concreto de la cadena de `contractVersion` | DIFERIDO |
| Política de incremento y publicación de versiones | DIFERIDO |
| Periodos de coexistencia y retirada de versiones antiguas | DIFERIDO |
| Mecanismo técnico para detectar reutilización de clave bajo versiones distintas | DIFERIDO (K-01) |
| Semántica y formato de `retryAfter` | DIFERIDO |
| Clasificación detallada de `EVALUATION_EXECUTION_FAILED` | DIFERIDO (K-03) |
| Clasificación detallada de `INVALID_SCENARIO_DATA`, `UNSUPPORTED_SCENARIO_VERSION`, `UNSUPPORTED_PROPOSAL_SOURCE` | DIFERIDO (K-02) |
| Clasificación detallada de `TASK_NOT_FOUND` y `VEHICLE_NOT_FOUND` | DIFERIDO (K-06) |
| Clasificación de otros errores técnicos distintos de `SERVICE_UNAVAILABLE` | DIFERIDO |
| **Inclusión del `actor autenticado` en la identidad idempotente de UC-01 y UC-03** | **PENDIENTE de decisión transversal o ratificación expresa** (§3.5.3, §3.5.4) |
| **Orden de precondiciones de autenticación, permiso e idempotencia de UC-01 y UC-03** | **PENDIENTE de ratificación** (D5 solo ratificó el orden para UC-04) (§3.5.7, §4.9, §6.10) (K-08) |
| **Bloqueo del replay por pasos previos en UC-01 y UC-03** | **PENDIENTE de ratificación**, coherente con el punto anterior (K-08) |
| Persistencia idempotente y recuperación de resultados inciertos | DIFERIDO (implementación) |
| Detalles técnicos de persistencia y recuperación | DIFERIDO (implementación) |

### 16.3 Deudas documentales y de consolidación

| Deuda | Estado |
|---|---|
| Consolidación formal de ApplicationEnvelope (modelo de `result`/`error` por UC) | PENDIENTE |
| Consolidación formal de UC-01 (política por defecto `scenarioFormatVersion`, `warnings`, `summary`/`metadata`, catálogo `taskType`) | PENDIENTE |
| Consolidación formal de UC-02 (estructura interna de secciones, política por defecto de `include`, estructura de `scenario_projection`) | PENDIENTE |
| Consolidación formal de UC-03 (dimensiones específicas de `evaluation.dimensions`, estructura de `contextRef`) | PENDIENTE |
| Consolidación formal de UC-04 | PENDIENTE |
| DTO de `CONDITIONAL` en UC-04 | DIFERIDO |
| Catálogo consolidado de errores (tras UC-05..UC-09) | PENDIENTE |
| Revisión de coherencia transversal entre los nueve UC | PENDIENTE |
| Decisiones sobre tecnología de Application Layer | PENDIENTE |
| Materialización de este documento en el repositorio | PENDIENTE (Guss) |

### 16.4 Contratos sin abrir

| Contrato | Estado |
|---|---|
| UC-05 | SIN ABRIR |
| UC-06 | SIN ABRIR |
| UC-07 | SIN ABRIR |
| UC-08 | SIN ABRIR |
| UC-09 | SIN ABRIR |

---

## 17. Notas de honestidad documental

1. Este documento es **borrador en conversación** v0.8 (cuarta corrección), **aprobado por Kael**. No ha sido materializado en el repositorio. Guss es quien lo materializa.
2. **Ningún** UC tiene implementación ni verificación a la fecha del corte.
3. **`CONSOLIDADO` no se utiliza en v0.8** como etiqueta de estado de UC.
4. UC-01 a UC-04 están **RATIFICADOS CONCEPTUALMENTE**, pero **no consolidados formalmente**.
5. UC-05 a UC-09 están **SIN ABRIR**.
6. Las referencias a Commit #12 y `routing-port.md` son **de contexto**, no de importación.
7. El catálogo §13 usa **tres categorías** (A, B, C). La Categoría A agrupa resultados no replayables por validación, acceso, conflicto o fallo técnico sin resultado de negocio consolidado (K-05). La clasificación de `INVALID_SCENARIO_DATA`, `UNSUPPORTED_SCENARIO_VERSION`, `TASK_NOT_FOUND`, `VEHICLE_NOT_FOUND`, `UNSUPPORTED_PROPOSAL_SOURCE` y `EVALUATION_EXECUTION_FAILED` queda **pendiente** (§13.3).
8. **`INVALID_TIME_WINDOW`** es un `reasonCode` bajo `INVALID_INPUT`, no un código de error de primer nivel.
9. **`requestId`** es generado por el servidor/gateway; **nunca** lo suministra el cliente.
10. **`contractVersion` ≠ `scenarioFormatVersion` ≠ `scenarioVersion`**: tres identificadores independientes. `contractVersion` es obligatoria (D1).
11. **`FORBIDDEN` ≠ `DENIED`**: el primero es denegación de acceso (técnico, no replayable); el segundo es resultado de negocio por insuficiencia de competencia (replayable).
12. **`SCENARIO_NOT_FOUND`** no aplica a UC-01 (K-07). UC-01 produce `SCENARIO_ALREADY_EXISTS`. En UC-03 es replayable si consolidado; en UC-02 es rechazo de negocio sin política de replay por ausencia de idempotencia (K-09).
13. **Identidad idempotente:** ver §3.5. `contractVersion` forma parte de la identidad idempotente en todos los UC que usen idempotencia (D1). La inclusión del `actor autenticado` está **ratificada por D5 solo para UC-04**. Para **UC-01 y UC-03** la inclusión del actor en la identidad idempotente está **PENDIENTE** (§3.5.3, §3.5.4).
14. **Orden de precondiciones (K-08):** D5 ratificó el orden completo de precondiciones solo para **UC-04** (§7.6). Para **UC-01 y UC-03**, la precedencia de autenticación y permisos sobre la consulta idempotente, y el bloqueo del replay por pasos previos, están **PENDIENTES de ratificación** (§3.5.7, §4.9, §6.10). Este documento **no invierte** el orden ni decide uno nuevo.
15. Historial de versiones:
    - **v0.1–v0.7**: iteraciones previas.
    - **v0.8 (inicial)**: integración de D1, D2+D4, D5 y D3.
    - **v0.8 (primera corrección)**: K-01 a K-04.
    - **v0.8 (segunda corrección)**: precisión de alcance del actor en la identidad idempotente.
    - **v0.8 (tercera corrección)**: K-05, K-06, K-07.
    - **v0.8 (cuarta corrección)**: K-08 (alcance de D5 limitado a UC-04 en cuanto a orden de precondiciones) y K-09 (UC-02 sin política de replay). **Aprobada por Kael.**
    - **Precisiones menores de revisión final (aplicadas en esta entrega)**:
      - §6.9 regla 1 — "resultado terminal de negocio" sustituido por "resultado de negocio consolidado conforme a D2", para no sugerir una categoría adicional de resultados.
      - Encabezado de versión y §18 — identificador "v0.8 — cuarta corrección (aprobada por Kael)"; estado "🟢 APROBADO — pendiente de materialización por Guss".
      - §7.10 primera viñeta — "Integración completa del contrato UC-04" sustituido por "Consolidación formal completa del contrato UC-04", con aclaración de que las secciones §7.1–§7.11 registran las decisiones ratificadas y que la consolidación formal completará los elementos diferidos y pendientes.
16. La numeración de secciones es estable dentro de v0.8 (cuarta corrección); cambios futuros se harán por revisión completa del documento (regla de entrega documental).

---

## 18. Estado del documento

```
Documento: fase-18.6.6-contratos-de-intercambio.md
Versión:   v0.8 — cuarta corrección (aprobada por Kael)
Estado:    🟢 APROBADO — pendiente de materialización por Guss
Cobertura: ApplicationEnvelope, UC-01..UC-09 (con estados diferenciados)
Ratificado conceptualmente:   ApplicationEnvelope, UC-01, UC-02, UC-03, UC-04 (consolidación formal pendiente)
contractVersion:              RATIFICADA (D1)
Identidad idempotente:
  - UC-04:                    RATIFICADA COMPLETA (D5) — identidad + orden de precondiciones
  - UC-01:                    RATIFICADA PARCIAL — (contractVersion, idempotencyKey);
                              actor y orden de precondiciones PENDIENTES
  - UC-03:                    RATIFICADA PARCIAL — (contractVersion, idempotencyKey);
                              actor y orden de precondiciones PENDIENTES
  - UC-02:                    SIN IDEMPOTENCIA en esta versión
Política de replay:           RATIFICADA (D2+D4)
SERVICE_UNAVAILABLE:          RATIFICADA (D4)
Precondiciones UC-04:         RATIFICADAS (D5) — alcance limitado a UC-04
Precedencia de veredictos:    RATIFICADA (D3)
Clasificación de errores:     Tres categorías (K-02, K-05, K-06, K-07, K-09);
  seis códigos en clasificación pendiente
Sin abrir:                    UC-05, UC-06, UC-07, UC-08, UC-09
Pendiente: materialización por Guss; decisión sobre inclusión del actor y
  orden de precondiciones en UC-01 y UC-03; clasificación definitiva de
  seis códigos en Categoría C
No crea:   decisiones nuevas fuera de las ratificadas en Fase 18
No modifica: código, FlowCore, GeoWorkbench, Greedy, Commit #12, routing-port.md
```