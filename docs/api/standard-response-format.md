# Standard Response Format

This document defines the standard API response format used throughout the Advanced Task Manager API.

## Overview

All API responses follow a consistent structure to ensure predictability and ease of integration. This format is implemented in the OpenAPI 3.1 specification located in <ref_file file="/home/davidtan/_Workspaces/WebDevelopment/taskmanagerV2/docs/api/openapi.yaml" />.

## Response Structure

### Success Response

```json
{
  "status": {
    "code": 200,
    "message": "Success",1
    "is_success": true
  },
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440001",
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
    "request_id": "550e8400-e29b-41d4-a716-446655440001",
    "errors": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

## Components

### 1. Status Object (Required)

Contains the HTTP status information:

- `code` (integer): HTTP status code
- `message` (string): Human-readable message
- `is_success` (boolean): Boolean indicating success/failure

### 2. Data Object (Required for success responses)

Contains the actual response data:

- Can be an object, array, or null
- Structure varies by endpoint
- For error responses, this is set to `null`

### 3. Meta Object (Required)

Contains metadata about the response:

- `timestamp` (integer): Request completion time in epoch milliseconds
- `request_id` (string): Unique identifier for request tracking (UUID)
- `pagination` (object): Included for list responses (optional)
- `errors` (array): Error details for error responses (optional)

### 4. Pagination Object (Optional for list responses)

Included in list endpoints:

- `page` (integer): Current page number
- `limit` (integer): Items per page
- `total` (integer): Total number of items
- `total_pages` (integer): Total number of pages

### 5. Error Details Array (Optional for error responses)

Included in error responses:

- `field` (string): Field that caused the error
- `message` (string): Error message

## HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate, etc.)
- `500`: Internal Server Error

## Implementation Guidelines

### Backend (Go)

Implement helper functions in `internal/shared/response/`:

```go
package response

import (
    "net/http"
    "encoding/json"
    "github.com/google/uuid"
    "time"
)

type ResponseStatus struct {
    Code      int    `json:"code"`
    Message   string `json:"message"`
    IsSuccess bool   `json:"is_success"`
}

type ResponseMeta struct {
    Timestamp  int64             `json:"timestamp"`
    RequestID  string            `json:"request_id"`
    Pagination *PaginationMeta   `json:"pagination,omitempty"`
    Errors     []ErrorDetail     `json:"errors,omitempty"`
}

type PaginationMeta struct {
    Page       int `json:"page"`
    Limit      int `json:"limit"`
    Total      int `json:"total"`
    TotalPages int `json:"total_pages"`
}

type ErrorDetail struct {
    Field   string `json:"field"`
    Message string `json:"message"`
}

type StandardResponse struct {
    Status ResponseStatus      `json:"status"`
    Data   interface{}        `json:"data"`
    Meta   ResponseMeta        `json:"meta"`
}

func Success(w http.ResponseWriter, data interface{}) {
    meta := ResponseMeta{
        Timestamp: time.Now().UnixMilli(),
        RequestID: uuid.New().String(),
    }
    
    response := StandardResponse{
        Status: ResponseStatus{
            Code:      http.StatusOK,
            Message:   "Success",
            IsSuccess: true,
        },
        Data: data,
        Meta: meta,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func Error(w http.ResponseWriter, code int, message string, errors []ErrorDetail) {
    meta := ResponseMeta{
        Timestamp: time.Now().UnixMilli(),
        RequestID: uuid.New().String(),
        Errors:    errors,
    }
    
    response := StandardResponse{
        Status: ResponseStatus{
            Code:      code,
            Message:   message,
            IsSuccess: false,
        },
        Data: nil,
        Meta: meta,
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(response)
}

func Paginated(w http.ResponseWriter, data interface{}, pagination PaginationMeta) {
    meta := ResponseMeta{
        Timestamp:  time.Now().UnixMilli(),
        RequestID:  uuid.New().String(),
        Pagination: &pagination,
    }
    
    response := StandardResponse{
        Status: ResponseStatus{
            Code:      http.StatusOK,
            Message:   "Success",
            IsSuccess: true,
        },
        Data: data,
        Meta: meta,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
```

### Frontend (TypeScript)

Implement helper functions in `src/shared/api/`:

```typescript
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface StandardResponse<T = any> {
  status: ResponseStatus;
  data: T | null;
  meta: ResponseMeta;
}

export function extractData<T>(response: StandardResponse<T>): T {
  if (!response.status.is_success) {
    throw new Error(response.status.message);
  }
  return response.data as T;
}

export function extractError(response: StandardResponse): ErrorDetail[] {
  return response.meta.errors || [];
}

export function isSuccess(response: StandardResponse): boolean {
  return response.status.is_success;
}
```

## Examples

### Task List Response

```json
{
  "status": {
    "code": 200,
    "message": "Tasks retrieved successfully",
    "is_success": true
  },
  "data": {
    "tasks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "Complete project documentation",
        "description": "Write comprehensive documentation for the project",
        "status": "in-progress",
        "priority": "high",
        "due_date": 1726738800000,
        "tags": ["documentation", "urgent"],
        "created_at": 1726652400000,
        "updated_at": 1726652400000,
        "completed_at": null,
        "priority_score": 85
      }
    ]
  },
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440001",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

### Validation Error Response

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
    "request_id": "550e8400-e29b-41d4-a716-446655440001",
    "errors": [
      {
        "field": "title",
        "message": "Title is required"
      },
      {
        "field": "due_date",
        "message": "Due date must be in the future"
      }
    ]
  }
}
```

## Time Format

All timestamps are represented as **epoch milliseconds** (Unix time in milliseconds):

- Example: `1726652400000` represents September 18, 2025, 00:00:00 GMT
- Backend should use `time.Now().UnixMilli()` in Go
- Frontend should use `Date.now()` in JavaScript/TypeScript

## Request ID

Each response includes a unique `request_id` (UUID) for:

- Request tracking and debugging
- Log correlation
- Support ticket reference
- Distributed tracing

## Best Practices

1. **Consistency**: Always use the standard response format
2. **Error Messages**: Provide clear, actionable error messages
3. **Validation**: Return field-specific validation errors
4. **Timestamps**: Use epoch milliseconds consistently
5. **Request IDs**: Generate unique IDs for each request
6. **Pagination**: Include pagination metadata for list endpoints
7. **Null Handling**: Use `null` for empty data in error responses

## Related Documentation

- [OpenAPI 3.1 Specification](./openapi.yaml) - Complete API contract
- [Product Requirements Document](../project/prd.md) - API architecture overview
- [Backend Architecture](../architecture/backend-ddd.md) - Implementation details
