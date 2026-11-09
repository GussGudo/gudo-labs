// Uso: node .\scripts\compare-uc02.js baseline/pre-c2 baseline/post-c2
// Exit 0 si 11/11 PASS, exit 1 si falla cualquier caso o falta cualquier archivo.
//
// Validaciones previas al deep equal (en AMBOS lados, ref y test):
//   - requestId:    presente, string, formato ^req-[0-9]+$
//   - processingStatus: presente, uno de {SUCCESS, ERROR}
// Solo requestId se normaliza (tras validar formato).
// processingStatus se compara por valor entre ref y test.

const fs = require("node:fs");
const path = require("node:path");

const REF_DIR = process.argv[2];
const TEST_DIR = process.argv[3];

if (!REF_DIR || !TEST_DIR) {
  console.error("Uso: node compare-uc02.js <ref-dir> <test-dir>");
  process.exit(2);
}

const cases = [
  "01-planner-all", "02-operator-subset", "03-guest-forbidden",
  "04-no-auth", "05-missing-cv", "06-unsupported-cv", "07-missing-sid",
  "08-unknown-include", "09-scenario-notfound", "10-version-mismatch",
  "11-empty-include",
];

// Validación estricta de campos contractuales obligatorios.
// Lanza Error con mensaje específico si algo falta o está malformado.
function validateResponse(obj, side) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error(`${side}: respuesta no es objeto JSON`);
  }

  // requestId — presente, string, formato
  if (!("requestId" in obj)) {
    throw new Error(`${side}: requestId ausente`);
  }
  if (typeof obj.requestId !== "string") {
    throw new Error(`${side}: requestId no es string (tipo: ${typeof obj.requestId})`);
  }
  if (!/^req-[0-9]+$/.test(obj.requestId)) {
    throw new Error(`${side}: requestId formato inválido '${obj.requestId}' (esperado req-<dígitos>)`);
  }

  // processingStatus — presente, valor contractual
  if (!("processingStatus" in obj)) {
    throw new Error(`${side}: processingStatus ausente`);
  }
  if (obj.processingStatus !== "SUCCESS" && obj.processingStatus !== "ERROR") {
    throw new Error(`${side}: processingStatus inválido '${obj.processingStatus}' (esperado SUCCESS|ERROR)`);
  }
}

// Normaliza SOLO el requestId de la RAÍZ del envelope.
// El contrato v1.0 §1 define requestId únicamente en la raíz.
// Normalizar recursivamente podría ocultar diferencias en propiedades
// anidadas llamadas "requestId" (p. ej. en payload de secciones futuras).
// validateResponse ya garantizó que obj.requestId existe, es string y tiene
// formato correcto.
function normalizeRequestId(obj) {
  return {
    ...obj,
    requestId: "<normalized>",
  };
}

// Deep equality estructural: objetos por clave (orden irrelevante),
// arreglos por posición (orden relevante). Distingue null de ausente,
// string de number, bool de number.
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  for (let i = 0; i < ak.length; i++) {
    if (ak[i] !== bk[i]) return false;
    if (!deepEqual(a[ak[i]], b[bk[i]])) return false;
  }
  return true;
}

let fail = 0;
const total = cases.length;

for (const c of cases) {
  const refJsonP    = path.join(REF_DIR,  `${c}.json`);
  const refStatusP  = path.join(REF_DIR,  `${c}.status`);
  const testJsonP   = path.join(TEST_DIR, `${c}.json`);
  const testStatusP = path.join(TEST_DIR, `${c}.status`);

  const missing = [];
  if (!fs.existsSync(refJsonP))    missing.push("ref.json");
  if (!fs.existsSync(refStatusP))  missing.push("ref.status");
  if (!fs.existsSync(testJsonP))   missing.push("test.json");
  if (!fs.existsSync(testStatusP)) missing.push("test.status");
  if (missing.length > 0) {
    console.log(`FAIL ${c} — faltan archivos: ${missing.join(", ")}`);
    fail++;
    continue;
  }

  // 1) Códigos HTTP
  const refStatus  = fs.readFileSync(refStatusP,  "utf8").trim();
  const testStatus = fs.readFileSync(testStatusP, "utf8").trim();
  if (refStatus !== testStatus) {
    console.log(`FAIL ${c} — HTTP status: ref=${refStatus} test=${testStatus}`);
    fail++;
    continue;
  }

  // 2) Parse + validación contractual (ambos lados)
  let refObj, testObj;
  try {
    refObj  = JSON.parse(fs.readFileSync(refJsonP,  "utf8"));
    testObj = JSON.parse(fs.readFileSync(testJsonP, "utf8"));
    validateResponse(refObj,  "ref");
    validateResponse(testObj, "test");
  } catch (e) {
    console.log(`FAIL ${c} — ${e.message}`);
    fail++;
    continue;
  }

  // 3) Normalización de requestId (solo tras validación)
  const refNorm  = normalizeRequestId(refObj);
  const testNorm = normalizeRequestId(testObj);

  // 4) Deep equal estructural
  if (!deepEqual(refNorm, testNorm)) {
    console.log(`FAIL ${c} — JSON difiere`);
    console.log("  ref:  " + JSON.stringify(refNorm));
    console.log("  test: " + JSON.stringify(testNorm));
    fail++;
    continue;
  }

  console.log(`PASS ${c} (HTTP ${refStatus}, ${refObj.processingStatus})`);
}

console.log("");
if (fail > 0) {
  console.log(`${total - fail}/${total} PASS — ${fail} FALLARON. NO commitear C2.`);
  process.exit(1);
} else {
  console.log(`${total}/${total} PASS. Línea base respetada.`);
  process.exit(0);
}