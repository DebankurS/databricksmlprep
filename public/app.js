// Databricks ML Certification Study Dashboard — Application Logic

// =========================================================================
// 1. CERT DATA CONSTANTS
// =========================================================================

const CERT_DATA = {
  associate: {
    name: 'ML Associate',
    examLabel: 'Associate Coverage',
    sectionCount: '5 Sections',
    officialGuideUrl: 'https://www.databricks.com/learn/certification/machine-learning-associate',
    domains: [
      {
        id: 1, code: 'S1',
        title: 'Section 1: Databricks Machine Learning Platform',
        subtitle: 'AutoML, Feature Store, Databricks Runtime for ML. Weighted 29% of exam.',
        items: [
          { id: 'a_s1_1', text: 'Use Databricks AutoML to train classification, regression, and forecasting models without manual training code.' },
          { id: 'a_s1_2', text: 'Inspect AutoML experiment output: best trial notebook, MLflow experiment, and generated SHAP explanations.' },
          { id: 'a_s1_3', text: 'Register and retrieve features in the Databricks Feature Store with primary keys and timestamp columns.' },
          { id: 'a_s1_4', text: 'Create training sets with point-in-time lookups using FeatureStoreClient.create_training_set().' },
          { id: 'a_s1_5', text: 'Understand Databricks Runtime for ML: pre-installed libraries (TF, PyTorch, Scikit-learn, XGBoost, MLflow).' },
          { id: 'a_s1_6', text: 'Identify when to use AutoML vs manual training vs Feature Store based on scenario requirements.' }
        ]
      },
      {
        id: 2, code: 'S2',
        title: 'Section 2: ML Workflows',
        subtitle: 'EDA, feature engineering, model training, evaluation, and selection. Weighted 29%.',
        items: [
          { id: 'a_s2_1', text: 'Apply correct encoding strategies: one-hot encoding for low cardinality, target encoding for high cardinality features.' },
          { id: 'a_s2_2', text: 'Identify and remedy overfitting (regularization, dropout, early stopping) and underfitting (more complexity).' },
          { id: 'a_s2_3', text: 'Select appropriate evaluation metrics for classification (AUC, F1, precision, recall) and regression (RMSE, MAE, R²).' },
          { id: 'a_s2_4', text: 'Implement k-fold and stratified k-fold cross-validation for model selection.' },
          { id: 'a_s2_5', text: 'Prevent data leakage: fit preprocessing (StandardScaler, imputers) only on training data, transform test with same fitted object.' },
          { id: 'a_s2_6', text: 'Handle class imbalance: class_weight parameter, SMOTE oversampling, downsampling majority class.' },
          { id: 'a_s2_7', text: 'Interpret feature importance from tree-based models and SHAP values.' }
        ]
      },
      {
        id: 3, code: 'S3',
        title: 'Section 3: Spark ML',
        subtitle: 'ML Pipelines API — transformers, estimators, cross-validation, evaluators. Weighted 22%.',
        items: [
          { id: 'a_s3_1', text: 'Distinguish Transformers (stateless, .transform()) from Estimators (.fit() → returns Model).' },
          { id: 'a_s3_2', text: 'Order Pipeline stages correctly: StringIndexer → OneHotEncoder → VectorAssembler → Estimator.' },
          { id: 'a_s3_3', text: 'Use VectorAssembler to combine numeric columns into a single features vector column.' },
          { id: 'a_s3_4', text: 'Handle unseen string labels in StringIndexer with handleInvalid="keep" or "skip".' },
          { id: 'a_s3_5', text: 'Build hyperparameter search with ParamGridBuilder + CrossValidator, interpreting the best model.' },
          { id: 'a_s3_6', text: 'Choose the correct evaluator: BinaryClassificationEvaluator (areaUnderROC), MulticlassClassificationEvaluator, RegressionEvaluator.' },
          { id: 'a_s3_7', text: 'Save and load PipelineModel with .write().overwrite().save() and PipelineModel.load().' },
          { id: 'a_s3_8', text: 'Apply Spark ML pipeline to streaming DataFrames for near-real-time scoring.' }
        ]
      },
      {
        id: 4, code: 'S4',
        title: 'Section 4: Scaling ML Models',
        subtitle: 'Distributed training (Horovod), HPO at scale (Hyperopt SparkTrials), Pandas UDFs. Weighted 11%.',
        items: [
          { id: 'a_s4_1', text: 'Use HorovodRunner(np=N) for distributed deep learning on TensorFlow/PyTorch across Spark workers.' },
          { id: 'a_s4_2', text: 'Wrap PyTorch/TF optimizer with hvd.DistributedOptimizer to enable all-reduce gradient synchronization.' },
          { id: 'a_s4_3', text: 'Configure hyperopt.fmin() with SparkTrials for parallel HPO across the cluster.' },
          { id: 'a_s4_4', text: 'Distinguish SparkTrials (parallel, Spark-distributed) from Trials (sequential, driver-only).' },
          { id: 'a_s4_5', text: 'Apply Pandas UDFs (vectorized UDFs) for scalable batch inference on Spark DataFrames.' }
        ]
      },
      {
        id: 5, code: 'S5',
        title: 'Section 5: MLflow Model Lifecycle',
        subtitle: 'Tracking, model registry, signatures, deployment patterns. Weighted 9%.',
        items: [
          { id: 'a_s5_1', text: 'Use log_param(), log_metric(), log_artifact(), and log_model() correctly for each data type.' },
          { id: 'a_s5_2', text: 'Enable mlflow.autolog() (or mlflow.sklearn.autolog()) before .fit() to auto-capture all params/metrics/model.' },
          { id: 'a_s5_3', text: 'Search and rank MLflow runs programmatically with mlflow.search_runs(order_by=[...]).' },
          { id: 'a_s5_4', text: 'Register models with mlflow.register_model() and manage stage transitions in the Model Registry.' },
          { id: 'a_s5_5', text: 'Load any registered model framework-agnostically with mlflow.pyfunc.load_model("models:/Name/Production").' },
          { id: 'a_s5_6', text: 'Define and log model signatures with mlflow.models.infer_signature() for input/output schema validation.' }
        ]
      }
    ],
    noteDocs: [
      { badge: 'S1', title: 'Databricks ML Platform', file: '01_databricks_ml_platform.md' },
      { badge: 'S2', title: 'ML Workflows',           file: '02_ml_workflows.md' },
      { badge: 'S3', title: 'Spark ML',               file: '03_spark_ml.md' },
      { badge: 'S4', title: 'Scaling ML Models',      file: '04_scaling_ml.md' },
      { badge: 'S5', title: 'MLflow Lifecycle',       file: '05_mlflow.md' }
    ],
    quizModes: [
      { value: 'associate-all',   label: 'Full Exam (35 Questions)' },
      { value: 'associate-quick', label: 'Quick Practice (10 Questions)' },
      { value: 'associate-s1',    label: 'Section 1: Databricks ML Platform' },
      { value: 'associate-s2',    label: 'Section 2: ML Workflows' },
      { value: 'associate-s3',    label: 'Section 3: Spark ML' },
      { value: 'associate-s4',    label: 'Section 4: Scaling ML Models' },
      { value: 'associate-s5',    label: 'Section 5: MLflow Lifecycle' }
    ],
    studyPlans: {
      14: [
        { day: 1, title: 'Databricks ML Platform Intro', desc: 'Explore AutoML, Feature Store, and ML Runtime capabilities.', tasks: [{ id: 'sp_a14_1_1', text: 'Read Databricks ML Platform notes', action: 'notes', target: '01_databricks_ml_platform.md' }, { id: 'sp_a14_1_2', text: 'Take Section 1 practice questions', action: 'quiz', target: 'associate-s1' }] },
        { day: 2, title: 'Feature Store Deep Dive', desc: 'Master feature registration and point-in-time lookups.', tasks: [{ id: 'sp_a14_2_1', text: 'Read Feature Store notes (S1)', action: 'notes', target: '01_databricks_ml_platform.md' }, { id: 'sp_a14_2_2', text: 'Study delta_feature_store.py snippet', action: 'playground', target: 'delta_feature_store.py' }] },
        { day: 3, title: 'ML Workflows — Feature Engineering', desc: 'Encoding, imputation, scaling, and leakage prevention.', tasks: [{ id: 'sp_a14_3_1', text: 'Read ML Workflows notes', action: 'notes', target: '02_ml_workflows.md' }, { id: 'sp_a14_3_2', text: 'Take Section 2 practice questions', action: 'quiz', target: 'associate-s2' }] },
        { day: 4, title: 'ML Workflows — Evaluation', desc: 'Metrics, cross-validation, bias-variance tradeoff.', tasks: [{ id: 'sp_a14_4_1', text: 'Review evaluation metrics in S2 notes', action: 'notes', target: '02_ml_workflows.md' }, { id: 'sp_a14_4_2', text: 'Quick Practice quiz (10 questions)', action: 'quiz', target: 'associate-quick' }] },
        { day: 5, title: 'Spark ML — Pipeline Basics', desc: 'Transformers, Estimators, and Pipeline construction.', tasks: [{ id: 'sp_a14_5_1', text: 'Read Spark ML notes', action: 'notes', target: '03_spark_ml.md' }, { id: 'sp_a14_5_2', text: 'Study spark_ml_pipeline.py snippet', action: 'playground', target: 'spark_ml_pipeline.py' }] },
        { day: 6, title: 'Spark ML — CrossValidator & Tuning', desc: 'ParamGridBuilder, CrossValidator, evaluators.', tasks: [{ id: 'sp_a14_6_1', text: 'Read Spark ML notes (tuning section)', action: 'notes', target: '03_spark_ml.md' }, { id: 'sp_a14_6_2', text: 'Take Section 3 practice questions', action: 'quiz', target: 'associate-s3' }] },
        { day: 7, title: 'Mid-Point Review', desc: 'Consolidate first half knowledge.', tasks: [{ id: 'sp_a14_7_1', text: 'Review Associate Cheat Sheets', action: 'cheatsheet', target: '' }, { id: 'sp_a14_7_2', text: 'Full practice quiz', action: 'quiz', target: 'associate-all' }] },
        { day: 8, title: 'Scaling — Horovod', desc: 'Distributed deep learning with HorovodRunner.', tasks: [{ id: 'sp_a14_8_1', text: 'Read Scaling ML Models notes', action: 'notes', target: '04_scaling_ml.md' }] },
        { day: 9, title: 'Scaling — Hyperopt & SparkTrials', desc: 'Parallel HPO across Spark workers.', tasks: [{ id: 'sp_a14_9_1', text: 'Read Hyperopt section in S4 notes', action: 'notes', target: '04_scaling_ml.md' }, { id: 'sp_a14_9_2', text: 'Take Section 4 practice questions', action: 'quiz', target: 'associate-s4' }] },
        { day: 10, title: 'MLflow Tracking', desc: 'params, metrics, artifacts, autolog.', tasks: [{ id: 'sp_a14_10_1', text: 'Read MLflow Lifecycle notes', action: 'notes', target: '05_mlflow.md' }, { id: 'sp_a14_10_2', text: 'Study mlflow_tracking.py snippet', action: 'playground', target: 'mlflow_tracking.py' }] },
        { day: 11, title: 'MLflow Model Registry', desc: 'Registration, stages, pyfunc loading.', tasks: [{ id: 'sp_a14_11_1', text: 'Review registry section in S5 notes', action: 'notes', target: '05_mlflow.md' }, { id: 'sp_a14_11_2', text: 'Take Section 5 practice questions', action: 'quiz', target: 'associate-s5' }] },
        { day: 12, title: 'Cheatsheet Review', desc: 'Quick-reference all tables and comparisons.', tasks: [{ id: 'sp_a14_12_1', text: 'Review all Associate Cheat Sheets', action: 'cheatsheet', target: '' }] },
        { day: 13, title: 'Code Pattern Deep Dive', desc: 'Walk through all 3 code snippets.', tasks: [{ id: 'sp_a14_13_1', text: 'Review spark_ml_pipeline.py', action: 'playground', target: 'spark_ml_pipeline.py' }, { id: 'sp_a14_13_2', text: 'Review delta_feature_store.py', action: 'playground', target: 'delta_feature_store.py' }] },
        { day: 14, title: 'Final Mock Exam', desc: 'Simulate full Associate exam.', tasks: [{ id: 'sp_a14_14_1', text: 'Take full 35-question mock exam', action: 'quiz', target: 'associate-all' }] }
      ],
      28: [
        { day: 1,  title: 'AutoML Overview',          desc: 'Databricks AutoML capabilities and output.',             tasks: [{ id: 'sp_a28_1_1',  text: 'Read Databricks ML Platform notes', action: 'notes', target: '01_databricks_ml_platform.md' }] },
        { day: 2,  title: 'AutoML Practice',          desc: 'Section 1 quiz: AutoML and Runtime questions.',          tasks: [{ id: 'sp_a28_2_1',  text: 'Take Section 1 questions', action: 'quiz', target: 'associate-s1' }] },
        { day: 3,  title: 'Feature Store Basics',     desc: 'Feature tables, keys, registration.',                   tasks: [{ id: 'sp_a28_3_1',  text: 'Study Feature Store notes (S1)', action: 'notes', target: '01_databricks_ml_platform.md' }] },
        { day: 4,  title: 'Feature Store Advanced',   desc: 'Point-in-time lookups, training sets.',                 tasks: [{ id: 'sp_a28_4_1',  text: 'Study delta_feature_store.py', action: 'playground', target: 'delta_feature_store.py' }] },
        { day: 5,  title: 'Feature Engineering',      desc: 'Encoding, imputation, scaling strategies.',             tasks: [{ id: 'sp_a28_5_1',  text: 'Read ML Workflows notes', action: 'notes', target: '02_ml_workflows.md' }] },
        { day: 6,  title: 'Data Leakage Prevention',  desc: 'Fit/transform patterns, leakage types.',                tasks: [{ id: 'sp_a28_6_1',  text: 'Review leakage prevention in S2 notes', action: 'notes', target: '02_ml_workflows.md' }] },
        { day: 7,  title: 'Week 1 Review',            desc: 'AutoML + Feature Store + Feature Engineering.',         tasks: [{ id: 'sp_a28_7_1',  text: 'Quick Practice quiz', action: 'quiz', target: 'associate-quick' }] },
        { day: 8,  title: 'Model Evaluation',         desc: 'Classification and regression metrics selection.',       tasks: [{ id: 'sp_a28_8_1',  text: 'Review evaluation section in S2 notes', action: 'notes', target: '02_ml_workflows.md' }] },
        { day: 9,  title: 'Class Imbalance',          desc: 'SMOTE, class weights, sampling strategies.',            tasks: [{ id: 'sp_a28_9_1',  text: 'Take Section 2 quiz', action: 'quiz', target: 'associate-s2' }] },
        { day: 10, title: 'Spark ML Basics',          desc: 'Transformer vs Estimator, VectorAssembler.',           tasks: [{ id: 'sp_a28_10_1', text: 'Read Spark ML notes', action: 'notes', target: '03_spark_ml.md' }] },
        { day: 11, title: 'Spark ML Pipelines',       desc: 'Pipeline construction and stage ordering.',             tasks: [{ id: 'sp_a28_11_1', text: 'Study spark_ml_pipeline.py', action: 'playground', target: 'spark_ml_pipeline.py' }] },
        { day: 12, title: 'Spark ML Evaluation',      desc: 'Evaluators and CrossValidator.',                       tasks: [{ id: 'sp_a28_12_1', text: 'Take Section 3 quiz', action: 'quiz', target: 'associate-s3' }] },
        { day: 13, title: 'StringIndexer Nuances',    desc: 'handleInvalid, model save/load.',                      tasks: [{ id: 'sp_a28_13_1', text: 'Review StringIndexer section in S3 notes', action: 'notes', target: '03_spark_ml.md' }] },
        { day: 14, title: 'Week 2 Review',            desc: 'Spark ML deep review.',                                tasks: [{ id: 'sp_a28_14_1', text: 'Review Cheat Sheets', action: 'cheatsheet', target: '' }] },
        { day: 15, title: 'Horovod Distributed DL',   desc: 'HorovodRunner, DistributedOptimizer.',                 tasks: [{ id: 'sp_a28_15_1', text: 'Read Scaling ML Models notes', action: 'notes', target: '04_scaling_ml.md' }] },
        { day: 16, title: 'Hyperopt Basics',          desc: 'fmin(), hp.space, TPE algorithm.',                    tasks: [{ id: 'sp_a28_16_1', text: 'Review Hyperopt section in S4 notes', action: 'notes', target: '04_scaling_ml.md' }] },
        { day: 17, title: 'SparkTrials vs Trials',    desc: 'Parallelism, driver vs worker execution.',            tasks: [{ id: 'sp_a28_17_1', text: 'Take Section 4 quiz', action: 'quiz', target: 'associate-s4' }] },
        { day: 18, title: 'Pandas UDFs',              desc: 'Batch inference at scale with vectorized UDFs.',       tasks: [{ id: 'sp_a28_18_1', text: 'Review Pandas UDF section in S4 notes', action: 'notes', target: '04_scaling_ml.md' }] },
        { day: 19, title: 'MLflow Tracking API',      desc: 'log_param, log_metric, log_artifact, autolog.',        tasks: [{ id: 'sp_a28_19_1', text: 'Read MLflow Lifecycle notes', action: 'notes', target: '05_mlflow.md' }, { id: 'sp_a28_19_2', text: 'Study mlflow_tracking.py', action: 'playground', target: 'mlflow_tracking.py' }] },
        { day: 20, title: 'MLflow Model Registry',    desc: 'Registration, stage transitions, pyfunc.',            tasks: [{ id: 'sp_a28_20_1', text: 'Take Section 5 quiz', action: 'quiz', target: 'associate-s5' }] },
        { day: 21, title: 'Week 3 Review',            desc: 'Scaling + MLflow consolidation.',                     tasks: [{ id: 'sp_a28_21_1', text: 'Quick Practice quiz', action: 'quiz', target: 'associate-quick' }] },
        { day: 22, title: 'All Cheatsheets',          desc: 'Review every cheat sheet table.',                     tasks: [{ id: 'sp_a28_22_1', text: 'Review all Associate Cheat Sheets', action: 'cheatsheet', target: '' }] },
        { day: 23, title: 'Code Deep Dive 1',         desc: 'MLflow tracking snippet walkthrough.',                 tasks: [{ id: 'sp_a28_23_1', text: 'Study mlflow_tracking.py', action: 'playground', target: 'mlflow_tracking.py' }] },
        { day: 24, title: 'Code Deep Dive 2',         desc: 'Spark ML pipeline snippet.',                          tasks: [{ id: 'sp_a28_24_1', text: 'Study spark_ml_pipeline.py', action: 'playground', target: 'spark_ml_pipeline.py' }] },
        { day: 25, title: 'Code Deep Dive 3',         desc: 'Feature Store snippet.',                              tasks: [{ id: 'sp_a28_25_1', text: 'Study delta_feature_store.py', action: 'playground', target: 'delta_feature_store.py' }] },
        { day: 26, title: 'Weak Area Review',         desc: 'Revisit lowest-scoring sections.',                    tasks: [{ id: 'sp_a28_26_1', text: 'Take full mock exam', action: 'quiz', target: 'associate-all' }] },
        { day: 27, title: 'Final Cheatsheet Pass',    desc: 'Quick final review of all reference tables.',         tasks: [{ id: 'sp_a28_27_1', text: 'Review Cheat Sheets', action: 'cheatsheet', target: '' }] },
        { day: 28, title: 'Final Mock Exam',          desc: 'Simulate full Associate exam.',                       tasks: [{ id: 'sp_a28_28_1', text: 'Take full 35-question exam', action: 'quiz', target: 'associate-all' }] }
      ]
    }
  },

  professional: {
    name: 'ML Professional',
    examLabel: 'Professional Coverage',
    sectionCount: '4 Sections',
    quizLabel: 'Databricks ML Professional Quiz Center',
    domains: [
      {
        id: 1, code: 'S1',
        title: 'Section 1: Experimentation',
        subtitle: 'Advanced feature engineering, distributed HPO, MLflow nested runs, reproducibility. Weighted 30%.',
        items: [
          { id: 'p_s1_1', text: 'Prevent temporal data leakage using point-in-time feature lookups in the Feature Store.' },
          { id: 'p_s1_2', text: 'Use Delta Lake time travel (VERSION AS OF / TIMESTAMP AS OF) to reproduce historical training data snapshots.' },
          { id: 'p_s1_3', text: 'Structure MLflow nested runs for hierarchical experiment tracking (parent per architecture, children per trial).' },
          { id: 'p_s1_4', text: 'Apply SHAP values for global feature importance and feature selection before production training.' },
          { id: 'p_s1_5', text: 'Log custom Python model classes as MLflow pyfunc models with PythonModel subclassing.' },
          { id: 'p_s1_6', text: 'Compare Hyperopt SparkTrials vs Ray Tune for distributed HPO, understanding trade-offs.' },
          { id: 'p_s1_7', text: 'Identify concept drift vs data drift vs label drift and their detection methods.' },
          { id: 'p_s1_8', text: 'Evaluate ranking models offline (NDCG@k, MAP) and understand exposure bias limitations.' }
        ]
      },
      {
        id: 2, code: 'S2',
        title: 'Section 2: Model Lifecycle Management',
        subtitle: 'MLflow Registry, Unity Catalog, CI/CD, webhooks, champion/challenger. Weighted 30%.',
        items: [
          { id: 'p_s2_1', text: 'Use Unity Catalog model registry (three-level namespace) for cross-workspace model governance.' },
          { id: 'p_s2_2', text: 'Implement automated validation gates: load Staging model, evaluate, promote/reject via MLflow client API.' },
          { id: 'p_s2_3', text: 'Configure Model Registry webhooks to trigger notifications/jobs on lifecycle events.' },
          { id: 'p_s2_4', text: 'Use model aliases (champion, challenger) vs stages, understanding Unity Catalog preference for aliases.' },
          { id: 'p_s2_5', text: 'Design end-to-end CI/CD pipeline: code push → training → Staging registration → validation → Production.' },
          { id: 'p_s2_6', text: 'Track model lineage: source run ID, code commit, and data version linked to each model version.' },
          { id: 'p_s2_7', text: 'Implement champion/challenger with gradual traffic shifts and instant alias-based rollback.' },
          { id: 'p_s2_8', text: 'Configure approval-required stage transitions using Model Registry permission roles.' }
        ]
      },
      {
        id: 3, code: 'S3',
        title: 'Section 3: Model Deployment',
        subtitle: 'Batch inference, Structured Streaming, real-time serving, Feature Store integration. Weighted 25%.',
        items: [
          { id: 'p_s3_1', text: 'Select correct deployment pattern (batch / streaming / real-time) based on latency and throughput requirements.' },
          { id: 'p_s3_2', text: 'Implement scalable batch inference using mlflow.pyfunc.spark_udf() as a vectorized Spark UDF.' },
          { id: 'p_s3_3', text: 'Configure Spark Structured Streaming inference: Kafka source → spark_udf() → Delta Lake sink.' },
          { id: 'p_s3_4', text: 'Deploy models to Databricks Model Serving with auto-scaling, traffic splits, and scale-to-zero configuration.' },
          { id: 'p_s3_5', text: 'Integrate Feature Store with Model Serving for online feature lookups at request time.' },
          { id: 'p_s3_6', text: 'Run A/B tests using multi-model traffic splitting on a single Model Serving endpoint.' },
          { id: 'p_s3_7', text: 'Diagnose high serving latency: cold starts, instance sizing, pyfunc preprocessing bottlenecks.' }
        ]
      },
      {
        id: 4, code: 'S4',
        title: 'Section 4: Solution & Data Monitoring',
        subtitle: 'Drift detection, Lakehouse Monitoring, PSI, automated retraining pipelines. Weighted 15%.',
        items: [
          { id: 'p_s4_1', text: 'Distinguish data drift (P(X)) from concept drift (P(Y|X)) from label drift (P(Y)).' },
          { id: 'p_s4_2', text: 'Set up Databricks Lakehouse Monitoring on Delta tables for automated distribution tracking.' },
          { id: 'p_s4_3', text: 'Interpret PSI thresholds: <0.1 stable, 0.1–0.25 moderate, >0.25 significant — trigger retraining.' },
          { id: 'p_s4_4', text: 'Monitor prediction distribution (output drift) as an early proxy for concept drift.' },
          { id: 'p_s4_5', text: 'Design event-driven retraining pipeline: monitoring → PSI alert → training job → validation → promotion.' }
        ]
      }
    ],
    noteDocs: [
      { badge: 'S1', title: 'Experimentation',          file: '01_experimentation.md' },
      { badge: 'S2', title: 'Model Lifecycle Mgmt',     file: '02_model_lifecycle.md' },
      { badge: 'S3', title: 'Model Deployment',          file: '03_model_deployment.md' },
      { badge: 'S4', title: 'Solution Monitoring',       file: '04_solution_monitoring.md' }
    ],
    quizModes: [
      { value: 'professional-all',   label: 'Full Exam (32 Questions)' },
      { value: 'professional-quick', label: 'Quick Practice (10 Questions)' },
      { value: 'professional-s1',    label: 'Section 1: Experimentation' },
      { value: 'professional-s2',    label: 'Section 2: Model Lifecycle Mgmt' },
      { value: 'professional-s3',    label: 'Section 3: Model Deployment' },
      { value: 'professional-s4',    label: 'Section 4: Solution Monitoring' }
    ],
    studyPlans: {
      14: [
        { day: 1,  title: 'Advanced Experimentation', desc: 'Feature engineering, leakage, reproducibility.',   tasks: [{ id: 'sp_p14_1_1', text: 'Read Experimentation notes', action: 'notes', target: '01_experimentation.md' }, { id: 'sp_p14_1_2', text: 'Take Section 1 practice questions', action: 'quiz', target: 'professional-s1' }] },
        { day: 2,  title: 'Delta + MLflow Repro',     desc: 'Time travel, nested runs, custom pyfunc.',         tasks: [{ id: 'sp_p14_2_1', text: 'Study delta_feature_store.py', action: 'playground', target: 'delta_feature_store.py' }, { id: 'sp_p14_2_2', text: 'Study mlflow_tracking.py', action: 'playground', target: 'mlflow_tracking.py' }] },
        { day: 3,  title: 'SHAP & Drift Types',       desc: 'Feature selection, concept vs data drift.',        tasks: [{ id: 'sp_p14_3_1', text: 'Review drift section in S1 notes', action: 'notes', target: '01_experimentation.md' }] },
        { day: 4,  title: 'Model Registry (UC)',       desc: 'Aliases, Unity Catalog, webhooks, CI/CD.',         tasks: [{ id: 'sp_p14_4_1', text: 'Read Model Lifecycle notes', action: 'notes', target: '02_model_lifecycle.md' }, { id: 'sp_p14_4_2', text: 'Take Section 2 practice questions', action: 'quiz', target: 'professional-s2' }] },
        { day: 5,  title: 'Validation Gates & CI',    desc: 'Automated testing, promotion, rollback.',          tasks: [{ id: 'sp_p14_5_1', text: 'Review CI/CD section in S2 notes', action: 'notes', target: '02_model_lifecycle.md' }] },
        { day: 6,  title: 'Champion/Challenger',       desc: 'Gradual rollout, alias swap, lineage.',            tasks: [{ id: 'sp_p14_6_1', text: 'Review champion/challenger in S2 notes', action: 'notes', target: '02_model_lifecycle.md' }] },
        { day: 7,  title: 'Mid-Point Review',          desc: 'Consolidate first 6 days.',                       tasks: [{ id: 'sp_p14_7_1', text: 'Quick Practice quiz', action: 'quiz', target: 'professional-quick' }, { id: 'sp_p14_7_2', text: 'Review Professional Cheat Sheets', action: 'cheatsheet', target: '' }] },
        { day: 8,  title: 'Deployment Patterns',       desc: 'Batch, streaming, real-time — when to use each.', tasks: [{ id: 'sp_p14_8_1', text: 'Read Model Deployment notes', action: 'notes', target: '03_model_deployment.md' }, { id: 'sp_p14_8_2', text: 'Take Section 3 practice questions', action: 'quiz', target: 'professional-s3' }] },
        { day: 9,  title: 'Batch & Streaming Inf.',   desc: 'spark_udf, Structured Streaming pipeline.',        tasks: [{ id: 'sp_p14_9_1', text: 'Study spark_ml_pipeline.py', action: 'playground', target: 'spark_ml_pipeline.py' }] },
        { day: 10, title: 'Model Serving',             desc: 'Real-time endpoint, autoscale, A/B testing.',      tasks: [{ id: 'sp_p14_10_1', text: 'Review serving section in S3 notes', action: 'notes', target: '03_model_deployment.md' }] },
        { day: 11, title: 'Feature Store + Serving',  desc: 'Online feature lookup at inference time.',          tasks: [{ id: 'sp_p14_11_1', text: 'Study delta_feature_store.py serving section', action: 'playground', target: 'delta_feature_store.py' }] },
        { day: 12, title: 'Monitoring & Drift',        desc: 'PSI, Lakehouse Monitoring, drift types.',           tasks: [{ id: 'sp_p14_12_1', text: 'Read Solution Monitoring notes', action: 'notes', target: '04_solution_monitoring.md' }, { id: 'sp_p14_12_2', text: 'Take Section 4 practice questions', action: 'quiz', target: 'professional-s4' }] },
        { day: 13, title: 'Retraining Pipelines',      desc: 'Event-driven retraining, alerting, automation.',   tasks: [{ id: 'sp_p14_13_1', text: 'Review retraining section in S4 notes', action: 'notes', target: '04_solution_monitoring.md' }] },
        { day: 14, title: 'Final Mock Exam',           desc: 'Simulate full Professional exam.',                 tasks: [{ id: 'sp_p14_14_1', text: 'Take full 32-question mock exam', action: 'quiz', target: 'professional-all' }] }
      ],
      28: [
        { day: 1,  title: 'Temporal Feature Safety',   desc: 'Data leakage from time in experiments.',          tasks: [{ id: 'sp_p28_1_1',  text: 'Read Experimentation notes', action: 'notes', target: '01_experimentation.md' }] },
        { day: 2,  title: 'Delta Time Travel',          desc: 'Reproducing data snapshots for experiments.',     tasks: [{ id: 'sp_p28_2_1',  text: 'Study delta_feature_store.py', action: 'playground', target: 'delta_feature_store.py' }] },
        { day: 3,  title: 'Nested MLflow Runs',         desc: 'Parent/child runs for grouped HPO trials.',      tasks: [{ id: 'sp_p28_3_1',  text: 'Study mlflow_tracking.py nested runs', action: 'playground', target: 'mlflow_tracking.py' }] },
        { day: 4,  title: 'SHAP for Feature Selection', desc: 'Global feature importance, elimination strategy.',tasks: [{ id: 'sp_p28_4_1',  text: 'Take Section 1 quiz', action: 'quiz', target: 'professional-s1' }] },
        { day: 5,  title: 'Distributed HPO',            desc: 'SparkTrials vs Ray Tune trade-offs.',            tasks: [{ id: 'sp_p28_5_1',  text: 'Review HPO section in S1 notes', action: 'notes', target: '01_experimentation.md' }] },
        { day: 6,  title: 'Drift Type Taxonomy',        desc: 'Data, concept, label drift.',                    tasks: [{ id: 'sp_p28_6_1',  text: 'Review drift section in S1 notes', action: 'notes', target: '01_experimentation.md' }] },
        { day: 7,  title: 'Week 1 Review',              desc: 'Experimentation domain consolidation.',           tasks: [{ id: 'sp_p28_7_1',  text: 'Quick Practice quiz', action: 'quiz', target: 'professional-quick' }] },
        { day: 8,  title: 'Unity Catalog Registry',     desc: 'Cross-workspace models, three-level namespace.',  tasks: [{ id: 'sp_p28_8_1',  text: 'Read Model Lifecycle notes', action: 'notes', target: '02_model_lifecycle.md' }] },
        { day: 9,  title: 'Automated Validation Gates', desc: 'Load, evaluate, promote via MLflow client.',     tasks: [{ id: 'sp_p28_9_1',  text: 'Take Section 2 quiz', action: 'quiz', target: 'professional-s2' }] },
        { day: 10, title: 'Registry Webhooks',          desc: 'Events, notifications, job triggers.',            tasks: [{ id: 'sp_p28_10_1', text: 'Review webhooks in S2 notes', action: 'notes', target: '02_model_lifecycle.md' }] },
        { day: 11, title: 'Stages vs Aliases',          desc: 'UC preference for aliases, migration.',           tasks: [{ id: 'sp_p28_11_1', text: 'Review aliases section in S2 notes', action: 'notes', target: '02_model_lifecycle.md' }] },
        { day: 12, title: 'CI/CD Design',               desc: 'End-to-end automated pipeline architecture.',     tasks: [{ id: 'sp_p28_12_1', text: 'Review Professional Cheat Sheets', action: 'cheatsheet', target: '' }] },
        { day: 13, title: 'Champion/Challenger',        desc: 'Traffic shifting, rollback strategy.',            tasks: [{ id: 'sp_p28_13_1', text: 'Review champion/challenger in S2 notes', action: 'notes', target: '02_model_lifecycle.md' }] },
        { day: 14, title: 'Week 2 Review',              desc: 'Model Lifecycle domain review.',                  tasks: [{ id: 'sp_p28_14_1', text: 'Quick Practice quiz', action: 'quiz', target: 'professional-quick' }] },
        { day: 15, title: 'Deployment Pattern Choice',  desc: 'Batch vs streaming vs real-time decision.',       tasks: [{ id: 'sp_p28_15_1', text: 'Read Model Deployment notes', action: 'notes', target: '03_model_deployment.md' }] },
        { day: 16, title: 'Batch Inference at Scale',   desc: 'spark_udf, partitioning, 1B+ records.',           tasks: [{ id: 'sp_p28_16_1', text: 'Take Section 3 quiz', action: 'quiz', target: 'professional-s3' }] },
        { day: 17, title: 'Structured Streaming Inf.',  desc: 'Kafka → spark_udf → Delta pipeline.',            tasks: [{ id: 'sp_p28_17_1', text: 'Study spark_ml_pipeline.py streaming', action: 'playground', target: 'spark_ml_pipeline.py' }] },
        { day: 18, title: 'Real-time Model Serving',    desc: 'Endpoint config, autoscale, A/B test.',           tasks: [{ id: 'sp_p28_18_1', text: 'Review serving section in S3 notes', action: 'notes', target: '03_model_deployment.md' }] },
        { day: 19, title: 'Feature Store Online Inf.',  desc: 'FS + Model Serving integration.',                 tasks: [{ id: 'sp_p28_19_1', text: 'Study delta_feature_store.py', action: 'playground', target: 'delta_feature_store.py' }] },
        { day: 20, title: 'Latency Diagnosis',          desc: 'Cold start, instance type, pyfunc perf.',         tasks: [{ id: 'sp_p28_20_1', text: 'Review latency section in S3 notes', action: 'notes', target: '03_model_deployment.md' }] },
        { day: 21, title: 'Week 3 Review',              desc: 'Model Deployment domain review.',                 tasks: [{ id: 'sp_p28_21_1', text: 'Full professional exam practice', action: 'quiz', target: 'professional-all' }] },
        { day: 22, title: 'Drift Types Deep Dive',      desc: 'Data drift vs concept drift vs label drift.',     tasks: [{ id: 'sp_p28_22_1', text: 'Read Solution Monitoring notes', action: 'notes', target: '04_solution_monitoring.md' }] },
        { day: 23, title: 'Lakehouse Monitoring',       desc: 'Profile metrics, drift metrics, dashboards.',     tasks: [{ id: 'sp_p28_23_1', text: 'Take Section 4 quiz', action: 'quiz', target: 'professional-s4' }] },
        { day: 24, title: 'PSI & Statistical Metrics',  desc: 'PSI thresholds, KL divergence, JS divergence.',  tasks: [{ id: 'sp_p28_24_1', text: 'Review PSI section in S4 notes', action: 'notes', target: '04_solution_monitoring.md' }] },
        { day: 25, title: 'Retraining Pipeline Design', desc: 'Event-driven trigger architecture.',              tasks: [{ id: 'sp_p28_25_1', text: 'Review retraining section in S4 notes', action: 'notes', target: '04_solution_monitoring.md' }] },
        { day: 26, title: 'Full Cheatsheet Review',     desc: 'All Professional reference tables.',              tasks: [{ id: 'sp_p28_26_1', text: 'Review all Professional Cheat Sheets', action: 'cheatsheet', target: '' }] },
        { day: 27, title: 'Weak Area Practice',         desc: 'Focus on lowest-scoring section.',               tasks: [{ id: 'sp_p28_27_1', text: 'Quick Practice quiz', action: 'quiz', target: 'professional-quick' }] },
        { day: 28, title: 'Final Mock Exam',            desc: 'Simulate full Professional exam.',               tasks: [{ id: 'sp_p28_28_1', text: 'Take full 32-question mock exam', action: 'quiz', target: 'professional-all' }] }
      ]
    }
  }
};

// Offline fallbacks for markdown notes (CORS / local file fallback)
const NOTES_OFFLINE_FALLBACK = {
  'associate/01_databricks_ml_platform.md': `
    <h1>Section 1: Databricks Machine Learning Platform</h1>
    <h2>1. Databricks AutoML</h2>
    <p>AutoML automatically trains multiple model types, tunes hyperparameters, generates SHAP explanations, and logs all trials to an MLflow experiment. It produces editable Python notebooks for the best trial. Use when you need a baseline model quickly without writing training code.</p>
    <h2>2. Databricks Feature Store</h2>
    <p>Centralized feature catalog backed by Delta Lake. Prevents training-serving skew by ensuring the same feature pipeline runs at both training and inference time. Supports point-in-time lookups via a timestamp column to prevent data leakage.</p>
    <ul><li><strong>Primary Key:</strong> Entity identifier (e.g., customer_id)</li>
    <li><strong>Timestamp Key:</strong> When the feature value was valid — used for point-in-time joins</li>
    <li><strong>create_training_set():</strong> Joins features to labels using the timestamp_lookup_key</li></ul>
    <h2>3. Databricks Runtime for ML</h2>
    <p>Pre-installed: TensorFlow, PyTorch, Scikit-learn, XGBoost, LightGBM, Hyperopt, MLflow. Works on CPU and GPU clusters, single-node and multi-worker.</p>`,

  'associate/02_ml_workflows.md': `
    <h1>Section 2: ML Workflows</h1>
    <h2>1. Feature Encoding</h2>
    <ul><li><strong>One-hot encoding:</strong> Low-cardinality categoricals (&lt;20 unique values)</li>
    <li><strong>Target encoding:</strong> High-cardinality categoricals with tree models — replace category with mean target value. Apply smoothing to prevent leakage on rare categories.</li></ul>
    <h2>2. Overfitting vs Underfitting</h2>
    <ul><li><strong>Overfitting:</strong> Low train error, high val error. Fix: regularization (L1/L2), dropout, early stopping, more data.</li>
    <li><strong>Underfitting:</strong> High train and val error. Fix: increase complexity, more features, fewer constraints.</li></ul>
    <h2>3. Preventing Data Leakage</h2>
    <p>Always fit preprocessors (StandardScaler, Imputer) on training data only, then apply (transform) to test. Never fit on the full dataset before splitting.</p>
    <h2>4. Class Imbalance</h2>
    <p>Options: class_weight="balanced" parameter, SMOTE oversampling, downsampling majority. Never use accuracy — use F1, precision-recall AUC.</p>`,

  'associate/03_spark_ml.md': `
    <h1>Section 3: Spark ML</h1>
    <h2>1. Transformers vs Estimators</h2>
    <p><strong>Transformer:</strong> .transform(df) — stateless or already fitted (e.g., VectorAssembler, fitted StringIndexerModel).<br>
    <strong>Estimator:</strong> .fit(df) → returns a Transformer/Model (e.g., LogisticRegression.fit() returns LogisticRegressionModel).</p>
    <h2>2. Pipeline Stage Order</h2>
    <p>StringIndexer → OneHotEncoder → VectorAssembler → ML Estimator</p>
    <h2>3. VectorAssembler</h2>
    <p>Combines multiple numeric/vector columns into a single DenseVector column ("features") required by Spark ML estimators.</p>
    <h2>4. CrossValidator</h2>
    <p>Use with ParamGridBuilder to define hyperparameter grid. Requires an Evaluator (BinaryClassificationEvaluator for AUC-ROC). Returns the best PipelineModel.</p>
    <h2>5. StringIndexer: handleInvalid</h2>
    <p>"error" (default) — throws on unseen. "keep" — assigns extra index to unseen. "skip" — drops rows with unseen labels.</p>`,

  'associate/04_scaling_ml.md': `
    <h1>Section 4: Scaling ML Models</h1>
    <h2>1. Horovod (HorovodRunner)</h2>
    <p>Distributed deep learning framework. HorovodRunner(np=N) launches N parallel training processes on Spark workers. Uses all-reduce (ring-allreduce) for gradient synchronization. Required: hvd.init(), broadcast initial weights (hvd.broadcast_parameters), wrap optimizer with hvd.DistributedOptimizer().</p>
    <h2>2. Hyperopt + SparkTrials</h2>
    <p>hyperopt.fmin(fn, space, algo=tpe.suggest, max_evals, trials=SparkTrials(parallelism=N)) — N trials run concurrently on Spark workers. Trials (default) runs sequentially on driver only. SparkTrials auto-logs to MLflow on Databricks.</p>
    <h2>3. Pandas UDF for Batch Inference</h2>
    <p>Use mlflow.pyfunc.spark_udf(spark, model_uri) to register model as a Spark UDF. Apply via df.withColumn("pred", model_udf(*feature_cols)). Vectorized — processes batches as Pandas Series, not row-by-row.</p>`,

  'associate/05_mlflow.md': `
    <h1>Section 5: MLflow Model Lifecycle</h1>
    <h2>1. Logging Functions</h2>
    <ul><li><strong>log_param(k,v):</strong> Hyperparameter set before training</li>
    <li><strong>log_metric(k,v,step=):</strong> Numeric value, can be logged per epoch</li>
    <li><strong>log_artifact(path):</strong> File or directory (plots, CSVs)</li>
    <li><strong>log_model(model, ...):</strong> Serialized model artifact</li>
    <li><strong>autolog():</strong> Auto-captures all of the above from .fit() call</li></ul>
    <h2>2. Model Registry</h2>
    <p>Stages: None → Staging → Production → Archived. Only one version per stage. Load: mlflow.pyfunc.load_model("models:/MyModel/Production"). Transition: client.transition_model_version_stage().</p>
    <h2>3. Searching Runs</h2>
    <p>mlflow.search_runs(experiment_ids=[id], order_by=["metrics.val_auc DESC"]) returns a Pandas DataFrame. First row = best run.</p>`,

  'professional/01_experimentation.md': `
    <h1>Section 1: Experimentation</h1>
    <h2>1. Preventing Temporal Data Leakage</h2>
    <p>Only use feature values from timestamps strictly before the label event. Feature Store point-in-time lookup (timestamp_lookup_key) enforces this. Delta time travel retrieves exact data snapshot for reproducibility.</p>
    <h2>2. MLflow Nested Runs</h2>
    <p>with mlflow.start_run(): # parent; inside objective: with mlflow.start_run(nested=True): # child run per trial. Creates tree structure in UI for grouped comparison.</p>
    <h2>3. SHAP for Feature Selection</h2>
    <p>Mean |SHAP| across training set = global feature importance. Features with mean |SHAP| ≈ 0 can be eliminated. Model-agnostic. Handles correlated features better than native importance.</p>
    <h2>4. Drift Types</h2>
    <p><strong>Data drift:</strong> P(X) changes. <strong>Concept drift:</strong> P(Y|X) changes — most impactful, requires retraining. <strong>Label drift:</strong> P(Y) changes.</p>`,

  'professional/02_model_lifecycle.md': `
    <h1>Section 2: Model Lifecycle Management</h1>
    <h2>1. Unity Catalog Model Registry</h2>
    <p>Three-level namespace: catalog.schema.model_name. Cross-workspace model access without data movement. Preferred over workspace-local registry for production orgs.</p>
    <h2>2. Aliases vs Stages</h2>
    <p>Stages fixed (Staging/Production/Archived), one version per stage, deprecated in UC. Aliases user-defined (champion, challenger), multiple can coexist. Load: models:/catalog.schema.Model@champion</p>
    <h2>3. Webhooks</h2>
    <p>Events: MODEL_VERSION_CREATED, MODEL_VERSION_TRANSITIONED_STAGE, TRANSITION_REQUEST_CREATED. Point to Slack webhook URL or Databricks Job URL to automate notifications and CI/CD triggers.</p>
    <h2>4. CI/CD Pattern</h2>
    <p>Git push → CI: train + register Staging → CD: validate → promote alias to Production → serving picks up new version. Rollback = update alias pointer (instantaneous).</p>`,

  'professional/03_model_deployment.md': `
    <h1>Section 3: Model Deployment</h1>
    <h2>1. Pattern Selection</h2>
    <p><strong>Batch:</strong> Daily/hourly scoring, millions-billions of records, overnight jobs. <strong>Streaming:</strong> Near-real-time (seconds), Kafka-driven, Structured Streaming + spark_udf. <strong>Real-time:</strong> &lt;100ms latency, per-request API, Model Serving endpoint.</p>
    <h2>2. Batch at Scale</h2>
    <p>mlflow.pyfunc.spark_udf(spark, model_uri) + df.withColumn("pred", udf(*cols)). Vectorized, distributed. Repartition to 2-4x cluster cores.</p>
    <h2>3. Real-time Serving</h2>
    <p>Databricks Model Serving: managed REST endpoint, auto-scaling, scale-to-zero, multi-model traffic splits for A/B testing. Feature Store integration: FS log_model() attaches online feature retrieval to endpoint.</p>
    <h2>4. Latency Diagnosis</h2>
    <p>Check: scale-to-zero cold start (disable or set min replicas), instance type sizing, slow pyfunc preprocessing, network latency.</p>`,

  'professional/04_solution_monitoring.md': `
    <h1>Section 4: Solution & Data Monitoring</h1>
    <h2>1. Drift Detection</h2>
    <p><strong>PSI:</strong> Quantifies distributional shift. &lt;0.1 stable, 0.1–0.25 moderate, &gt;0.25 major (retrain). <strong>KL/JS Divergence:</strong> Information-theoretic measures of distribution difference.</p>
    <h2>2. Databricks Lakehouse Monitoring</h2>
    <p>Automatically profiles Delta table columns: statistical summaries (mean, stddev, null rate, quantiles) and drift metrics vs. a baseline window. Outputs to profile_metrics and drift_metrics Delta tables. Pre-built DBSQL dashboard included.</p>
    <h2>3. Event-Driven Retraining</h2>
    <p>Monitoring job → PSI alert (DBSQL Alert or custom) → webhook triggers training Job → new model registers in Staging → validation job → promotes to Production if metrics pass.</p>
    <h2>4. Output Drift</h2>
    <p>Monitor prediction distribution (mean predicted probability, predicted positive rate) as an early proxy for concept drift when ground-truth labels are delayed.</p>`
};

const SNIPPET_OFFLINE_FALLBACK = {
  "mlflow_tracking.py": `# MLflow Experiment Tracking Reference Template
import mlflow
import mlflow.sklearn
from mlflow.models import infer_signature
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, f1_score

# 1. SET EXPERIMENT (creates if not exists)
mlflow.set_experiment("/Users/your-name/churn-model-experiment")

# 2. ENABLE AUTOLOG (captures params, metrics, model automatically)
mlflow.sklearn.autolog()

X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. STANDARD RUN — autolog captures all params/metrics/model
with mlflow.start_run(run_name="rf-baseline"):
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    # autolog logged params, training metrics, and model artifact already

    # 4. LOG CUSTOM METRICS
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    mlflow.log_metric("test_auc", roc_auc_score(y_test, probs))
    mlflow.log_metric("test_f1", f1_score(y_test, preds))

    # 5. LOG CUSTOM ARTIFACTS
    import matplotlib.pyplot as plt
    from sklearn.metrics import ConfusionMatrixDisplay
    fig, ax = plt.subplots()
    ConfusionMatrixDisplay.from_predictions(y_test, preds, ax=ax)
    fig.savefig("/tmp/confusion_matrix.png")
    mlflow.log_artifact("/tmp/confusion_matrix.png")

    # 6. SET TAGS
    mlflow.set_tags({"team": "ml-platform", "model_type": "random_forest"})

    print(f"Run ID: {mlflow.active_run().info.run_id}")

# 7. NESTED RUNS — for grouped HPO experiments
with mlflow.start_run(run_name="rf-hpo-search"):
    for n_trees in [50, 100, 200]:
        with mlflow.start_run(run_name=f"n_trees={n_trees}", nested=True):
            m = RandomForestClassifier(n_estimators=n_trees, random_state=42)
            m.fit(X_train, y_train)
            auc = roc_auc_score(y_test, m.predict_proba(X_test)[:, 1])
            mlflow.log_param("n_estimators", n_trees)
            mlflow.log_metric("val_auc", auc)

# 8. SEARCH RUNS — find best by val_auc
experiment = mlflow.get_experiment_by_name("/Users/your-name/churn-model-experiment")
runs = mlflow.search_runs(
    experiment_ids=[experiment.experiment_id],
    order_by=["metrics.val_auc DESC"]
)
best_run_id = runs.iloc[0]["run_id"]
print(f"Best run: {best_run_id}")

# 9. REGISTER MODEL IN MODEL REGISTRY
model_uri = f"runs:/{best_run_id}/model"
registered = mlflow.register_model(model_uri, "ChurnClassifier")
print(f"Registered model version: {registered.version}")

# 10. LOAD MODEL VIA PYFUNC (framework-agnostic)
import pandas as pd
loaded_model = mlflow.pyfunc.load_model(f"models:/ChurnClassifier/{registered.version}")
predictions = loaded_model.predict(pd.DataFrame(X_test))
print(predictions[:5])`,

  "spark_ml_pipeline.py": `# Spark ML Pipeline Reference Template
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

# 2. PIPELINE STAGES
# Stage A: Index string column → numeric indices
country_indexer = StringIndexer(
    inputCol="country",
    outputCol="country_idx",
    handleInvalid="keep"  # assign extra index to unseen labels at inference
)

# Stage B: One-hot encode the indexed column
country_encoder = OneHotEncoder(
    inputCols=["country_idx"],
    outputCols=["country_vec"]
)

# Stage C: Assemble all feature columns into a single DenseVector
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
    .build())

evaluator = BinaryClassificationEvaluator(
    labelCol="churned",
    metricName="areaUnderROC"
)

cv = CrossValidator(
    estimator=pipeline,
    estimatorParamMaps=param_grid,
    evaluator=evaluator,
    numFolds=3,
    seed=42
)

# 5. FIT (trains all pipeline stages on training data)
with mlflow.start_run(run_name="gbt-cv-pipeline"):
    mlflow.spark.autolog()
    cv_model = cv.fit(train_df)
    best_pipeline = cv_model.bestModel

    # 6. EVALUATE ON TEST SET
    test_preds = best_pipeline.transform(test_df)
    auc = evaluator.evaluate(test_preds)
    mlflow.log_metric("test_auc", auc)
    print(f"Test AUC: {auc:.4f}")

    # 7. INSPECT BEST HYPERPARAMETERS
    best_gbt = best_pipeline.stages[-1]
    print(f"Best maxDepth: {best_gbt.getMaxDepth()}, stepSize: {best_gbt.getStepSize()}")

# 8. SAVE AND RELOAD PIPELINE MODEL
best_pipeline.write().overwrite().save("/dbfs/models/churn_gbt_pipeline")
from pyspark.ml import PipelineModel
reloaded = PipelineModel.load("/dbfs/models/churn_gbt_pipeline")

# 9. BATCH INFERENCE AT SCALE WITH PANDAS UDF
# Register pipeline as a Spark UDF via MLflow for distributed scoring
import mlflow.pyfunc
model_uri = f"runs:/{mlflow.active_run().info.run_id}/model"
# mlflow.spark.log_model logs the model; load via pyfunc for UDF
score_udf = mlflow.pyfunc.spark_udf(spark, model_uri, result_type="double")

scored_df = (spark.read.format("delta").load("/mnt/data/customer_all")
    .withColumn("churn_score", score_udf(F.struct(*["age", "tenure_months", "monthly_spend", "country"]))))
scored_df.write.format("delta").mode("overwrite").save("/mnt/predictions/churn_scores")`,

  "delta_feature_store.py": `# Databricks Feature Store + Delta Lake Reference Template
# Shows: feature registration, training set creation, model logging with FS, batch inference

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

# Assume feature_df is a Spark DataFrame with computed features
# Must have: primary_key, timestamp_key (for point-in-time), feature columns
feature_df = spark.sql("""
    SELECT
        customer_id,
        date AS feature_ts,           -- timestamp for point-in-time lookup
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
    timestamp_keys=["feature_ts"],   # enables point-in-time lookup
    df=feature_df,
    description="Monthly customer engagement features for churn model"
)

# Write (or update) feature data
fs.write_table(
    name="ml.features.customer_engagement",
    df=feature_df,
    mode="merge"  # upserts based on primary key + timestamp
)

# =========================================================================
# PART 2: CREATE TRAINING DATASET WITH POINT-IN-TIME LOOKUP
# =========================================================================

# Label table: one row per training event (customer + churn label at event time)
labels_df = spark.sql("""
    SELECT customer_id, event_ts, churned
    FROM churn_labels
    WHERE event_ts BETWEEN '2023-01-01' AND '2024-01-01'
""")

# Feature lookups — only returns features with feature_ts <= event_ts (no leakage!)
feature_lookups = [
    FeatureLookup(
        table_name="ml.features.customer_engagement",
        lookup_key="customer_id",
        timestamp_lookup_key="event_ts",  # enforces point-in-time cutoff
        feature_names=["avg_spend_3m", "support_tickets_6m", "login_frequency", "tenure_months"]
    )
]

# Create training set: joins features to labels at correct historical time
training_set = fs.create_training_set(
    df=labels_df,
    feature_lookups=feature_lookups,
    label="churned",
    exclude_columns=["event_ts", "customer_id"]
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
    # This enables automatic feature lookup at serving time!
    fs.log_model(
        model=model,
        artifact_path="churn_model",
        flavor=mlflow.sklearn,
        training_set=training_set,          # attaches feature lookup spec
        registered_model_name="ChurnModelWithFS"
    )
    print(f"Model registered. Run ID: {mlflow.active_run().info.run_id}")

# =========================================================================
# PART 4: BATCH INFERENCE USING FEATURE STORE
# =========================================================================
# Score all customers — FS automatically looks up latest feature values
scoring_df = spark.sql("SELECT customer_id FROM all_customers")

# score_batch() looks up features from the feature store using primary key
predictions = fs.score_batch(
    model_uri="models:/ChurnModelWithFS/Production",
    df=scoring_df
)

# Write predictions to Delta
predictions.write.format("delta").mode("overwrite").saveAsTable("ml.predictions.churn_scores")

# =========================================================================
# PART 5: DELTA LAKE TIME TRAVEL FOR REPRODUCIBILITY
# =========================================================================
# Retrieve the exact data version used in a previous training run
past_features = spark.sql("""
    SELECT * FROM ml.features.customer_engagement
    TIMESTAMP AS OF '2023-06-01 00:00:00'
""")

# Or by Delta version number (log the version in MLflow at training time):
# past_features = spark.read.format("delta").option("versionAsOf", 42).load("path/to/table")`
};

// =========================================================================
// 2. STATE MANAGEMENT
// =========================================================================
let activeCert = 'associate';
let trackerState = {};
let quizState = { activeQuestions: [], currentIndex: 0, score: 0, hasAnswered: false, selectedOption: null };
let _progressData = { associate: { tracker: {}, scheduler: null }, professional: { tracker: {}, scheduler: null } };

async function loadProgress() {
  try {
    const res = await fetch('/api/progress');
    if (res.ok) {
      const d = await res.json();
      if (d && typeof d === 'object') _progressData = d;
    }
  } catch (e) { /* server unavailable */ }
}

async function saveProgress() {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(_progressData)
    });
  } catch (e) { /* silent */ }
}

// =========================================================================
// 3. INITIALIZATION
// =========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await loadProgress();
  initTrackerState();
  renderChecklist();
  updateProgressUI();
  setupRouting();
  renderNotesMenu();
  setupQuizEvents();
  setupPlaygroundEvents();
  initStudyPlan();
  loadNotesDoc(CERT_DATA[activeCert].noteDocs[0].file);
  updateQuizDropdown();
});

function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const storedTheme = localStorage.getItem("db-ml-theme") || "dark";
  if (storedTheme === "light") {
    document.body.classList.replace("dark-theme", "light-theme");
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.replace("dark-theme", "light-theme");
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      localStorage.setItem("db-ml-theme", "light");
    } else {
      document.body.classList.replace("light-theme", "dark-theme");
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
      localStorage.setItem("db-ml-theme", "dark");
    }
  });
}

// =========================================================================
// 4. CERT SWITCHER
// =========================================================================
window.switchCert = function(cert) {
  if (cert === activeCert) return;
  activeCert = cert;

  // Update sidebar cert buttons
  document.getElementById('cert-btn-associate').classList.toggle('active', cert === 'associate');
  document.getElementById('cert-btn-professional').classList.toggle('active', cert === 'professional');

  // Update stats card labels
  const data = CERT_DATA[cert];
  document.getElementById('stat-domain-count').textContent = data.sectionCount;
  document.getElementById('stat-cert-label').textContent = data.examLabel;
  document.getElementById('widget-sub').textContent = data.name + ' exam topics';

  // Update cheatsheet panels
  document.getElementById('cheatsheet-associate').classList.toggle('hidden', cert !== 'associate');
  document.getElementById('cheatsheet-professional').classList.toggle('hidden', cert !== 'professional');

  // Re-render all cert-dependent views
  initTrackerState();
  renderChecklist();
  updateProgressUI();
  renderNotesMenu();
  updateQuizDropdown();

  // Reset notes to first doc of new cert
  const firstDoc = CERT_DATA[cert].noteDocs[0];
  const menuItems = document.querySelectorAll('#notes-menu-list li');
  menuItems.forEach(li => li.classList.remove('active'));
  if (menuItems[0]) menuItems[0].classList.add('active');
  loadNotesDoc(firstDoc.file);

  // Update study plan for new cert
  initStudyPlan();
};

// =========================================================================
// 5. TAB ROUTING
// =========================================================================
function setupRouting() {
  const navItems = document.querySelectorAll(".nav-item");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const tabTitle = document.getElementById("current-tab-title");
  const tabDesc = document.getElementById("current-tab-desc");
  const tabMeta = {
    tracker:    { title: "Study Tracker",    desc: "Track progress across all exam sections for the active certification level." },
    notes:      { title: "Study Guides",     desc: "Read structured summaries of every exam section." },
    quiz:       { title: "Mock Exam Quiz",   desc: "Test readiness with certification-style practice questions." },
    cheatsheet: { title: "Cheat Sheets",     desc: "Quick-reference tables for the active certification level." },
    playground: { title: "Code Playground",  desc: "Explore Databricks ML code patterns — MLflow, Spark ML, Feature Store." }
  };
  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      navItems.forEach(n => n.classList.remove("active"));
      btn.classList.add("active");
      tabPanels.forEach(p => { p.classList.remove("active"); if (p.id === `tab-${tabId}`) p.classList.add("active"); });
      if (tabMeta[tabId]) { tabTitle.textContent = tabMeta[tabId].title; tabDesc.textContent = tabMeta[tabId].desc; }
    });
  });
}

// =========================================================================
// 6. TRACKER / CHECKLIST ENGINE
// =========================================================================
function initTrackerState() {
  const saved = _progressData[activeCert] && _progressData[activeCert].tracker;
  trackerState = saved && Object.keys(saved).length > 0 ? { ...saved } : {};
  CERT_DATA[activeCert].domains.forEach(domain => {
    domain.items.forEach(item => { if (trackerState[item.id] === undefined) trackerState[item.id] = false; });
  });
  saveTrackerState();
}

function saveTrackerState() {
  if (!_progressData[activeCert]) _progressData[activeCert] = {};
  _progressData[activeCert].tracker = trackerState;
  saveProgress();
}

function renderChecklist() {
  const container = document.getElementById("domains-checklist");
  container.innerHTML = "";
  CERT_DATA[activeCert].domains.forEach(domain => {
    const totalItems = domain.items.length;
    const completedItems = domain.items.filter(item => trackerState[item.id]).length;
    const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const accordion = document.createElement("div");
    accordion.className = "domain-accordion";
    accordion.id = `accordion-${domain.id}`;
    accordion.innerHTML = `
      <div class="domain-header" onclick="toggleAccordion(${domain.id})">
        <div class="domain-header-left">
          <div class="domain-badge">${domain.code}</div>
          <div class="domain-title-group"><h4>${domain.title}</h4><span>${domain.subtitle}</span></div>
        </div>
        <div class="domain-header-right">
          <div class="domain-progress">
            <div class="dp-bar-outer"><div class="dp-bar-inner" id="dp-inner-${domain.id}" style="width: ${pct}%;"></div></div>
            <span id="dp-text-${domain.id}">${pct}%</span>
          </div>
          <i class="fa-solid fa-chevron-down arrow-icon"></i>
        </div>
      </div>
      <div class="domain-content">
        <div class="task-list" id="task-list-${domain.id}"></div>
      </div>`;
    container.appendChild(accordion);
    const taskList = document.getElementById(`task-list-${domain.id}`);
    domain.items.forEach(item => {
      const taskDiv = document.createElement("div");
      taskDiv.className = "task-item";
      taskDiv.innerHTML = `
        <div class="task-checkbox-container">
          <input type="checkbox" id="${item.id}" ${trackerState[item.id] ? "checked" : ""} onchange="toggleTask('${item.id}', ${domain.id})">
          <div class="checkmark"><i class="fa-solid fa-check"></i></div>
        </div>
        <span class="task-text">${item.text}</span>`;
      taskList.appendChild(taskDiv);
    });
  });
}

window.toggleAccordion = function(domainId) {
  document.getElementById(`accordion-${domainId}`).classList.toggle("expanded");
};

window.toggleTask = function(taskId, domainId) {
  const checkbox = document.getElementById(taskId);
  trackerState[taskId] = checkbox.checked;
  saveTrackerState();
  const domain = CERT_DATA[activeCert].domains.find(d => d.id === domainId);
  const pct = Math.round((domain.items.filter(i => trackerState[i.id]).length / domain.items.length) * 100);
  document.getElementById(`dp-inner-${domainId}`).style.width = `${pct}%`;
  document.getElementById(`dp-text-${domainId}`).textContent = `${pct}%`;
  updateProgressUI();
};

function updateProgressUI() {
  const total = Object.keys(trackerState).length;
  const completed = Object.values(trackerState).filter(v => v).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById("widget-pct").textContent = `${pct}%`;
  document.getElementById("widget-bar").style.width = `${pct}%`;
  const sc = document.getElementById("stat-completed-tasks");
  const sr = document.getElementById("stat-completion-rate");
  if (sc) sc.textContent = `${completed} / ${total}`;
  if (sr) sr.textContent = `${pct}%`;
}

// =========================================================================
// 7. STUDY NOTES ENGINE
// =========================================================================
function renderNotesMenu() {
  const list = document.getElementById('notes-menu-list');
  const docs = CERT_DATA[activeCert].noteDocs;
  list.innerHTML = docs.map((doc, i) => `
    <li class="${i === 0 ? 'active' : ''}" data-doc="${doc.file}">
      <span class="badge">${doc.badge}</span>
      <span class="note-title">${doc.title}</span>
    </li>`).join('');
  list.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', () => {
      list.querySelectorAll('li').forEach(li => li.classList.remove('active'));
      item.classList.add('active');
      loadNotesDoc(item.getAttribute('data-doc'));
    });
  });
}

function loadNotesDoc(filename) {
  const bodyEl = document.getElementById("notes-view-body");
  const loaderEl = document.getElementById("notes-loading");
  loaderEl.classList.remove("hidden");
  bodyEl.classList.add("hidden");
  fetch(`./docs/${activeCert}/${filename}`)
    .then(r => { if (!r.ok) throw new Error("not found"); return r.text(); })
    .then(md => {
      bodyEl.innerHTML = parseSimpleMarkdown(md);
      loaderEl.classList.add("hidden");
      bodyEl.classList.remove("hidden");
      if (window.Prism) Prism.highlightAllUnder(bodyEl);
    })
    .catch(() => {
      const key = `${activeCert}/${filename}`;
      bodyEl.innerHTML = NOTES_OFFLINE_FALLBACK[key] || "<h3>Content not found.</h3>";
      loaderEl.classList.add("hidden");
      bodyEl.classList.remove("hidden");
      if (window.Prism) Prism.highlightAllUnder(bodyEl);
    });
}

function parseSimpleMarkdown(md) {
  let html = md;
  html = html.replace(/```mermaid[\s\S]*?```/g, '');
  const codeBlocks = [];
  html = html.replace(/```([a-zA-Z0-9_\-]+)?\n([\s\S]*?)```/g, (_, lang, c) => { codeBlocks.push({ lang: lang || 'text', content: c }); return `__CB_${codeBlocks.length - 1}__`; });
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_, c) => { inlineCodes.push(c); return `__IC_${inlineCodes.length - 1}__`; });
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^[*\-] (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\.\s+(.*?)$/gm, '<oli>$1</oli>');
  html = html.replace(/((?:<li>[^\n]*<\/li>\n?)+)/g, '<ul>$1</ul>');
  html = html.replace(/((?:<oli>[^\n]*<\/oli>\n?)+)/g, m => '<ol>' + m.replace(/<\/?oli>/g, s => s.replace('oli', 'li')) + '</ol>');
  const lines = html.split('\n');
  let inTable = false, isFirstRow = true, tableHtml = '<table>';
  let inBlockquote = false, bqContent = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('>')) {
      if (inTable) { inTable = false; tableHtml += '</table>'; lines[i] = tableHtml + '\n' + lines[i]; tableHtml = '<table>'; }
      if (!inBlockquote) { inBlockquote = true; bqContent = ''; }
      let text = line.substring(1).trim();
      if (text.startsWith('[!')) { const ci = text.indexOf(']'); if (ci !== -1) { const at = text.substring(2, ci); text = `<strong>${at}:</strong> ${text.substring(ci+1).trim()}`; } }
      bqContent += (bqContent ? '<br>' : '') + text; lines[i] = ''; continue;
    } else { if (inBlockquote) { inBlockquote = false; lines[i] = `<blockquote>${bqContent}</blockquote>\n` + lines[i]; } }
    if (line.startsWith('|')) {
      if (!inTable) { inTable = true; isFirstRow = true; tableHtml = '<table>'; }
      const cols = line.split('|').slice(1, -1).map(c => c.trim());
      if (cols.every(c => c.startsWith(':') || c.startsWith('-'))) { lines[i] = ''; continue; }
      const tag = isFirstRow ? 'th' : 'td';
      tableHtml += '<tr>' + cols.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
      isFirstRow = false; lines[i] = '';
    } else { if (inTable) { inTable = false; tableHtml += '</table>'; lines[i] = tableHtml + '\n' + lines[i]; tableHtml = '<table>'; } }
  }
  if (inBlockquote) lines.push(`<blockquote>${bqContent}</blockquote>`);
  if (inTable) { tableHtml += '</table>'; lines.push(tableHtml); }
  html = lines.join('\n');
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  inlineCodes.forEach((c, i) => { html = html.replace(`__IC_${i}__`, () => `<code>${esc(c)}</code>`); });
  codeBlocks.forEach((block, i) => { html = html.replace(`__CB_${i}__`, () => `<pre><code class="language-${block.lang}">${esc(block.content)}</code></pre>`); });
  return html;
}

// =========================================================================
// 8. QUIZ ENGINE
// =========================================================================
function updateQuizDropdown() {
  const select = document.getElementById('quiz-mode');
  const modes = CERT_DATA[activeCert].quizModes;
  select.innerHTML = modes.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
  const introTitle = document.getElementById('quiz-intro-title');
  const introDesc = document.getElementById('quiz-intro-desc');
  if (introTitle) introTitle.textContent = `Databricks ${CERT_DATA[activeCert].name} Quiz Center`;
  if (introDesc) introDesc.textContent = `Test your knowledge with exam-realistic questions spanning all sections of the ${CERT_DATA[activeCert].name} certification.`;
}

function setupQuizEvents() {
  document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
  document.getElementById("quiz-next-btn").addEventListener("click", nextQuestion);
  document.getElementById("restart-quiz-btn").addEventListener("click", resetQuizIntro);
  document.getElementById("quiz-review-tracker-btn").addEventListener("click", () => document.querySelector('[data-tab="tracker"]').click());
}

function startQuiz() {
  const mode = document.getElementById("quiz-mode").value;
  const dashIdx = mode.indexOf('-');
  const cert = mode.substring(0, dashIdx);
  const sub = mode.substring(dashIdx + 1);

  let pool = window.PRACTICE_QUESTIONS.filter(q => q.cert === cert);

  if (sub === 'quick') {
    pool = shuffleArray(pool).slice(0, 10);
  } else if (sub !== 'all') {
    // sub is like 's1', 's2', etc. — match Section number
    const sectionNum = sub.substring(1); // '1', '2', etc.
    pool = pool.filter(q => q.domain.startsWith(`Section ${sectionNum}`));
    if (pool.length === 0) { alert("No questions found for this section yet."); return; }
  }

  quizState = { activeQuestions: pool, currentIndex: 0, score: 0, hasAnswered: false, selectedOption: null };
  document.getElementById("quiz-intro-card").classList.add("hidden");
  document.getElementById("quiz-results-card").classList.add("hidden");
  document.getElementById("quiz-running-card").classList.remove("hidden");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = quizState.activeQuestions[quizState.currentIndex];
  quizState.hasAnswered = false; quizState.selectedOption = null;
  document.getElementById("quiz-question-number").textContent = `Question ${quizState.currentIndex + 1} of ${quizState.activeQuestions.length}`;
  document.getElementById("quiz-question-domain").textContent = q.domain;
  document.getElementById("quiz-question-text").textContent = q.question;
  document.getElementById("quiz-progress-fill").style.width = `${Math.round((quizState.currentIndex / quizState.activeQuestions.length) * 100)}%`;
  const container = document.getElementById("quiz-options-list");
  container.innerHTML = "";
  q.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + idx)}</span><span class="option-text">${optText}</span>`;
    btn.addEventListener("click", () => selectOption(idx));
    container.appendChild(btn);
  });
  document.getElementById("quiz-next-btn").disabled = true;
  document.getElementById("quiz-next-btn").querySelector("span").textContent = "Submit Answer";
  const fb = document.getElementById("quiz-feedback-box");
  fb.classList.add("hidden"); fb.classList.remove("correct-fb", "wrong-fb");
  document.getElementById("quiz-score-indicator").textContent = `Score: ${quizState.score} / ${quizState.currentIndex}`;
}

function selectOption(index) {
  if (quizState.hasAnswered) return;
  document.querySelectorAll(".option-btn").forEach((btn, i) => btn.classList.toggle("selected", i === index));
  quizState.selectedOption = index;
  document.getElementById("quiz-next-btn").disabled = false;
}

function nextQuestion() {
  const nextBtn = document.getElementById("quiz-next-btn");
  if (!quizState.hasAnswered) {
    evaluateChoice();
    quizState.hasAnswered = true;
    nextBtn.querySelector("span").textContent = quizState.currentIndex === quizState.activeQuestions.length - 1 ? "Show Results" : "Next Question";
  } else {
    if (quizState.currentIndex < quizState.activeQuestions.length - 1) { quizState.currentIndex++; renderQuizQuestion(); }
    else showQuizResults();
  }
}

function evaluateChoice() {
  const q = quizState.activeQuestions[quizState.currentIndex];
  const isCorrect = quizState.selectedOption === q.answer;
  if (isCorrect) quizState.score++;
  document.querySelectorAll(".option-btn").forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.answer) { btn.classList.remove("selected"); btn.classList.add("correct"); }
    else if (idx === quizState.selectedOption) { btn.classList.remove("selected"); btn.classList.add("wrong"); }
  });
  const fb = document.getElementById("quiz-feedback-box");
  document.getElementById("feedback-heading").textContent = isCorrect ? "Correct!" : `Incorrect (Correct: ${String.fromCharCode(65 + q.answer)})`;
  document.getElementById("feedback-icon").innerHTML = isCorrect ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>';
  document.getElementById("feedback-explanation").textContent = q.explanation;
  fb.classList.remove("hidden"); fb.classList.toggle("correct-fb", isCorrect); fb.classList.toggle("wrong-fb", !isCorrect);
  document.getElementById("quiz-score-indicator").textContent = `Score: ${quizState.score} / ${quizState.currentIndex + 1}`;
}

function showQuizResults() {
  document.getElementById("quiz-running-card").classList.add("hidden");
  document.getElementById("quiz-results-card").classList.remove("hidden");
  const total = quizState.activeQuestions.length, score = quizState.score;
  const pct = Math.round((score / total) * 100);
  document.getElementById("results-score").textContent = `${score} / ${total}`;
  document.getElementById("results-percentage").textContent = `${pct}%`;
  const fb = document.getElementById("results-feedback-text");
  if (pct >= 80) fb.innerHTML = "<strong>Excellent!</strong> You're well-prepared. Review any missed questions and you're ready for exam day.";
  else if (pct >= 65) fb.innerHTML = "<strong>Good effort!</strong> You're close. Focus on the sections where you missed questions and try again.";
  else fb.innerHTML = "<strong>Keep studying!</strong> Review the Study Guides and Cheat Sheets for the sections you missed, then re-take the quiz.";
}

function resetQuizIntro() {
  document.getElementById("quiz-results-card").classList.add("hidden");
  document.getElementById("quiz-intro-card").classList.remove("hidden");
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// =========================================================================
// 9. CODE PLAYGROUND ENGINE
// =========================================================================
function setupPlaygroundEvents() {
  const buttons = document.querySelectorAll(".snippet-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadCodeSnippet(btn.getAttribute("data-file"));
    });
  });
  document.getElementById("copy-snippet-btn").addEventListener("click", () => {
    const code = document.getElementById("snippet-code-block").textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById("copy-snippet-btn");
      btn.querySelector("span").textContent = "Copied!";
      btn.querySelector("i").className = "fa-solid fa-check";
      setTimeout(() => { btn.querySelector("span").textContent = "Copy"; btn.querySelector("i").className = "fa-regular fa-copy"; }, 2000);
    });
  });
  loadCodeSnippet("mlflow_tracking.py");
}

function loadCodeSnippet(filename) {
  const codeEl = document.getElementById("snippet-code-block");
  document.getElementById("current-snippet-name").textContent = filename;
  codeEl.className = "language-python";
  fetch(`./src/snippets/${filename}`)
    .then(r => { if (!r.ok) throw new Error("not found"); return r.text(); })
    .then(code => {
      codeEl.textContent = code;
      if (window.Prism) Prism.highlightElement(codeEl);
    })
    .catch(() => {
      codeEl.textContent = SNIPPET_OFFLINE_FALLBACK[filename] || "# Snippet not found offline.";
      if (window.Prism) Prism.highlightElement(codeEl);
    });
}

// =========================================================================
// 10. STUDY PLAN SCHEDULER ENGINE
// =========================================================================
let schedulerState = { activeDuration: 14, selectedDay: 1 };

function initStudyPlan() {
  const saved = _progressData[activeCert] && _progressData[activeCert].scheduler;
  if (saved) schedulerState = { ...saved };
  else schedulerState = { activeDuration: 14, selectedDay: 1 };

  [14, 28].forEach(dur => {
    if (!schedulerState[`${activeCert}_${dur}`]) schedulerState[`${activeCert}_${dur}`] = {};
    CERT_DATA[activeCert].studyPlans[dur].forEach(d => {
      d.tasks.forEach(t => { if (schedulerState[`${activeCert}_${dur}`][t.id] === undefined) schedulerState[`${activeCert}_${dur}`][t.id] = false; });
    });
  });
  saveSchedulerState();
  setStudyPlanDuration(schedulerState.activeDuration || 14);
}

function saveSchedulerState() {
  if (!_progressData[activeCert]) _progressData[activeCert] = {};
  _progressData[activeCert].scheduler = schedulerState;
  saveProgress();
}

window.setStudyPlanDuration = function(duration) {
  schedulerState.activeDuration = duration;
  if (schedulerState.selectedDay > duration) schedulerState.selectedDay = 1;
  saveSchedulerState();
  document.getElementById("plan-btn-14").className = duration === 14 ? "btn-timeline-toggle active" : "btn-timeline-toggle";
  document.getElementById("plan-btn-28").className = duration === 28 ? "btn-timeline-toggle active" : "btn-timeline-toggle";
  renderSchedulerTimeline();
  renderSelectedDayDetails();
};

function renderSchedulerTimeline() {
  const track = document.getElementById("timeline-days-track");
  track.innerHTML = "";
  const dur = schedulerState.activeDuration;
  const stateKey = `${activeCert}_${dur}`;
  CERT_DATA[activeCert].studyPlans[dur].forEach(dayData => {
    const btn = document.createElement("button");
    btn.className = "timeline-day-btn";
    if (dayData.day === schedulerState.selectedDay) btn.classList.add("active");
    if (dayData.tasks.every(t => schedulerState[stateKey] && schedulerState[stateKey][t.id])) btn.classList.add("completed");
    btn.innerHTML = `<span class="day-num">${dayData.day}</span><span class="day-lbl">Day</span>`;
    btn.addEventListener("click", () => {
      schedulerState.selectedDay = dayData.day; saveSchedulerState();
      document.querySelectorAll(".timeline-day-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active"); renderSelectedDayDetails();
    });
    track.appendChild(btn);
  });
}

function renderSelectedDayDetails() {
  const detailBox = document.getElementById("timeline-day-detail-box");
  const dur = schedulerState.activeDuration;
  const stateKey = `${activeCert}_${dur}`;
  const dayData = CERT_DATA[activeCert].studyPlans[dur].find(d => d.day === schedulerState.selectedDay);
  if (!dayData) return;
  const allDone = dayData.tasks.every(t => schedulerState[stateKey] && schedulerState[stateKey][t.id]);
  let tasksHtml = dayData.tasks.map(task => {
    const done = schedulerState[stateKey] && schedulerState[stateKey][task.id];
    return `<li class="${done ? 'tdd-task-item completed' : 'tdd-task-item'}" onclick="toggleSchedulerTask('${task.id}')">
      <i class="${done ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}"></i>
      <span>${task.text}</span>
      ${task.action ? `<span style="font-size:0.75rem;color:var(--primary);margin-left:auto;">[Launch <i class="fa-solid fa-arrow-right" style="font-size:0.65rem;"></i>]</span>` : ''}
    </li>`;
  }).join('');
  detailBox.innerHTML = `
    <div class="tdd-header">
      <h4>Day ${dayData.day}: ${dayData.title}</h4>
      <span class="${allDone ? 'tdd-status-badge completed' : 'tdd-status-badge'}">${allDone ? 'Completed' : 'In Progress'}</span>
    </div>
    <p class="tdd-description">${dayData.desc}</p>
    <ul class="tdd-tasks-list">${tasksHtml}</ul>
    <div class="tdd-actions">
      <button class="btn-secondary" onclick="markAllDayTasks(${!allDone})">
        <i class="fa-solid ${allDone ? 'fa-xmark' : 'fa-check'}"></i>
        <span>${allDone ? 'Mark Incomplete' : 'Mark Complete'}</span>
      </button>
    </div>`;
  detailBox.querySelectorAll('.tdd-tasks-list li').forEach((el, idx) => {
    const task = dayData.tasks[idx];
    const launchSpan = el.querySelector('span[style]');
    if (launchSpan) launchSpan.addEventListener('click', e => { e.stopPropagation(); executeSchedulerAction(task.action, task.target); });
  });
}

window.toggleSchedulerTask = function(taskId) {
  const key = `${activeCert}_${schedulerState.activeDuration}`;
  if (!schedulerState[key]) schedulerState[key] = {};
  schedulerState[key][taskId] = !schedulerState[key][taskId];
  saveSchedulerState(); renderSchedulerTimeline(); renderSelectedDayDetails();
};

window.markAllDayTasks = function(val) {
  const dur = schedulerState.activeDuration;
  const key = `${activeCert}_${dur}`;
  if (!schedulerState[key]) schedulerState[key] = {};
  const dayData = CERT_DATA[activeCert].studyPlans[dur].find(d => d.day === schedulerState.selectedDay);
  dayData.tasks.forEach(t => { schedulerState[key][t.id] = val; });
  saveSchedulerState(); renderSchedulerTimeline(); renderSelectedDayDetails();
};

function executeSchedulerAction(action, target) {
  if (action === "notes") {
    document.querySelector('[data-tab="notes"]').click();
    document.querySelectorAll("#notes-menu-list li").forEach(li => { if (li.getAttribute("data-doc") === target) li.click(); });
  } else if (action === "playground") {
    document.querySelector('[data-tab="playground"]').click();
    document.querySelectorAll("#snippet-btn-container button").forEach(btn => { if (btn.getAttribute("data-file") === target) btn.click(); });
  } else if (action === "quiz") {
    document.querySelector('[data-tab="quiz"]').click();
    const sel = document.getElementById("quiz-mode");
    if (sel) { sel.value = target; startQuiz(); }
  } else if (action === "cheatsheet") {
    document.querySelector('[data-tab="cheatsheet"]').click();
  }
}
