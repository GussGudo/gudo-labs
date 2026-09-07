use super::fence::FenceEpoch;

pub(super) fn mint(sequence: u64) -> FenceEpoch {
    FenceEpoch::new(sequence)
}
