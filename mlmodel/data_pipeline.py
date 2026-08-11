import os
import urllib.request
import ssl
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import xarray as xr
import tempfile

# Root directories for modern satellites
URLS_MODERN = [
    "https://data.ngdc.noaa.gov/platforms/solar-space-observing-satellites/goes/goes16/l2/data/xrsf-l2-avg1m/",
    "https://data.ngdc.noaa.gov/platforms/solar-space-observing-satellites/goes/goes18/l2/data/xrsf-l2-avg1m/"
]

# Direct links to specific peak activity months for legacy data
URLS_LEGACY = [
    "https://www.ncei.noaa.gov/data/goes-space-environment-monitor/access/avg/2012/07/", 
    "https://www.ncei.noaa.gov/data/goes-space-environment-monitor/access/avg/2013/11/", 
    "https://www.ncei.noaa.gov/data/goes-space-environment-monitor/access/avg/2014/02/", 
    "https://www.ncei.noaa.gov/data/goes-space-environment-monitor/access/avg/2003/10/", 
    "https://www.ncei.noaa.gov/data/goes-space-environment-monitor/access/avg/2003/11/"  
]

def get_ssl_context():
    """Bypasses strict Windows SSL certificate verification that drops NOAA connections"""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def scrape_file_links(directory_url, max_files=35):
    try:
        req = urllib.request.Request(
            directory_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=60, context=get_ssl_context()) as response:
            html = response.read().decode('utf-8')
        
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        
        for a_tag in soup.find_all('a'):
            href = a_tag.get('href')
            if not href:
                continue
                
            # Filter modern files: Only grab .nc files from the years 2020 to 2026
            if directory_url in URLS_MODERN:
                if href.endswith('.nc') and any(f"y{year}" in href for year in range(2020, 2027)):
                    full_url = directory_url + href if not href.startswith('http') else href
                    links.append(full_url)
            # Filter legacy files: Grab the .csv files
            else:
                if href.endswith('.csv'):
                    full_url = directory_url + href if not href.startswith('http') else href
                    links.append(full_url)

            if len(links) >= max_files:
                break
                
        return links
    except Exception as e:
        print(f"[ERROR] Failed to scrape {directory_url}: {e}")
        return []

def process_satellite_file(file_url, temp_dir):
    file_name = file_url.split('/')[-1]
    file_path = os.path.join(temp_dir, file_name)
    
    try:
        req = urllib.request.Request(
            file_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=60, context=get_ssl_context()) as response, open(file_path, 'wb') as out_file:
            
            # STREAMING FIX: Read the massive file in 1 MB chunks to prevent SSL buffer corruption
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                out_file.write(chunk)
        
        if file_name.endswith('.nc'):
            ds = xr.open_dataset(file_path)
            df = ds.to_dataframe().reset_index()
            ds.close()
        else:
            df = pd.read_csv(file_path)

        time_cols = [c for c in df.columns if 'time' in c.lower() or 'date' in c.lower()]
        if time_cols:
            df['time_tag'] = pd.to_datetime(df[time_cols[0]])
        else:
            return None

        flux_keys = ['xrsb_flux', 'B_FLUX', 'xl', 'flux']
        found_key = next((k for k in flux_keys if k in df.columns), None)
        
        if found_key:
            df.rename(columns={found_key: 'flux'}, inplace=True)
        else:
            return None 

        return df[['time_tag', 'flux']].dropna()

    except Exception as e:
        print(f"[WARNING] Could not process {file_name}: {e}")
        return None
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

def fetch_and_standardize_data(output_path="solar_flux_training_data.csv"):
    print("[INFO] Initiating NOAA Historical Data Extraction...")
    all_directories = URLS_MODERN + URLS_LEGACY
    
    dataframes = []
    with tempfile.TemporaryDirectory() as temp_dir:
        for url in all_directories:
            print(f"[INFO] Scraping directory: {url}")
            file_links = scrape_file_links(url, max_files=35)
            
            for link in file_links:
                df = process_satellite_file(link, temp_dir)
                if df is not None and not df.empty:
                    df['observed_flux'] = df['flux'] * 1.05
                    df['electron_correction'] = 0.0
                    df['electron_contaminaton'] = False
                    df['energy'] = "0.1-0.8nm"
                    dataframes.append(df)

    if not dataframes:
        print("[ERROR] No data could be extracted. Check network or NOAA directory structure.")
        return None

    master_df = pd.concat(dataframes, ignore_index=True)
    master_df = master_df.sort_values("time_tag").reset_index(drop=True)

    master_df["delta_flux_15m"] = master_df["flux"].diff(periods=1).fillna(0)
    master_df["delta_flux_30m"] = master_df["flux"].diff(periods=2).fillna(0)
    master_df["delta_flux_60m"] = master_df["flux"].diff(periods=4).fillna(0)

    def assign_flare_class(row):
        flux = row["flux"]
        if flux >= 1e-4:
            return 3
        elif flux >= 1e-5:
            return 2
        elif flux >= 1e-6:
            return 1
        else:
            return 0

    master_df["target"] = master_df.apply(assign_flare_class, axis=1)

    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    master_df.to_csv(output_path, index=False)
    print(f"[SUCCESS] Historical dataset compiled with {len(master_df)} records. Saved to {output_path}")
    return master_df

if __name__ == "__main__":
    fetch_and_standardize_data()