// Databricks ML Certification Practice Questions
// Covers both ML Associate and ML Professional exam objectives.

const PRACTICE_QUESTIONS = [

  // =========================================================================
  // ASSOCIATE — Section 1: Databricks ML Platform (29%)
  // =========================================================================
  {
    id: 1,
    cert: "associate",
    domain: "Section 1: Databricks ML Platform",
    question: "A data scientist needs to train a binary classification model on a tabular dataset stored in a Delta table. She has no experience writing model training code and needs the best model as fast as possible. Which Databricks feature should she use?",
    options: [
      "Write a custom Scikit-learn training script and log results with mlflow.log_metric().",
      "Use Databricks AutoML to automatically run feature engineering, model training, and hyperparameter tuning, then inspect the generated notebooks.",
      "Use the Databricks Feature Store to register all columns as features, then manually call SparkML GBTClassifier.",
      "Use Databricks Repos to clone an open-source AutoML library from GitHub."
    ],
    answer: 1,
    explanation: "Databricks AutoML is the correct tool. It automatically handles feature engineering, trains multiple model types with hyperparameter tuning, logs all runs to MLflow, and generates editable Python notebooks showing exactly what was done — requiring zero hand-written training code."
  },
  {
    id: 2,
    cert: "associate",
    domain: "Section 1: Databricks ML Platform",
    question: "After running a Databricks AutoML experiment, a data scientist wants to access the winning model for further customization. Where should he look?",
    options: [
      "The AutoML API response object, which returns a fitted scikit-learn Pipeline object directly.",
      "The MLflow experiment linked to the AutoML run — the best trial's run contains the logged model artifact and a generated source notebook.",
      "The Databricks Model Registry, where AutoML automatically promotes the best model to the Production stage.",
      "The cluster driver logs, which print the final model parameters after training."
    ],
    answer: 1,
    explanation: "Databricks AutoML logs every trial to an MLflow experiment. The best trial's run contains the model artifact and a generated notebook with the training code. AutoML does NOT automatically register or promote to Production — that requires a manual action."
  },
  {
    id: 3,
    cert: "associate",
    domain: "Section 1: Databricks ML Platform",
    question: "A team wants to share a set of pre-computed user features across three separate ML models — a churn model, a recommendation model, and a fraud model — to avoid redundant computation and prevent training-serving skew. Which Databricks component is specifically designed for this use case?",
    options: [
      "Delta Lake with time travel, enabling point-in-time snapshots for any historical feature values.",
      "Databricks Feature Store, which provides a centralized registry where features are defined once and reused by multiple models during training and inference.",
      "MLflow Model Registry, which stores model artifacts alongside their training datasets.",
      "Databricks SQL, which allows sharing feature computation logic via Views accessible by all teams."
    ],
    answer: 1,
    explanation: "The Databricks Feature Store is the correct answer. It provides a centralized catalog where features are defined once using feature tables, reused by multiple models at training time, and the same feature pipeline is automatically applied at inference time — preventing training-serving skew."
  },
  {
    id: 4,
    cert: "associate",
    domain: "Section 1: Databricks ML Platform",
    question: "A machine learning engineer is registering a feature table in the Databricks Feature Store. The feature table must support point-in-time lookups to prevent data leakage when creating training datasets. What is the required column for enabling this capability?",
    options: [
      "A unique primary key column that identifies each entity (e.g., customer_id).",
      "A timestamp column that records when each feature value was valid, combined with a primary key.",
      "A partition column based on date that allows Delta time travel queries.",
      "An integer index column that maps to the event sequence for each entity."
    ],
    answer: 1,
    explanation: "Point-in-time lookups in the Databricks Feature Store require BOTH a primary key (entity identifier) and a timestamp column. During training dataset creation, the timestamp is used to look up only feature values that were available at or before the label event timestamp, preventing data leakage."
  },
  {
    id: 5,
    cert: "associate",
    domain: "Section 1: Databricks ML Platform",
    question: "Which of the following statements about Databricks Runtime for Machine Learning (ML Runtime) is correct?",
    options: [
      "ML Runtime is a GPU-only runtime and cannot be used on CPU-only clusters.",
      "ML Runtime includes pre-installed ML libraries such as TensorFlow, PyTorch, Scikit-learn, XGBoost, and MLflow, and configures Spark for distributed ML workloads.",
      "ML Runtime replaces the cluster driver with a specialized ML orchestration service.",
      "ML Runtime is only available on Single Node clusters and does not support multi-worker setups."
    ],
    answer: 1,
    explanation: "Databricks ML Runtime comes pre-installed with popular ML libraries (TensorFlow, PyTorch, Scikit-learn, XGBoost, LightGBM, Hyperopt, MLflow) and optimizes cluster settings for distributed ML. It works on both CPU and GPU clusters and supports multi-worker setups for distributed training."
  },
  {
    id: 6,
    cert: "associate",
    domain: "Section 1: Databricks ML Platform",
    question: "A data scientist used Databricks AutoML and found the best trial in the MLflow experiment. She now wants to reproduce and improve the model. What is the recommended approach?",
    options: [
      "Re-run the same AutoML experiment with a longer timeout to generate more trials.",
      "Open the source notebook that AutoML generated for the best trial, clone it to Databricks Repos, and customize the training code directly.",
      "Use mlflow.load_model() on the best run's model artifact and call model.fit() again with new parameters.",
      "Modify the AutoML configuration YAML and push it to the cluster's init script."
    ],
    answer: 1,
    explanation: "AutoML generates fully editable Python notebooks (one per trial). The recommended workflow is to open and clone the best trial's notebook, then customize hyperparameters, preprocessing steps, or add new feature engineering directly in the notebook."
  },
  {
    id: 7,
    cert: "associate",
    domain: "Section 1: Databricks ML Platform",
    question: "A Feature Store table has a primary key of `customer_id` and a timestamp column `feature_ts`. A label table has `customer_id` and `event_ts` for each training event. When calling `FeatureStoreClient.create_training_set()`, what does the `timestamp_lookup_key` parameter control?",
    options: [
      "It controls the partition column used to speed up the lookup query.",
      "It specifies the label table column to use as the cutoff when looking up feature values, ensuring only features available before that event timestamp are included.",
      "It sets the maximum age of feature data that is considered valid for training.",
      "It defines the join key between the feature table and the label table."
    ],
    answer: 1,
    explanation: "The `timestamp_lookup_key` specifies the column in the observation table (label table) that serves as the time cutoff for point-in-time feature lookup. Only feature values with `feature_ts <= event_ts` are included, preventing data leakage from future feature values."
  },

  // =========================================================================
  // ASSOCIATE — Section 2: ML Workflows (29%)
  // =========================================================================
  {
    id: 8,
    cert: "associate",
    domain: "Section 2: ML Workflows",
    question: "You are preparing a training dataset that contains a categorical feature `city` with 500 unique values. You are training a gradient boosting model. Which encoding technique is most appropriate?",
    options: [
      "One-hot encoding, because tree-based models require binary feature representations.",
      "Target encoding (mean encoding), which replaces each category with the mean target value for that category, and is efficient for high-cardinality categoricals with tree models.",
      "Label encoding with integer assignment, which is always appropriate for all model types.",
      "Binary encoding, which converts each category to a binary string representation."
    ],
    answer: 1,
    explanation: "Target encoding (mean encoding) is appropriate for high-cardinality categorical features with tree-based models. One-hot encoding with 500 categories creates 500 sparse columns, causing high dimensionality. Target encoding replaces each category with a statistic (e.g., mean target value) derived from the training labels, keeping dimensionality low. Apply smoothing to avoid target leakage on low-frequency categories."
  },
  {
    id: 9,
    cert: "associate",
    domain: "Section 2: ML Workflows",
    question: "A dataset for fraud detection contains 99.9% non-fraud and 0.1% fraud cases. A model trained on this data achieves 99.9% accuracy. Why is this metric misleading and which metric should be used instead?",
    options: [
      "Accuracy is misleading because it does not account for model complexity. Use BIC or AIC instead.",
      "Accuracy is misleading because a model predicting all non-fraud achieves 99.9% by default. Use F1-score or precision-recall AUC, which account for class imbalance.",
      "Accuracy is misleading because neural networks cannot be evaluated this way. Use cross-entropy loss instead.",
      "Accuracy is not misleading; the model is simply well-calibrated and ready for production."
    ],
    answer: 1,
    explanation: "On a 99.9%/0.1% split, a trivial model predicting 'non-fraud' for every case achieves 99.9% accuracy. Accuracy fails completely on imbalanced datasets. Use F1-score (harmonic mean of precision and recall) or precision-recall AUC, which explicitly evaluate the model's ability to correctly identify minority-class examples."
  },
  {
    id: 10,
    cert: "associate",
    domain: "Section 2: ML Workflows",
    question: "During model training, you observe that training accuracy is 98% but validation accuracy is 72%. What does this indicate, and what should you do?",
    options: [
      "This indicates underfitting. You should increase model complexity by adding more layers or features.",
      "This indicates overfitting (high variance). You should apply regularization (L1/L2), dropout, reduce model complexity, collect more training data, or use early stopping.",
      "This indicates a data pipeline bug. You should re-shuffle and re-split the dataset.",
      "This indicates the validation set is too small. Increasing the validation set size will fix the gap."
    ],
    answer: 1,
    explanation: "A large gap between training and validation accuracy (98% vs 72%) is the classic sign of overfitting: the model memorized training data but fails to generalize. Remedies include regularization (L1/L2 penalization, dropout for NNs), reducing model complexity, collecting more training data, or using early stopping based on validation loss."
  },
  {
    id: 11,
    cert: "associate",
    domain: "Section 2: ML Workflows",
    question: "You are using scikit-learn to preprocess features with `StandardScaler` before training. What is the correct procedure to avoid data leakage from the preprocessing step?",
    options: [
      "Call `scaler.fit_transform()` on the full dataset before splitting into train and test sets.",
      "Call `scaler.fit_transform(X_train)` on the training set, then call `scaler.transform(X_test)` on the test set using the same fitted scaler.",
      "Fit a separate scaler on X_train and another on X_test to ensure both sets are independently standardized.",
      "Call `scaler.fit(X_test)` first to capture the production data distribution, then apply it to X_train."
    ],
    answer: 1,
    explanation: "The correct pattern is `fit_transform` on training data only (so scaler learns mean/std from training), then `transform` on test data using the same scaler. Fitting on the full dataset leaks test statistics into training; fitting separate scalers misrepresents production behavior."
  },
  {
    id: 12,
    cert: "associate",
    domain: "Section 2: ML Workflows",
    question: "You need to compare three candidate models and select the best one using k-fold cross-validation. Your dataset has 10,000 rows. Which setup is most appropriate?",
    options: [
      "Use a single 80/20 train-test split for each model, compare test accuracy, and pick the highest.",
      "Use 5-fold or 10-fold cross-validation: train each model k times on different folds, average the validation scores, and select the model with the best mean score across folds.",
      "Use leave-one-out cross-validation (LOOCV) for maximum data efficiency.",
      "Randomly shuffle the dataset 3 times, train each model on each shuffle, and average scores."
    ],
    answer: 1,
    explanation: "K-fold cross-validation (5 or 10 folds is standard for 10K rows) provides a more reliable estimate of generalization performance than a single train-test split by averaging over multiple held-out folds. LOOCV is computationally expensive for 10K rows and generally not needed."
  },
  {
    id: 13,
    cert: "associate",
    domain: "Section 2: ML Workflows",
    question: "A regression model predicts house prices. The RMSE on the test set is $50,000. What does this metric represent and when is it preferable to MAE?",
    options: [
      "RMSE is the mean absolute difference between predictions and actuals. It is always better than MAE.",
      "RMSE is the square root of the mean squared errors. It penalizes large errors more heavily than MAE because of squaring. Prefer RMSE when large prediction errors are disproportionately costly.",
      "RMSE measures the proportion of variance explained by the model (like R²). Use it when comparing models on different datasets.",
      "RMSE and MAE are equivalent metrics; the choice is purely cosmetic."
    ],
    answer: 1,
    explanation: "RMSE squares errors before averaging, which means large errors contribute disproportionately to the metric. This makes RMSE preferable when large prediction errors are especially costly (e.g., extreme underpricing a house). MAE treats all errors equally and is more robust to outliers."
  },
  {
    id: 14,
    cert: "associate",
    domain: "Section 2: ML Workflows",
    question: "A model needs to be evaluated with stratified k-fold cross-validation. Why is stratification important for classification tasks?",
    options: [
      "Stratification ensures each fold contains the same number of samples, regardless of class distribution.",
      "Stratified k-fold preserves the original class distribution in each fold, preventing folds where a minority class is completely absent, which would cause misleading evaluation metrics.",
      "Stratification randomizes the fold assignment using a fixed seed for reproducibility.",
      "Stratified k-fold is required only for regression tasks to ensure target value distribution is maintained across folds."
    ],
    answer: 1,
    explanation: "Stratified k-fold ensures each fold maintains approximately the same class distribution as the full dataset. Without stratification, a fold might contain no examples of a rare class, making precision/recall/AUC metrics undefined or misleading for that class."
  },

  // =========================================================================
  // ASSOCIATE — Section 3: Spark ML (22%)
  // =========================================================================
  {
    id: 15,
    cert: "associate",
    domain: "Section 3: Spark ML",
    question: "You are building a Spark ML Pipeline with the following stages: VectorAssembler, StringIndexer, and LogisticRegression. In what order should these stages be arranged, and why?",
    options: [
      "LogisticRegression → VectorAssembler → StringIndexer, because the estimator must initialize before transformers.",
      "StringIndexer → VectorAssembler → LogisticRegression, because StringIndexer converts strings to numeric indices, VectorAssembler then combines all numeric features into a feature vector, and LogisticRegression trains on the assembled vector.",
      "VectorAssembler → StringIndexer → LogisticRegression, because vectors must be assembled before indexing.",
      "The order does not matter — Spark ML Pipeline infers dependencies automatically."
    ],
    answer: 1,
    explanation: "The correct order is: StringIndexer (converts string columns to numeric indices) → VectorAssembler (combines all numeric feature columns into a single dense vector) → LogisticRegression (trains on the assembled feature vector). Transformers run in sequence; each stage's output feeds the next stage."
  },
  {
    id: 16,
    cert: "associate",
    domain: "Section 3: Spark ML",
    question: "In Spark ML, what is the difference between a Transformer and an Estimator?",
    options: [
      "A Transformer stores model weights; an Estimator provides the evaluation metric computation.",
      "A Transformer applies a transformation to a DataFrame and returns a new DataFrame (e.g., VectorAssembler, StandardScaler when already fitted). An Estimator learns from data via .fit() and returns a fitted Transformer (Model) — e.g., LogisticRegression is an Estimator that returns a LogisticRegressionModel.",
      "A Transformer is used for feature engineering; an Estimator is used only for prediction.",
      "An Estimator is a stateless operation; a Transformer stores learned parameters from training data."
    ],
    answer: 1,
    explanation: "Transformer: has a .transform() method, stateless (or already fitted), returns a new DataFrame. Estimator: has a .fit() method, learns statistics from training data, and returns a fitted Transformer (Model). VectorAssembler is a Transformer; LogisticRegression is an Estimator that returns a LogisticRegressionModel (which is a Transformer)."
  },
  {
    id: 17,
    cert: "associate",
    domain: "Section 3: Spark ML",
    question: "What does `VectorAssembler` do in a Spark ML pipeline, and what does it return?",
    options: [
      "It creates a sparse one-hot encoded representation of categorical features.",
      "It combines multiple numeric or vector columns into a single DenseVector or SparseVector column (usually named 'features'), which is required as input by most Spark ML estimators.",
      "It normalizes feature values to have zero mean and unit variance.",
      "It selects the top N most important features by computing feature importances from a pre-trained model."
    ],
    answer: 1,
    explanation: "VectorAssembler takes a list of input column names (numeric or vector) and concatenates them into a single vector column. Most Spark ML estimators (like LogisticRegression, GBTClassifier) expect a single 'features' vector column as input. VectorAssembler is what produces that column."
  },
  {
    id: 18,
    cert: "associate",
    domain: "Section 3: Spark ML",
    question: "After calling `pipeline.fit(train_df)`, which object is returned and what can you do with it?",
    options: [
      "A new Pipeline object with updated hyperparameters from the training data.",
      "A PipelineModel object that has fitted parameters for all Estimator stages. You can call `.transform(df)` on it to produce predictions on new data.",
      "A dictionary of stage metrics including training accuracy and feature importances.",
      "A Spark Job object representing the asynchronous fit operation."
    ],
    answer: 1,
    explanation: "pipeline.fit(train_df) returns a PipelineModel — a fitted version of the pipeline where all Estimator stages have been replaced by their fitted Transformer (Model) counterparts. You call pipelineModel.transform(test_df) to apply all transformation and prediction stages to new data."
  },
  {
    id: 19,
    cert: "associate",
    domain: "Section 3: Spark ML",
    question: "You want to tune the `numTrees` and `maxDepth` hyperparameters of a `RandomForestClassifier` in a Spark ML pipeline using cross-validation. Which Spark ML components should you use?",
    options: [
      "GridSearchCV from scikit-learn, wrapped in a Pandas UDF to parallelize across Spark workers.",
      "ParamGridBuilder to define the hyperparameter grid, and CrossValidator (with the pipeline as the estimator and an evaluator) to perform k-fold cross-validation across all grid combinations.",
      "Hyperopt with SparkTrials, which automatically integrates with Spark ML pipelines for distributed tuning.",
      "mlflow.start_run() nested inside a Python for-loop over all hyperparameter combinations."
    ],
    answer: 1,
    explanation: "The native Spark ML approach uses ParamGridBuilder to define the grid (e.g., numTrees in [20, 50, 100] and maxDepth in [3, 5, 8]) and CrossValidator to evaluate each combination. CrossValidator accepts the pipeline as its estimator, an evaluator (e.g., BinaryClassificationEvaluator), and the param grid, then performs k-fold cross-validation."
  },
  {
    id: 20,
    cert: "associate",
    domain: "Section 3: Spark ML",
    question: "A Spark ML pipeline produces predictions. The task is binary classification. Which evaluator should you use to compute AUC-ROC, and what is the correct call?",
    options: [
      "`MulticlassClassificationEvaluator(metricName='accuracy')` — it handles binary classification by default.",
      "`BinaryClassificationEvaluator(metricName='areaUnderROC', labelCol='label', rawPredictionCol='rawPrediction')` — this evaluator is specifically designed for binary classification metrics.",
      "`RegressionEvaluator(metricName='rmse')` — ROC curves are computed from regression residuals.",
      "`ClusteringEvaluator(metricName='silhouette')` — binary classification evaluates cluster separation."
    ],
    answer: 1,
    explanation: "BinaryClassificationEvaluator computes AUC-ROC (areaUnderROC) or AUC-PR (areaUnderPR) for binary classification tasks. It reads from the rawPrediction column (model confidence scores), not the prediction column (hard labels). MulticlassClassificationEvaluator handles multi-class accuracy/F1 but not AUC-ROC."
  },
  {
    id: 21,
    cert: "associate",
    domain: "Section 3: Spark ML",
    question: "You have a trained Spark ML PipelineModel and want to save it to DBFS so it can be loaded later. What is the correct method?",
    options: [
      "`pickle.dump(pipeline_model, open('/dbfs/models/pipeline.pkl', 'wb'))` — pickle works for Spark objects.",
      "`pipeline_model.save('/dbfs/models/my_pipeline')` — Spark ML models have a built-in .save() method that persists the model to a distributed filesystem path.",
      "`mlflow.spark.log_model(pipeline_model, 'model')` is the only supported way to persist Spark ML models.",
      "`pipeline_model.write().overwrite().save('/dbfs/models/my_pipeline')` is required when a model already exists at the path."
    ],
    answer: 3,
    explanation: "Both .save() and .write().overwrite().save() work, but .write().overwrite().save() is more robust because it handles the case where a model already exists at the destination path. .save() will throw an error if the path exists. Pickle does NOT work with Spark ML objects (they are not Python-picklable). mlflow.spark.log_model() also works but logs to MLflow, not saves to a path."
  },
  {
    id: 22,
    cert: "associate",
    domain: "Section 3: Spark ML",
    question: "You use `StringIndexer` on a `country` column during training. During inference, a new country value appears that was not in the training data. What happens by default, and how should you handle it?",
    options: [
      "StringIndexer assigns a new index automatically for unseen labels and continues without error.",
      "StringIndexer throws an error for unseen labels by default. Set `handleInvalid='keep'` to assign unseen labels to an extra index, or `handleInvalid='skip'` to drop those rows.",
      "StringIndexer silently converts unseen labels to `null` values, which then propagate through the pipeline.",
      "StringIndexer converts unseen labels to -1.0 by default, which models handle as a missing value indicator."
    ],
    answer: 1,
    explanation: "By default, StringIndexer raises an exception when it encounters a label not seen during training (handleInvalid='error'). Set handleInvalid='keep' to assign unseen labels to an additional index (numLabels) — useful in production. Use handleInvalid='skip' to drop rows with unseen labels during transform."
  },

  // =========================================================================
  // ASSOCIATE — Section 4: Scaling ML Models (11%)
  // =========================================================================
  {
    id: 23,
    cert: "associate",
    domain: "Section 4: Scaling ML Models",
    question: "You need to train a deep neural network on a large dataset distributed across multiple Spark workers on a Databricks cluster. Which framework integrates natively with Spark for distributed deep learning training?",
    options: [
      "Scikit-learn's GridSearchCV with n_jobs=-1, which automatically uses all available CPU cores.",
      "Horovod, an open-source distributed deep learning framework that uses Spark workers as training processes and supports TensorFlow and PyTorch through HorovodRunner on Databricks.",
      "Hyperopt with Trials (not SparkTrials), which runs each trial on a separate Spark worker.",
      "Spark ML's MultilayerPerceptronClassifier, which natively distributes gradient computation across all workers."
    ],
    answer: 1,
    explanation: "Horovod is the framework for distributed deep learning on Spark. Databricks provides HorovodRunner which uses Spark to launch Horovod training processes on worker nodes. It supports TensorFlow and PyTorch. HorovodRunner(np=N) launches N parallel training processes — typically one per GPU or worker."
  },
  {
    id: 24,
    cert: "associate",
    domain: "Section 4: Scaling ML Models",
    question: "You are using Hyperopt with `SparkTrials` to tune hyperparameters for a scikit-learn model on Databricks. What is the key advantage of `SparkTrials` over the default `Trials` object?",
    options: [
      "SparkTrials uses Bayesian optimization instead of random search, improving sample efficiency.",
      "SparkTrials parallelizes hyperparameter trials across Spark workers, running multiple trials simultaneously. Trials runs trials sequentially on the driver node only.",
      "SparkTrials automatically logs results to the MLflow tracking server; Trials requires manual mlflow.log_metric() calls.",
      "SparkTrials supports gradient-based optimization; Trials only supports random search."
    ],
    answer: 1,
    explanation: "The key difference is parallelism. Trials runs each trial serially on the driver. SparkTrials distributes trials across the Spark cluster — each worker receives a trial to evaluate in parallel. Both use the same TPE algorithm for Bayesian optimization. SparkTrials also integrates with MLflow automatically when used on Databricks."
  },
  {
    id: 25,
    cert: "associate",
    domain: "Section 4: Scaling ML Models",
    question: "You need to run batch inference on 50 million rows using a trained scikit-learn model. The data is in a Spark DataFrame. What is the recommended approach to maximize throughput?",
    options: [
      "Convert the full Spark DataFrame to a Pandas DataFrame using .toPandas(), then call model.predict() on the Pandas DataFrame.",
      "Register the model with mlflow.sklearn and call mlflow.pyfunc.load_model() on each row using a Python UDF.",
      "Use a Pandas UDF (vectorized UDF) that applies the model's predict function to batches of rows as Pandas Series or DataFrames, distributing inference across all Spark workers.",
      "Export the Spark DataFrame to a CSV file, then load it into a single-node machine for inference."
    ],
    answer: 2,
    explanation: "Pandas UDFs (also called vectorized UDFs) are the standard pattern for scalable batch inference. They operate on Pandas Series/DataFrames in batches (not row by row), which is far more efficient than regular Python UDFs. The Spark executor serializes batches and distributes them to workers, enabling full cluster parallelism. toPandas() moves all data to the driver — not scalable for 50M rows."
  },
  {
    id: 26,
    cert: "associate",
    domain: "Section 4: Scaling ML Models",
    question: "When using `HorovodRunner(np=4)` on a Databricks cluster, what does the `np=4` parameter specify?",
    options: [
      "The number of hyperparameter tuning trials to run in parallel.",
      "The number of parallel Horovod processes (typically one per GPU or worker node) that will collectively train the model using all-reduce gradient synchronization.",
      "The number of epochs to train for on each worker before synchronizing gradients.",
      "The number of data partitions to split the training dataset into for each worker."
    ],
    answer: 1,
    explanation: "np=4 in HorovodRunner specifies the number of parallel Horovod training processes. Each process runs on a separate worker (or GPU). All processes train simultaneously and synchronize gradients using Horovod's ring-allreduce algorithm after each batch, effectively training on all data in parallel."
  },
  {
    id: 27,
    cert: "associate",
    domain: "Section 4: Scaling ML Models",
    question: "You are training a PyTorch model with Horovod on Databricks. What modification is required to the optimizer to enable distributed gradient averaging?",
    options: [
      "Replace `torch.optim.Adam` with `horovod.torch.optimizers.Adam`, a Horovod-specific optimizer class.",
      "Wrap the standard PyTorch optimizer with `hvd.DistributedOptimizer(optimizer, named_parameters=model.named_parameters())`, which intercepts gradient updates and averages them across all workers using allreduce.",
      "Set `torch.distributed.init_process_group(backend='horovod')` before initializing the optimizer.",
      "No modification is needed — Horovod hooks into PyTorch's autograd automatically when hvd.init() is called."
    ],
    answer: 1,
    explanation: "The required change is wrapping the optimizer with `hvd.DistributedOptimizer`. This is the hook Horovod uses to intercept gradients after the backward pass and average them across all workers via allreduce before the parameter update step. Without this wrapping, each worker trains independently with no gradient synchronization."
  },
  {
    id: 28,
    cert: "associate",
    domain: "Section 4: Scaling ML Models",
    question: "Which of the following best describes the purpose of `hyperopt.fmin()` in a Databricks HPO workflow?",
    options: [
      "fmin() runs gradient descent to minimize the model's training loss by iteratively updating hyperparameters.",
      "fmin() searches the hyperparameter space defined by the `space` argument using the TPE algorithm (or other) to minimize the objective function, distributing trials via the provided `trials` object (Trials or SparkTrials).",
      "fmin() is a Spark transformation that applies a UDF to each row to compute per-sample losses.",
      "fmin() performs feature selection by minimizing the feature importance entropy of the trained model."
    ],
    answer: 1,
    explanation: "hyperopt.fmin() is the core optimization driver. It takes an objective function (which trains a model and returns a loss), a hyperparameter space (e.g., defined with hp.choice, hp.uniform), a search algorithm (typically tpe.suggest for Bayesian TPE), a trials object (Trials or SparkTrials), and max_evals. It finds the hyperparameter configuration that minimizes the objective."
  },
  {
    id: 29,
    cert: "associate",
    domain: "Section 4: Scaling ML Models",
    question: "A data scientist sets `parallelism=8` in `SparkTrials`. What does this control, and what determines the effective upper bound?",
    options: [
      "It sets the number of Hyperopt optimization iterations; the algorithm runs 8 sequential rounds of Bayesian improvement.",
      "It specifies the maximum number of HPO trials to run concurrently across Spark workers. The effective upper bound is limited by the number of available Spark worker cores or executors.",
      "It configures the number of cross-validation folds for each trial's model evaluation.",
      "It sets the random seed for reproducible trial sampling across 8 parallel streams."
    ],
    answer: 1,
    explanation: "parallelism in SparkTrials controls how many Hyperopt trials run simultaneously on the Spark cluster. The practical upper bound is the number of available Spark workers/executors, since each concurrent trial requires one Spark task. Setting parallelism higher than available workers wastes resources — excess trials will queue and wait."
  },

  // =========================================================================
  // ASSOCIATE — Section 5: MLflow Model Lifecycle (9%)
  // =========================================================================
  {
    id: 30,
    cert: "associate",
    domain: "Section 5: MLflow Model Lifecycle",
    question: "In MLflow, what is the difference between `mlflow.log_param()`, `mlflow.log_metric()`, and `mlflow.log_artifact()`?",
    options: [
      "They are identical — all three log key-value pairs to the MLflow run; the naming is for developer readability only.",
      "`log_param()` records a single key-value configuration (e.g., learning_rate=0.01) that does not change during training. `log_metric()` records a numeric value that can change over training steps (e.g., accuracy per epoch). `log_artifact()` uploads a file or directory (e.g., a plot, CSV, or model file) to the run's artifact store.",
      "`log_param()` is for input features; `log_metric()` is for output labels; `log_artifact()` is for model weights.",
      "`log_metric()` is batch-only; `log_param()` supports streaming; `log_artifact()` is for binary blobs only."
    ],
    answer: 1,
    explanation: "log_param: records input hyperparameters (strings or numbers that are set before training). log_metric: records numeric metrics that may be logged multiple times with a step (e.g., loss at each epoch). log_artifact: uploads files/directories to the run's artifact storage (e.g., plots, confusion matrices, feature importance CSVs)."
  },
  {
    id: 31,
    cert: "associate",
    domain: "Section 5: MLflow Model Lifecycle",
    question: "What does `mlflow.autolog()` do when called before training a scikit-learn model?",
    options: [
      "It starts a new MLflow experiment and automatically assigns a unique experiment name based on the cluster ID.",
      "It automatically logs hyperparameters, metrics, and the fitted model artifact to the current MLflow run without requiring explicit mlflow.log_param() or mlflow.log_metric() calls. It hooks into the training framework's fit() call.",
      "It enables real-time streaming of training metrics to a Grafana dashboard.",
      "It converts the scikit-learn model into an MLflow-native format that is incompatible with standard sklearn predict()."
    ],
    answer: 1,
    explanation: "mlflow.autolog() (or framework-specific mlflow.sklearn.autolog()) automatically captures hyperparameters passed to fit(), training/validation metrics, and logs the fitted model artifact. It hooks into the framework's API without requiring any manual mlflow.log_* calls. It must be called before the .fit() call."
  },
  {
    id: 32,
    cert: "associate",
    domain: "Section 5: MLflow Model Lifecycle",
    question: "A team has trained 3 candidate models logged to the same MLflow experiment. How do they programmatically find the best model run by validation F1-score using the MLflow Python client?",
    options: [
      "Call `mlflow.get_best_run(experiment_name, metric='val_f1', order='max')` — this is a native MLflow function.",
      "Use `mlflow.search_runs(experiment_ids=[exp_id], order_by=['metrics.val_f1 DESC'])` to retrieve a DataFrame of runs sorted by the metric, then select the first row's run_id.",
      "Navigate to the MLflow UI, sort runs by val_f1 manually, and copy the run_id.",
      "Call `mlflow.list_run_infos()` and iterate through each run to compare val_f1 values."
    ],
    answer: 1,
    explanation: "mlflow.search_runs() is the programmatic API for querying runs. Passing order_by=['metrics.val_f1 DESC'] returns a Pandas DataFrame with runs sorted by that metric descending. The first row (index 0) contains the best run. This enables automated selection in CI/CD pipelines without manual UI interaction."
  },
  {
    id: 33,
    cert: "associate",
    domain: "Section 5: MLflow Model Lifecycle",
    question: "A model is registered in the MLflow Model Registry. What does transitioning a model version to the 'Production' stage mean, and how is it done?",
    options: [
      "The model is automatically deployed to a REST endpoint. Transitioning to Production starts the serving container.",
      "It is a metadata label that designates that version as the canonical production model. Other systems can query the registry to load the version with stage='Production'. Transition via the UI or `client.transition_model_version_stage(name, version, stage='Production')`.",
      "Production stage locks the model from further changes; you must archive it first before making any updates.",
      "Transitioning to Production copies the model artifact to a separate, air-gapped production storage bucket."
    ],
    answer: 1,
    explanation: "Stage transitions in MLflow Model Registry are metadata changes — they label a version (None → Staging → Production → Archived) for discoverability. They do NOT trigger deployment automatically. Production stage signals 'this is the canonical version to serve.' Applications load the Production version via mlflow.pyfunc.load_model('models:/MyModel/Production')."
  },
  {
    id: 34,
    cert: "associate",
    domain: "Section 5: MLflow Model Lifecycle",
    question: "What is an MLflow model signature, and why is it important?",
    options: [
      "A model signature is the digital signature of the model artifact for security verification when loading from the registry.",
      "A model signature defines the expected input schema (column names and types) and output schema for a logged model. It enables input validation at serving time and documents the contract between the model and its consumers.",
      "A model signature is a version string appended to the model name in the registry for unique identification.",
      "A model signature contains the list of hyperparameters used during training for reproducibility."
    ],
    answer: 1,
    explanation: "MLflow model signatures define the input/output data schema (column names, data types, tensor shapes). They are logged with mlflow.log_model(..., signature=signature) using mlflow.models.infer_signature(). At serving time, the signature is used to validate that incoming requests match the expected schema, preventing silent type errors."
  },
  {
    id: 35,
    cert: "associate",
    domain: "Section 5: MLflow Model Lifecycle",
    question: "Which MLflow function loads a model from the registry as a generic Python function that can be called with a Pandas DataFrame, regardless of the original training framework (sklearn, XGBoost, PyTorch, etc.)?",
    options: [
      "`mlflow.sklearn.load_model('models:/MyModel/Production')` — the sklearn flavor is the universal loader.",
      "`mlflow.pyfunc.load_model('models:/MyModel/Production')` — the pyfunc flavor wraps any model as a Python callable with a standard `predict(data: DataFrame) -> DataFrame` interface.",
      "`mlflow.spark.load_model('models:/MyModel/Production')` — Spark models serve as the universal abstraction.",
      "`mlflow.load_artifact('models:/MyModel/Production')` — artifacts are the generic model storage format."
    ],
    answer: 1,
    explanation: "mlflow.pyfunc.load_model() is the framework-agnostic model loader. It loads any logged model (sklearn, XGBoost, TensorFlow, PyTorch, custom pyfunc) and returns a PythonModel object with a .predict(data) method that accepts Pandas DataFrames or numpy arrays. This is the standard pattern for model serving and batch inference pipelines."
  },

  // =========================================================================
  // PROFESSIONAL — Section 1: Experimentation (30%)
  // =========================================================================
  {
    id: 101,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "You are engineering features from a time-series dataset. Your label is customer churn in month T. Feature candidates include account balance, login frequency, and support tickets — all measured monthly. What is the critical issue to verify before using these features, and how do you fix it?",
    options: [
      "All time-series features introduce multicollinearity; use PCA to remove correlated signals.",
      "Features measured at or after month T may introduce data leakage: the model would see future information not available at prediction time. Use only feature values from months T-1 and earlier; use Feature Store point-in-time lookups to enforce this cutoff.",
      "Time-series features require differencing (subtracting previous values) before they can be used in any supervised ML model.",
      "Time-series features should be aggregated using exponential smoothing before being included in a feature vector."
    ],
    answer: 1,
    explanation: "Data leakage from time is the critical issue. If features measured in month T (the same month as the label) are included, the model trains on information that would not be available at real prediction time. The fix: use only features from T-1 or earlier. Databricks Feature Store's point-in-time lookup enforces this cutoff automatically when feature tables have a timestamp column."
  },
  {
    id: 102,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "A team wants to reproduce an experiment run from 3 months ago exactly — same data snapshot, same code, same parameters. What Databricks and MLflow mechanisms enable full reproducibility?",
    options: [
      "MLflow logs are immutable; simply load the model artifact and re-run .predict() on current data.",
      "Use Delta Lake time travel (`VERSION AS OF` or `TIMESTAMP AS OF`) to retrieve the exact data snapshot used at training time, combine with the MLflow run's logged parameters and linked source code commit (from Databricks Repos), and re-run the experiment notebook.",
      "Store the training dataset as a CSV artifact in the MLflow run and load it for re-training.",
      "Pin the cluster's Databricks Runtime version and re-run the notebook — the ML Runtime ensures identical library versions across runs."
    ],
    answer: 1,
    explanation: "Full reproducibility requires: (1) Delta Lake time travel to get the exact data version at training time (MLflow can log the Delta table version); (2) MLflow-logged parameters and metrics; (3) Git commit hash (MLflow logs `mlflow.source.git.commit` when running in Databricks Repos). Runtime pinning helps but is insufficient alone — data drift across re-queries is the primary reproducibility threat."
  },
  {
    id: 103,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "You are running a hyperparameter search with 200 trials using Hyperopt and SparkTrials. You want to compare groups of trials (e.g., trials with different model architectures) as nested experiments. How should you structure MLflow logging to enable this?",
    options: [
      "Create a separate MLflow experiment for each model architecture and merge results post-hoc using mlflow.search_runs across multiple experiments.",
      "Use MLflow nested runs: start a parent run for each architecture group with `mlflow.start_run()`, then use `with mlflow.start_run(nested=True):` inside the objective function for each individual trial. This creates a tree structure in the UI.",
      "Log an 'architecture' tag to every run using mlflow.set_tag() and filter runs by tag in the UI.",
      "Use separate SparkTrials objects for each architecture and specify different experiment_id per object."
    ],
    answer: 1,
    explanation: "MLflow nested runs create a parent-child hierarchy: one parent run per architecture group, child runs per individual trial. In the objective function passed to fmin(), use `with mlflow.start_run(nested=True):` to log each trial as a child of the active parent run. This creates a tree in the MLflow UI that makes it easy to compare architectures and inspect individual trials."
  },
  {
    id: 104,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "You are using SHAP (SHapley Additive exPlanations) values for feature selection before training a production model. What does a SHAP value represent, and how should you use it for feature elimination?",
    options: [
      "SHAP values represent the correlation coefficient between each feature and the target variable. Remove features with SHAP |correlation| < 0.05.",
      "SHAP values represent each feature's marginal contribution to a specific prediction, averaged across all possible feature orderings. Use mean absolute SHAP values across the training set to rank feature importance, then eliminate features with consistently near-zero SHAP values.",
      "SHAP values measure the variance explained by each feature in isolation. Remove features explaining less than 1% of variance.",
      "SHAP values are only valid for tree-based models and cannot be used for feature selection in neural networks."
    ],
    answer: 1,
    explanation: "A SHAP value for feature j in prediction i represents how much feature j contributed to pushing the prediction from the baseline (mean prediction) to the actual prediction for that sample. Mean |SHAP| across training samples gives a global feature importance that is model-agnostic and theoretically grounded. Features with mean |SHAP| ≈ 0 contribute nothing and can be safely removed."
  },
  {
    id: 105,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "A data scientist wants to log a custom Python class as an MLflow model so it can be served via the pyfunc flavor. Which approach is correct?",
    options: [
      "Subclass `mlflow.pyfunc.PythonModel` and implement the `predict(context, model_input)` method. Log it with `mlflow.pyfunc.log_model('model', python_model=MyCustomModel(), artifacts={...})`.  ",
      "Pickle the custom class with `pickle.dump()` and log the pickle file as an artifact using `mlflow.log_artifact()`.",
      "Implement a `__call__` method in the class and log it with `mlflow.sklearn.log_model()`.",
      "Register the class as a Spark UDF and log it with `mlflow.spark.log_model()`."
    ],
    answer: 0,
    explanation: "To log a custom Python object as an MLflow pyfunc model, subclass mlflow.pyfunc.PythonModel and implement predict(context, model_input). The context provides access to artifacts (e.g., a serialized model file). Log with mlflow.pyfunc.log_model(), specifying the python_model instance and any artifacts (paths to serialized objects). This creates a standardized serving interface."
  },
  {
    id: 106,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "You need to perform distributed hyperparameter optimization using Ray Tune on a Databricks cluster. How does Ray Tune compare to Hyperopt SparkTrials for Databricks-native integration?",
    options: [
      "Ray Tune and Hyperopt SparkTrials are identical; both use the same Spark task scheduling backend.",
      "Hyperopt SparkTrials is the native Databricks integration — it uses Spark tasks directly. Ray Tune requires setting up a Ray cluster separately (using ray.init() with the Spark cluster's head node address), adding operational overhead but providing more advanced scheduling algorithms (ASHA, PBT).",
      "Ray Tune is the recommended tool for Databricks because it integrates with Databricks ML Runtime out-of-the-box with zero configuration.",
      "Ray Tune can only be used with TensorFlow models; Hyperopt SparkTrials is required for scikit-learn."
    ],
    answer: 1,
    explanation: "Hyperopt SparkTrials is the native path: it submits HPO trials as Spark tasks with no extra cluster configuration. Ray Tune requires launching a Ray cluster (ray.init()) before use, which adds complexity but offers scheduling algorithms like ASHA (early stopping for bad trials) and PBT (population-based training) not available in Hyperopt."
  },
  {
    id: 107,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "A model trained on last year's data shows strong validation performance but degrades significantly in production after 2 months. What type of problem is this, and what is the long-term mitigation strategy?",
    options: [
      "This is overfitting. Reduce model complexity and retrain with stronger regularization.",
      "This is concept drift — the statistical relationship between features and the target has changed over time as real-world behavior evolves. Mitigate by implementing continuous model monitoring (tracking prediction distribution and model performance), and automating retraining triggers when drift is detected.",
      "This is training-serving skew caused by different preprocessing in the training pipeline versus the serving pipeline.",
      "This is label noise in the training data causing inconsistent model behavior under distribution shift."
    ],
    answer: 1,
    explanation: "Concept drift occurs when the joint distribution P(Y|X) changes over time — the relationship between features and the target evolves (e.g., user behavior changes, economic conditions shift). The mitigation strategy is a monitoring pipeline that tracks feature distribution and prediction accuracy, combined with automated retraining triggers. This differs from data drift (P(X) changes) where only input distributions shift."
  },
  {
    id: 108,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "You are comparing two feature engineering approaches: raw features vs. feature-crossed polynomial features. Validation AUC is 0.82 for raw and 0.85 for polynomial. What additional factors should you consider before selecting the polynomial approach?",
    options: [
      "The polynomial approach is strictly better since it has higher AUC. Ship it.",
      "Consider training time, inference latency, model size, risk of overfitting (especially if the polynomial expansion greatly increases dimensionality), and interpretability. Higher AUC on validation may not persist if the polynomial features overfit subtly — check performance on a holdout test set and monitor production metrics.",
      "Check only the training AUC — if both models have similar training AUC, the polynomial approach overfits and should be rejected.",
      "Run a paired t-test on cross-validation fold AUCs; if p < 0.05 the polynomial model is significantly better."
    ],
    answer: 1,
    explanation: "AUC lift of 0.03 is real but the evaluation must be holistic: (1) Test set performance (not just validation) to check for validation overfitting; (2) Inference latency — polynomial features increase dimensionality; (3) Model size and serving cost; (4) Interpretability — polynomial features are harder to explain; (5) Production monitoring plan. Statistical significance testing (option D) is valid additional analysis but insufficient alone."
  },
  {
    id: 109,
    cert: "professional",
    domain: "Section 1: Experimentation",
    question: "You are designing an offline evaluation pipeline for a recommendation model. The evaluation metric is NDCG@10. What is a key challenge with offline evaluation of ranking models, and how do you address it?",
    options: [
      "NDCG@10 cannot be computed offline; it requires a live A/B test to measure click-through rates.",
      "Offline evaluation of ranking models suffers from exposure bias: the evaluation set only contains user interactions with items that were shown (historical policy), not items the new model might have ranked higher. Mitigate with counterfactual evaluation techniques (inverse propensity scoring) or caution offline metrics by always validating improvements with online A/B tests.",
      "Offline ranking evaluation is only valid when the test set contains at least 1M user interactions.",
      "NDCG@10 requires the full item catalog to be ranked for each user, making offline evaluation computationally infeasible at scale."
    ],
    answer: 1,
    explanation: "Exposure bias is the fundamental offline evaluation challenge for ranking: historical data only records interactions with items the old model showed. A new model that would rank previously-unexposed relevant items highly cannot be rewarded by offline metrics. Inverse propensity scoring adjusts for this by reweighting observations, but the gold standard is online A/B testing with real user feedback."
  },

  // =========================================================================
  // PROFESSIONAL — Section 2: Model Lifecycle Management (30%)
  // =========================================================================
  {
    id: 110,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "Your organization uses Unity Catalog. A model trained in workspace A needs to be discoverable and deployable from workspace B in the same metastore. What is the correct approach in Unity Catalog?",
    options: [
      "Export the model artifact from the workspace A MLflow experiment as a ZIP file and import it into workspace B manually.",
      "Register the model in the Unity Catalog model registry (not the workspace-local registry) using the three-level namespace `catalog.schema.model_name`. Workspace B can then load it via `mlflow.pyfunc.load_model('models:/catalog.schema.model_name/version')` without any data movement.",
      "Use Databricks CLI to copy the model from workspace A's DBFS to workspace B's DBFS.",
      "Grant workspace B users the `CAN_READ` permission on workspace A's MLflow experiment."
    ],
    answer: 1,
    explanation: "Unity Catalog model registry provides cross-workspace model governance. Registering in UC (using `catalog.schema.model_name` namespace) makes the model available to all workspaces sharing the same metastore. Users in workspace B load the model using the same URI. This is the recommended approach for multi-workspace organizations vs. workspace-local MLflow registry."
  },
  {
    id: 111,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "You need to implement an automated model validation gate: before a model is promoted from Staging to Production in the Model Registry, it must achieve AUC > 0.85 on a held-out validation dataset. How should this be implemented?",
    options: [
      "Add a manual approval step in Jira where a data scientist reviews the AUC value and clicks 'Approve'.",
      "Use a Databricks Job (or CI pipeline step) that: (1) loads the Staging model via mlflow.pyfunc.load_model, (2) evaluates it on the validation dataset, (3) if AUC > 0.85 calls client.transition_model_version_stage() to promote to Production, else archives the model and sends an alert.",
      "Configure the Model Registry's `min_auc` threshold in the Databricks workspace settings YAML.",
      "Use a Model Registry webhook that triggers an HTTP callback; handle the promotion logic in the external system."
    ],
    answer: 1,
    explanation: "Automated validation gates are implemented as Databricks Jobs (or CI steps): load the Staging model, evaluate on a fixed validation set, and programmatically promote/reject via the MLflow client API. Webhooks (option D) can trigger the validation job on registry events, but the validation and promotion logic still runs in the Databricks Job — both approaches can be combined."
  },
  {
    id: 112,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "A team wants to receive a Slack notification whenever a model version is promoted to Production in the MLflow Model Registry. What Databricks mechanism supports this?",
    options: [
      "Configure an email alert in the Databricks workspace admin settings to notify on Model Registry stage changes.",
      "Create a Model Registry webhook that triggers on the `TRANSITION_REQUEST_CREATED` or `MODEL_VERSION_TRANSITIONED_STAGE` event and calls a Slack webhook URL or a Databricks Job that sends the Slack message.",
      "Use a Delta Live Tables pipeline that monitors the model registry audit log table and triggers a notification pipeline.",
      "Add a `mlflow.set_tag('notify_slack', 'true')` call after each transition — the registry automatically reads this tag."
    ],
    answer: 1,
    explanation: "MLflow Model Registry webhooks (HTTP webhooks) fire on registry events: MODEL_VERSION_CREATED, MODEL_VERSION_TRANSITIONED_STAGE, TRANSITION_REQUEST_CREATED, etc. You configure a webhook with the event type and a target URL (Slack incoming webhook, or a Databricks job trigger URL). This is the native mechanism for event-driven notifications and automation."
  },
  {
    id: 113,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "What is the difference between MLflow Model Registry 'aliases' and 'stages' (Staging/Production/Archived), and when should you use each?",
    options: [
      "Aliases and stages are identical; 'aliases' is the newer name for 'stages' introduced in MLflow 2.0.",
      "Stages (Staging/Production/Archived) are a fixed set of three lifecycle labels that can only be assigned to one version per stage at a time. Aliases are user-defined named pointers (e.g., 'champion', 'challenger', 'shadow') that can coexist and map to any version. Aliases are more flexible and are the preferred approach in Unity Catalog.",
      "Stages require approval workflows; aliases are assigned immediately without any review process.",
      "Aliases can only be created by workspace admins; stages can be set by any user with Can Manage permissions."
    ],
    answer: 1,
    explanation: "Stages (Staging/Production/Archived) are a fixed enum with one version per stage — promoting v3 to Production automatically demotes v2. Aliases are user-defined: you can have 'champion', 'challenger', and 'shadow' pointing to different versions simultaneously. Unity Catalog model registry uses aliases as the primary mechanism (stages are deprecated in UC). Aliases provide more flexibility for champion/challenger and A/B testing workflows."
  },
  {
    id: 114,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "Describe the CI/CD pipeline for an ML model from code commit to production deployment on Databricks.",
    options: [
      "Git push → manually run the training notebook → manually test in Databricks notebook → manually promote in Model Registry UI.",
      "Git push → CI triggers Databricks job (training + evaluation) → if evaluation passes, model registers in Model Registry with Staging alias → CD stage runs validation job → if validation passes, alias updated to Production → downstream serving picks up the new Production alias.",
      "Git push → Docker build → push image to ECR → redeploy Kubernetes serving pods.",
      "Git push → MLflow autolog captures the change → model is automatically promoted to Production if no errors occur during the notebook run."
    ],
    answer: 1,
    explanation: "A proper MLOps CI/CD pipeline: (1) Code push triggers CI (GitHub Actions, Azure DevOps, etc.); (2) CI runs the training Databricks job, logs to MLflow; (3) CI runs an evaluation job — if metrics pass, registers/promotes model to Staging; (4) CD runs a validation job against a held-out test set; (5) If validation passes, updates alias to Production; (6) Downstream serving reloads the Production alias. This enables automated, auditable model deployment."
  },
  {
    id: 115,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "How does MLflow track model lineage — specifically, which training run produced a registered model version?",
    options: [
      "MLflow does not track lineage; you must manually maintain a spreadsheet mapping run IDs to model versions.",
      "When registering a model with `mlflow.register_model(model_uri, name)` or `mlflow.log_model(..., registered_model_name=name)`, MLflow automatically stores the source run ID in the model version metadata. In the UI you can click a model version and see the originating run, including all its logged parameters, metrics, and code version.",
      "MLflow stores lineage in a separate audit database that must be configured by the workspace admin.",
      "Model lineage is tracked via Delta Lake transaction log — every model write creates a Delta commit entry."
    ],
    answer: 1,
    explanation: "MLflow Model Registry automatically links each model version to its source MLflow run. The model version metadata stores the source_run_id, run_link, and source artifact URI. In the registry UI, clicking a version shows the originating run with all its parameters, metrics, and artifact. This provides end-to-end lineage: data → run → model version → deployment."
  },
  {
    id: 116,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "A model version in Production is found to have a critical bug. What is the fastest safe rollback strategy in the MLflow Model Registry?",
    options: [
      "Delete the Production model version, retrain from scratch, and register the new version.",
      "Update the 'champion' alias (or Production stage) to point to the previous known-good model version — this is an instantaneous metadata update. Downstream services loading models by alias/stage immediately serve the previous version without any redeployment.",
      "Deploy a hotfix by modifying the model artifact directly in the artifact store.",
      "Create a new experiment, retrain with the previous code commit, and register as a new version."
    ],
    answer: 1,
    explanation: "Rolling back by updating the alias/stage pointer is the fastest safe operation — it's a metadata update (sub-second) with no artifact movement. Downstream services that load models dynamically via `models:/MyModel/Production` immediately serve the previous version on next load. This is why alias-based routing is preferred over hardcoded model version IDs in serving code."
  },
  {
    id: 117,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "You are implementing a champion/challenger framework. The champion model serves 90% of production traffic and the challenger model serves 10%. After 2 weeks, the challenger shows +3% AUC improvement. What is the recommended promotion workflow?",
    options: [
      "Immediately delete the champion model and replace it with the challenger at 100% traffic.",
      "Gradually increase challenger traffic (e.g., 10% → 25% → 50% → 100%) while monitoring latency, error rate, and business KPIs at each step. When confident, update the Production alias to the challenger version and archive the champion. Rollback is available at any step by reverting the alias.",
      "The challenger needs to run for at least 6 months before any traffic increase is considered safe.",
      "Create a new ensemble model combining champion and challenger predictions at a 50/50 ratio and register it as the new champion."
    ],
    answer: 1,
    explanation: "Safe promotion uses gradual traffic shifting (canary/progressive rollout): increase challenger traffic in stages while monitoring production metrics. This detects issues (latency spikes, unexpected prediction patterns, business metric drops) before 100% exposure. The alias swap is the final step — atomic, instant, and easily reversible. Monitoring at each stage is critical."
  },
  {
    id: 118,
    cert: "professional",
    domain: "Section 2: Model Lifecycle Management",
    question: "A model needs to be governed with approval-required stage transitions: a senior data scientist must approve before a model moves from Staging to Production. Which MLflow Model Registry feature supports this workflow?",
    options: [
      "Set the `require_approval=True` flag in the workspace MLflow configuration YAML.",
      "Use the 'Request Transition' workflow in the MLflow Model Registry: any user with Can Manage permissions can request a stage transition, while only users with approval authority (Can Manage Staging/Production permissions) can approve/reject. Combine with a webhook to notify approvers.",
      "Use Databricks workspace permissions to restrict the MLflow registry to read-only for non-admin users.",
      "Implement approval by adding a mandatory code review step in the Git PR process before the training job runs."
    ],
    answer: 1,
    explanation: "MLflow Model Registry has a built-in approval workflow: users 'request' a stage transition (writes a pending transition request), and designated approvers 'approve' or 'reject' it. The TRANSITION_REQUEST_CREATED webhook event can notify approvers via Slack/email. Access control is managed via Databricks permissions on the registered model (CAN_MANAGE_STAGING_VERSIONS, CAN_MANAGE_PRODUCTION_VERSIONS)."
  },

  // =========================================================================
  // PROFESSIONAL — Section 3: Model Deployment (25%)
  // =========================================================================
  {
    id: 119,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "You need to score 500 million customer records daily. Predictions must be available by 6 AM for the marketing team. Which deployment pattern is most appropriate?",
    options: [
      "Real-time Model Serving with a REST endpoint — the marketing team queries the endpoint for each customer record at 6 AM.",
      "Batch inference using a Databricks Job scheduled to run overnight: load the model via mlflow.pyfunc, apply it to the customer DataFrame using a Pandas UDF, and write predictions to a Delta table that the marketing team reads at 6 AM.",
      "Spark Structured Streaming reading from a Kafka topic and writing predictions to a Delta table continuously.",
      "Deploy the model as a Databricks SQL UDF that the marketing team calls in a SELECT statement each morning."
    ],
    answer: 1,
    explanation: "Batch inference overnight is correct for this use case: 500M records, daily cadence, 6 AM SLA. Run a scheduled Databricks Job that reads all customer records from Delta Lake, applies the model with a Pandas UDF (vectorized, parallelized across all workers), and writes predictions to a Delta table. Real-time serving would be over-engineered for a daily batch need and costly at this scale."
  },
  {
    id: 120,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "A fraud detection system must score transactions within 50ms of occurrence, 24/7. Which deployment pattern is required?",
    options: [
      "Batch inference job running every 5 minutes — 5-minute latency is acceptable for fraud detection.",
      "Databricks Model Serving (real-time REST endpoint) with auto-scaling. The transaction system calls the endpoint synchronously for each transaction. Target <50ms p99 latency requires selecting an appropriate instance type and pre-warming the endpoint.",
      "Spark Structured Streaming job reading transactions from a Kafka topic and writing fraud scores to Delta Lake.",
      "A Python Flask app hosted on the Databricks driver node serving predictions over HTTP."
    ],
    answer: 1,
    explanation: "50ms latency with 24/7 availability requires real-time serving. Databricks Model Serving provides a managed REST endpoint with auto-scaling, serving the model as a REST API. The application calls the endpoint per-transaction synchronously. Streaming (option C) has higher latency (seconds to minutes). Batch scoring (option A) has minutes of latency. The driver-node Flask app (option D) is not production-grade."
  },
  {
    id: 121,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "You want to use Databricks Feature Store at inference time with a real-time Model Serving endpoint. The serving endpoint should look up the latest feature values for an incoming entity ID. How is this configured?",
    options: [
      "The model must be logged with `mlflow.sklearn.log_model()` — only sklearn models support Feature Store integration at serving time.",
      "Log the model with `FeatureStoreClient.log_model()` (or with Feature Store metadata attached). The serving endpoint is configured with the feature retrieval spec, so at request time it automatically looks up the latest feature values from the online feature store (e.g., DynamoDB, Cosmos DB) using the entity ID in the request.",
      "Pass all feature values in the REST request body — Feature Store lookups at serving time require sending all feature values explicitly.",
      "Use a pre-compute job that runs every minute and writes feature values to a Redis cache; the model code reads from Redis directly."
    ],
    answer: 1,
    explanation: "Databricks Feature Store supports online inference by logging models with feature lookup metadata via FeatureStoreClient.log_model(). When deployed to Model Serving, the endpoint receives only the entity primary key in the request; it automatically looks up feature values from the configured online store (e.g., DynamoDB, Cosmos DB, or Databricks-managed online tables) and passes them to the model for prediction."
  },
  {
    id: 122,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "You need to run near-real-time inference on a stream of IoT sensor events arriving via Kafka. Predictions must be written to Delta Lake within 30 seconds of event arrival. Which approach is correct?",
    options: [
      "Deploy a Databricks Model Serving endpoint and have the Kafka consumer application call the endpoint per event.",
      "Use Spark Structured Streaming to read from the Kafka source, apply the model using `mlflow.pyfunc.spark_udf()` (registers the model as a Spark UDF for native Structured Streaming integration), and write predictions to Delta Lake with a foreachBatch or append-mode sink.",
      "Use an Apache Flink job on a separate cluster for all streaming ML inference — Spark Structured Streaming cannot call MLflow models.",
      "Write a Databricks Job that polls the Kafka topic every 30 seconds, processes a batch, and writes to Delta."
    ],
    answer: 1,
    explanation: "mlflow.pyfunc.spark_udf() creates a Spark UDF from an MLflow model that can be called directly in Structured Streaming. The pattern: read from Kafka source → apply spark_udf to the feature columns → write predictions to Delta with foreachBatch or streaming append. This achieves seconds-latency with full Spark cluster parallelism and native Delta Lake integration."
  },
  {
    id: 123,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "A Databricks Model Serving endpoint shows high p99 latency during traffic spikes. What are the two primary levers to address this, and what are their trade-offs?",
    options: [
      "Decrease the model complexity (fewer parameters) and reduce the feature count — simpler models always have lower latency.",
      "Horizontal scaling (increase `scale_to_zero_enabled=False` and set higher `max_provisioned_throughput`) to add more serving replicas, reducing queuing. Or vertical scaling (select a larger instance type with more CPU/GPU/RAM) to reduce per-request processing time. Trade-off: horizontal scaling adds replicas (linear cost increase); vertical scaling increases per-replica cost but helps latency-bound bottlenecks.",
      "Enable model quantization (FP16 instead of FP32) — Databricks automatically does this when latency spikes are detected.",
      "Reduce the Kafka consumer lag by increasing the number of Kafka partitions to reduce the load on the endpoint."
    ],
    answer: 1,
    explanation: "High p99 latency under spikes has two causes: queuing (too few replicas for concurrent requests) and per-request compute time. Horizontal scaling (more replicas) reduces queuing. Vertical scaling (larger instances, GPU) reduces per-request time. For latency-sensitive endpoints, also consider: model optimization (ONNX, TensorRT), input batching configuration, and removing scale-to-zero to eliminate cold-start latency."
  },
  {
    id: 124,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "You are running an A/B test between model v1 (champion) and model v2 (challenger) using Databricks Model Serving. What is the recommended architecture?",
    options: [
      "Deploy v1 and v2 on separate endpoints with different URLs; split traffic in the application code using a random coin flip.",
      "Deploy both models on the same Databricks Model Serving endpoint using traffic split configuration: set v1 to 90% traffic and v2 to 10%. The endpoint routes requests automatically. Log a model version tag in the response payload to attribute outcomes to each version.",
      "Train an ensemble model combining v1 and v2 predictions at deployment time; the ensemble IS the A/B test.",
      "Use Databricks Experiments to create an A/B test run — Experiments natively route production traffic between models."
    ],
    answer: 1,
    explanation: "Databricks Model Serving supports multi-model traffic splitting on a single endpoint: configure version weights (e.g., 90/10). The endpoint routes requests randomly according to weights, returning predictions from the selected model. This is simpler than separate endpoints and avoids client-side routing complexity. Include model version in response metadata to enable outcome attribution in downstream analysis."
  },
  {
    id: 125,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "How should you structure batch inference code to maximize throughput when scoring 1 billion records with a scikit-learn model?",
    options: [
      "Use a single-node cluster (driver only) with 64 cores — Spark overhead reduces throughput for sklearn models.",
      "Use `mlflow.pyfunc.spark_udf(spark, model_uri, result_type=...)` to register the model as a vectorized Pandas UDF, broadcast the loaded model to all workers (or let spark_udf handle loading), then apply the UDF in a `df.withColumn('prediction', model_udf(*feature_cols))` call on the full Spark DataFrame. Use appropriate partition count (cluster_cores * 2-4).",
      "Convert the DataFrame to Parquet, distribute files to workers manually using Databricks dbutils.fs, and run sklearn in subprocess on each file.",
      "Use PySpark's `rdd.map()` with a Python lambda calling model.predict() for row-by-row inference."
    ],
    answer: 1,
    explanation: "mlflow.pyfunc.spark_udf() is the standard pattern. It loads the model on each worker (lazy loading with broadcast), applies it in vectorized batches (Pandas Series), and integrates natively with Spark's execution engine. The key optimizations: use spark_udf (vectorized, not row-by-row), repartition to match available cores (2-4x cores), and ensure the model is small enough to broadcast. rdd.map() (option D) is row-by-row Python UDF — 10-100x slower."
  },
  {
    id: 126,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "What is the purpose of `mlflow.models.predict()` and how does it differ from loading a model and calling `.predict()` directly?",
    options: [
      "They are identical — mlflow.models.predict() is just a convenience wrapper.",
      "mlflow.models.predict() is a CLI/Python utility for testing model predictions outside a serving context, applying the full MLflow model (including any pre/post-processing defined in the pyfunc wrapper) to input data. It is useful for local testing and validation before deploying. Loading and calling .predict() directly bypasses the pyfunc wrapper if the model was logged with custom pre/post-processing logic.",
      "mlflow.models.predict() only works with models registered in the Model Registry; loaded models use .predict() directly.",
      "mlflow.models.predict() runs inference in a separate container matching the model's conda environment, ensuring environment parity."
    ],
    answer: 1,
    explanation: "mlflow.models.predict() runs predictions through the full MLflow pyfunc interface (including any pre/post-processing defined in the PythonModel.predict() method or conda env). It's primarily used for local validation before serving deployment. When you load a model and call .predict() on the raw model object (e.g., a sklearn model), you skip the pyfunc wrapper and any custom logic wrapped around it."
  },
  {
    id: 127,
    cert: "professional",
    domain: "Section 3: Model Deployment",
    question: "A model deployed to Databricks Model Serving returns predictions correctly but the p50 latency is 800ms for a simple tabular model. What are the most likely root causes and how do you diagnose them?",
    options: [
      "800ms is normal for any deployed ML model — production models always have higher latency than development.",
      "Likely causes: (1) Cold start — the endpoint scaled to zero and is loading the model on first request; check if scale-to-zero is enabled. (2) Instance type — CPU-only instance may be undersized for the model's inference compute. (3) Feature preprocessing in the model pyfunc is slow. Diagnose using Databricks endpoint serving logs, request traces, and profiling the model's predict() locally.",
      "The 800ms latency is caused by MLflow's model format — convert to ONNX to reduce inference time.",
      "The Delta Lake sink in the serving pipeline is causing the latency — move to an in-memory database."
    ],
    answer: 1,
    explanation: "800ms p50 for a simple tabular model is unusually high. The main suspects: (1) Scale-to-zero cold start — the first request after idle pays container startup time; disable scale-to-zero or configure minimum replicas; (2) Undersized instance; (3) Slow preprocessing in the pyfunc wrapper (check with local profiling); (4) Network latency to the endpoint. Start by checking serving logs for cold-start indicators and profiling predict() locally."
  },

  // =========================================================================
  // PROFESSIONAL — Section 4: Solution and Data Monitoring (15%)
  // =========================================================================
  {
    id: 128,
    cert: "professional",
    domain: "Section 4: Solution & Data Monitoring",
    question: "A production churn model's false negative rate has increased from 15% to 35% over 6 months without any model change. What type of drift is most likely occurring, and how do you confirm it?",
    options: [
      "This is software drift — a Databricks Runtime upgrade changed the model's behavior. Roll back the runtime version.",
      "This is likely concept drift (P(Y|X) changed) or data drift (P(X) changed), or both. Confirm by: (1) comparing the distribution of input features in current production data vs. training data (data drift); (2) if you have ground-truth labels with delay, compute model accuracy on labeled production samples and compare to validation baseline (concept drift). Use Databricks Lakehouse Monitoring to automate these distribution comparisons.",
      "This is label drift — the definition of 'churned' changed in the data warehouse. Re-label training data.",
      "False negative rate increase always indicates overfitting — retrain with stronger L2 regularization."
    ],
    answer: 1,
    explanation: "Unexplained performance degradation without code changes is the signature of drift. Data drift (input feature distributions shifted) or concept drift (the feature-label relationship changed) are the prime suspects. Diagnosis: compute PSI/KL divergence on feature distributions vs. training baseline (data drift), and compute delayed-label accuracy on production samples (concept drift). Databricks Lakehouse Monitoring automates distribution tracking on Delta tables."
  },
  {
    id: 129,
    cert: "professional",
    domain: "Section 4: Solution & Data Monitoring",
    question: "You are setting up Databricks Lakehouse Monitoring on a Delta table that stores model predictions. What does Lakehouse Monitoring automatically compute, and how is it surfaced?",
    options: [
      "Lakehouse Monitoring trains a monitoring model that detects anomalies in the prediction column using unsupervised learning.",
      "Lakehouse Monitoring automatically computes statistical profiles (mean, stddev, null rates, quantiles, data type distributions) and drift metrics (compared to a baseline window) on the monitored Delta table's columns. Results are written to companion Delta tables (profile metrics and drift metrics) and surfaced in a pre-built Databricks SQL monitoring dashboard.",
      "Lakehouse Monitoring integrates with Grafana to push monitoring metrics in real-time to external observability platforms.",
      "Lakehouse Monitoring only monitors schema changes (column additions/deletions), not value distributions."
    ],
    answer: 1,
    explanation: "Databricks Lakehouse Monitoring (as of DBR 12.2+) profiles Delta table columns: statistical summaries and drift comparisons vs. a baseline window. It writes results to profile_metrics and drift_metrics Delta tables and generates a pre-built DBSQL dashboard. You can set alert thresholds on drift metrics to trigger retraining pipelines or notifications."
  },
  {
    id: 130,
    cert: "professional",
    domain: "Section 4: Solution & Data Monitoring",
    question: "What is Population Stability Index (PSI) and when is it used in ML monitoring?",
    options: [
      "PSI is a model evaluation metric for classification tasks, equivalent to F1-score.",
      "PSI is a statistical measure of how much a feature's distribution has shifted between the training baseline and current production data. PSI < 0.1 indicates no significant shift, 0.1–0.2 moderate shift, > 0.2 significant shift requiring investigation. It is used to detect data drift in continuous and categorical features.",
      "PSI measures the stability of gradient descent convergence — high PSI means the optimizer is stuck in a local minimum.",
      "PSI is a prediction interval metric that quantifies model uncertainty at a per-sample level."
    ],
    answer: 1,
    explanation: "Population Stability Index (PSI) quantifies distributional shift between two populations (baseline vs. current). Formula: PSI = Σ (P_current - P_expected) × ln(P_current / P_expected) over bins. Thresholds: <0.1 stable, 0.1-0.25 slight shift (monitor), >0.25 major shift (investigate and retrain). Widely used in financial ML and production monitoring for detecting feature drift."
  },
  {
    id: 131,
    cert: "professional",
    domain: "Section 4: Solution & Data Monitoring",
    question: "You want to automate model retraining when data drift is detected. Design the end-to-end monitoring and retraining pipeline on Databricks.",
    options: [
      "Train the model to be robust to distribution shift using adversarial training; retraining is never needed.",
      "Pipeline: (1) Lakehouse Monitoring computes PSI on prediction and feature distributions daily; (2) A DBSQL Alert triggers when PSI > 0.25 on any monitored feature; (3) Alert fires a webhook to a Databricks Job that runs the full training pipeline with fresh data; (4) The training job registers the new model version in the Model Registry; (5) An automated validation job evaluates the new version and promotes to Production if metrics pass.",
      "Set a calendar-based retraining schedule (every month regardless of drift) using a Databricks Job scheduled trigger.",
      "Use AutoML triggered retraining — AutoML monitors its own experiments and retrains automatically when a new best model is found."
    ],
    answer: 1,
    explanation: "The event-driven retraining pipeline: Monitoring (Lakehouse Monitoring or custom drift job) → Alert on threshold breach → Trigger training job → Evaluate new model → Auto-promote if validation passes. This is superior to calendar-based retraining (option C) because it retriggers only when needed (reducing compute cost) and more timely than waiting for a scheduled date."
  },
  {
    id: 132,
    cert: "professional",
    domain: "Section 4: Solution & Data Monitoring",
    question: "Your team needs to detect when the model's prediction distribution shifts significantly — not just input features. For example, if the churn prediction rate suddenly changes from 5% to 25%. What monitoring approach handles this?",
    options: [
      "Monitor input feature drift only — prediction distribution shifts are always caused by input feature changes.",
      "Monitor the prediction column distribution directly using Lakehouse Monitoring or a custom monitoring job: track the mean/distribution of the prediction column (and probability scores) over rolling windows and compare to a baseline. A sudden shift in predicted churn rate from 5% to 25% triggers an alert even if individual features haven't changed significantly.",
      "Use MLflow's built-in prediction monitoring dashboard, which tracks prediction distributions automatically for all registered models.",
      "Set a business rule alert in Databricks SQL: if daily predicted churn count > 2x the 30-day average, send an alert."
    ],
    answer: 1,
    explanation: "Monitoring the prediction distribution (output drift) is a critical supplement to input feature monitoring. A sudden shift in predicted positive rate (churn from 5% → 25%) is a strong signal of either input drift, concept drift, or a data pipeline bug — even if no individual feature shows significant PSI. Lakehouse Monitoring can monitor the prediction column as just another feature column. Option D (business rule) is a valid complementary alert but less statistically rigorous."
  }
];

// Export to window object for browser access
if (typeof window !== "undefined") {
  window.PRACTICE_QUESTIONS = PRACTICE_QUESTIONS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PRACTICE_QUESTIONS };
}
