use std::collections::HashSet;
use serde::Serialize;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Proposal {
    pub proposal_id: String,
    pub proposal_version: u32,
    pub status: String,
    pub proposed_at: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Assignment {
    pub assignment_id: String,
    pub proposal_id: String,
    pub vehicle_id: String,
    pub status: String,
    pub recognized_at: String,
}

pub struct Scenario {
    pub scenario_id: String,
    pub scenario_version: u32,
    pub proposals: Vec<Proposal>,
    pub assignments: Vec<Assignment>,
}

pub fn get(scenario_id: &str) -> Option<Scenario> {
    if scenario_id != "s1" {
        return None;
    }
    Some(Scenario {
        scenario_id: "s1".into(),
        scenario_version: 1,
        proposals: vec![
            Proposal {
                proposal_id: "p1".into(),
                proposal_version: 1,
                status: "AUTHORIZED".into(),
                proposed_at: "2026-11-04T10:00:00Z".into(),
            },
            Proposal {
                proposal_id: "p2".into(),
                proposal_version: 1,
                status: "PROPOSED".into(),
                proposed_at: "2026-11-04T10:10:00Z".into(),
            },
            Proposal {
                proposal_id: "p3".into(),
                proposal_version: 2,
                status: "REVOKED".into(),
                proposed_at: "2026-11-03T09:00:00Z".into(),
            },
        ],
        assignments: vec![
            Assignment {
                assignment_id: "a1".into(),
                proposal_id: "p1".into(),
                vehicle_id: "v1".into(),
                status: "RECOGNIZED".into(),
                recognized_at: "2026-11-04T10:05:00Z".into(),
            },
            Assignment {
                assignment_id: "a2".into(),
                proposal_id: "p1".into(),
                vehicle_id: "v2".into(),
                status: "RECOGNIZED".into(),
                recognized_at: "2026-11-04T10:06:00Z".into(),
            },
            Assignment {
                assignment_id: "a3".into(),
                proposal_id: "p1".into(),
                vehicle_id: "v1".into(), // mismo vehículo que a1, para probar deduplicación
                status: "RECOGNIZED".into(),
                recognized_at: "2026-11-04T10:07:00Z".into(),
            },
            Assignment {
                assignment_id: "a4".into(),
                proposal_id: "p1".into(),
                vehicle_id: "v3".into(),
                status: "REVOKED".into(),
                recognized_at: "2026-11-03T08:00:00Z".into(),
            },
        ],
    })
}

pub fn active_proposals(s: &Scenario) -> Vec<Proposal> {
    s.proposals
        .iter()
        .filter(|p| p.status == "PROPOSED" || p.status == "AUTHORIZED")
        .cloned()
        .collect()
}

// A: filtro estricto
pub fn active_assignments(s: &Scenario) -> Vec<Assignment> {
    s.assignments
        .iter()
        .filter(|a| a.status == "RECOGNIZED")
        .cloned()
        .collect()
}

// B: deduplicar conservando orden
pub fn assigned_vehicles(s: &Scenario) -> Vec<String> {
    let mut seen = HashSet::new();
    active_assignments(s)
        .into_iter()
        .map(|a| a.vehicle_id)
        .filter(|v| seen.insert(v.clone()))
        .collect()
}