# Implementing Backend Entities

This guide explains how to implement domain entities following the DDD architecture pattern used in this project.

## Overview

Entities represent core business objects with identity and lifecycle. They contain business logic and enforce domain rules.

## Prerequisites

- Read [Backend Technical Design](../backend-spec/README.md) for architecture overview
- Read [Entity Example](../examples/backend-implementation/entity-example.go) for reference implementation
- Familiarity with Go programming language

## Step-by-Step Implementation

### 1. Define Entity Struct

Create a new file in `internal/domain/{domain}/entity.go`:

```go
package task

import (
    "time"
    "github.com/google/uuid"
)

type Task struct {
    ID           string
    UserID       string
    Title        string
    Description  string
    Status       Status
    Priority     Priority
    DueDate      int64           // Epoch milliseconds
    Tags         []string
    CreatedAt    int64           // Epoch milliseconds
    UpdatedAt    int64           // Epoch milliseconds
    CompletedAt  *int64          // Epoch milliseconds (nullable)
    PriorityScore int
}
```

**Key Points:**
- Use `string` for IDs (UUID format)
- Use `int64` for timestamps (epoch milliseconds)
- Use pointers for nullable fields (e.g., `*int64`)
- Group related fields together

### 2. Define Value Objects

Create value objects in `internal/domain/{domain}/valueobject.go`:

```go
package task

type Status string

const (
    StatusTodo       Status = "todo"
    StatusInProgress Status = "in-progress"
    StatusCompleted  Status = "completed"
)

type Priority string

const (
    PriorityLow    Priority = "low"
    PriorityMedium Priority = "medium"
    PriorityHigh   Priority = "high"
)
```

**Key Points:**
- Use string types for enums (easier for JSON serialization)
- Define constants for valid values
- Keep value objects simple (no behavior)

### 3. Define Repository Interface

Create repository interface in `internal/domain/{domain}/repository.go`:

```go
package task

import "context"

type Repository interface {
    Create(ctx context.Context, task *Task) error
    FindByID(ctx context.Context, id string) (*Task, error)
    FindByUserID(ctx context.Context, userID string, filter Filter) ([]*Task, error)
    Update(ctx context.Context, task *Task) error
    Delete(ctx context.Context, id string) error
}

type Filter struct {
    Status   Status
    Priority Priority
    Search   string
    Limit    int
    Offset   int
}
```

**Key Points:**
- Accept `context.Context` as first parameter
- Return errors for all operations
- Use structs for complex query parameters
- Keep interface minimal (only CRUD operations)

### 4. Implement Factory Function

Create factory function in `entity.go`:

```go
func NewTask(userID, title string, priority Priority) (*Task, error) {
    if title == "" {
        return nil, ErrEmptyTitle
    }

    now := time.Now().UnixMilli()

    return &Task{
        ID:          uuid.New().String(),
        UserID:      userID,
        Title:       title,
        Status:      StatusTodo,
        Priority:    priority,
        CreatedAt:   now,
        UpdatedAt:   now,
    }, nil
}
```

**Key Points:**
- Validate input parameters
- Set default values (e.g., status, timestamps)
- Generate ID using UUID
- Return error for invalid input

### 5. Define Domain Errors

Define custom errors in `entity.go`:

```go
import "errors"

var (
    ErrEmptyTitle     = errors.New("title cannot be empty")
    ErrInvalidStatus  = errors.New("invalid status")
    ErrTaskNotFound   = errors.New("task not found")
)
```

**Key Points:**
- Use package-level variables for errors
- Use descriptive error messages
- Wrap errors with context when appropriate

## Best Practices

### Validation

- Validate in factory functions (not setters)
- Return descriptive errors
- Use custom error types for domain errors

### Timestamps

- Always use epoch milliseconds (`time.Now().UnixMilli()`)
- Set `CreatedAt` and `UpdatedAt` in factory
- Update `UpdatedAt` on every modification

### IDs

- Use UUID for all entity IDs
- Generate in factory function
- Use `string` type (not `uuid.UUID`)

### Business Logic

- Keep business logic in entity methods
- Avoid anemic domain model
- Use value objects for complex data

## Testing

Write unit tests for entity logic:

```go
package task

import (
    "testing"
)

func TestNewTask(t *testing.T) {
    tests := []struct {
        name     string
        userID   string
        title    string
        priority Priority
        wantErr  bool
    }{
        {
            name:     "valid task",
            userID:   "user-123",
            title:    "Test task",
            priority: PriorityHigh,
            wantErr:  false,
        },
        {
            name:     "empty title",
            userID:   "user-123",
            title:    "",
            priority: PriorityHigh,
            wantErr:  true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            task, err := NewTask(tt.userID, tt.title, tt.priority)
            if (err != nil) != tt.wantErr {
                t.Errorf("NewTask() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if !tt.wantErr {
                if task.ID == "" {
                    t.Error("NewTask() generated empty ID")
                }
                if task.Status != StatusTodo {
                    t.Errorf("NewTask() status = %v, want %v", task.Status, StatusTodo)
                }
            }
        })
    }
}
```

## Next Steps

- Implement repository in `internal/infrastructure/persistence/postgresql/`
- Create application layer in `internal/application/{domain}/`
- Implement HTTP handlers in `internal/interfaces/http/{domain}/`

## References

- [Backend Technical Design](../backend-spec/README.md)
- [Entity Example](../examples/backend-implementation/entity-example.go)
- [Repository Example](../examples/backend-implementation/repository-example.go)
- [Database Schema](../backend-spec/database-schema.md)
