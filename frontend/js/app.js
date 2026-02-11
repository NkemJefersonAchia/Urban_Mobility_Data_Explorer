/**
 * Main Application Controller for NYC Mobility Explorer
 * Orchestrates data loading and view updates
 */

const App = {
    data: {
        tripSummary: null,
        financialSummary: null,
        hourlyData: null,
        dailyData: null,
        dailyPatterns: null,
        boroughFlow: null,
        zonePopularity: null,
        paymentData: null,
        sampleTrips: null
    },
    
    /**
     * Initialize application
     */
    async init() {
        console.log('Initializing NYC Mobility Explorer...');
        
        try {
            // Show loading overlay
            UI.showLoading();
            
            // Check backend health
            const health = await API.checkHealth();
            console.log('Backend health:', health);
            
            // Initialize UI components
            UI.initNavigation();
            UI.initFilters();
            UI.initMapControls();
            
            // Load initial data
            await this.loadAllData();
            
            // Hide loading overlay
            UI.hideLoading();
            
            console.log('Application initialized successfully');
        } catch (error) {
            UI.hideLoading();
            UI.showError('Failed to initialize application: ' + error.message);
            console.error('Initialization error:', error);
        }
    },
    
    /**
     * Load all required data
     */
    async loadAllData() {
        try {
            await Promise.all([
                this.loadOverviewData(),
                this.loadTemporalData(),
                this.loadSpatialData(),
                this.loadEconomicData()
            ]);
        } catch (error) {
            throw new Error('Failed to load data: ' + error.message);
        }
    },
    
    /**
     * Load overview section data
     */
    async loadOverviewData() {
        try {
            // Load trip summary
            this.data.tripSummary = await API.getTripSummary();
            
            // Update stats
            UI.updateStat('total-trips', this.data.tripSummary.valid_trips, UI.formatNumber);
            UI.updateStat('avg-fare', this.data.tripSummary.avg_fare, UI.formatCurrency);
            UI.updateStat('avg-distance', this.data.tripSummary.avg_distance + ' mi');
            UI.updateStat('avg-tip', this.data.tripSummary.avg_tip_pct, UI.formatPercent);
            
            // Load hourly data for chart
            this.data.hourlyData = await API.getTripsByHour();
            Charts.renderHourlyChart(this.data.hourlyData);
            
            // Load borough flow for chart
            this.data.boroughFlow = await API.getBoroughFlow();
            Charts.renderBoroughChart(this.data.boroughFlow);
            
            // Update insights with specific data
            await this.updateInsights();
            
        } catch (error) {
            console.error('Error loading overview data:', error);
            throw error;
        }
    },
    
    /**
     * Update insights section with calculated data
     */
    async updateInsights() {
        try {
            // Peak hours from hourly data
            if (this.data.hourlyData) {
                const morningPeak = this.data.hourlyData
                    .filter(d => d.hour_of_day >= 8 && d.hour_of_day <= 9)
                    .reduce((sum, d) => sum + d.trip_count, 0);
                
                const eveningPeak = this.data.hourlyData
                    .filter(d => d.hour_of_day >= 17 && d.hour_of_day <= 19)
                    .reduce((sum, d) => sum + d.trip_count, 0);
                
                UI.updateStat('morning-peak', morningPeak, UI.formatNumber);
                UI.updateStat('evening-peak', eveningPeak, UI.formatNumber);
            }
            
            // Zone popularity
            const zoneData = await API.getZonePopularity();
            if (zoneData && zoneData.length > 0) {
                const topZone = zoneData[0];
                UI.updateStat('top-zone', topZone.zone_name);
                UI.updateStat('top-zone-count', topZone.total_activity, UI.formatNumber);
            }
            
            // Payment tip percentages
            const financialData = await API.getFinancialSummary();
            if (financialData) {
                UI.updateStat('credit-tip', financialData.avg_tip_pct_credit, UI.formatPercent);
                UI.updateStat('cash-tip', financialData.avg_tip_pct_cash, UI.formatPercent);
            }
            
        } catch (error) {
            console.error('Error updating insights:', error);
        }
    },
    
    /**
     * Load temporal analysis data
     */
    async loadTemporalData() {
        try {
            // Load day of week data
            this.data.dailyData = await API.getTripsByDay();
            Charts.renderDayOfWeekChart(this.data.dailyData);
            Charts.renderWeekendChart(this.data.dailyData);
            
            // Load daily patterns for heatmap
            this.data.dailyPatterns = await API.getDailyPatterns();
            Charts.renderHeatmapChart(this.data.dailyPatterns);
            
        } catch (error) {
            console.error('Error loading temporal data:', error);
            throw error;
        }
    },
    
    /**
     * Load spatial analysis data
     */
    async loadSpatialData() {
        try {
            // Load zone popularity
            this.data.zonePopularity = await API.getZonePopularity();
            
            // Populate zone table
            UI.populateZoneTable(this.data.zonePopularity);
            
            // Render zone distribution chart
            Charts.renderZoneDistChart(this.data.zonePopularity);
            
        } catch (error) {
            console.error('Error loading spatial data:', error);
            throw error;
        }
    },
    
    /**
     * Load economic analysis data
     */
    async loadEconomicData() {
        try {
            // Load financial summary
            this.data.financialSummary = await API.getFinancialSummary();
            
            // Update financial stats
            UI.updateStat('total-revenue', this.data.financialSummary.total_revenue, UI.formatCurrency);
            UI.updateStat('total-tips', this.data.financialSummary.total_tips, UI.formatCurrency);
            UI.updateStat('fare-per-mile', this.data.financialSummary.avg_fare_per_mile, UI.formatCurrency);
            
            // Load payment data
            this.data.paymentData = await API.getTripsByPayment();
            Charts.renderPaymentChart(this.data.paymentData);
            Charts.renderTipAnalysisChart(this.data.paymentData);
            
            // Load sample trips for scatter plot
            this.data.sampleTrips = await API.getSampleTrips(500);
            Charts.renderFareDistanceChart(this.data.sampleTrips);
            
        } catch (error) {
            console.error('Error loading economic data:', error);
            throw error;
        }
    },
    
    /**
     * Refresh all data and charts
     */
    async refresh() {
        try {
            UI.showLoading();
            await this.loadAllData();
            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            UI.showError('Failed to refresh data: ' + error.message);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make App globally available for debugging
window.App = App;