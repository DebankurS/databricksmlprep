# Section 2: Model Lifecycle Management

## 1. Unity Catalog Model Registry

Unity Catalog (UC) extends the MLflow Model Registry with enterprise governance features. Models are stored using a **three-level namespace**:

```
catalog.schema.model_name
```

- **catalog:** Top-level governance boundary (e.g., `prod`, `dev`, `staging`)
- **schema:** Logical grouping within a catalog (e.g., `churn_models`, `fraud_models`)
- **model_name:** Specific model family

### Registering to Unity Catalog

```python
import mlflow

# Set registry to Unity Catalog
mlflow.set_registry_uri("databricks-uc")

# Register model
mlflow.sklearn.log_model(
    model,
    artifact_path="churn_model",
    registered_model_name="prod.churn_models.customer_churn_v2"
)
```

### Cross-Workspace Access

UC models are accessible across workspaces sharing the same metastore — no data movement required. A workspace in EU can load a model registered in US workspace if sharing the same metastore.

```python
# Load from another workspace's UC namespace
model = mlflow.pyfunc.load_model("models:/prod.churn_models.customer_churn_v2@champion")
```

---

## 2. Aliases vs Stages

### Legacy Stages (Workspace-Local Registry)

```
None → Staging → Production → Archived
```

- Fixed names, only one version per stage
- Deprecated in Unity Catalog — still functional in workspace-local registry

### Aliases (Unity Catalog — Preferred)

User-defined, flexible tags pointing to a specific model version:

```python
from mlflow.tracking import MlflowClient
client = MlflowClient()

# Set alias on a version
client.set_registered_model_alias(
    name="prod.churn_models.customer_churn_v2",
    alias="champion",
    version=7
)

# Multiple aliases can coexist on different versions
client.set_registered_model_alias("prod.churn_models.customer_churn_v2", "challenger", version=8)

# Instant rollback = update alias pointer
client.set_registered_model_alias("prod.churn_models.customer_churn_v2", "champion", version=6)

# Load by alias
model = mlflow.pyfunc.load_model("models:/prod.churn_models.customer_churn_v2@champion")
```

**Alias vs Stage comparison:**

| Aspect | Stages | Aliases |
|---|---|---|
| Names | Fixed (Staging, Production, Archived) | User-defined (champion, challenger, canary) |
| Versions per label | 1 (one Production at a time) | Many aliases can coexist on different versions |
| Registry scope | Workspace-local | Unity Catalog (cross-workspace) |
| Rollback mechanism | Transition previous version back | Update alias pointer (instantaneous) |
| Status | Deprecated in UC | Recommended approach |

---

## 3. Automated Validation Gates

A validation gate is an automated job that loads a candidate model (in Staging), evaluates it against a holdout dataset, and either promotes it to Production or rejects it.

```python
from mlflow.tracking import MlflowClient
import mlflow.pyfunc
import pandas as pd
from sklearn.metrics import roc_auc_score

client = MlflowClient()

def validate_and_promote(model_name: str, candidate_version: int, threshold: float = 0.85):
    # 1. Load candidate from Staging
    model = mlflow.pyfunc.load_model(f"models:/{model_name}/{candidate_version}")

    # 2. Load holdout validation set
    holdout = pd.read_parquet("/dbfs/data/holdout_2024.parquet")
    X_val, y_val = holdout.drop("churned", axis=1), holdout["churned"]

    # 3. Evaluate
    preds = model.predict(X_val)
    auc = roc_auc_score(y_val, preds)
    print(f"Candidate v{candidate_version} AUC: {auc:.4f}")

    if auc >= threshold:
        # 4. Promote (UC: update alias)
        client.set_registered_model_alias(model_name, "champion", candidate_version)
        print(f"Promoted v{candidate_version} to champion alias")
    else:
        # 4. Reject — archive it
        client.transition_model_version_stage(model_name, candidate_version, "Archived")
        print(f"Rejected v{candidate_version}: AUC {auc:.4f} < threshold {threshold}")
```

---

## 4. Model Registry Webhooks

Webhooks trigger HTTP POST requests when specific Registry events occur — enabling CI/CD automation and Slack notifications.

### Event Types

| Event | When triggered |
|---|---|
| `MODEL_VERSION_CREATED` | New version registered |
| `MODEL_VERSION_TRANSITIONED_STAGE` | Version moved to Staging, Production, or Archived |
| `TRANSITION_REQUEST_CREATED` | User requests a stage transition (needs approval) |
| `COMMENT_CREATED` | Comment added to a model version |

### Creating a Webhook

```python
from mlflow.tracking import MlflowClient
import json

client = MlflowClient()

# HTTP webhook — posts to Slack or custom endpoint
webhook = client.create_registry_webhook(
    model_name="ChurnClassifier",
    events=["MODEL_VERSION_TRANSITIONED_STAGE"],
    http_url_spec={
        "url": "https://hooks.slack.com/services/T.../B.../...",
        "enable_ssl_verification": True
    }
)

# Job webhook — triggers a Databricks Job
job_webhook = client.create_registry_webhook(
    model_name="ChurnClassifier",
    events=["MODEL_VERSION_CREATED"],
    job_spec={
        "job_id": "12345",
        "workspace_url": "https://adb-xxxx.azuredatabricks.net",
        "access_token": "dapiXXXXXX"
    }
)
```

### Webhook Payload

```json
{
  "event": "MODEL_VERSION_TRANSITIONED_STAGE",
  "webhook_id": "...",
  "event_timestamp": 1703001234567,
  "model_name": "ChurnClassifier",
  "version": "7",
  "to_stage": "Production",
  "from_stage": "Staging"
}
```

---

## 5. CI/CD Pipeline for ML

Complete automated ML pipeline architecture:

```
[1] Developer pushes code to Git
         ↓
[2] CI system (GitHub Actions / Azure DevOps) triggers
         ↓
[3] Training Job runs on Databricks
    - Loads versioned training data (Delta time travel)
    - Trains model with pinned hyperparameters
    - Logs to MLflow, registers to Staging
         ↓
[4] Validation Job (triggered by MODEL_VERSION_CREATED webhook)
    - Loads Staging model
    - Evaluates on holdout set
    - If passes: update champion alias
    - If fails: archive + notify
         ↓
[5] Model Serving picks up new champion version automatically
    (serving endpoint configured to follow alias, not pinned version)
```

**Key implementation details:**

```python
# In serving endpoint config — follow alias, not version
endpoint_config = {
    "served_models": [{
        "model_name": "prod.churn_models.customer_churn_v2",
        "model_version": "champion",   # alias — auto-updates when alias changes
        "workload_size": "Small"
    }]
}
```

---

## 6. Model Lineage Tracking

MLflow logs lineage automatically. Always include data version and code version for full traceability:

```python
with mlflow.start_run() as run:
    # Code lineage
    mlflow.log_param("git_commit", git_commit_hash)
    mlflow.set_tag("mlflow.source.git.commit", git_commit_hash)
    mlflow.set_tag("mlflow.source.git.branch", "main")

    # Data lineage
    mlflow.log_param("training_table", "prod.features.customer_engagement")
    mlflow.log_param("training_data_version", delta_version)     # Delta table version
    mlflow.log_param("training_start_date", "2023-01-01")
    mlflow.log_param("training_end_date", "2024-01-01")

    # From a registered model, you can trace back to this run_id
    model_version = mlflow.register_model(f"runs:/{run.info.run_id}/model", "ChurnModel")
```

To trace back from a model version:

```python
client = MlflowClient()
model_version_detail = client.get_model_version("ChurnModel", "7")
source_run_id = model_version_detail.run_id
run = client.get_run(source_run_id)
git_commit = run.data.params["git_commit"]
data_version = run.data.params["training_data_version"]
```

---

## 7. Champion/Challenger Framework

```
Champion (production traffic) + Challenger (shadow/canary traffic)
         ↓
Gradual traffic shift:  90/10 → 80/20 → 70/30 → 0/100
         ↓
Monitor: latency, AUC on recent labels, business KPIs
         ↓
Challenger wins → update champion alias
Challenger loses → discard, champion continues
```

**Alias-based rollback (instantaneous):**

```python
# Roll back: champion alias → previous version
client.set_registered_model_alias("prod.churn.model", "champion", previous_version)
# Model Serving follows alias — new requests immediately hit previous version
```

---

## 8. Quick Reference

- UC namespace: `catalog.schema.model_name`
- Aliases: `client.set_registered_model_alias(name, alias, version)` — flexible, multi-coexistent, cross-workspace
- Load by alias: `mlflow.pyfunc.load_model("models:/catalog.schema.Model@champion")`
- Validation gate: load Staging → evaluate holdout → promote alias or archive
- Webhook events: `MODEL_VERSION_CREATED`, `MODEL_VERSION_TRANSITIONED_STAGE`, `TRANSITION_REQUEST_CREATED`
- Rollback: update alias pointer — no downtime, no artifact movement
- CI/CD: git push → train → Staging register → webhook → validate → champion alias update → serving auto-picks up
