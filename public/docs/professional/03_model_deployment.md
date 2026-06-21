# Section 3: Model Deployment

## 1. Deployment Pattern Selection

Choose based on latency requirements and throughput needs:

| Pattern | Latency | Throughput | Trigger | Use Case |
|---|---|---|---|---|
| **Batch Inference** | Minutes-hours | Billions/day | Scheduled job | Daily churn scores, overnight recommendations |
| **Structured Streaming** | Seconds | Millions/hour | Continuous (Kafka, Delta) | Near-real-time fraud scoring, IoT event scoring |
| **Real-time Serving** | <100ms | Thousands/sec | HTTP request | Fraud detection at checkout, product ranking |

> **Decision heuristic:** Does the user/system wait for the result? → Real-time. Can results be precomputed? → Batch. Events arrive as a stream? → Streaming.

---

## 2. Batch Inference at Scale

For scoring hundreds of millions of records, use `mlflow.pyfunc.spark_udf()` — vectorized, distributed, no row-by-row Python overhead.

```python
import mlflow.pyfunc
from pyspark.sql import functions as F

# Register model as Spark UDF
model_uri = "models:/prod.churn_models.customer_churn_v2@champion"
predict_udf = mlflow.pyfunc.spark_udf(spark, model_uri, result_type="double")

# Load scoring data
scoring_df = spark.read.format("delta").table("prod.features.customer_engagement")

# Score all customers — vectorized batch processing
feature_cols = ["tenure_months", "avg_spend_3m", "support_tickets_6m", "login_frequency"]
predictions = scoring_df.withColumn(
    "churn_probability",
    predict_udf(F.struct(*feature_cols))
)

# Partition for write performance (aim for ~128MB per partition)
(predictions
    .repartition(200)
    .write.format("delta")
    .mode("overwrite")
    .option("mergeSchema", "true")
    .saveAsTable("prod.predictions.daily_churn_scores"))
```

**Optimization tips:**
- `repartition(N)` where N ≈ 2-4× cluster cores for write performance
- Cache feature DataFrame if scoring multiple models against same data
- Use Delta `OPTIMIZE` + `ZORDER` on output table for downstream queries
- `result_type` matches model output: `"double"` for probabilities, `"array<double>"` for multi-class

---

## 3. Spark Structured Streaming Inference

For events arriving via Kafka or Delta Lake CDC:

```python
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType
import mlflow.pyfunc

# 1. Register model as UDF (happens once on driver)
predict_udf = mlflow.pyfunc.spark_udf(spark, "models:/FraudModel/Production", result_type="double")

# 2. Read stream from Kafka
stream_df = (spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka-broker:9092")
    .option("subscribe", "transactions")
    .option("startingOffsets", "latest")
    .load()
    .select(F.from_json(F.col("value").cast("string"), transaction_schema).alias("data"))
    .select("data.*"))

# 3. Apply model UDF on streaming DataFrame
scored_stream = stream_df.withColumn(
    "fraud_score",
    predict_udf(F.struct("amount", "merchant_category", "hour_of_day", "velocity_24h"))
)

# 4. Write to Delta Lake (append mode for streaming)
query = (scored_stream.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/mnt/checkpoints/fraud_scores")
    .trigger(processingTime="30 seconds")
    .table("prod.fraud.transaction_scores"))

query.awaitTermination()
```

> **Key point:** `spark_udf()` works on both batch and streaming DataFrames — same code, both modes.

---

## 4. Real-time Model Serving

Databricks Model Serving provides a managed REST endpoint:

**Architecture:**
```
Client → REST API → Model Serving Endpoint → Model Replica(s)
                         ↕ (if Feature Store model)
                    Online Feature Store
```

**Endpoint configuration:**

```python
import requests
import json

# Deploy model to Model Serving endpoint
deploy_config = {
    "name": "churn-scoring-endpoint",
    "config": {
        "served_models": [
            {
                "model_name": "prod.churn_models.customer_churn_v2",
                "model_version": "champion",    # follows alias
                "workload_size": "Small",       # Small/Medium/Large
                "scale_to_zero_enabled": True   # cost optimization for low-traffic
            }
        ]
    }
}
# Deploy via Databricks REST API or Workspace UI

# Inference call
response = requests.post(
    "https://<workspace-url>/serving-endpoints/churn-scoring-endpoint/invocations",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    data=json.dumps({
        "dataframe_records": [
            {"tenure_months": 18, "avg_spend_3m": 95.4, "support_tickets_6m": 2}
        ]
    })
)
result = response.json()
```

### Auto-Scaling and Scale-to-Zero

- **`workload_size`:** Determines compute per replica (Small = 1 CPU/4GB RAM, Large = 4 CPU/16GB)
- **`scale_to_zero_enabled: True`:** Shuts down replicas when idle — cold start latency on first request
- **`min_provisioned_throughput`:** Set > 0 to keep minimum replicas warm (eliminates cold start)

---

## 5. A/B Testing with Traffic Splitting

Send a fraction of traffic to the challenger model via multi-model endpoint config:

```python
ab_test_config = {
    "name": "churn-ab-test",
    "config": {
        "served_models": [
            {
                "name": "champion",
                "model_name": "prod.churn_models.customer_churn_v2",
                "model_version": "champion",
                "workload_size": "Small",
                "traffic_percentage": 90   # 90% to champion
            },
            {
                "name": "challenger",
                "model_name": "prod.churn_models.customer_churn_v3",
                "model_version": "candidate",
                "workload_size": "Small",
                "traffic_percentage": 10   # 10% to challenger
            }
        ]
    }
}
```

**Monitoring A/B tests:**
- Log `served_model_name` field from response to distinguish champion vs challenger predictions
- Compare downstream business metrics (conversion, revenue) by served model
- Use MLflow or DBSQL dashboards to visualize side-by-side

---

## 6. Feature Store Integration with Model Serving

When a model is logged with `fs.log_model(training_set=training_set, ...)`, the endpoint knows which features to look up and from where at inference time.

```
Request: {"customer_id": "cust_123"}
    ↓
Model Serving fetches: customer_123's features from Online Feature Store
    ↓
Model predicts with complete feature vector
    ↓
Response: {"churn_probability": 0.82}
```

This guarantees **no training-serving skew** — the same feature definitions used at training are used at serving. The caller only sends the lookup key.

**Online Feature Store sync** (keep serving latency low):

```python
# Publish feature table to online store (DynamoDB, Cosmos DB, Redis, etc.)
fs.publish_table(
    name="ml.features.customer_engagement",
    online_store=AmazonDynamoDBSpec(region="us-east-1", table_name="customer_features")
)
```

---

## 7. Latency Diagnosis

For a Model Serving endpoint with high p95/p99 latency:

| Symptom | Root Cause | Fix |
|---|---|---|
| High latency on first request, fast after | Cold start (scale-to-zero) | Set `min_provisioned_throughput > 0` |
| Consistently high latency | Insufficient instance size | Increase `workload_size` to Medium or Large |
| CPU pegged at 100% | Too many concurrent requests per replica | Increase replicas or upgrade size |
| Slow preprocessing in model | pyfunc `predict()` has expensive ops | Move preprocessing to feature computation; cache heavy artifacts in `load_context()` |
| High variance latency | Model complexity varies by input | Profile with representative data; use `@mlflow.trace` |

**Percentile targeting:**
- p50 (median) latency < SLA: good for average users
- p95/p99 latency: tail latency, impacts SLA breaches
- Use autoscaling with p99 latency as scaling metric

---

## 8. Quick Reference

| Deployment | API | When |
|---|---|---|
| Batch | `mlflow.pyfunc.spark_udf()` + `.withColumn()` | Daily/hourly scoring at scale |
| Streaming | `readStream` + `spark_udf()` + `writeStream` | Kafka-triggered near-real-time |
| Real-time | Model Serving REST endpoint | <100ms latency requirement |

- Serving alias: configure endpoint with `model_version: "champion"` → follows alias pointer
- A/B test: `traffic_percentage` split across `served_models` array
- Feature Store + Serving: caller sends only lookup key, serving resolves features automatically
- Cold start fix: `min_provisioned_throughput > 0` or `scale_to_zero_enabled: False`
