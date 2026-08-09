import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_sample_weight
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
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
        
    # 2. Safe Feature Engineering (NO future data leakage)
    # Rate of change features
    df['acceleration_ratio'] = df['delta_flux_15m'] / (df['delta_flux_60m'] + 1e-8)
    df['spike_intensity'] = df['delta_flux_15m'] - df['delta_flux_30m']
    
    # NEW: Backward-Looking Historical Context (Helps recover 24-hour predictive recall)
    # 15-min intervals: 24 periods = 6 hours | 48 periods = 12 hours
    print("[INFO] Computing backward-looking historical aggregations...")
    df['max_flux_6h'] = df['flux'].rolling(window=24, min_periods=1).max()
    df['mean_flux_12h'] = df['flux'].rolling(window=48, min_periods=1).mean()
    df['std_flux_6h'] = df['flux'].rolling(window=24, min_periods=1).std().fillna(0)
    
    # 3. Apply the Broken Data Mask
    # If there is a huge gap, derived features are invalid. Set them to NaN.
    cols_to_mask = [
        'acceleration_ratio', 'spike_intensity', 
        'max_flux_6h', 'mean_flux_12h', 'std_flux_6h'
    ]
    df.loc[broken_data_mask, cols_to_mask] = np.nan
    
    feature_cols = [
        "electron_correction",
        "electron_contaminaton",
        "delta_flux_15m",
        "delta_flux_30m",
        "delta_flux_60m",
        "acceleration_ratio",
        "spike_intensity",
        "max_flux_6h",      # Added historical feature
        "mean_flux_12h",    # Added historical feature
        "std_flux_6h"       # Added historical feature
    ]
    
    df["electron_contaminaton"] = df["electron_contaminaton"].astype(int)
    
    X = df[feature_cols]
    y = df["target"]
    
    print("[INFO] Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    # REPLACED SMOTE WITH NATIVE CLASS WEIGHTING
    # This penalizes the model heavily if it misses an X-class flare, forcing higher recall naturally.
    print("[INFO] Computing sample weights to handle extreme class imbalance...")
    sample_weights = compute_sample_weight(class_weight='balanced', y=y_train)
    
    print("[INFO] Training XGBoost Multi-Class Classifier...")
    model = XGBClassifier(
        n_estimators=200,          # Boosted slightly for deeper learning on new features
        max_depth=6,
        learning_rate=0.05,        # Lowered for more robust convergence
        objective="multi:softprob",
        num_class=4,
        random_state=42,
        n_jobs=-1,
        missing=np.nan             # Natively handles missing values/gaps safely
    )
    
    # Pass the heavy penalty weights directly into the training loop
    model.fit(X_train, y_train, sample_weight=sample_weights)
    
    print("[INFO] Applying tuned Confidence Thresholds...")
    y_probs = model.predict_proba(X_test)
    y_pred = []
    
    # Thresholds adjusted for the new balanced weights (probabilities will naturally sit higher now)
    X_CLASS_THRESHOLD = 0.25
    M_CLASS_THRESHOLD = 0.30
    
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
    print("          PER-CLASS PERFORMANCE BREAKDOWN")
    print("-" * 50)
    
    target_names = ["0: Normal", "1: C-Class", "2: M-Class", "3: X-Class"]
    print(classification_report(y_test, y_pred, target_names=target_names, digits=3))
    
    print("-" * 50)
    print("               CONFUSION MATRIX")
    print("-" * 50)
    
    cm = confusion_matrix(y_test, y_pred)
    cm_df = pd.DataFrame(cm, index=target_names, columns=[f"Pred {t}" for t in target_names])
    print(cm_df)
    print("=" * 50 + "\n")
    
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
    
    print("[SUCCESS] Model trained with native weighting & historical context. Serialized to model.pkl")

if __name__ == "__main__":
    train_model()