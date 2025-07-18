/**
 * ClubOS Lite - Utility Functions
 * Common utilities used throughout the application
 */

window.ClubOS = window.ClubOS || {};

/**
 * DOM Cache Manager
 * Caches DOM element references to avoid repeated lookups
 */
window.ClubOS.DOMCache = {
    cache: {},
    
    /**
     * Get element by ID with caching
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
    getById(id) {
        if (!this.cache[id]) {
            this.cache[id] = document.getElementById(id);
        }
        return this.cache[id];
    },
    
    /**
     * Get element by selector with caching
     * @param {string} selector - CSS selector
     * @returns {HTMLElement|null}
     */
    getBySelector(selector) {
        if (!this.cache[selector]) {
            this.cache[selector] = document.querySelector(selector);
        }
        return this.cache[selector];
    },
    
    /**
     * Get all elements by selector with caching
     * @param {string} selector - CSS selector
     * @returns {NodeList}
     */
    getAllBySelector(selector) {
        if (!this.cache[selector + '_all']) {
            this.cache[selector + '_all'] = document.querySelectorAll(selector);
        }
        return this.cache[selector + '_all'];
    },
    
    /**
     * Clear cache for specific key or all cache
     * @param {string} [key] - Optional specific key to clear
     */
    clear(key) {
        if (key) {
            delete this.cache[key];
        } else {
            this.cache = {};
        }
    },
    
    /**
     * Refresh cache for specific element
     * @param {string} key - Cache key to refresh
     * @returns {HTMLElement|null}
     */
    refresh(key) {
        this.clear(key);
        if (key.startsWith('#')) {
            return this.getById(key.substring(1));
        } else {
            return this.getBySelector(key);
        }
    }
};

/**
 * Safe Storage Wrapper
 * Handles localStorage operations with fallback for private browsing
 */
window.ClubOS.Storage = {
    available: null,
    
    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    isAvailable() {
        if (this.available !== null) return this.available;
        
        try {
            const test = '__clubos_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            this.available = true;
        } catch (e) {
            this.available = false;
        }
        
        return this.available;
    },
    
    /**
     * Set item in storage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Storage set failed:', e);
            return false;
        }
    },
    
    /**
     * Get item from storage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Stored value or default
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable()) return defaultValue;
        
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage get failed:', e);
            return defaultValue;
        }
    },
    
    /**
     * Remove item from storage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Storage remove failed:', e);
            return false;
        }
    },
    
    /**
     * Clear all storage
     * @returns {boolean} Success status
     */
    clear() {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('Storage clear failed:', e);
            return false;
        }
    }
};

/**
 * Debounce Function
 * Limits function execution rate
 */
window.ClubOS.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle Function
 * Ensures function is called at most once per interval
 */
window.ClubOS.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Format Date/Time
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date
 */
window.ClubOS.formatDate = function(date, format = 'short') {
    const d = new Date(date);
    
    switch (format) {
        case 'short':
            return d.toLocaleDateString();
        case 'long':
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case 'time':
            return d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'full':
            return d.toLocaleString();
        default:
            return d.toString();
    }
};

/**
 * Generate Unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
window.ClubOS.generateId = function(prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * Deep Clone Object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
window.ClubOS.deepClone = function(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => window.ClubOS.deepClone(item));
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = window.ClubOS.deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
};

/**
 * Truncate Text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated text
 */
window.ClubOS.truncateText = function(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength - suffix.length) + suffix;
};

/**
 * API Cache Manager
 */
window.ClubOS.APICache = {
    cache: new Map(),
    
    /**
     * Generate cache key
     * @param {string} endpoint - API endpoint
     * @param {object} params - Request parameters
     * @returns {string} Cache key
     */
    generateKey(endpoint, params) {
        return `${endpoint}:${JSON.stringify(params)}`;
    },
    
    /**
     * Get cached response
     * @param {string} endpoint - API endpoint
     * @param {object} params - Request parameters
     * @returns {*} Cached response or null
     */
    get(endpoint, params) {
        const key = this.generateKey(endpoint, params);
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Check if cache is expired
        if (Date.now() - cached.timestamp > window.ClubOS.CONFIG.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    },
    
    /**
     * Set cached response
     * @param {string} endpoint - API endpoint
     * @param {object} params - Request parameters
     * @param {*} data - Response data
     */
    set(endpoint, params, data) {
        const key = this.generateKey(endpoint, params);
        
        // Limit cache size
        if (this.cache.size >= window.ClubOS.CONFIG.CACHE_MAX_SIZE) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    },
    
    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
    }
};

/**
 * Query String Parser
 */
window.ClubOS.parseQueryString = function(queryString) {
    const params = {};
    const searchParams = new URLSearchParams(queryString);
    
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    
    return params;
};

/**
 * Async Retry Wrapper
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries
 * @returns {Promise} Result of function
 */
window.ClubOS.retryAsync = async function(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return window.ClubOS.retryAsync(fn, retries - 1, delay);
    }
};

console.log('✅ ClubOS Utilities loaded successfully');

/**
 * Global Error Handler
 * Catches and handles uncaught errors
 */
window.ClubOS.ErrorHandler = {
    init() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', event.error);
            this.handleError(event.error, event.filename, event.lineno, event.colno);
            event.preventDefault(); // Prevent default error handling
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleRejection(event.reason);
            event.preventDefault();
        });
    },
    
    handleError(error, file, line, column) {
        const errorInfo = {
            message: error?.message || 'Unknown error',
            stack: error?.stack || 'No stack trace',
            file: file || 'Unknown file',
            line: line || 0,
            column: column || 0,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // Log to console in development
        if (window.ClubOS.CONFIG?.MOCK_MODE) {
            console.group('🚨 Error Details');
            console.error('Message:', errorInfo.message);
            console.error('File:', errorInfo.file);
            console.error('Line:', errorInfo.line, 'Column:', errorInfo.column);
            console.error('Stack:', errorInfo.stack);
            console.groupEnd();
        }
        
        // Show user-friendly notification
        if (window.ClubOS.UI?.Notification) {
            window.ClubOS.UI.Notification.error(
                'An unexpected error occurred. Please refresh the page if issues persist.',
                6000
            );
        }
        
        // Send to analytics/logging service in production
        if (!window.ClubOS.CONFIG?.MOCK_MODE) {
            this.reportError(errorInfo);
        }
    },
    
    handleRejection(reason) {
        const errorInfo = {
            type: 'unhandledRejection',
            reason: reason?.toString() || 'Unknown rejection',
            stack: reason?.stack || 'No stack trace',
            timestamp: new Date().toISOString()
        };
        
        // Show user notification for network errors
        if (reason?.message?.includes('fetch') || reason?.message?.includes('network')) {
            if (window.ClubOS.UI?.Notification) {
                window.ClubOS.UI.Notification.error(
                    'Network connection issue. Please check your internet connection.',
                    5000
                );
            }
        }
        
        // Log in development
        if (window.ClubOS.CONFIG?.MOCK_MODE) {
            console.warn('Unhandled Promise Rejection:', errorInfo);
        }
    },
    
    async reportError(errorInfo) {
        try {
            // Send error to logging endpoint
            await fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorInfo)
            });
        } catch (e) {
            // Silently fail - don't want error reporting to cause more errors
            console.error('Failed to report error:', e);
        }
    }
};

// Auto-initialize error handler when utilities load
window.ClubOS.ErrorHandler.init();
