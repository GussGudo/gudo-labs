//! Store operacional in-memory para gobernanza logística.
//!
//! Frontera: propiedad del estado + exclusión mutua intra-proceso.
//! No conoce auth, envelope, ni axum. Solo depende de los tipos de dominio
//! (en C2 viven en `stub_domain`; en C3 migrarán a `crate::domain`).

use std::collections::HashMap;
use std::sync::Mutex;

use crate::stub_domain::{Assignment, Proposal};

/// Argumentos semánticos que definen la "misma intención" para idempotencia.
/// NO incluye correlationId, clientVersion, declaredActor, timestamps.
#[derive(Clone, PartialEq, Eq, Hash)]
pub struct RequestFingerprint {
    pub proposal_id: String,
    pub proposal_version: u32,
    pub expected_evaluation_id: Option<String>,
}

/// Identidad idempotente ratificada por UC-04 §5 / UC-05 §4.
#[derive(Clone, PartialEq, Eq, Hash)]
pub struct IdempotencyKey {
    pub actor: String,
    pub contract_version: String,
    pub idempotency_key: String,
}

#[derive(Clone, Debug)]
pub enum BusinessFailureReason {
    ResourceNotAvailable,
    ResourceConcurrency,
    DomainValidationFailed,
}

/// Resultado de un intento de reconocimiento.
///
/// En C2, se persiste y reproduce únicamente el resultado de reevaluación
/// (éxito o fallo de negocio derivado de la reevaluación). Los rechazos
/// previos a la reevaluación (NotFound, VersionMismatch, NotAuthorized) NO
/// se persisten y se recomputan en cada intento. Ver `uc_05::handle` para
/// el análisis completo de la cobertura.
#[derive(Clone)]
pub enum StoredOutcome {
    Recognized {
        assignments: Vec<Assignment>,
        recognized_at: String,
        actor: String,
    },
    BusinessFailure {
        proposal_status: String,
        reason: BusinessFailureReason,
        retryable: bool,
    },
}

#[derive(Clone)]
pub struct IdempotencyRecord {
    pub fingerprint: RequestFingerprint,
    pub outcome: StoredOutcome,
}

pub struct StoreState {
    pub proposals: HashMap<String, Proposal>,
    pub assignments: HashMap<String, Assignment>,
    pub idempotent_outcomes: HashMap<IdempotencyKey, IdempotencyRecord>,
}

impl StoreState {
    pub fn empty() -> Self {
        Self {
            proposals: HashMap::new(),
            assignments: HashMap::new(),
            idempotent_outcomes: HashMap::new(),
        }
    }
}

pub struct InMemoryStore {
    state: Mutex<StoreState>,
}

impl InMemoryStore {
    pub fn new(state: StoreState) -> Self {
        Self {
            state: Mutex::new(state),
        }
    }

    /// Sección crítica de los 5 pasos completos del caso de uso.
    ///
    /// GARANTÍAS QUE PROPORCIONA (slice 1, in-memory):
    ///   - Exclusión mutua intra-proceso entre llamadas concurrentes al handler.
    ///   - Atomicidad lógica bajo caminos normales: patrón read → validate →
    ///     build → apply asegura que las mutaciones ocurren solo después de que
    ///     todas las validaciones han pasado, mediante inserciones que no fallan
    ///     lógicamente (`HashMap::insert`).
    ///   - El compilador impone que el closure no contenga `.await` (firma `fn`,
    ///     no `async fn`), forzando la sección crítica a ser síncrona y acotada.
    ///
    /// GARANTÍAS QUE NO PROPORCIONA (no confundir):
    ///   - NO es una transacción durable. Un panic dentro del closure puede dejar
    ///     el estado en un punto intermedio (el patrón reduce el riesgo al mínimo
    ///     en código sin panics esperados).
    ///   - NO hay recuperación ante fallos del proceso (kill -9, OOM, etc.).
    ///   - NO hay garantía cross-proceso. Cuando el adaptador sea SQL, implementará
    ///     sus propias transacciones; este `Mutex` NO se traslada al adaptador.
    ///   - NO hay aislamiento serializable entre operaciones fuera de este mutex.
    pub fn with_critical_section<R>(&self, f: impl FnOnce(&mut StoreState) -> R) -> R {
        let mut guard = self.state.lock().expect("store mutex poisoned");
        f(&mut guard)
    }
}