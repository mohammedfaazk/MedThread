# MedThread API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "role": "PATIENT"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "username",
    "role": "PATIENT"
  }
}
```

#### POST /auth/login
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Threads

#### GET /threads
Get all medical threads.

**Response:**
```json
[
  {
    "id": "thread_id",
    "patientId": "user_id",
    "title": "Thread title",
    "symptoms": {...},
    "severityScore": "MODERATE",
    "tags": ["headache", "fever"],
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /threads/:id
Get specific thread with replies.

#### POST /threads
Create new medical thread (requires authentication).

**Request:**
```json
{
  "patientId": "user_id",
  "title": "Thread title",
  "symptoms": {
    "age": 32,
    "gender": "male",
    "primarySymptoms": ["headache", "fever"],
    "duration": "3 days",
    "severity": "MODERATE",
    "description": "Detailed description..."
  },
  "tags": ["headache", "fever"]
}
```

### Replies

#### POST /replies
Create a reply to a thread (requires authentication).

**Request:**
```json
{
  "threadId": "thread_id",
  "parentReplyId": "reply_id",
  "authorId": "user_id",
  "content": "Reply content"
}
```

### Timeline

#### GET /timeline/:threadId
Get case timeline events for a thread.

#### POST /timeline
Add timeline event (requires authentication).

**Request:**
```json
{
  "threadId": "thread_id",
  "eventType": "DOCTOR_ADVICE",
  "data": {...}
}
```

### Users

#### GET /users/:id
Get user profile.

## AI Service

### POST /api/analyze-symptoms
Analyze symptoms using AI.

**Request:**
```json
{
  "symptoms": ["headache", "fever"],
  "description": "Detailed description",
  "severity": "MODERATE"
}
```

**Response:**
```json
{
  "possibleConditions": ["Common Cold", "Influenza"],
  "emergencyWarning": false,
  "suggestedQuestions": ["Do you have a sore throat?"],
  "similarCases": ["case_123"],
  "riskScore": 4
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message"
}
```

Status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
