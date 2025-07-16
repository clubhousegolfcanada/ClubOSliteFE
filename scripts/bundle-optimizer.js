/**
 * ClubOS Bundle Optimizer
 * Combines and minifies scripts for production
 */

const fs = require('fs');
const path = require('path');

// Script loading order
const scripts = [
    // Core utilities
    'scripts/optimizations.js',
    'components/UICcomponents.js',
    
    // Core modules
    'scripts/config.js',
    'scripts/state.js',
    'scripts/telemetry.js',
    
    // Features
    'features/FormHandlers.js',
    'scripts/demo.js',
    
    // LLM System
    'llm/utils.js',
    'llm/templateLoader.js',
    'llm/responseParser.js',
    'llm/llmDispatcher.js',
    
    // Controllers
    'scripts/ResponseManager.js',
    'scripts/AppController.js',
    'scripts/app.js'
];

// CSS files
const cssFiles = [
    'styles/reset.css',
    'styles/variables.css',
    'styles/theme.css',
    'styles/base.css',
    'styles/utilities.css',
    'styles/components.css',
    'styles/forms.css',
    'styles/main.css',
    'styles/responsive.css'
];

function bundleScripts() {
    console.log('📦 Bundling JavaScript files...');
    
    let bundle = '/* ClubOS Lite - Optimized Bundle */\n';
    bundle += '(function() {\n';
    bundle += '"use strict";\n\n';
    
    scripts.forEach(scriptPath => {
        try {
            const fullPath = path.join(__dirname, '..', scriptPath);
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Remove module exports for browser
            let processed = content
                .replace(/if \(typeof module !== 'undefined' && module\.exports\)[\s\S]*?}/g, '')
                .replace(/module\.exports = [\s\S]*?;/g, '');
            
            bundle += `\n/* === ${scriptPath} === */\n${processed}\n`;
            console.log(`✅ Added ${scriptPath}`);
        } catch (err) {
            console.error(`❌ Error loading ${scriptPath}:`, err.message);
        }
    });
    
    bundle += '\n})();';
    
    // Write bundle
    fs.writeFileSync(path.join(__dirname, '..', 'dist', 'clubos-bundle.js'), bundle);
    console.log('✅ JavaScript bundle created');
    
    // Create minified version (basic minification)
    const minified = bundle
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}();,:])\s*/g, '$1') // Remove spaces around operators
        .trim();
    
    fs.writeFileSync(path.join(__dirname, '..', 'dist', 'clubos-bundle.min.js'), minified);
    console.log('✅ Minified JavaScript bundle created');
}

function bundleCSS() {
    console.log('\n📦 Bundling CSS files...');
    
    let bundle = '/* ClubOS Lite - Optimized CSS Bundle */\n';
    
    cssFiles.forEach(cssPath => {
        try {
            const fullPath = path.join(__dirname, '..', cssPath);
            const content = fs.readFileSync(fullPath, 'utf8');
            
            bundle += `\n/* === ${cssPath} === */\n${content}\n`;
            console.log(`✅ Added ${cssPath}`);
        } catch (err) {
            console.error(`❌ Error loading ${cssPath}:`, err.message);
        }
    });
    
    // Write bundle
    fs.writeFileSync(path.join(__dirname, '..', 'dist', 'clubos-bundle.css'), bundle);
    console.log('✅ CSS bundle created');
    
    // Create minified version
    const minified = bundle
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around CSS operators
        .replace(/;\s*}/g, '}') // Remove last semicolon before closing brace
        .trim();
    
    fs.writeFileSync(path.join(__dirname, '..', 'dist', 'clubos-bundle.min.css'), minified);
    console.log('✅ Minified CSS bundle created');
}

function createOptimizedHTML() {
    console.log('\n📦 Creating optimized HTML...');
    
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <meta name="theme-color" content="#0a0a0a">
    <title>ClubOS Lite - Optimized</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Optimized CSS Bundle -->
    <link rel="stylesheet" href="clubos-bundle.min.css">
    
    <!-- Early theme detection -->
    <script>
        (function() {
            const savedTheme = localStorage.getItem('clubos-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) {
                metaTheme.content = savedTheme === 'dark' ? '#0a0a0a' : '#ffffff';
            }
        })();
    </script>
    
    <!-- Configuration -->
    <script>
        window.CLUBOS_API_ENDPOINT = window.CLUBOS_API_ENDPOINT || 'http://localhost:8000/process';
        window.CLUBOS_SLACK_ENDPOINT = window.CLUBOS_SLACK_ENDPOINT || 'http://localhost:8000/slack';
        window.CLUBOS_MOCK_MODE = window.CLUBOS_MOCK_MODE !== undefined ? window.CLUBOS_MOCK_MODE : true;
    </script>
</head>
<body>
    <div class="container">
        <!-- Header Component -->
        <header class="header">
            <h1 class="logo">ClubOS Lite</h1>
            <div class="header-actions">
                <button id="demoBtn" class="btn-demo" title="See a live example of TrackMan troubleshooting">
                    Demo
                </button>
                <button class="theme-toggle" id="themeToggle">DARK</button>
            </div>
        </header>

        <!-- Main Form Card -->
        <div class="card">
            <form id="taskForm">
                <!-- Task Description -->
                <div class="form-group">
                    <label class="form-label" for="taskInput">Task Description</label>
                    <textarea 
                        id="taskInput" 
                        name="task" 
                        class="form-textarea" 
                        placeholder="e.g., What to do when the power is out, customer says TrackMan is frozen, booking cancellation request..."
                        required
                    ></textarea>
                </div>

                <!-- Location Input -->
                <div class="form-group">
                    <label class="form-label" for="locationInput">Location (optional)</label>
                    <input 
                        id="locationInput" 
                        name="location" 
                        type="text" 
                        class="form-input" 
                        placeholder="e.g., Bedford, Dartmouth, Halifax"
                    >
                    <div class="form-helper">
                        Add location context if relevant to your task
                    </div>
                </div>

                <!-- LLM Route Selector -->
                <div class="form-group" id="llmRouteGroup">
                    <label class="form-label">Force LLM Route (optional)</label>
                    <div class="route-selector">
                        <input type="radio" id="route-auto" name="llm_route" value="auto" checked>
                        <label for="route-auto" class="route-option">Auto</label>
                        
                        <input type="radio" id="route-emergency" name="llm_route" value="EmergencyLLM">
                        <label for="route-emergency" class="route-option">Emergency</label>
                        
                        <input type="radio" id="route-booking" name="llm_route" value="BookingLLM">
                        <label for="route-booking" class="route-option">Booking</label>
                        
                        <input type="radio" id="route-trackman" name="llm_route" value="TrackManLLM">
                        <label for="route-trackman" class="route-option">TrackMan</label>
                        
                        <input type="radio" id="route-response-tone" name="llm_route" value="ResponseToneLLM">
                        <label for="route-response-tone" class="route-option">Response Tone</label>
                        
                        <input type="radio" id="route-general" name="llm_route" value="generainfoLLM">
                        <label for="route-general" class="route-option">General</label>
                    </div>
                    <div class="form-helper">
                        <span class="text-secondary">Each route has specialized access to clubhouse intel & resources</span>
                    </div>
                </div>

                <!-- Toggle Options -->
                <div class="toggle-group">
                    <div class="toggle-item">
                        <label class="toggle-switch">
                            <input type="checkbox" id="useLLM" name="use_llm" checked>
                            <span class="toggle-slider"></span>
                        </label>
                        <label for="useLLM" class="toggle-label">Smart Assist (LLM)</label>
                        <span id="slackIndicator" class="slack-indicator">→ Slack</span>
                    </div>
                </div>
                <div id="llmToggleHelper" class="llm-toggle-helper">
                    When disabled, your task will be sent to Slack as a general question
                </div>

                <!-- Submit Buttons -->
                <div class="button-group">
                    <button type="submit" class="btn btn-primary" id="submitBtn">
                        Process Request
                    </button>
                    <button type="button" class="btn btn-secondary" id="resetBtn" title="Clear form and start a new query (Esc)">
                        Reset
                    </button>
                </div>

                <!-- Error Message -->
                <div id="errorMessage" class="error-message"></div>
            </form>
        </div>

        <!-- Response Area -->
        <div class="card response-area" id="responseArea">
            <div class="response-header">
                <div class="status-badge" id="statusBadge">
                    <span id="statusDot" class="status-dot status-success"></span>
                    <span id="statusText">Completed</span>
                </div>
                <div class="response-actions">
                    <div class="confidence-meter" id="confidenceMeter">
                        Confidence: <strong id="confidenceValue">0%</strong>
                    </div>
                </div>
            </div>
            <div class="response-content" id="responseContent">
                <!-- Response will be inserted here -->
            </div>
        </div>

        <!-- Keyboard Shortcuts Hint -->
        <div class="shortcuts-hint">
            <strong>Keyboard Shortcuts:</strong> 
            <kbd>Ctrl</kbd>+<kbd>Enter</kbd> Submit • 
            <kbd>Esc</kbd> Reset • 
            <kbd>Ctrl</kbd>+<kbd>D</kbd> Demo
        </div>
    </div>

    <!-- Optimized JavaScript Bundle -->
    <script src="clubos-bundle.min.js"></script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(__dirname, '..', 'dist', 'index-optimized.html'), htmlTemplate);
    console.log('✅ Optimized HTML created');
}

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Run bundling
console.log('🚀 Starting ClubOS Bundle Optimization...\n');
bundleScripts();
bundleCSS();
createOptimizedHTML();
console.log('\n✅ Bundle optimization complete!');
console.log('📁 Output files in dist/ directory');
