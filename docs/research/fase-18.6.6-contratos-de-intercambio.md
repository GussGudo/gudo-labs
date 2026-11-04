# Fase 18.6.6 — Contratos de Intercambio

**Proyecto:** Gudo Labs / FlowCore
**Alcance:** Contratos de intercambio entre GeoWorkbench, Application Layer, Logistics Domain y FlowCore Kernel
**Versión:** v0.9 (revisión 4) — cierre editorial; historial delegado a Git
**Estado:** 🟡 BORRADOR — pendiente de dictamen documental definitivo de Kael y materialización por Guss
**Naturaleza:** Registro contractual de la frontera inbound. Complementa —no sustituye— `commit-12-executable-software-contracts.md` (outbound ejecución) y `routing-port.md` (outbound consulta).
**Fecha de corte:** Fase 18.6.6, tras dictamen de cierre de Etapa 5.

---

## 0. Cómo leer este documento

Cada contrato, sección o afirmación va acompañada, cuando corresponde, de una etiqueta:

| Etiqueta | Significado |
|---|---|
| **RATIFICADO CONCEPTUALMENTE** | Decisión arquitectónica cerrada por dictamen. **No implica aprobación documental del presente documento ni contrato formal completo.** |
| **EN CONSOLIDACIÓN** | Contrato en proceso de redacción y revisión. |
| **SIN ABRIR** | Caso de uso reconocido en el catálogo, sin contrato iniciado. |
| **IMPLEMENTADO** | Existe código correspondiente. |
| **VERIFICADO** | Existe evidencia de funcionamiento. Actualmente: ninguna en esta fase. |
| **PENDIENTE** | Sin decisión o resolución suficiente. |
| **DIFERIDO** | Reconocido, explícitamente postergado. |

Regla: **RATIFICADO CONCEPTUALMENTE ≠ APROBADO DOCUMENTALMENTE ≠ CONSOLIDADO ≠ IMPLEMENTADO ≠ VERIFICADO**. Ningún contrato de esta fase tiene código asociado ni verificación de ejecución a la fecha del corte.

**Nota de alcance (v0.9):** integra las decisiones de Etapa 4 (D1, D2+D4, D5, D3, K-01 a K-09) y las tres deudas transversales de UC-01/UC-03 resueltas en Etapa 5. No abre UC-05 ni anticipa decisiones de Recognition. No introduce implementación, JSON Schema ni estructuras Rust.

**Nota sobre la distinción D5 ↔ Etapa 5:** el orden de precondiciones de UC-04 (§7.6, D5) y el de UC-01/UC-03 (§3.5.7, Etapa 5) **comparten principios** pero **no comparten la misma precedencia exacta**:
- **UC-04:** el paso 1 unifica validación estructural del envelope **y del payload**. El payload se valida antes de la consulta de idempotencia.
- **UC-01 / UC-03:** el orden desdobla validación estructural en paso 1 (envelope básico) + paso 5 (payload version-specific). El payload se valida **después** de auth y authz.

Es una **diferencia contractual real**, justificada por complejidad de payload. Cada orden fue ratificado por su propio dictamen: D5 para UC-04, Etapa 5 para UC-01/UC-03. Ver §19.3.

**Nota sobre el estado de ratificación:** las tres decisiones de Etapa 5 están ratificadas en diseño por dictamen de Kael. Su presentación como "RATIFICADO CONCEPTUALMENTE" refleja esa ratificación de diseño; la **aprobación documental del v0.9** es un acto distinto, todavía pendiente.

**Nota editorial para la próxima versión:** a partir de v1.0 se aplicará el esquema de cinco bloques ratificado por Kael (qué es / contrato / reglas transversales / pendientes / referencias). v0.9 se conserva en su estructura actual para no abrir una nueva ronda de rediseño editorial.

**Historial de versiones:**

```
git log -- docs/research/fase-18.6.6-contratos-de-intercambio.md
```

---

## 1. Propósito y alcance

Contratos de intercambio de Fase 18.6.6: la frontera **inbound** entre GeoWorkbench, Application Layer, Logistics Domain y FlowCore Kernel.

**Dentro del alcance:**
- `ApplicationEnvelope` (incluida `contractVersion` ratificada en D1).
- UC-01 a UC-09 como contratos de aplicación.

**Fuera del alcance:**
- Puertos outbound de ejecución (→ `commit-12-executable-software-contracts.md`).
- Puertos outbound de consulta (→ `routing-port.md`).
- Implementación de Application Layer.
- Tecnología de transporte, serialización o persistencia.
- Reglas del Logistics Domain.

---

## 2. Tres familias de contratos

| Familia | Dirección | Ejemplo | Documento fuente |
|---|---|---|---|
| **Contratos inbound de aplicación** | GeoWorkbench → Application Layer → (Logistics Domain + FlowCore Kernel) | `ApplicationEnvelope`, UC-01..UC-09 | **Este documento** |
| **Contratos outbound de consulta** | Dominio → proveedor externo de datos | `routing-port.md` | `motores/flow-core/puertos/routing-port.md` |
| **Contratos outbound de ejecución** | Kernel → sistema externo con efecto físico | `ExternalPort`, `Command`, `DeliveryAttempt` | `conocimiento/arquitectura/commit-12-executable-software-contracts.md` |

### 2.1 Reglas de no confusión

- Un **Command de UC** (inbound) **no** es un `Command` de Commit #12 (outbound ejecución). Comparten nombre, no semántica.
- La `idempotencyKey` de UC (cliente, identifica intención de solicitud) **no** es la `IdempotencyKey` de Commit #12 (`= f(CommandId)`).
- Los veredictos `ELIGIBLE/INELIGIBLE/CONDITIONAL/UNDETERMINED` **no** son `KnowledgeState` ni `ExecutionState`.
- `ExternalClaim` de Commit #12 **no** es una respuesta de Application Layer.
- Un puerto de consulta **no** evalúa elegibilidad operacional. Aporta datos; el dominio evalúa.
- La **Application Layer coordina** Logistics Domain y FlowCore Kernel.

### 2.2 Lo que este documento no hace

- No convierte Commit #12 en contrato de intercambio.
- No convierte `routing-port.md` en evaluador de elegibilidad.
- No introduce entidades de dominio nuevas.
- No fija JSON Schema, HTTP, ni estructuras Rust.

---

## 3. ApplicationEnvelope — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 3.1 Estructura conceptual

El envelope distingue **cuatro capas de información** y **separa solicitud de respuesta**.

#### 3.1.1 Campos de solicitud

**(a) Metadatos declarados por el cliente — no confiables**

- `declaredActor` — declaración del cliente; **nunca** fuente de autoridad.
- `clientVersion` — informativa, no autoritativa.
- `clientDeclaredTimestamp` — **nunca** sustituye a `receivedAt` ni `respondedAt`.
- Otros metadatos de cliente: **no confiables**.

No participan en decisiones de negocio ni de autorización.

**(b) Identificadores de correlación e intención**

- `correlationId` — puede originarse en el cliente. Agrupa solicitudes. No autoriza.
  - **Regla ratificada:** el servidor **valida** el `correlationId` recibido y puede **generar uno alternativo** cuando no sea válido o no esté disponible. **No constituye por sí mismo causa de rechazo.**
- `idempotencyKey` — cuando el caso de uso lo requiera. Suministrado por el cliente. Reconoce reintentos.
- `contractVersion` — **obligatoria** en toda solicitud inbound. Ver §3.3.

**(c) Campos específicos por caso de uso**

- `expectedScenarioVersion` — expectativa de versión declarada por el cliente en UC que la requieran. Carácter opcional/obligatorio por UC.
- Otros campos: se documentan en cada UC.

#### 3.1.2 Campos de respuesta

**(a) Determinados por el servidor**

- `requestId` — **generado por el servidor o gateway**. **No lo suministra el cliente.**
- `receivedAt` — momento de recepción.
- `respondedAt` — momento de emisión.
- `processingStatus` — `SUCCESS` o `ERROR`.
- `result` — resultados de negocio (cuando `SUCCESS`).
- `error` — errores técnicos (cuando `ERROR`).

**(b) Trazabilidad**

- `correlationId` — devuelto en la respuesta: el recibido si es válido, o el generado por el servidor.

### 3.2 Reglas generales del envelope — ratificadas

- La identidad autenticada **no** viaja como autoridad confiable. Se obtiene del `RequestContext` del servidor.
- `declaredActor` **nunca** es fuente de autoridad.
- `requestId`, `receivedAt`, `respondedAt`, `processingStatus`, `result`/`error` son determinados por el servidor.
- `requestId` **no** es campo de solicitud.
- `correlationId`: el servidor lo valida; si es inválido o ausente, puede generar uno alternativo. **No es causa de rechazo por sí mismo.**
- `clientDeclaredTimestamp` (si se recibe) es metadato no confiable; no sustituye `receivedAt`/`respondedAt`.
- `contractVersion` ≠ `scenarioFormatVersion` ≠ `scenarioVersion`: tres identificadores distintos, no intercambiables.
- `processingStatus` distingue `SUCCESS` y `ERROR`.
- Los resultados de negocio se expresan en `result`; los errores técnicos en `error`. No se mezclan.
- `PARTIAL` queda **fuera** de la primera versión.
- Los errores tienen códigos estables, mensajes descriptivos y detalles estructurados opcionales.
- `retryable` es recomendación del servidor, **no** garantía.

### 3.3 `contractVersion` — RATIFICADO (D1)

#### 3.3.1 Definición

`contractVersion` identifica la versión del **contrato de intercambio inbound completo**. **No** es `scenarioFormatVersion` ni `scenarioVersion`. Los tres identificadores son independientes.

#### 3.3.2 Obligatoriedad

**Obligatoria en toda solicitud inbound** (consulta o comando): UC-01, UC-02, UC-03, UC-04 y futuros.

Consecuencias:
- Campo ausente: `INVALID_INPUT`.
- Campo malformado: `INVALID_INPUT`.
- No se admite versión predeterminada silenciosa.
- El servidor **no infiere** la versión desde el payload.

La uniformidad del envelope prevalece sobre la conveniencia de hacer opcional el campo en consultas.

#### 3.3.3 Alcance

Una **versión global del contrato inbound**. En esta etapa **no** existen versiones independientes por UC, por comandos vs consultas, ni por familia de operaciones. Una modificación incompatible de cualquier familia puede requerir nueva versión global. Esto **no** implica incrementar la versión ante cualquier modificación interna o documental.

#### 3.3.4 Versión no soportada

| Situación | Resultado |
|---|---|
| Campo ausente | `INVALID_INPUT` |
| Campo malformado | `INVALID_INPUT` |
| Versión válida, no soportada | `UNSUPPORTED_CONTRACT_VERSION` |
| Versión válida, soportada | Continúa |

`UNSUPPORTED_CONTRACT_VERSION` identifica un **problema de compatibilidad contractual**, no un rechazo de negocio. Ver §13.

#### 3.3.5 Compatibilidad

El servidor acepta una versión cuando esa versión exacta está **explícitamente soportada**. Puede mantener varias versiones soportadas simultáneamente, pero **no se presume compatibilidad** entre ellas.

Ejemplo conceptual:

| Solicitada | Soportadas | Resultado |
|---|---|---|
| 1.0 | 1.0 | Aceptada |
| 1.0 | 1.0 y 1.1 | Aceptada |
| 1.0 | 1.1 | `UNSUPPORTED_CONTRACT_VERSION` |
| 1.2 | 1.0 y 1.1 | `UNSUPPORTED_CONTRACT_VERSION` |

**No se incorpora** en esta etapa: negociación cliente-servidor, compatibilidad semántica automática, conversión implícita entre versiones, descubrimiento dinámico de capacidades.

#### 3.3.6 `contractVersion` forma parte de la identidad idempotente

`contractVersion` participa en la identidad idempotente en todos los UC que usen idempotencia. Ratificado por **D1**.

Una misma `idempotencyKey` bajo dos versiones distintas produce `IDEMPOTENCY_CONFLICT`. Ver §3.5.

#### 3.3.7 Asuntos diferidos de `contractVersion`

- Formato concreto de la cadena de versión.
- Política de incremento y publicación de versiones.
- Periodos de coexistencia y retirada de versiones antiguas.
- Mecanismo técnico de detección de reutilización de clave cross-versión.

### 3.4 Elementos pendientes de consolidación formal

- Modelo completo de `result` por UC.
- Modelo completo de `error` más allá del catálogo §13.
- Metadatos adicionales del cliente, si se incorporan.

### 3.5 Identidad idempotente y orden de precondiciones — RATIFICADO (D1, D5, Etapa 5)

Principio rector:

```
Identidad autenticada → autorización → integridad estructural del payload
  → identidad idempotente → replay o ejecución de dominio
```

Un replay **nunca** debe convertirse en puerta lateral para recuperar información ajena o saltarse controles de acceso. Este principio opera junto con D2 (resultado consolidado se reproduce sin reevaluar precondiciones de dominio).

#### 3.5.1 Componentes de la identidad

La identidad idempotente se compone de:

```
(actor autenticado, contractVersion, idempotencyKey)
```

**Los argumentos de la solicitud se comparan para determinar replay vs conflicto, pero no forman parte de la identidad idempotente.**

| Componente | Ratificación | Alcance |
|---|---|---|
| **`contractVersion`** | **D1** | Todos los UC con idempotencia (UC-01, UC-03, UC-04). |
| **`idempotencyKey`** | Ratificado para UC-01, UC-03, UC-04 | Suministrada por el cliente. |
| **`actor autenticado`** | **D5** para UC-04; **Etapa 5** para UC-01 y UC-03 | **Todos los UC con idempotencia.** |

**`actor autenticado`** se obtiene del `RequestContext` del servidor. **Nunca** de `declaredActor` ni del payload.

**Consecuencia ratificada:** dos actores distintos **no comparten** resultados idempotentes aunque coincidan en `contractVersion`, `idempotencyKey` y argumentos. La clave idempotente **no** es mecanismo de consulta de resultados de otros actores.

#### 3.5.2 Reglas ratificadas transversalmente

Aplicables a los UC con idempotencia (**UC-01, UC-03, UC-04**). UC-02 **no** tiene idempotencia ratificada (ver §3.5.3).

1. **Precedencia de autenticación y autorización sobre la consulta idempotente.** Ratificado para todos los UC con idempotencia. Detalle en §3.5.7 (UC-01/UC-03) y §7.6 (UC-04). Justificación de seguridad: un actor sin identidad autenticada o sin autorización no debe poder sondear la existencia o el resultado de claves ajenas.
2. **Misma identidad + mismos argumentos + resultado de negocio consolidado** → reproducir el resultado original. No se reejecuta.
3. **Misma identidad + argumentos distintos** → `IDEMPOTENCY_CONFLICT`.
4. **Misma `idempotencyKey` + `contractVersion` distinta** → `IDEMPOTENCY_CONFLICT` (D1). No se trata como identidad nueva. No se asume equivalencia semántica entre versiones.
5. **Misma identidad + error técnico sin resultado de negocio consolidado** → no hay resultado que reproducir; el reintento puede reejecutar. **`SERVICE_UNAVAILABLE` no se persiste** como resultado terminal replayable (D4).

#### 3.5.3 Alcance por UC

| UC | Idempotencia | `contractVersion` | `actor autenticado` | Precedencia auth/authz antes de idempotencia | Estado |
|---|---|---|---|---|---|
| **UC-01** | Sí | Ratificado (D1) | Ratificado (Etapa 5) | Ratificado (Etapa 5) | Identidad y orden completos ratificados (§3.5.7). |
| **UC-02** | No | N/A | N/A | N/A | Sin idempotencia en esta versión. |
| **UC-03** | Sí | Ratificado (D1) | Ratificado (Etapa 5) | Ratificado (Etapa 5) | Identidad y orden completos ratificados (§3.5.7). |
| **UC-04** | Sí | Ratificado (D1) | Ratificado (D5) | Ratificado (D5) | Identidad y orden completos ratificados (§7.6). |

#### 3.5.4 Dependencia de seguridad resuelta (Etapa 5)

La dependencia registrada en v0.8 sobre la inclusión del actor en la identidad de UC-01 y UC-03 **queda resuelta** por ratificación de Etapa 5. Sin esa ratificación, dos actores con la misma `(contractVersion, idempotencyKey)` podrían haber sido tratados como la misma solicitud idempotente. La decisión ratificada evita ese escenario.

#### 3.5.5 Consecuencia de diseño visible (K-01)

La implementación tendrá que detectar la reutilización de la misma `idempotencyKey` con una `contractVersion` distinta, aunque la versión forme parte de la identidad. El mecanismo técnico pertenece a implementación (diferido, §16.2).

#### 3.5.6 No equivalencia semántica entre versiones

No se compara el payload byte a byte entre versiones ni se traduce para fabricar equivalencias. Una misma intención expresada bajo contratos distintos **no** constituye automáticamente la misma solicitud idempotente. Para reutilizar la intención bajo nueva versión, se requiere nueva `idempotencyKey`.

#### 3.5.7 Orden de precondiciones de UC-01 y UC-03 — RATIFICADO (Etapa 5)

| Paso | Validación | Resultado |
|---|---|---|
| 1 | Estructura **básica del envelope**: `contractVersion` e `idempotencyKey` presentes y bien formados. `correlationId`, si está presente y es utilizable, se conserva; si está ausente o no es utilizable, se aplica §3.2 (el servidor puede generar uno alternativo). **No constituye causa de rechazo por sí mismo.** `requestId` **no** se valida como campo del cliente: lo genera el servidor. | `INVALID_INPUT` |
| 2 | `contractVersion` válida y soportada | `INVALID_INPUT` / `UNSUPPORTED_CONTRACT_VERSION` |
| 3 | Autenticación | `UNAUTHENTICATED` |
| 4 | Autorización (permiso de operación) | `FORBIDDEN` |
| 5 | Validación estructural **del payload** conforme a la versión soportada (esquema, tipos, campos obligatorios, forma del contenido) | `INVALID_INPUT` |
| 6 | Consulta idempotente | Replay original / `IDEMPOTENCY_CONFLICT` / continuar |
| 7 | Precondiciones de dominio | Errores de precondición según UC |
| 8 | Ejecución atómica | Resultado y efectos consolidados conjuntamente |

**Justificación del split 1 vs 5:** la estructura **básica del envelope** se valida sin conocer la versión del contrato (presencia y forma mínima de campos de nivel superior). La estructura **del payload** (p. ej. `data` en UC-01, `taskSequence` en UC-03) requiere conocer `contractVersion` para interpretar el esquema correcto.

**Sub-decisión A1 ratificada:** la validación estructural del payload (paso 5) bloquea el replay. Un payload estructuralmente inválido **no** recibe un resultado consolidado aunque presente `idempotencyKey` conocida. La validación estructural **no** se confunde con la validación de dominio; esta última (paso 7) sí queda después de la consulta idempotente, respetando D2.

**Diferencia con UC-04 (no equivalencia):** este orden **no es idéntico** al de UC-04 (§7.6, D5). UC-04 valida el payload en el paso 1 (payload simple, no version-specific). UC-01/UC-03 lo validan en el paso 5 (payload complejo, version-specific). Cada orden fue ratificado por su propio dictamen. Ver §19.3.

#### 3.5.8 Bloqueo del replay — RATIFICADO

El replay de un resultado consolidado **queda bloqueado** si falla cualquiera de las comprobaciones anteriores a la consulta idempotente:

| UC | Pasos bloqueantes |
|---|---|
| **UC-01 / UC-03** | 1 (estructura básica del envelope), 2 (`contractVersion`), 3 (auth), 4 (authz), 5 (payload version-specific) — **5 pasos** |
| **UC-04** | 1 (estructura del envelope **y** del payload, unificada), 2 (`contractVersion`), 3 (auth), 4 (authz) — **4 pasos** |

**Consecuencia ratificada:** ningún resultado consolidado puede utilizarse para **eludir la validación estructural, la autenticación o los permisos actuales** del actor.

**Coherencia con D2:** el bloqueo **no** contradice D2. D2 establece que un resultado de negocio consolidado se reproduce sin reevaluar precondiciones **de dominio** (paso 7 en UC-01/UC-03; pasos 6–10 en UC-04). Las precondiciones **estructurales, de autenticación y de autorización** están *antes* de la consulta idempotente precisamente para no quedar cubiertas por el replay.

### 3.6 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin JSON Schema ni contrato formal completo. Sin implementación. Sin verificación.

---

## 4. UC-01 — `InitializeScenarioCommand` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 4.1 Semántica

Inicialización atómica de un escenario. No evalúa elegibilidad operacional.

### 4.2 Decisiones conceptuales ratificadas

- Inicialización atómica.
- `scenarioFormatVersion` ≠ `contractVersion` ≠ `scenarioVersion`.
- Colección `tasks` en formato 1.0, incluso si vacía.
- Validación estructural y de coherencia del escenario.
- **No** se evalúa elegibilidad operacional.
- Idempotencia evita duplicar la misma inicialización.
- Éxito asigna **`scenarioVersion = 1`**.

### 4.3 Solicitud — campos ratificados

| Campo | Obligatorio | Fuente | Notas |
|---|---|---|---|
| `scenarioId` | Sí | Cliente | Identificador a inicializar. |
| `scenarioFormatVersion` | Opcional | Cliente | Si se proporciona, versión del formato esperada. Omisión según política por defecto (pendiente). Independiente de `contractVersion`. |
| `source` | Sí | Cliente | Origen (`SYNTHETIC`, `IMPORTED`, `MANUAL`). |
| `seed` | Opcional | Cliente | Semilla del generador, si aplica. |
| `data` | Sí | Cliente | Contenido del escenario. Ver §4.4. |
| Envelope | Sí | Envelope | Incluye `contractVersion` obligatoria (§3.3). |

**Explícitamente ausentes del request:**
- `requestId` (servidor).
- `receivedAt`, `respondedAt` (servidor).
- Cualquier campo de autoridad; identidad en `RequestContext`.

### 4.4 Estructura mínima de `data` y de `Task`

#### 4.4.1 Estructura mínima de `data`

`data` debe contener, como mínimo:
- `summary`, `vehicles`, `packages`, `stops`, `tasks`.

**Reglas de coherencia:**
- Conteos en `summary` coinciden con tamaño de colecciones.
- Identificadores únicos dentro de cada colección.
- Referencias (`task.locationRef`, `task.cargoRefs`) resuelven a elementos existentes.

**Separación estructura/evaluación:** la validación en UC-01 es estructural y de coherencia. La evaluación semántica pertenece al Logistics Domain y **no** se ejecuta en UC-01.

#### 4.4.2 Estructura mínima de `Task`

```json
{
  "taskId": "task-001",
  "taskType": "DELIVERY",
  "locationRef": { "type": "STOP", "id": "stop-001" },
  "cargoRefs": ["pkg-001", "pkg-002"],
  "status": "PENDING",
  "metadata": {}
}
```

Estructura **mínima**, no universal. Reglas:

1. **`taskId`** — único y estable; unicidad en colección `tasks`.
2. **`taskType`** — catálogo controlado y extensible. Tipo desconocido pero válido estructuralmente **no invalida el escenario**; evaluación semántica en dominio (→ `UNDETERMINED` donde aplique).
3. **`locationRef` y `cargoRefs`** — **opcionales**. Si presentes: referencias resuelven a elementos existentes; `cargoRefs` sin duplicados. Exigibilidad por tipo de tarea pertenece al dominio, no a UC-01.
4. **`status`** — admite `PENDING` como valor sintético inicial. Catálogo completo pertenece al dominio.
5. **`metadata`** — acotado a trazabilidad.

### 4.5 Respuesta — campos ratificados

| Campo | Presente cuando | Notas |
|---|---|---|
| `scenarioId` | `SUCCESS` | Eco. |
| `scenarioVersion` | `SUCCESS` | `1` en creación inicial. |
| `scenarioFormatVersion` | `SUCCESS` | Aplicada. |
| `initializedAt` | `SUCCESS` | Servidor. |
| `source` | `SUCCESS` | Origen declarado. |
| `seed` | `SUCCESS` (si se proporcionó) | Eco. |
| `warnings` | `SUCCESS` (opcional) | Advertencias no bloqueantes. |
| Envelope | Siempre | §3.1.2. |

### 4.6 Errores ratificados

**No replayables:** `INVALID_INPUT`, `UNSUPPORTED_CONTRACT_VERSION`, `UNAUTHENTICATED`, `FORBIDDEN`, `IDEMPOTENCY_CONFLICT`, `SERVICE_UNAVAILABLE`.

**Rechazos de negocio (replayables si consolidados):** `SCENARIO_ALREADY_EXISTS`.

**Clasificación pendiente (§13.3):** `INVALID_SCENARIO_DATA`, `UNSUPPORTED_SCENARIO_VERSION`.

**Nota (K-07):** `SCENARIO_NOT_FOUND` **no** se lista para UC-01. UC-01 crea escenario; su conflicto es `SCENARIO_ALREADY_EXISTS`.

### 4.7 Reglas de idempotencia y orden de precondiciones — RATIFICADO (D1 + D2+D4 + K-01 + Etapa 5)

**Identidad idempotente:** `(actor autenticado, contractVersion, idempotencyKey)`. Los argumentos se comparan para replay/conflicto; no son parte de la identidad.

- `contractVersion` (D1) y `actor autenticado` (Etapa 5) forman parte de la identidad. Dos actores distintos **no comparten** resultados.
- Misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT` (D1).

**Orden de precondiciones (Etapa 5, §3.5.7):**
1. Estructura básica del envelope → `INVALID_INPUT`.
2. `contractVersion` → `INVALID_INPUT` / `UNSUPPORTED_CONTRACT_VERSION`.
3. Autenticación → `UNAUTHENTICATED`.
4. Autorización → `FORBIDDEN`.
5. Validación estructural del payload conforme a versión → `INVALID_INPUT`.
6. Consulta idempotente → replay / `IDEMPOTENCY_CONFLICT` / continuar.
7. Precondiciones de dominio.
8. Ejecución atómica.

**Bloqueo del replay (Etapa 5, §3.5.8):** pasos 1–5 bloquean. Payload inválido **no** recibe resultado consolidado.

**Reglas específicas:**
1. Búsqueda idempotente precede a `SCENARIO_ALREADY_EXISTS`.
2. Misma identidad + mismos argumentos + resultado de negocio consolidado → reproducir original. No reejecutar.
3. Misma identidad + argumentos distintos → `IDEMPOTENCY_CONFLICT`.
4. `idempotencyKey` nueva + `scenarioId` existente → `SCENARIO_ALREADY_EXISTS` (rechazo de negocio, replayable bajo nueva clave si consolidado).
5. Misma identidad + error técnico sin resultado de negocio consolidado → no hay resultado que reproducir; el reintento puede reejecutar. **`SERVICE_UNAVAILABLE` no se persiste** (D4).

### 4.8 Atomicidad (D2+D4)

Resultado de negocio y consolidación de efectos = **una sola unidad lógica**. Si la operación no se consolidó, no hay resultado que reproducir. Si se consolidó, el registro idempotente permite recuperar el resultado original. El servidor **no reejecuta** una operación cuyo resultado quedó consolidado.

Mecanismo técnico: implementación.

### 4.9 Elementos pendientes de consolidación formal

- Política por defecto cuando `scenarioFormatVersion` se omite.
- Modelo completo de `warnings`.
- Forma específica de `summary` y `metadata`.
- Catálogo completo de `taskType` y estados de tarea.
- Clasificación definitiva de `INVALID_SCENARIO_DATA` y `UNSUPPORTED_SCENARIO_VERSION`.
- Precondiciones de dominio detalladas.

*Las tres deudas de UC-01 registradas en v0.8 (actor, orden, bloqueo) quedan resueltas por Etapa 5.*

### 4.10 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin implementación. Sin verificación.

---

## 5. UC-02 — `QueryScenarioRequest` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 5.1 Semántica

Consulta del estado de un escenario. Permite solicitar secciones mediante `include`.

**Nota:** UC-02 **no tiene idempotencia ratificada** en esta versión. `idempotencyKey` / `IDEMPOTENCY_CONFLICT` no se definen para este UC. La identidad idempotente (§3.5) no aplica.

### 5.2 Decisiones conceptuales ratificadas

- La respuesta informa las secciones incluidas.
- `expectedScenarioVersion` incompatible → `SCENARIO_VERSION_MISMATCH`.
- Métricas derivadas de sus fuentes correctas.
- `activeProposals` y `activeAssignments` con **semánticas diferentes**.
- Proyección sintética **no** se presenta como hecho operacional verificado.

### 5.3 Solicitud — campos ratificados

| Campo | Obligatorio | Fuente | Notas |
|---|---|---|---|
| `scenarioId` | Sí | Cliente | Escenario a consultar. |
| `expectedScenarioVersion` | Opcional | Cliente | Si incompatible → `SCENARIO_VERSION_MISMATCH`. |
| `include` | Opcional | Cliente | Secciones solicitadas. Omisión → política por defecto (pendiente). |
| Envelope | Sí | Envelope | `contractVersion` obligatoria (§3.3). |

### 5.4 Respuesta — campos ratificados

| Campo | Presente cuando | Notas |
|---|---|---|
| `scenarioId` | `SUCCESS` | Eco. |
| `scenarioVersion` | `SUCCESS` | Versión actual. |
| `includedSections` | `SUCCESS` | Secciones incluidas. |
| Secciones solicitadas | `SUCCESS` | Solo las presentes en `include` (o política por defecto). **Las no solicitadas se omiten.** |

#### 5.4.1 Semántica de secciones

- **`activeProposals`** — propuestas en estados `PROPOSED` y `AUTHORIZED`. No `REVOKED` ni históricas sin estado activo.
- **`activeAssignments`** — asignaciones reconocidas **no** `REVOKED`.
- **`assignedVehicles`** — derivado de asignaciones reconocidas activas, no del estado sintético del vehículo.
- **`totalDistanceKm`** — bajo `scenario_projection`, **proyección sintética**. No medición operacional verificada.

### 5.5 Errores ratificados

**No replayables:** `INVALID_INPUT`, `UNSUPPORTED_CONTRACT_VERSION`, `UNAUTHENTICATED`, `FORBIDDEN`, `SERVICE_UNAVAILABLE`.

**Rechazos de negocio (sin política de replay en UC-02 por ausencia de idempotencia):** `SCENARIO_NOT_FOUND`, `SCENARIO_VERSION_MISMATCH`.

**Nota (K-09):** estos códigos son de naturaleza de negocio. **No** tienen política de replay en UC-02. En UC-03 sí son replayables si consolidados.

### 5.6 Elementos pendientes de consolidación formal

- Estructura detallada de cada sección.
- Política por defecto de `include`.
- Paginación si aplica.
- `warnings` si aplica.
- Estructura completa de `scenario_projection`.
- Si en el futuro se incorpora idempotencia: identidad y orden coherentes con §3.5.

### 5.7 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin implementación. Sin verificación.

---

## 6. UC-03 — `ProposeRoutesCommand` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 6.1 Semántica

Registro de una propuesta de rutas sobre un escenario. Registro y evaluación = operación lógica atómica.

### 6.2 Decisiones conceptuales ratificadas

- Valida estructura, escenario, versión esperada, vehículo, tareas.
- Rechaza secuencias vacías o con tareas repetidas.
- Registra propuesta aunque veredicto sea `INELIGIBLE`, `CONDITIONAL` o `UNDETERMINED`.
- Comienza en `PROPOSED`.
- Evaluación pertenece al **Logistics Domain**.
- Autor: `proposedBy` autenticado, nunca `declaredActor`.
- Registro + evaluación = operación lógica atómica.
- Falla técnica en evaluación → **no se registra** propuesta.
- Veredicto válido → se registra propuesta junto con evaluación.
- `contextRef` rastrea el contexto de evaluación (sujeto a retención).
- `taskType` desconocido pero válido → `UNDETERMINED` en evaluación del dominio.

### 6.3 Solicitud — campos ratificados

| Campo | Obligatorio | Fuente | Notas |
|---|---|---|---|
| `scenarioId` | Sí | Cliente | Escenario. |
| `expectedScenarioVersion` | Opcional | Cliente | Si incompatible → `SCENARIO_VERSION_MISMATCH`. Omisión **no** inventa expectativa. |
| `vehicleId` | Sí | Cliente | Vehículo. |
| `taskSequence` | Sí | Cliente | No vacía, sin repeticiones. |
| `proposalSource` | Sí | Cliente | `type`, `producerVersion`, `producerReference` (§6.4). |
| `requestedWindow` | Opcional | Cliente | `{ startsAt, endsAt }` (§6.5). |
| Envelope | Sí | Envelope | `contractVersion` obligatoria (§3.3). |

**Explícitamente ausentes:**
- `requestId` (servidor).
- `proposedBy` (autenticado).
- `proposalId`, `proposalVersion` (servidor).
- `receivedAt`, `respondedAt` (servidor).

### 6.4 `proposalSource.type` — catálogo inicial

- `GEOWORKBENCH_GREEDY`
- `GEOWORKBENCH_2OPT`
- `MANUAL`
- `EXTERNAL`

`producerVersion` y `producerReference` son **metadatos de procedencia**, no autoridad.

### 6.5 `requestedWindow` — ratificado

```json
"requestedWindow": {
  "startsAt": "2026-11-03T08:00:00Z",
  "endsAt": "2026-11-03T12:00:00Z"
}
```

1. Si se proporciona: `startsAt` estrictamente anterior a `endsAt`.
2. Si se omite: **no** inventar intervalo.
3. Si la evaluación necesita intervalo y no lo hay: dimensión Availability `UNDETERMINED`.
4. Horizonte por defecto solo con política explícita y registro en contexto de evaluación.
5. `INVALID_INPUT` con `field: "arguments.requestedWindow"` y `reasonCode: "INVALID_TIME_WINDOW"` = entrada malformada. No confundir con `UNDETERMINED`.
6. Aceptar offsets no equivale a aceptar tiempos ambiguos: todo instante identifica inequívocamente zona u offset. Normalización a UTC en Application Layer.
7. `requestedWindow` **opcional en v1.0**. Omisión no es error; puede producir `UNDETERMINED`.
8. **Único por propuesta**, aplicable a toda la `taskSequence`.

### 6.6 Dimensiones de evaluación y veredictos globales — RATIFICADO (D3)

#### 6.6.1 Dimensiones

| Dimensión | Significado |
|---|---|
| `PASS` | Se cumple sin reservas. |
| `FAIL` | No se cumple. |
| `CONDITIONAL` | Se cumpliría bajo condiciones explícitas. |
| `UNDETERMINED` | Información insuficiente. |
| `NOT_EVALUATED` | No evaluada en este contexto. |

#### 6.6.2 Veredictos globales — precedencia ratificada

| Prioridad | Condición | Veredicto |
|---|---|---|
| 1 | Alguna dimensión relevante `FAIL` | `INELIGIBLE` |
| 2 | Sin `FAIL`, alguna `UNDETERMINED` | `UNDETERMINED` |
| 3 | Sin `FAIL` ni `UNDETERMINED`, alguna `CONDITIONAL` | `CONDITIONAL` |
| 4 | Todas las relevantes `PASS` | `ELIGIBLE` |
| 5 | Todas `NOT_EVALUATED` | `UNDETERMINED` |

Precedencia **global**, no contextual.

#### 6.6.3 `NOT_EVALUATED` vs `UNDETERMINED`

- `NOT_EVALUATED`: no evaluada en este contexto.
- `UNDETERMINED`: relevante pero indeterminada.

`NOT_EVALUATED` **no contribuye** al veredicto global por sí mismo. Coexistencia con `PASS` y `CONDITIONAL` → `CONDITIONAL`. Coexistencia con `PASS` y `UNDETERMINED` → `UNDETERMINED`. Todas `NOT_EVALUATED` → `UNDETERMINED`. No autoriza a marcar `NOT_EVALUATED` una dimensión relevante no determinada.

#### 6.6.4 `taskType` desconocido

Conduce a la dimensión correspondiente como `UNDETERMINED`. No produce `FAIL` por sí mismo. No se rechaza la propuesta por esta causa.

#### 6.6.5 Consecuencias

1. `FAIL` → `INELIGIBLE`.
2. `UNDETERMINED` relevante impide `CONDITIONAL` o `ELIGIBLE`.
3. `CONDITIONAL` solo sin `FAIL` ni `UNDETERMINED` relevantes.
4. `NOT_EVALUATED` no altera el resultado de las evaluadas.
5. **Ningún veredicto impide el registro.**
6. `UNDETERMINED` **no** es rechazo.
7. No hay quinto veredicto ni se modifican las cuatro categorías.

### 6.7 Respuesta — campos ratificados

| Campo | Presente cuando | Notas |
|---|---|---|
| `proposalId` | `SUCCESS` | Servidor. |
| `proposalVersion` | `SUCCESS` | Versión inicial. |
| `proposedAt` | `SUCCESS` | Servidor. |
| `proposedBy` | `SUCCESS` | Identidad autenticada. |
| `evaluation.globalVerdict` | `SUCCESS` | Uno de los cuatro veredictos. |
| `evaluation.dimensions` | `SUCCESS` | Mapa dimensión → valor. |
| `evaluation.contextRef` | `SUCCESS` | Referencia opaca. |
| Envelope | Siempre | §3.1.2. |

### 6.8 Errores ratificados

**No replayables:** `INVALID_INPUT`, `UNSUPPORTED_CONTRACT_VERSION`, `UNAUTHENTICATED`, `FORBIDDEN`, `IDEMPOTENCY_CONFLICT`, `SERVICE_UNAVAILABLE`, `TASK_SEQUENCE_EMPTY`, `DUPLICATE_TASK_IN_SEQUENCE`.

**Rechazos de negocio (replayables si consolidados):** `SCENARIO_NOT_FOUND`, `SCENARIO_VERSION_MISMATCH`.

**Clasificación pendiente (§13.3):** `TASK_NOT_FOUND`, `VEHICLE_NOT_FOUND`, `UNSUPPORTED_PROPOSAL_SOURCE`, `EVALUATION_EXECUTION_FAILED`.

`retryable` = recomendación del servidor, no garantía.

### 6.9 Reglas de idempotencia y orden de precondiciones — RATIFICADO (D1 + D2+D4 + K-01 + Etapa 5)

**Identidad idempotente:** `(actor autenticado, contractVersion, idempotencyKey)`. Los argumentos se comparan para replay/conflicto; no son parte de la identidad.

- `contractVersion` (D1) y `actor autenticado` (Etapa 5) forman parte de la identidad. Dos actores distintos **no comparten** resultados.
- Misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT` (D1).

**Orden de precondiciones (Etapa 5, §3.5.7):**
1. Estructura básica del envelope → `INVALID_INPUT`.
2. `contractVersion` → `INVALID_INPUT` / `UNSUPPORTED_CONTRACT_VERSION`.
3. Autenticación → `UNAUTHENTICATED`.
4. Autorización → `FORBIDDEN`.
5. Validación estructural del payload conforme a versión → `INVALID_INPUT`.
6. Consulta idempotente → replay / `IDEMPOTENCY_CONFLICT` / continuar.
7. Precondiciones de dominio (**existencia del escenario, coincidencia de `expectedScenarioVersion` cuando se proporciona, existencia y validez semántica del vehículo y de las tareas dentro del escenario, y demás condiciones necesarias para registrar y evaluar la propuesta**).
8. Ejecución atómica (propuesta registrada + evaluación + resultado idempotente).

**Bloqueo del replay (Etapa 5, §3.5.8):** pasos 1–5 bloquean. Payload inválido **no** recibe resultado consolidado.

**Reglas específicas:**
1. Misma identidad + mismos argumentos + resultado de negocio consolidado conforme a D2 → reproducir el resultado original. No reejecutar registro ni evaluación.
2. Misma identidad + argumentos distintos → `IDEMPOTENCY_CONFLICT`.
3. Misma identidad + error técnico sin resultado de negocio consolidado → no hay resultado que reproducir; el reintento puede reejecutar. **`SERVICE_UNAVAILABLE` no se persiste.**

**Atomicidad (D2+D4):** propuesta registrada + evaluación + resultado idempotente = unidad lógica. Falla técnica en evaluación → **no se registra** la propuesta ni el resultado idempotente.

### 6.10 Elementos pendientes de consolidación formal

- Estructura detallada de `evaluation.dimensions`.
- Estructura de `contextRef`.
- **Semántica específica de `TASK_NOT_FOUND` y `VEHICLE_NOT_FOUND`** (K-06): inexistencia semántica vs formato inválido.
- Clasificación definitiva de `UNSUPPORTED_PROPOSAL_SOURCE`.
- Clasificación específica de `EVALUATION_EXECUTION_FAILED` (K-03).
- Clasificación de otros errores técnicos distintos de `SERVICE_UNAVAILABLE`.
- Precondiciones de dominio detalladas más allá de las ratificadas.

*Las tres deudas de UC-03 registradas en v0.8 (actor, orden, bloqueo) quedan resueltas por Etapa 5.*

### 6.11 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin implementación. Sin verificación.

---

## 7. UC-04 — `AuthorizeProposalCommand` — RATIFICADO CONCEPTUALMENTE (consolidación formal pendiente)

### 7.1 Semántica

Crea una `Authorization`: entidad con identidad propia, vinculada a una versión concreta de `Proposal`. No modifica la Proposal. No crea ni modifica `Assignment`. No ejecuta `Recognition`. No utiliza `FenceEpoch` como autoridad logística.

### 7.2 Decisiones conceptuales ratificadas

- `Authorization` = entidad independiente con identidad propia.
- Vinculada a **versión específica** de `Proposal`.
- Requiere evaluación vigente `ELIGIBLE`.
- No se autoriza `INELIGIBLE`, `CONDITIONAL` sin resolver, ni `UNDETERMINED`.
- Vigencia **obligatoria** por política del dominio.
- Autorización vencida permanece en historial; no se elimina ni reescribe.
- **Expiración posterior de evaluación no invalida retroactivamente una Authorization ya emitida.** Recognition vuelve a comprobar condiciones.
- Solo una autorización activa por versión de Proposal.
- Competencia logística evaluada **separadamente** de la autenticación.
- Denegación de competencia = resultado de negocio (`DENIED`), no error técnico.
- Solo `AUTHORIZED` crea Authorization.
- Fallos técnicos no se convierten en `DENIED`.
- **`CONDITIONAL` debe identificar condiciones concretas pendientes.** DTO diferido; no puede producirse sin explicitar condiciones.
- UC-04 no produce Recognition ni Assignment.
- No sustitución de autorización activa en v1. Autorización expirada permanece histórica; nueva puede emitirse tras vencimiento. Revocación anticipada fuera de v1.
- Relación: `Proposal 1 — 0..N Authorization`. Solo una activa.

### 7.3 Solicitud — campos ratificados

| Campo | Obligatorio | Fuente | Notas |
|---|---|---|---|
| `proposalId` | Sí | Cliente | |
| `proposalVersion` | Sí | Cliente | Debe coincidir. |
| `expectedEvaluationId` | Opcional | Cliente | Si no coincide con evaluación vigente → `EVALUATION_VERSION_MISMATCH`. Omisión → servidor resuelve evaluación vigente. |
| `note` | No | Cliente | Metadato declarativo, no confiable. |
| Envelope | Sí | Envelope | `contractVersion` obligatoria. `requestId` lo genera el servidor. |

**Explícitamente ausentes:**
- `requestId` (servidor).
- `authorizedAt`, `expiresAt` (política).
- `authorizedBy` (autenticado).
- Competencia, autoridad, `FenceEpoch`.
- `declaredActor` no participa.

**Identidad idempotente (D5):** `(actor autenticado, contractVersion, idempotencyKey)`. Argumentos comparados para replay/conflicto.

**Orden de precondiciones:** §7.6. Autenticación y permiso preceden a idempotencia. Misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT`.

### 7.4 Respuesta — estructura conceptual

- **`AUTHORIZED`** (`SUCCESS`): `authorizationId`, `proposalId`, `proposalVersion`, `authorizedBy`, `authorizedAt`, `expiresAt`, `policyVersion`, `policyRef`, `evaluationReference`.
- **`DENIED`** (`SUCCESS`): `proposalId`, `proposalVersion`, `denialReason: "INSUFFICIENT_COMPETENCE"`, `evaluationReference` opcional. **No crea Authorization.** Rechazo de negocio, replayable.
- **`CONDITIONAL`** (`SUCCESS`): `proposalId`, `proposalVersion`, y **condiciones concretas pendientes**. DTO **DIFERIDO**. **No crea Authorization.** Resultado de negocio, replayable.
- **`ERROR`** (`ERROR`): catálogo §7.5.

### 7.5 Catálogo de errores ratificados

**No replayables:** `INVALID_INPUT`, `UNSUPPORTED_CONTRACT_VERSION`, `UNAUTHENTICATED`, `FORBIDDEN` (denegación de acceso; **no** confundir con `DENIED`), `IDEMPOTENCY_CONFLICT`, `SERVICE_UNAVAILABLE` (`retryable: true`).

**Rechazos de negocio replayables (si consolidados):** `PROPOSAL_NOT_FOUND`, `PROPOSAL_VERSION_MISMATCH`, `PROPOSAL_NOT_AUTHORIZABLE`, `EVALUATION_EXPIRED`, `EVALUATION_VERSION_MISMATCH`, `AUTHORIZATION_ALREADY_ACTIVE`.

`FORBIDDEN` ≠ `DENIED`.

### 7.6 Orden de precondiciones de UC-04 — RATIFICADO (D5)

| Orden | Verificación | Resultado |
|---|---|---|
| 1 | Validación estructural del envelope **y del payload** (payload simple, no version-specific) | `INVALID_INPUT` |
| 2 | `contractVersion` | `INVALID_INPUT` / `UNSUPPORTED_CONTRACT_VERSION` |
| 3 | Autenticación | `UNAUTHENTICATED` |
| 4 | Permiso de operación | `FORBIDDEN` |
| 5 | Consulta de idempotencia | Replay original / `IDEMPOTENCY_CONFLICT` / continuar |
| 6 | Existencia de propuesta | `PROPOSAL_NOT_FOUND` |
| 7 | Coincidencia de versión de propuesta | `PROPOSAL_VERSION_MISMATCH` |
| 8 | Evaluación vinculada y condiciones de autorización | `PROPOSAL_NOT_AUTHORIZABLE` / `EVALUATION_EXPIRED` / `EVALUATION_VERSION_MISMATCH` |
| 9 | Ausencia de Authorization activa | `AUTHORIZATION_ALREADY_ACTIVE` |
| 10 | Evaluación de competencia logística | `AUTHORIZED` / `DENIED` / `CONDITIONAL` |
| 11 | Consolidación atómica | Resultado y efectos consolidados conjuntamente |

**Diferencia de forma con UC-01/UC-03 — no equivalencia:** UC-04 unifica validación estructural del envelope y del payload en el paso 1 (payload simple, no version-specific). UC-01/UC-03 desdoblan en paso 1 (envelope básico) + paso 5 (payload version-specific). Cada orden ratificado por su propio dictamen: D5 (UC-04), Etapa 5 (UC-01/UC-03). Ver §19.3.

**Lo que comparten los tres UC (principios, no precedencia exacta):** estructura → `contractVersion` → auth → authz → idempotencia → dominio → atomicidad.

### 7.7 Reglas de replay e idempotencia — RATIFICADO (D2+D4 + D5 + K-01)

**Identidad idempotente (D5):** `(actor autenticado, contractVersion, idempotencyKey)`. Argumentos comparados para replay/conflicto.

**Regla transversal:** misma `idempotencyKey` + `contractVersion` distinta → `IDEMPOTENCY_CONFLICT`. No se asume equivalencia semántica.

**Replay con resultado consolidado:**

1. Se devuelve el resultado original.
2. **No se reevalúan** precondiciones de dominio (pasos 6–10).
3. No se repiten efectos.
4. La evolución posterior del dominio no altera el resultado histórico.

**Replay por tipo de resultado de negocio consolidado:**

- **`AUTHORIZED`**: reproducir resultado original. No crear segunda Authorization.
- **`DENIED`**: reproducir resultado original con `denialReason`. No crea Authorization.
- **`CONDITIONAL`**: reproducir resultado original **incluidas condiciones concretas**. No crea Authorization.
- **Rechazos de negocio de precondición** (`PROPOSAL_NOT_FOUND`, `PROPOSAL_VERSION_MISMATCH`, `PROPOSAL_NOT_AUTHORIZABLE`, `EVALUATION_EXPIRED`, `EVALUATION_VERSION_MISMATCH`, `AUTHORIZATION_ALREADY_ACTIVE`): reproducir rechazo original. No crea Authorization.

**Consecuencia:** replay de `AUTHORIZED` sigue devolviendo autorización original aunque expire. Replay de `PROPOSAL_NOT_FOUND` conserva rechazo aunque la propuesta se cree después. Nueva intención → nueva `idempotencyKey`.

**Errores técnicos sin resultado de negocio consolidado:**

No se reproducen. Si no hay resultado consolidado, el reintento con misma identidad puede reejecutar. **`SERVICE_UNAVAILABLE` no se persiste** (D4).

**Bloqueo del replay por pasos previos (D5):** errores de pasos 1–4 preceden al replay. Un resultado consolidado **no** salta garantías actuales de interpretación contractual, identidad y acceso.

**Coherencia con Etapa 5:** mismo principio en §3.5.8. UC-01/UC-03 extienden el bloqueo al paso 5 (payload version-specific). UC-04 lo incluye en el paso 1 (payload simple).

### 7.8 Atomicidad — RATIFICADO (D2+D4 + D5)

Creación de Authorization + consolidación de su resultado idempotente = **una sola unidad lógica**.

- Éxito: existe Authorization y resultado idempotente.
- Fallo: no queda Authorization sin resultado, ni resultado apuntando a Authorization inexistente.

Mecanismo técnico: fuera del contrato conceptual.

### 7.9 Sustitución de autorización

- **No** sustitución de autorización activa en v1.
- Autorización expirada permanece histórica.
- Nueva autorización tras vencimiento.
- Revocación anticipada fuera de v1.

### 7.10 Aspectos pendientes de consolidación formal

- Consolidación formal completa del contrato UC-04. Las §7.1–§7.11 registran las decisiones ratificadas; la consolidación formal completará los diferidos identificados aquí.
- **DTO de `CONDITIONAL`** — DIFERIDO.
- **Clasificación específica de `EVALUATION_EXECUTION_FAILED`** y otros errores técnicos distintos de `SERVICE_UNAVAILABLE` — DIFERIDA.
- **Detalles técnicos de persistencia y recuperación** — implementación.
- **Semántica y formato de `retryAfter`** — DIFERIDO por D4.
- **Incremento, publicación y retirada de versiones** — DIFERIDO por D1.
- **Mecanismo técnico de detección cross-versión** — DIFERIDO por K-01.
- **Persistencia idempotente y recuperación de resultados inciertos** — DIFERIDO por D2+D4.

### 7.11 Estado

**RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente**. Sin implementación. Sin verificación.

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
- La expiración posterior de una evaluación no invalida retroactivamente una Authorization emitida, pero Recognition vuelve a comprobar las condiciones que correspondan.

Lo que **no** está definido y queda pendiente:

- Request/response conceptual.
- Precondiciones operativas.
- Catálogo de errores.
- Atomicidad específica más allá de la ya ratificada.
- Relación con `contextRef`.

**Estado:** SIN ABRIR. **No se anticipan decisiones.**

---

## 9. UC-06 — `RevokeAssignmentCommand` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Contexto ratificado por 18.6.2 y 18.6.4 (no contrato):

- `REVOKED` **no** significa eliminado.
- Una revocación afecta autorización o asignación dentro de FlowCore; no cancela automáticamente efecto físico externo (coherente con Commit #12 §17).
- Compensación externa, si procede, es **acción gobernada nueva**, no rollback.

Lo que **no** está definido: si UC-06 opera sobre `Assignment`, `Authorization` o ambos; si revocación anticipada es parte de UC-06 o UC distinto; request/response, precondiciones, errores; relación con `Recognition` previo.

**Estado:** SIN ABRIR.

---

## 10. UC-07 — `QueryProposalsRequest` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Contrato no iniciado.

**Estado:** SIN ABRIR.

---

## 11. UC-08 — `QueryAssignmentsRequest` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Contrato no iniciado.

**Estado:** SIN ABRIR.

---

## 12. UC-09 — `QueryEvidenceRequest` — SIN ABRIR

Reconocido en el catálogo ratificado de 18.6.1. Contexto ratificado por 18.6.5 (no contrato):

- Evidence original, `EvidenceAssessment`, `EvidenceLink` son entidades distintas.
- Aceptación de evidencia depende de la afirmación o decisión a la que se vincula.
- Un hash prueba integridad respecto de una referencia, no identidad ni procedencia por sí solo.
- Invalidación no reescribe historia ni revoca automáticamente.

**Estado:** SIN ABRIR.

---

## 13. Catálogo consolidado de errores (referencial, no cerrado)

Errores ratificados en UC-01..UC-04. **No** es catálogo cerrado; se completará con UC-05..UC-09.

Tres categorías:

- **A** — Resultados no replayables (validación, acceso, conflicto o fallo técnico sin resultado de negocio consolidado).
- **B** — Rechazo de negocio confirmado: replayable si consolidado. **Salvo en UC-02** (K-09).
- **C** — Clasificación pendiente.

### 13.1 Categoría A — Resultados no replayables

| Código | Origen | Notas |
|---|---|---|
| `INVALID_INPUT` | Envelope / UC | Validación contractual/estructural. Con `field` y `reasonCode` cuando aplique. |
| `UNSUPPORTED_CONTRACT_VERSION` | Envelope | D1. |
| `UNAUTHENTICATED` | Envelope / UC | Fallo de autenticación. |
| `FORBIDDEN` | Envelope / UC | Denegación de acceso. **No** confundir con `DENIED`. |
| `IDEMPOTENCY_CONFLICT` | Envelope / UC | Misma identidad + argumentos distintos; o misma `idempotencyKey` + `contractVersion` distinta (K-01). |
| `SERVICE_UNAVAILABLE` | Envelope / UC | Transitorio. `retryable: true`. No replayable. |
| `TASK_SEQUENCE_EMPTY` | UC-03 | Validación estructural. |
| `DUPLICATE_TASK_IN_SEQUENCE` | UC-03 | Validación estructural. |

### 13.2 Categoría B — Rechazo de negocio (replayable si consolidado, salvo UC-02)

| Código | Origen | Notas |
|---|---|---|
| `SCENARIO_ALREADY_EXISTS` | UC-01 | Replayable si consolidado. |
| `SCENARIO_NOT_FOUND` | UC-02/03 | En UC-03 replayable si consolidado. En UC-02 rechazo de negocio sin replay (K-09). **UC-01 no incluido** (K-07). |
| `SCENARIO_VERSION_MISMATCH` | UC-02/03 | En UC-03 replayable si consolidado. En UC-02 sin política de replay. |
| `PROPOSAL_NOT_FOUND` | UC-04 | Replayable si consolidado. |
| `PROPOSAL_VERSION_MISMATCH` | UC-04 | Replayable si consolidado. |
| `PROPOSAL_NOT_AUTHORIZABLE` | UC-04 | Replayable si consolidado. |
| `EVALUATION_EXPIRED` | UC-04 | Replayable si consolidado. |
| `EVALUATION_VERSION_MISMATCH` | UC-04 | Replayable si consolidado. |
| `AUTHORIZATION_ALREADY_ACTIVE` | UC-04 | Replayable si consolidado. |

### 13.3 Categoría C — Clasificación pendiente

| Código | Origen | Motivo |
|---|---|---|
| `INVALID_SCENARIO_DATA` | UC-01 | Validación estructural vs rechazo de negocio no ratificado (K-02). |
| `UNSUPPORTED_SCENARIO_VERSION` | UC-01 | Incompatibilidad contractual vs rechazo de negocio no ratificado (K-02). |
| `TASK_NOT_FOUND` | UC-03 | Semántica específica no ratificada (K-06). |
| `VEHICLE_NOT_FOUND` | UC-03 | Misma precisión que `TASK_NOT_FOUND` (K-06). |
| `UNSUPPORTED_PROPOSAL_SOURCE` | UC-03 | Validación de campo vs rechazo de negocio no ratificado (K-02). |
| `EVALUATION_EXECUTION_FAILED` | UC-03 | Ausencia de resultado de negocio impide replay; clasificación específica de causas y política de reintento diferida (K-03). |

### 13.4 Notas sobre el catálogo

- **`INVALID_TIME_WINDOW`** no es código de primer nivel. Es `reasonCode` bajo `INVALID_INPUT`, con `field: "arguments.requestedWindow"`, solo para entrada malformada en UC-03.
- **`FORBIDDEN` ≠ `DENIED`**: el primero es denegación de acceso (técnico); el segundo es resultado de negocio por insuficiencia de competencia (replayable).
- **`IDEMPOTENCY_CONFLICT`** cubre dos casos: (i) misma identidad + argumentos distintos; (ii) misma `idempotencyKey` + `contractVersion` distinta (K-01).
- **`SCENARIO_NOT_FOUND`** no aplica a UC-01 (K-07). UC-01 produce `SCENARIO_ALREADY_EXISTS`. En UC-03 es replayable si consolidado; en UC-02 sin política de replay (K-09).
- **Política de replay de errores técnicos distintos de `SERVICE_UNAVAILABLE`**: DIFERIDA.
- **`retryAfter`**: DIFERIDO.
- Consolidación definitiva del catálogo: pendiente de UC-05..UC-09.

---

## 14. Relaciones con contratos outbound

| Concepto inbound | Concepto outbound relacionado | Diferencia |
|---|---|---|
| `Command` de UC | `Command` de Commit #12 (outbound ejecución) | Distinta dirección, distinto origen de autoridad, distintas invariantes. |
| `idempotencyKey` (cliente) | `IdempotencyKey = f(CommandId)` (Commit #12) | Distinta semántica, distinta fuente. Identidad inbound = `(actor autenticado, contractVersion, idempotencyKey)` (D1 + D5 + Etapa 5). |
| `requestId` (servidor) | `CommandId` (Commit #12) | `requestId` identifica solicitud inbound; `CommandId` identifica intención outbound. |
| Veredictos `ELIGIBLE/INELIGIBLE/CONDITIONAL/UNDETERMINED` | `KnowledgeState` (Commit #12) | Veredicto de evaluación logística vs estado epistemológico de ejecución física. |
| `Authorization` de UC-04 | `Authorization` de Commit #12 | UC-04 autoriza Proposal; Commit #12 asume autorización para despachar Command outbound. No son la misma entidad. |
| Consultas de routing | `routing-port.md` | Proveedor aporta datos; dominio evalúa. `routing-port` no evalúa elegibilidad operacional. |

---

## 15. Estado consolidado por caso de uso

| UC | Nombre | Estado | Implementación | Verificación |
|---|---|---|---|---|
| ApplicationEnvelope | (contrato de envoltorio) | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-01 | `InitializeScenarioCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente (identidad y orden por Etapa 5) | No | No |
| UC-02 | `QueryScenarioRequest` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente (sin idempotencia) | No | No |
| UC-03 | `ProposeRoutesCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente (identidad y orden por Etapa 5) | No | No |
| UC-04 | `AuthorizeProposalCommand` | RATIFICADO CONCEPTUALMENTE — consolidación formal pendiente | No | No |
| UC-05 | `RecognizeProposalCommand` | SIN ABRIR | No | No |
| UC-06 | `RevokeAssignmentCommand` | SIN ABRIR | No | No |
| UC-07 | `QueryProposalsRequest` | SIN ABRIR | No | No |
| UC-08 | `QueryAssignmentsRequest` | SIN ABRIR | No | No |
| UC-09 | `QueryEvidenceRequest` | SIN ABRIR | No | No |

---

## 16. Deudas y pendientes de esta fase

### 16.1 Deudas cerradas

**Etapa 4:** D1, D2, D4, D5, D3 — **RATIFICADAS**.

**Etapa 5 — ratificadas en diseño por dictamen de Kael; aprobación documental pendiente de este v0.9:**

| Deuda | Estado |
|---|---|
| Actor en identidad idempotente de UC-01 y UC-03 | **RATIFICADA EN DISEÑO (Etapa 5)** — aprobación documental pendiente |
| Orden de precondiciones de UC-01 y UC-03 | **RATIFICADA EN DISEÑO (Etapa 5)** — aprobación documental pendiente |
| Bloqueo del replay en UC-01 y UC-03 | **RATIFICADA EN DISEÑO (Etapa 5)** — aprobación documental pendiente |

### 16.2 Asuntos diferidos

| Asunto | Estado |
|---|---|
| Formato concreto de la cadena de `contractVersion` | DIFERIDO |
| Política de incremento y publicación de versiones | DIFERIDO |
| Periodos de coexistencia y retirada de versiones antiguas | DIFERIDO |
| Mecanismo técnico de detección cross-versión | DIFERIDO (K-01) |
| Semántica y formato de `retryAfter` | DIFERIDO |
| Clasificación detallada de `EVALUATION_EXECUTION_FAILED` | DIFERIDO (K-03) |
| Clasificación detallada de `INVALID_SCENARIO_DATA`, `UNSUPPORTED_SCENARIO_VERSION`, `UNSUPPORTED_PROPOSAL_SOURCE` | DIFERIDO (K-02) |
| Clasificación detallada de `TASK_NOT_FOUND` y `VEHICLE_NOT_FOUND` | DIFERIDO (K-06) |
| Clasificación de otros errores técnicos distintos de `SERVICE_UNAVAILABLE` | DIFERIDO |
| Persistencia idempotente y recuperación de resultados inciertos | DIFERIDO (implementación) |
| Detalles técnicos de persistencia y recuperación | DIFERIDO (implementación) |

### 16.3 Deudas documentales y de consolidación

| Deuda | Estado |
|---|---|
| Aprobación documental de v0.9 por Kael | PENDIENTE |
| Consolidación formal de ApplicationEnvelope | PENDIENTE |
| Consolidación formal de UC-01 | PENDIENTE |
| Consolidación formal de UC-02 | PENDIENTE |
| Consolidación formal de UC-03 | PENDIENTE |
| Consolidación formal de UC-04 | PENDIENTE |
| DTO de `CONDITIONAL` en UC-04 | DIFERIDO |
| Catálogo consolidado de errores (tras UC-05..UC-09) | PENDIENTE |
| Revisión de coherencia transversal entre los nueve UC | PENDIENTE |
| Decisiones sobre tecnología de Application Layer | PENDIENTE |
| Materialización de este documento en el repositorio | PENDIENTE (Guss) |

### 16.4 Contratos sin abrir

| UC | Caso de uso | Estado |
|---|---|---|
| UC-05 | `RecognizeProposalCommand` | SIN ABRIR |
| UC-06 | `RevokeAssignmentCommand` | SIN ABRIR |
| UC-07 | `QueryProposalsRequest` | SIN ABRIR |
| UC-08 | `QueryAssignmentsRequest` | SIN ABRIR |
| UC-09 | `QueryEvidenceRequest` | SIN ABRIR |

Se abrirán cuando corresponda. No se anticipan contratos, decisiones ni pendientes particulares.

---

## 17. Notas de honestidad documental

1. **Borrador en conversación** v0.9 (revisión 4). No materializado en repositorio. Guss es quien lo materializa.
2. **Ningún** UC tiene implementación ni verificación a la fecha del corte.
3. **`CONSOLIDADO`** no se usa en v0.9 como etiqueta de estado de UC.
4. UC-01 a UC-04 están **RATIFICADOS CONCEPTUALMENTE**, no consolidados formalmente.
5. UC-05 a UC-09 están **SIN ABRIR**.
6. Referencias a Commit #12 y `routing-port.md` son **de contexto**, no importación.
7. Catálogo §13 con **tres categorías**; seis códigos en Categoría C pendientes de clasificación definitiva.
8. **`INVALID_TIME_WINDOW`** es `reasonCode` bajo `INVALID_INPUT`, no código de primer nivel.
9. **`requestId`** generado por el servidor; **nunca** suministrado por el cliente.
10. **`contractVersion` ≠ `scenarioFormatVersion` ≠ `scenarioVersion`**: tres identificadores independientes.
11. **`FORBIDDEN` ≠ `DENIED`**: primero denegación de acceso (técnico, no replayable); segundo resultado de negocio por insuficiencia de competencia (replayable).
12. **`SCENARIO_NOT_FOUND`** no aplica a UC-01 (K-07). UC-01 produce `SCENARIO_ALREADY_EXISTS`. En UC-03 replayable si consolidado; en UC-02 rechazo de negocio sin política de replay (K-09).
13. **Identidad idempotente:** §3.5. `contractVersion` (D1) y `actor autenticado` (D5 para UC-04; Etapa 5 para UC-01 y UC-03) forman parte de la identidad en todos los UC con idempotencia. Dos actores distintos no comparten resultados idempotentes. Los argumentos se comparan para replay/conflicto; no son parte de la identidad.
14. **Orden de precondiciones y bloqueo del replay:** D5 para UC-04; Etapa 5 para UC-01/UC-03. La forma **no es idéntica** entre los tres UC. Ver §0 y §19.3. Cada orden ratificado por su propio dictamen; ninguno se extiende por analogía.
15. **Estado de ratificación de Etapa 5:** las tres decisiones ratificadas en diseño por dictamen de Kael. Su presentación como "RATIFICADO CONCEPTUALMENTE" refleja ratificación de diseño; la **aprobación documental** del v0.9 es un acto distinto, pendiente.

**Historial completo:**

```
git log -- docs/research/fase-18.6.6-contratos-de-intercambio.md
```

16. La numeración de secciones es estable dentro de v0.9 (revisión 4).

---

## 18. Estado del documento

```
Documento: fase-18.6.6-contratos-de-intercambio.md
Versión:   v0.9 (revisión 4) — cierre editorial; historial delegado a Git
Estado:    🟡 BORRADOR — pendiente de dictamen documental definitivo de Kael y materialización por Guss
Cobertura: ApplicationEnvelope, UC-01..UC-09

Ratificación en diseño (Etapa 5):
  Actor en identidad UC-01/UC-03:        RATIFICADA EN DISEÑO — aprobación documental pendiente
  Orden de precondiciones UC-01/UC-03:   RATIFICADA EN DISEÑO — aprobación documental pendiente
  Bloqueo del replay UC-01/UC-03:        RATIFICADA EN DISEÑO — aprobación documental pendiente

Ratificación previa (Etapa 4):
  D1, D2, D4, D5, D3:                    RATIFICADAS

Identidad idempotente:
  - UC-01:  RATIFICADA EN DISEÑO (Etapa 5) — aprobación documental pendiente
  - UC-03:  RATIFICADA EN DISEÑO (Etapa 5) — aprobación documental pendiente
  - UC-04:  RATIFICADA (D5)
  - UC-02:  SIN IDEMPOTENCIA en esta versión

Clasificación de errores:    Tres categorías; seis códigos en clasificación pendiente
Sin abrir:                   UC-05, UC-06, UC-07, UC-08, UC-09
Pendiente:
  - Dictamen documental definitivo de Kael
  - Materialización por Guss (autorización explícita)
  - Clasificación definitiva de seis códigos en Categoría C
  - Consolidación formal de los cuatro UC
No crea:   decisiones nuevas fuera de las ratificadas en Etapa 4 y ratificadas en diseño en Etapa 5
No modifica: código, FlowCore, GeoWorkbench, Greedy, Commit #12, routing-port.md

Historial completo:
git log -- docs/research/fase-18.6.6-contratos-de-intercambio.md
```

---

## 19. Registro de Etapa 5

### 19.1 Estado de ratificación

| Deuda | Dictamen de Kael (Etapa 5) | Aprobación documental (v0.9) |
|---|---|---|
| Actor en identidad idempotente de UC-01 y UC-03 | RATIFICADA — A | PENDIENTE |
| Orden de precondiciones de UC-01 y UC-03 | RATIFICADA — A, refinada | PENDIENTE |
| Sub-decisión A1 (validación estructural completa antes de idempotencia) | RATIFICADA — A1 | PENDIENTE |
| Bloqueo del replay en UC-01 y UC-03 | RATIFICADA — A, refinada | PENDIENTE |

"Ratificación en diseño" ≠ "aprobación documental". La primera es el dictamen que fijó la decisión arquitectónica. La segunda es el acto de aprobar el v0.9 como registro documental fiel.

### 19.2 Justificación de las ratificaciones

| Deuda | Justificación |
|---|---|
| **Actor en identidad idempotente de UC-01 y UC-03** | Aislamiento de seguridad: la clave idempotente no puede ser mecanismo de consulta de resultados de otros actores. Consistencia con D5 (mismo principio para UC-04). Reversibilidad. Práctica estándar. |
| **Orden de precondiciones de UC-01 y UC-03** | Estructural básica → versión → auth → authz → payload version-specific → idempotencia → dominio → atomicidad. Respeta D1 (versión antes de idempotencia), D2 (replay sin reevaluación de dominio), seguridad (auth/authz antes de idempotencia). Split 1 + 5 necesario por complejidad de payload. |
| **Sub-decisión A1** | Payload estructuralmente inválido no recibe resultado consolidado aunque presente `idempotencyKey` conocida. Validación estructural ≠ validación de dominio. |
| **Bloqueo del replay** | Pasos 1–5 bloquean. Un resultado consolidado no puede eludir validación estructural, autenticación o autorización actuales. |

### 19.3 Diferencia contractual entre el orden de UC-04 (D5) y el orden de UC-01/UC-03 (Etapa 5)

**No hay equivalencia absoluta de precedencia.** Hay **diferencia contractual real**.

| UC | Paso 1 | Paso 5 |
|---|---|---|
| **UC-04 (D5)** | Validación estructural del envelope **y del payload** (unificado) | N/A |
| **UC-01/UC-03 (Etapa 5)** | Estructura básica del envelope | Validación estructural del payload version-specific |

**Comparten los tres UC** (principios, no precedencia exacta):
- Estructura → `contractVersion` → auth → authz → idempotencia → dominio → atomicidad.
- Ningún resultado consolidado puede eludir validación estructural, autenticación o autorización.

**Difiere:**
- **Momento de la validación del payload:** en UC-04, paso 1 (antes de auth). En UC-01/UC-03, paso 5 (después de auth y authz).
- **Consecuencia en el bloqueo:** UC-04 bloquea 4 pasos; UC-01/UC-03 bloquean 5. En ambos casos el bloqueo impide el replay si falla cualquier validación previa.

**Justificación de la diferencia:**
- Payload de UC-04 (`proposalId`, `proposalVersion`, `expectedEvaluationId`, `note`) es **simple y no version-specific**. No hay ventaja técnica en desdoblar su validación.
- Payloads de UC-01 (`data`) y UC-03 (`taskSequence`, `proposalSource`, `requestedWindow`) son **complejos y version-specific**. Requieren `contractVersion` para interpretarse. Su validación es más costosa; tiene sentido hacerla **después** de auth y authz (rechazo temprano de no autorizados antes de gastar recursos).

**Atribución independiente:**
- Orden de UC-04: ratificado por **D5**.
- Orden de UC-01/UC-03: ratificado por **Etapa 5**.
- Ninguno se extiende por analogía al otro.

### 19.4 Límites explícitos de Etapa 5

- D1–D5 no se reabren.
- D5 conserva su atribución a UC-04.
- UC-02 permanece sin idempotencia.
- Los seis códigos de Categoría C continúan pendientes.
- DTO de `CONDITIONAL` continúa pendiente.
- `retryAfter`, política de versiones y detección cross-versión continúan pendientes.
- UC-05..UC-09 permanecen cerrados.
- No se autoriza modificar código ni ejecutar cambios en el repositorio.

---

**Fin del Documento B v0.9 (revisión 4).**