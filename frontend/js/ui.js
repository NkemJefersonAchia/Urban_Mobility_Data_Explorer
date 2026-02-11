/**
 * UI Utilities for NYC Mobility Explorer
 * Handles DOM manipulation and user interactions
 */

const UI = {
    /**
     * Format number with commas
     */
    formatNumber(num) {
        if (num === null || num === undefined) return 'N/A';
        return num.toLocaleString('en-US');
    },
    
    /**
     * Format currency
     */
    formatCurrency(amount) {
        if (amount === null || amount === undefined) return 'N/A';
        return '$' + amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },
    
    /**
     * Format percentage
     */
    formatPercent(value) {
        if (value === null || value === undefined) return 'N/A';
        return value.toFixed(1) + '%';
    },
    
    /**
     * Show loading overlay
     */
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    },
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },
    
    /**
     * Update stat card
     */
    updateStat(elementId, value, formatter = null) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = formatter ? formatter(value) : value;
        }
    },
    
    /**
     * Switch between view sections
     */
    switchView(viewName) {
        // Hide all sections
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${viewName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    },
    
    /**
     * Populate zone table
     */
    populateZoneTable(data) {
        const tbody = document.getElementById('zone-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        data.forEach((zone, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${zone.zone_name}</td>
                <td>${zone.borough_name || 'Unknown'}</td>
                <td>${this.formatNumber(zone.pickup_count)}</td>
                <td>${this.formatNumber(zone.dropoff_count)}</td>
                <td><strong>${this.formatNumber(zone.total_activity)}</strong></td>
            `;
            tbody.appendChild(row);
        });
    },
    
    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        // Could implement a toast notification here
        alert('Error: ' + message);
    },
    
    /**
     * Initialize navigation
     */
    initNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
    },
    
    /**
     * Initialize filter controls
     */
    initFilters() {
        const applyBtn = document.getElementById('apply-filters');
        const resetBtn = document.getElementById('reset-filters');
        
        if (applyBtn) {
            applyBtn.addEventListener('click', async () => {
                const startDate = document.getElementById('start-date').value;
                const endDate = document.getElementById('end-date').value;
                
                if (!startDate || !endDate) {
                    this.showError('Please select both start and end dates');
                    return;
                }
                
                try {
                    this.showLoading();
                    const filters = {
                        start_date: startDate,
                        end_date: endDate
                    };
                    
                    const results = await API.customQuery(filters);
                    
                    // Update stats with filtered results
                    this.updateStat('total-trips', results.trip_count, this.formatNumber);
                    this.updateStat('avg-fare', results.avg_fare, this.formatCurrency);
                    this.updateStat('avg-distance', results.avg_distance);
                    this.updateStat('avg-tip', results.avg_tip_pct, this.formatPercent);
                    
                    this.hideLoading();
                } catch (error) {
                    this.hideLoading();
                    this.showError('Failed to apply filters: ' + error.message);
                }
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.getElementById('start-date').value = '';
                document.getElementById('end-date').value = '';
                // Reload original data
                window.App.loadOverviewData();
            });
        }
    },
    
    /**
     * Initialize map controls
     */
    initMapControls() {
        const modeSelect = document.getElementById('map-mode');
        const boroughSelect = document.getElementById('borough-filter');
        
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                console.log('Map mode changed:', e.target.value);
                // Would trigger map update here
            });
        }
        
        if (boroughSelect) {
            boroughSelect.addEventListener('change', (e) => {
                console.log('Borough filter changed:', e.target.value);
                // Would trigger data filtering here
            });
        }
    },
    
    /**
     * Animate number count-up
     */
    animateNumber(element, start, end, duration = 1000) {
        const range = end - start;
        const startTime = Date.now();
        
        const update = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = start + (range * this.easeOutCubic(progress));
            
            if (typeof end === 'number') {
                element.textContent = this.formatNumber(Math.floor(current));
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = this.formatNumber(end);
            }
        };
        
        update();
    },
    
    /**
     * Easing function for animations
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
};

// Make UI globally available
window.UI = UI;