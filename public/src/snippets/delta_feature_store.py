# Databricks Feature Store + Delta Lake Reference Template
# Shows: feature registration, training set creation, model logging with FS,
#        batch inference, online serving, and Delta time travel

from databricks.feature_store import FeatureStoreClient
from databricks.feature_store import FeatureLookup
import mlflow
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score
import pandas as pd

fs = FeatureStoreClient()

# =========================================================================
# PART 1: DEFINE AND REGISTER FEATURE TABLE
# =========================================================================

# feature_df is a Spark DataFrame with computed features
# Required: primary_key column. Optional: timestamp_key for point-in-time.
feature_df = spark.sql("""
    SELECT
        customer_id,
        date AS feature_ts,                    -- timestamp for point-in-time lookup
        AVG(monthly_spend) OVER (
            PARTITION BY customer_id
            ORDER BY date
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ) AS avg_spend_3m,
        COUNT(support_tickets) OVER (
            PARTITION BY customer_id
            ORDER BY date
            ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
        ) AS support_tickets_6m,
        login_frequency,
        tenure_months
    FROM customer_events
""")

# Create feature table — backed by a Delta table
fs.create_table(
    name="ml.features.customer_engagement",
    primary_keys=["customer_id"],
    timestamp_keys=["feature_ts"],    # enables point-in-time lookup
    df=feature_df,
    description="Monthly customer engagement features for churn model"
)

# Write or update feature data (merge = upsert on primary key + timestamp)
fs.write_table(
    name="ml.features.customer_engagement",
    df=feature_df,
    mode="merge"
)

# =========================================================================
# PART 2: CREATE TRAINING DATASET WITH POINT-IN-TIME LOOKUP
# =========================================================================

# Label table: one row per training event (customer + label at event time)
labels_df = spark.sql("""
    SELECT customer_id, event_ts, churned
    FROM churn_labels
    WHERE event_ts BETWEEN '2023-01-01' AND '2024-01-01'
""")

# FeatureLookup — resolves features at the correct historical time
# timestamp_lookup_key ensures feature_ts <= event_ts (NO TEMPORAL LEAKAGE)
feature_lookups = [
    FeatureLookup(
        table_name="ml.features.customer_engagement",
        lookup_key="customer_id",
        timestamp_lookup_key="event_ts",   # enforces point-in-time correctness
        feature_names=["avg_spend_3m", "support_tickets_6m", "login_frequency", "tenure_months"]
    )
]

# Create training set: joins features to labels at correct historical timestamps
training_set = fs.create_training_set(
    df=labels_df,
    feature_lookups=feature_lookups,
    label="churned",
    exclude_columns=["event_ts", "customer_id"]  # remove keys from features
)
training_df = training_set.load_df().toPandas()

# =========================================================================
# PART 3: TRAIN MODEL AND LOG WITH FEATURE STORE METADATA
# =========================================================================
X = training_df.drop(columns=["churned"])
y = training_df["churned"]

with mlflow.start_run(run_name="churn-fs-model"):
    model = GradientBoostingClassifier(n_estimators=100, max_depth=4, learning_rate=0.05)
    model.fit(X, y)

    auc = roc_auc_score(y, model.predict_proba(X)[:, 1])
    mlflow.log_metric("train_auc", auc)

    # Log model WITH feature store metadata attached
    # Enables automatic feature lookup at serving time (training-serving skew prevention)
    fs.log_model(
        model=model,
        artifact_path="churn_model",
        flavor=mlflow.sklearn,
        training_set=training_set,              # attaches the feature lookup spec
        registered_model_name="ChurnModelWithFS"
    )
    print(f"Model registered. Run: {mlflow.active_run().info.run_id}")

# =========================================================================
# PART 4: BATCH INFERENCE USING FEATURE STORE
# =========================================================================
# Only send entity key — FS fetches latest features automatically
scoring_df = spark.sql("SELECT customer_id FROM all_customers")

# score_batch: automatically looks up latest feature values from Feature Store
predictions = fs.score_batch(
    model_uri="models:/ChurnModelWithFS/Production",
    df=scoring_df
)
# predictions contains all feature columns + 'prediction' column

predictions.write.format("delta").mode("overwrite").saveAsTable("ml.predictions.churn_scores")

# =========================================================================
# PART 5: ONLINE FEATURE STORE FOR REAL-TIME SERVING
# =========================================================================
# Publish feature table to an online store for low-latency serving
from databricks.feature_store.online_store_spec import AmazonDynamoDBSpec

online_store_spec = AmazonDynamoDBSpec(
    region="us-east-1",
    table_name="customer_engagement_online",
    write_secret_prefix="feature-store/dynamodb"  # Databricks secret scope
)

# Sync Delta feature table to DynamoDB (runs as a streaming job)
fs.publish_table(
    name="ml.features.customer_engagement",
    online_store=online_store_spec
)

# When a model logged with fs.log_model(training_set=...) is deployed
# to Model Serving, it automatically queries the online store at request time:
# Request: {"customer_id": "cust_001"}
# Serving: looks up customer_001 features from DynamoDB → runs model → returns prediction

# =========================================================================
# PART 6: DELTA LAKE TIME TRAVEL FOR REPRODUCIBILITY
# =========================================================================
# Option A: By timestamp — reproduce data state at a point in time
past_features = spark.sql("""
    SELECT * FROM ml.features.customer_engagement
    TIMESTAMP AS OF '2023-06-01 00:00:00'
""")

# Option B: By version number — log version in MLflow for exact reproducibility
import subprocess
from pyspark.sql.functions import col

# Get current Delta version before training
delta_version = spark.sql(
    "DESCRIBE HISTORY delta.`/path/to/table` LIMIT 1"
).first()["version"]

with mlflow.start_run():
    mlflow.log_param("training_data_delta_version", delta_version)
    # ... train model ...

# Reproduce exact training dataset later
past_features_exact = (spark.read.format("delta")
    .option("versionAsOf", delta_version)
    .load("/path/to/ml/features/customer_engagement"))

# =========================================================================
# PART 7: CHAMPION/CHALLENGER WITH ALIASES (Unity Catalog)
# =========================================================================
from mlflow.tracking import MlflowClient
client = MlflowClient()

# Set aliases for gradual rollout
client.set_registered_model_alias(
    name="prod.churn_models.ChurnModelWithFS",
    alias="champion",
    version=5
)
client.set_registered_model_alias(
    name="prod.churn_models.ChurnModelWithFS",
    alias="challenger",
    version=6
)

# Load by alias — decoupled from version number
champion_model = mlflow.pyfunc.load_model("models:/prod.churn_models.ChurnModelWithFS@champion")

# Instant rollback: update alias pointer (no artifact movement)
client.set_registered_model_alias(
    name="prod.churn_models.ChurnModelWithFS",
    alias="champion",
    version=4   # point back to previous version
)
