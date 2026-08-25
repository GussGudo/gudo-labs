use crate::domain::state::State;

/// Proposición de relación constitutiva inmutable.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Transition<C, L, A, E> {
    pre: State<C>,
    law: L,
    authority: A,
    evidence: E,
    post: State<C>,
}
