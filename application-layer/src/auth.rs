use axum::http::HeaderMap;

/// Permisos por capacidad. `Actor.permissions` es la lista de permisos efectivos
/// otorgados por el proveedor de identidad. La autorización de cada UC se hace
/// chequeando el permiso específico en el handler, no en este módulo.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Permission {
    Query,
    RecognizeProposal,
}

#[derive(Clone)]
pub struct Actor {
    pub id: String,
    pub permissions: Vec<Permission>,
}

/// Contexto construido por el servidor tras autenticación + autorización.
/// `contract_version` e `idempotency_key` son extensiones ratificadas por
/// UC-01..04 §1 (`RequestContext` es extensible cuando un UC lo requiera).
pub struct RequestContext {
    pub actor: Actor,
    pub received_at: String,
    pub contract_version: String,
    pub idempotency_key: Option<String>,
}

// Stub local de tokens. NO producción.
//
// La matriz de permisos por rol no está ratificada en los contratos
// consolidados; §8.5 difiere su definición a UC-07..UC-09.
// UC-05 §2 establece que la Application Layer traduce el rol al permiso
// requerido por el Kernel. Esta traducción sigue siendo provisional.
// NO usar esta matriz como base de decisiones de seguridad reales.
fn tokens() -> &'static [(&'static str, &'static str, &'static [Permission])] {
    &[
        (
            "test-token-planner",
            "planner-1",
            &[Permission::Query, Permission::RecognizeProposal],
        ),
        (
            "test-token-operator",
            "operator-1",
            &[Permission::Query, Permission::RecognizeProposal],
        ),
        ("test-token-guest", "guest-1", &[]),
    ]
}

pub fn authenticate(headers: &HeaderMap) -> Result<Actor, ()> {
    let auth = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(())?;
    let token = auth.strip_prefix("Bearer ").ok_or(())?;
    for (t, id, perms) in tokens() {
        if *t == token {
            return Ok(Actor {
                id: (*id).to_string(),
                permissions: perms.to_vec(),
            });
        }
    }
    Err(())
}

pub fn build_context(
    actor: Actor,
    received_at: String,
    contract_version: String,
    idempotency_key: Option<String>,
) -> RequestContext {
    RequestContext {
        actor,
        received_at,
        contract_version,
        idempotency_key,
    }
}