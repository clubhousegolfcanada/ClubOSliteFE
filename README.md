# ClubOS Lite Frontend

A lightweight task management and routing system for golf facility operations.

## Features

- **Smart Task Routing** - Automatically routes tasks to the appropriate handler (Emergency, Booking, TrackMan, etc.)
- **LLM Integration** - AI-powered assistance for task processing
- **Slack Integration** - Direct messaging to Slack channels
- **Dark/Light Theme** - Toggle between themes
- **Demo Mode** - Built-in demo for TrackMan troubleshooting

## Quick Start

### Option 1: Standalone Version (No Server Required)
Simply open `index-standalone.html` in your browser. This version works without any setup.

### Option 2: Development Version
1. Start a local web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```

2. Open http://localhost:8000 in your browser

## Project Structure

```
ClubOSliteFE/
├── index.html              # Main entry point (requires server)
├── index-standalone.html   # Standalone version (works offline)
├── components/            # UI components
├── features/              # Feature modules (booking, emergency, etc.)
├── scripts/               # Core application scripts
├── styles/                # CSS files
├── llm/                   # LLM integration modules
└── tests/                 # Test files and mocks
```

## Configuration

### API Endpoints
Update these in your HTML files or environment:
- `CLUBOS_API_ENDPOINT` - Default: `http://localhost:8000/process`
- `CLUBOS_SLACK_ENDPOINT` - Default: `http://localhost:8000/slack`
- `CLUBOS_MOCK_MODE` - Default: `true` (simulates API responses)

### Themes
The app saves theme preference in localStorage. Default is dark theme.

## Usage

1. **Enter a Task** - Describe what needs to be done
2. **Add Location** (Optional) - Specify Halifax, Dartmouth, or Bedford
3. **Select Route** - Choose Auto or force a specific route
4. **Toggle LLM** - Enable for AI assistance or disable to send to Slack
5. **Process** - Submit the task for processing

### Keyboard Shortcuts
- `Esc` - Reset form
- `Ctrl/Cmd + Enter` - Submit form
- `Ctrl/Cmd + D` - Run demo

## Development

### Backend Requirements
The frontend expects these endpoints:
- `POST /process` - Process tasks with LLM
- `POST /slack` - Send messages to Slack
- `GET /api/health` - Health check endpoint

### Mock Mode
Set `CLUBOS_MOCK_MODE = true` to run without a backend. All API calls will be simulated.

## License

Proprietary - ClubOS
