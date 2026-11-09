# Implementing API Handlers

This guide explains how to implement HTTP handlers following the vertical slice architecture pattern used in this project.

## Overview

HTTP handlers handle incoming HTTP requests, validate input, call application layer services, and return standardized responses.

## Prerequisites

- Read [Backend Technical Design](../backend-spec/README.md) for architecture overview
- Read [Standard Response Format](../api-specs/standard-response-format.md) for response contract
- Read [Handler Example](../examples/backend-implementation/handler-example.go) for reference implementation
- Familiarity with Go and Chi router

## Step-by-Step Implementation

### 1. Define Handler Struct

Create a new file in `internal/interfaces/http/{domain}/handler.go`:

```go
package http

import (
    "internal/application/task/command"
    "internal/application/task/query"
)

type TaskHandler struct {
    createTaskHandler *command.CreateTaskHandler
    getTaskHandler    *query.GetTaskHandler
}
```

**Key Points:**
- Inject application layer handlers (dependencies)
- Keep handler struct minimal
- Group related handlers together

### 2. Implement Constructor

Create constructor function:

```go
func NewTaskHandler(
    createTaskHandler *command.CreateTaskHandler,
    getTaskHandler *query.GetTaskHandler,
) *TaskHandler {
    return &TaskHandler{
        createTaskHandler: createTaskHandler,
        getTaskHandler:    getTaskHandler,
    }
}
```

**Key Points:**
- Accept dependencies as parameters
- Return pointer to handler struct
- Initialize all fields

### 3. Register Routes

Implement route registration:

```go
import "github.com/go-chi/chi/v5"

func (h *TaskHandler) RegisterRoutes(r chi.Router) {
    r.Route("/tasks", func(r chi.Router) {
        r.Post("/", h.CreateTask)
        r.Get("/{id}", h.GetTask)
        r.Put("/{id}", h.UpdateTask)
        r.Delete("/{id}", h.DeleteTask)
    })
}
```

**Key Points:**
- Use Chi router for route definition
- Group related routes with `r.Route()`
- Use RESTful naming conventions
- Use path parameters for resource IDs

### 4. Implement Handler Method

Implement handler method for POST endpoint:

```go
import (
    "encoding/json"
    "net/http"
    "internal/shared/response"
)

func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
    var cmd command.CreateTaskCommand
    if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
        response.Error(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    userID := r.Context().Value("user_id").(string)
    cmd.UserID = userID

    task, err := h.createTaskHandler.Handle(r.Context(), cmd)
    if err != nil {
        response.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    response.Success(w, task)
}
```

**Key Points:**
- Decode request body to command/query struct
- Extract user context (if authenticated)
- Call application layer handler
- Use standardized response helpers
- Handle errors appropriately

### 5. Implement GET Handler

Implement handler method for GET endpoint:

```go
func (h *TaskHandler) GetTask(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    if id == "" {
        response.Error(w, http.StatusBadRequest, "Missing task ID")
        return
    }

    userID := r.Context().Value("user_id").(string)

    query := query.GetTaskQuery{
        ID:     id,
        UserID: userID,
    }

    task, err := h.getTaskHandler.Handle(r.Context(), query)
    if err != nil {
        if err == query.ErrTaskNotFound {
            response.Error(w, http.StatusNotFound, "Task not found")
            return
        }
        response.Error(w, http.StatusInternalServerError, err.Error())
        return
    }

    response.Success(w, task)
}
```

**Key Points:**
- Extract path parameters using `chi.URLParam()`
- Validate required parameters
- Handle domain errors appropriately (e.g., not found)
- Use different HTTP status codes for different error types

## Request/Response Flow

```
HTTP Request
    ↓
Handler Method
    ↓
Decode Body to Command/Query
    ↓
Validate Input
    ↓
Call Application Layer Handler
    ↓
Handle Success/Error
    ↓
Standardized Response
```

## Error Handling

All API responses follow the standard response format defined in [Standard Response Format](../api-specs/standard-response-format.md).

For standard error codes and their meanings, refer to [Error Codes](../api-specs/error-codes.md).

### Error Handling Pattern

```go
if err != nil {
    // Check for specific domain errors
    if err == specificError {
        // Use standard error code from error-codes.md (e.g., RES_001)
        response.Error(w, http.StatusNotFound, "Resource not found")
        return
    }

    // Generic server error (SRV_001)
    response.Error(w, http.StatusInternalServerError, err.Error())
    return
}
```

## Input Validation

### Validate Request Body

```go
if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
    response.Error(w, http.StatusBadRequest, "Invalid request body")
    return
}
```

### Validate Required Fields

```go
if cmd.Title == "" {
    response.Error(w, http.StatusBadRequest, "Title is required")
    return
}
```

### Validate Context

```go
userID := r.Context().Value("user_id")
if userID == nil {
    response.Error(w, http.StatusUnauthorized, "Unauthorized")
    return
}
```

## Response Helpers

Use the response helpers from `internal/shared/response/`:

```go
import "internal/shared/response"

// Success response
response.Success(w, data)

// Error response
response.Error(w, http.StatusBadRequest, "Error message")

// Paginated response
response.Paginated(w, data, paginationMeta)
```

For implementation details, see:
- [Go Response Helper](../examples/api-implementation/go-response-helper.go)

## Authentication Middleware

Ensure authentication middleware is applied to protected routes:

```go
// In main router setup
r.Use(authMiddleware)

// In handler, extract user context
userID := r.Context().Value("user_id").(string)
```

## Testing

Write unit tests for handlers:

```go
package http

import (
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestCreateTask(t *testing.T) {
    handler := NewTaskHandler(mockCreateHandler, mockGetHandler)

    req := httptest.NewRequest("POST", "/tasks", strings.NewReader(`{"title":"Test"}`))
    req.Header.Set("Content-Type", "application/json")
    req = req.WithContext(context.WithValue(req.Context(), "user_id", "user-123"))

    w := httptest.NewRecorder()
    handler.CreateTask(w, req)

    if w.Code != http.StatusOK {
        t.Errorf("Expected status 200, got %d", w.Code)
    }
}
```

## Best Practices

### Handler Responsibilities

- Decode and validate HTTP requests
- Extract context (user ID, etc.)
- Call application layer
- Format HTTP responses
- Handle HTTP-specific errors

### Handler Should NOT

- Contain business logic
- Access database directly
- Implement complex validation
- Handle domain-specific errors (only HTTP mapping)

### Code Organization

- One handler struct per domain
- One file per handler group
- Group related routes together
- Keep handler methods simple

## Next Steps

- Implement application layer (commands/queries)
- Create DTOs for request/response
- Add authentication middleware
- Write unit tests

## References

- [Backend Technical Design](../backend-spec/README.md)
- [Standard Response Format](../api-specs/standard-response-format.md)
- [Handler Example](../examples/backend-implementation/handler-example.go)
- [Go Response Helper](../examples/api-implementation/go-response-helper.go)
