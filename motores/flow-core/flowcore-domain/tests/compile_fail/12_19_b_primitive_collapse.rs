use flowcore_domain::FenceEpoch;

fn main() {
    let raw: u64 = 1;
    let _collapsed: FenceEpoch = raw.into();
}
