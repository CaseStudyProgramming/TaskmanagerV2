# API Standard Response Format

This document defines the standard API response format for all endpoints in the Advanced Task Manager.

## Overview

All API responses MUST follow this standard format to ensure consistency across the application.

## Standard Response Structure

### Success Response

```json
{
  "status": {
    "code": 200,
    "message": "Success",
    "is_success": true
  },
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### Error Response

```json
{
  "status": {
    "code": 400,
    "message": "Validation failed",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "errors": [
      {
        "field": "title",
        "message": "Title is required"
      },
      {
        "field": "priority",
        "message": "Invalid priority value"
      }
    ]
  }
}
```

## Response Components

### 1. Status (Required)

```typescript
interface ResponseStatus {
  code: number;        // HTTP status code
  message: string;     // Human-readable message
  is_success: boolean; // Success indicator
}
```

### 2. Data (Required for success, null for errors)

The actual response data. Can be:
- Object (single resource)
- Array (list of resources)
- null (for error responses)

### 3. Meta (Required)

```typescript
interface ResponseMeta {
  timestamp: number;              // Request completion time (epoch milliseconds)
  request_id: string;             // Unique request identifier
  pagination?: PaginationMeta;   // Optional pagination metadata
  errors?: ErrorDetail[];         // Optional error details
}
```

## Status Codes

| Code | Message | Usage |
|------|---------|-------|
| 200 | Success | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource, state conflict |
| 500 | Internal Server Error | Unexpected server error |

## Example Responses

### GET /api/v1/tasks

**Success Response:**
```json
{
  "status": {
    "code": 200,
    "message": "Success",
    "is_success": true
  },
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the project",
      "status": "todo",
      "priority": "high",
      "due_date": 1726738800000,
      "tags": ["documentation", "important"],
      "created_at": 1726652400000,
      "updated_at": 1726652400000,
      "completed_at": null,
      "priority_score": 85
    }
  ],
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

### POST /api/v1/tasks

**Success Response:**
```json
{
  "status": {
    "code": 201,
    "message": "Task created successfully",
    "is_success": true
  },
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "New task",
    "description": null,
    "status": "todo",
    "priority": "medium",
    "due_date": null,
    "tags": [],
    "created_at": 1726652400000,
    "updated_at": 1726652400000,
    "completed_at": null,
    "priority_score": 50
  },
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "880e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Response (Validation):**
```json
{
  "status": {
    "code": 400,
    "message": "Validation failed",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "990e8400-e29b-41d4-a716-446655440000",
    "errors": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

### GET /api/v1/tasks/:id

**Success Response:**
```json
{
  "status": {
    "code": 200,
    "message": "Success",
    "is_success": true
  },
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the project",
    "status": "todo",
    "priority": "high",
    "due_date": 1726738800000,
    "tags": ["documentation", "important"],
    "created_at": 1726652400000,
    "updated_at": 1726652400000,
    "completed_at": null,
    "priority_score": 85
  },
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "110e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Response (Not Found):**
```json
{
  "status": {
    "code": 404,
    "message": "Task not found",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "220e8400-e29b-41d4-a716-446655440000"
  }
}
```

### PUT /api/v1/tasks/:id

**Success Response:**
```json
{
  "status": {
    "code": 200,
    "message": "Task updated successfully",
    "is_success": true
  },
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Updated task title",
    "description": "Updated description",
    "status": "in-progress",
    "priority": "urgent",
    "due_date": 1726738800000,
    "tags": ["documentation", "important", "urgent"],
    "created_at": 1726652400000,
    "updated_at": 1726653000000,
    "completed_at": null,
    "priority_score": 100
  },
  "meta": {
    "timestamp": 1726653000000,
    "request_id": "330e8400-e29b-41d4-a716-446655440000"
  }
}
```

### DELETE /api/v1/tasks/:id

**Success Response:**
```json
{
  "status": {
    "code": 200,
    "message": "Task deleted successfully",
    "is_success": true
  },
  "data": null,
  "meta": {
    "timestamp": 1726653000000,
    "request_id": "440e8400-e29b-41d4-a716-446655440000"
  }
}
```

### POST /api/v1/auth/google

**Success Response:**
```json
{
  "status": {
    "code": 200,
    "message": "Authentication successful",
    "is_success": true
  },
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900,
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  },
  "meta": {
    "timestamp": 1726653000000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Response (Unauthorized):**
```json
{
  "status": {
    "code": 401,
    "message": "Invalid Google OAuth token",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726653000000,
    "request_id": "660e8400-e29b-41d4-a716-446655440000"
  }
}
```

## Pagination

List endpoints support pagination via query parameters:

```
GET /api/v1/tasks?page=1&limit=20&status=todo&priority=high
```

### Pagination Meta

```typescript
interface PaginationMeta {
  page: number;        // Current page (1-indexed)
  limit: number;       // Items per page
  total: number;       // Total number of items
  total_pages: number; // Total number of pages
}
```

### Pagination Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (1-indexed) |
| limit | integer | 20 | Items per page (max 100) |
| status | string | - | Filter by status |
| priority | string | - | Filter by priority |
| search | string | - | Search in title and description |

## Error Handling

### Error Detail Structure

```typescript
interface ErrorDetail {
  field: string;   // Field name that caused the error
  message: string; // Human-readable error message
}
```

### Common Error Messages

| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation failed | Input validation failed |
| 400 | Invalid request body | Request body format error |
| 401 | Unauthorized | Missing or invalid token |
| 401 | Token expired | Access token has expired |
| 403 | Forbidden | Insufficient permissions |
| 404 | Resource not found | Requested resource doesn't exist |
| 409 | Resource already exists | Duplicate resource |
| 500 | Internal server error | Unexpected server error |

## Implementation Examples

### Backend (Go)

```go
package response

import (
    "encoding/json"
    "net/http"
    "time"
    "github.com/google/uuid"
)

type ResponseStatus struct {
    Code      int    `json:"code"`
    Message   string `json:"message"`
    IsSuccess bool   `json:"is_success"`
}

type ResponseMeta struct {
    Timestamp  int64                  `json:"timestamp"`
    RequestID  string                 `json:"request_id"`
    Pagination map[string]interface{} `json:"pagination,omitempty"`
    Errors     []ErrorDetail          `json:"errors,omitempty"`
}

type ErrorDetail struct {
    Field   string `json:"field"`
    Message string `json:"message"`
}

type Response struct {
    Status ResponseStatus      `json:"status"`
    Data   interface{}         `json:"data"`
    Meta   ResponseMeta        `json:"meta"`
}

func Success(w http.ResponseWriter, data interface{}, meta map[string]interface{}) {
    response := Response{
        Status: ResponseStatus{
            Code:      200,
            Message:   "Success",
            IsSuccess: true,
        },
        Data: data,
        Meta: ResponseMeta{
            Timestamp: time.Now().UnixMilli(),
            RequestID: uuid.New().String(),
        },
    }
    
    if meta != nil {
        if pagination, ok := meta["pagination"]; ok {
            response.Meta.Pagination = pagination.(map[string]interface{})
        }
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(response)
}

func Error(w http.ResponseWriter, code int, message string, errors []ErrorDetail) {
    response := Response{
        Status: ResponseStatus{
            Code:      code,
            Message:   message,
            IsSuccess: false,
        },
        Data: nil,
        Meta: ResponseMeta{
            Timestamp: time.Now().UnixMilli(),
            RequestID: uuid.New().String(),
            Errors:    errors,
        },
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(response)
}
```

### Frontend (TypeScript)

```typescript
// src/shared/lib/response-helpers.ts

export interface ResponseStatus {
  code: number;
  message: string;
  is_success: boolean;
}

export interface ResponseMeta {
  timestamp: number;
  request_id: string;
  pagination?: PaginationMeta;
  errors?: ErrorDetail[];
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface StandardResponse<T> {
  status: ResponseStatus;
  data: T;
  meta: ResponseMeta;
}

export function extractData<T>(response: StandardResponse<T>): T {
  if (!response.status.is_success) {
    throw new Error(response.status.message);
  }
  return response.data;
}

export function extractError(response: StandardResponse<null>): ErrorDetail[] {
  return response.meta.errors || [];
}

export function isSuccess(response: StandardResponse<any>): boolean {
  return response.status.is_success;
}
```

## Best Practices

1. **Always include timestamp** in epoch milliseconds
2. **Generate unique request_id** for each request
3. **Use consistent status codes** across all endpoints
4. **Provide clear error messages** for debugging
5. **Include field-level errors** for validation failures
6. **Use pagination for list endpoints** to prevent large responses
7. **Never expose sensitive data** in error messages
8. **Log request_id** for debugging and tracing
