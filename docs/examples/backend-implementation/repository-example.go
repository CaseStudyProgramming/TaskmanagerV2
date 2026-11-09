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
