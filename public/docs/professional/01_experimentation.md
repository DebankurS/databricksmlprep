# Section 1: Experimentation

## 1. Preventing Temporal Data Leakage

Temporal leakage occurs when a feature computed from future data is used to predict a past event. This produces optimistic offline metrics that collapse at deployment.

### Common Sources

| Source | Example |
|---|---|
| Future aggregates | Mean spend for the full year used to predict Q1 churn |
| Future-dependent imputation | Missing value filled with future observations |
| Feature computed after label event | Account status 30 days after churn label date |

### Prevention Strategies

**Feature Store point-in-time lookup** (recommended):

```python
FeatureLookup(
    table_name="ml.features.customer",
    lookup_key="customer_id",
    timestamp_lookup_key="event_ts"   # only features where feature_ts <= event_ts
)
```

**Manual temporal split:**

```python
# Always split by time, never random split for time-series data
train_df = df.filter(F.col("date") < "2024-01-01")
test_df  = df.filter(F.col("date") >= "2024-01-01")
```

**Delta Lake time travel** for reproducibility:

```python
# Training run logs the Delta version used
version = spark.sql("DESCRIBE HISTORY delta.`/path/to/table`").first()["version"]
mlflow.log_param("training_data_version", version)

# Reproduce exact dataset later
past_df = spark.read.format("delta").option("versionAsOf", version).load("/path/to/table")
# Or by timestamp:
past_df = spark.sql("SELECT * FROM table TIMESTAMP AS OF '2024-01-01'")
```

---

## 2. Reproducibility at Scale

Full experiment reproducibility requires pinning: data version, code version, and random seeds.

```python
with mlflow.start_run() as run:
    mlflow.log_param("data_version", delta_version)
    mlflow.log_param("git_commit", subprocess.check_output(["git","rev-parse","HEAD"]).decode().strip())
    mlflow.log_param("random_seed", 42)
    mlflow.set_tag("training_date", datetime.now().isoformat())
```

---

## 3. MLflow Nested Runs for Grouped Experiments

Nested runs create a parent-child hierarchy in the MLflow UI — useful for HPO where you want to compare all trials under one parent experiment.

```python
with mlflow.start_run(run_name="architecture-search") as parent_run:
    mlflow.log_param("dataset_version", "v3.2")

    for n_layers in [2, 3, 4]:
        for hidden_size in [64, 128]:
            with mlflow.start_run(run_name=f"layers={n_layers}_hidden={hidden_size}", nested=True):
                mlflow.log_params({"n_layers": n_layers, "hidden_size": hidden_size})
                val_loss = train_and_eval(n_layers, hidden_size)
                mlflow.log_metric("val_loss", val_loss)

# In MLflow UI: parent run contains all child runs as sub-runs
# Compare children side-by-side under the same parent
```

**Hyperopt automatically creates nested runs** when using `SparkTrials` on Databricks — each trial becomes a child run.

---

## 4. SHAP for Feature Selection

SHAP (SHapley Additive exPlanations) decomposes model predictions into per-feature contributions using game theory. Unlike native feature importances, SHAP is:
- **Model-agnostic** — works for any model
- **Consistent** — features that matter more always get higher SHAP values
- **Local + global** — explains individual predictions and aggregate importances

### Global Feature Selection

```python
import shap

explainer = shap.TreeExplainer(model)       # or KernelExplainer for any model
shap_values = explainer.shap_values(X_train)

# Global importance: mean absolute SHAP value per feature
global_importance = np.abs(shap_values).mean(axis=0)
feature_names = X_train.columns.tolist()

# Features with importance near 0 are candidates for removal
threshold = 0.01
selected_features = [f for f, imp in zip(feature_names, global_importance) if imp >= threshold]
```

**Summary plot:**

```python
shap.summary_plot(shap_values, X_train, feature_names=feature_names)
```

> **Advantage over native RF importance:** Native feature importance (Gini impurity) can be biased toward high-cardinality features. SHAP measures actual marginal contribution.

---

## 5. Custom Models with mlflow.pyfunc

`mlflow.pyfunc.PythonModel` lets you package any Python logic as an MLflow model — useful when your "model" is an ensemble, a rule-based system + ML, or requires custom preprocessing.

```python
import mlflow.pyfunc
import pandas as pd
import pickle

class EnsembleModel(mlflow.pyfunc.PythonModel):
    def load_context(self, context):
        # Called once when model is loaded — load heavy artifacts here
        with open(context.artifacts["model_a"], "rb") as f:
            self.model_a = pickle.load(f)
        with open(context.artifacts["model_b"], "rb") as f:
            self.model_b = pickle.load(f)

    def predict(self, context, model_input: pd.DataFrame) -> pd.DataFrame:
        preds_a = self.model_a.predict_proba(model_input)[:, 1]
        preds_b = self.model_b.predict_proba(model_input)[:, 1]
        ensemble_pred = (preds_a + preds_b) / 2
        return pd.DataFrame({"score": ensemble_pred})

# Log custom model
with mlflow.start_run():
    mlflow.pyfunc.log_model(
        artifact_path="ensemble",
        python_model=EnsembleModel(),
        artifacts={
            "model_a": "/tmp/model_a.pkl",
            "model_b": "/tmp/model_b.pkl"
        },
        registered_model_name="ChurnEnsemble"
    )

# Load — same pyfunc interface
model = mlflow.pyfunc.load_model("models:/ChurnEnsemble/Production")
predictions = model.predict(pd.DataFrame(X_test))
```

---

## 6. Distributed HPO Comparison: SparkTrials vs Ray Tune

| Feature | Hyperopt SparkTrials | Ray Tune |
|---|---|---|
| Native Databricks integration | Yes — auto-logs to MLflow | Requires Ray cluster |
| Algorithm | TPE (Bayesian) | Many: PBT, ASHA, BOHB, etc. |
| Parallelism | Up to cluster cores | Up to Ray cluster size |
| Early stopping | No (completes all max_evals) | Yes (ASHA, PBT) |
| Custom resources | No | Yes (GPU per trial) |
| Complexity | Low | Higher setup |
| Best for | Standard HPO on Databricks | Advanced: early stopping, complex resource allocation |

---

## 7. Drift Types

| Drift Type | Definition | Notation | Detection |
|---|---|---|---|
| **Data drift** | Input distribution changes | P(X) shifts | PSI, KL divergence, statistical tests |
| **Concept drift** | Relationship between input and output changes | P(Y\|X) shifts | Monitor model accuracy/AUC on new data |
| **Label drift** | Output distribution changes | P(Y) shifts | Monitor label distribution over time |
| **Prediction drift** | Model output distribution changes | P(ŷ) shifts | Monitor prediction scores — early proxy for concept drift |

> **Most impactful:** Concept drift (P(Y|X)) requires model retraining. Data drift may or may not impact model quality.

---

## 8. Ranking Models

**Offline metrics:**
- **NDCG@k** (Normalized Discounted Cumulative Gain): Measures ranking quality, penalizes relevant items ranked low
- **MAP** (Mean Average Precision): Mean of average precision across queries
- **MRR** (Mean Reciprocal Rank): Reciprocal of rank of first relevant result

**Exposure bias:** In offline evaluation, you only see clicks on items that were shown. Items never recommended appear never clicked — artificially penalized in evaluation. Counterfactual evaluation (Inverse Propensity Scoring) corrects for this.

---

## 9. Quick Reference

- Temporal leakage prevention: Feature Store `timestamp_lookup_key` or time-based train/test split
- Delta time travel: `TIMESTAMP AS OF` or `VERSION AS OF` for reproducible data snapshots
- MLflow nested runs: `with mlflow.start_run(nested=True)` inside a parent run
- SHAP global importance: `np.abs(shap_values).mean(axis=0)` — features with ≈0 impact are removable
- Custom pyfunc: subclass `mlflow.pyfunc.PythonModel`, implement `predict()` and optionally `load_context()`
- SparkTrials: TPE Bayesian, no early stopping, easy Databricks integration
- Concept drift (P(Y|X)) = most critical drift type, requires retraining
