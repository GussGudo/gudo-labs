//! Envelope de intercambio — forma compartida entre casos de uso.
//!
//! Frontera: solo conoce la forma del envelope. No conoce auth, dominio, store, ni axum routing.
//! Es el único lugar donde se define EnvelopeOk / EnvelopeErr / ErrorBody.

use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvelopeOk {
    pub request_id: String,
    pub correlation_id: String,
    pub received_at: String,
    pub responded_at: String,
    pub processing_status: &'static str,
    pub result: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvelopeErr {
    pub request_id: String,
    pub correlation_id: String,
    pub received_at: String,
    pub responded_at: String,
    pub processing_status: &'static str,
    pub error: ErrorBody,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ErrorBody {
    pub code: String,
    pub message: String,
    // Preservado como Option sin skip_serializing_if: la implementación previa
    // emitía `null` cuando ausente (vía json! manual). Migrar a skip cambiaría
    // la serialización y rompería la regresión de UC-02.
    pub field: Option<String>,
    pub reason_code: Option<String>,
    pub retryable: bool,
}

/// RELOJ DE PRUEBA — NO ES UN RELOJ DE APLICACIÓN VÁLIDO.
///
/// UC-02 depende actualmente de este valor hardcoded para sus respuestas.
/// Se conserva durante C2 EXCLUSIVAMENTE para preservar el comportamiento
/// observable durante la migración del envelope a módulo compartido.
///
/// Restricciones hasta C7:
///   - Ningún caso de uso puede tomar decisiones de negocio basadas en este valor.
///   - UC-05 lo usa solo como `recognizedAt` (informativo), nunca para
///     comparaciones de orden, expiración ni cálculos de ventana temporal.
///   - Los tests de regresión de UC-02 lo referencian como constante conocida;
///     si el valor cambia, los golden snapshots fallan y obligan a revisión.
///
/// C7 reemplaza esto por `chrono::Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true)`
/// y actualiza los golden snapshots en el mismo commit.
pub fn now_iso() -> String {
    "2026-11-04T12:00:00Z".into()
}

pub fn gen_request_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    format!(
        "req-{}",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    )
}

fn correlation_id_valid(v: &str) -> bool {
    if v.len() < 8 || v.len() > 128 {
        return false;
    }
    v.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

pub fn resolve_correlation_id(input: Option<String>, request_id: &str) -> String {
    match input {
        Some(v) if correlation_id_valid(&v) => v,
        _ => format!("corr-{}", request_id),
    }
}

pub fn err_response(
    request_id: String,
    correlation_id: String,
    received_at: String,
    code: &str,
    field: Option<&str>,
    reason_code: Option<&str>,
) -> Response {
    let body = EnvelopeErr {
        request_id,
        correlation_id,
        received_at,
        responded_at: now_iso(),
        processing_status: "ERROR",
        error: ErrorBody {
            code: code.into(),
            message: code.into(),
            field: field.map(String::from),
            reason_code: reason_code.map(String::from),
            retryable: false,
        },
    };
    (StatusCode::OK, Json(body)).into_response()
}