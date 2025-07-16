# ClubOS Lite Frontend - Complete Documentation

## Overview

ClubOS Lite is a modular support system that intelligently routes customer issues to specialized LLM prompts. The frontend is a lightweight, production-ready single-page application built with vanilla JavaScript.

## Features

### Core Functionality
- **Smart Routing**: Auto-detects issue type or allows manual route selection
- **5 Specialized Forms**: Booking, Emergency, Tech Support, Tone Customization, General Inquiries
- **LLM Integration**: Connects to backend AI services for intelligent responses
- **Slack Fallback**: Option to route queries to Slack when AI is disabled
- **Mock Mode**: Built-in testing mode for development

### UI Features
- **Dark/Light Theme**: Persistent theme preference
- **Responsive Design**: Mobile-first approach
- **Real-time Validation**: Form validation with helpful error messages
- **Loading States**: Skeleton loaders and progress indicators
- **Keyboard Shortcuts**: Power user productivity features
- **Recent Tasks**: Quick access to previous queries
- **Copy to Clipboard**: One-click response copying

### Components
- **Modal System**: Confirmations, alerts, and custom dialogs
- **Notification System**: Toast-style notifications
- **Loading Overlays**: Context-aware loading indicators
- **Form Validators**: Reusable validation framework
- **Error Handling**: Graceful error recovery

## File Structure

```
ClubOSLiteFrontend/
├── index.html                 # Main HTML (already provided)
├── scripts/
│   ├── app.js                # Main integration script
│   ├── AppController.js      # Core form logic
│   ├── demo.js              # Demo functionality
│   ├── config.js            # Configuration
│   ├── state.js             # State management
│   ├── health.js            # Health checks
│   └── telemetry.js         # Analytics
├── components/
│   ├── TaskCard.js          # Response display
│   ├── Modal.js             # Modal component
│   ├── Spinner.js           # Loading spinner
│   └── TabSwitcher.js       # Tab navigation
├── features/
│   ├── booking/             # Booking form
│   ├── emergency/           # Emergency form
│   ├── tech/               # Tech support form
│   ├── responsetone/       # Tone customization
│   └── general/            # General inquiries
├── llm/
│   ├── index.js            # LLM communication
│   ├── llmDispatcher.js    # Route dispatcher
│   └── wrappers/           # Category wrappers
├── styles/
│   ├── main.css            # Core styles
│   ├── form.css            # Form styles
│   ├── cards.css           # Card components
│   ├── responsive.css      # Mobile styles
│   └── theme.css           # Theme variables
└── data/
    ├── routes.json         # Route configuration
    └── demoSessions.json   # Demo data
```

## Setup Instructions

### 1. Basic Setup

```bash
# Clone or download the frontend files
git clone [your-repo-url]
cd ClubOSLiteFrontend

# No build process required - it's vanilla JS!
# Simply serve the files with any web server
```

### 2. Configuration

Edit the configuration in `app.js` or set global variables:

```javascript
// Option 1: Edit window.ClubOS.CONFIG in app.js
window.ClubOS.CONFIG = {
    API_ENDPOINT: 'https://your-api.com/llm',
    SLACK_ENDPOINT: 'https://your-api.com/slack',
    MOCK_MODE: false  // Set to false for production
};

// Option 2: Set before loading app.js
<script>
    window.CLUBOS_API_ENDPOINT = 'https://your-api.com/llm';
    window.CLUBOS_SLACK_ENDPOINT = 'https://your-api.com/slack';
    window.CLUBOS_MOCK_MODE = false;
</script>
<script src="scripts/app.js"></script>
```

### 3. Backend Integration

Your backend should accept POST requests with these payloads:

#### LLM Endpoint (`/api/llm`)
```json
{
    "route": "booking|emergency|tech|tone|general",
    "task": "User's input text",
    "priority": "low|medium|high",
    "location": "Optional location",
    "timestamp": "ISO 8601 timestamp",
    "source": "web",
    // Additional route-specific fields...
}
```

Expected response:
```json
{
    "status": "completed|error",
    "confidence": 0.85,
    "recommendation": "String or array of steps",
    "llm_route_used": "ActualLLMUsed",
    "processing_time": "1.2s"
}
```

#### Slack Endpoint (`/api/slack`)
```json
{
    "channel": "#general",
    "text": "User's message",
    "location": "Optional location",
    "priority": "low|medium|high",
    "timestamp": "ISO 8601 timestamp"
}
```

### 4. Deployment

#### Static Hosting (Recommended)
```bash
# Netlify
netlify deploy --dir=.

# Vercel
vercel --prod

# GitHub Pages
# Push to gh-pages branch

# AWS S3 + CloudFront
aws s3 sync . s3://your-bucket --exclude ".git/*"
```

#### Traditional Web Server
```nginx
# Nginx configuration
server {
    listen 80;
    server_name clubos.example.com;
    root /var/www/clubos-lite;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (optional)
    location /api/ {
        proxy_pass http://your-backend:3000/;
    }
}
```

## Usage Guide

### For End Users

1. **Basic Task Submission**
   - Enter task description
   - Select priority (Low/Medium/High)
   - Add location if relevant
   - Click "Process Request"

2. **Manual Route Selection**
   - Use route selector for specific expertise
   - Options: Auto, Emergency, Booking, TrackMan, Response Tone, General

3. **Keyboard Shortcuts**
   - `Ctrl/Cmd + Enter`: Submit form
   - `Esc`: Reset form
   - `Ctrl/Cmd + D`: Run demo
   - `Alt + 1-5`: Select routes

### For Developers

#### Debug Tools
```javascript
// Available at window.ClubOS.debug

// Toggle mock mode
window.ClubOS.debug.mockMode();

// Clear all storage
window.ClubOS.debug.clearStorage();

// Test notifications
window.ClubOS.debug.testNotification('success');

// Test modal
window.ClubOS.debug.testModal();

// Show available forms
window.ClubOS.debug.showAllForms();
```

#### Adding New Routes

1. Create form handler in `/features/[category]/`:
```javascript
window.ClubOS.Forms.NewForm = class extends BaseFormHandler {
    constructor() {
        super('newForm', 'newcategory');
    }
    
    render(container) {
        // Your form HTML
    }
    
    buildPayload(formData) {
        // Build category-specific payload
    }
};
```

2. Add to FormManager initialization:
```javascript
this.forms.newcategory = new window.ClubOS.Forms.NewForm();
```

3. Update route configuration in AppController.

#### Custom Styling

Override CSS variables for theming:
```css
:root[data-theme="custom"] {
    --bg-primary: #your-color;
    --accent: #your-accent;
    /* etc... */
}
```

## API Reference

### Global Objects

#### window.ClubOS.UI
- `Modal`: Modal dialog system
- `Notification`: Toast notifications
- `LoadingOverlay`: Loading indicators
- `FormValidator`: Form validation

#### window.ClubOS.Forms
- `BookingForm`: Booking issue handler
- `EmergencyForm`: Emergency report handler
- `TechForm`: Technical support handler
- `ToneForm`: Response tone customizer
- `GeneralForm`: General inquiry handler

#### window.ClubOS.AppController
Main application controller handling form submission and routing.

## Testing

### Mock Mode Testing
1. Ensure `MOCK_MODE: true` in configuration
2. Test all routes and form submissions
3. Verify loading states and error handling

### Integration Testing
```javascript
// Test LLM endpoint
fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        route: 'tech',
        task: 'TrackMan is frozen',
        priority: 'high',
        location: 'Bay 3'
    })
}).then(r => r.json()).then(console.log);
```

## Performance Optimization

- **Lazy Loading**: Forms are rendered on-demand
- **Debounced Validation**: Reduces validation calls
- **Optimistic UI**: Immediate feedback for user actions
- **Minimal Dependencies**: Pure vanilla JS, no framework overhead

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android Chrome)

## Troubleshooting

### Common Issues

1. **Forms not submitting**
   - Check console for errors
   - Verify API endpoints are correct
   - Ensure CORS is configured on backend

2. **Theme not persisting**
   - Check localStorage is enabled
   - Clear browser cache

3. **Mock mode not working**
   - Verify `MOCK_MODE: true` is set
   - Check console for initialization logs

## Contributing

### Code Style
- Use ES6+ features
- Follow existing naming conventions
- Add JSDoc comments for new functions
- Test in multiple browsers

### Pull Request Process
1. Create feature branch
2. Update documentation
3. Test thoroughly
4. Submit PR with description

## License

[Your License Here]

## Support

- Documentation: This README
- Issues: [GitHub Issues]
- Email: support@clubos.com

---

Built with ❤️ for ClubOS by the frontend team