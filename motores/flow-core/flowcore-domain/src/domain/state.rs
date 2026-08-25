/// Testimonio inmutable de un estado dentro del contexto C.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct State<C> {
    inner: C,
}

impl<C> State<C> {
    pub const fn new(context: C) -> Self {
        Self { inner: context }
    }

    pub fn context(&self) -> &C {
        &self.inner
    }
}
