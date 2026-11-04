use axum::http::HeaderMap;

pub struct Actor {
    pub id: String,
    pub can_query: bool,
}

pub struct RequestContext {
    pub actor: Actor,
    pub received_at: String,
}

// Stub local de tokens. NO producción.
fn tokens() -> &'static [(&'static str, &'static str, bool)] {
    &[
        ("test-token-planner",  "planner-1",  true),
        ("test-token-operator", "operator-1", true),
        ("test-token-guest",    "guest-1",    false),
    ]
}

pub fn authenticate(headers: &HeaderMap) -> Result<Actor, ()> {
    let auth = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(())?;
    let token = auth.strip_prefix("Bearer ").ok_or(())?;
    for (t, id, can_query) in tokens() {
        if *t == token {
            return Ok(Actor { id: (*id).to_string(), can_query: *can_query });
        }
    }
    Err(())
}

pub fn build_context(actor: Actor, received_at: String) -> RequestContext {
    RequestContext { actor, received_at }
}