/**
 * ClubOS Lite - Telemetry System
 * Tracks usage metrics and performance data
 */

window.ClubOS = window.ClubOS || {};

window.ClubOS.Telemetry = {
    // Configuration
    enabled: true,
    debug: false,
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    endpoint: '/api/telemetry',
    
    // Storage
    events: [],
    metrics: new Map(),
    timers: new Map(),
    
    // Session info
    session: {
        id: null,
        startTime: null,
        lastActivity: null
    },
    
    /**
     * Initialize telemetry system
     */
    init() {
        // Generate session ID
        this.session.id = this.generateSessionId();
        this.session.startTime = Date.now();
        this.session.lastActivity = Date.now();
        
        // Set up automatic flushing
        if (this.enabled) {
            this.startAutoFlush();
        }
        
        // Track page visibility
        this.trackPageVisibility();
        
        // Track basic metrics
        this.trackBasicMetrics();
        
        console.log('✅ ClubOS Telemetry initialized');
    },
    
    /**
     * Track an event
     * @param {string} eventName - Name of the event
     * @param {object} properties - Event properties
     */
    track(eventName, properties = {}) {
        if (!this.enabled) return;
        
        const event = {
            name: eventName,
            properties: {
                ...properties,
                timestamp: Date.now(),
                sessionId: this.session.id,
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };
        
        this.events.push(event);
        this.session.lastActivity = Date.now();
        
        if (this.debug) {
            console.log('📊 Telemetry event:', event);
        }
        
        // Auto-flush if batch size reached
        if (this.events.length >= this.batchSize) {
            this.flush();
        }
    },
    
    /**
     * Start a timer
     * @param {string} name - Timer name
     */
    startTimer(name) {
        this.timers.set(name, Date.now());
    },
    
    /**
     * End a timer and track the duration
     * @param {string} name - Timer name
     * @param {object} properties - Additional properties
     */
    endTimer(name, properties = {}) {
        const startTime = this.timers.get(name);
        if (!startTime) return;
        
        const duration = Date.now() - startTime;
        this.timers.delete(name);
        
        this.track(`timer.${name}`, {
            duration,
            ...properties
        });
        
        return duration;
    },
    
    /**
     * Track a metric value
     * @param {string} name - Metric name
     * @param {number} value - Metric value
     * @param {string} unit - Optional unit
     */
    metric(name, value, unit = null) {
        if (!this.enabled) return;
        
        const metric = {
            name,
            value,
            unit,
            timestamp: Date.now()
        };
        
        // Store aggregated metrics
        if (!this.metrics.has(name)) {
            this.metrics.set(name, {
                count: 0,
                sum: 0,
                min: Infinity,
                max: -Infinity,
                values: []
            });
        }
        
        const agg = this.metrics.get(name);
        agg.count++;
        agg.sum += value;
        agg.min = Math.min(agg.min, value);
        agg.max = Math.max(agg.max, value);
        agg.values.push(value);
        
        // Keep only last 100 values
        if (agg.values.length > 100) {
            agg.values.shift();
        }
    },
    
    /**
     * Track page visibility changes
     */
    trackPageVisibility() {
        let hiddenTime = null;
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                hiddenTime = Date.now();
                this.track('page.hidden');
            } else {
                if (hiddenTime) {
                    const duration = Date.now() - hiddenTime;
                    this.track('page.visible', { hiddenDuration: duration });
                }
            }
        });
    },
    
    /**
     * Track basic performance metrics
     */
    trackBasicMetrics() {
        // Wait for page load
        window.addEventListener('load', () => {
            // Navigation timing
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const metrics = {
                    pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    domInteractive: timing.domInteractive - timing.navigationStart,
                    firstByte: timing.responseStart - timing.navigationStart
                };
                
                Object.entries(metrics).forEach(([name, value]) => {
                    this.metric(`performance.${name}`, value, 'ms');
                });
            }
            
            // Resource timing
            if (window.performance && window.performance.getEntriesByType) {
                const resources = window.performance.getEntriesByType('resource');
                this.metric('performance.resourceCount', resources.length);
                
                const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
                this.metric('performance.totalResourceSize', totalSize, 'bytes');
            }
            
            // Memory usage
            if (performance.memory) {
                this.metric('memory.used', performance.memory.usedJSHeapSize, 'bytes');
                this.metric('memory.total', performance.memory.totalJSHeapSize, 'bytes');
            }
        });
    },
    
    /**
     * Track errors
     * @param {Error} error - Error object
     * @param {object} context - Error context
     */
    trackError(error, context = {}) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            type: error.name,
            ...context
        });
    },
    
    /**
     * Get metrics summary
     * @returns {object} Metrics summary
     */
    getMetricsSummary() {
        const summary = {};
        
        this.metrics.forEach((agg, name) => {
            summary[name] = {
                count: agg.count,
                sum: agg.sum,
                average: agg.sum / agg.count,
                min: agg.min,
                max: agg.max
            };
        });
        
        return summary;
    },
    
    /**
     * Start automatic event flushing
     */
    startAutoFlush() {
        // Clear any existing interval
        if (this._flushInterval) {
            clearInterval(this._flushInterval);
        }
        
        this._flushInterval = setInterval(() => {
            if (this.events.length > 0) {
                this.flush();
            }
        }, this.flushInterval);
        
        // Flush on page unload
        window.addEventListener('beforeunload', () => {
            this.flush(true);
        });
    },
    
    /**
     * Flush events to server
     * @param {boolean} sync - Use synchronous request (for beforeunload)
     */
    async flush(sync = false) {
        if (!this.enabled || this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        const metricsToSend = this.getMetricsSummary();
        
        // Clear events
        this.events = [];
        
        const payload = {
            sessionId: this.session.id,
            events: eventsToSend,
            metrics: metricsToSend,
            sessionDuration: Date.now() - this.session.startTime
        };
        
        try {
            if (window.ClubOS.CONFIG?.MOCK_MODE) {
                console.log('📊 Telemetry flush (mock):', payload);
                return;
            }
            
            if (sync && navigator.sendBeacon) {
                // Use sendBeacon for sync requests
                navigator.sendBeacon(this.endpoint, JSON.stringify(payload));
            } else {
                // Use fetch for async requests
                await fetch(this.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            }
        } catch (error) {
            console.error('Telemetry flush failed:', error);
            // Re-add events to queue
            this.events.unshift(...eventsToSend);
        }
    },
    
    /**
     * Generate session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Enable/disable telemetry
     * @param {boolean} enabled - Enable state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (enabled) {
            this.startAutoFlush();
        } else {
            if (this._flushInterval) {
                clearInterval(this._flushInterval);
                this._flushInterval = null;
            }
        }
    },
    
    /**
     * Get session info
     * @returns {object} Session information
     */
    getSessionInfo() {
        return {
            id: this.session.id,
            duration: Date.now() - this.session.startTime,
            lastActivity: Date.now() - this.session.lastActivity,
            eventCount: this.events.length,
            metricsCount: this.metrics.size
        };
    }
};

// Auto-initialize if enabled
if (window.ClubOS.CONFIG?.FEATURES?.ANALYTICS !== false) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ClubOS.Telemetry.init();
        });
    } else {
        window.ClubOS.Telemetry.init();
    }
}

// Export for debugging
window.ClubOS.telemetry = {
    enable: () => window.ClubOS.Telemetry.setEnabled(true),
    disable: () => window.ClubOS.Telemetry.setEnabled(false),
    flush: () => window.ClubOS.Telemetry.flush(),
    summary: () => window.ClubOS.Telemetry.getMetricsSummary(),
    session: () => window.ClubOS.Telemetry.getSessionInfo()
};

console.log('💡 Telemetry controls available at window.ClubOS.telemetry');
