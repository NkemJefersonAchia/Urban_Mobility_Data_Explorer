"""
Custom Algorithms - Manual implementations without built-in libraries
Demonstrates algorithmic thinking for data processing
"""

class CustomSort:
    """
    Custom sorting algorithm implementation using QuickSort
    
    Time Complexity: O(n log n) average case, O(n²) worst case
    Space Complexity: O(log n) for recursion stack
    """
    
    def partition(self, arr, low, high, key):
        """Partition array around pivot"""
        pivot = arr[high][key]
        i = low - 1
        
        for j in range(low, high):
            if arr[j][key] >= pivot:  # Descending order
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        return i + 1
    
    def quicksort(self, arr, low, high, key):
        """QuickSort implementation"""
        if low < high:
            pi = self.partition(arr, low, high, key)
            self.quicksort(arr, low, pi - 1, key)
            self.quicksort(arr, pi + 1, high, key)
    
    def sort_by_trip_count(self, routes):
        """
        Sort routes by trip count in descending order
        
        Args:
            routes: List of dictionaries with 'trip_count' key
        
        Returns:
            Sorted list of routes
        
        Pseudo-code:
        1. If array is empty or has one element, return it
        2. Choose last element as pivot
        3. Partition: elements >= pivot on left, < pivot on right
        4. Recursively sort left and right partitions
        5. Combine results
        """
        if not routes or len(routes) <= 1:
            return routes
        
        routes_copy = [route.copy() for route in routes]
        self.quicksort(routes_copy, 0, len(routes_copy) - 1, 'trip_count')
        return routes_copy


class OutlierDetector:
    """
    Custom outlier detection using IQR (Interquartile Range) method
    Identifies anomalous fare amounts without using statistical libraries
    
    Time Complexity: O(n²) due to bubble sort
    Space Complexity: O(n) for storing sorted values
    """
    
    def calculate_median(self, sorted_arr):
        """Calculate median of sorted array"""
        n = len(sorted_arr)
        if n == 0:
            return 0
        
        mid = n // 2
        if n % 2 == 0:
            return (sorted_arr[mid - 1] + sorted_arr[mid]) / 2
        else:
            return sorted_arr[mid]
    
    def bubble_sort(self, arr):
        """Manual bubble sort implementation"""
        sorted_arr = arr.copy()
        n = len(sorted_arr)
        
        for i in range(n):
            for j in range(0, n - i - 1):
                if sorted_arr[j] > sorted_arr[j + 1]:
                    sorted_arr[j], sorted_arr[j + 1] = sorted_arr[j + 1], sorted_arr[j]
        
        return sorted_arr
    
    def calculate_quartiles(self, values):
        """
        Calculate Q1, Q2 (median), Q3 manually
        
        Pseudo-code:
        1. Sort the values using bubble sort
        2. Find median (Q2)
        3. Split data into lower and upper halves
        4. Find median of lower half (Q1)
        5. Find median of upper half (Q3)
        6. Return Q1, Q2, Q3
        
        Time Complexity: O(n²) for bubble sort
        """
        if not values:
            return 0, 0, 0
        
        # Manual sorting
        sorted_vals = self.bubble_sort(values)
        
        # Calculate Q2 (median)
        q2 = self.calculate_median(sorted_vals)
        
        # Split into lower and upper halves
        n = len(sorted_vals)
        mid = n // 2
        lower_half = sorted_vals[:mid]
        upper_half = sorted_vals[mid + 1:] if n % 2 != 0 else sorted_vals[mid:]
        
        # Calculate Q1 and Q3
        q1 = self.calculate_median(lower_half) if lower_half else sorted_vals[0]
        q3 = self.calculate_median(upper_half) if upper_half else sorted_vals[-1]
        
        return q1, q2, q3
    
    def detect_fare_outliers(self, trips):
        """
        Detect outliers in fare amounts using IQR method
        
        Args:
            trips: List of trip dictionaries with 'fare_amount' key
        
        Returns:
            List of outlier trips
        
        Algorithm: IQR (Interquartile Range) Method
        1. Extract fare amounts from trips
        2. Calculate Q1, Q2, Q3 using manual sorting
        3. Calculate IQR = Q3 - Q1
        4. Define bounds: lower = Q1 - 1.5*IQR, upper = Q3 + 1.5*IQR
        5. Identify values outside bounds as outliers
        
        Time Complexity: O(n²) due to sorting
        Space Complexity: O(n)
        """
        if not trips:
            return []
        
        # Extract fare amounts
        fare_amounts = []
        for trip in trips:
            if 'fare_amount' in trip and trip['fare_amount'] is not None:
                fare_amounts.append(float(trip['fare_amount']))
        
        if len(fare_amounts) < 4:
            return []
        
        # Calculate quartiles manually
        q1, q2, q3 = self.calculate_quartiles(fare_amounts)
        
        # Calculate IQR
        iqr = q3 - q1
        
        # Define outlier bounds
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        # Identify outliers
        outliers = []
        for trip in trips:
            if 'fare_amount' in trip and trip['fare_amount'] is not None:
                fare = float(trip['fare_amount'])
                if fare < lower_bound or fare > upper_bound:
                    outliers.append(trip)
        
        return outliers


class TripAggregator:
    """
    Custom aggregation algorithm for grouping trips by time periods
    Manual implementation without pandas groupby
    
    Time Complexity: O(n)
    Space Complexity: O(k) where k is number of unique groups (24 hours)
    """
    
    def aggregate_by_hour(self, trips):
        """
        Aggregate trips by pickup hour
        
        Args:
            trips: List of trip dictionaries with 'pickup_hour' key
        
        Returns:
            Dictionary with hourly aggregations
        
        Pseudo-code:
        1. Initialize empty dictionary for each hour (0-23)
        2. For each trip:
            a. Extract hour
            b. Add trip data to corresponding hour bucket
            c. Update count, sum of fares, sum of distances
        3. Calculate averages for each hour
        4. Return aggregated results
        
        Time Complexity: O(n) where n is number of trips
        Space Complexity: O(24) for 24 hours = O(1)
        """
        # Initialize aggregation structure
        hourly_data = {}
        for hour in range(24):
            hourly_data[hour] = {
                'hour': hour,
                'count': 0,
                'total_fare': 0,
                'total_distance': 0,
                'total_duration': 0,
                'total_speed': 0,
                'total_tip_pct': 0
            }
        
        # Aggregate trips
        for trip in trips:
            if 'pickup_hour' not in trip or trip['pickup_hour'] is None:
                continue
            
            hour = int(trip['pickup_hour'])
            if hour < 0 or hour > 23:
                continue
            
            hourly_data[hour]['count'] += 1
            
            if 'fare_amount' in trip and trip['fare_amount'] is not None:
                hourly_data[hour]['total_fare'] += float(trip['fare_amount'])
            
            if 'trip_distance' in trip and trip['trip_distance'] is not None:
                hourly_data[hour]['total_distance'] += float(trip['trip_distance'])
            
            if 'duration_mins' in trip and trip['duration_mins'] is not None:
                hourly_data[hour]['total_duration'] += float(trip['duration_mins'])
            
            if 'avg_speed_mph' in trip and trip['avg_speed_mph'] is not None:
                hourly_data[hour]['total_speed'] += float(trip['avg_speed_mph'])
            
            if 'tip_percentage' in trip and trip['tip_percentage'] is not None:
                hourly_data[hour]['total_tip_pct'] += float(trip['tip_percentage'])
        
        # Calculate averages
        result = []
        for hour in range(24):
            data = hourly_data[hour]
            count = data['count']
            
            if count > 0:
                result.append({
                    'hour': hour,
                    'trip_count': count,
                    'avg_fare': round(data['total_fare'] / count, 2),
                    'avg_distance': round(data['total_distance'] / count, 2),
                    'avg_duration': round(data['total_duration'] / count, 2),
                    'avg_speed': round(data['total_speed'] / count, 2),
                    'avg_tip_pct': round(data['total_tip_pct'] / count, 2)
                })
            else:
                result.append({
                    'hour': hour,
                    'trip_count': 0,
                    'avg_fare': 0,
                    'avg_distance': 0,
                    'avg_duration': 0,
                    'avg_speed': 0,
                    'avg_tip_pct': 0
                })
        
        return result


class SpeedAnalyzer:
    """
    Custom analyzer for speed patterns
    Identifies congestion hours based on speed data
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    
    def find_congestion_hours(self, hourly_data):
        """
        Find hours with slowest average speeds (congestion)
        
        Pseudo-code:
        1. Filter hours with sufficient data (trip_count > threshold)
        2. Find minimum average speed
        3. Identify all hours within 10% of minimum
        4. Return congestion hours
        
        Time Complexity: O(n)
        """
        if not hourly_data:
            return []
        
        # Filter valid hours
        valid_hours = [h for h in hourly_data if h.get('trip_count', 0) > 10]
        
        if not valid_hours:
            return []
        
        # Find minimum speed manually
        min_speed = float('inf')
        for hour_data in valid_hours:
            speed = hour_data.get('avg_speed', 0)
            if speed < min_speed:
                min_speed = speed
        
        # Find congestion hours (within 10% of minimum)
        threshold = min_speed * 1.1
        congestion_hours = []
        
        for hour_data in valid_hours:
            if hour_data.get('avg_speed', 0) <= threshold:
                congestion_hours.append(hour_data['hour'])
        
        return congestion_hours