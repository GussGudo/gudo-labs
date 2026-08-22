#[test]
fn constitutional_attacks_12_19() {
    let t = trybuild::TestCases::new();

    t.compile_fail("tests/compile_fail/12_19_a_forge.rs");
    t.compile_fail("tests/compile_fail/12_19_b_primitive_collapse.rs");
    t.compile_fail("tests/compile_fail/12_19_c_direct_mint.rs");
}
