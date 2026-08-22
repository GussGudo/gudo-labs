#[derive(Debug, PartialEq, Eq)]
pub struct FenceEpoch {
    value: u64,
}

impl FenceEpoch {
    fn mint(value: u64) -> Self {
        Self { value }
    }
}

mod governance {
    use super::FenceEpoch;

    pub(super) fn mint_fence_epoch(value: u64) -> FenceEpoch {
        FenceEpoch::mint(value)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn governance_can_mint_fence_epoch() {
        let epoch = governance::mint_fence_epoch(1);

        assert_eq!(epoch, FenceEpoch { value: 1 });
    }
}
