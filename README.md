# Urban Mobility Data Explorer

A full-stack web application for analyzing NYC taxi trip data, featuring advanced data processing, custom algorithms, and interactive visualizations.

## Video Walkthrough

**Video URL:** [Insert your video link here]

The video walkthrough demonstrates:
1. System architecture overview
2. Data processing pipeline execution
3. Backend API functionality
4. Frontend dashboard features
5. Custom algorithm explanation

## Team Information

**Team Name:** Team 5

**Team Members:**
- Nkem Jeferson Achia
- Muhammed Awwal Achuja

---

## Overview

The Urban Mobility Data Explorer is an enterprise-level application that processes and analyzes real-world NYC taxi trip data. The system provides insights into urban mobility patterns through interactive visualizations and sophisticated data analysis.

The application processes the NYC Taxi & Limousine Commission dataset, including:
- Trip fact records (timestamps, distances, fares)
- Taxi zone dimension data (boroughs, service zones)
- Spatial metadata (GeoJSON polygons)

---

## Features

### Data Processing
- Automated data cleaning and validation
- Custom outlier detection algorithm (IQR-based with manual sorting)
- Feature engineering (derived metrics)
- Data quality logging and transparency

### Database Design
- SQLite relational database
- Optimized queries for analytical performance
- Fact and dimension table structure
- Data integrity constraints

### Backend API
- RESTful API built with Flask
- Multiple analytical endpoints
- Flexible filtering and pagination
- CORS support for frontend integration

### Frontend Dashboard
- Interactive data visualizations (Chart.js)
- Real-time filtering and sorting
- Responsive design with modern styling
- Multiple analysis views (hourly, borough, routes, payment, weekend comparison)
- Single unified JavaScript controller (`app.js`)

### Analytics Features
- Hourly trip pattern analysis
- Borough-level statistics
- Popular route identification
- Weekend vs weekday comparison
- Payment type analysis
- Speed and congestion analysis

---

## Technology Stack

### Backend
- **Language**: Python 3
- **Framework**: Flask
- **Database**: SQLite
- **Data Processing**: Pandas, GeoPandas

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: Chart.js
- **Styling**: Custom CSS (modern design system)
- **Architecture**: Single-page application (SPA) with unified `app.js` controller

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                      │
│  ┌─────────────┐  ┌──────────────────────────────────────┐  │
│  │  index.html │  │  app.js (unified controller)         │  │
│  │  styles.css │  │  - All API calls                     │  │
│  │             │  │  - All visualizations (Chart.js)     │  │
│  │             │  │  - All user interactions             │  │
│  └─────────────┘  └──────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Flask REST API (app.py)                 │   │
│  │  - /api/summary              - /api/borough-analysis │   │
│  │  - /api/trips                - /api/top-routes       │   │
│  │  - /api/hourly-patterns      - /api/payment-analysis │   │
│  │  - /api/weekend-comparison   - /api/health           │   │
│  └──────────────────────────────────────────────────────┘   │
│                    (database_handler.py)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SQLite Database                         │   │
│  │  Tables: trips (fact), zones (dimension)             │   │
│  │  File: backend/processed/urban_mobility.db           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ ETL Pipeline
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Data Processing Layer                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         main.py (Data Pipeline)                      │   │
│  │  - Data Loading     - Outlier Detection (Custom)     │   │
│  │  - Data Cleaning    - Feature Engineering            │   │
│  │  - Validation       - Database Creation              │   │
│  └──────────────────────────────────────────────────────┘   │
│             (custom_algorithms.py)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Database

**Engine:** SQLite  
**Database File:** `backend/processed/urban_mobility.db`

**Tables:**
- `trips` (cleaned + engineered fact table)
  - Columns: rowid (as id), tpep_pickup_datetime, tpep_dropoff_datetime, passenger_count, trip_distance, fare_amount, tip_amount, total_amount, payment_type, pu_borough, pu_zone, do_borough, do_zone, duration_mins, avg_speed_mph, tip_percentage, fare_range, distance_category, pickup_hour
  
- `zones` (dimension table)
  - Columns: LocationID, Borough, Zone, service_zone

---

## Data Processing & Feature Engineering

**Cleaning performed:**
- Invalid distance, fare, passenger counts removed
- Invalid or zero duration removed
- Missing/null values handled
- Outliers detected using custom IQR algorithm

**Engineered features:**
- `duration_mins` = dropoff time − pickup time
- `avg_speed_mph` = trip distance / (duration in hours)
- `tip_percentage` = tip / fare × 100
- `pickup_hour` = hour of pickup timestamp
- `fare_range` = categorical binning (0-5, 5-10, 10-20, 20-50, 50+)
- `distance_category` = categorical binning (0-1, 1-3, 3-5, 5-10, 10+ miles)
- `pu_zone/pu_borough` = pickup location from lookup table
- `do_zone/do_borough` = dropoff location from lookup table

---

## Custom Algorithms (Manual Implementations)

Located in `backend/custom_algorithms.py`

### 1) CustomSort (QuickSort)
- **Purpose:** Sort routes, trips, or any dataset by specified metric  
- **Time Complexity:** O(n log n) average, O(n²) worst case  
- **Space Complexity:** O(log n) for recursion stack

### 2) OutlierDetector (IQR Method)
- **Purpose:** Detect fare/distance outliers without built-in statistical functions  
- **Algorithm:** Manual quartile calculation + manual sorting (no NumPy/Pandas stats)
- **Time Complexity:** O(n log n) (dominated by sorting)  
- **Space Complexity:** O(n) for sorted copy

### 3) TripAggregator (Manual Grouping)
- **Purpose:** Aggregate trips by hour without pandas `.groupby()`  
- **Implementation:** Manual dictionary/list-based grouping  
- **Time Complexity:** O(n)  
- **Space Complexity:** O(k) where k = number of groups

### 4) SpeedAnalyzer
- **Purpose:** Detect congestion hours from hourly speed patterns  
- **Time Complexity:** O(n)  
- **Space Complexity:** O(1) fixed buckets

---

## Known Errors Faced (and Fixes)

### 1) **Frontend not displaying data**
**Cause:** Wrong port in `API_BASE_URL`  
**Fix:** Ensure `app.js` has:
```javascript
const API_BASE_URL = 'http://127.0.0.1:5000/api';
```
NOT `localhost` or port 5500.

### 2) **Trips not showing (empty table)**
**Cause:** Database file doesn't exist or `trips` table was never created  
**Solution:**
- Confirm data files exist in `data/` folder
- Run the pipeline: `python3 backend/main.py`
- Wait for completion (creates `backend/processed/urban_mobility.db`)
- Restart the API

### 3) **"No such column: id" error**
**Cause:** SQLite doesn't have explicit `id` column in trips table  
**Fix:** Query uses `rowid as id` to work around this

### 4) **CORS errors in browser console**
**Cause:** Flask API not allowing cross-origin requests  
**Fix:** `app.py` includes `CORS(app)` to allow frontend requests

---

## Step-by-Step: Run the Application

### Prerequisites
- Python 3 installed
- Data files in `data/` folder:
  - `yellow_tripdata_2019-01.csv`
  - `taxi_zone_lookup.csv`
  - `taxi_zones.shp` (and related shapefile files)

### Step 1: Build the Database

Run the data processing pipeline (this is required once):

```bash
cd backend
python3 main.py
```

**Output:**
```
Starting Urban Mobility Data Pipeline...
Cleaning data...
   - Cleaned X records.
Engineering features...
Saving to Database: backend/processed/urban_mobility.db...
Exporting GeoJSON...

TASK 1 & 2 COMPLETE!
```

This creates:
- `backend/processed/urban_mobility.db` (SQLite database)
- `backend/processed/taxi_zones_final.json` (GeoJSON for spatial use)

**Verify the DB was created:**
```bash
sqlite3 backend/processed/urban_mobility.db "SELECT COUNT(*) FROM trips;"
```

Should return a number > 0 (total trip records).

### Step 2: Start the Backend API

```bash
cd backend
python3 app.py
```

**Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

API is now running at: `http://127.0.0.1:5000`

### Step 3: Open the Frontend

Option A: Open directly in browser
```bash
open frontend/index.html
# or
firefox frontend/index.html
```

Option B: Serve with a local HTTP server
```bash
cd frontend
python3 -m http.server 5500
# Then open http://127.0.0.1:5500
```

**Expected result:** Dashboard loads, filters work, charts display data.

---

## Project Structure

```
Urban_Mobility_Data_Explorer/
├── backend/
│   ├── app.py                      # Flask API application
│   ├── main.py                     # Data processing pipeline
│   ├── database_handler.py         # SQLite query handler
│   ├── custom_algorithms.py        # Custom Sort, OutlierDetector, etc.
│   └── processed/
│       ├── urban_mobility.db       # SQLite database (created by main.py)
│       └── taxi_zones_final.json   # GeoJSON export (created by main.py)
├── frontend/
│   ├── index.html                  # Main dashboard HTML
│   ├── styles.css                  # Modern design system CSS
│   └── app.js                      # Unified controller (all logic)
├── data/
│   ├── yellow_tripdata_2019-01.csv # Trip records (download separately)
│   ├── taxi_zone_lookup.csv        # Zone lookup (download separately)
│   └── taxi_zones.*                # Shapefile components (download separately)
└── README.md                       # This file
```

---

## API Endpoints

### `GET /api/health`
Health check

**Response:**
```json
{"status": "ok"}
```

### `GET /api/summary`
Overall dataset statistics

**Response:**
```json
{
  "total_trips": 1000000,
  "avg_distance": 3.45,
  "avg_fare": 18.50,
  "avg_duration": 15.2,
  "avg_speed": 13.6,
  "avg_tip_pct": 18.5
}
```

### `GET /api/trips?limit=50&offset=0&borough=Manhattan&min_fare=10&max_fare=50&hour=18&is_weekend=false`
Get trips with optional filtering

**Query Parameters:**
- `limit` (int): records per page (default: 100)
- `offset` (int): pagination offset (default: 0)
- `borough` (string): pickup borough filter
- `min_fare`, `max_fare` (float): fare range
- `min_distance`, `max_distance` (float): distance range
- `start_date`, `end_date` (YYYY-MM-DD): date range
- `hour` (int): 0-23, pickup hour
- `is_weekend` (true/false): weekend trips only

**Response:**
```json
{
  "trips": [
    {
      "id": 1,
      "tpep_pickup_datetime": "2019-01-01T12:30:00",
      "trip_distance": 3.5,
      "fare_amount": 15.50,
      "pu_zone": "Midtown",
      "do_zone": "Upper East Side"
    }
  ]
}
```

### `GET /api/hourly-patterns`
Trip patterns by hour of day

### `GET /api/borough-analysis`
Statistics grouped by NYC borough

### `GET /api/top-routes?limit=20`
Most popular pickup→dropoff routes

### `GET /api/payment-analysis`
Payment type distribution and tipping

### `GET /api/weekend-comparison`
Weekend vs weekday comparison

---

## Custom Algorithm: Outlier Detection

**File:** `backend/custom_algorithms.py`

**Class:** `OutlierDetector`

### Algorithm Overview

Implements IQR (Interquartile Range) based outlier detection using custom sorting (no built-in stats libraries).

### Pseudo-code

```
ALGORITHM: IQR-Based Outlier Detection

INPUT: data_array (list of numbers), multiplier (default 1.5)
OUTPUT: outlier_indices, bounds, quartiles

1. sorted_data = CustomSort.quick_sort(data_array)
2. n = length(sorted_data)
3. q1_idx = floor(n * 0.25)
4. q3_idx = floor(n * 0.75)
5. q1 = sorted_data[q1_idx]
6. q3 = sorted_data[q3_idx]
7. iqr = q3 - q1
8. lower_bound = q1 - (multiplier * iqr)
9. upper_bound = q3 + (multiplier * iqr)
10. FOR each (i, value) in data_array:
      IF value < lower_bound OR value > upper_bound THEN
         outlier_indices.add(i)
11. RETURN {outlier_indices, bounds, q1, q3, iqr}
```

### Complexity Analysis

- **Time:** O(n log n) (dominated by QuickSort)
- **Space:** O(n) for sorted copy

### Usage

```python
detector = OutlierDetector()
outliers = detector.detect_outliers(trip_distances)
print(f"Found {len(outliers['outlier_indices'])} outliers")
print(f"Bounds: [{outliers['lower_bound']}, {outliers['upper_bound']}]")
```

---

## Data Quality & Cleaning

**Cleaning steps:**
1. Load raw CSV trip data
2. Join with zone lookup (pickup and dropoff)
3. Normalize timestamps to datetime
4. Filter out invalid records:
   - Distance ≤ 0 or > 200 miles
   - Fare ≤ 0 or > $500
   - Passenger count ≤ 0 or > 8
   - Duration ≤ 0 or > 24 hours
5. Detect outliers using custom IQR algorithm
6. Calculate derived features
7. Create SQLite database

**Transparency:** Pipeline logs the number of excluded records and reasons.

---

## Frontend Dashboard Overview

### Components

1. **Header**
   - Title and subtitle
   - Quick stats (total trips, avg fare, etc.)

2. **Filter Panel**
   - Date range picker
   - Fare range slider
   - Distance range slider
   - Hour of day selector
   - Weekend/weekday toggle
   - Apply/Reset buttons

3. **Tabs (Visualizations)**
   - **Hourly Patterns:** Trips and fares by hour
   - **Borough Analysis:** Stats by NYC borough
   - **Popular Routes:** Most traveled origin→destination pairs
   - **Weekend Comparison:** Side-by-side metrics
   - **Payment Analysis:** Payment type breakdown + tipping
   - **Trips Table:** Filtered list with pagination

4. **Design System**
   - Modern colors (blue #2563eb accent)
   - Consistent spacing (8px grid)
   - Smooth animations (cubic-bezier easing)
   - Loading skeletons for data
   - Responsive layout

---

## Troubleshooting

### API not responding
```bash
# Check if Flask is running
curl http://127.0.0.1:5000/api/health

# Check backend logs for errors
python3 app.py  # should show debug output
```

### Port 5000 already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill it (macOS/Linux)
kill -9 <PID>

# Or change port in app.py:
if __name__ == '__main__':
    app.run(debug=True, port=5001)
```

### Database file not found
```bash
# Ensure main.py ran successfully
python3 backend/main.py

# Verify file exists
ls -la backend/processed/urban_mobility.db
```

### Frontend CORS errors
```bash
# Ensure API_BASE_URL in app.js matches running Flask server:
const API_BASE_URL = 'http://127.0.0.1:5000/api';
```

### Data not loading
1. Verify data files are in `data/` folder
2. Check file paths in `main.py`
3. Re-run pipeline: `python3 backend/main.py`
4. Restart API: `python3 app.py`
5. Refresh frontend

---

## Summary

This system demonstrates a complete full-stack data engineering pipeline:
- **Backend:** Python, Flask, SQLite, custom algorithms
- **Frontend:** HTML/CSS/JavaScript with Chart.js visualizations
- **Data:** Real-world NYC taxi dataset with cleaning + feature engineering
- **Architecture:** Clean separation of concerns, efficient queries, modern UI

The custom algorithm implementation (outlier detection with manual sorting) shows algorithmic thinking applied to real data problems, without relying on built-in statistical libraries.

---

**Created:** February 2026  
**Team 5:** Nkem Jeferson Achia, Muhammed Awwal Achuja