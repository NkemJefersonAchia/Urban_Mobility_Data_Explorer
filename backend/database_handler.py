"""
Database Handler - SQLite Interface
Connects to urban_mobility.db
DO NOT RUN THIS FILE DIRECTLY because It's imported by app.py
"""
import sqlite3
import os

class DatabaseHandler:
    """Handles all database connections and queries"""
    
    def __init__(self):
        base_path = os.path.dirname(os.path.abspath(__file__))
        self.db_path = os.path.join(base_path, 'processed', 'urban_mobility.db')
    
    def get_connection(self):
        """Create and return database connection"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Return rows as dictionaries
            return conn
        except Exception as e:
            print(f"Error connecting to SQLite: {e}")
            return None
    
    def execute_query(self, query, params=None):
        """Execute a query and return results"""
        conn = self.get_connection()
        if not conn:
            return None
        
        try:
            cursor = conn.cursor()
            cursor.execute(query, params or ())
            
            # Convert rows to dictionaries
            columns = [description[0] for description in cursor.description]
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            return results
        except Exception as e:
            print(f"Error executing query: {e}")
            return None
        finally:
            conn.close()
    
    def get_summary_stats(self):
        """Get overall summary statistics"""
        query = """
        SELECT 
            COUNT(*) as total_trips,
            AVG(trip_distance) as avg_distance,
            AVG(fare_amount) as avg_fare,
            AVG(total_amount) as avg_total,
            AVG(passenger_count) as avg_passengers,
            SUM(fare_amount) as total_revenue,
            AVG(duration_mins) as avg_duration,
            AVG(avg_speed_mph) as avg_speed,
            AVG(tip_percentage) as avg_tip_pct,
            MIN(tpep_pickup_datetime) as earliest_trip,
            MAX(tpep_pickup_datetime) as latest_trip
        FROM trips
        """
        result = self.execute_query(query)
        return result[0] if result else {}
    
    def get_trips(self, limit=100, offset=0, borough=None, min_fare=None, max_fare=None,
                  min_distance=None, max_distance=None, start_date=None, end_date=None,
                  hour=None, is_weekend=None):
        """Get trips with optional filtering"""
        query = """
        SELECT 
            rowid as id,
            tpep_pickup_datetime,
            tpep_dropoff_datetime,
            passenger_count,
            trip_distance,
            fare_amount,
            tip_amount,
            total_amount,
            payment_type,
            pu_borough,
            pu_zone,
            do_borough,
            do_zone,
            duration_mins,
            avg_speed_mph,
            tip_percentage,
            fare_range,
            distance_category
        FROM trips
        WHERE 1=1
        """
        params = []

        if borough:
            query += " AND pu_borough = ?"
            params.append(borough)

        if min_fare:
            query += " AND fare_amount >= ?"
            params.append(float(min_fare))

        if max_fare:
            query += " AND fare_amount <= ?"
            params.append(float(max_fare))

        if min_distance:
            query += " AND trip_distance >= ?"
            params.append(float(min_distance))

        if max_distance:
            query += " AND trip_distance <= ?"
            params.append(float(max_distance))

        if start_date:
            query += " AND date(tpep_pickup_datetime) >= date(?)"
            params.append(start_date)

        if end_date:
            query += " AND date(tpep_pickup_datetime) <= date(?)"
            params.append(end_date)

        if hour is not None and hour != '':
            query += " AND pickup_hour = ?"
            params.append(int(hour))

        if is_weekend == 'true':
            query += " AND strftime('%w', tpep_pickup_datetime) IN ('0','6')"
        elif is_weekend == 'false':
            query += " AND strftime('%w', tpep_pickup_datetime) NOT IN ('0','6')"

        query += " ORDER BY tpep_pickup_datetime DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        return self.execute_query(query, tuple(params))
    
    def get_hourly_patterns(self):
        """Get trip patterns by hour of day"""
        query = """
        SELECT 
            pickup_hour,
            COUNT(*) as trip_count,
            AVG(fare_amount) as avg_fare,
            AVG(trip_distance) as avg_distance,
            AVG(duration_mins) as avg_duration,
            AVG(avg_speed_mph) as avg_speed,
            AVG(tip_percentage) as avg_tip_pct
        FROM trips
        GROUP BY pickup_hour
        ORDER BY pickup_hour
        """
        return self.execute_query(query)
    
    def get_borough_analysis(self):
        """Get analysis by NYC borough"""
        query = """
        SELECT 
            pu_borough as Borough,
            COUNT(*) as total_trips,
            AVG(fare_amount) as avg_fare,
            AVG(trip_distance) as avg_distance,
            AVG(duration_mins) as avg_duration,
            AVG(tip_percentage) as avg_tip_pct,
            SUM(fare_amount) as total_revenue
        FROM trips
        WHERE pu_borough IS NOT NULL AND pu_borough != 'Unknown'
        GROUP BY pu_borough
        ORDER BY total_trips DESC
        """
        return self.execute_query(query)
    
    def get_fare_distribution(self):
        """Get fare amount distribution"""
        query = """
        SELECT 
            fare_range,
            COUNT(*) as trip_count
        FROM trips
        GROUP BY fare_range
        ORDER BY 
            CASE fare_range
                WHEN '$0-10' THEN 1
                WHEN '$10-20' THEN 2
                WHEN '$20-30' THEN 3
                WHEN '$30-50' THEN 4
                WHEN '$50+' THEN 5
            END
        """
        return self.execute_query(query)
    
    def get_distance_analysis(self):
        """Get distance-based insights"""
        query = """
        SELECT 
            distance_category,
            COUNT(*) as trip_count,
            AVG(fare_amount) as avg_fare,
            AVG(duration_mins) as avg_duration,
            AVG(avg_speed_mph) as avg_speed,
            AVG(tip_percentage) as avg_tip_pct
        FROM trips
        GROUP BY distance_category
        ORDER BY 
            CASE distance_category
                WHEN 'Short (0-2 mi)' THEN 1
                WHEN 'Medium (2-5 mi)' THEN 2
                WHEN 'Long (5-10 mi)' THEN 3
                WHEN 'Very Long (10+ mi)' THEN 4
            END
        """
        return self.execute_query(query)
    
    def get_top_routes(self, limit=10):
        """Get most popular routes"""
        query = """
        SELECT 
            pu_zone as pickup_zone,
            pu_borough as pickup_borough,
            do_zone as dropoff_zone,
            do_borough as dropoff_borough,
            COUNT(*) as trip_count,
            AVG(fare_amount) as avg_fare,
            AVG(trip_distance) as avg_distance,
            AVG(duration_mins) as avg_duration
        FROM trips
        WHERE pu_zone IS NOT NULL AND pu_zone != 'Unknown'
          AND do_zone IS NOT NULL AND do_zone != 'Unknown'
        GROUP BY pu_zone, pu_borough, do_zone, do_borough
        ORDER BY trip_count DESC
        LIMIT ?
        """
        return self.execute_query(query, (limit,))
    
    def get_payment_analysis(self):
        """Get payment type distribution"""
        query = """
        SELECT 
            payment_type,
            COUNT(*) as trip_count,
            AVG(fare_amount) as avg_fare,
            AVG(tip_amount) as avg_tip,
            AVG(tip_percentage) as avg_tip_pct,
            SUM(total_amount) as total_revenue
        FROM trips
        GROUP BY payment_type
        ORDER BY trip_count DESC
        """
        return self.execute_query(query)
    
    def get_speed_analysis(self):
        """Get speed analysis by hour"""
        query = """
        SELECT 
            pickup_hour,
            AVG(avg_speed_mph) as avg_speed,
            MIN(avg_speed_mph) as min_speed,
            MAX(avg_speed_mph) as max_speed,
            COUNT(*) as trip_count
        FROM trips
        WHERE avg_speed_mph > 0
        GROUP BY pickup_hour
        ORDER BY pickup_hour
        """
        return self.execute_query(query)
    
    def get_tip_analysis(self):
        """Get tip percentage analysis"""
        query = """
        SELECT 
            payment_type,
            AVG(tip_percentage) as avg_tip_pct,
            MIN(tip_percentage) as min_tip_pct,
            MAX(tip_percentage) as max_tip_pct,
            COUNT(*) as trip_count
        FROM trips
        GROUP BY payment_type
        ORDER BY avg_tip_pct DESC
        """
        return self.execute_query(query)
    
    def get_trips_for_analysis(self, limit=1000):
        """Get trips for custom algorithm analysis"""
        query = """
        SELECT 
            id,
            fare_amount,
            trip_distance,
            duration_mins,
            pickup_hour,
            passenger_count,
            avg_speed_mph,
            tip_percentage
        FROM trips
        ORDER BY tpep_pickup_datetime DESC
        LIMIT ?
        """
        return self.execute_query(query, (limit,))
    
    def get_weekend_comparison(self):
        """Get weekend vs weekday comparison"""
        query = """
        SELECT
            CASE
                WHEN strftime('%w', tpep_pickup_datetime) IN ('0','6') THEN 'Weekend'
                ELSE 'Weekday'
            END as day_type,
            COUNT(*) as trip_count,
            AVG(fare_amount) as avg_fare,
            AVG(trip_distance) as avg_distance,
            AVG(duration_mins) as avg_duration,
            AVG(tip_percentage) as avg_tip_pct
        FROM trips
        GROUP BY day_type
        ORDER BY day_type DESC
        """
        return self.execute_query(query)