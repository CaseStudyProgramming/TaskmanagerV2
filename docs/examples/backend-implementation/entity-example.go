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
