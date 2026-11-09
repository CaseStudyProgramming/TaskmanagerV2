# Backend Technical Design

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the backend technical design, technology stack, architecture patterns, and coding standards for the Advanced Task Manager project.

## Architecture Decision Records

See [backend-spec/adr/README.md](./adr/README.md) for backend-specific ADRs.

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

### Code Examples

For complete implementation examples, refer to the specific service design documents and database schema documentation.

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

For complete HTTP status codes and error codes, refer to [Error Codes](../api-specs/error-codes.md).

### Standard Response Format

All API responses MUST follow the standard response format defined in [API Specifications](../api-specs/standard-response-format.md).

For implementation examples, see:
- [Go Response Helper](../examples/api-implementation/go-response-helper.go)
- [TypeScript Response Helper](../examples/api-implementation/typescript-response-helper.ts)

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

Container configuration follows standard practices with Podman for production deployment.

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_OAUTH_CLIENT_SECRET`: Google OAuth client secret
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (default: 8080)

---

## References

- [Backend DDD Architecture](../tdd/architecture/backend-ddd.md) - Detailed DDD implementation
- [Database Schema](./database-schema.md) - Database design and migrations
- [Background Jobs](./background-jobs.md) - Async processing and cron jobs
- [API Specifications](../api-specs/openapi.yaml) - Complete API contract
- [Backend Quality & Reliability](../tdd/quality-reliability/backend-quality-reliability.md) - Quality requirements
