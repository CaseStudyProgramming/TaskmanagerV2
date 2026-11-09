# Backend Testing Strategy (Rust)

**Version**: 1.0
**Date**: 2026-11-10
**Status**: Draft

---

## Overview

This document defines the testing strategy for Rust backend, including when to use mocking vs integration testing, testing pyramid, and pragmatic guidelines based on senior developer best practices for Rust-specific environments.

---

## Technology Stack

| Tool | Purpose | Environment |
|------|---------|-------------|
| **rustfmt** | Code formatter | Rust compiler |
| **clippy** | Linter | Rust compiler |
| **cargo test** | Test runner (built-in) | Rust compiler |
| **tokio-test** | Async runtime testing | Async environment |
| **mockall** | Mocking library | Unit tests |
| **proptest** | Property-based testing | Unit tests |
| **testcontainers-rs** | Container-based testing | Integration tests |

---

## Testing Pyramid for Rust

```
         E2E Tests (10%)
        /\
       /  \      Playwright (via frontend)
      /----\     - Real browser + API
     /      \    - Critical user flows
    /        \   - Slow, expensive
   /----------\
  /  Integration \   Integration Tests (30%)
 /  Tests (30%)\  - Testcontainers + PostgreSQL
/----------------\ - Real database, cache
| Unit Tests (60%)|
| (cargo test)   | - Business logic
| (Modules)      | - Functions
| (Structs)      | - Traits
\----------------/ - Fast, isolated
```

---

## Testing Types

### 1. Unit Tests (cargo test)

**Purpose:** Test functions, structs, traits, and modules in isolation

**Scope:**
- Pure functions (data transformation, validation)
- Struct methods (business logic)
- Trait implementations
- Module-level logic

**When to Use:**
- Pure functions without side effects
- Business logic independent of I/O
- Struct methods and trait implementations
- Data transformation logic

### 2. Integration Tests (testcontainers-rs)

**Purpose:** Test against real external services (database, cache, etc.)

**Scope:**
- Database operations (SQL queries, migrations)
- Cache operations (Redis)
- API endpoints (HTTP handlers)
- Database repositories

**When to Use:**
- Database operations (SQL queries, constraints)
- Cache operations (Redis)
- HTTP handlers (with real HTTP server)
- Repository layer tests

### 3. Async Tests (tokio-test)

**Purpose:** Test async functions and futures

**Scope:**
- Async HTTP clients
- Async database operations
- Async message queue operations
- Async web handlers

**When to Use:**
- Async functions (tokio runtime)
- HTTP handlers (axum, actix-web, etc.)
- Async database operations
- WebSocket handlers

---

## Rust-Specific Testing Patterns

### 1. Property-Based Testing (proptest)

**Purpose:** Test with automatically generated inputs to find edge cases

**When to Use:**
- Complex validation logic
- Data transformation functions
- Algorithms with many edge cases
- Functions with multiple input combinations

### 2. Mocking with mockall

**Purpose:** Mock trait implementations for isolated testing

**When to Use:**
- External service dependencies (payment, email)
- Complex business logic isolation
- Expensive operations (slow database queries)

### 3. Testcontainers Integration

**Purpose:** Spin up real containers for integration testing

**When to Use:**
- Database integration tests (PostgreSQL, MySQL)
- Cache integration tests (Redis)
- Message queue tests (RabbitMQ, Kafka)
- Service-to-service communication

---

## Rule of Thumb dari Senior Dev

### 1. External API yang Mahal/Lambat/Unpredictable → MOCK

Gunakan mocking untuk external dependencies yang:
- Memiliki cost per call (payment gateways, SMS services)
- Lambat dengan network latency (seconds+)
- Hasil unpredictable (weather, stocks, news)
- Rate-limited atau tidak bisa di-test di development

**Contoh:**
- Payment gateways (Stripe, PayPal)
- Email services (SendGrid, AWS SES)
- SMS services (Twilio)
- Third-party APIs (weather, stocks, cryptocurrency)

### 2. Internal Systems yang Mudah di-Test → INTEGRATION TEST

Gunakan integration test untuk internal systems yang:
- Tidak memiliki cost (database, cache)
- Setup mudah (testcontainers)
- Terisolasi dari production
- Realistis dan men-catch lebih banyak bugs

**Contoh:**
- Database (PostgreSQL, MySQL) → testcontainers
- Cache (Redis, Memcached) → testcontainers
- Message queue (RabbitMQ, Kafka) → testcontainers
- Internal HTTP services → warp/axum testing

### 3. Complex Business Logic → UNIT TEST DENGAN MOCK (Opsional)

Gunakan unit test dengan mocking untuk:
- Scoring algorithms (priority calculation, recommendation engine)
- Complex validation (multi-field validation, business rules)
- State machines (workflow, approval process)
- Logika yang butuh isolasi dari dependencies

**TAPI:** Integration test juga acceptable jika setup mudah dan tidak terlalu lambat.

### 4. Simple CRUD → INTEGRATION TEST

Gunakan integration test untuk:
- Create, Read, Update, Delete operations
- Repository layer
- Service layer dengan simple logic
- Tidak perlu mock database atau cache

---

## Decision Framework

| Pertanyaan | Jawaban YA (Mock) | Jawaban TIDAK (Integration) |
|-----------|-------------------|----------------------------|
| **External dependency?** | ✅ (API, payment, email) | ❌ (Database, cache) |
| **Cost money per call?** | ✅ | ❌ |
| **Unpredictable results?** | ✅ (Weather, stocks) | ❌ |
| **Slow network latency?** | ✅ (seconds+) | ❌ (ms) |
| **Internal system?** | ❌ | ✅ (Database, cache) |
| **Setup mudah?** | ❌ | ✅ (testcontainers) |
| **Complex business logic?** | ✅ (isolasi logic) | ❌ (simple CRUD) |
| **Critical security?** | ✅ (payment, auth) | ❌ |

---

## Anti-Patterns yang Dihindari

### 1. Over-mocking
- ❌ Mock semua dependencies (repository, cache, logger, metrics, validator)
- ✅ Mock hanya external dependencies yang perlu

### 2. Mocking database
- ❌ Mock database untuk test repository layer
- ✅ Integration test dengan testcontainers (real database)

### 3. Mocking simple HTTP calls
- ❌ Mock HTTP client untuk internal services
- ✅ Integration test dengan warp/axum testing utilities

### 4. 100% unit test coverage
- ❌ Kejar 100% coverage dengan mocking berlebihan
- ✅ Fokus critical paths dengan integration test yang realistis

---

## Pragmatic Approach untuk Task Manager

### Testing Strategy
- **Unit test:** Minimal, hanya untuk complex business logic (opsional)
- **Integration test:** Primary, pakai testcontainers untuk database dan cache
- **E2E test:** Critical user flows dengan Playwright
- **Mocking:** Hanya jika nanti ada external dependencies (payment, email, SMS)

### Current Stack
- **Database:** PostgreSQL → Integration test dengan testcontainers
- **Cache:** Redis → Integration test dengan testcontainers
- **External API:** Google OAuth → Integration test (acceptable)
- **Business logic:** Priority scoring → Integration test (acceptable)

### Exceptions (Future Features)
- **Payment gateway** (premium features) → Mock
- **Email notifications** (reminder features) → Mock
- **Third-party API integrations** → Mock

---

## Quality Standards

### Test Coverage Requirements

#### Unit Tests: Hierarchical Coverage Thresholds
- **Critical files** (business logic, services, entities, helpers): >=93% (blocks CI)
- **Important files** (API handlers, repositories): >=85% (warning)
- **Overall baseline**: >=85% (warning)

#### Integration Tests: Critical Paths
- Repository layer: Database operations, SQL queries
- Service layer: Business logic with real dependencies
- API handlers: HTTP endpoints with real database

#### E2E Tests: User Journeys
- Critical user flows (login, create task, delete task)
- Cross-component interactions
- Browser compatibility

#### Security Tests: OWASP Top 10
- SQL injection prevention
- XSS protection
- CSRF protection
- Authentication and authorization

### Performance Requirements
- Unit tests: < 100ms per test
- Integration tests: < 2s per test
- E2E tests: < 30s per test

---

## Testing Timeline (CI/CD Pipeline)

### Setiap Commit/PR (Fast Feedback Loop)
**Wajib dijalankan sebelum merge:**
- Linting (rustfmt + clippy) → 10-30s
- Unit tests (cargo test) → 30-60s
- Coverage check → 10-20s (blocks jika < threshold)
- Security scan (Snyk) → 30-60s (blocks jika critical vuln)
- Integration tests (testcontainers-rs) → 1-2min
- API tests (warp/axum testing) → Bagian integration tests

**Total:** ~2-4min per PR

### Weekly / Before Release (Deep Analysis)
**Wajib dijalankan sebelum production release:**
- Security deep scan (OWASP ZAP) → 5-10min
- Performance testing (k6) → 5-10min
- Full E2E test suite (via Playwright frontend) → 10-20min
- Dependency audit (cargo audit) → 2-5min

**Total:** ~20-45min per run

### Nightly (jam 12 malam) (Regression Test)
**Automated schedule:**
- Full test suite (unit + integration + E2E) → 15-30min
- Performance regression test → 10-20min
- Security scan → 5-10min

**Total:** ~30-60min per run

---

## Testing Tools

### Backend (Rust)
- **cargo test**: Built-in test runner
- **tokio-test**: Async runtime testing
- **mockall**: Mocking library (optional, pragmatic use)
- **testcontainers-rs**: Container-based integration tests (primary)
- **proptest**: Property-based testing
- **clippy**: Linter
- **rustfmt**: Formatter

### API Testing (Backend Focus)
- **warp/axum testing**: Built-in HTTP testing for Rust frameworks
- **Scope:** Test API endpoints secara langsung (backend responsibility)
- **Kapan:** Setiap commit/PR (bagian integration tests)
- **Purpose:** API contract, HTTP status codes, response validation, error handling

### Security Testing (Backend Focus)
- **OWASP ZAP**: Dynamic application security testing (server-side)
- **Snyk**: Dependency vulnerability scanning
- **cargo audit**: Rust dependency auditing
- **Scope:** Server-side vulnerabilities (SQL injection, auth, server-side validation)
- **Kapan:** PR / weekly / nightly
- **Purpose:** Server-side security vulnerabilities

### Performance Testing (Backend Focus)
- **k6**: Load testing and performance monitoring
- **wrk**: HTTP benchmarking tool
- **Criterion**: Rust benchmarking library
- **Scope:** API response time, throughput, load handling, server performance
- **Kapan:** PR / weekly / before release
- **Purpose:** Server-side performance metrics (API response time < 200ms p95)

---

## Future Backend Frameworks (Rust)

### Actix-Web
- Testing utilities built-in
- TestRequest, TestResponse helpers
- Integration testing support

### Axum
- Tower service testing
- oneshot for HTTP requests
- Custom test layers

### Rocket
- Local client for testing
- Request/response mocking
- Fairing testing

---

## References

- [Backend Technical Design](./README.md) - Backend architecture and patterns
- [Backend Testing Strategy (Go)](./testing-strategy-go.md) - Go testing guidelines (for comparison)
- [Frontend Testing Strategy (SvelteKit/Next.js/Nuxt)](../frontend-spec/testing-strategy-sveltekit.md) - Frontend testing guidelines
- [Dependency Versions](../architecture/dependencies.md) - Testing tools and versions
- [Rust Testing Book](https://doc.rust-lang.org/book/ch11-00-testing.html) - Official Rust testing guide
- [Tokio Testing](https://tokio.rs/tokio/topics/testing) - Async testing in Rust
- [Testcontainers Rust](https://testcontainers.org/) - Container-based testing
