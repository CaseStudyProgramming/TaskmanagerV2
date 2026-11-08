# Error Codes

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document defines the global error dictionary and standardized error payloads for the Advanced Task Manager API.

---

## Error Response Format

All error responses follow this standard format:

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
    "request_id": "uuid-here",
    "errors": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

---

## HTTP Status Codes

| Status Code | Meaning | Usage |
|------------|---------|-------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `204` | No Content | Successful request with no response body |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Authentication required or failed |
| `403` | Forbidden | User lacks permission |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource conflict (duplicate, etc.) |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Service temporarily unavailable |

---

## Error Codes

### Authentication Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `AUTH_001` | 401 | Invalid credentials | Invalid username or password |
| `AUTH_002` | 401 | Token expired | Access token has expired |
| `AUTH_003` | 401 | Token invalid | Invalid or malformed token |
| `AUTH_004` | 401 | Token revoked | Token has been revoked |
| `AUTH_005` | 401 | Session expired | User session has expired |
| `AUTH_006` | 401 | Not authenticated | Authentication required |

### Authorization Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `AUTHZ_001` | 403 | Forbidden | User lacks permission to access resource |
| `AUTHZ_002` | 403 | Insufficient permissions | User has insufficient permissions |
| `AUTHZ_003` | 403 | Resource ownership | User does not own the resource |

### Validation Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `VAL_001` | 400 | Required field missing | Required field is missing |
| `VAL_002` | 400 | Invalid format | Field format is invalid |
| `VAL_003` | 400 | Invalid value | Field value is invalid |
| `VAL_004` | 400 | Value too short | Field value is too short |
| `VAL_005` | 400 | Value too long | Field value is too long |
| `VAL_006` | 400 | Invalid email | Email format is invalid |
| `VAL_007` | 400 | Invalid UUID | UUID format is invalid |
| `VAL_008` | 400 | Invalid date | Date format is invalid |
| `VAL_009` | 400 | Invalid enum | Invalid enum value |

### Resource Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `RES_001` | 404 | Resource not found | Resource does not exist |
| `RES_002` | 409 | Resource already exists | Resource already exists |
| `RES_003` | 409 | Resource conflict | Resource conflict detected |
| `RES_004` | 409 | Duplicate entry | Duplicate entry detected |

### Database Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `DB_001` | 500 | Database connection failed | Failed to connect to database |
| `DB_002` | 500 | Database query failed | Database query execution failed |
| `DB_003` | 500 | Database transaction failed | Database transaction failed |
| `DB_004` | 500 | Database constraint violation | Database constraint violation |

### External Service Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `EXT_001` | 502 | External service unavailable | External service is unavailable |
| `EXT_002` | 504 | External service timeout | External service request timed out |
| `EXT_003` | 502 | External service error | External service returned an error |

### Rate Limiting Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `RATE_001` | 429 | Rate limit exceeded | Request rate limit exceeded |
| `RATE_002` | 429 | Too many requests | Too many requests in time window |

### Server Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `SRV_001` | 500 | Internal server error | Internal server error |
| `SRV_002` | 503 | Service unavailable | Service temporarily unavailable |
| `SRV_003` | 500 | Configuration error | Server configuration error |

---

## Error Payload Examples

### Validation Error

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
        "code": "VAL_001",
        "field": "title",
        "message": "Title is required"
      },
      {
        "code": "VAL_007",
        "field": "user_id",
        "message": "Invalid UUID format"
      }
    ]
  }
}
```

### Authentication Error

```json
{
  "status": {
    "code": 401,
    "message": "Not authenticated",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "errors": [
      {
        "code": "AUTH_006",
        "field": null,
        "message": "Authentication required"
      }
    ]
  }
}
```

### Authorization Error

```json
{
  "status": {
    "code": 403,
    "message": "Forbidden",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "errors": [
      {
        "code": "AUTHZ_003",
        "field": null,
        "message": "User does not own the resource"
      }
    ]
  }
}
```

### Resource Not Found Error

```json
{
  "status": {
    "code": 404,
    "message": "Resource not found",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "errors": [
      {
        "code": "RES_001",
        "field": "id",
        "message": "Task with ID '123' not found"
      }
    ]
  }
}
```

### Rate Limit Error

```json
{
  "status": {
    "code": 429,
    "message": "Rate limit exceeded",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "errors": [
      {
        "code": "RATE_001",
        "field": null,
        "message": "Request rate limit exceeded (100 requests per minute)"
      }
    ],
    "rate_limit": {
      "limit": 100,
      "remaining": 0,
      "reset": 1726653000
    }
  }
}
```

### Internal Server Error

```json
{
  "status": {
    "code": 500,
    "message": "Internal server error",
    "is_success": false
  },
  "data": null,
  "meta": {
    "timestamp": 1726652400000,
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "errors": [
      {
        "code": "SRV_001",
        "field": null,
        "message": "An unexpected error occurred"
      }
    ]
  }
}
```

---

## Error Handling Best Practices

### Frontend Error Handling

**Parse Error Response:**
```typescript
interface ErrorResponse {
  status: {
    code: number;
    message: string;
    is_success: boolean;
  };
  data: null;
  meta: {
    timestamp: number;
    request_id: string;
    errors?: Array<{
      code: string;
      field: string | null;
      message: string;
    }>;
  };
}

async function handleApiError(response: Response) {
  const error: ErrorResponse = await response.json();

  if (error.meta.errors) {
    // Display field-specific errors
    error.meta.errors.forEach(err => {
      if (err.field) {
        showFieldError(err.field, err.message);
      } else {
        showGlobalError(err.message);
      }
    });
  } else {
    showGlobalError(error.status.message);
  }
}
```

### Backend Error Handling

**Error Handler Middleware:**
```go
func ErrorHandler(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    defer func() {
      if err := recover(); err != nil {
        log.Printf("Panic recovered: %v", err)
        response.Error(w, http.StatusInternalServerError, "Internal server error")
      }
    }()

    next.ServeHTTP(w, r)
  })
}
```

**Custom Error Types:**
```go
type ValidationError struct {
  Field   string
  Message string
}

func (e *ValidationError) Error() string {
  return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

type NotFoundError struct {
  Resource string
  ID       string
}

func (e *NotFoundError) Error() string {
  return fmt.Sprintf("%s with ID '%s' not found", e.Resource, e.ID)
}
```

---

## References

- [OpenAPI Specification](./openapi.yaml) - Complete API contract
- [Standard Response Format](./standard-response-format.md) - API response specification
- [API Validation](./API_VALIDATION.md) - API validation rules
