import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
from data_pipeline import fetch_and_standardize_data

def train_model():
    data_path = "solar_flux_training_data.csv"

    if not os.path.exists(data_path):
        fetch_and_standardize_data(data_path)

    print("[INFO] Loading dataset from disk...")
    df = pd.read_csv(data_path)

    print("[INFO] Handling broken data and applying safe feature engineering...")
    
    # 1. Broken Data Handling
    if 'time_tag' in df.columns:
        df['time_tag'] = pd.to_datetime(df['time_tag'])
        df = df.sort_values('time_tag').reset_index(drop=True)
        time_gaps = df['time_tag'].diff()
        
        # Mask for broken data streams (gaps larger than 60 minutes)
        broken_data_mask = time_gaps > pd.Timedelta(minutes=60)
    else:
        broken_data_mask = pd.Series([False] * len(df))

    # 2. Safe Feature Engineering (NO raw flux, NO leakage)
    # Acceleration ratio: How fast is the 15m change compared to the 60m trend?
    df['acceleration_ratio'] = df['delta_flux_15m'] / (df['delta_flux_60m'] + 1e-8)
    
    # Spike intensity: Is the immediate 15m jump sharper than the 30m jump?
    df['spike_intensity'] = df['delta_flux_15m'] - df['delta_flux_30m']

    # 3. Apply the Broken Data Mask
    # If there is a huge gap, rate-of-change ratios are invalid. Set them to NaN.
    cols_to_mask = ['acceleration_ratio', 'spike_intensity']
    df.loc[broken_data_mask, cols_to_mask] = np.nan

    feature_cols = [
        "electron_correction",
        "electron_contaminaton", 
        "delta_flux_15m",
        "delta_flux_30m",
        "delta_flux_60m",
        "acceleration_ratio",
        "spike_intensity"
    ]

    df["electron_contaminaton"] = df["electron_contaminaton"].astype(int)

    X = df[feature_cols]
    y = df["target"]

    print("[INFO] Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )

    print("[INFO] Applying tuned SMOTE over-sampling...")
    train_counts = y_train.value_counts()
    majority_count = train_counts[0]
    
    # LOWER SMOTE caps: M-Class to ~8%, X-Class to ~1.5% to stop "crying wolf"
    target_m = max(int(majority_count * 0.08), train_counts.get(2, 0))
    target_x = max(int(majority_count * 0.015), train_counts.get(3, 0))

    sampling_dict = {
        0: majority_count,
        1: train_counts[1],
        2: target_m,
        3: target_x
    }

    min_class_samples = train_counts.min()
    k_neighbors = min(5, min_class_samples - 1) if min_class_samples > 1 else 1

    # SMOTE doesn't like NaNs, fill temporarily just for training split
    smote = SMOTE(sampling_strategy=sampling_dict, random_state=42, k_neighbors=k_neighbors)
    X_train_imputed = X_train.fillna(-999) 
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train_imputed, y_train)
    X_train_resampled = X_train_resampled.replace(-999, np.nan)

    print("[INFO] Training XGBoost Multi-Class Classifier...")
    model = XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.1,
        objective="multi:softprob",
        num_class=4,
        random_state=42,
        n_jobs=-1,
        missing=np.nan # Natively handles missing values/gaps safely
    )
    model.fit(X_train_resampled, y_train_resampled)

    print("[INFO] Applying strict Confidence Thresholds to tune precision...")
    y_probs = model.predict_proba(X_test)
    y_pred = []
    
    # HIGHER Thresholds to force the model to be picky (improves precision)
    X_CLASS_THRESHOLD = 0.55 
    M_CLASS_THRESHOLD = 0.45
    
    for prob in y_probs:
        best_class = np.argmax(prob)
        
        # Demote low-confidence X-Class predictions
        if best_class == 3 and prob[3] < X_CLASS_THRESHOLD:
            prob[3] = 0.0 
            best_class = np.argmax(prob) 
            
        # Demote low-confidence M-Class predictions
        if best_class == 2 and prob[2] < M_CLASS_THRESHOLD:
            prob[2] = 0.0
            best_class = np.argmax(prob)

        y_pred.append(best_class)

    y_pred = np.array(y_pred)

    print("\n" + "="*50)
    print("      PER-CLASS PERFORMANCE BREAKDOWN")
    print("="*50)
    
    target_names = ["0: Normal", "1: C-Class", "2: M-Class", "3: X-Class"]
    print(classification_report(y_test, y_pred, target_names=target_names, digits=3))

    print("="*50)
    print("            CONFUSION MATRIX")
    print("="*50)
    
    cm = confusion_matrix(y_test, y_pred)
    cm_df = pd.DataFrame(cm, index=target_names, columns=[f"Pred {t}" for t in target_names])
    print(cm_df)
    print("="*50 + "\n")

    metrics = {
        "accuracy": float(round(accuracy_score(y_test, y_pred), 3)),
        "precision": float(round(precision_score(y_test, y_pred, average="weighted", zero_division=0), 3)),
        "recall": float(round(recall_score(y_test, y_pred, average="weighted", zero_division=0), 3)),
        "f1Score": float(round(f1_score(y_test, y_pred, average="weighted", zero_division=0), 3))
    }

    print(f"[EVALUATION METRICS] {metrics}")

    joblib.dump({
        "model": model, 
        "metrics": metrics, 
        "x_threshold": X_CLASS_THRESHOLD,
        "m_threshold": M_CLASS_THRESHOLD
    }, "model.pkl")
    
    print("[SUCCESS] Model trained with safe feature engineering & gap handling. Serialized to model.pkl")

if __name__ == "__main__":
    train_model()