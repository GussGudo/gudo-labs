use axum::{
    extract::Json,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::auth::{self, RequestContext};
use crate::stub_domain;

const CONTRACT_VERSION_SUPPORTED: &str = "1.0";
const VALID_SECTIONS: &[&str] = &[
    "activeProposals",
    "activeAssignments",
    "assignedVehicles",
    "scenario_projection",
];

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub contract_version: Option<String>,
    pub scenario_id: Option<String>,
    pub expected_scenario_version: Option<u32>,
    pub include: Option<Vec<String>>,
    pub correlation_id: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct EnvelopeOk {
    request_id: String,
    correlation_id: String,
    received_at: String,
    responded_at: String,
    processing_status: String,
    result: Value,
}

fn now_iso() -> String {
    "2026-11-04T12:00:00Z".into()
}

fn gen_request_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    format!(
        "req-{}",
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()
    )
}

// D: validación básica de correlationId.
// - 8 a 128 caracteres
// - alfanumérico + '-' + '_'
fn correlation_id_valid(v: &str) -> bool {
    if v.len() < 8 || v.len() > 128 {
        return false;
    }
    v.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

fn resolve_correlation_id(input: Option<String>, request_id: &str) -> String {
    match input {
        Some(v) if correlation_id_valid(&v) => v,
        _ => format!("corr-{}", request_id),
    }
}

fn err_response(
    request_id: String,
    correlation_id: String,
    received_at: String,
    code: &str,
    field: Option<&str>,
    reason_code: Option<&str>,
) -> Response {
    let body = json!({
        "requestId": request_id,
        "correlationId": correlation_id,
        "receivedAt": received_at,
        "respondedAt": now_iso(),
        "processingStatus": "ERROR",
        "error": {
            "code": code,
            "message": code,
            "field": field,
            "reasonCode": reason_code,
            "retryable": false
        }
    });
    (StatusCode::OK, Json(body)).into_response()
}

pub async fn handle(headers: HeaderMap, Json(req): Json<Request>) -> Response {
    let request_id = gen_request_id();
    let received_at = now_iso();
    let correlation_id = resolve_correlation_id(req.correlation_id.clone(), &request_id);

    // 1. contractVersion
    match req.contract_version.as_deref() {
        Some(v) if v == CONTRACT_VERSION_SUPPORTED => {}
        Some(_) => {
            return err_response(
                request_id, correlation_id, received_at,
                "UNSUPPORTED_CONTRACT_VERSION", None, None,
            )
        }
        None => {
            return err_response(
                request_id, correlation_id, received_at,
                "INVALID_INPUT", Some("contractVersion"), Some("MISSING"),
            )
        }
    }

    // 2. Autenticación
    let actor = match auth::authenticate(&headers) {
        Ok(a) => a,
        Err(_) => {
            return err_response(
                request_id, correlation_id, received_at,
                "UNAUTHENTICATED", None, None,
            )
        }
    };

    // 3. Autorización
    if !actor.can_query {
        return err_response(
            request_id, correlation_id, received_at,
            "FORBIDDEN", None, None,
        );
    }

    // C: RequestContext construido tras auth + authz
    let _ctx: RequestContext = auth::build_context(actor, received_at.clone());

    // 4. Validación estructural del payload
    let scenario_id = match req.scenario_id {
        Some(s) if !s.is_empty() => s,
        _ => {
            return err_response(
                request_id, correlation_id, received_at,
                "INVALID_INPUT", Some("scenarioId"), Some("MISSING"),
            )
        }
    };

    // 5. Validación de include
    let include = req.include.unwrap_or_default();
    for s in &include {
        if !VALID_SECTIONS.contains(&s.as_str()) {
            return err_response(
                request_id, correlation_id, received_at,
                "INVALID_INPUT", Some("include"), Some("UNKNOWN_SECTION"),
            );
        }
    }

    // 6. Dominio
    let scenario = match stub_domain::get(&scenario_id) {
        Some(s) => s,
        None => {
            return err_response(
                request_id, correlation_id, received_at,
                "SCENARIO_NOT_FOUND", None, None,
            )
        }
    };

    if let Some(exp) = req.expected_scenario_version {
        if exp != scenario.scenario_version {
            return err_response(
                request_id, correlation_id, received_at,
                "SCENARIO_VERSION_MISMATCH", None, None,
            );
        }
    }

    // 7. Respuesta
    let mut payload = json!({
        "scenarioId": scenario.scenario_id,
        "scenarioVersion": scenario.scenario_version,
        "includedSections": include,
    });

    for section in &include {
        match section.as_str() {
            "activeProposals" => {
                payload["activeProposals"] =
                    serde_json::to_value(stub_domain::active_proposals(&scenario)).unwrap();
            }
            "activeAssignments" => {
                payload["activeAssignments"] =
                    serde_json::to_value(stub_domain::active_assignments(&scenario)).unwrap();
            }
            "assignedVehicles" => {
                payload["assignedVehicles"] =
                    json!(stub_domain::assigned_vehicles(&scenario));
            }
            "scenario_projection" => {
                // Proyección sintética, no medición operacional.
                payload["scenario_projection"] = json!({ "totalDistanceKm": 42.0 });
            }
            _ => unreachable!(),
        }
    }

    let body = EnvelopeOk {
        request_id,
        correlation_id,
        received_at,
        responded_at: now_iso(),
        processing_status: "SUCCESS".into(),
        result: json!({ "outcome": "OK", "payload": payload }),
    };

    (StatusCode::OK, Json(body)).into_response()
}