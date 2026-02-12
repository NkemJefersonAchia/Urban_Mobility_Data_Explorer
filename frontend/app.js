
// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const RECORDS_PER_PAGE = 50;

// State management
let currentPage = 1;
let charts = {};

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Urban Mobility Data Explorer...');
    
    // Populate hour dropdown
    populateHourDropdown();
    
    // Load initial data
    loadStatistics();
    loadHourlyAnalysis();
    loadBoroughAnalysis();
    loadPopularRoutes();
    loadWeekendComparison();
    loadPaymentAnalysis();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button));
    });
    
    // Filter controls
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // Pagination
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
    // Update active button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update active content
    const tabName = button.getAttribute('data-tab');
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

/**
 * Load overall statistics
 */
async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/statistics`);
        const data = await response.json();
        
        document.getElementById('total-trips').textContent = 
            data.total_trips?.toLocaleString() || 'N/A';
        document.getElementById('avg-distance').textContent = 
            `${data.avg_distance?.toFixed(2) || '0.00'} mi`;
        document.getElementById('avg-duration').textContent = 
            `${data.avg_duration?.toFixed(1) || '0.0'} min`;
        document.getElementById('avg-fare').textContent = 
            `$${data.avg_fare?.toFixed(2) || '0.00'}`;
        document.getElementById('avg-tip').textContent = 
            `${data.avg_tip_percentage?.toFixed(1) || '0.0'}%`;
        
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
 * Load and visualize hourly analysis
 */
async function loadHourlyAnalysis() {
    try {
        const response = await fetch(`${API_BASE_URL}/hourly-analysis`);
        const data = await response.json();
        const hourlyData = data.hourly_analysis;
        
        // Prepare chart data
        const hours = hourlyData.map(d => `${d.hour_of_day}:00`);
        const tripCounts = hourlyData.map(d => d.trip_count);
        const avgFares = hourlyData.map(d => parseFloat(d.avg_fare));
        const avgTips = hourlyData.map(d => parseFloat(d.avg_tip_percentage));
        
        // Create chart
        const ctx = document.getElementById('hourly-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (charts.hourly) {
            charts.hourly.destroy();
        }
        
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
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Trip Count'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Average Fare ($)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
        
        // Generate insights
        const peakHour = hourlyData.reduce((max, d) => 
            d.trip_count > max.trip_count ? d : max
        );
        const lowHour = hourlyData.reduce((min, d) => 
            d.trip_count < min.trip_count ? d : min
        );
        
        const insightsHTML = `
            <ul>
                <li>Peak hour: ${peakHour.hour_of_day}:00 with ${peakHour.trip_count.toLocaleString()} trips</li>
                <li>Quietest hour: ${lowHour.hour_of_day}:00 with ${lowHour.trip_count.toLocaleString()} trips</li>
                <li>Morning rush (7-9 AM) and evening rush (5-7 PM) show distinct peaks in trip volume</li>
                <li>Late night hours (1-5 AM) have significantly lower trip counts but higher average fares</li>
            </ul>
        `;
        document.getElementById('hourly-insights').innerHTML = insightsHTML;
        
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
        const response = await fetch(`${API_BASE_URL}/borough-analysis`);
        const data = await response.json();
        const boroughData = data.borough_analysis;
        
        // Prepare chart data
        const boroughs = boroughData.map(d => d.borough);
        const tripCounts = boroughData.map(d => d.trip_count);
        
        // Create chart
        const ctx = document.getElementById('borough-chart').getContext('2d');
        
        if (charts.borough) {
            charts.borough.destroy();
        }
        
        charts.borough = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: boroughs,
                datasets: [{
                    label: 'Trip Count',
                    data: tripCounts,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(237, 100, 166, 0.8)',
                        'rgba(255, 154, 158, 0.8)',
                        'rgba(250, 208, 196, 0.8)'
                    ],
                    borderColor: [
                        '#667eea',
                        '#764ba2',
                        '#ed64a6',
                        '#ff9a9e',
                        '#fad0c4'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Trips'
                        }
                    }
                }
            }
        });
        
        // Generate insights
        const topBorough = boroughData[0];
        const totalTrips = boroughData.reduce((sum, d) => sum + d.trip_count, 0);
        const topPercentage = ((topBorough.trip_count / totalTrips) * 100).toFixed(1);
        
        const insightsHTML = `
            <ul>
                <li>${topBorough.borough} has the highest trip volume with ${topBorough.trip_count.toLocaleString()} trips (${topPercentage}% of total)</li>
                <li>Average fare varies by borough: ${topBorough.borough} averages $${topBorough.avg_fare}</li>
                <li>Manhattan typically shows higher trip density due to its central business district location</li>
                <li>Tip percentages are relatively consistent across boroughs, averaging ${topBorough.avg_tip_percentage}%</li>
            </ul>
        `;
        document.getElementById('borough-insights').innerHTML = insightsHTML;
        
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
        const response = await fetch(`${API_BASE_URL}/popular-routes?limit=20`);
        const data = await response.json();
        const routes = data.popular_routes;
        
        const tbody = document.getElementById('routes-tbody');
        tbody.innerHTML = '';
        
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
 * Load weekend comparison
 */
async function loadWeekendComparison() {
    try {
        const response = await fetch(`${API_BASE_URL}/weekend-comparison`);
        const data = await response.json();
        const comparison = data.weekend_comparison;
        
        // Create chart
        const ctx = document.getElementById('weekend-chart').getContext('2d');
        
        if (charts.weekend) {
            charts.weekend.destroy();
        }
        
        charts.weekend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Trip Count', 'Avg Distance (mi)', 'Avg Duration (min)', 'Avg Fare ($)', 'Avg Tip (%)'],
                datasets: [
                    {
                        label: 'Weekday',
                        data: [
                            comparison.weekday?.trip_count || 0,
                            parseFloat(comparison.weekday?.avg_distance) || 0,
                            parseFloat(comparison.weekday?.avg_duration) || 0,
                            parseFloat(comparison.weekday?.avg_fare) || 0,
                            parseFloat(comparison.weekday?.avg_tip_percentage) || 0
                        ],
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: '#667eea',
                        borderWidth: 2
                    },
                    {
                        label: 'Weekend',
                        data: [
                            comparison.weekend?.trip_count || 0,
                            parseFloat(comparison.weekend?.avg_distance) || 0,
                            parseFloat(comparison.weekend?.avg_duration) || 0,
                            parseFloat(comparison.weekend?.avg_fare) || 0,
                            parseFloat(comparison.weekend?.avg_tip_percentage) || 0
                        ],
                        backgroundColor: 'rgba(118, 75, 162, 0.8)',
                        borderColor: '#764ba2',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Create comparison cards
        const comparisonHTML = `
            <div class="comparison-card">
                <h3>Weekday Trips</h3>
                <div class="metric">
                    <span class="metric-label">Total Trips</span>
                    <span class="metric-value">${comparison.weekday?.trip_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Distance</span>
                    <span class="metric-value">${comparison.weekday?.avg_distance || 'N/A'} mi</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Duration</span>
                    <span class="metric-value">${comparison.weekday?.avg_duration || 'N/A'} min</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Fare</span>
                    <span class="metric-value">$${comparison.weekday?.avg_fare || 'N/A'}</span>
                </div>
            </div>
            <div class="comparison-card">
                <h3>Weekend Trips</h3>
                <div class="metric">
                    <span class="metric-label">Total Trips</span>
                    <span class="metric-value">${comparison.weekend?.trip_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Distance</span>
                    <span class="metric-value">${comparison.weekend?.avg_distance || 'N/A'} mi</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Duration</span>
                    <span class="metric-value">${comparison.weekend?.avg_duration || 'N/A'} min</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Fare</span>
                    <span class="metric-value">$${comparison.weekend?.avg_fare || 'N/A'}</span>
                </div>
            </div>
        `;
        document.getElementById('weekend-comparison').innerHTML = comparisonHTML;
        
        console.log('Weekend comparison loaded successfully');
    } catch (error) {
        console.error('Error loading weekend comparison:', error);
        showError('Failed to load weekend comparison');
    }
}

/**
 * Load payment analysis
 */
async function loadPaymentAnalysis() {
    try {
        const response = await fetch(`${API_BASE_URL}/payment-analysis`);
        const data = await response.json();
        const paymentData = data.payment_analysis;
        
        // Payment type mapping
        const paymentTypes = {
            1: 'Credit Card',
            2: 'Cash',
            3: 'No Charge',
            4: 'Dispute',
            5: 'Unknown',
            6: 'Voided Trip'
        };
        
        // Prepare chart data
        const labels = paymentData.map(d => paymentTypes[d.payment_type] || `Type ${d.payment_type}`);
        const tripCounts = paymentData.map(d => d.trip_count);
        
        // Create chart
        const ctx = document.getElementById('payment-chart').getContext('2d');
        
        if (charts.payment) {
            charts.payment.destroy();
        }
        
        charts.payment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: tripCounts,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(237, 100, 166, 0.8)',
                        'rgba(255, 154, 158, 0.8)',
                        'rgba(250, 208, 196, 0.8)',
                        'rgba(179, 229, 252, 0.8)'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
        
        // Generate insights
        const topPayment = paymentData[0];
        const totalTrips = paymentData.reduce((sum, d) => sum + d.trip_count, 0);
        const topPercentage = ((topPayment.trip_count / totalTrips) * 100).toFixed(1);
        
        const insightsHTML = `
            <ul>
                <li>${paymentTypes[topPayment.payment_type]} is the most common payment method (${topPercentage}% of trips)</li>
                <li>Credit card payments show higher average tip percentages (${topPayment.avg_tip_percentage}%) compared to cash</li>
                <li>Average fare amount varies by payment type, with credit cards averaging $${topPayment.avg_fare}</li>
                <li>Digital payment methods are becoming increasingly dominant in urban taxi usage</li>
            </ul>
        `;
        document.getElementById('payment-insights').innerHTML = insightsHTML;
        
        console.log('Payment analysis loaded successfully');
    } catch (error) {
        console.error('Error loading payment analysis:', error);
        showError('Failed to load payment analysis');
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
        
        // Add filter parameters
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
        
        const response = await fetch(`${API_BASE_URL}/trips?${params}`);
        const data = await response.json();
        
        displayTrips(data.trips);
        updatePageInfo();
        
        console.log(`Loaded ${data.trips.length} trips`);
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
        const row = tbody.insertRow();
        const pickupTime = new Date(trip.pickup_datetime).toLocaleString();
        
        row.innerHTML = `
            <td>${pickupTime}</td>
            <td>${trip.pickup_zone || 'Unknown'}</td>
            <td>${trip.dropoff_zone || 'Unknown'}</td>
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
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    document.getElementById('filter-min-distance').value = '';
    document.getElementById('filter-max-distance').value = '';
    document.getElementById('filter-min-fare').value = '';
    document.getElementById('filter-max-fare').value = '';
    document.getElementById('filter-hour').value = '';
    document.getElementById('filter-weekend').value = '';
    
    currentPage = 1;
    document.getElementById('trips-tbody').innerHTML = 
        '<tr><td colspan="7">Apply filters to view trips</td></tr>';
    updatePageInfo();
}

/**
 * Change page for trip listing
 */
function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    applyFilters();
}

/**
 * Update page information
 */
function updatePageInfo() {
    document.getElementById('page-info').textContent = `Page ${currentPage}`;
}

/**
 * Show error message
 */
function showError(message) {
    console.error(message);
    // Could add a toast notification here
}

console.log('Urban Mobility Data Explorer initialized');
