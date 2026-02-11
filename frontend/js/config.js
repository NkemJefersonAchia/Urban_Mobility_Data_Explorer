/**
 * Configuration for NYC Mobility Explorer
 */

const CONFIG = {
    // API endpoint
    API_BASE_URL: 'http://localhost:5000/api',
    
    // Chart colors (from design system)
    CHART_COLORS: {
        primary: '#d84315',
        secondary: '#0277bd',
        tertiary: '#558b2f',
        palette: [
            '#d84315',
            '#0277bd',
            '#558b2f',
            '#f57c00',
            '#5e35b1',
            '#00838f'
        ]
    },
    
    // Chart.js default options
    CHART_DEFAULTS: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    font: {
                        family: "'IBM Plex Mono', monospace",
                        size: 11
                    },
                    padding: 16,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: '#1a1a1a',
                titleFont: {
                    family: "'IBM Plex Mono', monospace",
                    size: 12
                },
                bodyFont: {
                    family: "'IBM Plex Mono', monospace",
                    size: 11
                },
                padding: 12,
                cornerRadius: 2
            }
        },
        animation: {
            duration: 600,
            easing: 'easeInOutCubic'
        }
    },
    
    // Day of week labels
    DAYS_OF_WEEK: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ],
    
    // Borough names
    BOROUGHS: [
        'Manhattan',
        'Brooklyn',
        'Queens',
        'Bronx',
        'Staten Island'
    ]
};

// Make CONFIG globally available
window.CONFIG = CONFIG;