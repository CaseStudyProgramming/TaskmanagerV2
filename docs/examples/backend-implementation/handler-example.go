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
