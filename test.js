// Integration tests for Databricks ML Certification study app
// Validates server responses, file presence, and question bank integrity.
// Run via: npm test (starts Docker, runs tests, stops Docker)

const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3002";
let passed = 0, failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

function get(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, res => {
      let body = "";
      res.on("data", d => (body += d));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    }).on("error", reject);
  });
}

function post(urlPath, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request(`${BASE_URL}${urlPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, res => {
      let respBody = "";
      res.on("data", d => (respBody += d));
      res.on("end", () => resolve({ status: res.statusCode, body: respBody }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log("\n=== Databricks ML Certification — Integration Tests ===\n");

  // -----------------------------------------------------------------------
  // 1. HTTP STATUS TESTS
  // -----------------------------------------------------------------------
  console.log("--- HTTP Status Checks ---");

  const root = await get("/");
  assert(root.status === 200, "GET / returns 200");
  assert(root.body.includes("<!DOCTYPE html"), "Root response is HTML");

  const app = await get("/app.js");
  assert(app.status === 200, "GET /app.js returns 200");

  const style = await get("/style.css");
  assert(style.status === 200, "GET /style.css returns 200");

  const questions = await get("/questions.js");
  assert(questions.status === 200, "GET /questions.js returns 200");

  const notFound = await get("/nonexistent.txt");
  assert(notFound.status === 404, "GET /nonexistent.txt returns 404");

  const traversal = await get("/../server.js");
  assert(traversal.status === 403, "Path traversal attempt returns 403");

  // -----------------------------------------------------------------------
  // 2. ASSOCIATE DOCS
  // -----------------------------------------------------------------------
  console.log("\n--- Associate Study Guide Docs ---");

  const assocDocs = [
    "/docs/associate/01_databricks_ml_platform.md",
    "/docs/associate/02_ml_workflows.md",
    "/docs/associate/03_spark_ml.md",
    "/docs/associate/04_scaling_ml.md",
    "/docs/associate/05_mlflow.md"
  ];
  for (const docPath of assocDocs) {
    const res = await get(docPath);
    assert(res.status === 200, `Associate doc exists: ${docPath}`);
    assert(res.body.length > 500, `Associate doc has content: ${docPath}`);
    assert(res.body.includes("# Section"), `Associate doc has H1 section header: ${docPath}`);
  }

  // -----------------------------------------------------------------------
  // 3. PROFESSIONAL DOCS
  // -----------------------------------------------------------------------
  console.log("\n--- Professional Study Guide Docs ---");

  const profDocs = [
    "/docs/professional/01_experimentation.md",
    "/docs/professional/02_model_lifecycle.md",
    "/docs/professional/03_model_deployment.md",
    "/docs/professional/04_solution_monitoring.md"
  ];
  for (const docPath of profDocs) {
    const res = await get(docPath);
    assert(res.status === 200, `Professional doc exists: ${docPath}`);
    assert(res.body.length > 500, `Professional doc has content: ${docPath}`);
    assert(res.body.includes("# Section"), `Professional doc has H1 section header: ${docPath}`);
  }

  // -----------------------------------------------------------------------
  // 4. CODE SNIPPETS
  // -----------------------------------------------------------------------
  console.log("\n--- Code Snippets ---");

  const snippets = [
    "/src/snippets/mlflow_tracking.py",
    "/src/snippets/spark_ml_pipeline.py",
    "/src/snippets/delta_feature_store.py"
  ];
  for (const snippetPath of snippets) {
    const res = await get(snippetPath);
    assert(res.status === 200, `Snippet exists: ${snippetPath}`);
    assert(res.body.length > 200, `Snippet has content: ${snippetPath}`);
    assert(res.body.includes("import"), `Snippet contains import: ${snippetPath}`);
  }

  // -----------------------------------------------------------------------
  // 5. QUESTION BANK INTEGRITY
  // -----------------------------------------------------------------------
  console.log("\n--- Question Bank Integrity ---");

  // Load questions file and evaluate in Node context
  const questionsPath = path.join(__dirname, "public/questions.js");
  assert(fs.existsSync(questionsPath), "questions.js file exists");

  let PRACTICE_QUESTIONS;
  try {
    // Strip window.PRACTICE_QUESTIONS = ... and evaluate the module.exports form
    const raw = fs.readFileSync(questionsPath, "utf8");
    // Remove the browser export line
    const nodeCompatible = raw.replace(/^window\.PRACTICE_QUESTIONS\s*=\s*PRACTICE_QUESTIONS;/m, "");
    const mod = {};
    eval(nodeCompatible + "\nmod.exports = module.exports;");
    PRACTICE_QUESTIONS = mod.exports.PRACTICE_QUESTIONS;
  } catch (e) {
    assert(false, `questions.js parses without error: ${e.message}`);
    PRACTICE_QUESTIONS = [];
  }

  assert(Array.isArray(PRACTICE_QUESTIONS), "PRACTICE_QUESTIONS is an array");
  assert(PRACTICE_QUESTIONS.length >= 60, `Total questions >= 60 (got ${PRACTICE_QUESTIONS.length})`);

  const associateQs = PRACTICE_QUESTIONS.filter(q => q.cert === "associate");
  const professionalQs = PRACTICE_QUESTIONS.filter(q => q.cert === "professional");
  assert(associateQs.length >= 30, `Associate questions >= 30 (got ${associateQs.length})`);
  assert(professionalQs.length >= 30, `Professional questions >= 30 (got ${professionalQs.length})`);

  // Validate schema for each question
  const requiredFields = ["id", "cert", "domain", "question", "options", "answer", "explanation"];
  let schemaErrors = 0;
  PRACTICE_QUESTIONS.forEach(q => {
    requiredFields.forEach(f => {
      if (q[f] === undefined || q[f] === null || q[f] === "") schemaErrors++;
    });
    if (!Array.isArray(q.options) || q.options.length < 4) schemaErrors++;
    if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= (q.options || []).length) schemaErrors++;
    if (!["associate", "professional"].includes(q.cert)) schemaErrors++;
  });
  assert(schemaErrors === 0, `All question schemas valid (0 errors, found ${schemaErrors})`);

  // Check for duplicate IDs
  const ids = PRACTICE_QUESTIONS.map(q => q.id);
  const uniqueIds = new Set(ids);
  assert(uniqueIds.size === ids.length, `No duplicate question IDs (${ids.length} unique)`);

  // -----------------------------------------------------------------------
  // 6. MARKDOWN HYPERLINK VALIDITY
  // -----------------------------------------------------------------------
  console.log("\n--- Markdown Link Checks ---");

  const allDocs = [...assocDocs, ...profDocs];
  let brokenLinks = 0;
  for (const docPath of allDocs) {
    const res = await get(docPath);
    const markdownLinks = [...res.body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    for (const [, linkText, linkHref] of markdownLinks) {
      if (linkHref.startsWith("http://") || linkHref.startsWith("https://")) continue;
      // Internal link — check it resolves within the public directory
      const resolvedPath = path.join(__dirname, "public", path.dirname(docPath), linkHref);
      if (!fs.existsSync(resolvedPath)) {
        console.warn(`    WARN: Potentially broken link in ${docPath}: [${linkText}](${linkHref})`);
        brokenLinks++;
      }
    }
  }
  assert(brokenLinks === 0, `No broken internal markdown links (${brokenLinks} found)`);

  // -----------------------------------------------------------------------
  // 7. PROGRESS API
  // -----------------------------------------------------------------------
  console.log("\n--- Progress API ---");

  const initialGet = await get("/api/progress");
  assert(initialGet.status === 200, "GET /api/progress returns 200");

  const initialData = JSON.parse(initialGet.body);
  assert(typeof initialData === "object", "GET /api/progress returns JSON object");
  assert("associate" in initialData, "Progress data has 'associate' key");
  assert("professional" in initialData, "Progress data has 'professional' key");

  // Round-trip test: write then read back
  const testPayload = {
    associate: { tracker: { "a_s1_1": true, "a_s1_2": false }, scheduler: null },
    professional: { tracker: { "p_s1_1": true }, scheduler: null }
  };
  const postRes = await post("/api/progress", testPayload);
  assert(postRes.status === 200, "POST /api/progress returns 200");

  const verifyGet = await get("/api/progress");
  const verifyData = JSON.parse(verifyGet.body);
  assert(verifyData.associate.tracker["a_s1_1"] === true, "Round-trip: associate tracker value preserved");
  assert(verifyData.professional.tracker["p_s1_1"] === true, "Round-trip: professional tracker value preserved");

  // -----------------------------------------------------------------------
  // 8. FILE STRUCTURE VALIDATION
  // -----------------------------------------------------------------------
  console.log("\n--- File Structure Checks ---");

  const requiredFiles = [
    "public/index.html",
    "public/app.js",
    "public/style.css",
    "public/questions.js",
    "server.js",
    "docker-compose.yml",
    "package.json",
    "data/.gitkeep"
  ];
  for (const filePath of requiredFiles) {
    assert(fs.existsSync(path.join(__dirname, filePath)), `Required file exists: ${filePath}`);
  }

  // -----------------------------------------------------------------------
  // RESULTS
  // -----------------------------------------------------------------------
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test runner error:", err);
  process.exit(1);
});
