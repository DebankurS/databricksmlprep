# MLflow Experiment Tracking Reference Template
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
    # autolog already logged params, training metrics, and model artifact

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

# 10. STAGE TRANSITION (classic workspace registry)
from mlflow.tracking import MlflowClient
client = MlflowClient()
client.transition_model_version_stage(
    name="ChurnClassifier",
    version=registered.version,
    stage="Staging"
)

# 11. UNITY CATALOG: SET ALIAS (preferred in UC over stages)
# mlflow.set_registry_uri("databricks-uc")
# client.set_registered_model_alias("catalog.schema.ChurnModel", "champion", version=registered.version)

# 12. LOAD MODEL VIA PYFUNC (framework-agnostic)
import pandas as pd
loaded_model = mlflow.pyfunc.load_model(f"models:/ChurnClassifier/{registered.version}")
predictions = loaded_model.predict(pd.DataFrame(X_test))
print(predictions[:5])

# 13. MODEL SIGNATURES — input/output schema validation at serving
signature = infer_signature(X_train, model.predict(X_train))
mlflow.sklearn.log_model(model, "signed-model", signature=signature)
