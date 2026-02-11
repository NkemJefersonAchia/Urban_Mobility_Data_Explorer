/**
 * API Client for NYC Mobility Explorer
 * Handles all backend communication
 */

const API = {
    /**
     * Generic fetch wrapper with error handling
     */
    async fetch(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },
    
    /**
     * Health check
     */
    async checkHealth() {
        return this.fetch('/health');
    },
    
    /**
     * Get trip summary statistics
     */
    async getTripSummary() {
        return this.fetch('/trips/summary');
    },
    
    /**
     * Get financial summary
     */
    async getFinancialSummary() {
        return this.fetch('/trips/financial-summary');
    },
    
    /**
     * Get trips by hour
     */
    async getTripsByHour() {
        return this.fetch('/trips/by-hour');
    },
    
    /**
     * Get trips by day of week
     */
    async getTripsByDay() {
        return this.fetch('/trips/by-day');
    },
    
    /**
     * Get daily patterns (heatmap data)
     */
    async getDailyPatterns() {
        return this.fetch('/trips/daily-patterns');
    },
    
    /**
     * Get borough flow data
     */
    async getBoroughFlow() {
        return this.fetch('/trips/borough-flow');
    },
    
    /**
     * Get zone popularity
     */
    async getZonePopularity() {
        return this.fetch('/zones/popularity');
    },
    
    /**
     * Get all zones
     */
    async getZones() {
        return this.fetch('/zones');
    },
    
    /**
     * Get specific zone details
     */
    async getZoneDetails(zoneId) {
        return this.fetch(`/zones/${zoneId}`);
    },
    
    /**
     * Get trips by payment type
     */
    async getTripsByPayment() {
        return this.fetch('/trips/by-payment');
    },
    
    /**
     * Get trips by rate code
     */
    async getTripsByRateCode() {
        return this.fetch('/trips/by-rate-code');
    },
    
    /**
     * Execute custom query with filters
     */
    async customQuery(filters) {
        return this.fetch('/trips/query', {
            method: 'POST',
            body: JSON.stringify(filters)
        });
    },
    
    /**
     * Get sample trips
     */
    async getSampleTrips(limit = 100) {
        return this.fetch(`/trips/sample?limit=${limit}`);
    },
    
    /**
     * Refresh materialized views
     */
    async refreshStats() {
        return this.fetch('/refresh-stats', {
            method: 'POST'
        });
    },
    
    /**
     * Get database statistics
     */
    async getDatabaseStats() {
        return this.fetch('/database/stats');
    }
};

// Make API globally available
window.API = API;