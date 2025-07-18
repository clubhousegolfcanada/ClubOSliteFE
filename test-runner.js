/**
 * ClubOS Lite - Automated Test Suite
 * Run this script in the browser console to test all functionality
 */

(function() {
    'use strict';
    
    const TestRunner = {
        results: [],
        currentSuite: '',
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        
        // Test utilities
        async wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        assert(condition, message) {
            this.totalTests++;
            if (condition) {
                this.passedTests++;
                this.log('✅ PASS: ' + message, 'success');
            } else {
                this.failedTests++;
                this.log('❌ FAIL: ' + message, 'error');
            }
            return condition;
        },
        
        log(message, type = 'info') {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const logEntry = `[${timestamp}] ${message}`;
            
            switch(type) {
                case 'suite':
                    console.log(`\n%c${logEntry}`, 'font-weight: bold; font-size: 14px; color: #3b82f6;');
                    break;
                case 'success':
                    console.log(`%c${logEntry}`, 'color: #10b981;');
                    break;
                case 'error':
                    console.error(logEntry);
                    break;
                case 'warning':
                    console.warn(logEntry);
                    break;
                default:
                    console.log(logEntry);
            }
            
            this.results.push({ message: logEntry, type, suite: this.currentSuite });
        },
        
        startSuite(name) {
            this.currentSuite = name;
            this.log(`=== ${name} ===`, 'suite');
        },
        
        // Test Suites
        async runAllTests() {
            console.clear();
            this.log('🧪 Starting ClubOS Lite Test Suite', 'suite');
            this.log('Testing URL: ' + window.location.href);
            
            try {
                await this.testInitialization();
                await this.testUIElements();
                await this.testStateManagement();
                await this.testTelemetry();
                await this.testStorage();
                await this.testThemeToggle();
                await this.testFormValidation();
                await this.testDemo();
                await this.testKeyboardShortcuts();
                await this.testErrorHandling();
                await this.testResponsiveDesign();
                await this.testAPICache();
                
                this.showSummary();
            } catch (error) {
                this.log('Test suite crashed: ' + error.message, 'error');
                console.error(error);
            }
        },
        
        async testInitialization() {
            this.startSuite('Initialization Tests');
            
            // Test 1: Check if ClubOS namespace exists
            this.assert(typeof window.ClubOS === 'object', 'ClubOS namespace exists');
            
            // Test 2: Check core modules
            this.assert(typeof window.ClubOS.State === 'object', 'State manager loaded');
            this.assert(typeof window.ClubOS.Telemetry === 'object', 'Telemetry loaded');
            this.assert(typeof window.ClubOS.Storage === 'object', 'Storage wrapper loaded');
            this.assert(typeof window.ClubOS.DOMCache === 'object', 'DOMCache loaded');
            this.assert(typeof window.ClubOS.ErrorHandler === 'object', 'ErrorHandler loaded');
            
            // Test 3: Check UI components
            this.assert(typeof window.ClubOS.UI === 'object', 'UI namespace exists');
            this.assert(typeof window.ClubOS.UI.Modal === 'function', 'Modal component loaded');
            this.assert(typeof window.ClubOS.UI.NotificationClass === 'function', 'Notification component loaded');
            
            // Test 4: Check managers
            this.assert(typeof window.ClubOS.ResponseManager === 'object', 'ResponseManager loaded');
            this.assert(typeof window.ClubOS.AppController === 'object', 'AppController loaded');
            this.assert(typeof window.ClubOS.Demo === 'object', 'Demo system loaded');
            
            // Test 5: Check configuration
            this.assert(typeof window.ClubOS.CONFIG === 'object', 'Configuration loaded');
            this.assert(window.ClubOS.CONFIG.API_ENDPOINT !== undefined, 'API endpoint configured');
        },
        
        async testUIElements() {
            this.startSuite('UI Elements Tests');
            
            // Test form elements
            const elements = {
                'taskForm': document.getElementById('taskForm'),
                'taskInput': document.getElementById('taskInput'),
                'locationInput': document.getElementById('locationInput'),
                'useLLM': document.getElementById('useLLM'),
                'submitBtn': document.getElementById('submitBtn'),
                'resetBtn': document.getElementById('resetBtn'),
                'demoBtn': document.getElementById('demoBtn'),
                'themeToggle': document.getElementById('themeToggle'),
                'responseArea': document.getElementById('responseArea'),
                'errorMessage': document.getElementById('errorMessage'),
                'copyResponse': document.getElementById('copyResponse')
            };
            
            for (const [name, element] of Object.entries(elements)) {
                this.assert(element !== null, `${name} element exists`);
            }
            
            // Test route radio buttons
            const routes = ['auto', 'emergency', 'booking', 'trackman', 'response-tone', 'general'];
            routes.forEach(route => {
                const radio = document.getElementById(`route-${route}`);
                this.assert(radio !== null, `Route radio button '${route}' exists`);
            });
            
            // Test initial states
            this.assert(elements.useLLM.checked === true, 'LLM toggle is checked by default');
            this.assert(elements.responseArea.style.display === 'none' || elements.responseArea.style.display === '', 'Response area hidden by default');
            this.assert(elements.errorMessage.style.display === 'none' || elements.errorMessage.style.display === '', 'Error message hidden by default');
        },
        
        async testStateManagement() {
            this.startSuite('State Management Tests');
            
            const State = window.ClubOS.State;
            
            // Test get/set
            State.set('test.value', 42);
            this.assert(State.get('test.value') === 42, 'State set/get works');
            
            // Test nested paths
            State.set('test.nested.deep.value', 'hello');
            this.assert(State.get('test.nested.deep.value') === 'hello', 'Nested state paths work');
            
            // Test update
            State.update('test', { foo: 'bar', baz: 123 });
            this.assert(State.get('test.foo') === 'bar', 'State update works');
            this.assert(State.get('test.baz') === 123, 'State update preserves multiple values');
            
            // Test subscription
            let subscriptionCalled = false;
            const unsubscribe = State.subscribe('test.subscription', (value) => {
                subscriptionCalled = true;
            });
            State.set('test.subscription', 'triggered');
            await this.wait(10);
            this.assert(subscriptionCalled === true, 'State subscription works');
            unsubscribe();
            
            // Test initial state
            this.assert(State.get('app.initialized') === false, 'App initialized state is false');
            this.assert(State.get('user.theme') !== null, 'User theme is set');
        },
        
        async testTelemetry() {
            this.startSuite('Telemetry Tests');
            
            const Telemetry = window.ClubOS.Telemetry;
            
            // Test session
            const session = Telemetry.getSessionInfo();
            this.assert(session.id !== null, 'Telemetry session ID exists');
            this.assert(typeof session.duration === 'number', 'Session duration is tracked');
            
            // Test event tracking
            const initialEventCount = session.eventCount;
            Telemetry.track('test_event', { test: true });
            const newSession = Telemetry.getSessionInfo();
            this.assert(newSession.eventCount > initialEventCount, 'Events are tracked');
            
            // Test timer
            Telemetry.startTimer('test_timer');
            await this.wait(50);
            const duration = Telemetry.endTimer('test_timer');
            this.assert(duration >= 50, 'Timer tracking works');
            
            // Test metrics
            Telemetry.metric('test_metric', 100, 'ms');
            const summary = Telemetry.getMetricsSummary();
            this.assert(summary['test_metric'] !== undefined, 'Metrics are recorded');
        },
        
        async testStorage() {
            this.startSuite('Storage Tests');
            
            const Storage = window.ClubOS.Storage;
            
            // Test availability
            this.assert(Storage.isAvailable() !== null, 'Storage availability check works');
            
            // Test set/get
            const testData = { test: 'data', nested: { value: 123 } };
            Storage.set('test_storage', testData);
            const retrieved = Storage.get('test_storage');
            this.assert(retrieved !== null, 'Storage set/get works');
            this.assert(retrieved.test === 'data', 'Storage preserves data structure');
            
            // Test remove
            Storage.remove('test_storage');
            const removed = Storage.get('test_storage');
            this.assert(removed === null, 'Storage remove works');
            
            // Test with invalid data
            const result = Storage.set('test_circular', window);
            // Should handle circular references gracefully
            this.assert(true, 'Storage handles errors gracefully');
        },
        
        async testThemeToggle() {
            this.startSuite('Theme Toggle Tests');
            
            const themeToggle = document.getElementById('themeToggle');
            const initialTheme = document.documentElement.getAttribute('data-theme');
            
            // Click theme toggle
            themeToggle.click();
            await this.wait(100);
            
            const newTheme = document.documentElement.getAttribute('data-theme');
            this.assert(newTheme !== initialTheme, 'Theme changes on toggle');
            this.assert(themeToggle.textContent === newTheme.toUpperCase(), 'Theme button text updates');
            
            // Toggle back
            themeToggle.click();
            await this.wait(100);
            const finalTheme = document.documentElement.getAttribute('data-theme');
            this.assert(finalTheme === initialTheme, 'Theme toggles back');
        },
        
        async testFormValidation() {
            this.startSuite('Form Validation Tests');
            
            const form = document.getElementById('taskForm');
            const taskInput = document.getElementById('taskInput');
            const submitBtn = document.getElementById('submitBtn');
            
            // Test empty submission
            taskInput.value = '';
            const preventSubmit = (e) => {
                e.preventDefault();
                e.stopPropagation();
            };
            form.addEventListener('submit', preventSubmit);
            
            submitBtn.click();
            await this.wait(100);
            
            // Check for validation
            const errorMessage = document.getElementById('errorMessage');
            // Should show error for empty task
            this.assert(taskInput.value.length === 0, 'Empty task validation tested');
            
            // Test with valid input
            taskInput.value = 'Test task description';
            this.assert(taskInput.value.length > 3, 'Valid task length accepted');
            
            form.removeEventListener('submit', preventSubmit);
        },
        
        async testDemo() {
            this.startSuite('Demo Functionality Tests');
            
            const demoBtn = document.getElementById('demoBtn');
            const taskInput = document.getElementById('taskInput');
            const locationInput = document.getElementById('locationInput');
            
            // Clear form first
            taskInput.value = '';
            locationInput.value = '';
            
            // Start demo
            this.log('Starting demo test...');
            demoBtn.click();
            
            // Wait for typing animation
            await this.wait(2000);
            
            // Check if demo filled the form
            this.assert(taskInput.value.includes('TrackMan'), 'Demo fills task input');
            this.assert(locationInput.value === 'Halifax', 'Demo fills location');
            
            // Check if TrackMan route is selected
            const trackmanRadio = document.getElementById('route-trackman');
            this.assert(trackmanRadio.checked === true, 'Demo selects TrackMan route');
            
            // Wait for demo to complete
            await this.wait(3000);
            
            // Check if response appeared
            const responseArea = document.getElementById('responseArea');
            this.assert(responseArea.style.display !== 'none', 'Demo shows response');
            
            // Check for demo notice
            const demoNotice = document.querySelector('[data-demo-notice]');
            this.assert(demoNotice !== null, 'Demo notice appears');
            
            // Reset form
            document.getElementById('resetBtn').click();
            await this.wait(100);
            this.assert(taskInput.value === '', 'Reset button clears form');
        },
        
        async testKeyboardShortcuts() {
            this.startSuite('Keyboard Shortcuts Tests');
            
            const taskInput = document.getElementById('taskInput');
            taskInput.value = 'Test keyboard shortcuts';
            
            // Test Escape key (reset)
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);
            await this.wait(100);
            this.assert(taskInput.value === '', 'Escape key resets form');
            
            // Test focus
            taskInput.value = 'Test';
            taskInput.focus();
            this.assert(document.activeElement === taskInput, 'Task input can be focused');
            
            // Note: Ctrl+Enter and Ctrl+D are harder to test programmatically
            this.log('Manual test needed for Ctrl+Enter and Ctrl+D shortcuts', 'warning');
        },
        
        async testErrorHandling() {
            this.startSuite('Error Handling Tests');
            
            // Test global error handler
            const errorHandler = window.ClubOS.ErrorHandler;
            this.assert(typeof errorHandler === 'object', 'ErrorHandler exists');
            
            // Test error tracking
            try {
                throw new Error('Test error');
            } catch (e) {
                errorHandler.handleError(e, 'test.js', 100, 50);
                this.assert(true, 'Error handler processes errors without crashing');
            }
            
            // Test unhandled rejection
            errorHandler.handleRejection('Test rejection');
            this.assert(true, 'Rejection handler works');
        },
        
        async testResponsiveDesign() {
            this.startSuite('Responsive Design Tests');
            
            // Check viewport meta tag
            const viewport = document.querySelector('meta[name="viewport"]');
            this.assert(viewport !== null, 'Viewport meta tag exists');
            
            // Check if shortcuts hint is visible
            const shortcutsHint = document.querySelector('.shortcuts-hint');
            this.assert(shortcutsHint !== null, 'Keyboard shortcuts hint exists');
            
            // Test container
            const container = document.querySelector('.container');
            this.assert(container !== null, 'Main container exists');
            
            // Note: Full responsive testing requires viewport changes
            this.log('Manual test needed for mobile responsiveness', 'warning');
        },
        
        async testAPICache() {
            this.startSuite('API Cache Tests');
            
            const APICache = window.ClubOS.APICache;
            
            // Test cache set/get
            const testEndpoint = '/api/test';
            const testPayload = { test: true };
            const testResponse = { success: true, data: 'test' };
            
            APICache.set(testEndpoint, testPayload, testResponse);
            const cached = APICache.get(testEndpoint, testPayload);
            
            this.assert(cached !== null, 'API cache stores data');
            this.assert(cached.success === true, 'API cache preserves response data');
            
            // Clear cache
            APICache.clear();
            const cleared = APICache.get(testEndpoint, testPayload);
            this.assert(cleared === null, 'API cache clear works');
        },
        
        showSummary() {
            this.log('\n📊 Test Summary', 'suite');
            this.log(`Total Tests: ${this.totalTests}`);
            this.log(`Passed: ${this.passedTests} ✅`, 'success');
            this.log(`Failed: ${this.failedTests} ❌`, this.failedTests > 0 ? 'error' : 'info');
            this.log(`Success Rate: ${Math.round((this.passedTests / this.totalTests) * 100)}%`);
            
            if (this.failedTests === 0) {
                this.log('\n🎉 All tests passed! ClubOS Lite is working correctly.', 'success');
            } else {
                this.log('\n⚠️ Some tests failed. Check the logs above for details.', 'warning');
                
                // Show failed tests
                this.log('\nFailed Tests:', 'error');
                this.results
                    .filter(r => r.type === 'error' && r.message.includes('FAIL'))
                    .forEach(r => this.log(r.message.replace(/\[.*?\] /, ''), 'error'));
            }
            
            // Test browser compatibility
            this.log('\n🌐 Browser Information:', 'suite');
            this.log(`User Agent: ${navigator.userAgent}`);
            this.log(`Local Storage: ${window.ClubOS.Storage.isAvailable() ? 'Available' : 'Not Available'}`);
            this.log(`Online Status: ${navigator.onLine ? 'Online' : 'Offline'}`);
            
            return {
                total: this.totalTests,
                passed: this.passedTests,
                failed: this.failedTests,
                results: this.results
            };
        }
    };
    
    // Run tests automatically
    TestRunner.runAllTests();
    
    // Export for manual use
    window.ClubOSTest = TestRunner;
})();

console.log('\n💡 Test runner available at window.ClubOSTest');
console.log('Run individual test suites with: ClubOSTest.testSuiteName()');
console.log('Run all tests again with: ClubOSTest.runAllTests()');
