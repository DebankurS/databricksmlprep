# AGENTS.md — Databricks ML Certification Study Companion

## Project Overview

Single-page application for studying both the **Databricks Certified Machine Learning Associate** and **Databricks Certified Machine Learning Professional** exams. Zero external dependencies — pure Node.js stdlib server, vanilla JS frontend.

**Port:** 3002  
**Start:** `docker compose up` (or `npm test` to run tests)  
**URL:** http://localhost:3002

---

## Architecture

```
databricks-ml-certification/
├── server.js              Node stdlib HTTP server (port 3002)
├── docker-compose.yml     node:22-alpine container
├── package.json           npm test = docker compose + test.js
├── test.js                Integration tests (validates questions, docs, API)
├── data/
│   └── .gitkeep           Progress storage directory (progress.json written here)
└── public/
    ├── index.html         SPA shell with cert switcher in sidebar
    ├── app.js             All SPA logic — cert switching, quiz, tracker, scheduler
    ├── style.css          Databricks Red (#FF3621) CSS design system
    ├── questions.js       65 questions (35 associate + 30 professional)
    ├── docs/
    │   ├── associate/     5 markdown study guide files
    │   └── professional/  4 markdown study guide files
    └── src/snippets/      3 Python code snippet files
```

---

## Key Design Decisions

### Two Certs, One App

All cert-specific data lives in `CERT_DATA` object in `app.js`. `activeCert` state variable (`"associate"` or `"professional"`) drives every view. `switchCert()` function re-renders checklist, notes menu, quiz dropdown, and cheatsheet panels.

### Progress Isolation

`progress.json` structure:
```json
{
  "associate":    { "tracker": {}, "scheduler": null },
  "professional": { "tracker": {}, "scheduler": null }
}
```
Each cert's tracker and scheduler state are fully independent. Default written by server on first request.

### Questions

Each question has a `cert` field (`"associate"` or `"professional"`). Quiz engine filters by `cert === activeCert` before section filtering. Associate IDs 1–35, Professional IDs 101–132.

### Notes / Docs

`loadNotesDoc(filename)` fetches from `./docs/${activeCert}/${filename}`. On 404, falls back to `NOTES_OFFLINE_FALLBACK["${cert}/${filename}"]` defined in `app.js`. Markdown is rendered client-side by `parseSimpleMarkdown()`.

### Snippets

Three files shared by both cert levels (all use same Databricks APIs). `SNIPPET_OFFLINE_FALLBACK` keys match filenames.

---

## Exam Section Coverage

### Associate (5 sections, 35 questions)
| Code | Title | Weight |
|---|---|---|
| S1 | Databricks ML Platform (AutoML, Feature Store, ML Runtime) | 29% |
| S2 | ML Workflows (feature engineering, evaluation, leakage) | 29% |
| S3 | Spark ML (pipelines, transformers, CV) | 22% |
| S4 | Scaling ML (Horovod, Hyperopt, Pandas UDF) | 11% |
| S5 | MLflow Lifecycle (tracking, registry, deployment) | 9% |

### Professional (4 sections, 32 questions)
| Code | Title | Weight |
|---|---|---|
| S1 | Experimentation (temporal leakage, nested runs, SHAP, custom pyfunc) | 30% |
| S2 | Model Lifecycle (Unity Catalog, aliases, webhooks, CI/CD) | 30% |
| S3 | Model Deployment (batch, streaming, real-time, Feature Store serving) | 25% |
| S4 | Solution Monitoring (drift types, PSI, Lakehouse Monitoring, retraining) | 15% |

---

## Modifying Content

### Adding Questions

Add to `public/questions.js` following this schema:
```js
{
  id: <unique_int>,          // associate: 1-99, professional: 100-199
  cert: "associate",         // or "professional"
  domain: "Section N: ...",  // must match section prefix for quiz filtering
  question: "...",
  options: ["A", "B", "C", "D"],
  answer: 0,                 // 0-indexed correct option
  explanation: "..."
}
```

### Updating Docs

Edit markdown files in `public/docs/associate/` or `public/docs/professional/`. Supported syntax: headers (`#`, `##`, `###`), bold, italic, code blocks, lists, tables, blockquotes. No mermaid diagrams (stripped by parser).

### Adding a Cert Level

1. Add new key to `CERT_DATA` in `app.js` with all required fields
2. Add cert button to `index.html` cert selector
3. Add cheatsheet panel to `index.html`
4. Create `public/docs/<cert>/` directory with markdown files
5. Add questions with new `cert` value to `questions.js`
6. Update progress default in `server.js`

---

## Testing

```bash
npm test
# Runs: docker compose up -d --wait && node test.js; docker compose down
```

Test validates: HTTP status codes, all 9 doc files, 3 snippets, question schema (65+ total, 30+ per cert), progress API round-trip, file structure.

---

## Official Certification Resources

- Associate: https://www.databricks.com/learn/certification/machine-learning-associate
- Professional: https://www.databricks.com/learn/certification/machine-learning-professional
