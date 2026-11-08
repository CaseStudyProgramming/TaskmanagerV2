# Background Jobs

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the background job processing strategy, message broker configuration, cron schedules, and async task handling for the Advanced Task Manager backend.

---

## Background Job Strategy

### Current Approach

**Primary Method:** Go goroutines with channels

**Rationale:**
- Simple and efficient for current use cases
- No external message broker required
- Built-in Go concurrency primitives
- Low operational overhead

**Use Cases:**
- Email notifications (future)
- Priority score recalculation
- Data cleanup and maintenance
- Report generation (future)

### Future Scalability

**If complexity increases, consider:**
- **RabbitMQ**: Message broker for distributed systems
- **Kafka**: Event streaming for high-throughput scenarios
- **NATS**: Lightweight message broker
- **Redis Streams**: Simple queue implementation

---

## Goroutine-Based Jobs

### Job Queue Implementation

**Channel-Based Queue:**
```go
package jobs

import (
    "context"
    "sync"
)

type Job interface {
    Execute(ctx context.Context) error
}

type JobQueue struct {
    jobs chan Job
    wg   sync.WaitGroup
}

func NewJobQueue(bufferSize int) *JobQueue {
    return &JobQueue{
        jobs: make(chan Job, bufferSize),
    }
}

func (q *JobQueue) Start(ctx context.Context, workers int) {
    for i := 0; i < workers; i++ {
        q.wg.Add(1)
        go q.worker(ctx)
    }
}

func (q *JobQueue) worker(ctx context.Context) {
    defer q.wg.Done()

    for {
        select {
        case job := <-q.jobs:
            if err := job.Execute(ctx); err != nil {
                log.Printf("Job failed: %v", err)
            }
        case <-ctx.Done():
            return
        }
    }
}

func (q *JobQueue) Enqueue(job Job) {
    q.jobs <- job
}

func (q *JobQueue) Stop() {
    close(q.jobs)
    q.wg.Wait()
}
```

### Job Types

#### Priority Score Recalculation

**Purpose:** Recalculate priority scores for tasks based on due date proximity, task age, and completion patterns.

**Schedule:** Daily at 2:00 AM UTC

**Implementation:**
```go
package jobs

import (
    "context"
    "time"
    "internal/domain/task"
    "internal/infrastructure/persistence/postgresql"
)

type RecalculatePriorityJob struct {
    taskRepo task.Repository
}

func NewRecalculatePriorityJob(taskRepo task.Repository) *RecalculatePriorityJob {
    return &RecalculatePriorityJob{taskRepo: taskRepo}
}

func (j *RecalculatePriorityJob) Execute(ctx context.Context) error {
    // Get all active tasks
    tasks, err := j.taskRepo.FindByUserID(ctx, "", task.Filter{
        Status: task.StatusTodo,
    })
    if err != nil {
        return err
    }

    // Recalculate priority scores
    for _, t := range tasks {
        t.PriorityScore = calculatePriorityScore(t)
        if err := j.taskRepo.Update(ctx, t); err != nil {
            log.Printf("Failed to update task %s: %v", t.ID, err)
        }
    }

    return nil
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

#### Session Cleanup

**Purpose:** Delete expired sessions from the database.

**Schedule:** Hourly

**Implementation:**
```go
package jobs

import (
    "context"
    "time"
    "internal/domain/auth"
    "internal/infrastructure/persistence/postgresql"
)

type SessionCleanupJob struct {
    sessionRepo auth.Repository
}

func NewSessionCleanupJob(sessionRepo auth.Repository) *SessionCleanupJob {
    return &SessionCleanupJob{sessionRepo: sessionRepo}
}

func (j *SessionCleanupJob) Execute(ctx context.Context) error {
    now := time.Now().UnixMilli()

    // Delete expired sessions
    err := j.sessionRepo.DeleteExpired(ctx, now)
    if err != nil {
        return err
    }

    return nil
}
```

#### Cache Warmup

**Purpose:** Pre-populate cache with frequently accessed data.

**Schedule:** On application startup

**Implementation:**
```go
package jobs

import (
    "context"
    "internal/domain/task"
    "internal/infrastructure/persistence/postgresql"
    "internal/infrastructure/persistence/redis"
)

type CacheWarmupJob struct {
    taskRepo  task.Repository
    cacheRepo redis.Repository
}

func NewCacheWarmupJob(taskRepo task.Repository, cacheRepo redis.Repository) *CacheWarmupJob {
    return &CacheWarmupJob{
        taskRepo:  taskRepo,
        cacheRepo: cacheRepo,
    }
}

func (j *CacheWarmupJob) Execute(ctx context.Context) error {
    // Get frequently accessed tasks
    tasks, err := j.taskRepo.FindByUserID(ctx, "", task.Filter{
        Limit: 100,
    })
    if err != nil {
        return err
    }

    // Cache tasks
    for _, task := range tasks {
        cacheKey := fmt.Sprintf("task:%s", task.ID)
        j.cacheRepo.Set(ctx, cacheKey, encodeTask(task), 1*time.Hour)
    }

    return nil
}
```

---

## Cron Schedules

### Cron Implementation

**Package:** github.com/robfig/cron/v3

**Configuration:**
```go
package main

import (
    "github.com/robfig/cron/v3"
)

func main() {
    // Create cron scheduler
    c := cron.New(cron.WithSeconds())

    // Add jobs
    c.AddFunc("0 0 2 * * *", func() {
        jobQueue.Enqueue(recalculatePriorityJob)
    })

    c.AddFunc("0 0 * * * *", func() {
        jobQueue.Enqueue(sessionCleanupJob)
    })

    // Start scheduler
    c.Start()

    // Run application
    runApplication()
}
```

### Cron Schedule Definitions

| Job | Schedule | Cron Expression | Description |
|-----|----------|-----------------|-------------|
| **Priority Recalculation** | Daily at 2:00 AM UTC | `0 0 2 * * *` | Recalculate task priority scores |
| **Session Cleanup** | Hourly | `0 0 * * * *` | Delete expired sessions |
| **Cache Warmup** | On startup | Manual | Pre-populate cache |
| **Data Export Cleanup** | Weekly at 3:00 AM UTC | `0 0 3 * * 0` | Delete old export files |

---

## Message Broker (Future)

### RabbitMQ Integration (Future)

**When to implement:**
- Multiple services need to communicate
- Job queue requires persistence
- Need job retry and dead letter queues
- Need distributed job processing

**RabbitMQ Configuration:**
```go
package messaging

import (
    amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQClient struct {
    conn *amqp.Connection
    ch   *amqp.Channel
}

func NewRabbitMQClient(url string) (*RabbitMQClient, error) {
    conn, err := amqp.Dial(url)
    if err != nil {
        return nil, err
    }

    ch, err := conn.Channel()
    if err != nil {
        return nil, err
    }

    return &RabbitMQClient{conn: conn, ch: ch}, nil
}

func (c *RabbitMQClient) Publish(queue string, message []byte) error {
    q, err := c.ch.QueueDeclare(
        queue, // name
        true,  // durable
        false, // delete when unused
        false, // exclusive
        false, // no-wait
        nil,   // arguments
    )
    if err != nil {
        return err
    }

    return c.ch.PublishWithContext(
        context.Background(),
        "",     // exchange
        q.Name, // routing key
        false,  // mandatory
        false,  // immediate
        amqp.Publishing{
            ContentType: "application/json",
            Body:        message,
        },
    )
}

func (c *RabbitMQClient) Consume(queue string) (<-chan amqp.Delivery, error) {
    q, err := c.ch.QueueDeclare(
        queue, // name
        true,  // durable
        false, // delete when unused
        false, // exclusive
        false, // no-wait
        nil,   // arguments
    )
    if err != nil {
        return nil, err
    }

    return c.ch.Consume(
        q.Name, // queue
        "",     // consumer
        false,  // auto-ack
        false,  // exclusive
        false,  // no-local
        false,  // no-wait
        nil,    // args
    )
}
```

### Kafka Integration (Future)

**When to implement:**
- High-throughput event streaming
- Need event replay capability
- Multiple consumers for same events
- Real-time data processing

**Kafka Configuration:**
```go
package messaging

import (
    "github.com/segmentio/kafka-go"
)

type KafkaClient struct {
    writer *kafka.Writer
    reader *kafka.Reader
}

func NewKafkaClient(brokers []string, topic string) *KafkaClient {
    writer := &kafka.Writer{
        Addr:     kafka.TCP(brokers...),
        Topic:   topic,
        Balancer: &kafka.LeastBytes{},
    }

    reader := kafka.NewReader(kafka.ReaderConfig{
        Brokers:  brokers,
        Topic:    topic,
        GroupID:  "taskmanager-group",
        MinBytes: 10e3, // 10KB
        MaxBytes: 10e6, // 10MB
    })

    return &KafkaClient{writer: writer, reader: reader}
}

func (c *KafkaClient) Publish(message []byte) error {
    return c.writer.WriteMessages(context.Background(),
        kafka.Message{
            Value: message,
        },
    )
}

func (c *KafkaClient) Consume() ([]byte, error) {
    m, err := c.reader.ReadMessage(context.Background())
    if err != nil {
        return nil, err
    }
    return m.Value, nil
}
```

---

## Error Handling

### Job Retry Strategy

**Retry Configuration:**
```go
type JobConfig struct {
    MaxRetries    int
    RetryInterval time.Duration
    BackoffFactor float64
}

func (j *JobQueue) ExecuteWithRetry(ctx context.Context, job Job, config JobConfig) error {
    var lastErr error

    for attempt := 0; attempt <= config.MaxRetries; attempt++ {
        err := job.Execute(ctx)
        if err == nil {
            return nil
        }

        lastErr = err

        if attempt < config.MaxRetries {
            waitTime := time.Duration(float64(config.RetryInterval) * math.Pow(config.BackoffFactor, float64(attempt)))
            log.Printf("Job failed (attempt %d/%d), retrying in %v: %v", attempt+1, config.MaxRetries, waitTime, err)
            time.Sleep(waitTime)
        }
    }

    return fmt.Errorf("job failed after %d attempts: %w", config.MaxRetries, lastErr)
}
```

### Dead Letter Queue (Future)

**When to implement:**
- Jobs fail repeatedly after retries
- Need to investigate failed jobs
- Need manual intervention

**Dead Letter Queue Implementation:**
```go
type DeadLetterQueue struct {
    jobs chan FailedJob
}

type FailedJob struct {
    Job      Job
    Error    error
    Attempts int
    Time     time.Time
}

func (dlq *DeadLetterQueue) Enqueue(job Job, err error, attempts int) {
    dlq.jobs <- FailedJob{
        Job:      job,
        Error:    err,
        Attempts: attempts,
        Time:     time.Now(),
    }
}
```

---

## Monitoring

### Job Metrics

**Metrics to Track:**
- Job execution time
- Job success/failure rate
- Queue depth (number of pending jobs)
- Worker utilization

**Prometheus Metrics (Future):**
```go
import "github.com/prometheus/client_golang/prometheus"

var (
    jobDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "job_duration_seconds",
            Help: "Job execution duration in seconds",
        },
        []string{"job_type"},
    )

    jobSuccess = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "job_success_total",
            Help: "Total number of successful jobs",
        },
        []string{"job_type"},
    )

    jobFailure = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "job_failure_total",
            Help: "Total number of failed jobs",
        },
        []string{"job_type"},
    )
)
```

### Logging

**Job Execution Logs:**
```go
func (j *JobQueue) worker(ctx context.Context) {
    defer j.wg.Done()

    for {
        select {
        case job := <-q.jobs:
            start := time.Now()
            log.Printf("Starting job: %T", job)

            if err := job.Execute(ctx); err != nil {
                duration := time.Since(start)
                log.Printf("Job failed after %v: %T - %v", duration, job, err)
            } else {
                duration := time.Since(start)
                log.Printf("Job completed successfully in %v: %T", duration, job)
            }
        case <-ctx.Done():
            return
        }
    }
}
```

---

## References

- [Backend Technical Design](./README.md) - Backend architecture overview
- [Go Concurrency Patterns](https://go.dev/doc/effective_go#concurrency) - Go concurrency documentation
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html) - Message broker documentation
- [Kafka Documentation](https://kafka.apache.org/documentation/) - Event streaming documentation
