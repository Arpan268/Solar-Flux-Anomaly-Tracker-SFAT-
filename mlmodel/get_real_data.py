import pandas as pd
import json
import joblib

# Load actual dataset and model
df = pd.read_csv("solar_flux_training_data.csv")
model_bundle = joblib.load("model.pkl")
model = model_bundle["model"]

# Compute the engineered features
df['acceleration_ratio'] = df['delta_flux_15m'] / (df['delta_flux_60m'] + 1e-8)
df['spike_intensity'] = df['delta_flux_15m'] - df['delta_flux_30m']

features = [
    "electron_correction", "electron_contaminaton", 
    "delta_flux_15m", "delta_flux_30m", "delta_flux_60m", 
    "acceleration_ratio", "spike_intensity"
]

# Drop NaNs to allow model prediction
df_clean = df.dropna(subset=features).copy()
X = df_clean[features]

# Get the model's confidence for every single row
probs = model.predict_proba(X)

def get_confident_payload(target_class, name, class_index):
    # Find rows where the true label matches AND the model is highly confident (> 60%)
    true_mask = df_clean["target"] == target_class
    conf_mask = probs[:, class_index] > 0.60
    
    valid_rows = df_clean[true_mask & conf_mask]
    
    if valid_rows.empty:
        print(f"\n[!] Could not find a >60% confident row for {name}")
        return
        
    # Grab the best, most confident row
    row = valid_rows.iloc[0]
    
    payload = {
        "electron_correction": float(row["electron_correction"]),
        "electron_contaminaton": int(row["electron_contaminaton"]),
        "delta_flux_15m": float(row["delta_flux_15m"]),
        "delta_flux_30m": float(row["delta_flux_30m"]),
        "delta_flux_60m": float(row["delta_flux_60m"]),
        "acceleration_ratio": float(row["acceleration_ratio"]),
        "spike_intensity": float(row["spike_intensity"])
    }
    
    print(f"\n--- HIGH CONFIDENCE {name} PAYLOAD ---")
    print(f"(Model's internal raw confidence: {probs[valid_rows.index[0], class_index]*100:.1f}%)")
    print(json.dumps(payload, indent=2))

# Extract guaranteed perfect examples
get_confident_payload(0, "NORMAL (Green)", 0)
get_confident_payload(1, "C-CLASS (Yellow Alert)", 1)
get_confident_payload(2, "M-CLASS (Orange Alert)", 2)
get_confident_payload(3, "X-CLASS (Red Alert)", 3)