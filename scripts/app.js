/**
 * ClubOS Lite - Main Application Entry Point
 * Integrates all components and initializes the application
 */

// Global namespace
window.ClubOS = window.ClubOS || {};

// Configuration
window.ClubOS.CONFIG = {
    // API Configuration
    API_ENDPOINT: window.CLUBOS_API_ENDPOINT || '/api/llm',
    SLACK_ENDPOINT: window.CLUBOS_SLACK_ENDPOINT || '/api/slack',
    MOCK_MODE: window.CLUBOS_MOCK_MODE !== false, // Default to mock mode
    
    // App Settings
    THEME_KEY: 'clubos-theme',
    TASKS_KEY: 'clubos-recent-tasks',
    MAX_RECENT_TASKS: 5,
    
    // Timing
    DEMO_TIMEOUT: 30000, // 30 seconds
    DEMO_TYPING_SPEED: 50, // ms per character
    NOTIFICATION_DURATION: 4000,
    ERROR_DISPLAY_DURATION: 5000,
    
    // Validation
    MIN_TASK_LENGTH: 3,
    MAX_TASK_LENGTH: 1000,
    
    // Routes
    LLM_ROUTES: {
        'EmergencyLLM': 'emergency',
        'BookingLLM': 'booking',
        'TrackManLLM': 'tech',
        'ResponseToneLLM': 'tone',
        'generainfoLLM': 'general'
    }
};

// Theme Manager
window.ClubOS.ThemeManager = {
    init() {
        this.bindToggle();
        this.loadSavedTheme();
    },
    
    bindToggle() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    },
    
    loadSavedTheme() {
        const saved = localStorage.getItem(window.ClubOS.CONFIG.THEME_KEY) || 'dark';
        this.setTheme(saved);
    },
    
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
    },
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(window.ClubOS.CONFIG.THEME_KEY, theme);
        
        // Update toggle button
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.textContent = theme.toUpperCase();
        }
        
        // Update meta theme color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'dark' ? '#0a0a0a' : '#ffffff';
        }
    }
};

// Main Form Manager (extends the basic one from AppController)
window.ClubOS.MainFormManager = {
    elements: {},
    
    init() {
        this.cacheElements();
        this.setupCopyButton();
    },
    
    cacheElements() {
        this.elements = {
            form: document.getElementById('taskForm'),
            taskInput: document.getElementById('taskInput'),
            locationInput: document.getElementById('locationInput'),
            useLLM: document.getElementById('useLLM'),
            responseArea: document.getElementById('responseArea'),
            submitBtn: document.getElementById('submitBtn'),
            resetBtn: document.getElementById('resetBtn'),
            copyBtn: document.getElementById('copyResponse')
        };
    },
    
    setupCopyButton() {
        if (this.elements.copyBtn) {
            this.elements.copyBtn.addEventListener('click', () => this.copyResponse());
        }
    },
    
    async copyResponse() {
        const content = document.getElementById('responseContent');
        if (!content) return;
        
        try {
            await navigator.clipboard.writeText(content.innerText);
            this.showCopySuccess();
        } catch (err) {
            this.copyFallback(content.innerText);
        }
    },
    
    copyFallback(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            console.error('Copy failed:', err);
        }
        
        document.body.removeChild(textarea);
    },
    
    showCopySuccess() {
        const btn = this.elements.copyBtn;
        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = 'Copy';
        }, 2000);
    },
    
    setLoadingState(isLoading) {
        if (isLoading) {
            this.elements.submitBtn.disabled = true;
            this.elements.submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
            this.elements.resetBtn.disabled = true;
        } else {
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = this.elements.useLLM.checked 
                ? 'Process Request' 
                : 'Send to Slack';
            this.elements.resetBtn.disabled = false;
        }
    },
    
    createProgressBar() {
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        document.body.appendChild(bar);
        
        // Animate
        requestAnimationFrame(() => {
            bar.style.width = '80%';
        });
        
        return bar;
    },
    
    removeProgressBar(bar) {
        if (!bar) return;
        
        bar.style.width = '100%';
        setTimeout(() => {
            bar.style.opacity = '0';
            setTimeout(() => bar.remove(), 300);
        }, 200);
    },
    
    displayResponse(result, isSlackSubmission = false) {
        if (window.ClubOS.ResponseManager) {
            window.ClubOS.ResponseManager.display(result, isSlackSubmission);
        }
    },
    
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, window.ClubOS.CONFIG.ERROR_DISPLAY_DURATION);
        }
    },
    
    hideError() {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
};

// Health Check Manager
window.ClubOS.HealthCheck = {
    interval: null,
    isOnline: true,
    
    init() {
        this.checkHealth();
        this.startMonitoring();
        this.bindOfflineEvents();
    },
    
    async checkHealth() {
        if (window.ClubOS.CONFIG.MOCK_MODE) {
            this.setOnlineStatus(true);
            return;
        }
        
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                timeout: 5000
            });
            
            this.setOnlineStatus(response.ok);
        } catch (error) {
            this.setOnlineStatus(false);
        }
    },
    
    startMonitoring() {
        // Check every 30 seconds
        this.interval = setInterval(() => this.checkHealth(), 30000);
    },
    
    stopMonitoring() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },
    
    bindOfflineEvents() {
        window.addEventListener('online', () => {
            this.setOnlineStatus(true);
            this.checkHealth();
        });
        
        window.addEventListener('offline', () => {
            this.setOnlineStatus(false);
        });
    },
    
    setOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        
        if (isOnline) {
            document.body.classList.remove('offline');
            this.hideBanner();
        } else {
            document.body.classList.add('offline');
            this.showBanner();
        }
    },
    
    showBanner() {
        let banner = document.querySelector('.offline-banner');
        
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'offline-banner';
            banner.innerHTML = `
                <span>⚠️ Offline Mode - Some features may be limited</span>
                <span class="offline-indicator">
                    <span class="offline-dot"></span>
                    Reconnecting...
                </span>
            `;
            document.body.appendChild(banner);
        }
        
        setTimeout(() => banner.classList.add('show'), 10);
    },
    
    hideBanner() {
        const banner = document.querySelector('.offline-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }
};

// Analytics Manager
window.ClubOS.Analytics = {
    init() {
        this.trackPageView();
        this.bindEventTracking();
    },
    
    trackPageView() {
        this.track('page_view', {
            path: window.location.pathname,
            theme: document.documentElement.getAttribute('data-theme')
        });
    },
    
    bindEventTracking() {
        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#taskForm')) {
                const route = document.querySelector('input[name="llm_route"]:checked')?.value;
                this.track('form_submit', {
                    route: route,
                    use_llm: document.getElementById('useLLM').checked
                });
            }
        });
        
        // Track theme changes
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme');
            this.track('theme_change', { theme: newTheme });
        });
        
        // Track demo usage
        document.getElementById('demoBtn')?.addEventListener('click', () => {
            this.track('demo_started');
        });
    },
    
    track(event, data = {}) {
        // In production, send to analytics service
        if (window.ClubOS.CONFIG.MOCK_MODE) {
            console.log('📊 Analytics:', event, data);
        } else {
            // Send to analytics endpoint
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: event,
                    data: data,
                    timestamp: new Date().toISOString(),
                    session_id: this.getSessionId()
                })
            }).catch(err => console.error('Analytics error:', err));
        }
    },
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('clubos-session-id');
        if (!sessionId) {
            sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('clubos-session-id', sessionId);
        }
        return sessionId;
    }
};

// Main Application Initialization
window.ClubOS.App = {
    async init() {
        console.log('🏌️ Initializing ClubOS Lite...');
        
        try {
            // Show loading state
            this.showInitializing();
            
            // Initialize all managers
            await this.initializeManagers();
            
            // Setup UI
            this.setupUI();
            
            // Remove loading state
            this.hideInitializing();
            
            // Show ready notification
            this.showReady();
            
            console.log('✅ ClubOS Lite is ready!');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showInitError(error);
        }
    },
    
    async initializeManagers() {
        // Core systems
        window.ClubOS.ThemeManager.init();
        window.ClubOS.MainFormManager.init();
        
        // Response handling
        if (window.ClubOS.ResponseManager) {
            window.ClubOS.ResponseManager.init();
        }
        
        // Form handlers
        if (window.ClubOS.FormManager) {
            window.ClubOS.FormManager.init();
        }
        
        // Demo system
        if (window.ClubOS.Demo) {
            window.ClubOS.Demo.init();
        }
        
        // Health monitoring
        window.ClubOS.HealthCheck.init();
        
        // Analytics
        window.ClubOS.Analytics.init();
        
        // App Controller is initialized separately via DOMContentLoaded
    },
    
    setupUI() {
        // Add version info
        this.addVersionInfo();
        
        // Setup tooltips
        this.setupTooltips();
        
        // Focus management
        this.setupFocusManagement();
    },
    
    showInitializing() {
        const loader = document.createElement('div');
        loader.id = 'app-initializing';
        loader.className = 'app-initializing';
        loader.innerHTML = `
            <div class="init-content">
                <div class="init-spinner"></div>
                <div class="init-text">Initializing ClubOS Lite...</div>
            </div>
        `;
        document.body.appendChild(loader);
    },
    
    hideInitializing() {
        const loader = document.getElementById('app-initializing');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    },
    
    showReady() {
        if (window.ClubOS.CONFIG.MOCK_MODE) {
            window.ClubOS.UI.Notification.info(
                '🚧 Running in Mock Mode - API calls are simulated',
                5000
            );
        }
    },
    
    showInitError(error) {
        window.ClubOS.UI.Modal.alert(
            `Initialization failed: ${error.message}. Please refresh the page.`,
            'Error',
            'error'
        );
    },
    
    addVersionInfo() {
        const version = document.createElement('div');
        version.className = 'app-version';
        version.innerHTML = `
            <small>
                ClubOS Lite v1.0.0 
                ${window.ClubOS.CONFIG.MOCK_MODE ? '(Mock Mode)' : ''}
            </small>
        `;
        document.querySelector('.container').appendChild(version);
    },
    
    setupTooltips() {
        // Add tooltips to route options
        const routeLabels = {
            'route-auto': 'Automatically detect the best route based on your input',
            'route-emergency': 'For urgent issues requiring immediate attention',
            'route-booking': 'For reservation and booking-related issues',
            'route-trackman': 'For TrackMan and technical equipment issues',
            'route-response-tone': 'To customize response tone and style',
            'route-general': 'For general inquiries and information'
        };
        
        Object.entries(routeLabels).forEach(([id, tooltip]) => {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) {
                label.setAttribute('title', tooltip);
            }
        });
    },
    
    setupFocusManagement() {
        // Focus task input on load
        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.focus();
        }
        
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            const modal = document.querySelector('.clubos-modal-overlay');
            if (modal && e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(
                    'button, input, textarea, select, a[href]'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main app
    window.ClubOS.App.init();
});

// Add initialization styles
const initStyles = `
.app-initializing {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.3s ease;
}

.init-content {
    text-align: center;
}

.init-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-secondary);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: init-spin 0.8s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes init-spin {
    to { transform: rotate(360deg); }
}

.init-text {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.app-version {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-secondary);
    color: var(--text-muted);
}
`;

// Inject init styles
if (!document.querySelector('#clubos-init-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'clubos-init-styles';
    styleEl.textContent = initStyles;
    document.head.appendChild(styleEl);
}

// Export for debugging
window.ClubOS.debug = {
    config: window.ClubOS.CONFIG,
    mockMode: () => {
        window.ClubOS.CONFIG.MOCK_MODE = !window.ClubOS.CONFIG.MOCK_MODE;
        console.log('Mock mode:', window.ClubOS.CONFIG.MOCK_MODE);
    },
    clearStorage: () => {
        localStorage.clear();
        sessionStorage.clear();
        console.log('Storage cleared');
    },
    showAllForms: () => {
        console.log('Available forms:', Object.keys(window.ClubOS.Forms));
    },
    testNotification: (type = 'info') => {
        window.ClubOS.UI.Notification[type](`Test ${type} notification`);
    },
    testModal: () => {
        window.ClubOS.UI.Modal.confirm(
            'This is a test modal. Does it look good?',
            () => console.log('Confirmed!'),
            () => console.log('Cancelled!')
        );
    }
};

console.log('💡 ClubOS Debug tools available at window.ClubOS.debug');