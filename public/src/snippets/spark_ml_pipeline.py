# Spark ML Pipeline Reference Template
# Shows: StringIndexer → OneHotEncoder → VectorAssembler → GBTClassifier
# With CrossValidator for hyperparameter tuning and batch inference via Pandas UDF

from pyspark.ml import Pipeline
from pyspark.ml.classification import GBTClassifier
from pyspark.ml.feature import StringIndexer, OneHotEncoder, VectorAssembler
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.tuning import CrossValidator, ParamGridBuilder
from pyspark.sql import functions as F
import mlflow
import mlflow.spark

# --- ASSUME: spark = SparkSession.builder.getOrCreate() ---

# 1. LOAD DATA FROM DELTA TABLE
df = spark.read.format("delta").load("/mnt/data/customer_features")
train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)

# 2. PIPELINE STAGES — ORDER MATTERS:
# StringIndexer → OneHotEncoder → VectorAssembler → Estimator

# Stage A: Index string column → numeric indices (Estimator — must fit on training data)
country_indexer = StringIndexer(
    inputCol="country",
    outputCol="country_idx",
    handleInvalid="keep"  # "keep" assigns extra index to unseen strings at inference
                          # "error" (default) throws on unseen; "skip" drops rows
)

# Stage B: One-hot encode the indexed column (Estimator)
country_encoder = OneHotEncoder(
    inputCols=["country_idx"],
    outputCols=["country_vec"]
)

# Stage C: Assemble all feature columns into one DenseVector (Transformer)
assembler = VectorAssembler(
    inputCols=["age", "tenure_months", "monthly_spend", "country_vec"],
    outputCol="features"
)

# Stage D: ML Estimator
gbt = GBTClassifier(
    featuresCol="features",
    labelCol="churned",
    maxIter=10
)

# 3. BUILD PIPELINE
pipeline = Pipeline(stages=[country_indexer, country_encoder, assembler, gbt])

# 4. HYPERPARAMETER TUNING WITH CROSSVALIDATOR
param_grid = (ParamGridBuilder()
    .addGrid(gbt.maxDepth, [3, 5])
    .addGrid(gbt.stepSize, [0.1, 0.05])
    .build())  # 2 x 2 = 4 hyperparameter combinations, each cross-validated

evaluator = BinaryClassificationEvaluator(
    labelCol="churned",
    metricName="areaUnderROC"  # other options: "areaUnderPR"
)

cv = CrossValidator(
    estimator=pipeline,
    estimatorParamMaps=param_grid,
    evaluator=evaluator,
    numFolds=3,
    seed=42
)

# 5. FIT (trains all pipeline stages on training data — Estimators fit in order)
with mlflow.start_run(run_name="gbt-cv-pipeline"):
    mlflow.spark.autolog()
    cv_model = cv.fit(train_df)

    # bestModel = PipelineModel where all stages are fitted
    best_pipeline = cv_model.bestModel

    # 6. EVALUATE ON TEST SET
    test_preds = best_pipeline.transform(test_df)
    auc = evaluator.evaluate(test_preds)
    mlflow.log_metric("test_auc", auc)
    print(f"Test AUC: {auc:.4f}")

    # 7. INSPECT BEST HYPERPARAMETERS
    best_gbt = best_pipeline.stages[-1]  # last stage in pipeline
    print(f"Best maxDepth: {best_gbt.getMaxDepth()}, stepSize: {best_gbt.getStepSize()}")

    # 8. FEATURE IMPORTANCES (from GBT model)
    importances = best_gbt.featureImportances
    feature_cols = ["age", "tenure_months", "monthly_spend"] + list(country_encoder.getOutputCols())
    for feat, imp in zip(feature_cols, importances.toArray()):
        if imp > 0.01:
            print(f"  {feat}: {imp:.4f}")

# 9. SAVE AND RELOAD PIPELINE MODEL
best_pipeline.write().overwrite().save("/dbfs/models/churn_gbt_pipeline")
from pyspark.ml import PipelineModel
reloaded = PipelineModel.load("/dbfs/models/churn_gbt_pipeline")

# Inference on new data — applies all stages in order
new_predictions = reloaded.transform(test_df)
new_predictions.select("churned", "prediction", "probability").show(5)

# 10. BATCH INFERENCE AT SCALE WITH PANDAS UDF (via MLflow)
# Register logged model as a Spark UDF for distributed scoring
import mlflow.pyfunc
run_id = mlflow.last_active_run().info.run_id
model_uri = f"runs:/{run_id}/model"
score_udf = mlflow.pyfunc.spark_udf(spark, model_uri, result_type="double")

# Score 500M records distributed across cluster
large_df = spark.read.format("delta").load("/mnt/data/all_customers")
scored_df = large_df.withColumn(
    "churn_score",
    score_udf(F.struct(*["age", "tenure_months", "monthly_spend", "country"]))
)
scored_df.write.format("delta").mode("overwrite").save("/mnt/predictions/churn_scores")

# 11. STRUCTURED STREAMING INFERENCE (same UDF, streaming DataFrame)
stream_df = (spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "kafka:9092")
    .option("subscribe", "customer-events")
    .load()
    .select(F.from_json(F.col("value").cast("string"), customer_schema).alias("d"))
    .select("d.*"))

scored_stream = stream_df.withColumn("churn_score", score_udf(F.struct(*feature_cols)))
(scored_stream.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/mnt/checkpoints/churn_stream")
    .trigger(processingTime="1 minute")
    .table("prod.predictions.realtime_churn"))
