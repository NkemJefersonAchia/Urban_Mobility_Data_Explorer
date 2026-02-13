
-- MySQL Schema Definition

-- Drop existing tables if they exist
DROP TABLE IF EXISTS trip_facts;
DROP TABLE IF EXISTS zone_geometries;
DROP TABLE IF EXISTS taxi_zones;
DROP TABLE IF EXISTS data_quality_log;

-- Dimension Table: Taxi Zones
-- Stores the categorical mapping for pickup and dropoff locations
CREATE TABLE taxi_zones (
    location_id INT PRIMARY KEY,
    borough VARCHAR(50) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    service_zone VARCHAR(50),
    INDEX idx_borough (borough),
    INDEX idx_zone (zone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Spatial Metadata Table: Zone Geometries
-- Stores geometry data for each taxi zone from shapefiles
CREATE TABLE zone_geometries (
    location_id INT PRIMARY KEY,
    geometry_type VARCHAR(20),
    coordinates TEXT,
    shape_length DECIMAL(20, 10),
    shape_area DECIMAL(20, 10),
    FOREIGN KEY (location_id) REFERENCES taxi_zones(location_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fact Table: Trip Records
-- Stores cleaned and processed trip-level data with derived features
CREATE TABLE trip_facts (
    trip_id INT AUTO_INCREMENT PRIMARY KEY,
    pickup_datetime DATETIME NOT NULL,
    dropoff_datetime DATETIME NOT NULL,
    passenger_count INT,
    trip_distance DECIMAL(10, 2),
    pickup_location_id INT,
    dropoff_location_id INT,
    rate_code_id INT,
    store_and_fwd_flag CHAR(1),
    payment_type INT,
    fare_amount DECIMAL(10, 2),
    extra DECIMAL(10, 2),
    mta_tax DECIMAL(10, 2),
    tip_amount DECIMAL(10, 2),
    tolls_amount DECIMAL(10, 2),
    improvement_surcharge DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    congestion_surcharge DECIMAL(10, 2),
    airport_fee DECIMAL(10, 2),
    
    -- Derived Features
    trip_duration_minutes INT,
    average_speed_mph DECIMAL(10, 2),
    tip_percentage DECIMAL(10, 2),
    hour_of_day INT,
    day_of_week INT,
    is_weekend BOOLEAN,
    
    FOREIGN KEY (pickup_location_id) REFERENCES taxi_zones(location_id),
    FOREIGN KEY (dropoff_location_id) REFERENCES taxi_zones(location_id),
    
    INDEX idx_pickup_datetime (pickup_datetime),
    INDEX idx_dropoff_datetime (dropoff_datetime),
    INDEX idx_pickup_location (pickup_location_id),
    INDEX idx_dropoff_location (dropoff_location_id),
    INDEX idx_hour_of_day (hour_of_day),
    INDEX idx_day_of_week (day_of_week),
    INDEX idx_trip_distance (trip_distance),
    INDEX idx_total_amount (total_amount),
    INDEX idx_datetime_range (pickup_datetime, dropoff_datetime),
    INDEX idx_location_pair (pickup_location_id, dropoff_location_id),
    INDEX idx_weekend_hour (is_weekend, hour_of_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Quality Log Table
-- Tracks records that were excluded during data cleaning
CREATE TABLE data_quality_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    record_timestamp DATETIME,
    exclusion_reason VARCHAR(255),
    field_name VARCHAR(50),
    field_value VARCHAR(255),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_exclusion_reason (exclusion_reason)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
