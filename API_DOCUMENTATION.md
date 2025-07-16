# ClubOS Lite API Documentation

## Overview
The ClubOS Lite frontend expects a backend API that processes tasks and routes them to appropriate handlers. This document outlines the required endpoints and data formats.

## Base Configuration
- Default API URL: `http://localhost:8000`
- Content-Type: `application/json`

## Required Endpoints

### 1. Process Task
**POST** `/process`

Processes a task using the LLM system.

#### Request Body:
```json
{
  "task": "Customer says TrackMan is frozen",
  "priority": "medium",
  "location": "Halifax",
  "use_llm": true,
  "llm_route": "TrackManLLM"
}
```

#### Parameters:
- `task` (string, required): Description of the task/issue
- `priority` (string): "low" | "medium" | "high" 
- `location` (string, optional): "Halifax" | "Dartmouth" | "Bedford"
- `use_llm` (boolean): Whether to use LLM processing
- `llm_route` (string): Route selection
  - "auto" - Automatic routing
  - "EmergencyLLM" - Emergency protocols
  - "BookingLLM" - Booking/reservations
  - "TrackManLLM" - Technical support
  - "ResponseToneLLM" - Communication tone
  - "generainfoLLM" - General information

#### Response:
```json
{
  "status": "completed",
  "confidence": 0.92,
  "recommendation": [
    "Step 1: First action to take",
    "Step 2: Second action to take"
  ],
  "llm_route_used": "TrackManLLM",
  "processing_time": "1.2s"
}
```

### 2. Send to Slack
**POST** `/slack`

Sends a message to Slack when LLM is disabled.

#### Request Body:
```json
{
  "task": "Question about booking",
  "priority": "medium",
  "location": "Halifax",
  "use_llm": false
}
```

#### Response:
```json
{
  "status": "sent",
  "slack_message_id": "msg_123456",
  "channel": "#general-support"
}
```

### 3. Health Check
**GET** `/api/health`

Checks if the backend is running.

#### Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Responses

All endpoints should return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized
- `500` - Internal Server Error

Error format:
```json
{
  "error": {
    "code": "INVALID_ROUTE",
    "message": "The specified LLM route is not valid"
  }
}
```

## Knowledge Base Integration

Each LLM route has access to specific knowledge bases located in `/data/`:
- `emergency-knowledge.json` - Emergency protocols
- `booking-knowledge.json` - Booking policies and procedures  
- `trackman-knowledge.json` - Technical troubleshooting
- `tone-knowledge.json` - Communication guidelines
- `general-knowledge.json` - Facility information

The backend should load and use these knowledge bases when processing requests for each specific route.

## Mock Mode

When `CLUBOS_MOCK_MODE = true`, the frontend simulates all API responses. This is useful for:
- Development without a backend
- Testing UI behavior
- Demonstrations

## CORS Configuration

The backend must allow CORS for local development:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Implementation Notes

1. **Response Times**: Aim for <2 seconds response time for LLM processing
2. **Error Handling**: Always return structured error responses
3. **Logging**: Log all requests for debugging
4. **Rate Limiting**: Consider implementing rate limits for production
5. **Authentication**: Add authentication headers when ready for production

## Testing

Test endpoints with curl:
```bash
# Test process endpoint
curl -X POST http://localhost:8000/process \
  -H "Content-Type: application/json" \
  -d '{"task":"Test task","use_llm":true,"llm_route":"auto"}'

# Test health check
curl http://localhost:8000/api/health
```
