use super::fence::FenceEpoch;
use super::mint::mint;

#[test]
fn mint_positive() {
    let epoch = mint(42);
    assert_eq!(epoch.inner(), 42);
}
