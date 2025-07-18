/**
 * ClubOS Lite - Application State Management
 * Centralized state management for the application
 */

window.ClubOS = window.ClubOS || {};

window.ClubOS.State = {
    // Application state
    app: {
        initialized: false,
        loading: false,
        error: null,
        version: '1.0.0'
    },
    
    // Form state
    form: {
        isSubmitting: false,
        lastSubmission: null,
        currentRoute: 'auto',
        validationErrors: {}
    },
    
    // User preferences
    user: {
        theme: 'dark',
        recentTasks: [],
        lastActivity: null
    },
    
    // Session state
    session: {
        startTime: Date.now(),
        requestCount: 0,
        errorCount: 0
    },
    
    // Feature flags (can be overridden by config)
    features: {
        recentTasks: true,
        keyboardShortcuts: true,
        demo: true,
        analytics: true
    },
    
    /**
     * Get a value from state using dot notation
     * @param {string} path - Path to value (e.g., 'user.theme')
     * @returns {*} The value or null if not found
     */
    get(path) {
        if (!path) return null;
        
        const keys = path.split('.');
        let value = this;
        
        for (const key of keys) {
            value = value[key];
            if (value === undefined) return null;
        }
        
        return value;
    },
    
    /**
     * Set a value in state using dot notation
     * @param {string} path - Path to value (e.g., 'user.theme')
     * @param {*} value - The value to set
     */
    set(path, value) {
        if (!path) return;
        
        const keys = path.split('.');
        let obj = this;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]];
        }
        
        // Set the value
        const lastKey = keys[keys.length - 1];
        obj[lastKey] = value;
        
        // Trigger state change event
        this.notifyChange(path, value);
    },
    
    /**
     * Update multiple values at once
     * @param {string} path - Base path
     * @param {object} updates - Object with updates
     */
    update(path, updates) {
        if (!updates || typeof updates !== 'object') return;
        
        Object.keys(updates).forEach(key => {
            this.set(`${path}.${key}`, updates[key]);
        });
    },
    
    /**
     * Subscribe to state changes
     * @param {string} path - Path to watch (or '*' for all)
     * @param {function} callback - Callback function
     * @returns {function} Unsubscribe function
     */
    subscribe(path, callback) {
        if (!this._subscribers) {
            this._subscribers = new Map();
        }
        
        if (!this._subscribers.has(path)) {
            this._subscribers.set(path, new Set());
        }
        
        this._subscribers.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            const subscribers = this._subscribers.get(path);
            if (subscribers) {
                subscribers.delete(callback);
                if (subscribers.size === 0) {
                    this._subscribers.delete(path);
                }
            }
        };
    },
    
    /**
     * Notify subscribers of state changes
     * @param {string} path - Path that changed
     * @param {*} value - New value
     */
    notifyChange(path, value) {
        if (!this._subscribers) return;
        
        // Notify specific path subscribers
        const pathSubscribers = this._subscribers.get(path);
        if (pathSubscribers) {
            pathSubscribers.forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('State subscriber error:', error);
                }
            });
        }
        
        // Notify wildcard subscribers
        const wildcardSubscribers = this._subscribers.get('*');
        if (wildcardSubscribers) {
            wildcardSubscribers.forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('State subscriber error:', error);
                }
            });
        }
    },
    
    /**
     * Reset state to defaults
     * @param {string} path - Optional path to reset (resets all if not provided)
     */
    reset(path) {
        if (!path) {
            // Reset all state
            this.app = {
                initialized: false,
                loading: false,
                error: null,
                version: '1.0.0'
            };
            this.form = {
                isSubmitting: false,
                lastSubmission: null,
                currentRoute: 'auto',
                validationErrors: {}
            };
            this.session.requestCount = 0;
            this.session.errorCount = 0;
            this.notifyChange('*', null);
        } else {
            // Reset specific path
            this.set(path, null);
        }
    },
    
    /**
     * Get a snapshot of current state
     * @returns {object} State snapshot
     */
    getSnapshot() {
        return {
            app: { ...this.app },
            form: { ...this.form },
            user: { ...this.user },
            session: { ...this.session },
            features: { ...this.features }
        };
    },
    
    /**
     * Load state from snapshot
     * @param {object} snapshot - State snapshot
     */
    loadSnapshot(snapshot) {
        if (snapshot.app) this.app = { ...snapshot.app };
        if (snapshot.form) this.form = { ...snapshot.form };
        if (snapshot.user) this.user = { ...snapshot.user };
        if (snapshot.session) this.session = { ...snapshot.session };
        if (snapshot.features) this.features = { ...snapshot.features };
        this.notifyChange('*', snapshot);
    }
};

// Initialize state from localStorage if available
if (window.ClubOS.Storage) {
    const savedTheme = window.ClubOS.Storage.get('clubos-theme', 'dark');
    window.ClubOS.State.set('user.theme', savedTheme);
    
    const savedTasks = window.ClubOS.Storage.get('clubos-recent-tasks', []);
    window.ClubOS.State.set('user.recentTasks', savedTasks);
}

console.log('✅ ClubOS State Manager initialized');
