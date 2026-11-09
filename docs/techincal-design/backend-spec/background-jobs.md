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
- Job interface with Execute method
- JobQueue struct with buffered channel and wait group
- Worker goroutines process jobs from channel
- Context-based shutdown
- Enqueue method for adding jobs
- Stop method for graceful shutdown

### Job Types

#### Priority Score Recalculation

**Purpose:** Recalculate priority scores for tasks based on due date proximity, task age, and completion patterns.

**Schedule:** Daily at 2:00 AM UTC

**Implementation:**
- Retrieve all active tasks from repository
- Calculate priority score based on due date proximity, task age, and priority weight
- Update tasks with new scores
- Log failures for individual task updates

#### Session Cleanup

**Purpose:** Delete expired sessions from the database.

**Schedule:** Hourly

**Implementation:**
- Get current timestamp
- Delete sessions with expires_at less than current timestamp
- Return error if deletion fails

#### Cache Warmup

**Purpose:** Pre-populate cache with frequently accessed data.

**Schedule:** On application startup

**Implementation:**
- Retrieve frequently accessed tasks (limit 100)
- Cache each task with appropriate TTL
- Return error if retrieval or caching fails

---

## Cron Schedules

### Cron Implementation

**Package:** github.com/robfig/cron/v3

**Configuration:**
- Create cron scheduler with seconds precision
- Add job functions with cron expressions
- Start scheduler in application initialization
- Scheduler runs in background goroutine

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
- Connection and channel management
- Queue declaration with durability
- Message publishing with context
- Message consumption with manual acknowledgment
- Error handling for connection failures

### Kafka Integration (Future)

**When to implement:**
- High-throughput event streaming
- Need event replay capability
- Multiple consumers for same events
- Real-time data processing

**Kafka Configuration:**
- Writer configuration with topic and balancer
- Reader configuration with group ID and byte limits
- Message publishing with context
- Message consumption with error handling

---

## Error Handling

### Job Retry Strategy

**Retry Configuration:**
- Max retries count
- Retry interval duration
- Exponential backoff factor
- Execute job with retry loop
- Log retry attempts with wait time
- Return final error after max retries

### Dead Letter Queue (Future)

**When to implement:**
- Jobs fail repeatedly after retries
- Need to investigate failed jobs
- Need manual intervention

**Dead Letter Queue Implementation:**
- FailedJob struct with job, error, attempts, and timestamp
- Channel-based queue for failed jobs
- Enqueue method for adding failed jobs
- Monitor and process failed jobs manually

---

## Monitoring

### Job Metrics

**Metrics to Track:**
- Job execution time
- Job success/failure rate
- Queue depth (number of pending jobs)
- Worker utilization

**Prometheus Metrics (Future):**
- Histogram for job duration by job type
- Counter for successful jobs by job type
- Counter for failed jobs by job type
- Labels for job type categorization

### Logging

**Job Execution Logs:**
- Log job start with job type
- Track execution duration
- Log success or failure with duration
- Log error details on failure
- Log job type for troubleshooting

---

## References

- [Backend Technical Design](./README.md) - Backend architecture overview
- [Go Concurrency Patterns](https://go.dev/doc/effective_go#concurrency) - Go concurrency documentation
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html) - Message broker documentation
- [Kafka Documentation](https://kafka.apache.org/documentation/) - Event streaming documentation
