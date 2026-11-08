# Fase 18.6.6 — Contrato UC-05: `RecognizeProposalCommand`

**Proyecto:** Gudo Labs / FlowCore
**Alcance:** Contrato de intercambio inbound (Application Layer)
**Versión:** v1.0 — Consolidación Conceptual Aprobada
**Estado:** 🟢 CONSOLIDADO (Conceptualmente)
**Naturaleza:** Registro contractual. No implementa código.

---

## 1. Semántica y Principio Rector
Reconocer una propuesta es el acto de gobernanza que materializa la intención aprobada en asignaciones operativas (`Assignment`). Es el puente entre el plan (intención) y la operación (realidad). 

> **Principio de Gudo Labs:** FlowCore no autoriza porque algo alguna vez fue posible. Reconoce porque sigue siendo legítimo hacerlo en el momento de la operación.

`AUTHORIZED` ≠ `ELIGIBLE`. La autorización es un hecho histórico inmutable. La elegibilidad es una condición evaluable en el tiempo. El reconocimiento nunca confía en evaluaciones pasadas.

## 2. Actores y Autoridad
*   **Autorizador (UC-04):** Planeador. Aprueba el plan.
*   **Reconocedor (UC-05):** Operaciones / Despacho. Asume la responsabilidad operativa de materializarlo.
*   **Permiso requerido:** `proposal.recognize`. (El Kernel no conoce roles, la Application Layer traduce el rol a este permiso).

## 3. Invariantes del Dominio
1.  **Re-evaluación obligatoria:** UC-05 siempre ejecuta una nueva evaluación del dominio antes de crear asignaciones. El campo `expectedEvaluationId` es solo una precondición opcional de concurrencia optimista (verifica que el cliente y el servidor hablan de la misma versión de evaluación), pero no sustituye la reevaluación real.
2.  **Sin degradación de estado:** Si la re-evaluación falla (ej. vehículo averiado), la propuesta permanece en `AUTHORIZED`. El intento falla, pero la gobernanza no se contamina.
3.  **No `BLOCKED` ni `STALE`:** No se introducen nuevos estados al ciclo de vida de la Propuesta para representar problemas temporales.
4.  **Atomicidad:** O se crean todas las asignaciones y se registra el reconocimiento, o no se crea ninguna. No hay estados parciales.
5.  **Control de Concurrencia (TOCTOU):** El dominio/infraestructura garantiza la reserva efectiva de los recursos. FlowCore no impone la técnica (lock optimista, pesimista, etc.), solo exige el resultado consistente.

## 4. Idempotencia y Reintentos
La `idempotencyKey` identifica un intento concreto de reconocimiento:
*   **Misma clave + mismos argumentos:** Devuelve el resultado original (incluso si fue un fallo de negocio).
*   **Misma clave + argumentos diferentes:** `IDEMPOTENCY_CONFLICT`.
*   **Reintento tras corregir el problema:** Requiere una nueva `idempotencyKey` (es una nueva intención operativa).

El campo `retryable` en la respuesta no es fijo. Depende de la causa del fallo, dictaminada por el dominio:
*   `RESOURCE_CONCURRENCY`: Generalmente `true` (el recurso podría liberarse).
*   `RESOURCE_NOT_AVAILABLE`: Depende de si la disponibilidad puede cambiar pronto.
*   `DOMAIN_VALIDATION_FAILED`: Generalmente `false` (el plan requiere cambios estructurales).

## 5. Solicitud (Request)
*   `proposalId`: ID de la propuesta.
*   `proposalVersion`: Versión autorizada.
*   `expectedEvaluationId`: (Opcional) Concurrencia optimista.
*   `idempotencyKey`: Requerido.
*   `contractVersion`: Requerido.
*   *(El `RequestContext` provee el actor autenticado).*

## 6. Respuesta (Response)
**Éxito (`RECOGNIZED`):**
*   `assignments`: Lista de asignaciones creadas.
*   `recognizedAt`: Timestamp.
*   `actor`: Quién lo ejecutó.

**Fallo de Negocio (`PROPOSAL_NOT_RECOGNIZABLE`):**
*   `proposalStatus`: `AUTHORIZED` (permanece intacto).
*   `reason`: `RESOURCE_NOT_AVAILABLE` | `RESOURCE_CONCURRENCY` | `DOMAIN_VALIDATION_FAILED`.
*   `retryable`: `boolean` (calculado por el dominio).

## 7. Catálogo de Errores
*   **Fallo Técnico/Contrato:** `UNAUTHENTICATED`, `FORBIDDEN`, `INVALID_INPUT`, `IDEMPOTENCY_CONFLICT`.
*   **Precondición:** `PROPOSAL_NOT_FOUND`, `PROPOSAL_VERSION_MISMATCH`, `PROPOSAL_NOT_AUTHORIZED`.
*   **Negocio:** `PROPOSAL_NOT_RECOGNIZABLE`.

## 8. Pendientes Explícitos (Diferidos)
*   DTO exacto de `Assignment`.
*   Política de caducidad de las reservas (Logistics Domain).
*   Implementación técnica de la concurrencia (Infrastructure Layer).

---
**Fin del Contrato Conceptual UC-05.**