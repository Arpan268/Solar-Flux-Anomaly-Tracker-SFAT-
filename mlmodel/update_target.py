import pandas as pd

def update_csv_targets():
    file_path = "solar_flux_training_data.csv"
    
    print("[INFO] Loading existing dataset from disk...")
    df = pd.read_csv(file_path)
    
    print("[INFO] Sorting by time to ensure rolling window accuracy...")
    df['time_tag'] = pd.to_datetime(df['time_tag'])
    df = df.sort_values("time_tag").reset_index(drop=True)
    
    print("[INFO] Applying 24-hour forward rolling window (96 periods)...")
    indexer = pd.api.indexers.FixedForwardWindowIndexer(window_size=96)
    df['max_flux_next_24h'] = df['flux'].rolling(window=indexer, min_periods=1).max()
    
    def assign_future_flare_class(row):
        future_flux = row["max_flux_next_24h"]
        if future_flux >= 1e-4:
            return 3
        elif future_flux >= 1e-5:
            return 2
        elif future_flux >= 1e-6:
            return 1
        else:
            return 0
            
    print("[INFO] Reassigning target classes for future prediction...")
    df["target"] = df.apply(assign_future_flare_class, axis=1)
    
    # Drop the temporary calculation column
    df = df.drop(columns=['max_flux_next_24h'])
    
    print(f"[INFO] Overwriting {file_path} with updated targets...")
    df.to_csv(file_path, index=False)
    print("[SUCCESS] Dataset updated successfully! You can now run train.py.")

if __name__ == "__main__":
    update_csv_targets()