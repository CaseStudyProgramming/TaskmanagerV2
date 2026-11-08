# Backend Technical Design

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the backend technical design, technology stack, architecture patterns, and coding standards for the Advanced Task Manager project.

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Language** | Go | 1.21+ | Backend programming language |
| **Runtime** | Go stdlib | Built-in | Go runtime and standard library |
| **Framework** | Chi | 5.0+ | Idiomatic HTTP router |
| **Architecture** | DDD + Vertical Slices | - | Domain-Driven Design pattern |
| **ORM** | SQLBoiler | 4.16+ | Database ORM and code generation |
| **API Spec** | OpenAPI (oapi-codegen) | - | API specification and code generation |
| **Validation** | Go validator | 10.16+ | Input validation |
| **Crypto** | Standard library | - | Cryptographic operations |
| **Deployment** | Podman | 4.0+ | Container runtime |
| **Reverse Proxy** | Nginx | 1.24+ | Reverse proxy and SSL termination |

### External Services

| Service | Technology | Purpose |
|---------|------------|---------|
| **Database** | Neon PostgreSQL | Primary data storage |
| **Cache** | Upstash Redis | Application caching |
| **Auth** | Google OAuth 2.0 | User authentication |
| **CI/CD** | Forgejo Actions | Build, test, deploy |
| **Registry** | GitHub Container Registry | Container image storage |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Go Modules** | Dependency management |
| **gofmt** | Code formatting |
| **golint** | Linting |
| **go test** | Unit testing |
| **go vet** | Static analysis |
| **dlv** | Debugging |

---

## Architecture Patterns

### Domain-Driven Design (DDD)

The backend follows DDD principles with clear separation of concerns across domain, application, infrastructure, and interface layers.

#### Layer Structure

```
internal/
├── domain/              # Domain layer (business logic)
│   ├── task/
│   │   ├── entity.go
│   │   ├── valueobject.go
│   │   ├── repository.go
│   │   └── service.go
│   ├── user/
│   │   ├── entity.go
│   │   ├── valueobject.go
│   │   ├── repository.go
│   │   └── service.go
│   └── auth/
│       ├── entity.go
│       ├── valueobject.go
│       ├── repository.go
│       └── service.go
├── application/         # Application layer (use cases)
│   ├── task/
│   │   ├── command/
│   │   ├── query/
│   │   ├── dto/
│   │   └── service.go
│   ├── user/
│   │   ├── command/
│   │   ├── query/
│   │   ├── dto/
│   │   └── service.go
│   └── auth/
│       ├── command/
│       ├── query/
│       ├── dto/
│       └── service.go
├── infrastructure/      # Infrastructure layer (external deps)
│   ├── persistence/
│   │   ├── postgresql/
│   │   └── redis/
│   ├── external/
│   │   ├── google_oauth.go
│   │   └── email_service.go
│   └── messaging/
│       └── event_bus.go
└── interfaces/          # Interface layer (HTTP handlers)
    ├── http/
    │   ├── task/
    │   ├── user/
    │   └── auth/
    └── cli/
        └── commands.go
```

### Vertical Slice Pattern

Each feature (task, user, auth) is organized as a vertical slice:

```
task_slice/
├── domain/          # Business logic
├── application/     # Use cases
├── infrastructure/  # External dependencies
└── interfaces/      # HTTP handlers
```

**Benefits:**
- High cohesion within slices
- Low coupling between slices
- Easy to add/remove features
- Independent testing per slice
- Clear ownership of features

---

## Directory Conventions

### Project Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/                    # Private application code
│   ├── domain/                  # Domain layer
│   ├── application/             # Application layer
│   ├── infrastructure/         # Infrastructure layer
│   ├── interfaces/              # Interface layer
│   └── shared/                  # Shared utilities
├── pkg/                         # Public libraries (if any)
├── api/                         # Generated API code (OpenAPI)
├── models/                      # SQLBoiler generated models
├── migrations/                  # Database migrations
├── scripts/                     # Utility scripts
├── tests/                       # Integration tests
├── Dockerfile                   # Container image definition
├── go.mod                       # Go module definition
├── go.sum                       # Go module checksums
└── Makefile                     # Build automation
```

### File Naming Conventions

| File Type | Convention | Example |
|-----------|------------|---------|
| **Go files** | `snake_case.go` | `task_repository.go` |
| **Test files** | `snake_case_test.go` | `task_repository_test.go` |
| **Directories** | `snake_case` | `task_repository/` |
| **Interfaces** | `snake_case.go` | `repository.go` |
| **Implementations** | `implementation_type.go` | `postgresql_repository.go` |

---

## Coding Standards

### Go Code Style

**Formatting:**
- Use `gofmt` for all code formatting
- Run `gofmt -w .` before committing
- Use `golint` for linting

**Naming:**
- Package names: lowercase, single word, no underscores
- Exported names: PascalCase
- Unexported names: camelCase
- Constants: PascalCase or UPPER_CASE
- Interfaces: `Interface` suffix (optional, e.g., `Repository`)

**Comments:**
- Exported functions must have comments
- Use godoc format
- Comment on "why", not "what"
- Keep comments concise and accurate

**Error Handling:**
- Always handle errors explicitly
- Wrap errors with context: `fmt.Errorf("failed to create task: %w", err)`
- Use sentinel errors for expected errors
- Use custom error types for domain errors

**Dependencies:**
- Keep dependencies minimal
- Prefer standard library
- Document external dependencies
- Update dependencies regularly

### Example Code

**Entity Example:**
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

**Repository Interface Example:**
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

**Handler Example:**
```go
package http

import (
    "encoding/json"
    "net/http"

    "github.com/go-chi/chi/v5"
    "internal/application/task/command"
    "internal/shared/response"
)

type TaskHandler struct {
    createTaskHandler *command.CreateTaskHandler
    getTaskHandler    *query.GetTaskHandler
}

func NewTaskHandler(
    createTaskHandler *command.CreateTaskHandler,
    getTaskHandler *query.GetTaskHandler,
) *TaskHandler {
    return &TaskHandler{
        createTaskHandler: createTaskHandler,
        getTaskHandler:    getTaskHandler,
    }
}

func (h *TaskHandler) RegisterRoutes(r chi.Router) {
    r.Route("/tasks", func(r chi.Router) {
        r.Post("/", h.CreateTask)
        r.Get("/{id}", h.GetTask)
        r.Put("/{id}", h.UpdateTask)
        r.Delete("/{id}", h.DeleteTask)
    })
}

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

---

## API Design

### RESTful API Principles

**Resource Naming:**
- Use nouns, not verbs: `/tasks` (not `/getTasks`)
- Use plural nouns for collections: `/tasks`
- Use singular nouns for single resource: `/tasks/{id}`
- Use kebab-case for multi-word: `/task-priorities`

**HTTP Methods:**
- `GET`: Retrieve resources
- `POST`: Create resources
- `PUT`: Update resources (full update)
- `PATCH`: Update resources (partial update)
- `DELETE`: Delete resources

**Status Codes:**
- `200 OK`: Successful GET, PUT, PATCH, DELETE
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE (no response body)
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Authorization failed
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (duplicate, etc.)
- `500 Internal Server Error`: Server error

### Standard Response Format

All API responses MUST follow this standard format:

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
    "request_id": "uuid-here",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

**Error Response Format:**
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

## Quality Standards

### Performance Requirements

- API response time < 200ms (p95)
- Database query time < 100ms (p95)
- Cache hit rate > 80%
- Support 10,000 concurrent users

### Code Quality

- Code coverage > 80% (unit tests)
- Code coverage > 70% (integration tests)
- Zero critical linting errors
- Zero security vulnerabilities

### Testing Strategy

**Unit Tests:**
- Test domain logic in isolation
- Mock external dependencies
- Test edge cases and error conditions
- Use table-driven tests

**Integration Tests:**
- Test against real database (Neon testing branch)
- Test API endpoints end-to-end
- Test with realistic data
- Use test fixtures

**E2E Tests:**
- Test complete user flows
- Test with real infrastructure
- Run in CI/CD pipeline
- Include smoke tests

### Security Standards

- OWASP Top 10 compliance
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy)
- CSRF protection (httpOnly cookies)
- Rate limiting on all endpoints

---

## Deployment

### Container Configuration

**Dockerfile:**
```dockerfile
# Multi-stage build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_OAUTH_CLIENT_SECRET`: Google OAuth client secret
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (default: 8080)

### CI/CD Pipeline

**Forgejo Actions Workflow:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'

      - name: Build
        run: go build -v ./...

      - name: Test
        run: go test -v -race -coverprofile=coverage.out ./...

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.out

      - name: Build Docker image
        run: |
          podman build -t ghcr.io/davidtan/taskmanager-backend:${{ github.sha }} ./backend

      - name: Push to GHCR
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | podman login ghcr.io -u davidtan --password-stdin
          podman push ghcr.io/davidtan/taskmanager-backend:${{ github.sha }}
```

---

## References

- [Backend DDD Architecture](../tdd/architecture/backend-ddd.md) - Detailed DDD implementation
- [Database Schema](./database-schema.md) - Database design and migrations
- [Background Jobs](./background-jobs.md) - Async processing and cron jobs
- [API Specifications](../api-specs/openapi.yaml) - Complete API contract
- [Backend Quality & Reliability](../tdd/quality-reliability/backend-quality-reliability.md) - Quality requirements
