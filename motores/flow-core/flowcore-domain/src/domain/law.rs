use super::normative::NormativeContent;

pub trait DomainLaw {
    fn normative_content(&self) -> NormativeContent;
}
