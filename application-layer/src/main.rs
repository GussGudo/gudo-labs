mod auth;
mod envelope;
#[allow(dead_code)]
mod store;
mod stub_domain;
mod uc_02;
#[allow(dead_code)]
mod uc_05;

use axum::{routing::post, Router};
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    // C5 — pendiente: registrar /uc-05 y conectar State<Arc<InMemoryStore>>.
    // `store` y `uc_05` compilan pero no se enrutan para no exponer un endpoint
    // con reevaluación (C3) y persistencia (C4) incompletas.
    let app = Router::new()
        .route("/uc-02", post(uc_02::handle))
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .unwrap();
    println!("application-layer listening on :8080");
    axum::serve(listener, app).await.unwrap();
}