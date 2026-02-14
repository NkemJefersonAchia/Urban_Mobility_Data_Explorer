import pandas as pd
import geopandas as gpd
import sqlite3
import os

# --- 1. DYNAMIC FILE PATHING ---
# This ensures Python looks in the same folder where this script is saved
BASE_PATH = os.path.dirname(os.path.abspath(__file__))

TRIP_DATA = os.path.join(BASE_PATH, 'yellow_tripdata_2019-01.csv')
ZONE_LOOKUP = os.path.join(BASE_PATH, 'taxi_zone_lookup.csv')
SPATIAL_DATA = os.path.join(BASE_PATH, 'taxi_zones.shp')
DB_NAME = os.path.join(BASE_PATH, 'urban_mobility.db')

print("Starting Urban Mobility Data Pipeline...")

# --- 2. DATA LOADING & INTEGRATION ---
print(f"📥 Loading Trip Data: {TRIP_DATA}")
if not os.path.exists(TRIP_DATA):
    print(f"Error: Could not find {TRIP_DATA} in the folder!")
    exit()

# Loading the CSV (low_memory=False handles large file types better)
trips = pd.read_csv(TRIP_DATA, low_memory=False)

print(f"Loading Lookup & Spatial Files...")
lookup = pd.read_csv(ZONE_LOOKUP)
zones_spatial = gpd.read_file(SPATIAL_DATA)

# Join trips with names for Pickup (PU) and Dropoff (DO) locations
df = trips.merge(lookup, left_on='PULocationID', right_on='LocationID', how='left')
df = df.rename(columns={'Borough': 'pu_borough', 'Zone': 'pu_zone'})

# --- 3. DATA INTEGRITY & CLEANING ---
print("Cleaning data and standardizing types...")
initial_count = len(df)

# Standardize Timestamps (CSV loads them as text)
df['tpep_pickup_datetime'] = pd.to_datetime(df['tpep_pickup_datetime'])
df['tpep_dropoff_datetime'] = pd.to_datetime(df['tpep_dropoff_datetime'])

# Remove illogical outliers (Requirement: Data Integrity)
# We filter out 0 distance, 0 passengers, and negative fares
df = df[(df['trip_distance'] > 0) & (df['fare_amount'] > 0) & (df['passenger_count'] > 0)]

print(f"   - Cleaned {initial_count - len(df)} suspicious records.")

# --- 4. FEATURE ENGINEERING (The 3 Derived Features) ---
print("Engineering derived features...")

# Feature 1: Trip Duration (Minutes)
df['duration_mins'] = (df['tpep_dropoff_datetime'] - df['tpep_pickup_datetime']).dt.total_seconds() / 60

# Feature 2: Average Speed (MPH)
# Filtering duration > 0 to avoid division by zero
df = df[df['duration_mins'] > 0]
df['avg_speed_mph'] = df['trip_distance'] / (df['duration_mins'] / 60)

# Feature 3: Tip Percentage
df['tip_percentage'] = (df['tip_amount'] / df['fare_amount']) * 100

# --- 5. DATABASE & SPATIAL STORAGE ---
print(f"Saving to SQLite Database: {DB_NAME}...")
conn = sqlite3.connect(DB_NAME)

# Save the main fact table
df.to_sql('trips', conn, if_exists='replace', index=False)

# Save the zone lookup as a dimension table for a proper relational schema
lookup.to_sql('zones', conn, if_exists='replace', index=False)

# Export GeoJSON for Task 3 (Frontend Map)
print("Exporting GeoJSON...")
zones_spatial.to_file(os.path.join(BASE_PATH, "taxi_zones_final.json"), driver='GeoJSON')

conn.close()
print("\n TASK 1 & 2 SETUP COMPLETE!")
print(f"Generated: {DB_NAME}")
print(f"Generated: taxi_zones_final.json")x
