# Section 4: Solution & Data Monitoring

## 1. Types of Drift

Understanding which distribution has shifted determines the right response:

| Drift Type | Notation | What Changes | Impact | Detection |
|---|---|---|---|---|
| **Data drift** | P(X) shifts | Input feature distribution | May or may not degrade model | PSI, KS test, KL divergence on features |
| **Concept drift** | P(Y\|X) shifts | Relationship between features and outcome | Always degrades model — requires retraining | Monitor model accuracy on labeled new data |
| **Label drift** | P(Y) shifts | Output class distribution | May indicate upstream change | Monitor label ratio over time |
| **Prediction drift** | P(ŷ) shifts | Model output distribution | Early proxy for concept drift (labels delayed) | Monitor predicted scores/probabilities |
| **Covariate shift** | P_train(X) ≠ P_test(X) | Specific case of data drift | Model reliability questionable in new region | Compare train vs serving feature distributions |

> **Key insight:** Concept drift (P(Y|X) shifts) is the most dangerous — the model's learned patterns no longer map to reality. Data drift is detectable early but may not always hurt performance.

---

## 2. PSI: Population Stability Index

PSI quantifies how much a feature distribution has shifted compared to a reference (training) window.

### Formula

```
PSI = Σ (Actual% - Expected%) × ln(Actual% / Expected%)
```

where bins are computed over the feature range.

### Thresholds

| PSI Value | Interpretation | Action |
|---|---|---|
| < 0.1 | Stable — no significant drift | Monitor regularly |
| 0.1 – 0.25 | Moderate drift — investigate | Analyze which features drifted; consider retraining |
| > 0.25 | Major drift — model likely degraded | Retrain immediately |

### Computing PSI in Python

```python
import numpy as np
import pandas as pd

def compute_psi(reference: np.ndarray, current: np.ndarray, n_bins: int = 10) -> float:
    """Compute PSI between reference and current distributions."""
    bins = np.percentile(reference, np.linspace(0, 100, n_bins + 1))
    bins[0] -= 1e-10   # ensure all values fall in a bin
    bins[-1] += 1e-10

    ref_counts, _ = np.histogram(reference, bins=bins)
    cur_counts, _ = np.histogram(current, bins=bins)

    ref_pct = ref_counts / len(reference)
    cur_pct = cur_counts / len(current)

    # Avoid log(0)
    ref_pct = np.clip(ref_pct, 1e-10, None)
    cur_pct = np.clip(cur_pct, 1e-10, None)

    psi = np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))
    return psi

# Example usage
reference_scores = training_df["churn_prob"].values
current_scores   = current_week_df["churn_prob"].values

psi = compute_psi(reference_scores, current_scores)
print(f"PSI: {psi:.4f} → {'Stable' if psi < 0.1 else 'Moderate' if psi < 0.25 else 'MAJOR DRIFT'}")
```

---

## 3. Databricks Lakehouse Monitoring

Lakehouse Monitoring (LHM) runs on Delta tables and automatically computes statistical profiles and drift metrics.

### Setup

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.catalog import MonitorInferenceLog, MonitorInfoStatus

w = WorkspaceClient()

# Create monitor on model inference log table
monitor = w.quality_monitors.create(
    table_name="prod.churn.inference_log",
    assets_dir="/Users/alice/monitoring/churn",
    output_schema_name="prod.churn_monitoring",
    inference_log=MonitorInferenceLog(
        granularities=["1 day", "1 week"],
        model_id_col="model_version",
        prediction_col="churn_probability",
        label_col="actual_churned",       # optional, for accuracy metrics
        problem_type="classification/binary"
    ),
    baseline_table_name="prod.churn.training_baseline"   # reference distribution
)
```

### Output Tables

| Table | Contents |
|---|---|
| `profile_metrics` | Statistical summaries per column: mean, stddev, min/max, percentiles, null rate, num_distinct |
| `drift_metrics` | Drift values vs baseline per column per time window: PSI, KL divergence, JS divergence, KS test p-value |

### Reading Monitoring Results

```python
# Check which features have drifted significantly
drift_df = spark.table("prod.churn_monitoring.drift_metrics")

drifted_features = (drift_df
    .filter(F.col("window_start") == current_window_start)
    .filter(F.col("drift_type") == "PSI")
    .filter(F.col("drift_value") > 0.25)
    .select("column_name", "drift_value")
    .orderBy("drift_value", ascending=False))

drifted_features.show()
```

### Pre-built Dashboard

LHM includes a pre-built DBSQL dashboard showing:
- Feature distributions over time vs baseline
- Drift metric trends (PSI, KL divergence)
- Model prediction distribution
- Accuracy/AUC over time (if labels available)

---

## 4. Monitoring Strategy by Data Availability

| Scenario | What to Monitor | Why |
|---|---|---|
| Labels available quickly | Model accuracy, F1, AUC on recent labeled data | Direct quality signal |
| Labels delayed (days/weeks) | Prediction score distribution, feature PSI | Proxy for concept drift |
| No labels | Feature PSI, prediction distribution | Data drift only — can't measure model quality directly |

**Output drift as proxy:**

When ground-truth labels are delayed (e.g., churn label arrives 30 days after prediction), monitor the distribution of predicted scores as an early warning:

```python
# Daily predicted positive rate
daily_ppr = (inference_df
    .withColumn("date", F.to_date("prediction_ts"))
    .groupBy("date")
    .agg(F.mean(F.col("churn_prob") > 0.5).alias("predicted_positive_rate"))
    .orderBy("date"))
```

A sudden rise in predicted positive rate (without corresponding actual churn increase) suggests concept drift.

---

## 5. Statistical Tests for Drift Detection

| Test | Use Case | Hypothesis |
|---|---|---|
| **KS Test (Kolmogorov-Smirnov)** | Continuous features | H0: same distribution |
| **Chi-squared test** | Categorical features | H0: same proportions |
| **PSI** | Any feature, quantified shift | No p-value — threshold-based |
| **KL Divergence** | Information-theoretic drift | Asymmetric (P vs Q) |
| **JS Divergence** | Symmetric version of KL | Symmetric, always finite |

```python
from scipy import stats

# KS test for continuous feature drift
ks_stat, p_value = stats.ks_2samp(reference_feature, current_feature)
if p_value < 0.05:
    print(f"Significant drift detected (p={p_value:.4f})")
```

---

## 6. Automated Retraining Pipeline

Event-driven retraining triggered by drift alert:

```
[Monitor Job] → [DBSQL Alert: PSI > 0.25] → [Webhook / Databricks Job trigger]
                        ↓
[Training Job]
  - Load fresh training data (last N months)
  - Train with same hyperparameters (or re-tune if needed)
  - Log to MLflow, register as Staging
                        ↓
[Validation Job] (triggered by MODEL_VERSION_CREATED webhook)
  - Load Staging model
  - Evaluate vs holdout
  - If passes: update champion alias
  - If fails: archive + page on-call
                        ↓
[Model Serving] picks up new champion (follows alias pointer)
```

```python
# Retraining job logic (simplified)
def retrain_pipeline():
    # 1. Load fresh data
    cutoff = (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
    train_df = spark.sql(f"SELECT * FROM prod.features.customer WHERE date > '{cutoff}'")

    # 2. Train
    with mlflow.start_run(run_name="auto-retrain"):
        mlflow.log_param("trigger", "psi_alert")
        mlflow.log_param("training_cutoff", cutoff)
        model = train_model(train_df)
        mlflow.sklearn.log_model(model, "model", registered_model_name="ChurnModel")

    # Validation job picks up via MODEL_VERSION_CREATED webhook
```

---

## 7. Alert Configuration (DBSQL)

```sql
-- Alert query: daily PSI per feature
SELECT
    column_name,
    window_start,
    drift_value AS psi,
    CASE
        WHEN drift_value < 0.1 THEN 'STABLE'
        WHEN drift_value < 0.25 THEN 'MODERATE'
        ELSE 'MAJOR'
    END AS drift_status
FROM prod.churn_monitoring.drift_metrics
WHERE drift_type = 'PSI'
    AND window_start = CURRENT_DATE - INTERVAL 1 DAY
ORDER BY drift_value DESC
```

Create a DBSQL Alert on this query with condition `psi > 0.25` → triggers webhook → starts retraining job.

---

## 8. Quick Reference

- **PSI < 0.1:** stable | **0.1–0.25:** moderate | **> 0.25:** major — retrain
- Data drift = P(X) shifts. Concept drift = P(Y|X) shifts (worse). Label drift = P(Y) shifts.
- LHM output: `profile_metrics` (stats) + `drift_metrics` (drift vs baseline)
- Prediction score distribution drift = early proxy for concept drift when labels are delayed
- Event-driven retraining: DBSQL Alert (PSI > threshold) → Job webhook → train → validate → promote alias
- KS test for continuous feature drift, chi-squared for categorical
