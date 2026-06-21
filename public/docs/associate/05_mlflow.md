# Section 5: MLflow Model Lifecycle

## 1. MLflow Tracking API

MLflow Tracking records experiment parameters, metrics, and artifacts to runs organized within experiments.

### Core Logging Functions

| Function | What it logs | Data type |
|---|---|---|
| `mlflow.log_param(key, value)` | Hyperparameter set before training | String or numeric scalar |
| `mlflow.log_params(dict)` | Multiple params at once | Dictionary |
| `mlflow.log_metric(key, value, step=)` | Numeric measurement, optionally per epoch | Float/int, optionally with step |
| `mlflow.log_metrics(dict, step=)` | Multiple metrics | Dictionary |
| `mlflow.log_artifact(local_path)` | File (plot, CSV, JSON, etc.) | File path string |
| `mlflow.log_artifacts(local_dir)` | Entire directory of files | Directory path |
| `mlflow.log_model(model, artifact_path)` | Serialized model | Framework-specific |

```python
import mlflow
import mlflow.sklearn

with mlflow.start_run(run_name="rf-experiment"):
    # Log params — string or numeric, set before training
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 5)
    mlflow.log_params({"random_state": 42, "criterion": "gini"})

    model.fit(X_train, y_train)

    # Log metrics — numeric only
    mlflow.log_metric("train_auc", train_auc)
    mlflow.log_metric("val_auc", val_auc)
    # For epoch-by-epoch training:
    for epoch, loss in enumerate(training_losses):
        mlflow.log_metric("train_loss", loss, step=epoch)

    # Log artifacts — files
    fig.savefig("/tmp/feature_importance.png")
    mlflow.log_artifact("/tmp/feature_importance.png")

    # Log model — serialized ML model
    mlflow.sklearn.log_model(model, "model")
```

### autolog

`mlflow.autolog()` (or framework-specific `mlflow.sklearn.autolog()`) automatically captures all params, metrics, and model from `.fit()`. Call **before** `.fit()`.

```python
mlflow.sklearn.autolog()              # Enable before training
model = RandomForestClassifier(n_estimators=100, max_depth=5)
model.fit(X_train, y_train)           # autolog captures everything automatically
```

> **autolog captures:** all constructor parameters as params, training metrics (accuracy, AUC depending on task), and logs the trained model as an artifact.

---

## 2. Experiments and Run Organization

```python
# Set or create experiment (by path)
mlflow.set_experiment("/Users/alice@company.com/churn-model")

# Start a run
with mlflow.start_run(run_name="baseline-rf") as run:
    run_id = run.info.run_id
    ...
```

**Nested runs** (for HPO grouping):

```python
with mlflow.start_run(run_name="hpo-search") as parent:
    for lr in [0.01, 0.001, 0.0001]:
        with mlflow.start_run(run_name=f"lr={lr}", nested=True):
            mlflow.log_param("learning_rate", lr)
            mlflow.log_metric("val_loss", train_and_eval(lr))
```

---

## 3. Searching and Comparing Runs

```python
import mlflow

experiment = mlflow.get_experiment_by_name("/Users/alice/churn-model")
runs_df = mlflow.search_runs(
    experiment_ids=[experiment.experiment_id],
    filter_string="metrics.val_auc > 0.8",      # optional filter
    order_by=["metrics.val_auc DESC"]
)

# First row = best run
best_run = runs_df.iloc[0]
best_run_id = best_run["run_id"]
best_auc = best_run["metrics.val_auc"]
print(f"Best run: {best_run_id}, AUC: {best_auc:.4f}")
```

`search_runs` returns a **Pandas DataFrame**. Columns include `run_id`, `metrics.*`, `params.*`, `tags.*`.

---

## 4. MLflow Model Registry

The Model Registry provides versioning, stage management, and deployment tracking for ML models.

### Registering a Model

```python
# Option 1: Register from run URI
model_uri = f"runs:/{best_run_id}/model"
registered = mlflow.register_model(model_uri, "ChurnClassifier")
print(f"Version: {registered.version}")

# Option 2: Log and register in one step
mlflow.sklearn.log_model(
    model,
    artifact_path="model",
    registered_model_name="ChurnClassifier"   # registers automatically
)
```

### Stage Transitions

Classic Registry stages (pre-Unity Catalog):

```
None → Staging → Production → Archived
```

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()
client.transition_model_version_stage(
    name="ChurnClassifier",
    version=3,
    stage="Production"
)
```

> **Stages are metadata only** — they don't physically move the model artifact. Transitioning is just updating a label on the model version.

### Unity Catalog: Aliases (preferred over stages)

In Unity Catalog, use **aliases** instead of stages:

```python
# Set alias
client.set_registered_model_alias("catalog.schema.ChurnModel", "champion", version=5)

# Load by alias
model = mlflow.pyfunc.load_model("models:/catalog.schema.ChurnModel@champion")
```

Aliases are more flexible: multiple can coexist, names are user-defined, and updating an alias is instant rollback.

---

## 5. Loading Models for Inference

### pyfunc (framework-agnostic — the universal loader)

```python
import mlflow.pyfunc

# Load by stage
model = mlflow.pyfunc.load_model("models:/ChurnClassifier/Production")

# Load by version number
model = mlflow.pyfunc.load_model("models:/ChurnClassifier/5")

# Load by alias (Unity Catalog)
model = mlflow.pyfunc.load_model("models:/catalog.schema.ChurnModel@champion")

# Predict — returns numpy array or pandas DataFrame
predictions = model.predict(X_test_df)
```

### Framework-specific loaders

```python
# Preserves sklearn interface (predict_proba, feature_importances_, etc.)
sklearn_model = mlflow.sklearn.load_model(f"runs:/{run_id}/model")
probs = sklearn_model.predict_proba(X_test)[:, 1]
```

> **pyfunc vs framework-specific:** `pyfunc` works for any framework but only gives you `.predict()`. Framework-specific loaders give you the full framework API. For production serving, pyfunc is recommended for framework independence.

---

## 6. Model Signatures and Input Validation

A model signature defines expected input/output schema. Logged with the model for validation at serving time.

```python
from mlflow.models import infer_signature

# Infer from training data and predictions
signature = infer_signature(X_train, model.predict(X_train))

mlflow.sklearn.log_model(model, "model", signature=signature)
```

---

## 7. Quick Reference

| Task | Code |
|---|---|
| Log param | `mlflow.log_param("k", v)` |
| Log metric | `mlflow.log_metric("auc", 0.92)` |
| Log artifact | `mlflow.log_artifact("/tmp/plot.png")` |
| Log model (sklearn) | `mlflow.sklearn.log_model(model, "model")` |
| Auto-capture all | `mlflow.sklearn.autolog()` before `.fit()` |
| Find best run | `mlflow.search_runs(order_by=["metrics.val_auc DESC"]).iloc[0]` |
| Register model | `mlflow.register_model(f"runs:/{run_id}/model", "Name")` |
| Promote to Production | `client.transition_model_version_stage(name, version, "Production")` |
| Load for inference | `mlflow.pyfunc.load_model("models:/Name/Production")` |
| UC alias load | `mlflow.pyfunc.load_model("models:/catalog.schema.Name@champion")` |
