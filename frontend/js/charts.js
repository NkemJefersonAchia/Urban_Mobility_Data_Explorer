/**
 * Chart Module for NYC Mobility Explorer
 * Handles all Chart.js visualizations
 */

const Charts = {
    instances: {},
    
    /**
     * Initialize or update a chart
     */
    createOrUpdate(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }
        
        // Destroy existing chart if it exists
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }
        
        // Create new chart
        const ctx = canvas.getContext('2d');
        this.instances[canvasId] = new Chart(ctx, {
            ...config,
            options: {
                ...CONFIG.CHART_DEFAULTS,
                ...config.options
            }
        });
        
        return this.instances[canvasId];
    },
    
    /**
     * Hourly trip distribution (line chart)
     */
    renderHourlyChart(data) {
        const hours = data.map(d => `${d.hour_of_day}:00`);
        const tripCounts = data.map(d => d.trip_count);
        
        return this.createOrUpdate('hourly-chart', {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Trip Count',
                    data: tripCounts,
                    borderColor: CONFIG.CHART_COLORS.primary,
                    backgroundColor: CONFIG.CHART_COLORS.primary + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Borough flow matrix (horizontal bar chart)
     */
    renderBoroughChart(data) {
        // Get top 10 flows
        const topFlows = data.slice(0, 10);
        const labels = topFlows.map(d => 
            `${d.pickup_borough.substring(0, 3)} → ${d.dropoff_borough.substring(0, 3)}`
        );
        const counts = topFlows.map(d => d.trip_count);
        
        return this.createOrUpdate('borough-chart', {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Trips',
                    data: counts,
                    backgroundColor: CONFIG.CHART_COLORS.secondary,
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    },
                    y: {
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace", size: 10 }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Day of week patterns (bar chart)
     */
    renderDayOfWeekChart(data) {
        return this.createOrUpdate('dow-chart', {
            type: 'bar',
            data: {
                labels: data.map(d => d.day_name),
                datasets: [{
                    label: 'Average Fare',
                    data: data.map(d => d.avg_fare),
                    backgroundColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 0
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" },
                            callback: (value) => '$' + value.toFixed(2)
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Weekend vs weekday (doughnut chart)
     */
    renderWeekendChart(data) {
        const weekdayData = data.filter(d => !d.is_weekend);
        const weekendData = data.filter(d => d.is_weekend);
        
        const weekdayTrips = weekdayData.reduce((sum, d) => sum + d.trip_count, 0);
        const weekendTrips = weekendData.reduce((sum, d) => sum + d.trip_count, 0);
        
        return this.createOrUpdate('weekend-chart', {
            type: 'doughnut',
            data: {
                labels: ['Weekday', 'Weekend'],
                datasets: [{
                    data: [weekdayTrips, weekendTrips],
                    backgroundColor: [
                        CONFIG.CHART_COLORS.secondary,
                        CONFIG.CHART_COLORS.tertiary
                    ],
                    borderWidth: 0
                }]
            }
        });
    },
    
    /**
     * 24-hour activity heatmap (custom bar chart)
     */
    renderHeatmapChart(data) {
        // Group by day and hour
        const heatmapData = {};
        data.forEach(d => {
            const key = `${d.day_of_week}-${d.hour_of_day}`;
            heatmapData[key] = d.trip_count;
        });
        
        // Create datasets for each day
        const datasets = CONFIG.DAYS_OF_WEEK.map((day, dayIndex) => {
            const hourlyData = [];
            for (let hour = 0; hour < 24; hour++) {
                const key = `${dayIndex}-${hour}`;
                hourlyData.push(heatmapData[key] || 0);
            }
            
            return {
                label: day,
                data: hourlyData,
                backgroundColor: CONFIG.CHART_COLORS.palette[dayIndex % CONFIG.CHART_COLORS.palette.length],
                borderWidth: 0
            };
        });
        
        const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
        
        return this.createOrUpdate('heatmap-chart', {
            type: 'bar',
            data: {
                labels: hours,
                datasets: datasets
            },
            options: {
                scales: {
                    x: {
                        stacked: false,
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true,
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    /**
     * Payment type distribution (pie chart)
     */
    renderPaymentChart(data) {
        return this.createOrUpdate('payment-chart', {
            type: 'pie',
            data: {
                labels: data.map(d => d.payment_type_name),
                datasets: [{
                    data: data.map(d => d.trip_count),
                    backgroundColor: CONFIG.CHART_COLORS.palette,
                    borderWidth: 0
                }]
            }
        });
    },
    
    /**
     * Zone distribution (bar chart)
     */
    renderZoneDistChart(data) {
        const top10 = data.slice(0, 10);
        
        return this.createOrUpdate('zone-dist-chart', {
            type: 'bar',
            data: {
                labels: top10.map(d => d.zone_name),
                datasets: [{
                    label: 'Total Activity',
                    data: top10.map(d => d.total_activity),
                    backgroundColor: CONFIG.CHART_COLORS.tertiary,
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    },
                    y: {
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace", size: 10 }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Fare vs distance scatter plot
     */
    renderFareDistanceChart(sampleData) {
        const points = sampleData.slice(0, 500).map(d => ({
            x: d.trip_distance,
            y: d.fare_amount
        }));
        
        return this.createOrUpdate('fare-distance-chart', {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Trips',
                    data: points,
                    backgroundColor: CONFIG.CHART_COLORS.primary + '60',
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 1,
                    pointRadius: 3
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Distance (miles)',
                            font: { family: "'IBM Plex Mono', monospace" }
                        },
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Fare ($)',
                            font: { family: "'IBM Plex Mono', monospace" }
                        },
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Tip analysis by payment method
     */
    renderTipAnalysisChart(data) {
        return this.createOrUpdate('tip-analysis-chart', {
            type: 'bar',
            data: {
                labels: data.map(d => d.payment_type_name),
                datasets: [
                    {
                        label: 'Average Tip %',
                        data: data.map(d => d.avg_tip_pct || 0),
                        backgroundColor: CONFIG.CHART_COLORS.secondary,
                        borderWidth: 0
                    },
                    {
                        label: 'Average Fare',
                        data: data.map(d => d.avg_fare),
                        backgroundColor: CONFIG.CHART_COLORS.tertiary,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    },
                    x: {
                        ticks: {
                            font: { family: "'IBM Plex Mono', monospace" }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Destroy all chart instances
     */
    destroyAll() {
        Object.keys(this.instances).forEach(key => {
            if (this.instances[key]) {
                this.instances[key].destroy();
            }
        });
        this.instances = {};
    }
};

// Make Charts globally available
window.Charts = Charts;