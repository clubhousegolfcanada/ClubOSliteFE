/**
 * ClubOS Lite - App Controller
 * Central orchestrator for form submission, validation, and LLM routing
 */

window.ClubOS = window.ClubOS || {};

class AppController {
    constructor() {
        this.config = {
            API_ENDPOINT: window.CLUBOS_API_ENDPOINT || '/api/llm',
            MOCK_MODE: window.CLUBOS_MOCK_MODE || false,
            ROUTES: {
                'EmergencyLLM': 'emergency',
                'BookingLLM': 'booking',
                'TrackManLLM': 'tech',
                'ResponseToneLLM': 'tone',
                'generainfoLLM': 'general'
            }
        };
        
        this.state = {
            isProcessing: false,
            currentRoute: 'auto',
            recentTasks: [],
            selectedTone: 'professional'
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadRecentTasks();
        this.initializeComponents();
        console.log('🚀 ClubOS AppController initialized');
    }
    
    cacheElements() {
        // Use optimized DOM cache
        const cache = window.ClubOS.DOMCache;
        this.elements = {
            form: cache.getById('taskForm'),
            taskInput: cache.getById('taskInput'),
            locationInput: cache.getById('locationInput'),
            priorityInputs: document.querySelectorAll('input[name="priority"]'),
            routeInputs: document.querySelectorAll('input[name="llm_route"]'),
            useLLMToggle: cache.getById('useLLM'),
            submitBtn: cache.getById('submitBtn'),
            resetBtn: cache.getById('resetBtn'),
            errorMessage: cache.getById('errorMessage'),
            responseArea: cache.getById('responseArea'),
            recentTasksContainer: cache.getById('recentTasks'),
            slackIndicator: cache.getById('slackIndicator'),
            llmToggleHelper: cache.getById('llmToggleHelper')
        };
    }
    
    bindEvents() {
        // Form submission
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Reset button
        this.elements.resetBtn.addEventListener('click', () => this.resetForm());
        
        // LLM toggle
        this.elements.useLLMToggle.addEventListener('change', (e) => this.handleLLMToggle(e));
        
        // Route selection
        this.elements.routeInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleRouteChange(e));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    initializeComponents() {
        // Initialize response manager
        if (window.ClubOS.ResponseManager) {
            window.ClubOS.ResponseManager.init();
        }
        
        // Note: ThemeManager is initialized in app.js to prevent duplicate initialization
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.state.isProcessing) return;
        
        // Check if demo is running
        if (window.ClubOS.Demo && window.ClubOS.Demo.isRunning()) {
            window.ClubOS.Demo.handleDemoSubmit();
            return;
        }
        
        try {
            this.setProcessingState(true);
            
            // Gather form data
            const formData = this.gatherFormData();
            
            // Validate
            const validation = this.validateFormData(formData);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }
            
            // Process based on LLM toggle
            if (formData.use_llm) {
                await this.processLLMRequest(formData);
            } else {
                await this.processSlackRequest(formData);
            }
            
            // Save to recent tasks
            this.saveRecentTask(formData);
            
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setProcessingState(false);
        }
    }
    
    gatherFormData() {
        const priority = document.querySelector('input[name="priority"]:checked');
        const route = document.querySelector('input[name="llm_route"]:checked');
        
        return {
            task: this.elements.taskInput.value.trim(),
            location: this.elements.locationInput.value.trim(),
            priority: priority ? priority.value : 'medium',
            use_llm: this.elements.useLLMToggle.checked,
            llm_route: route ? route.value : 'auto',
            timestamp: new Date().toISOString(),
            source: 'web',
            user_agent: navigator.userAgent
        };
    }
    
    validateFormData(data) {
        if (!data.task || data.task.length < 3) {
            return {
                isValid: false,
                message: 'Please describe your task (minimum 3 characters)'
            };
        }
        
        if (data.task.length > 1000) {
            return {
                isValid: false,
                message: 'Task description is too long (maximum 1000 characters)'
            };
        }
        
        return { isValid: true };
    }
    
    async processLLMRequest(formData) {
        // Show loading state
        window.ClubOS.ResponseManager.showLoading();
        
        try {
            // Determine route
            const route = this.determineRoute(formData);
            
            // Build payload
            const payload = this.buildLLMPayload(formData, route);
            
            // Send request
            const response = await this.sendLLMRequest(payload);
            
            // Display response
            window.ClubOS.ResponseManager.display(response);
            
        } catch (error) {
            throw new Error(`LLM processing failed: ${error.message}`);
        }
    }
    
    determineRoute(formData) {
        if (formData.llm_route === 'auto') {
            // Auto-detection logic
            const task = formData.task.toLowerCase();
            
            if (task.includes('emergency') || task.includes('urgent') || task.includes('broken')) {
                return 'emergency';
            } else if (task.includes('book') || task.includes('reservation') || task.includes('cancel')) {
                return 'booking';
            } else if (task.includes('trackman') || task.includes('frozen') || task.includes('screen')) {
                return 'tech';
            } else {
                return 'general';
            }
        }
        
        return this.config.ROUTES[formData.llm_route] || 'general';
    }
    
    buildLLMPayload(formData, route) {
        const basePayload = {
            route: route,
            task: formData.task,
            priority: formData.priority,
            location: formData.location,
            timestamp: formData.timestamp,
            source: formData.source
        };
        
        // Add route-specific fields
        switch (route) {
            case 'emergency':
                return {
                    ...basePayload,
                    emergencyId: this.generateId('EMG'),
                    issueType: this.detectIssueType(formData.task, 'emergency'),
                    status: 'open'
                };
                
            case 'booking':
                return {
                    ...basePayload,
                    bookingId: this.generateId('BKG'),
                    issueType: this.detectIssueType(formData.task, 'booking'),
                    userName: 'Guest User' // Would come from auth in production
                };
                
            case 'tech':
                return {
                    ...basePayload,
                    techIssueId: this.generateId('TCH'),
                    issueType: this.detectIssueType(formData.task, 'tech'),
                    bayNumber: this.extractBayNumber(formData.location)
                };
                
            default:
                return {
                    ...basePayload,
                    generalId: this.generateId('GEN'),
                    category: 'inquiry'
                };
        }
    }
    
    async sendLLMRequest(payload) {
        // Check cache first
        if (window.ClubOS.APICache) {
            const cached = window.ClubOS.APICache.get(this.config.API_ENDPOINT, payload);
            if (cached) {
                console.log('Using cached response');
                return cached;
            }
        }
        
        if (this.config.MOCK_MODE) {
            // Mock response for testing
            await this.simulateDelay(1500);
            const response = this.getMockResponse(payload.route);
            
            // Cache the mock response
            if (window.ClubOS.APICache) {
                window.ClubOS.APICache.set(this.config.API_ENDPOINT, payload, response);
            }
            
            return response;
        }
        
        const response = await fetch(this.config.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ClubOS-Version': '1.0.0'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache successful responses
        if (window.ClubOS.APICache) {
            window.ClubOS.APICache.set(this.config.API_ENDPOINT, payload, data);
        }
        
        return data;
    }
    
    async processSlackRequest(formData) {
        window.ClubOS.ResponseManager.showLoading();
        
        try {
            const payload = {
                channel: '#general',
                text: formData.task,
                location: formData.location,
                priority: formData.priority,
                timestamp: formData.timestamp
            };
            
            // In production, this would send to Slack webhook
            if (this.config.MOCK_MODE) {
                await this.simulateDelay(800);
                const mockResponse = {
                    status: 'sent',
                    slack_message_id: 'MSG-' + Date.now()
                };
                window.ClubOS.ResponseManager.display(mockResponse, true);
            } else {
                // Real Slack integration would go here
                const response = await fetch('/api/slack', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                window.ClubOS.ResponseManager.display(result, true);
            }
            
        } catch (error) {
            throw new Error(`Slack submission failed: ${error.message}`);
        }
    }
    
    handleLLMToggle(e) {
        const isEnabled = e.target.checked;
        
        // Get UI elements
        const routeOptions = document.querySelectorAll('.route-option');
        const llmRouteLabel = document.querySelector('#llmRouteGroup .form-label');
        
        // Update route inputs
        this.elements.routeInputs.forEach(input => {
            input.disabled = !isEnabled;
        });
        
        // Update route options visual state
        routeOptions.forEach(option => {
            option.style.opacity = isEnabled ? '1' : '0.5';
            option.style.cursor = isEnabled ? 'pointer' : 'not-allowed';
        });
        
        // Update route label
        if (llmRouteLabel) {
            llmRouteLabel.style.opacity = isEnabled ? '1' : '0.5';
            llmRouteLabel.innerHTML = isEnabled 
                ? 'Force LLM Route (optional)' 
                : 'Force LLM Route (disabled - sending to Slack)';
        }
        
        // Toggle visual indicators
        if (isEnabled) {
            this.elements.slackIndicator.style.display = 'none';
            this.elements.llmToggleHelper.style.display = 'none';
            this.elements.submitBtn.classList.remove('slack-mode');
            this.elements.submitBtn.innerHTML = 'Process Request';
        } else {
            this.elements.slackIndicator.style.display = 'inline';
            this.elements.llmToggleHelper.style.display = 'block';
            this.elements.submitBtn.classList.add('slack-mode');
            this.elements.submitBtn.innerHTML = 'Send to Slack';
        }
    }
    
    handleRouteChange(e) {
        this.state.currentRoute = e.target.value;
        console.log('Route changed to:', this.state.currentRoute);
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.elements.form.dispatchEvent(new Event('submit'));
        }
        
        // Escape to reset
        if (e.key === 'Escape') {
            e.preventDefault();
            this.resetForm();
        }
        
        // Ctrl/Cmd + D for demo
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (window.ClubOS.Demo) {
                window.ClubOS.Demo.run();
            }
        }
        
        // Alt + 1-5 for route selection
        if (e.altKey && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const routeIndex = parseInt(e.key) - 1;
            const routeInputs = Array.from(this.elements.routeInputs);
            if (routeInputs[routeIndex] && !routeInputs[routeIndex].disabled) {
                routeInputs[routeIndex].click();
            }
        }
    }
    
    setProcessingState(isProcessing) {
        this.state.isProcessing = isProcessing;
        
        if (isProcessing) {
            this.elements.submitBtn.disabled = true;
            const loadingText = this.elements.useLLMToggle.checked ? 'Processing...' : 'Sending to Slack...';
            this.elements.submitBtn.innerHTML = `<span class="spinner"></span> ${loadingText}`;
            this.elements.resetBtn.disabled = true;
        } else {
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = this.elements.useLLMToggle.checked 
                ? 'Process Request' 
                : 'Send to Slack';
            this.elements.resetBtn.disabled = false;
        }
    }
    
    resetForm() {
        this.elements.form.reset();
        this.hideError();
        window.ClubOS.ResponseManager.hide();
        this.elements.taskInput.focus();
        
        // Reset route to auto
        document.getElementById('route-auto').checked = true;
        
        // Ensure LLM toggle UI is correct
        this.handleLLMToggle({ target: this.elements.useLLMToggle });
    }
    
    handleError(error) {
        console.error('ClubOS Error:', error);
        this.showError(error.message || 'An unexpected error occurred');
        window.ClubOS.ResponseManager.hide();
    }
    
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideError(), 5000);
    }
    
    hideError() {
        this.elements.errorMessage.style.display = 'none';
        this.elements.errorMessage.textContent = '';
    }
    
    // Recent Tasks Management
    loadRecentTasks() {
        // Use safe storage wrapper
        const saved = window.ClubOS.Storage.get('clubos-recent-tasks', []);
        this.state.recentTasks = saved;
        this.renderRecentTasks();
        
        // Show recent tasks section if feature is enabled and tasks exist
        if (window.ClubOS.CONFIG?.FEATURES?.RECENT_TASKS && this.state.recentTasks.length > 0) {
            const section = document.getElementById('recentTasksSection');
            if (section) section.style.display = 'block';
        }
    }
    
    saveRecentTask(formData) {
        const task = {
            id: Date.now(),
            text: formData.task,
            location: formData.location,
            priority: formData.priority,
            route: formData.llm_route,
            timestamp: formData.timestamp
        };
        
        // Add to beginning, limit to 5
        this.state.recentTasks.unshift(task);
        this.state.recentTasks = this.state.recentTasks.slice(0, 5);
        
        // Save using safe storage wrapper
        window.ClubOS.Storage.set('clubos-recent-tasks', this.state.recentTasks);
        
        // Show recent tasks section if not already visible
        if (window.ClubOS.CONFIG?.FEATURES?.RECENT_TASKS) {
            const section = document.getElementById('recentTasksSection');
            if (section && section.style.display === 'none') {
                section.style.display = 'block';
            }
        }
        
        this.renderRecentTasks();
    }
    
    renderRecentTasks() {
        if (!this.elements.recentTasksContainer) return;
        
        if (this.state.recentTasks.length === 0) {
            this.elements.recentTasksContainer.innerHTML = 
                '<div class="history-item">No recent tasks</div>';
            return;
        }
        
        const html = this.state.recentTasks.map(task => `
            <div class="history-item" data-task-id="${task.id}">
                <span class="history-text">${this.truncateText(task.text, 50)}</span>
                <button class="history-use" data-task-id="${task.id}">Use</button>
            </div>
        `).join('');
        
        this.elements.recentTasksContainer.innerHTML = html;
        
        // Bind use buttons
        this.elements.recentTasksContainer.querySelectorAll('.history-use').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.useRecentTask(taskId);
            });
        });
    }
    
    useRecentTask(taskId) {
        const task = this.state.recentTasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Populate form
        this.elements.taskInput.value = task.text;
        this.elements.locationInput.value = task.location || '';
        
        // Set priority
        const priorityInput = document.getElementById(`priority-${task.priority}`);
        if (priorityInput) priorityInput.checked = true;
        
        // Set route
        const routeInput = document.querySelector(`input[name="llm_route"][value="${task.route}"]`);
        if (routeInput) routeInput.checked = true;
        
        // Focus task input
        this.elements.taskInput.focus();
        this.elements.taskInput.select();
    }
    
    // Utility Methods
    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    detectIssueType(task, category) {
        const taskLower = task.toLowerCase();
        
        switch (category) {
            case 'emergency':
                if (taskLower.includes('power')) return 'no_power';
                if (taskLower.includes('frozen')) return 'sim_frozen';
                if (taskLower.includes('trackman')) return 'trackman_fail';
                return 'other';
                
            case 'booking':
                if (taskLower.includes('cancel')) return 'cancellation';
                if (taskLower.includes('access') || taskLower.includes('code')) return 'no_access';
                if (taskLower.includes('duplicate')) return 'duplicate_booking';
                return 'other';
                
            case 'tech':
                if (taskLower.includes('ball') || taskLower.includes('detection')) return 'ball_detection';
                if (taskLower.includes('login') || taskLower.includes('password')) return 'login_failure';
                if (taskLower.includes('screen')) return 'screen_failure';
                if (taskLower.includes('wifi') || taskLower.includes('internet')) return 'wifi_issue';
                return 'app_glitch';
                
            default:
                return 'inquiry';
        }
    }
    
    extractBayNumber(location) {
        const match = location.match(/bay\s*(\d+)/i);
        return match ? parseInt(match[1]) : null;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
    
    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getMockResponse(route) {
        const mockResponses = {
            emergency: {
                status: 'completed',
                confidence: 0.92,
                recommendation: [
                    "Immediate Action: Contact on-site maintenance at ext. 555",
                    "Inform affected customers about the issue",
                    "Offer to relocate customers to available bays",
                    "Document incident in emergency log",
                    "Follow up within 30 minutes"
                ],
                llm_route_used: 'EmergencyLLM',
                processing_time: '1.2s'
            },
            booking: {
                status: 'completed',
                confidence: 0.88,
                recommendation: [
                    "Verify customer identity with booking reference",
                    "Check system for booking status",
                    "If valid, generate new access code",
                    "Send code via SMS/email to customer",
                    "Update booking notes with issue resolution"
                ],
                llm_route_used: 'BookingLLM',
                processing_time: '0.9s'
            },
            tech: {
                status: 'completed',
                confidence: 0.95,
                recommendation: [
                    "Access bay system via Splashtop",
                    "Close TrackMan application",
                    "Clear system cache",
                    "Restart TrackMan software",
                    "Test functionality before releasing to customer"
                ],
                llm_route_used: 'TrackManLLM',
                processing_time: '1.1s'
            },
            general: {
                status: 'completed',
                confidence: 0.85,
                recommendation: "Thank you for your inquiry. A team member will review your message and respond within 24 hours. For urgent matters, please call our support line at 1-800-CLUBOS.",
                llm_route_used: 'GeneralLLM',
                processing_time: '0.7s'
            }
        };
        
        return mockResponses[route] || mockResponses.general;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.ClubOS.AppController = new AppController();
    console.log('✅ ClubOS Lite Frontend Ready');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppController;
}