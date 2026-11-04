mod auth;
mod stub_domain;
mod uc_02;

use axum::{routing::post, Router};
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/uc-02", post(uc_02::handle))
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("application-layer listening on :8080");
    axum::serve(listener, app).await.unwrap();
}