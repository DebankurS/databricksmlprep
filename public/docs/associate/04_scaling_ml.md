# Section 4: Scaling ML Models

## 1. Distributed Deep Learning with Horovod

Horovod uses **all-reduce** (ring-allreduce) for gradient synchronization across workers — each worker trains on a shard of data, gradients are averaged across all workers, and all workers update their weights identically.

### HorovodRunner

`HorovodRunner` launches Horovod training on Spark workers:

```python
from sparkdl import HorovodRunner

def train_fn():
    import horovod.tensorflow as hvd
    import tensorflow as tf

    # 1. Initialize Horovod
    hvd.init()

    # 2. Pin GPU to local rank (one GPU per process)
    gpus = tf.config.list_physical_devices("GPU")
    if gpus:
        tf.config.set_visible_devices(gpus[hvd.local_rank()], "GPU")

    # 3. Scale learning rate by number of workers
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001 * hvd.size())

    # 4. Wrap with Horovod DistributedOptimizer
    optimizer = hvd.DistributedOptimizer(optimizer)

    model = build_model()
    model.compile(optimizer=optimizer, loss="binary_crossentropy")

    # 5. Broadcast initial weights from rank 0 to all workers
    callbacks = [hvd.callbacks.BroadcastGlobalVariablesCallback(0)]
    # Only save checkpoints on rank 0
    if hvd.rank() == 0:
        callbacks.append(tf.keras.callbacks.ModelCheckpoint("/dbfs/model_ckpt"))

    model.fit(get_dataset(), callbacks=callbacks, epochs=10)

# np = number of parallel workers (processes)
runner = HorovodRunner(np=4)   # Launch on 4 Spark workers
runner.run(train_fn)
```

### Key Horovod Concepts

| Concept | Detail |
|---|---|
| `hvd.init()` | Must be called at the start of `train_fn` |
| `hvd.size()` | Total number of workers |
| `hvd.rank()` | This worker's global index (0 to size-1) |
| `hvd.local_rank()` | Index within the current node (for GPU assignment) |
| `hvd.DistributedOptimizer` | Wraps existing optimizer; computes allreduce on gradients |
| `BroadcastGlobalVariablesCallback(0)` | Ensures all workers start with same initial weights |
| `np=4` in HorovodRunner | 4 processes total (not 4 nodes) |

> **Exam trap:** `HorovodRunner(np=4)` launches 4 training *processes*, not 4 nodes. Set `np` to the number of GPUs you want to use.

---

## 2. Hyperparameter Optimization at Scale

### Hyperopt with SparkTrials

Hyperopt uses **TPE (Tree-structured Parzen Estimator)** — a Bayesian algorithm that learns from past trial results to select promising next parameter sets.

```python
from hyperopt import fmin, tpe, hp, STATUS_OK, Trials, SparkTrials
import mlflow

def objective(params):
    with mlflow.start_run(nested=True):
        model = train_model(**params)
        loss = evaluate_model(model)
        mlflow.log_params(params)
        mlflow.log_metric("val_loss", loss)
    return {"loss": loss, "status": STATUS_OK}

search_space = {
    "max_depth": hp.choice("max_depth", [3, 5, 7, 10]),
    "learning_rate": hp.loguniform("learning_rate", -4, 0),   # 10⁻⁴ to 10⁰
    "n_estimators": hp.quniform("n_estimators", 50, 300, 50)
}

# SparkTrials = parallelism across Spark workers
spark_trials = SparkTrials(parallelism=4)   # 4 concurrent trials

best_params = fmin(
    fn=objective,
    space=search_space,
    algo=tpe.suggest,       # TPE Bayesian optimization
    max_evals=20,
    trials=spark_trials     # Distributed
)
```

### SparkTrials vs Trials

| Feature | `SparkTrials` | `Trials` |
|---|---|---|
| Execution | Parallel on Spark workers | Sequential on driver |
| Parallelism | Up to cluster core count | 1 (sequential) |
| MLflow integration | Automatic on Databricks | Manual |
| Bayesian learning | Delayed (must wait for batch) | Immediate per trial |
| Use case | Large-scale HPO | Local debugging |

> **SparkTrials parallelism ceiling:** Cannot exceed the number of concurrent Spark tasks your cluster supports. Setting `parallelism=100` on a 4-core cluster still runs 4 at a time.

### hp.space functions

| Function | Distribution |
|---|---|
| `hp.choice(label, options)` | Categorical — picks from list |
| `hp.uniform(label, low, high)` | Uniform continuous |
| `hp.loguniform(label, low, high)` | Log-uniform (good for learning rates) |
| `hp.quniform(label, low, high, q)` | Uniform, rounded to multiple of q |
| `hp.randint(label, upper)` | Random integer [0, upper) |

---

## 3. Scalable Batch Inference with Pandas UDFs

For scoring large DataFrames with a Python model (sklearn, PyTorch, etc.), use Pandas UDFs — they're vectorized, distributed, and avoid Python row-by-row overhead.

### Via MLflow (recommended)

```python
import mlflow.pyfunc
from pyspark.sql import functions as F

# Register the MLflow model as a Pandas UDF
model_uri = "models:/ChurnClassifier/Production"
predict_udf = mlflow.pyfunc.spark_udf(spark, model_uri, result_type="double")

# Apply to Spark DataFrame — distributes across workers
scored_df = customer_df.withColumn(
    "churn_prob",
    predict_udf(F.struct(*feature_cols))
)
scored_df.write.format("delta").mode("overwrite").save("/mnt/predictions/churn")
```

### Manual Pandas UDF

```python
import pandas as pd
from pyspark.sql.functions import pandas_udf
from pyspark.sql.types import FloatType
import pickle

# Load model on driver, broadcast to workers
model_broadcast = spark.sparkContext.broadcast(pickle.loads(open("/dbfs/model.pkl","rb").read()))

@pandas_udf(FloatType())
def predict_udf(features: pd.Series) -> pd.Series:
    model = model_broadcast.value
    return pd.Series(model.predict_proba(list(features))[:, 1])
```

> **mlflow.pyfunc.spark_udf vs manual:** `spark_udf` is simpler, framework-agnostic, and handles model loading per executor automatically. Use it unless you need fine-grained control.

---

## 4. Quick Reference

| Technique | API | When |
|---|---|---|
| Distributed DL | `HorovodRunner(np=N)` | Deep learning on 10M+ samples |
| Parallel HPO | `SparkTrials(parallelism=N)` | Hyperopt across cluster |
| Batch inference | `mlflow.pyfunc.spark_udf()` | Score millions of rows with Python model |

- Horovod: `hvd.init()` → scale LR by `hvd.size()` → wrap with `hvd.DistributedOptimizer` → broadcast weights from rank 0
- Hyperopt: `fmin(fn, space, algo=tpe.suggest, max_evals, trials=SparkTrials())` 
- `SparkTrials(parallelism=N)` runs N trials concurrently; limited by cluster cores
- Pandas UDF: vectorized, not row-by-row — processes a batch as a Pandas Series
