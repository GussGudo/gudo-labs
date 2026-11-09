
const fs = require("node:fs");
const path = require("node:path");

const BASE_URL = "http://localhost:8080/uc-02";
const OUT_DIR = process.argv[2] || "baseline/pre-c2";

const cases = [
  {
    name: "01-planner-all",
    token: "test-token-planner",
    body: {
      contractVersion: "1.0",
      scenarioId: "s1",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: [
        "activeProposals",
        "activeAssignments",
        "assignedVehicles",
        "scenario_projection",
      ],
    },
  },
  {
    name: "02-operator-subset",
    token: "test-token-operator",
    body: {
      contractVersion: "1.0",
      scenarioId: "s1",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: ["activeProposals"],
    },
  },
  {
    name: "03-guest-forbidden",
    token: "test-token-guest",
    body: {
      contractVersion: "1.0",
      scenarioId: "s1",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: ["activeProposals"],
    },
  },
  {
    name: "04-no-auth",
    token: null,
    body: {
      contractVersion: "1.0",
      scenarioId: "s1",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: ["activeProposals"],
    },
  },
  {
    name: "05-missing-cv",
    token: "test-token-planner",
    body: {
      scenarioId: "s1",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: ["activeProposals"],
    },
  },
  {
    name: "06-unsupported-cv",
    token: "test-token-planner",
    body: {
      contractVersion: "99.0",
      scenarioId: "s1",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: ["activeProposals"],
    },
  },
  {
    name: "07-missing-sid",
    token: "test-token-planner",
    body: {
      contractVersion: "1.0",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: ["activeProposals"],
    },
  },
  {
    name: "08-unknown-include",
    token: "test-token-planner",
    body: {
      contractVersion: "1.0",
      scenarioId: "s1",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: ["unknownSection"],
    },
  },
  {
    name: "09-scenario-notfound",
    token: "test-token-planner",
    body: {
      contractVersion: "1.0",
      scenarioId: "scenario-does-not-exist",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: ["activeProposals"],
    },
  },
  {
    name: "10-version-mismatch",
    token: "test-token-planner",
    body: {
      contractVersion: "1.0",
      scenarioId: "s1",
      expectedScenarioVersion: 999,
      correlationId: "corr-test-0001",
      include: ["activeProposals"],
    },
  },
  {
    name: "11-empty-include",
    token: "test-token-planner",
    body: {
      contractVersion: "1.0",
      scenarioId: "s1",
      expectedScenarioVersion: 1,
      correlationId: "corr-test-0001",
      include: [],
    },
  },
];

async function capture(testCase) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (testCase.token) {
    headers.Authorization = `Bearer ${testCase.token}`;
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(testCase.body),
  });

  const responseText = await response.text();

  if (!responseText.trim()) {
    throw new Error(`HTTP ${response.status}: respuesta sin cuerpo`);
  }

  let parsed;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(`HTTP ${response.status}: respuesta JSON no parseable`);
  }

  return {
    status: response.status,
    body: responseText,
    parsed,
  };
}

async function main() {
  const outputDirectory = path.resolve(process.cwd(), OUT_DIR);

  fs.mkdirSync(outputDirectory, { recursive: true });

  // Limpiar exclusivamente los archivos de los 11 casos.
  for (const testCase of cases) {
    for (const extension of [".json", ".status"]) {
      const filePath = path.join(
        outputDirectory,
        `${testCase.name}${extension}`
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  let failures = 0;

  for (const testCase of cases) {
    process.stdout.write(`\nCapturando ${testCase.name}... `);

    try {
      const result = await capture(testCase);

      fs.writeFileSync(
        path.join(outputDirectory, `${testCase.name}.json`),
        JSON.stringify(result.parsed, null, 2) + "\n",
        "utf8"
      );

      fs.writeFileSync(
        path.join(outputDirectory, `${testCase.name}.status`),
        `${result.status}\n`,
        "utf8"
      );

      console.log(`HTTP ${result.status} - OK`);
    } catch (error) {
      failures++;
      console.error(`ERROR: ${error.message}`);
    }
  }

  const files = fs.readdirSync(outputDirectory);

  const jsonCount = cases.filter((testCase) =>
    files.includes(`${testCase.name}.json`)
  ).length;

  const statusCount = cases.filter((testCase) =>
    files.includes(`${testCase.name}.status`)
  ).length;

  console.log("\n=== RESULTADO DE CAPTURA ===");
  console.log(`JSON: ${jsonCount}/11`);
  console.log(`STATUS: ${statusCount}/11`);
  console.log(`Fallos: ${failures}`);

  if (failures > 0 || jsonCount !== 11 || statusCount !== 11) {
    console.error("\nFASE 0 NO COMPLETADA");
    process.exitCode = 1;
    return;
  }

  console.log("\nCAPTURA COMPLETADA.");
  console.log("Pendiente validar requestId y processingStatus.");
}

main().catch((error) => {
  console.error("\nERROR FATAL:", error);
  process.exitCode = 1;
});
