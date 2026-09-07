#[derive(Debug, PartialEq, Eq, Hash)]
pub struct FenceEpoch {
    inner: u64,
}

impl FenceEpoch {
    pub(super) fn new(inner: u64) -> Self {
        Self { inner }
    }

    pub(super) fn inner(&self) -> u64 {
        self.inner
    }
}
