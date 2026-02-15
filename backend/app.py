from datetime import timedelta
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from functools import wraps
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database_handler import DatabaseHandler
from custom_algorithms import CustomSort, OutlierDetector, TripAggregator

app = Flask(__name__)
app.secret_key = 'urban-mobility-secret-2026'

# Session config - CRITICAL for CORS + credentials
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # HTTP only in dev
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_NAME'] = 'session'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

CORS(
    app,
    supports_credentials=True,
    origins=[
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501',
        'http://127.0.0.1:5000',
    ]
)

# Initialize database handler
db_handler = DatabaseHandler()

# User credentials
USERS = {
    'admin': 'admin123',
    'user': 'user123'
}

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ==================== AUTH ROUTES ====================
@app.route('/api/login', methods=['POST'])
def login():
    """Handle user login"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username in USERS and USERS[username] == password:
        session.permanent = True
        session['username'] = username
        return jsonify({
            'success': True,
            'username': username,
            'message': 'Login successful'
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    session.pop('username', None)
    return jsonify({'success': True, 'message': 'Logged out'})

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'username' in session:
        return jsonify({'authenticated': True, 'username': session['username']})
    return jsonify({'authenticated': False})

# ==================== DATA ROUTES ====================
@app.route('/api/summary', methods=['GET'])
@login_required
def get_summary():
    """Get overall dataset summary statistics"""
    try:
        summary = db_handler.get_summary_stats()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trips', methods=['GET'])
@login_required
def get_trips():
    """Get trips with optional filtering"""
    try:
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        borough = request.args.get('borough', None)
        min_fare = request.args.get('min_fare', None)
        max_fare = request.args.get('max_fare', None)
        
        trips = db_handler.get_trips(
            limit=limit,
            offset=offset,
            borough=borough,
            min_fare=min_fare,
            max_fare=max_fare
        )
        
        return jsonify(trips)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hourly-patterns', methods=['GET'])
@login_required
def get_hourly_patterns():
    """Get trip patterns by hour of day"""
    try:
        patterns = db_handler.get_hourly_patterns()
        return jsonify(patterns)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/borough-analysis', methods=['GET'])
@login_required
def get_borough_analysis():
    """Get analysis by NYC borough"""
    try:
        analysis = db_handler.get_borough_analysis()
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fare-distribution', methods=['GET'])
@login_required
def get_fare_distribution():
    """Get fare amount distribution"""
    try:
        distribution = db_handler.get_fare_distribution()
        return jsonify(distribution)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/distance-analysis', methods=['GET'])
@login_required
def get_distance_analysis():
    """Get distance-based insights"""
    try:
        analysis = db_handler.get_distance_analysis()
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/top-routes', methods=['GET'])
@login_required
def get_top_routes():
    """Get most popular routes using custom sorting"""
    try:
        limit = int(request.args.get('limit', 10))
        routes = db_handler.get_top_routes(limit)
        
        # Apply custom sorting algorithm
        if routes:
            sorter = CustomSort()
            routes = sorter.sort_by_trip_count(routes)
        
        return jsonify(routes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/payment-analysis', methods=['GET'])
@login_required
def get_payment_analysis():
    """Get payment type distribution"""
    try:
        analysis = db_handler.get_payment_analysis()
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/speed-analysis', methods=['GET'])
@login_required
def get_speed_analysis():
    """Get speed analysis by hour"""
    try:
        analysis = db_handler.get_speed_analysis()
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tip-analysis', methods=['GET'])
@login_required
def get_tip_analysis():
    """Get tip percentage analysis"""
    try:
        analysis = db_handler.get_tip_analysis()
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/custom-insights', methods=['GET'])
@login_required
def get_custom_insights():
    """Get insights using custom algorithms"""
    try:
        trips = db_handler.get_trips_for_analysis()
        
        # Apply custom algorithms
        outlier_detector = OutlierDetector()
        outliers = outlier_detector.detect_fare_outliers(trips)
        
        aggregator = TripAggregator()
        aggregated = aggregator.aggregate_by_hour(trips)
        
        return jsonify({
            'outliers_detected': len(outliers),
            'hourly_aggregation': aggregated,
            'outlier_samples': outliers[:10]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== HEALTH CHECK ====================
@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if API is running"""
    return jsonify({'status': 'healthy', 'service': 'Urban Mobility Explorer API'})

# ==================== ERROR HANDLERS ====================
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("\n" + "="*70)
    print("URBAN MOBILITY EXPLORER API (SQLite)")
    print("="*70)
    print("Database: urban_mobility.db")
    print("API URL: http://127.0.0.1:5000")
    print("Login: admin/admin123 or user/user123")
    print("="*70)
    print("\n Server starting...")
    print("Keep this terminal open while using the app!")
    print("Press CTRL+C to stop the server")
    print("="*70 + "\n")
    
    app.run(debug=True, host='127.0.0.1', port=5000)