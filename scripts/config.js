/**
 * ClubOS Lite - Configuration Module
 * Central configuration for the application
 */

window.ClubOS = window.ClubOS || {};

// Main configuration object
window.ClubOS.CONFIG = {
    // API Configuration
    API_ENDPOINT: window.CLUBOS_API_ENDPOINT || '/api/llm',
    SLACK_ENDPOINT: window.CLUBOS_SLACK_ENDPOINT || '/api/slack',
    MOCK_MODE: window.CLUBOS_MOCK_MODE !== undefined ? window.CLUBOS_MOCK_MODE : false,
    
    // App Settings
    THEME_KEY: 'clubos-theme',
    TASKS_KEY: 'clubos-recent-tasks',
    MAX_RECENT_TASKS: 5,
    
    // Timing
    DEMO_TIMEOUT: 30000, // 30 seconds
    DEMO_TYPING_SPEED: 50, // ms per character
    NOTIFICATION_DURATION: 4000,
    ERROR_DISPLAY_DURATION: 5000,
    LOADING_DELAY: 300, // Minimum loading indicator display time
    
    // Validation
    MIN_TASK_LENGTH: 3,
    MAX_TASK_LENGTH: 1000,
    MAX_LOCATION_LENGTH: 100,
    
    // Routes
    LLM_ROUTES: {
        'EmergencyLLM': 'emergency',
        'BookingLLM': 'booking',
        'TrackManLLM': 'tech',
        'ResponseToneLLM': 'tone',
        'generainfoLLM': 'general'
    },
    
    // Route Descriptions
    ROUTE_DESCRIPTIONS: {
        'auto': 'Automatically detect the best route based on your input',
        'emergency': 'For urgent issues requiring immediate attention',
        'booking': 'For reservation and booking-related issues',
        'tech': 'For TrackMan and technical equipment issues',
        'tone': 'To customize response tone and style',
        'general': 'For general inquiries and information'
    },
    
    // API Headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'X-ClubOS-Version': '1.0.0',
        'X-ClubOS-Client': 'web'
    },
    
    // Cache Settings
    CACHE_TTL: 300000, // 5 minutes
    CACHE_MAX_SIZE: 50,
    
    // Feature Flags
    FEATURES: {
        RECENT_TASKS: true,
        KEYBOARD_SHORTCUTS: true,
        ANALYTICS: true,
        HEALTH_CHECK: true,
        RESPONSE_CACHING: true,
        DEMO_MODE: true
    },
    
    // Analytics Settings
    ANALYTICS: {
        ENABLED: true,
        ENDPOINT: '/api/analytics',
        BATCH_SIZE: 10,
        FLUSH_INTERVAL: 30000 // 30 seconds
    },
    
    // Health Check Settings
    HEALTH_CHECK: {
        ENDPOINT: '/api/health',
        INTERVAL: 30000, // 30 seconds
        TIMEOUT: 5000 // 5 seconds
    },
    
    // Demo Settings
    DEMO: {
        TASKS: [
            {
                text: "TrackMan screen is frozen in Bay 3",
                location: "Bedford",
                route: "tech",
                typingSpeed: 50
            },
            {
                text: "Customer needs to cancel their 7pm booking",
                location: "Dartmouth",
                route: "booking",
                typingSpeed: 45
            },
            {
                text: "Power outage in the facility",
                location: "Halifax",
                route: "emergency",
                typingSpeed: 60
            }
        ]
    },
    
    // Error Messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection and try again.',
        VALIDATION: {
            TASK_TOO_SHORT: 'Please describe your task (minimum 3 characters)',
            TASK_TOO_LONG: 'Task description is too long (maximum 1000 characters)',
            LOCATION_TOO_LONG: 'Location is too long (maximum 100 characters)'
        },
        API: {
            TIMEOUT: 'Request timed out. Please try again.',
            SERVER_ERROR: 'Server error. Please try again later.',
            UNAUTHORIZED: 'Unauthorized. Please refresh the page.',
            NOT_FOUND: 'Endpoint not found. Please contact support.'
        },
        GENERAL: 'An unexpected error occurred. Please try again.'
    },
    
    // Success Messages
    SUCCESS: {
        TASK_SUBMITTED: 'Task submitted successfully',
        SLACK_SENT: 'Message sent to Slack',
        COPIED: 'Response copied to clipboard'
    },
    
    // Locations
    LOCATIONS: ['Bedford', 'Dartmouth', 'Halifax', 'Stratford', 'Truro'],
    
    // Priority Levels
    PRIORITIES: {
        low: { label: 'Low', color: '#6b7280' },
        medium: { label: 'Medium', color: '#3b82f6' },
        high: { label: 'High', color: '#ef4444' },
        urgent: { label: 'Urgent', color: '#dc2626' }
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(window.ClubOS.CONFIG);
Object.freeze(window.ClubOS.CONFIG.LLM_ROUTES);
Object.freeze(window.ClubOS.CONFIG.ROUTE_DESCRIPTIONS);
Object.freeze(window.ClubOS.CONFIG.FEATURES);
Object.freeze(window.ClubOS.CONFIG.ERRORS);
Object.freeze(window.ClubOS.CONFIG.SUCCESS);

console.log('✅ ClubOS Config loaded successfully');
