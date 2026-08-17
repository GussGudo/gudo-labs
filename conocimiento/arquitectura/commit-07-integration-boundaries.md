# Integration Boundaries & External System Authority
## Modelo de Integración v1.0 — Gudo Labs / FlowCore

---

## 1. Propósito

Este documento establece las reglas fundamentales de integración, fronteras de dominio, soberanía de datos, integridad temporal y versionado de contexto entre **FlowCore** y los sistemas externos (ERP, OMS, CRM, Sistemas Fiscales y de Caja/Cobranza).

Su objetivo es blindar a FlowCore contra **el acoplamiento estructural destructivo**, garantizando que el sistema mantenga soberanía absoluta sobre la realidad logística física sin convertirse en un ERP comercial o financiero.

---

## 2. Alcance

### Dentro del Alcance (In Scope)

* Definición de soberanía y propiedad de datos (Ownership).
* Tratamiento de comandos externos, cancelaciones y conflictos operacionales.
* Integridad temporal multidimensional (Ocurrencia, Observación, Ingestión).
* Estrategia de reconciliación temporal para eventos tardíos o fuera de orden.
* Versionado y vigencia de contexto comercial/operativo (Context Binding).
* Especificación de los 8 Artefactos Canónicos de Integración.
* Definición de la liberación de custodia física (`OperationalRelease`).

### Fuera del Alcance (Explicitly Out of Scope)

* Esquemas DDL o tablas físicas de PostgreSQL.
* Definición de APIs REST, GraphQL o gRPC.
* Selección de infraestructura de mensajería (Kafka, RabbitMQ, NATS).
* Implementación de adaptadores o código ORM.
* Patrones de implementación técnica (CQRS, Event Sourcing).

---

## 3. Frontera de Autoridad

FlowCore reconoce que opera dentro de un **Ecosistema Empresarial**, donde coexisten múltiples autoridades de dominio.

* **Sistemas Comerciales / ERP / OMS:** Autoridad maestra sobre clientes, precios, contratos, créditos, pedidos comerciales y facturación fiscal.
* **FlowCore Kernel:** Autoridad maestra única e inviolable sobre la realidad física, unidades de manejo (`HandlingUnits`), mercancía bajo custodia (`Goods` / `InventoryUnits`), estado de misiones, tareas de ejecución y evidencia operacional.
* **Sistemas Financieros / Caja:** Autoridad maestra sobre la recepción de dinero en efectivo, liquidación contable, *settlement* y cuentas por cobrar.

---

## 4. Reglas de Soberanía y Propiedad de Datos

### Regla 11 — Consumo sin Apropiación de Autoridad

Un dato externo (precio, condición comercial, límite de crédito) puede ser consumido y portado por FlowCore para ejecutar una transformación logística, sin que FlowCore adquiera autoridad maestra ni responsabilidad contable sobre él.

### Regla 12 — Soberanía Inviolable sobre la Realidad Física

FlowCore es la autoridad maestra única sobre la custodia de `Goods`, `InventoryUnits` y `HandlingUnits`, así como sobre la ejecución operacional.

Ningún sistema externo puede mutar directamente un estado logístico sin pasar por la evaluación del motor de ejecución de FlowCore.

---

## 5. Reglas de Manejo de Comandos y Conflictos Externos

### Regla 13 — No Retroactividad

Una instrucción o comando externo no puede reescribir ni invalidar retroactivamente hechos logísticos ya ocurridos e inmutabilizados en la historia.

### Regla 14 — Carácter Solicitante de Instrucciones Externas

Los sistemas externos solicitan cambios sobre la operación (`ExternalCommandRequest`).

FlowCore determina de forma autónoma la aplicabilidad operacional del comando respecto a la realidad física de la misión y emite un veredicto explícito (`OperationalDecision`: `ACCEPTED`, `REJECTED`, `PARTIALLY_APPLIED`).

### Regla 15 — Determinismo por Concurrencia Temporal

La aplicabilidad de una instrucción externa se evalúa de acuerdo con el estado operacional conocido por FlowCore al momento de su recepción, sin alterar la validez de los hechos registrados con anterioridad.

---

## 6. Reglas de Integridad Temporal y Observación

### Regla 16 — Temporalidad Multidimensional

Un hecho operacional posee inherentemente al menos tres dimensiones temporales distintas y **no intercambiables**:

1. `occurred_at`: Momento de ocurrencia física del hecho.
2. `observed_at`: Momento de captura o registro por el observador/dispositivo.
3. `ingested_at`: Momento de recepción e inmutabilización en FlowCore Kernel.

### Regla 17 — Reconciliación Temporal No Retroactiva

La llegada tardía de un hecho operacional no modifica ni elimina eventos o decisiones previamente registradas; genera un hecho de conciliación explícito (`TemporalReconciliationDetected`) que actualiza la proyección de estado actual preservando la historia intacta.

`History != CurrentState`

### Regla 18 — Idempotencia Histórica

La retransmisión o duplicación de un evento identificable (`event_id`) debe ser procesada mediante *Idempotent Replay*, garantizando la unicidad de la línea del tiempo.

### Regla 19 — Honestidad Temporal y Confiabilidad

El tiempo de ocurrencia declarado por un cliente o dispositivo externo no se asume como verdad absoluta; su nivel de confianza (`temporal_confidence`) se determina mediante la fuente del tiempo (`time_source`) y las evidencias físicas adjuntas.

---

## 7. Reglas de Contexto, Versionado y Vigencias

### Regla 20 — Inmutabilidad del Contexto Operacional

Una operación ejecutada conserva la referencia al contexto y versión utilizados durante su ejecución.

Una modificación posterior del contexto en los sistemas externos no altera retroactivamente dicha referencia.

### Regla 21 — Vigencia Operacional del Contexto

La aplicabilidad de un contexto comercial o normativo se determina por su período de vigencia (`effective_from` / `effective_until`) y por el tiempo operacional correspondiente a la acción, independientemente de la fecha en que el documento que lo contiene haya sido creado.

### Regla 22 — Actualización Contextual Explícita

Ningún cambio de contexto durante una misión podrá aplicarse de forma silenciosa.

Toda actualización deberá estar respaldada por una regla de vigencia, un nuevo vínculo contextual (`OperationalContextBinding`) y la trazabilidad explícita de su aplicación.

---

## 8. Los 8 Artefactos Canónicos de Integración

1. **`ExternalCommand`**: Solicitud enviada por un sistema externo para modificar o alterar el curso de una operación (e.g., `CancelDemand`).

2. **`ExternalEvent`**: Notificación inmutable de un hecho ocurrido en el dominio externo (e.g., `CustomerCreditBlocked`).

3. **`ContextSnapshot`**: Captura estática e inmutable de la información comercial/normativa necesaria para la ejecución logística.

4. **`OperationalContextBinding`**: Enlace explícito que vincula una Misión o Tarea con una versión específica de un `ContextSnapshot` y su vigencia.

5. **`OperationalDecision`**: Registro formal del veredicto emitido por FlowCore tras evaluar la aplicabilidad de un `ExternalCommand`.

6. **`IntegrationEvent`**: Hecho operacional de dominio publicado por FlowCore hacia el ecosistema externo (e.g., `TaskCompleted`).

7. **`TemporalReconciliationDetected`**: Evento de dominio generado al recibir hechos tardíos u fuera de orden que alteran la proyección del estado sin modificar la historia.

8. **`OperationalRelease`**: Señal de que FlowCore ha terminado su responsabilidad sobre la custodia física y publica el resultado operacional conciliado hacia el sistema externo responsable del *settlement* comercial o financiero.

---

## 9. Matriz de Autoridad y Soberanía

| Entidad / Concepto | Autoridad Maestra | Consumidor en FlowCore | Mecanismo de Paso |
| :--- | :--- | :--- | :--- |
| Catálogo de Clientes | CRM / ERP | Lectura / Referencia | Inyectado en `LogisticDemand` |
| Precios y Promociones | OMS / E-Commerce | Lectura / Referencia | `ContextSnapshot` + `OperationalContextBinding` |
| Pedido / Demanda Comercial | OMS / ERP | Inmutable | `ExternalEvent` / Ingress Adapter → `LogisticDemand` |
| Asignación de Custodia | FlowCore | Autoridad Maestra | Estado de Custodia (`Goods` / `HandlingUnits`) |
| Misión y Tareas | FlowCore | Autoridad Maestra | Execution Engine |
| Evidencia Física | FlowCore | Autoridad Maestra | Evidence Store (Append-Only) |
| Conciliación de Custodia | FlowCore | Autoridad Maestra | `MissionClosure` & `OperationalRelease` |
| Facturación y Settlement | ERP / Caja | Consumidor de hechos | Suscrito a `OperationalRelease` |

---

## 10. Matriz de Prueba de Consistencia de Artefactos

Cada uno de los 8 artefactos canónicos responde de manera determinista a las 7 preguntas de consistencia:

| Artefacto | ¿Quién lo crea? | ¿Quién tiene autoridad? | ¿Es mutable? | ¿Qué tiempo representa? | Identificador | Duplicado (Replay) | Evento Tardío |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`ExternalCommand`** | Sistema Externo | Sistema Externo | ❌ No | Ingestión | `command_id` | Ignorado (Idempotente) | Evaluado por `OperationalDecision` |
| **`ExternalEvent`** | Sistema Externo | Sistema Externo | ❌ No | Ocurrencia Externa | `external_event_id` | Ignorado (Idempotente) | Ingestado en Event Stream |
| **`ContextSnapshot`** | Context Adapter | Sistema Externo | ❌ No | Vigencia Comercial | `snapshot_hash` | Reuso de Snapshot | N/A (Estático por versión) |
| **`OperationalContextBinding`** | FlowCore Kernel | FlowCore Kernel | ❌ No | Asignación Misión/Tarea | `binding_id` | Unicidad por Misión/Tarea | Sustitución explícita por vigencia |
| **`OperationalDecision`** | FlowCore Engine | FlowCore Kernel | ❌ No | Evaluación | `decision_id` | Respeta veredicto `T_eval` | Mantiene validez histórica `T_eval` |
| **`IntegrationEvent`** | FlowCore Kernel | FlowCore Kernel | ❌ No | Ocurrencia Logística | `event_id` | Consumidor idempotente | Publicado con sequence index |
| **`TemporalReconciliationDetected`** | FlowCore Engine | FlowCore Kernel | ❌ No | Descubrimiento / Reconciliación | `reconciliation_id` | Idempotent Replay | Ajusta Proyección (`History != State`) |
| **`OperationalRelease`** | FlowCore Kernel | FlowCore Kernel | ❌ No | Cierre de Custodia | `release_id` | Idempotent Replay | Publica resultado al settlement |

---

## 11. Escenarios de Validación Operacional

| Escenario | Comportamiento Esperado de FlowCore |
| :--- | :--- |
| **ERP crea Demanda** | FlowCore ingesta la intención comercial y crea una `LogisticDemand`. |
| **ERP cancela antes de despacho** | FlowCore evalúa el comando, confirma estado `NOT_STARTED` y emite `OperationalDecision: ACCEPTED`. |
| **ERP cancela después de entrega** | FlowCore evalúa el comando, confirma tarea `COMPLETED` y emite `OperationalDecision: REJECTED`. El hecho permanece. |
| **Evento de campo llega duplicado** | El motor identifica el `event_id` previamente ingestado y responde mediante *Idempotent Replay*. |
| **Evento de campo llega tardío** | FlowCore ingesta el evento con su `occurred_at` declarado y emite un `TemporalReconciliationDetected` para actualizar la proyección. |
| **Misión dura 3 días** | Las tareas ejecutan bajo el `OperationalContextBinding` cuya vigencia abarca el tiempo operacional de cada acción. |
| **Cambio de contexto en vuelo** | La nueva versión de contexto no reemplaza silenciosamente el binding activo; requiere una regla de actualización explícita. |
| **Misión finaliza físicamente** | FlowCore realiza el conteo de custodia, valida el balance y emite el `OperationalRelease`. |
| **Caja recibe efectivo** | La gestión del dinero físico/electrónico ocurre en el sistema de Caja fuera de FlowCore. |
| **ERP genera Factura Fiscal** | El ERP consume el `OperationalRelease` y genera el documento fiscal dentro de su propio dominio. |

---

## 12. Decisiones Arquitectónicas Cerradas

1. FlowCore no almacena saldos contables, cuentas por cobrar ni impuestos.
2. La conciliación de misión (`MissionClosure`) es una conciliación física de custodia, no una liquidación financiera.
3. Las decisiones tomadas en el pasado sobre el estado conocido en ese momento son históricamente válidas y jamás se reescriben.
4. La historia es un registro append-only inmutable; el estado actual es una proyección calculada sobre la historia y las reconciliaciones.
5. El dispositivo móvil es un adaptador de ejecución portante (`MobileExecutionPort`), no una autoridad de dominio.
6. `OperationalRelease` no constituye una transacción financiera ni una autorización contable; únicamente marca la liberación de responsabilidad operacional de FlowCore y publica los hechos conciliados al sistema externo correspondiente.

---

## 13. Declaración de Estado

**COMMIT #7 OFICIALMENTE FORMULADO Y LISTO PARA SELLADO.**

*Gudo Labs Architecture Group — August 2026*
