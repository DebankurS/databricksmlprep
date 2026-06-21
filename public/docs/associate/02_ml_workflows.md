# Section 2: ML Workflows

## 1. Exploratory Data Analysis (EDA)

Before training, understand your data:

- **Missing values:** Check `df.isnull().sum()`. Decide: impute or drop?
- **Distribution:** Histograms, boxplots. Identify skew, outliers.
- **Class balance:** `y.value_counts()`. Imbalance → choose metrics wisely.
- **Correlations:** Pearson for numeric-numeric, Cramér's V for categorical-categorical.
- **Feature types:** Numeric, ordinal, nominal → different encoding strategies.

---

## 2. Feature Engineering

### Numeric Features

| Technique | When |
|---|---|
| StandardScaler (zero mean, unit variance) | Distance-based models: SVM, KNN, Logistic Regression |
| MinMaxScaler (0 to 1) | Neural networks, bounded features |
| Log transform | Right-skewed distributions (income, counts) |
| Polynomial features | Capture non-linear interactions |

> **Critical: Fit only on training data, transform both sets**
>
> Wrong: `scaler.fit_transform(X_all)` before splitting
> Right: `scaler.fit(X_train)` → `scaler.transform(X_train)`, `scaler.transform(X_test)`

### Categorical Features

| Technique | When |
|---|---|
| One-hot encoding | Low-cardinality (<20 unique values) |
| Ordinal encoding | Ordinal categories with natural order |
| Target encoding | High-cardinality with tree models. Replace category with mean target value. |
| Hashing (FeatureHasher) | Very high cardinality, speed matters |

**Target encoding caution:** Apply cross-fold encoding during training to prevent target leakage. Use smoothing for rare categories:

```
encoded_value = (count × category_mean + global_mean × smoothing) / (count + smoothing)
```

---

## 3. Preventing Data Leakage

Leakage = information from test/future leaks into training → inflated metrics, production failure.

**Common leakage sources:**

1. **Preprocessing leakage:** Fitting scaler/imputer on full dataset before split
2. **Temporal leakage:** Using future values in time-series features
3. **Target encoding leakage:** Using test labels when computing encoding statistics
4. **Group leakage:** Same user/entity in both train and test splits

**Safe pipeline pattern:**

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

pipeline = Pipeline([
    ("scaler", StandardScaler()),        # fit happens here
    ("model", LogisticRegression())
])
pipeline.fit(X_train, y_train)            # scaler.fit only sees X_train
pipeline.score(X_test, y_test)            # scaler.transform(X_test) — no leakage
```

---

## 4. Handling Class Imbalance

| Strategy | How | When |
|---|---|---|
| `class_weight="balanced"` | Upweight minority in loss function | Most sklearn models, fast |
| SMOTE oversampling | Generate synthetic minority samples | Before cross-validation, via imblearn |
| Undersample majority | Randomly drop majority class rows | Very large majority class |
| Adjust decision threshold | Lower threshold from 0.5 for minority | Post-training, tune to business need |

**Metric choice with imbalance:**
- Accuracy is misleading (95% accuracy predicting all negative on 5% minority)
- Use: **F1-score, Precision-Recall AUC, ROC-AUC**

---

## 5. Model Evaluation Metrics

### Classification

| Metric | Formula / Meaning | Best for |
|---|---|---|
| Accuracy | (TP+TN) / Total | Only balanced classes |
| Precision | TP / (TP+FP) | Minimize false positives (spam filter) |
| Recall | TP / (TP+FN) | Minimize false negatives (cancer detection) |
| F1-Score | 2 × P × R / (P+R) | Balance precision/recall |
| ROC-AUC | Area under ROC curve | Ranking quality, threshold-independent |
| PR-AUC | Area under Precision-Recall | Imbalanced data preferred |

### Regression

| Metric | Formula | Sensitivity to Outliers |
|---|---|---|
| MAE | mean(|y - ŷ|) | Robust — treats all errors equally |
| MSE | mean((y - ŷ)²) | Sensitive — squares large errors |
| RMSE | √MSE | Same units as target, still outlier-sensitive |
| R² | 1 - SS_res/SS_tot | Proportion of variance explained |

> **MAE vs RMSE:** If outliers shouldn't be heavily penalized → MAE. If large errors are especially bad → RMSE.

---

## 6. Overfitting vs Underfitting

| Symptom | Diagnosis | Fix |
|---|---|---|
| Low train error, high val error | Overfitting | L1/L2 regularization, dropout, early stopping, reduce features, more data |
| High train error, high val error | Underfitting | More features, deeper model, fewer constraints, longer training |
| Train ≈ Val error, both acceptable | Well-fit | Ship it |

**Validation strategies:**

```python
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score

# Regular k-fold
kf = KFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=kf, scoring="roc_auc")

# Stratified k-fold — preserves class ratio in each fold
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=skf, scoring="f1")
```

> **Use stratified k-fold for classification** — guarantees each fold has the same class distribution as the full dataset. Critical with imbalanced data.

---

## 7. Bias-Variance Tradeoff

```
Total Error = Bias² + Variance + Irreducible Noise
```

- **High bias:** Model too simple, underfits
- **High variance:** Model too complex, overfits
- Goal: minimize both via regularization and appropriate model complexity

---

## 8. Quick Reference

- Fit scaler on train only, transform both — prevents preprocessing leakage
- Target encoding for high-cardinality categoricals + smoothing for rare categories
- Imbalance: class_weight first, SMOTE if more is needed
- F1, PR-AUC over accuracy for imbalanced classification
- MAE for outlier-robust regression, RMSE when large errors matter
- Stratified k-fold for classification cross-validation
