export async function queryScenario({ scenarioId, expectedScenarioVersion, include, token }) {
  const payload = {
    contractVersion: "1.0",
    scenarioId,
  };
  if (expectedScenarioVersion != null) payload.expectedScenarioVersion = expectedScenarioVersion;
  if (Array.isArray(include) && include.length) payload.include = include;

  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("http://localhost:8080/uc-02", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { status: "error", error: { code: "TRANSPORT_ERROR", message: `HTTP ${res.status}` } };
    }
    const body = await res.json();
    if (body.processingStatus === "SUCCESS") {
      return { status: "success", data: body.result.payload, correlationId: body.correlationId };
    }
    return { status: "error", error: body.error, correlationId: body.correlationId };
  } catch (e) {
    return { status: "error", error: { code: "NETWORK_ERROR", message: String(e) } };
  }
}