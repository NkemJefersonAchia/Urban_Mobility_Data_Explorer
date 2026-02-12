# Urban Mobility Data Explorer

A full-stack web application for analyzing NYC taxi trip data, featuring advanced data processing, custom algorithms, and interactive visualizations.

## Table of Contents
- [Video Walkthrough](#video-walkthrough)
- [Team Information](#team-information)
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Custom Algorithm Implementation](#custom-algorithm-implementation)


## Video Walkthrough

**Video URL:** [Insert your video link here]

The video walkthrough demonstrates:
1. System architecture overview
2. Data processing pipeline execution
3. Backend API functionality
4. Frontend dashboard features
5. Custom algorithm explanation
6. Key insights from the data

## Team Information

**Team Name:** Team 5

**Team Members:**
- Nkem Jeferson Achia
- Muhammed Awwal Achuja

## Overview

The Urban Mobility Data Explorer is an enterprise-level application that processes and analyzes real-world NYC taxi trip data. The system provides insights into urban mobility patterns through interactive visualizations and sophisticated data analysis.

The application processes the NYC Taxi & Limousine Commission dataset, including:
- Trip fact records (timestamps, distances, fares)
- Taxi zone dimension data (boroughs, service zones)
- Spatial metadata (GeoJSON polygons)

## Features

### Data Processing
- Automated data cleaning and validation
- Custom outlier detection algorithm (IQR-based with QuickSort)
- Feature engineering (derived metrics)
- Data quality logging and transparency

### Database Design
- Normalized relational schema (PostgreSQL)
- Optimized indexing for query performance
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
- Responsive design
- Multiple analysis views (hourly, borough, routes, payment)

### Analytics Features
- Hourly trip pattern analysis
- Borough-level statistics
- Popular route identification
- Weekend vs weekday comparison
- Payment type analysis
- Data quality monitoring

## Technology Stack

### Backend
- **Language**: Python 3.8+
- **Framework**: Flask 3.0.0
- **Database**: PostgreSQL
- **Data Processing**: Pandas, PyArrow
- **Environment**: python-dotenv

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: Chart.js 4.4.0
- **Styling**: Custom CSS (no frameworks)
- **Architecture**: Single-page application

### Database
- **RDBMS**: PostgreSQL 12+
- **Schema**: Normalized relational design
- **Features**: Indexing, constraints, foreign keys

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  HTML/CSS   │  │  JavaScript  │  │   Chart.js       │    │
│  │  Dashboard  │  │  Controller  │  │  Visualizations  │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Flask REST API (app.py)                 │   │
│  │  - /api/statistics    - /api/borough-analysis        │   │
│  │  - /api/trips         - /api/popular-routes          │   │
│  │  - /api/hourly        - /api/weekend-comparison      │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │  trip_facts  │  │ taxi_zones  │  │ zone_geometries  │    │
│  │  (Fact)      │  │ (Dimension) │  │   (Spatial)      │    │
│  └──────────────┘  └─────────────┘  └──────────────────┘    │
│                    PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ ETL Pipeline
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Data Processing Layer                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Data Processor (data_processor.py)           │   │
│  │  - Data Loading     - Outlier Detection (Custom)     │   │
│  │  - Data Cleaning    - Feature Engineering            │   │
│  │  - Validation       - Quality Logging                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites
- Python 3.8 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)
- Git

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd urban-mobility-explorer
```

### Step 2: Set Up PostgreSQL Database
```bash
# Install PostgreSQL (if not already installed)
# On Ubuntu/Debian:
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# On macOS:
brew install postgresql

# Start PostgreSQL service
sudo service postgresql start  # Linux
brew services start postgresql  # macOS

# Create database
sudo -u postgres psql
CREATE DATABASE urban_mobility;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE urban_mobility TO your_user;
\q
```

### Step 3: Set Up Python Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
```bash
# Copy environment template
cp .env.template .env

# Edit .env file with your database credentials
nano .env  # or use your preferred editor
```

Update the following variables in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=urban_mobility
DB_USER=your_user
DB_PASSWORD=your_password

PARQUET_FILE=../data/yellow_tripdata.parquet
ZONE_LOOKUP_FILE=../data/taxi_zone_lookup.csv
ZONE_GEOMETRY_FILE=../data/taxi_zones.json
```

### Step 5: Download Data Files
```bash
# Create data directory
mkdir -p ../data

# Download the required files from NYC TLC website:
# 1. yellow_tripdata.parquet - Trip records
# 2. taxi_zone_lookup.csv - Zone lookup table
# 3. taxi_zones.json - GeoJSON geometries

# Place downloaded files in the data directory
```

### Step 6: Load Data into Database
```bash
# Run the data loading pipeline
python load_data.py
```

This process will:
1. Load raw data from Parquet and CSV files
2. Clean and validate the data
3. Apply custom outlier detection
4. Engineer derived features
5. Create database schema
6. Insert all processed data
7. Generate data quality reports

Expected output:
```
URBAN MOBILITY DATA EXPLORER - DATA LOADING PIPELINE
======================================================================

STEP 1: Loading raw data files
----------------------------------------------------------------------
Loading data from ../data/yellow_tripdata.parquet...
Loaded X records
...

DATA LOADING PIPELINE COMPLETED SUCCESSFULLY
======================================================================
```

## Usage

### Starting the Backend API

```bash
# Ensure you are in the backend directory with virtual environment activated
cd backend
source venv/bin/activate  # if not already activated

# Start Flask server
python app.py
```

The API will be available at: `http://localhost:5000`

### Starting the Frontend

Option 1: Using Python's built-in HTTP server
```bash
# Navigate to frontend directory
cd frontend

# Start HTTP server
python3 -m http.server 8000
```

Option 2: Using any web server (nginx, Apache, etc.)
Point your web server to the `frontend` directory.

Access the dashboard at: `http://localhost:8000`

### Using the Dashboard

1. **Overview Statistics**: View overall trip statistics at the top of the page
2. **Filters**: Use the filter panel to narrow down trip data by:
   - Date range
   - Distance (min/max)
   - Fare amount (min/max)
   - Hour of day
   - Weekend/weekday
3. **Visualizations**: Navigate between different analysis views using tabs:
   - Hourly Patterns: Trip volume and fares by hour
   - Borough Analysis: Statistics grouped by NYC borough
   - Popular Routes: Most frequently traveled pickup-dropoff pairs
   - Weekend vs Weekday: Comparative analysis
   - Payment Analysis: Payment type distribution and tipping behavior
   - Trip Details: Filtered list of individual trips

## API Endpoints

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-12T10:30:00"
}
```

### GET /api/statistics
Get overall dataset statistics

**Response:**
```json
{
  "total_trips": 1000000,
  "avg_distance": 3.45,
  "avg_duration": 15.2,
  "avg_fare": 18.50,
  "avg_tip_percentage": 18.5,
  "earliest_trip": "2024-01-01T00:00:00",
  "latest_trip": "2024-01-31T23:59:59"
}
```

### GET /api/trips
Get trip records with filtering and pagination

**Query Parameters:**
- `limit` (int): Number of records (default: 100, max: 1000)
- `offset` (int): Pagination offset (default: 0)
- `min_distance` (float): Minimum trip distance
- `max_distance` (float): Maximum trip distance
- `min_fare` (float): Minimum fare amount
- `max_fare` (float): Maximum fare amount
- `start_date` (string): Start date (YYYY-MM-DD)
- `end_date` (string): End date (YYYY-MM-DD)
- `pickup_zone` (int): Pickup location ID
- `dropoff_zone` (int): Dropoff location ID
- `hour` (int): Hour of day (0-23)
- `day_of_week` (int): Day of week (0-6)
- `is_weekend` (boolean): Weekend trips only

**Example:**
```
GET /api/trips?min_distance=5&max_distance=10&hour=18&limit=50
```

### GET /api/zones
Get all taxi zones

**Response:**
```json
{
  "zones": [
    {
      "location_id": 1,
      "borough": "Manhattan",
      "zone": "Upper East Side",
      "service_zone": "Yellow Zone"
    }
  ]
}
```

### GET /api/hourly-analysis
Get trip statistics grouped by hour of day

**Response:**
```json
{
  "hourly_analysis": [
    {
      "hour_of_day": 0,
      "trip_count": 5000,
      "avg_distance": 3.2,
      "avg_duration": 14.5,
      "avg_fare": 17.80,
      "avg_tip_percentage": 18.2
    }
  ]
}
```

### GET /api/borough-analysis
Get trip statistics grouped by borough

### GET /api/popular-routes
Get most popular pickup-dropoff route pairs

**Query Parameters:**
- `limit` (int): Number of routes to return (default: 10, max: 100)

### GET /api/weekend-comparison
Compare weekend vs weekday trip patterns

### GET /api/payment-analysis
Analyze payment types and tipping behavior

### GET /api/data-quality
Get data quality log statistics

## Custom Algorithm Implementation

### Custom Outlier Detection with QuickSort

As required by the assignment, we have implemented a custom outlier detection algorithm without relying on built-in statistical libraries.

**File:** `backend/data_processor.py`

**Class:** `CustomOutlierDetector`

#### Algorithm Overview

The algorithm implements IQR (Interquartile Range) based outlier detection with a custom QuickSort implementation for sorting numerical data.

#### Implementation Details

**1. QuickSort Algorithm**
```python
def quick_sort(self, arr, low, high):
    """
    Custom QuickSort implementation
    
    Time Complexity: O(n log n) average case
    Space Complexity: O(log n) due to recursion
    """
```

**2. Quartile Calculation**
```python
def calculate_quartiles(self, sorted_data):
    """
    Manually calculate Q1, Q2 (median), and Q3
    
    Time Complexity: O(1) after sorting
    """
```

**3. Outlier Detection**
```python
def detect_outliers(self, data_series, multiplier=1.5):
    """
    Detect outliers using IQR method
    
    Returns outlier indices and statistical bounds
    """
```

#### Pseudo-code

```
ALGORITHM: IQR-Based Outlier Detection with QuickSort

INPUT: data_series (array of numerical values), multiplier (default 1.5)
OUTPUT: Dictionary containing outlier_indices, bounds, and statistics

1. Remove null/invalid values from data_series
2. Create sorted_data = copy of clean_data
3. CALL quick_sort(sorted_data, 0, length-1)
   
   QuickSort Process:
   a. IF low < high THEN
      - pivot_index = partition(array, low, high)
      - quick_sort(array, low, pivot_index-1)
      - quick_sort(array, pivot_index+1, high)
   
4. CALL calculate_quartiles(sorted_data)
   
   Quartile Calculation:
   a. n = length(sorted_data)
   b. q1_position = n * 0.25
   c. q2_position = n * 0.50  (median)
   d. q3_position = n * 0.75
   e. Interpolate values at these positions
   f. RETURN (q1, q2, q3)

5. iqr = q3 - q1
6. lower_bound = q1 - (multiplier * iqr)
7. upper_bound = q3 + (multiplier * iqr)

8. FOR each value in original data_series:
      IF value < lower_bound OR value > upper_bound THEN
         Add index to outlier_indices

9. RETURN {outlier_indices, bounds, quartiles}
```

#### Complexity Analysis

**Time Complexity:**
- QuickSort: O(n log n) average case, O(n²) worst case
- Quartile Calculation: O(1) after sorting
- Outlier Detection: O(n) for scanning original array
- **Overall: O(n log n)**

**Space Complexity:**
- Sorted array copy: O(n)
- Recursion stack for QuickSort: O(log n)
- Outlier indices list: O(k) where k is number of outliers
- **Overall: O(n)**

#### Usage in Pipeline

The custom algorithm is used in the data cleaning process to detect extreme outliers in trip distance and fare amounts:

```python
# Example from data_processor.py
distance_outliers = self.outlier_detector.detect_outliers(
    df['trip_distance'].tolist()
)

print(f"Q1: {distance_outliers['q1']}")
print(f"Q3: {distance_outliers['q3']}")
print(f"IQR: {distance_outliers['iqr']}")
print(f"Outliers found: {len(distance_outliers['outlier_indices'])}")
```

This approach allows us to identify anomalous data points while maintaining full control over the statistical calculations, demonstrating algorithmic thinking in a real-world data engineering context.



## Project Structure

```
urban-mobility-explorer/
├── backend/
│   ├── app.py                  # Flask API application
│   ├── data_processor.py       # Data processing and custom algorithm
│   ├── database.py             # Database operations
│   ├── load_data.py            # Data loading pipeline
│   ├── requirements.txt        # Python dependencies
│   ├── .env.template           # Environment variables template
│   └── .env                    # Environment variables (not in git)
├── frontend/
│   ├── index.html              # Main dashboard page
│   ├── styles.css              # Stylesheet
│   └── app.js                  # Frontend application logic
├── database/
│   └── schema.sql              # Database schema definition
├── data/
│   ├── yellow_tripdata.parquet # Trip records (download separately)
│   ├── taxi_zone_lookup.csv    # Zone lookup (download separately)
│   ├── taxi_zones.json         # Zone geometries (download separately)
│   └── data_quality_log.csv    # Generated quality log
├── docs/
│   └── technical_report.pdf    # Technical documentation
└── README.md                   # This file
```

## Data Quality and Cleaning

The data cleaning process handles:

1. **Missing Values**: Records with missing critical timestamps are excluded
2. **Duplicates**: Duplicate trip records are removed
3. **Invalid Passenger Counts**: Trips with <= 0 or > 8 passengers are filtered
4. **Invalid Distances**: Trips with distance <= 0 or > 200 miles are excluded
5. **Invalid Fares**: Trips with fare <= 0 or > $500 are removed
6. **Temporal Inconsistencies**: Trips with duration <= 0 or > 24 hours are excluded
7. **Outlier Detection**: Extreme outliers in distance and fare are identified using custom IQR algorithm

All exclusions are logged in the `data_quality_log` table with reasons for transparency.

## Derived Features

The following features are engineered from raw data:

1. **trip_duration_minutes**: Trip duration calculated from pickup and dropoff timestamps
2. **average_speed_mph**: Speed calculated as distance divided by time in hours
3. **tip_percentage**: Tip amount as percentage of base fare
4. **hour_of_day**: Hour when trip started (0-23)
5. **day_of_week**: Day of week (0=Monday, 6=Sunday)
6. **is_weekend**: Boolean flag for weekend trips (Saturday/Sunday)

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Verify database exists
sudo -u postgres psql -c "\l"

# Check user permissions
sudo -u postgres psql -c "\du"
```

### Port Already in Use
```bash
# If port 5000 is in use, change in app.py:
app.run(debug=True, host='0.0.0.0', port=5001)

# Update API_BASE_URL in frontend/app.js accordingly
```

### Data Loading Errors
- Ensure data files are in correct location specified in .env
- Verify file formats match expected schemas
- Check PostgreSQL disk space and memory limits

## License

This project is created for educational purposes as part of an academic assignment.

## Acknowledgments

- NYC Taxi & Limousine Commission for providing the dataset
- Flask and PostgreSQL communities for excellent documentation
- Chart.js for visualization capabilities