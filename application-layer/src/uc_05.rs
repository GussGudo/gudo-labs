//! UC-05 — RecognizeProposal. Handler preparado; NO se registra en el router hasta C5.
//!
//! En C2:
//! - Autenticación, autorización por `Permission::RecognizeProposal`, validación de
//!   envelope, idempotencia y búsqueda/versionado de la propuesta están implementados.
//! - La reevaluación del dominio es un STUB explícito que siempre falla con
//!   `DOMAIN_VALIDATION_FAILED`. Ver TODO(C3). NO es comportamiento productivo.

use std::sync::Arc;

use axum::{
    extract::{Json, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
};
use serde::Deserialize;
use serde_json::json;

use crate::auth::{self, Permission, RequestContext};
use crate::envelope;
use crate::store::{
    BusinessFailureReason, IdempotencyKey, IdempotencyRecord, InMemoryStore,
    RequestFingerprint, StoredOutcome,
};

const CONTRACT_VERSION_SUPPORTED: &str = "1.0";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub contract_version: Option<String>,
    pub idempotency_key: Option<String>,
    pub correlation_id: Option<String>,
    pub proposal_id: Option<String>,
    pub proposal_version: Option<u32>,
    pub expected_evaluation_id: Option<String>,
}

enum HandlerOutcome {
    Replay(StoredOutcome),
    Conflict,
    NotFound,
    VersionMismatch,
    NotAuthorized,
    Evaluated(StoredOutcome),
}

pub async fn handle(
    State(store): State<Arc<InMemoryStore>>,
    headers: HeaderMap,
    Json(req): Json<Request>,
) -> Response {
    let request_id = envelope::gen_request_id();
    let received_at = envelope::now_iso();
    let correlation_id = envelope::resolve_correlation_id(req.correlation_id.clone(), &request_id);

    // 1. contractVersion obligatorio + soportado
    match req.contract_version.as_deref() {
        Some(v) if v == CONTRACT_VERSION_SUPPORTED => {}
        Some(_) => {
            return envelope::err_response(
                request_id, correlation_id, received_at,
                "UNSUPPORTED_CONTRACT_VERSION", None, None,
            )
        }
        None => {
            return envelope::err_response(
                request_id, correlation_id, received_at,
                "INVALID_INPUT", Some("contractVersion"), Some("MISSING"),
            )
        }
    }

    // 2. Autenticación
    let actor = match auth::authenticate(&headers) {
        Ok(a) => a,
        Err(_) => {
            return envelope::err_response(
                request_id, correlation_id, received_at,
                "UNAUTHENTICATED", None, None,
            )
        }
    };

    // 3. Autorización: permiso específico
    if !actor.permissions.contains(&Permission::RecognizeProposal) {
        return envelope::err_response(
            request_id, correlation_id, received_at,
            "FORBIDDEN", None, None,
        );
    }

    // 4. idempotencyKey obligatorio
    let idempotency_key = match req.idempotency_key {
        Some(k) if !k.is_empty() => k,
        _ => {
            return envelope::err_response(
                request_id, correlation_id, received_at,
                "INVALID_INPUT", Some("idempotencyKey"), Some("MISSING"),
            )
        }
    };

    // 5. proposalId + proposalVersion obligatorios
    let proposal_id = match req.proposal_id {
        Some(p) if !p.is_empty() => p,
        _ => {
            return envelope::err_response(
                request_id, correlation_id, received_at,
                "INVALID_INPUT", Some("proposalId"), Some("MISSING"),
            )
        }
    };
    let proposal_version = match req.proposal_version {
        Some(v) => v,
        None => {
            return envelope::err_response(
                request_id, correlation_id, received_at,
                "INVALID_INPUT", Some("proposalVersion"), Some("MISSING"),
            )
        }
    };

    // 6. expectedEvaluationId — gap contractual #1 (UC-05 §7 no define error de mismatch).
    //
    // ATENCIÓN: la inclusión de este campo en el fingerprint NO resuelve el gap.
    // Son DOS controles independientes:
    //
    //   1. IDEMPOTENCIA (fingerprint):   ¿es exactamente la misma intención
    //                                     respecto a intentos previos?
    //   2. PRECONDICIÓN OPTIMISTA:       ¿sigue vigente en el servidor la evaluación
    //                                     sobre la que el cliente pretende actuar?
    //
    // El fingerprint resuelve (1). NO resuelve (2). C3 NO debe tratar el fingerprint
    // como sustituto de la validación de precondición.
    //
    // Comportamiento en C2: campo aceptado, incluido en fingerprint, NO validado.
    // Deliberado y documentado. No bloquea C2; bloquea certificación plena de UC-05.
    let expected_evaluation_id = req.expected_evaluation_id;

    let _ctx: RequestContext = auth::build_context(
        actor.clone(),
        received_at.clone(),
        CONTRACT_VERSION_SUPPORTED.to_string(),
        Some(idempotency_key.clone()),
    );

    let idem_key = IdempotencyKey {
        actor: actor.id.clone(),
        contract_version: CONTRACT_VERSION_SUPPORTED.to_string(),
        idempotency_key,
    };
    let fingerprint = RequestFingerprint {
        proposal_id: proposal_id.clone(),
        proposal_version,
        expected_evaluation_id,
    };

    // 7. Sección crítica — los 5 pasos completos.
    //
    // COBERTURA IDEMPOTENTE EN C2 (delimitada explícitamente):
    //   ✅ Persistido y reproducido:
    //        - StoredOutcome::BusinessFailure  (fallo de reevaluación)
    //        - StoredOutcome::Recognized       (éxito — producido por C3;
    //                                           la variante existe pero en C2
    //                                           ningún camino la alcanza porque
    //                                           la reevaluación es stub)
    //   ⚠️ Recomputado en cada intento, NO persistido:
    //        - NotFound
    //        - VersionMismatch
    //        - NotAuthorized
    //      Efecto: si el estado subyacente cambia entre intentos con la misma
    //      identidad idempotente, el resultado puede diferir (ej: primer intento
    //      → PROPOSAL_NOT_FOUND; propuesta creada entre intentos; segundo intento
    //      con misma key → PROPOSAL_NOT_AUTHORIZED en lugar de replay).
    //
    //      UC-05 §4 (por analogía a UC-04 §5 cat B) sugiere que estos también
    //      deberían persistirse. Postergado a C3/C4 por dos razones:
    //        (a) la clasificación exacta business failure vs precondition failure
    //            depende del modelo de dominio que vive en C3;
    //        (b) la persistencia completa es la tarea de C4.
    //
    //      C2 NO presenta idempotencia como garantía completa. La presenta como
    //      garantía completa SOLO para los resultados de reevaluación (éxito o
    //      fallo de negocio derivado de la reevaluación).
    //
    // Atomicidad: la sección crítica da exclusión mutua intra-proceso + fase de
    // mutación atómica bajo caminos normales. NO es transacción durable. Ver
    // doc-comment de `InMemoryStore::with_critical_section`.
    let outcome = store.with_critical_section(|state| {
        // 7.1 idempotencia
        if let Some(record) = state.idempotent_outcomes.get(&idem_key) {
            return if record.fingerprint == fingerprint {
                HandlerOutcome::Replay(record.outcome.clone())
            } else {
                HandlerOutcome::Conflict
            };
        }

        // 7.2 proposal lookup
        let proposal = match state.proposals.get(&proposal_id) {
            Some(p) => p.clone(),
            None => return HandlerOutcome::NotFound,
        };

        // 7.3 version match
        if proposal.proposal_version != proposal_version {
            return HandlerOutcome::VersionMismatch;
        }

        // 7.4 estado AUTHORIZED
        if proposal.status != "AUTHORIZED" {
            return HandlerOutcome::NotAuthorized;
        }

        // 7.5 Reevaluación — STUB en C2.
        //
        // TODO(C3): reemplazar por reevaluación real del dominio logístico.
        // En C2 todo intento válido sobre una propuesta AUTHORIZED y version-matched
        // termina en DOMAIN_VALIDATION_FAILED. Placeholder explícito; NO productivo.
        let _ = &_ctx;
        let outcome = StoredOutcome::BusinessFailure {
            proposal_status: "AUTHORIZED".into(),
            reason: BusinessFailureReason::DomainValidationFailed,
            retryable: false,
        };

        // 7.6 Fase de mutación — inserciones que no fallan lógicamente.
        // En C3, si la reevaluación tiene éxito, aquí se insertan también los
        // assignments producidos (bajo la misma sección crítica, sin await).
        let record = IdempotencyRecord {
            fingerprint,
            outcome: outcome.clone(),
        };
        state.idempotent_outcomes.insert(idem_key, record);

        HandlerOutcome::Evaluated(outcome)
    });

    // 8. Construcción de respuesta — fuera del lock.
    match outcome {
        HandlerOutcome::Conflict => envelope::err_response(
            request_id, correlation_id, received_at,
            "IDEMPOTENCY_CONFLICT", None, None,
        ),
        HandlerOutcome::NotFound => envelope::err_response(
            request_id, correlation_id, received_at,
            "PROPOSAL_NOT_FOUND", None, None,
        ),
        HandlerOutcome::VersionMismatch => envelope::err_response(
            request_id, correlation_id, received_at,
            "PROPOSAL_VERSION_MISMATCH", None, None,
        ),
        HandlerOutcome::NotAuthorized => envelope::err_response(
            request_id, correlation_id, received_at,
            "PROPOSAL_NOT_AUTHORIZED", None, None,
        ),
        HandlerOutcome::Replay(o) | HandlerOutcome::Evaluated(o) => {
            success_response(request_id, correlation_id, received_at, o)
        }
    }
}

fn success_response(
    request_id: String,
    correlation_id: String,
    received_at: String,
    outcome: StoredOutcome,
) -> Response {
    // Decisión de diseño #5 — interpretación de la ambigüedad §6–7 de UC-05 v1.0.
    // Consistente con UC-04 (DENIED va en result.outcome, no en error.code).
    // NO es ratificación contractual. Si UC-05 se enmienda (v1.1), revisar.
    match outcome {
        StoredOutcome::Recognized {
            assignments,
            recognized_at,
            actor,
        } => {
            let body = json!({
                "requestId": request_id,
                "correlationId": correlation_id,
                "receivedAt": received_at,
                "respondedAt": envelope::now_iso(),
                "processingStatus": "SUCCESS",
                "result": {
                    "outcome": "RECOGNIZED",
                    "payload": {
                        "assignments": assignments,
                        "recognizedAt": recognized_at,
                        "actor": actor,
                    }
                }
            });
            (StatusCode::OK, Json(body)).into_response()
        }
        StoredOutcome::BusinessFailure {
            proposal_status,
            reason,
            retryable,
        } => {
            let reason_str = match reason {
                BusinessFailureReason::ResourceNotAvailable => "RESOURCE_NOT_AVAILABLE",
                BusinessFailureReason::ResourceConcurrency => "RESOURCE_CONCURRENCY",
                BusinessFailureReason::DomainValidationFailed => "DOMAIN_VALIDATION_FAILED",
            };
            let body = json!({
                "requestId": request_id,
                "correlationId": correlation_id,
                "receivedAt": received_at,
                "respondedAt": envelope::now_iso(),
                "processingStatus": "SUCCESS",
                "result": {
                    "outcome": "PROPOSAL_NOT_RECOGNIZABLE",
                    "payload": {
                        "proposalStatus": proposal_status,
                        "reason": reason_str,
                        "retryable": retryable,
                    }
                }
            });
            (StatusCode::OK, Json(body)).into_response()
        }
    }
}