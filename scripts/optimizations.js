/**
 * ClubOS Lite - Performance Optimizations
 * Quick implementation of key optimizations
 */

// 1. Centralized DOM Cache
window.ClubOS.DOMCache = {
    elements: new Map(),
    
    get(selector) {
        if (!this.elements.has(selector)) {
            const element = document.querySelector(selector);
            if (element) {
                this.elements.set(selector, element);
            }
        }
        return this.elements.get(selector);
    },
    
    getById(id) {
        const key = `#${id}`;
        if (!this.elements.has(key)) {
            const element = document.getElementById(id);
            if (element) {
                this.elements.set(key, element);
            }
        }
        return this.elements.get(key);
    },
    
    clear() {
        this.elements.clear();
    }
};

// 2. Debounce Utility
window.ClubOS.Utils = window.ClubOS.Utils || {};

window.ClubOS.Utils.debounce = function(fn, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
};

// 3. Throttle Utility
window.ClubOS.Utils.throttle = function(fn, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// 4. API Response Cache
window.ClubOS.APICache = {
    cache: new Map(),
    maxAge: 5 * 60 * 1000, // 5 minutes
    
    generateKey(endpoint, payload) {
        return JSON.stringify({ endpoint, ...payload });
    },
    
    get(endpoint, payload) {
        const key = this.generateKey(endpoint, payload);
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.maxAge) {
            console.log('📦 Cache hit:', key);
            return cached.data;
        }
        
        return null;
    },
    
    set(endpoint, payload, data) {
        const key = this.generateKey(endpoint, payload);
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        // Cleanup old entries
        setTimeout(() => this.cleanup(), 1000);
    },
    
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.maxAge) {
                this.cache.delete(key);
            }
        }
    },
    
    clear() {
        this.cache.clear();
    }
};

// 5. Optimized Event Delegation
window.ClubOS.EventDelegator = {
    init() {
        // Single change event listener for all form inputs
        document.addEventListener('change', this.handleChange.bind(this));
        
        // Single click listener for all buttons
        document.addEventListener('click', this.handleClick.bind(this));
        
        // Single input listener with debouncing
        document.addEventListener('input', 
            window.ClubOS.Utils.debounce(this.handleInput.bind(this), 300)
        );
    },
    
    handleChange(e) {
        // Route radio buttons
        if (e.target.matches('input[name="llm_route"]')) {
            if (window.ClubOS.AppController) {
                window.ClubOS.AppController.handleRouteChange(e);
            }
        }
        
        // Toggle switches
        if (e.target.matches('.toggle-switch input')) {
            this.updateToggleVisual(e.target);
        }
        
        // LLM toggle
        if (e.target.id === 'useLLM') {
            if (window.ClubOS.AppController) {
                window.ClubOS.AppController.handleLLMToggle(e);
            }
        }
    },
    
    handleClick(e) {
        // Theme toggle
        if (e.target.id === 'themeToggle') {
            e.preventDefault();
            window.ClubOS.ThemeManager.toggleTheme();
        }
        
        // Demo button
        if (e.target.id === 'demoBtn') {
            e.preventDefault();
            if (window.ClubOS.Demo) {
                window.ClubOS.Demo.run();
            }
        }
        
        // Reset button
        if (e.target.id === 'resetBtn') {
            e.preventDefault();
            if (window.ClubOS.AppController) {
                window.ClubOS.AppController.resetForm();
            }
        }
    },
    
    handleInput(e) {
        // Validation on input fields
        const field = e.target;
        if (field.matches('input[type="text"], textarea')) {
            const form = field.closest('form');
            if (form && window.ClubOS.UI && window.ClubOS.UI.FormValidator) {
                const validator = form._validator;
                if (validator) {
                    validator.validateField(field.name);
                }
            }
        }
    },
    
    updateToggleVisual(toggle) {
        if (toggle.checked) {
            toggle.parentElement.style.background = 'var(--accent)';
        } else {
            toggle.parentElement.style.background = 'var(--bg-tertiary)';
        }
    }
};

// 6. Lazy Form Loader
window.ClubOS.LazyFormLoader = {
    loaded: new Set(),
    
    async loadForm(formType) {
        if (this.loaded.has(formType)) {
            return window.ClubOS.Forms[formType];
        }
        
        console.log(`📦 Lazy loading ${formType} form...`);
        
        // In production, this would be dynamic import
        // For now, just mark as loaded if it exists
        if (window.ClubOS.Forms && window.ClubOS.Forms[formType]) {
            this.loaded.add(formType);
            return window.ClubOS.Forms[formType];
        }
        
        throw new Error(`Form type ${formType} not found`);
    }
};

// 7. Performance Monitor
window.ClubOS.Performance = {
    marks: new Map(),
    
    mark(name) {
        this.marks.set(name, performance.now());
    },
    
    measure(name, startMark) {
        const start = this.marks.get(startMark);
        if (!start) return;
        
        const duration = performance.now() - start;
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        
        // Send to analytics if needed
        if (window.ClubOS.Analytics) {
            window.ClubOS.Analytics.track('performance_measure', {
                name: name,
                duration: duration
            });
        }
        
        return duration;
    },
    
    logMemory() {
        if (performance.memory) {
            const mb = (bytes) => (bytes / 1048576).toFixed(2);
            console.log('💾 Memory Usage:', {
                used: mb(performance.memory.usedJSHeapSize) + ' MB',
                total: mb(performance.memory.totalJSHeapSize) + ' MB',
                limit: mb(performance.memory.jsHeapSizeLimit) + ' MB'
            });
        }
    }
};

// 8. Optimized Storage Wrapper
window.ClubOS.Storage = {
    async get(key) {
        return new Promise((resolve) => {
            // Async to prevent blocking
            setTimeout(() => {
                try {
                    const value = localStorage.getItem(key);
                    resolve(value ? JSON.parse(value) : null);
                } catch (e) {
                    console.error('Storage get error:', e);
                    resolve(null);
                }
            }, 0);
        });
    },
    
    async set(key, value) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    resolve(true);
                } catch (e) {
                    console.error('Storage set error:', e);
                    resolve(false);
                }
            }, 0);
        });
    },
    
    async remove(key) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    localStorage.removeItem(key);
                    resolve(true);
                } catch (e) {
                    resolve(false);
                }
            }, 0);
        });
    }
};

// 9. Request Animation Frame Queue
window.ClubOS.RAF = {
    queue: [],
    running: false,
    
    add(fn) {
        this.queue.push(fn);
        if (!this.running) {
            this.run();
        }
    },
    
    run() {
        if (this.queue.length === 0) {
            this.running = false;
            return;
        }
        
        this.running = true;
        requestAnimationFrame(() => {
            const fn = this.queue.shift();
            if (fn) fn();
            this.run();
        });
    }
};

// 10. Initialize Optimizations
window.ClubOS.initOptimizations = function() {
    console.log('🚀 Initializing performance optimizations...');
    
    // Mark start time
    window.ClubOS.Performance.mark('app_init_start');
    
    // Initialize event delegation
    window.ClubOS.EventDelegator.init();
    
    // Initialize toggle visual states
    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
        if (toggle.checked) {
            toggle.parentElement.style.background = 'var(--accent)';
        }
    });
    
    // Set up performance monitoring
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log(`📊 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
            }
        });
        observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
    
    // Monitor long tasks
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes.includes('longtask')) {
        const taskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.warn('⚠️ Long task detected:', {
                    duration: entry.duration.toFixed(2) + 'ms',
                    startTime: entry.startTime.toFixed(2) + 'ms'
                });
            }
        });
        taskObserver.observe({ entryTypes: ['longtask'] });
    }
    
    // Log initial metrics
    window.addEventListener('load', () => {
        window.ClubOS.Performance.measure('app_init_complete', 'app_init_start');
        window.ClubOS.Performance.logMemory();
        
        // Log Web Vitals
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            console.log('📈 Page Load Metrics:', {
                'DOM Content Loaded': timing.domContentLoadedEventEnd - timing.navigationStart + 'ms',
                'Page Load Complete': timing.loadEventEnd - timing.navigationStart + 'ms',
                'First Paint': performance.getEntriesByType('paint')[0]?.startTime.toFixed(2) + 'ms'
            });
        }
    });
    
    console.log('✅ Optimizations initialized');
};

// Auto-initialize optimizations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.ClubOS.initOptimizations);
} else {
    window.ClubOS.initOptimizations();
}

// Export optimization utilities
window.ClubOS.optimize = {
    // Clear all caches
    clearCaches() {
        window.ClubOS.DOMCache.clear();
        window.ClubOS.APICache.clear();
        console.log('✅ All caches cleared');
    },
    
    // Get performance report
    getPerformanceReport() {
        const report = {
            memory: {},
            caches: {
                dom: window.ClubOS.DOMCache.elements.size,
                api: window.ClubOS.APICache.cache.size
            },
            timing: {}
        };
        
        if (performance.memory) {
            report.memory = {
                used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB'
            };
        }
        
        if (performance.timing) {
            const timing = performance.timing;
            report.timing = {
                pageLoad: timing.loadEventEnd - timing.navigationStart + 'ms',
                domReady: timing.domContentLoadedEventEnd - timing.navigationStart + 'ms'
            };
        }
        
        return report;
    }
};

console.log('💡 Performance tools available at window.ClubOS.optimize');
