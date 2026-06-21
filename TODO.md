# TODO — Databricks ML Certification Project-Specific Fixes

- [x] **Silent Domain Validation Gaps in test.js (High Priority)**
  - Add domain validation assertions in `test.js` to ensure questions only use valid canonical domain strings:
    - Associate:
      - `"Section 1: Databricks ML Platform"`
      - `"Section 2: ML Workflows"`
      - `"Section 3: Spark ML"`
      - `"Section 4: Scaling ML Models"`
      - `"Section 5: MLflow Model Lifecycle"`
    - Professional:
      - `"Section 1: Experimentation"`
      - `"Section 2: Model Lifecycle Management"`
      - `"Section 3: Model Deployment"`
      - `"Section 4: Solution & Data Monitoring"`

- [x] **Loose Test Thresholds (Medium Priority)**
  - Update `test.js` to assert the exact question count of **67** total, **35** associate, and **32** professional (currently asserts `>= 60` total and `>= 30` per cert).

- [ ] **Professional Section 4 Coverage Gap (Content Quality)**
  - Add 4 more questions for Section 4 (Solution & Data Monitoring) in `public/questions.js` to balance S4 (currently has 5 questions) with S1–S3 (9 questions each).

- [ ] **Path Traversal Guard Alignment (Low Priority)**
  - Align path traversal validation logic in `server.js` to use a double-layer check (prefix check + `.includes('..')` string check), similar to how Databricks is implemented.

- [ ] **Question Storage Standardization (Architectural)**
  - Standardize question storage format to match the other projects (e.g., GCP uses JSONs while AWS/Databricks use script modules).
