# Backend Architecture - Domain-Driven Design

This document explains the backend architecture using Domain-Driven Design (DDD) and Vertical Slices patterns.

## Overview

The backend follows DDD principles with clear separation of concerns across domain, application, infrastructure, and interface layers.

## Architecture Layers

### 1. Domain Layer

The domain layer contains the core business logic and is independent of external dependencies.

#### Structure
```
internal/domain/
├── task/
│   ├── entity.go              # Task aggregate root
│   ├── valueobject.go         # Priority, Status value objects
│   ├── repository.go          # Repository interface
│   └── service.go             # Domain service interface
├── user/
│   ├── entity.go              # User aggregate root
│   ├── valueobject.go         # Email, GoogleID value objects
│   ├── repository.go          # Repository interface
│   └── service.go             # Domain service interface
└── auth/
    ├── entity.go              # Session entity
    ├── valueobject.go         # Token value object
    ├── repository.go          # Repository interface
    └── service.go             # Domain service interface
```

#### Entity Example
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

func (t *Task) Validate() error {
    if t.Title == "" {
        return ErrEmptyTitle
    }
    if !t.Status.IsValid() {
        return ErrInvalidStatus
    }
    if !t.Priority.IsValid() {
        return ErrInvalidPriority
    }
    return nil
}

func (t *Task) Complete() error {
    if t.Status == StatusCompleted {
        return ErrAlreadyCompleted
    }
    
    now := time.Now().UnixMilli()
    t.Status = StatusCompleted
    t.CompletedAt = &now
    t.UpdatedAt = now
    
    return nil
}
```

#### Value Object Example
```go
package task

type Priority string

const (
    PriorityLow    Priority = "low"
    PriorityMedium Priority = "medium"
    PriorityHigh   Priority = "high"
    PriorityUrgent Priority = "urgent"
)

func (p Priority) IsValid() bool {
    switch p {
    case PriorityLow, PriorityMedium, PriorityHigh, PriorityUrgent:
        return true
    default:
        return false
    }
}

func (p Priority) Weight() int {
    switch p {
    case PriorityUrgent:
        return 100
    case PriorityHigh:
        return 75
    case PriorityMedium:
        return 50
    case PriorityLow:
        return 25
    default:
        return 0
    }
}

func NewPriority(value string) (Priority, error) {
    priority := Priority(value)
    if !priority.IsValid() {
        return "", ErrInvalidPriority
    }
    return priority, nil
}
```

#### Repository Interface
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

### 2. Application Layer

The application layer contains use cases and orchestrates domain objects.

#### Structure
```
internal/application/
├── task/
│   ├── command/
│   │   ├── create_task.go       # Create task command
│   │   ├── update_task.go       # Update task command
│   │   ├── delete_task.go       # Delete task command
│   │   └── complete_task.go     # Complete task command
│   ├── query/
│   │   ├── get_task.go          # Get task query
│   │   ├── list_tasks.go        # List tasks query
│   │   └── prioritize_tasks.go  # Prioritize tasks query
│   ├── dto/
│   │   ├── task_dto.go          # Data transfer objects
│   │   └── filter_dto.go        # Filter DTOs
│   └── service.go               # Application service
```

#### Command Handler Example
```go
package command

import (
    "context"
    "github.com/google/uuid"
    
    "internal/domain/task"
)

type CreateTaskCommand struct {
    UserID      string
    Title       string
    Description string
    Priority    string
    DueDate     int64
    Tags        []string
}

type CreateTaskHandler struct {
    taskRepo task.Repository
}

func NewCreateTaskHandler(taskRepo task.Repository) *CreateTaskHandler {
    return &CreateTaskHandler{taskRepo: taskRepo}
}

func (h *CreateTaskHandler) Handle(ctx context.Context, cmd CreateTaskCommand) (*task.Task, error) {
    // Convert string priority to domain value object
    priority, err := task.NewPriority(cmd.Priority)
    if err != nil {
        return nil, err
    }
    
    // Create domain entity
    newTask, err := task.NewTask(cmd.UserID, cmd.Title, priority)
    if err != nil {
        return nil, err
    }
    
    // Set additional fields
    newTask.Description = cmd.Description
    newTask.DueDate = cmd.DueDate
    newTask.Tags = cmd.Tags
    
    // Calculate priority score
    newTask.PriorityScore = calculatePriorityScore(newTask)
    
    // Persist to repository
    if err := h.taskRepo.Create(ctx, newTask); err != nil {
        return nil, err
    }
    
    return newTask, nil
}

func calculatePriorityScore(t *task.Task) int {
    score := t.Priority.Weight()
    
    // Add due date weight
    if t.DueDate > 0 {
        now := time.Now().UnixMilli()
        daysUntilDue := (t.DueDate - now) / (24 * 60 * 60 * 1000)
        if daysUntilDue > 0 {
            score += int(50.0 / float64(daysUntilDue))
        } else {
            score += 50 // Overdue
        }
    }
    
    // Add age weight (max 10)
    age := (time.Now().UnixMilli() - t.CreatedAt) / (24 * 60 * 60 * 1000)
    if age > 7 {
        score += 10
    } else {
        score += int(age)
    }
    
    return score
}
```

#### Query Handler Example
```go
package query

import (
    "context"
    
    "internal/domain/task"
)

type GetTaskQuery struct {
    ID     string
    UserID string
}

type GetTaskHandler struct {
    taskRepo task.Repository
}

func NewGetTaskHandler(taskRepo task.Repository) *GetTaskHandler {
    return &GetTaskHandler{taskRepo: taskRepo}
}

func (h *GetTaskHandler) Handle(ctx context.Context, query GetTaskQuery) (*task.Task, error) {
    task, err := h.taskRepo.FindByID(ctx, query.ID)
    if err != nil {
        return nil, err
    }
    
    // Authorization check
    if task.UserID != query.UserID {
        return nil, ErrUnauthorized
    }
    
    return task, nil
}
```

### 3. Infrastructure Layer

The infrastructure layer implements interfaces defined in the domain layer and handles external dependencies.

#### Structure
```
internal/infrastructure/
├── persistence/
│   ├── postgresql/
│   │   ├── task_repository.go      # PostgreSQL implementation
│   │   ├── user_repository.go      # PostgreSQL implementation
│   │   └── auth_repository.go      # PostgreSQL implementation
│   └── redis/
│       └── cache_repository.go      # Redis cache implementation
├── external/
│   ├── google_oauth.go             # Google OAuth client
│   └── email_service.go            # Email service client
└── messaging/
    └── event_bus.go                # Event bus implementation
```

#### Repository Implementation Example
```go
package postgresql

import (
    "context"
    "database/sql"
    
    "github.com/volatiletech/sqlboiler/v4/boil"
    "internal/domain/task"
)

type TaskRepository struct {
    db *sql.DB
}

func NewTaskRepository(db *sql.DB) *TaskRepository {
    return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(ctx context.Context, task *task.Task) error {
    model := &models.Task{
        ID:           task.ID,
        UserID:       task.UserID,
        Title:        task.Title,
        Description:  task.Description,
        Status:       string(task.Status),
        Priority:     string(task.Priority),
        DueDate:      task.DueDate,
        Tags:         task.Tags,
        CreatedAt:    task.CreatedAt,
        UpdatedAt:    task.UpdatedAt,
        PriorityScore: task.PriorityScore,
    }
    
    return model.Insert(ctx, r.db, boil.Infer())
}

func (r *TaskRepository) FindByID(ctx context.Context, id string) (*task.Task, error) {
    model, err := models.FindTask(ctx, r.db, id)
    if err != nil {
        return nil, err
    }
    
    return r.modelToDomain(model), nil
}

func (r *TaskRepository) modelToDomain(model *models.Task) *task.Task {
    var completedAt *int64
    if model.CompletedAt.Valid {
        completedAt = &model.CompletedAt.Int64
    }
    
    return &task.Task{
        ID:           model.ID,
        UserID:       model.UserID,
        Title:        model.Title,
        Description:  model.Description,
        Status:       task.Status(model.Status),
        Priority:     task.Priority(model.Priority),
        DueDate:      model.DueDate,
        Tags:         model.Tags,
        CreatedAt:    model.CreatedAt,
        UpdatedAt:    model.UpdatedAt,
        CompletedAt:  completedAt,
        PriorityScore: model.PriorityScore,
    }
}
```

### 4. Interface Layer

The interface layer handles HTTP requests and responses.

#### Structure
```
internal/interfaces/
├── http/
│   ├── task/
│   │   ├── handler.go             # HTTP handlers
│   │   ├── middleware.go          # HTTP middleware
│   │   └── response.go            # Response helpers
│   ├── user/
│   │   ├── handler.go
│   │   ├── middleware.go
│   │   └── response.go
│   └── auth/
│       ├── handler.go
│       ├── middleware.go
│       └── response.go
└── cli/
    └── commands.go                # CLI commands
```

#### HTTP Handler Example
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
    
    // Get user ID from context (set by auth middleware)
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

## Vertical Slice Pattern

Each feature (task, user, auth) is organized as a vertical slice:

```
task_slice/
├── domain/          # Business logic
├── application/     # Use cases
├── infrastructure/  # External dependencies
└── interfaces/      # HTTP handlers
```

### Benefits
- **High cohesion** within slices
- **Low coupling** between slices
- **Easy to add/remove features**
- **Independent testing** per slice
- **Clear ownership** of features

## Shared Layer

Common utilities and helpers used across all slices:

```
internal/shared/
├── time/
│   ├── epoch.go               # Time helper functions
│   └── epoch_test.go
├── response/
│   ├── response.go            # Standard response format
│   └── response_test.go
├── validation/
│   ├── validators.go          # Validation helpers
│   └── validators_test.go
└── utils/
    ├── string.go
    └── string_test.go
```

## Dependency Injection

The application uses constructor injection for dependencies:

```go
func main() {
    // Infrastructure
    db := initDatabase()
    redis := initRedis()
    
    // Repositories
    taskRepo := postgresql.NewTaskRepository(db)
    userRepo := postgresql.NewUserRepository(db)
    cacheRepo := redis.NewCacheRepository(redis)
    
    // Domain services
    taskService := task.NewService(taskRepo)
    
    // Application handlers
    createTaskHandler := command.NewCreateTaskHandler(taskRepo)
    getTaskHandler := query.NewGetTaskHandler(taskRepo)
    
    // HTTP handlers
    taskHandler := http.NewTaskHandler(createTaskHandler, getTaskHandler)
    
    // Router
    r := chi.NewRouter()
    taskHandler.RegisterRoutes(r)
    
    // Server
    http.ListenAndServe(":8080", r)
}
```

## Best Practices

1. **Domain First**: Start with domain entities and value objects
2. **Interface Segregation**: Define small, focused interfaces
3. **Dependency Inversion**: Depend on abstractions, not concretions
4. **Single Responsibility**: Each class has one reason to change
5. **Vertical Slices**: Organize by feature, not layer
6. **Testability**: Make everything testable through interfaces
7. **Validation**: Validate at domain boundaries
8. **Error Handling**: Use domain-specific errors
