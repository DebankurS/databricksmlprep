# Section 3: Spark ML

## 1. Core Abstractions: Transformer vs Estimator

**Everything in Spark ML is either a Transformer or an Estimator.**

| Abstraction | Interface | Description | Example |
|---|---|---|---|
| **Transformer** | `.transform(df)` | Takes a DataFrame, returns new DataFrame | VectorAssembler, fitted StringIndexerModel |
| **Estimator** | `.fit(df)` → Model | Learns from data, returns a fitted Transformer | StringIndexer, LogisticRegression, Pipeline |

> **Key distinction:** `StringIndexer` is an Estimator (learns the category-to-index mapping from training data). `StringIndexerModel` (output of `.fit()`) is a Transformer.

---

## 2. Core Feature Transformers

### VectorAssembler

Combines multiple numeric/vector columns into one `DenseVector` column. Required by all Spark ML estimators (they expect a single `features` column).

```python
from pyspark.ml.feature import VectorAssembler

assembler = VectorAssembler(
    inputCols=["age", "tenure_months", "monthly_spend", "country_vec"],
    outputCol="features"
)
# assembler is a Transformer — no fitting required
df_features = assembler.transform(df)
```

### StringIndexer

Encodes string column to numeric indices (0, 1, 2...) ordered by frequency. **Must be fitted** — it learns the mapping from training data.

```python
from pyspark.ml.feature import StringIndexer

indexer = StringIndexer(
    inputCol="country",
    outputCol="country_idx",
    handleInvalid="keep"   # Options: "error", "keep", "skip"
)
indexer_model = indexer.fit(train_df)   # Estimator → fits on train
train_indexed = indexer_model.transform(train_df)
test_indexed  = indexer_model.transform(test_df)  # uses same mapping
```

**handleInvalid options:**

| Value | Behavior |
|---|---|
| `"error"` (default) | Throws exception on unseen string at inference |
| `"keep"` | Assigns an extra index (last+1) to unseen strings |
| `"skip"` | Drops rows containing unseen strings |

> **Exam trap:** At inference on new data, use `"keep"` unless you want exceptions. `"error"` fails on any new category in production.

### OneHotEncoder

Converts numeric indices from StringIndexer into sparse binary vectors. Applied **after** StringIndexer.

```python
from pyspark.ml.feature import OneHotEncoder

encoder = OneHotEncoder(
    inputCols=["country_idx"],
    outputCols=["country_vec"]
)
encoder_model = encoder.fit(train_indexed)
```

---

## 3. Pipeline: Chaining Stages

A Pipeline chains Estimators and Transformers in order. `Pipeline.fit()` calls `.fit()` on each Estimator stage in sequence, passing the output to the next stage.

**Correct stage ordering:**

```
StringIndexer → OneHotEncoder → VectorAssembler → ML Estimator
```

```python
from pyspark.ml import Pipeline
from pyspark.ml.classification import RandomForestClassifier

pipeline = Pipeline(stages=[
    StringIndexer(inputCol="country", outputCol="country_idx", handleInvalid="keep"),
    OneHotEncoder(inputCols=["country_idx"], outputCols=["country_vec"]),
    VectorAssembler(inputCols=["age", "tenure_months", "country_vec"], outputCol="features"),
    RandomForestClassifier(featuresCol="features", labelCol="churned")
])

# Pipeline.fit() returns PipelineModel — all stages are now fitted
pipeline_model = pipeline.fit(train_df)

# Transform applies all stages in order
predictions = pipeline_model.transform(test_df)
```

> **What Pipeline.fit() returns:** A `PipelineModel` where all Estimator stages have been replaced by their fitted Model equivalents.

---

## 4. Hyperparameter Tuning

### ParamGridBuilder + CrossValidator

```python
from pyspark.ml.tuning import ParamGridBuilder, CrossValidator
from pyspark.ml.evaluation import BinaryClassificationEvaluator

rf = RandomForestClassifier(featuresCol="features", labelCol="churned")

param_grid = (ParamGridBuilder()
    .addGrid(rf.numTrees, [50, 100, 200])
    .addGrid(rf.maxDepth, [3, 5, 7])
    .build())  # 3 × 3 = 9 combinations

evaluator = BinaryClassificationEvaluator(
    labelCol="churned",
    metricName="areaUnderROC"
)

cv = CrossValidator(
    estimator=pipeline,
    estimatorParamMaps=param_grid,
    evaluator=evaluator,
    numFolds=3
)

cv_model = cv.fit(train_df)
best_model = cv_model.bestModel     # PipelineModel with best params
```

### Evaluators

| Evaluator | Default Metric | Use When |
|---|---|---|
| `BinaryClassificationEvaluator` | `areaUnderROC` | Binary classification |
| `MulticlassClassificationEvaluator` | `f1` | Multi-class |
| `RegressionEvaluator` | `rmse` | Regression |

---

## 5. Saving and Loading Models

```python
# Save — overwrite() prevents error if path exists
pipeline_model.write().overwrite().save("/dbfs/models/churn_pipeline")

# Load
from pyspark.ml import PipelineModel
loaded_model = PipelineModel.load("/dbfs/models/churn_pipeline")

# Inference
predictions = loaded_model.transform(new_df)
```

For individual model stages:

```python
# Access individual stage in a PipelineModel
rf_model = pipeline_model.stages[-1]    # last stage
importances = rf_model.featureImportances
```

---

## 6. Streaming Inference

Spark ML PipelineModel works on streaming DataFrames with `.transform()`:

```python
stream_df = spark.readStream.format("kafka")...
scored_stream = pipeline_model.transform(stream_df)
scored_stream.writeStream.format("delta").outputMode("append")...
```

---

## 7. Quick Reference

- Transformer: `.transform(df)` — no fitting needed / already fitted
- Estimator: `.fit(df)` → returns fitted Model (Transformer)
- Stage order: StringIndexer → OneHotEncoder → VectorAssembler → Estimator
- `handleInvalid="keep"` for production robustness with unseen strings
- `Pipeline.fit()` returns `PipelineModel` — all Estimators are now fitted Models
- `CrossValidator` + `ParamGridBuilder` for grid-search hyperparameter tuning
- `BinaryClassificationEvaluator(metricName="areaUnderROC")` for binary classification
- Save: `.write().overwrite().save(path)` | Load: `PipelineModel.load(path)`
