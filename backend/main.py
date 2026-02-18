import pandas as pd
import geopandas as gpd
import sqlite3
import os

# --- SETUP ---
BASE_PATH = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BASE_PATH)
DATA_DIR = os.path.join(REPO_ROOT, 'data')

OUTPUT_DIR = os.path.join(BASE_PATH, 'processed')
os.makedirs(OUTPUT_DIR, exist_ok=True)

TRIP_DATA = os.path.join(DATA_DIR, 'yellow_tripdata_2019-01.csv')
ZONE_LOOKUP = os.path.join(DATA_DIR, 'taxi_zone_lookup.csv')
SPATIAL_DATA = os.path.join(DATA_DIR, 'taxi_zones.shp')

DB_NAME = os.path.join(OUTPUT_DIR, 'urban_mobility.db')
GEOJSON_OUT = os.path.join(OUTPUT_DIR, 'taxi_zones_final.json')

print("Starting Urban Mobility Data Pipeline...")

# --- DATA LOADING & INTEGRATION ---
if not os.path.exists(TRIP_DATA):
    print(f"Error: Could not find {TRIP_DATA}")
    exit()

trips = pd.read_csv(TRIP_DATA, low_memory=False)
lookup = pd.read_csv(ZONE_LOOKUP)
zones_spatial = gpd.read_file(SPATIAL_DATA)

df = trips.merge(lookup, left_on='PULocationID', right_on='LocationID', how='left')
df = df.rename(columns={'Borough': 'pu_borough', 'Zone': 'pu_zone'})

# Add dropoff zone/borough
lookup_do = lookup.rename(
    columns={
        'LocationID': 'DOLocationID',
        'Borough': 'do_borough',
        'Zone': 'do_zone',
        'service_zone': 'do_service_zone'
    }
)
df = df.merge(lookup_do, on='DOLocationID', how='left')

# --- CLEANING ---
print("Cleaning data...")
initial_count = len(df)

df['tpep_pickup_datetime'] = pd.to_datetime(df['tpep_pickup_datetime'])
df['tpep_dropoff_datetime'] = pd.to_datetime(df['tpep_dropoff_datetime'])

# Filter outliers
df = df[(df['trip_distance'] > 0) & (df['fare_amount'] > 0) & (df['passenger_count'] > 0)]
print(f"   - Cleaned {initial_count - len(df)} records.")

# --- FEATURE ENGINEERING ---
print("Engineering features...")
df['duration_mins'] = (df['tpep_dropoff_datetime'] - df['tpep_pickup_datetime']).dt.total_seconds() / 60

# Ensure duration is valid for speed calculation
df = df[df['duration_mins'] > 0]
df['avg_speed_mph'] = df['trip_distance'] / (df['duration_mins'] / 60)
df['tip_percentage'] = (df['tip_amount'] / df['fare_amount']) * 100

# Add columns expected by database_handler.py
df['pickup_hour'] = df['tpep_pickup_datetime'].dt.hour

df['fare_range'] = pd.cut(
    df['fare_amount'],
    bins=[0, 5, 10, 20, 50, float('inf')],
    labels=['0-5', '5-10', '10-20', '20-50', '50+'],
    right=False
)

df['distance_category'] = pd.cut(
    df['trip_distance'],
    bins=[0, 1, 3, 5, 10, float('inf')],
    labels=['0-1', '1-3', '3-5', '5-10', '10+'],
    right=False
)

# --- STORAGE ---
print(f"Saving to Database: {DB_NAME}...")
conn = sqlite3.connect(DB_NAME)

df.to_sql('trips', conn, if_exists='replace', index=False)
lookup.to_sql('zones', conn, if_exists='replace', index=False)

print("Exporting GeoJSON...")
zones_spatial.to_file(GEOJSON_OUT, driver='GeoJSON')

conn.close()
print("\nTASK 1 & 2 COMPLETE")
