# Section 1: Databricks Machine Learning Platform

## 1. Databricks AutoML

AutoML automates the full model development loop: trains multiple algorithm types, tunes hyperparameters, evaluates models, and logs every trial to an MLflow experiment.

**What AutoML produces:**
- Best trial notebook (editable Python) — the primary output
- MLflow experiment with all trial runs compared by metric
- SHAP feature importance plots for the best model
- Data exploration notebook (EDA)

**When to use AutoML:**
- Rapid baseline before writing custom training code
- Non-expert users who need a working model fast
- Benchmarking: use AutoML baseline, then beat it manually

**Supported problem types:** Classification, Regression, Forecasting (time series).

**API usage:**
```python
import databricks.automl as automl
summary = automl.classify(
    dataset=train_df,
    target_col="churned",
    timeout_minutes=60
)
# Summary contains best trial run_id and model URI
best_run_id = summary.best_trial.mlflow_run_id
```

> **Key exam point:** AutoML generates a *best trial notebook* that you can inspect and edit. It does NOT give you a black-box you can't see. The notebook is a starting point for further experimentation.

---

## 2. Databricks Feature Store

Centralized feature repository backed by Delta Lake. Solves training-serving skew by using the same feature pipeline for both training and online inference.

### Core Concepts

| Concept | Description |
|---|---|
| Feature Table | Delta table with features indexed by primary key |
| Primary Key | Entity identifier (e.g., `customer_id`) |
| Timestamp Key | When the feature value was valid — enables point-in-time lookups |
| FeatureLookup | Spec describing which features to retrieve from which table |

### Feature Table Lifecycle

```python
from databricks.feature_store import FeatureStoreClient
fs = FeatureStoreClient()

# 1. Create table (schema inferred from DataFrame)
fs.create_table(
    name="ml.features.customer_features",
    primary_keys=["customer_id"],
    timestamp_keys=["feature_ts"],     # optional, enables point-in-time
    df=feature_df,
    description="Customer engagement features"
)

# 2. Write / update features
fs.write_table(name="ml.features.customer_features", df=updated_df, mode="merge")
```

### Point-in-Time Lookups (Preventing Leakage)

```python
from databricks.feature_store import FeatureLookup

feature_lookups = [
    FeatureLookup(
        table_name="ml.features.customer_features",
        lookup_key="customer_id",
        timestamp_lookup_key="event_ts",   # only features where feature_ts <= event_ts
        feature_names=["tenure_months", "avg_spend_3m"]
    )
]

training_set = fs.create_training_set(
    df=label_df,
    feature_lookups=feature_lookups,
    label="churned"
)
train_pd = training_set.load_df().toPandas()
```

> **Key exam point:** Without `timestamp_lookup_key`, you risk **temporal data leakage** — joining future feature values to past label events. The Feature Store point-in-time lookup prevents this automatically.

### Logging Models with Feature Metadata

```python
# Attaches feature retrieval spec to model — enables automatic feature lookup at serving time
fs.log_model(
    model=trained_model,
    artifact_path="model",
    flavor=mlflow.sklearn,
    training_set=training_set,
    registered_model_name="ChurnModelFS"
)
```

When scoring with `fs.score_batch()`, the attached spec automatically fetches the latest feature values from the store — no manual feature engineering at inference time.

---

## 3. Databricks Runtime for Machine Learning (MLR)

ML Runtime is a Databricks cluster image with pre-installed ML libraries. No `pip install` required for common libraries.

**Pre-installed libraries:**
- TensorFlow, PyTorch, Keras
- Scikit-learn, XGBoost, LightGBM
- MLflow (latest, integrated with workspace)
- Hyperopt, Spark ML, PySpark
- Pandas, NumPy, Matplotlib, Seaborn

**GPU Runtime:** Available for deep learning workloads. Same libraries, GPU-enabled.

**CPU vs GPU:** Use CPU Runtime for classical ML and Spark ML. Use GPU Runtime for deep learning with TF/PyTorch.

> **Key exam point:** If a question asks "what do you need to install to use MLflow on Databricks?" — the answer is **nothing**. MLflow is pre-installed and auto-configured in ML Runtime clusters.

---

## 4. Component Comparison

| Component | Use Case | Training-Serving Skew Risk |
|---|---|---|
| AutoML | Baseline model, no code needed | Low (uses Feature Store by default when data is there) |
| Feature Store | Shared features across teams | None (same pipeline guaranteed) |
| Manual Notebooks | Full control | High (must sync manually) |

---

## 5. Quick Reference

- AutoML output: editable best trial notebook + MLflow experiment + SHAP plots
- Feature Store key types: primary key (who), timestamp key (when)
- `create_training_set` + `timestamp_lookup_key` = point-in-time safe training data
- `fs.log_model(training_set=...)` = automatic feature lookup at inference
- ML Runtime: no installs needed for TF, PyTorch, Sklearn, MLflow, Hyperopt
