# Backend Testing Examples

This document provides detailed code examples for backend testing in Go.

## Time Helper Tests

### EpochToTime
```go
func TestEpochToTime(t *testing.T) {
    tests := []struct {
        name     string
        epoch    int64
        expected time.Time
    }{
        {
            name:     "convert epoch to time",
            epoch:    1726652400000,
            expected: time.Date(2024, 9, 18, 0, 0, 0, 0, time.UTC),
        },
        {
            name:     "handle zero epoch",
            epoch:    0,
            expected: time.Unix(0, 0).UTC(),
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := EpochToTime(tt.epoch)
            assert.Equal(t, tt.expected, result)
        })
    }
}
```

### TimeToEpoch
```go
func TestTimeToEpoch(t *testing.T) {
    tests := []struct {
        name     string
        time     time.Time
        expected int64
    }{
        {
            name:     "convert time to epoch",
            time:     time.Date(2024, 9, 18, 0, 0, 0, 0, time.UTC),
            expected: 1726652400000,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := TimeToEpoch(tt.time)
            assert.Equal(t, tt.expected, result)
        })
    }
}
```

### NowEpoch
```go
func TestNowEpoch(t *testing.T) {
    before := time.Now().UnixMilli()
    epoch := NowEpoch()
    after := time.Now().UnixMilli()
    
    assert.GreaterOrEqual(t, epoch, before)
    assert.LessOrEqual(t, epoch, after)
}
```

### IsValidEpoch
```go
func TestIsValidEpoch(t *testing.T) {
    tests := []struct {
        name     string
        epoch    int64
        expected bool
    }{
        {"valid epoch", 1726652400000, true},
        {"zero epoch", 0, true},
        {"negative epoch", -1, false},
        {"future epoch", 9999999999999, true},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := IsValidEpoch(tt.epoch)
            assert.Equal(t, tt.expected, result)
        })
    }
}
```

## Response Helper Tests

### SuccessResponse
```go
func TestSuccessResponse(t *testing.T) {
    data := map[string]string{"message": "test"}
    meta := map[string]interface{}{"request_id": "test-123"}
    
    response := SuccessResponse(data, meta)
    
    assert.True(t, response.Status.IsSuccess)
    assert.Equal(t, 200, response.Status.Code)
    assert.Equal(t, "Success", response.Status.Message)
    assert.NotNil(t, response.Data)
    assert.NotNil(t, response.Meta)
}
```

### ErrorResponse
```go
func TestErrorResponse(t *testing.T) {
    errors := []ErrorDetail{
        {Field: "title", Message: "Title is required"},
    }
    
    response := ErrorResponse(400, "Validation failed", errors)
    
    assert.False(t, response.Status.IsSuccess)
    assert.Equal(t, 400, response.Status.Code)
    assert.Equal(t, "Validation failed", response.Status.Message)
    assert.Nil(t, response.Data)
}
```

### PaginatedResponse
```go
func TestPaginatedResponse(t *testing.T) {
    data := []string{"item1", "item2"}
    pagination := PaginationMeta{
        Page:      1,
        Limit:     20,
        Total:     100,
        TotalPages: 5,
    }
    
    response := PaginatedResponse(data, pagination)
    
    assert.True(t, response.Status.IsSuccess)
    assert.NotNil(t, response.Meta["pagination"])
}
```

## Validation Helper Tests

### IsValidEmail
```go
func TestIsValidEmail(t *testing.T) {
    tests := []struct {
        name     string
        email    string
        expected bool
    }{
        {"valid email", "test@example.com", true},
        {"invalid email", "invalid", false},
        {"empty email", "", false},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := IsValidEmail(tt.email)
            assert.Equal(t, tt.expected, result)
        })
    }
}
```

### IsValidUUID
```go
func TestIsValidUUID(t *testing.T) {
    tests := []struct {
        name     string
        uuid     string
        expected bool
    }{
        {"valid UUID", "550e8400-e29b-41d4-a716-446655440000", true},
        {"invalid UUID", "invalid", false},
        {"empty UUID", "", false},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := IsValidUUID(tt.uuid)
            assert.Equal(t, tt.expected, result)
        })
    }
}
```

## Response Format Tests

### Standard Response Structure
```go
func TestStandardResponseStructure(t *testing.T) {
    // Test success response structure
    successResp := SuccessResponse(map[string]string{"test": "data"}, nil)
    
    assert.NotNil(t, successResp.Status)
    assert.NotNil(t, successResp.Data)
    assert.NotNil(t, successResp.Meta)
    assert.NotNil(t, successResp.Status.Code)
    assert.NotNil(t, successResp.Status.Message)
    assert.NotNil(t, successResp.Status.IsSuccess)
    
    // Test error response structure
    errorResp := ErrorResponse(400, "Error", nil)
    
    assert.NotNil(t, errorResp.Status)
    assert.Nil(t, errorResp.Data)
    assert.NotNil(t, errorResp.Meta)
}
```

### Response Status Codes
```go
func TestResponseStatusCodes(t *testing.T) {
    tests := []struct {
        name           string
        response       Response
        expectedCode   int
        expectedSuccess bool
    }{
        {"success response", SuccessResponse(nil, nil), 200, true},
        {"created response", SuccessResponse(nil, nil), 201, true},
        {"bad request", ErrorResponse(400, "Bad Request", nil), 400, false},
        {"unauthorized", ErrorResponse(401, "Unauthorized", nil), 401, false},
        {"not found", ErrorResponse(404, "Not Found", nil), 404, false},
        {"server error", ErrorResponse(500, "Server Error", nil), 500, false},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            assert.Equal(t, tt.expectedCode, tt.response.Status.Code)
            assert.Equal(t, tt.expectedSuccess, tt.response.Status.IsSuccess)
        })
    }
}
```

### Meta Field Validation
```go
func TestResponseMetaFields(t *testing.T) {
    response := SuccessResponse(nil, map[string]interface{}{
        "timestamp": 1726652400000,
        "request_id": "test-123",
    })
    
    assert.Contains(t, response.Meta, "timestamp")
    assert.Contains(t, response.Meta, "request_id")
    
    // Verify timestamp is epoch milliseconds
    timestamp := response.Meta["timestamp"].(int64)
    assert.Greater(t, timestamp, int64(1000000000000)) // After year 2001
    assert.Less(t, timestamp, int64(9999999999999))   // Before year 2286
}
```

### Pagination Meta Validation
```go
func TestPaginationMeta(t *testing.T) {
    data := []string{"item1", "item2"}
    pagination := PaginationMeta{
        Page:      1,
        Limit:     20,
        Total:     100,
        TotalPages: 5,
    }
    
    response := PaginatedResponse(data, pagination)
    
    metaPagination := response.Meta["pagination"].(PaginationMeta)
    assert.Equal(t, 1, metaPagination.Page)
    assert.Equal(t, 20, metaPagination.Limit)
    assert.Equal(t, 100, metaPagination.Total)
    assert.Equal(t, 5, metaPagination.TotalPages)
}
```

## Domain Entity Tests

### Task Entity
```go
func TestTaskEntity(t *testing.T) {
    t.Run("create valid task", func(t *testing.T) {
        task := NewTask("Test Task", "high", "todo")
        
        assert.NotEmpty(t, task.ID)
        assert.Equal(t, "Test Task", task.Title)
        assert.Equal(t, "high", task.Priority)
        assert.Equal(t, "todo", task.Status)
        assert.Greater(t, task.CreatedAt, int64(0))
    })
    
    t.Run("validate task title", func(t *testing.T) {
        task := NewTask("", "high", "todo")
        
        err := task.Validate()
        assert.Error(t, err)
        assert.Contains(t, err.Error(), "title")
    })
}
```

### Value Object Tests
```go
func TestPriorityValueObject(t *testing.T) {
    tests := []struct {
        name     string
        value    string
        valid    bool
        weight   int
    }{
        {"urgent priority", "urgent", true, 100},
        {"high priority", "high", true, 75},
        {"medium priority", "medium", true, 50},
        {"low priority", "low", true, 25},
        {"invalid priority", "invalid", false, 0},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            priority, err := NewPriority(tt.value)
            
            if tt.valid {
                assert.NoError(t, err)
                assert.Equal(t, tt.weight, priority.Weight())
            } else {
                assert.Error(t, err)
            }
        })
    }
}
```

## Service Layer Tests

### Command Handler Tests
```go
func TestCreateTaskCommand(t *testing.T) {
    mockRepo := new(MockTaskRepository)
    handler := NewCreateTaskHandler(mockRepo)
    
    command := CreateTaskCommand{
        Title:    "Test Task",
        Priority: "high",
        Status:   "todo",
    }
    
    mockRepo.On("Create", mock.AnythingOfType("*Task")).Return(nil)
    
    result, err := handler.Handle(command)
    
    assert.NoError(t, err)
    assert.NotNil(t, result)
    mockRepo.AssertExpectations(t)
}
```

### Query Handler Tests
```go
func TestGetTaskQuery(t *testing.T) {
    mockRepo := new(MockTaskRepository)
    handler := NewGetTaskHandler(mockRepo)
    
    taskID := "task-123"
    expectedTask := &Task{
        ID:    taskID,
        Title: "Test Task",
    }
    
    mockRepo.On("FindByID", taskID).Return(expectedTask, nil)
    
    result, err := handler.Handle(GetTaskQuery{ID: taskID})
    
    assert.NoError(t, err)
    assert.Equal(t, expectedTask, result)
    mockRepo.AssertExpectations(t)
}
```

## Repository Tests

### Repository Implementation Tests
```go
func TestTaskRepository_Create(t *testing.T) {
    db := setupTestDB(t)
    repo := NewTaskRepository(db)
    
    task := &Task{
        Title:    "Test Task",
        Priority: "high",
        Status:   "todo",
    }
    
    err := repo.Create(task)
    require.NoError(t, err)
    assert.NotEmpty(t, task.ID)
    
    // Verify in database
    var fetched Task
    err = db.QueryRow("SELECT id, title FROM tasks WHERE id = $1", task.ID).
        Scan(&fetched.ID, &fetched.Title)
    require.NoError(t, err)
    assert.Equal(t, "Test Task", fetched.Title)
}
```

## Integration Tests

### API Integration Tests
```go
func TestTaskAPIIntegration(t *testing.T) {
    db := setupTestDatabase(t)
    defer teardownTestDatabase(t, db)
    
    app := setupApp(db)
    
    // Test creating a task
    body := map[string]interface{}{
        "title":    "Integration Test Task",
        "priority": "high",
    }
    bodyBytes, _ := json.Marshal(body)
    
    req := httptest.NewRequest("POST", "/api/v1/tasks", bytes.NewBuffer(bodyBytes))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    
    app.ServeHTTP(w, req)
    
    assert.Equal(t, http.StatusCreated, w.Code)
    
    var response map[string]interface{}
    err := json.Unmarshal(w.Body.Bytes(), &response)
    require.NoError(t, err)
    assert.NotEmpty(t, response["data"].(map[string]interface{})["id"])
}
```

## Security Tests

### SQL Injection Prevention
```go
func TestSQLInjectionPrevention(t *testing.T) {
    maliciousInput := "'; DROP TABLE tasks; --"
    
    task := &Task{Title: maliciousInput}
    err := repo.Create(task)
    
    // Should handle input safely
    assert.NoError(t, err)
    
    // Verify table still exists
    var count int
    db.QueryRow("SELECT COUNT(*) FROM tasks").Scan(&count)
    assert.Equal(t, 0, count) // Empty, not dropped
}
```

### Authentication Tests
```go
func TestUnauthorizedAccess(t *testing.T) {
    req := httptest.NewRequest("GET", "/api/v1/tasks", nil)
    w := httptest.NewRecorder()
    
    handler.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    })).ServeHTTP(w, req)
    
    assert.Equal(t, http.StatusUnauthorized, w.Code)
}
```
