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
