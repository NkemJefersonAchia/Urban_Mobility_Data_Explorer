/**
 * Urban Mobility Data Explorer - Frontend Application
 * Handles API interactions, data visualization, and user interactions
 */

// Configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';
const RECORDS_PER_PAGE = 50;

// Session auth credentials
const API_USERNAME = 'admin';
const API_PASSWORD = 'admin123';

// State management
let currentPage = 1;
let charts = {};

/**
 * Login to the application
 */
async function login() {
    try {
        console.log('Attempting login...');
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: API_USERNAME, password: API_PASSWORD })
        });

        console.log('Login response status:', res.status);
        const data = await res.json();
        console.log('Login response data:', data);

        if (!res.ok) throw new Error(`Login failed: ${data.error || res.statusText}`);
        console.log('Login successful');
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Fetch with session authentication
 */
async function authenticatedFetch(url, options = {}) {
    const opts = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    };

    let response = await fetch(url, opts);

    if (response.status === 401) {
        await login();
        response = await fetch(url, opts);
    }

    return response;
}

/**
 * Fetch JSON with error handling
 */
async function fetchJson(url, options = {}) {
    const res = await authenticatedFetch(url, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Urban Mobility Data Explorer...');
    initializeApp();
});

/**
 * Bootstraps app after login
 */
async function initializeApp() {
    try {
        console.log('Starting app initialization...');
        await login();
        console.log('Login complete, populating dropdown...');
        
        populateHourDropdown();
        
        console.log('Loading all data...');
        await Promise.all([
            loadStatistics(),
            loadHourlyAnalysis(),
            loadBoroughAnalysis(),
            loadPopularRoutes(),
            loadPaymentAnalysis(),
            loadWeekendComparison()
        ]);
        
        console.log('Data loaded, setting up listeners...');
        setupEventListeners();
        console.log('App ready');
    } catch (error) {
        console.error('Initialization failed:', error);
        showError('Failed to initialize app');
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button));
    });
    
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
    document.getElementById('next-page').addEventListener('click', () => changePage(1));
}

/**
 * Populate hour dropdown with 0-23 options
 */
function populateHourDropdown() {
    const hourSelect = document.getElementById('filter-hour');
    for (let i = 0; i < 24; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i.toString().padStart(2, '0')}:00`;
        hourSelect.appendChild(option);
    }
}

/**
 * Switch between tabs
 */
function switchTab(button) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const tabName = button.getAttribute('data-tab');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}

/**
 * Load overall statistics
 */
async function loadStatistics() {
    try {
        const data = await fetchJson(`${API_BASE_URL}/summary`);
        
        document.getElementById('total-trips').textContent = 
            data.total_trips?.toLocaleString() || 'N/A';
        document.getElementById('avg-distance').textContent = 
            `${data.avg_distance?.toFixed(2) || '0.00'} mi`;
        document.getElementById('avg-duration').textContent = 
            `${data.avg_duration?.toFixed(1) || '0.0'} min`;
        document.getElementById('avg-fare').textContent = 
            `$${data.avg_fare?.toFixed(2) || '0.00'}`;
        document.getElementById('avg-tip').textContent = 
            `${data.avg_tip_pct?.toFixed(1) || '0.0'}%`;
        
        if (data.earliest_trip && data.latest_trip) {
            const earliest = new Date(data.earliest_trip).toLocaleDateString();
            const latest = new Date(data.latest_trip).toLocaleDateString();
            document.getElementById('date-range').textContent = `${earliest} - ${latest}`;
        }
        
        console.log('Statistics loaded successfully');
    } catch (error) {
        console.error('Error loading statistics:', error);
        showError('Failed to load statistics');
    }
}

/**
 * Normalizers
 */
function normalizeHourlyRow(d) {
    return {
        hour: d.hour_of_day ?? d.pickup_hour ?? d.hour ?? 0,
        trip_count: d.trip_count ?? d.total_trips ?? 0,
        avg_fare: parseFloat(d.avg_fare ?? d.average_fare ?? 0),
        avg_tip_percentage: parseFloat(d.avg_tip_pct ?? d.avg_tip_percentage ?? d.avg_tip ?? 0)
    };
}

function normalizeBoroughRow(d) {
    return {
        borough: d.borough ?? d.Borough ?? d.pu_borough ?? 'Unknown',
        trip_count: d.trip_count ?? d.total_trips ?? 0,
        avg_fare: parseFloat(d.avg_fare ?? d.average_fare ?? 0).toFixed(2),
        avg_tip_percentage: parseFloat(d.avg_tip_pct ?? d.avg_tip_percentage ?? d.avg_tip ?? 0).toFixed(1)
    };
}

function normalizeRouteRow(d) {
    return {
        pickup_zone: d.pickup_zone ?? d.pu_zone ?? d.Zone ?? 'Unknown',
        pickup_borough: d.pickup_borough ?? d.pu_borough ?? d.Borough ?? 'Unknown',
        dropoff_zone: d.dropoff_zone ?? d.do_zone ?? d.dropoff ?? 'N/A',
        dropoff_borough: d.dropoff_borough ?? d.do_borough ?? 'N/A',
        trip_count: d.trip_count ?? d.total_trips ?? 0,
        avg_distance: parseFloat(d.avg_distance ?? d.average_distance ?? 0).toFixed(2),
        avg_fare: parseFloat(d.avg_fare ?? d.average_fare ?? 0).toFixed(2)
    };
}

function normalizeTripRow(d) {
    return {
        pickup_datetime: d.pickup_datetime ?? d.tpep_pickup_datetime,
        pickup_zone: d.pickup_zone ?? d.pu_zone ?? 'Unknown',
        dropoff_zone: d.dropoff_zone ?? d.do_zone ?? 'N/A',
        trip_distance: d.trip_distance ?? 0,
        trip_duration_minutes: d.trip_duration_minutes ?? d.duration_mins ?? 0,
        total_amount: d.total_amount ?? d.fare_amount ?? 0,
        tip_percentage: d.tip_percentage ?? 0
    };
}

/**
 * Load and visualize hourly analysis
 */
async function loadHourlyAnalysis() {
    try {
        const data = await fetchJson(`${API_BASE_URL}/hourly-patterns`);
        const hourlyData = (Array.isArray(data) ? data : data.hourly_analysis || []).map(normalizeHourlyRow);
        
        if (hourlyData.length === 0) return;

        const hours = hourlyData.map(d => `${d.hour}:00`);
        const tripCounts = hourlyData.map(d => d.trip_count);
        const avgFares = hourlyData.map(d => d.avg_fare);
        
        const ctx = document.getElementById('hourly-chart').getContext('2d');
        if (charts.hourly) charts.hourly.destroy();
        
        charts.hourly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [
                    {
                        label: 'Trip Count',
                        data: tripCounts,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4
                    },
                    {
                        label: 'Average Fare ($)',
                        data: avgFares,
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { position: 'top' }, title: { display: false } },
                scales: {
                    y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Trip Count' } },
                    y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Average Fare ($)' }, grid: { drawOnChartArea: false } }
                }
            }
        });
        
        const peakHour = hourlyData.reduce((max, d) => d.trip_count > max.trip_count ? d : max);
        const lowHour = hourlyData.reduce((min, d) => d.trip_count < min.trip_count ? d : min);
        
        document.getElementById('hourly-insights').innerHTML = `
            <ul>
                <li>Peak hour: ${peakHour.hour}:00 with ${peakHour.trip_count.toLocaleString()} trips</li>
                <li>Quietest hour: ${lowHour.hour}:00 with ${lowHour.trip_count.toLocaleString()} trips</li>
                <li>Morning rush (7-9 AM) and evening rush (5-7 PM) show distinct peaks</li>
                <li>Late night hours have lower volume but higher average fares</li>
            </ul>
        `;
        
        console.log('Hourly analysis loaded successfully');
    } catch (error) {
        console.error('Error loading hourly analysis:', error);
        showError('Failed to load hourly analysis');
    }
}

/**
 * Load and visualize borough analysis
 */
async function loadBoroughAnalysis() {
    try {
        const data = await fetchJson(`${API_BASE_URL}/borough-analysis`);
        const boroughData = (Array.isArray(data) ? data : data.borough_analysis || []).map(normalizeBoroughRow);
        
        if (boroughData.length === 0) return;

        const boroughs = boroughData.map(d => d.borough);
        const tripCounts = boroughData.map(d => d.trip_count);
        
        const ctx = document.getElementById('borough-chart').getContext('2d');
        if (charts.borough) charts.borough.destroy();
        
        charts.borough = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: boroughs,
                datasets: [{
                    label: 'Trip Count',
                    data: tripCounts,
                    backgroundColor: ['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)', 'rgba(237, 100, 166, 0.8)', 'rgba(255, 154, 158, 0.8)', 'rgba(250, 208, 196, 0.8)'],
                    borderColor: ['#667eea', '#764ba2', '#ed64a6', '#ff9a9e', '#fad0c4'],
                    borderWidth: 2,
                    minBarLength: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
        
        const topBorough = boroughData[0];
        const totalTrips = boroughData.reduce((sum, d) => sum + d.trip_count, 0);
        const topPercentage = totalTrips ? ((topBorough.trip_count / totalTrips) * 100).toFixed(1) : 0;
        
        document.getElementById('borough-insights').innerHTML = `
            <ul>
                <li>${topBorough.borough} has highest volume: ${topBorough.trip_count.toLocaleString()} trips (${topPercentage}%)</li>
                <li>Average fare varies by borough: ${topBorough.borough} averages $${topBorough.avg_fare}</li>
                <li>Manhattan shows higher trip density from central business district</li>
                <li>Tip percentages consistent across boroughs: ${topBorough.avg_tip_percentage}%</li>
            </ul>
        `;
        
        console.log('Borough analysis loaded successfully');
    } catch (error) {
        console.error('Error loading borough analysis:', error);
        showError('Failed to load borough analysis');
    }
}

/**
 * Load popular routes
 */
async function loadPopularRoutes() {
    try {
        const data = await fetchJson(`${API_BASE_URL}/top-routes?limit=20`);
        const routes = (Array.isArray(data) ? data : data.popular_routes || []).map(normalizeRouteRow);

        const tbody = document.getElementById('routes-tbody');
        tbody.innerHTML = '';
        
        if (routes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No route data available</td></tr>';
            return;
        }
        
        routes.forEach((route, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${route.pickup_zone}, ${route.pickup_borough}</td>
                <td>${route.dropoff_zone}, ${route.dropoff_borough}</td>
                <td>${route.trip_count.toLocaleString()}</td>
                <td>${route.avg_distance} mi</td>
                <td>$${route.avg_fare}</td>
            `;
        });
        
        console.log('Popular routes loaded successfully');
    } catch (error) {
        console.error('Error loading popular routes:', error);
        showError('Failed to load popular routes');
    }
}

/**
 * Load payment analysis
 */
async function loadPaymentAnalysis() {
    try {
        const data = await fetchJson(`${API_BASE_URL}/payment-analysis`);
        const paymentData = Array.isArray(data) ? data : data.payment_analysis || [];
        
        if (paymentData.length === 0) return;

        const paymentTypes = { 1: 'Credit Card', 2: 'Cash', 3: 'No Charge', 4: 'Dispute', 5: 'Unknown', 6: 'Voided Trip' };
        const labels = paymentData.map(d => paymentTypes[d.payment_type] || `Type ${d.payment_type}`);
        const tripCounts = paymentData.map(d => d.trip_count);
        
        const ctx = document.getElementById('payment-chart').getContext('2d');
        if (charts.payment) charts.payment.destroy();
        
        charts.payment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: tripCounts,
                    backgroundColor: ['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)', 'rgba(237, 100, 166, 0.8)', 'rgba(255, 154, 158, 0.8)', 'rgba(250, 208, 196, 0.8)', 'rgba(179, 229, 252, 0.8)'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
        
        const topPayment = paymentData[0];
        const totalTrips = paymentData.reduce((sum, d) => sum + d.trip_count, 0);
        const topPercentage = ((topPayment.trip_count / totalTrips) * 100).toFixed(1);
        
        document.getElementById('payment-insights').innerHTML = `
            <ul>
                <li>${paymentTypes[topPayment.payment_type]} most common (${topPercentage}% of trips)</li>
                <li>Credit cards show higher tip rates vs cash</li>
                <li>Average fare: $${topPayment.avg_fare} (${paymentTypes[topPayment.payment_type]})</li>
                <li>Digital payments increasingly dominant</li>
            </ul>
        `;
        
        console.log('Payment analysis loaded successfully');
    } catch (error) {
        console.error('Error loading payment analysis:', error);
        showError('Failed to load payment analysis');
    }
}

/**
 * Load and visualize weekend vs weekday comparison
 */
async function loadWeekendComparison() {
    try {
        const data = await fetchJson(`${API_BASE_URL}/weekend-comparison`);
        const rows = Array.isArray(data) ? data : data.weekend_comparison || [];

        if (rows.length === 0) return;

        const labels = rows.map(r => r.day_type);
        const tripCounts = rows.map(r => r.trip_count);

        const ctx = document.getElementById('weekend-chart').getContext('2d');
        if (charts.weekend) charts.weekend.destroy();

        charts.weekend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Trip Count',
                    data: tripCounts,
                    backgroundColor: ['rgba(102, 126, 234, 0.8)', 'rgba(237, 100, 166, 0.8)'],
                    borderColor: ['#667eea', '#ed64a6'],
                    borderWidth: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });

        const weekendRow = rows.find(r => r.day_type === 'Weekend');
        const weekdayRow = rows.find(r => r.day_type === 'Weekday');

        document.getElementById('weekend-comparison').innerHTML = `
            <div class="comparison-card">
                <h3>Weekend</h3>
                <div class="metric"><span class="metric-label">Trips</span><span class="metric-value">${weekendRow?.trip_count?.toLocaleString() || 0}</span></div>
                <div class="metric"><span class="metric-label">Avg Fare</span><span class="metric-value">$${(weekendRow?.avg_fare ?? 0).toFixed(2)}</span></div>
                <div class="metric"><span class="metric-label">Avg Distance</span><span class="metric-value">${(weekendRow?.avg_distance ?? 0).toFixed(2)} mi</span></div>
            </div>
            <div class="comparison-card">
                <h3>Weekday</h3>
                <div class="metric"><span class="metric-label">Trips</span><span class="metric-value">${weekdayRow?.trip_count?.toLocaleString() || 0}</span></div>
                <div class="metric"><span class="metric-label">Avg Fare</span><span class="metric-value">$${(weekdayRow?.avg_fare ?? 0).toFixed(2)}</span></div>
                <div class="metric"><span class="metric-label">Avg Distance</span><span class="metric-value">${(weekdayRow?.avg_distance ?? 0).toFixed(2)} mi</span></div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading weekend comparison:', error);
        showError('Failed to load weekend comparison');
    }
}

/**
 * Apply filters and load trip data
 */
async function applyFilters() {
    try {
        const params = new URLSearchParams();
        params.append('limit', RECORDS_PER_PAGE);
        params.append('offset', (currentPage - 1) * RECORDS_PER_PAGE);
        
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;
        const minDistance = document.getElementById('filter-min-distance').value;
        const maxDistance = document.getElementById('filter-max-distance').value;
        const minFare = document.getElementById('filter-min-fare').value;
        const maxFare = document.getElementById('filter-max-fare').value;
        const hour = document.getElementById('filter-hour').value;
        const weekend = document.getElementById('filter-weekend').value;
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (minDistance) params.append('min_distance', minDistance);
        if (maxDistance) params.append('max_distance', maxDistance);
        if (minFare) params.append('min_fare', minFare);
        if (maxFare) params.append('max_fare', maxFare);
        if (hour) params.append('hour', hour);
        if (weekend) params.append('is_weekend', weekend);
        
        const data = await fetchJson(`${API_BASE_URL}/trips?${params}`);
        const tripsRaw = Array.isArray(data) ? data : (data?.trips || []);
        const trips = tripsRaw.map(normalizeTripRow);
        displayTrips(trips);
        updatePageInfo();
        
        console.log(`Loaded ${trips.length} trips`);
    } catch (error) {
        console.error('Error applying filters:', error);
        showError('Failed to load trips');
    }
}

/**
 * Display trips in table
 */
function displayTrips(trips) {
    const tbody = document.getElementById('trips-tbody');
    tbody.innerHTML = '';
    
    if (trips.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No trips found matching the filters</td></tr>';
        return;
    }
    
    trips.forEach(trip => {
        const pickupTime = trip.pickup_datetime ? new Date(trip.pickup_datetime).toLocaleString() : 'N/A';
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${pickupTime}</td>
            <td>${trip.pickup_zone || 'Unknown'}</td>
            <td>${trip.dropoff_zone || 'N/A'}</td>
            <td>${trip.trip_distance} mi</td>
            <td>${trip.trip_duration_minutes} min</td>
            <td>$${trip.total_amount}</td>
            <td>${trip.tip_percentage}%</td>
        `;
    });
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.querySelectorAll('[id^="filter-"]').forEach(el => el.value = '');
    currentPage = 1;
    document.getElementById('trips-tbody').innerHTML = '<tr><td colspan="7">Apply filters to view trips</td></tr>';
    updatePageInfo();
}

/**
 * Change page
 */
function changePage(direction) {
    currentPage = Math.max(1, currentPage + direction);
    applyFilters();
}

/**
 * Update page info
 */
function updatePageInfo() {
    document.getElementById('page-info').textContent = `Page ${currentPage}`;
}

/**
 * Show error message
 */
function showError(message) {
    console.error(message);
}

console.log('Urban Mobility Data Explorer initialized');