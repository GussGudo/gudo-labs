use axum::{
    extract::Json,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
};
use serde::Deserialize;
use serde_json::json;

use crate::auth::{self, Permission, RequestContext};
use crate::envelope::{self, err_response, gen_request_id, resolve_correlation_id, EnvelopeOk};
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

pub async fn handle(headers: HeaderMap, Json(req): Json<Request>) -> Response {
    let request_id = gen_request_id();
    let received_at = envelope::now_iso();
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
    if !actor.permissions.contains(&Permission::Query) {
        return err_response(
            request_id, correlation_id, received_at,
            "FORBIDDEN", None, None,
        );
    }

    // C: RequestContext construido tras auth + authz.
    // UC-02 no tiene idempotencia (§3 consolidado); idempotency_key = None.
    let contract_version = req.contract_version.clone().unwrap_or_default();
    let _ctx: RequestContext = auth::build_context(
        actor, received_at.clone(), contract_version, None,
    );

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
        responded_at: envelope::now_iso(),
        processing_status: "SUCCESS",
        result: json!({ "outcome": "OK", "payload": payload }),
    };

    (StatusCode::OK, Json(body)).into_response()
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::to_bytes;
    use axum::http::HeaderValue;
    use serde_json::Value;

    /// Con `now_iso()` hardcoded, el único campo dinámico es `requestId`.
    fn normalize(mut v: Value) -> Value {
        let rid = v["requestId"]
            .as_str()
            .expect("requestId debe ser string");
        assert!(
            rid.starts_with("req-") && rid.len() > 4 && rid[4..].chars().all(|c| c.is_ascii_digit()),
            "requestId formato inválido: '{}'",
            rid
        );
        v["requestId"] = json!("<normalized>");
        v
    }

    async fn call(auth: Option<&str>, body: Value) -> Value {
        let mut headers = HeaderMap::new();
        if let Some(t) = auth {
            headers.insert(
                "authorization",
                HeaderValue::try_from(format!("Bearer {}", t)).unwrap(),
            );
        }
        let req: Request = serde_json::from_value(body).unwrap();
        let resp = handle(headers, Json(req)).await;
        let (_, resp_body) = resp.into_parts();
        let bytes = to_bytes(resp_body, usize::MAX).await.unwrap();
        normalize(serde_json::from_slice(&bytes[..]).unwrap())
    }

    fn assert_error_no_field_no_reason(v: &Value) {
        assert_eq!(v["error"]["field"], Value::Null,
            "error.field debe ser null. Actual: {:#}", v);
        assert_eq!(v["error"]["reasonCode"], Value::Null,
            "error.reasonCode debe ser null. Actual: {:#}", v);
    }

    fn base_body() -> Value {
        json!({
            "contractVersion": "1.0",
            "scenarioId": "s1",
            "correlationId": "corr-test-0001"
        })
    }

    fn golden_error(code: &str, field: Option<&str>, reason_code: Option<&str>) -> Value {
        json!({
            "requestId": "<normalized>",
            "correlationId": "corr-test-0001",
            "receivedAt": "2026-11-04T12:00:00Z",
            "respondedAt": "2026-11-04T12:00:00Z",
            "processingStatus": "ERROR",
            "error": {
                "code": code,
                "message": code,
                "field": field,
                "reasonCode": reason_code,
                "retryable": false
            }
        })
    }

    #[tokio::test]
    async fn case_01_planner_all_golden() {
        let mut body = base_body();
        body["include"] = json!([
            "activeProposals", "activeAssignments", "assignedVehicles", "scenario_projection"
        ]);
        let actual = call(Some("test-token-planner"), body).await;
        let expected = json!({
            "requestId": "<normalized>",
            "correlationId": "corr-test-0001",
            "receivedAt": "2026-11-04T12:00:00Z",
            "respondedAt": "2026-11-04T12:00:00Z",
            "processingStatus": "SUCCESS",
            "result": {
                "outcome": "OK",
                "payload": {
                    "scenarioId": "s1",
                    "scenarioVersion": 1,
                    "includedSections": [
                        "activeProposals", "activeAssignments",
                        "assignedVehicles", "scenario_projection"
                    ],
                    "activeProposals": [
                        {"proposalId": "p1", "proposalVersion": 1, "status": "AUTHORIZED", "proposedAt": "2026-11-04T10:00:00Z"},
                        {"proposalId": "p2", "proposalVersion": 1, "status": "PROPOSED", "proposedAt": "2026-11-04T10:10:00Z"}
                    ],
                    "activeAssignments": [
                        {"assignmentId": "a1", "proposalId": "p1", "vehicleId": "v1", "status": "RECOGNIZED", "recognizedAt": "2026-11-04T10:05:00Z"},
                        {"assignmentId": "a2", "proposalId": "p1", "vehicleId": "v2", "status": "RECOGNIZED", "recognizedAt": "2026-11-04T10:06:00Z"},
                        {"assignmentId": "a3", "proposalId": "p1", "vehicleId": "v1", "status": "RECOGNIZED", "recognizedAt": "2026-11-04T10:07:00Z"}
                    ],
                    "assignedVehicles": ["v1", "v2"],
                    "scenario_projection": {"totalDistanceKm": 42.0}
                }
            }
        });
        assert_eq!(actual, expected, "case_01:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_02_operator_subset_golden() {
        let mut body = base_body();
        body["include"] = json!(["activeProposals"]);
        let actual = call(Some("test-token-operator"), body).await;
        let expected = json!({
            "requestId": "<normalized>",
            "correlationId": "corr-test-0001",
            "receivedAt": "2026-11-04T12:00:00Z",
            "respondedAt": "2026-11-04T12:00:00Z",
            "processingStatus": "SUCCESS",
            "result": {
                "outcome": "OK",
                "payload": {
                    "scenarioId": "s1",
                    "scenarioVersion": 1,
                    "includedSections": ["activeProposals"],
                    "activeProposals": [
                        {"proposalId": "p1", "proposalVersion": 1, "status": "AUTHORIZED", "proposedAt": "2026-11-04T10:00:00Z"},
                        {"proposalId": "p2", "proposalVersion": 1, "status": "PROPOSED", "proposedAt": "2026-11-04T10:10:00Z"}
                    ]
                }
            }
        });
        assert_eq!(actual, expected, "case_02:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_03_guest_forbidden() {
        let actual = call(Some("test-token-guest"), base_body()).await;
        let expected = golden_error("FORBIDDEN", None, None);
        assert_error_no_field_no_reason(&actual);
        assert_eq!(actual, expected, "case_03:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_04_unauthenticated() {
        let actual = call(None, base_body()).await;
        let expected = golden_error("UNAUTHENTICATED", None, None);
        assert_error_no_field_no_reason(&actual);
        assert_eq!(actual, expected, "case_04:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_05_missing_contract_version() {
        let mut body = base_body();
        body.as_object_mut().unwrap().remove("contractVersion");
        let actual = call(Some("test-token-planner"), body).await;
        let expected = golden_error("INVALID_INPUT", Some("contractVersion"), Some("MISSING"));
        assert_eq!(actual, expected, "case_05:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_06_unsupported_contract_version() {
        let mut body = base_body();
        body["contractVersion"] = json!("2.0");
        let actual = call(Some("test-token-planner"), body).await;
        let expected = golden_error("UNSUPPORTED_CONTRACT_VERSION", None, None);
        assert_error_no_field_no_reason(&actual);
        assert_eq!(actual, expected, "case_06:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_07_missing_scenario_id() {
        let mut body = base_body();
        body.as_object_mut().unwrap().remove("scenarioId");
        let actual = call(Some("test-token-planner"), body).await;
        let expected = golden_error("INVALID_INPUT", Some("scenarioId"), Some("MISSING"));
        assert_eq!(actual, expected, "case_07:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_08_unknown_include_section() {
        let mut body = base_body();
        body["include"] = json!(["unknown"]);
        let actual = call(Some("test-token-planner"), body).await;
        let expected = golden_error("INVALID_INPUT", Some("include"), Some("UNKNOWN_SECTION"));
        assert_eq!(actual, expected, "case_08:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_09_scenario_not_found() {
        let mut body = base_body();
        body["scenarioId"] = json!("unknown");
        let actual = call(Some("test-token-planner"), body).await;
        let expected = golden_error("SCENARIO_NOT_FOUND", None, None);
        assert_error_no_field_no_reason(&actual);
        assert_eq!(actual, expected, "case_09:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_10_version_mismatch() {
        let mut body = base_body();
        body["expectedScenarioVersion"] = json!(999);
        let actual = call(Some("test-token-planner"), body).await;
        let expected = golden_error("SCENARIO_VERSION_MISMATCH", None, None);
        assert_error_no_field_no_reason(&actual);
        assert_eq!(actual, expected, "case_10:\nActual: {:#}", actual);
    }

    #[tokio::test]
    async fn case_11_empty_include_golden() {
        let body = base_body();
        let actual = call(Some("test-token-planner"), body).await;
        let expected = json!({
            "requestId": "<normalized>",
            "correlationId": "corr-test-0001",
            "receivedAt": "2026-11-04T12:00:00Z",
            "respondedAt": "2026-11-04T12:00:00Z",
            "processingStatus": "SUCCESS",
            "result": {
                "outcome": "OK",
                "payload": {
                    "scenarioId": "s1",
                    "scenarioVersion": 1,
                    "includedSections": []
                }
            }
        });
        assert_eq!(actual, expected, "case_11:\nActual: {:#}", actual);
    }
}