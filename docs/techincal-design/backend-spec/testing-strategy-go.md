# Backend Testing Strategy (Go)

**Version**: 1.0
**Date**: 2026-11-10
**Status**: Draft

---

## Overview

This document defines the testing strategy for the Go backend, including when to use mocking vs integration testing, testing pyramid, and pragmatic guidelines based on senior developer best practices for Go-specific environments.

---

## Rule of Thumb dari Senior Dev

Berikut adalah rule of thumb untuk menentukan kapan harus pakai mocking vs integration test:

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
- Setup mudah (Neon branch, testcontainers)
- Terisolasi dari production
- Realistis dan men-catch lebih banyak bugs

**Contoh:**
- Database (PostgreSQL, MySQL) → Neon testing branch
- Cache (Redis, Memcached) → Redis testing instance
- Message queue (RabbitMQ, Kafka) → Testcontainers
- Internal HTTP services → httptest

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
| **Setup mudah?** | ❌ | ✅ (Neon branch, testcontainers) |
| **Complex business logic?** | ✅ (isolasi logic) | ❌ (simple CRUD) |
| **Critical security?** | ✅ (payment, auth) | ❌ |

---

## Testing Pyramid untuk Project Ini

```
         E2E Tests (10%)
        /\
       /  \      Playwright (Frontend)
      /----\     - Real browser + API
     /      \    - Critical user flows
    /        \   - Slow, expensive
   /----------\
  /  Integration \   Integration Tests (30%)
 /  Tests (30%)\  - Neon testing branch
/----------------\ - Real database, cache
| Unit Tests (60%)|
| (Pragmatic)    | - Business logic
| (Optional)     | - External dependencies
\----------------/ - Fast, isolated
```

---

## Testing Tools Purpose

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **testify** | Assertions untuk unit/integration tests | All tests (Go) |
| **golang/mock** | Strict interface mocking (code generation) | Optional: jika butuh strict mocking |
| **testcontainers-go** | Container-based integration tests | Alternative to Neon branch |
| **Neon testing branch** | Real database for integration tests | Primary: repository & service tests |
| **Vitest** | Unit testing framework (TypeScript) | Frontend unit tests |
| **Playwright** | E2E testing framework (TypeScript) | Frontend E2E tests |

---

## Anti-Patterns yang Dihindari

### 1. Over-mocking
- ❌ Mock semua dependencies (repository, cache, logger, metrics, validator)
- ✅ Mock hanya external dependencies yang perlu

### 2. Mocking database
- ❌ Mock database untuk test repository layer
- ✅ Integration test dengan real database (Neon branch)

### 3. Mocking simple HTTP calls
- ❌ Mock HTTP client untuk internal services
- ✅ Integration test dengan httptest atau real HTTP server

### 4. 100% unit test coverage
- ❌ Kejar 100% coverage dengan mocking berlebihan
- ✅ Fokus critical paths dengan integration test yang realistis

---

## Pragmatic Approach untuk Task Manager

### Testing Strategy
- **Unit test:** Minimal, hanya untuk complex business logic (opsional)
- **Integration test:** Primary, pakai Neon testing branch untuk database dan cache
- **E2E test:** Critical user flows dengan Playwright
- **Mocking:** Hanya jika nanti ada external dependencies (payment, email, SMS)

### Current Stack
- **Database:** Neon PostgreSQL → Integration test dengan Neon testing branch
- **Cache:** Upstash Redis → Integration test dengan Redis testing instance
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
- Linting (gofmt + golangci-lint) → 10-30s
- Unit tests (cargo test) → 30-60s
- Coverage check → 10-20s (blocks jika < threshold)
- Security scan (Snyk) → 30-60s (blocks jika critical vuln)
- Integration tests (testcontainers/Neon branch) → 1-2min
- API tests (httpexpect/httptest) → Bagian integration tests

**Total:** ~2-4min per PR

### Weekly / Before Release (Deep Analysis)
**Wajib dijalankan sebelum production release:**
- Security deep scan (OWASP ZAP) → 5-10min
- Performance testing (k6) → 5-10min
- Full E2E test suite (via Playwright frontend) → 10-20min
- Dependency audit (gosec) → 2-5min

**Total:** ~20-45min per run

### Nightly (jam 12 malam) (Regression Test)
**Automated schedule:**
- Full test suite (unit + integration + E2E) → 15-30min
- Performance regression test → 10-20min
- Security scan → 5-10min

**Total:** ~30-60min per run

---

## Testing Tools

### Backend (Go)
- **testify**: Assertions for unit/integration tests
- **golang/mock**: Interface mocking (optional, pragmatic use)
- **testcontainers-go**: Container-based integration tests (alternative to Neon branch)
- **Neon testing branch**: Real database for integration tests (primary)

### API Testing (Backend Focus)
- **httpexpect**: HTTP assertion library for Go
- **httptest**: Built-in HTTP testing for Go
- **Scope:** Test API endpoints secara langsung (backend responsibility)
- **Kapan:** Setiap commit/PR (bagian integration tests)
- **Purpose:** API contract, HTTP status codes, response validation, error handling

### Security Testing (Backend Focus)
- **OWASP ZAP**: Dynamic application security testing (server-side)
- **Snyk**: Dependency vulnerability scanning
- **gosec**: Go security checker
- **Scope:** Server-side vulnerabilities (SQL injection, auth, server-side validation)
- **Kapan:** PR / weekly / nightly
- **Purpose:** Server-side security vulnerabilities

### Performance Testing (Backend Focus)
- **k6**: Load testing and performance monitoring
- **wrk**: HTTP benchmarking tool
- **Go pprof**: Go performance profiling
- **Scope:** API response time, throughput, load handling, server performance
- **Kapan:** PR / weekly / before release
- **Purpose:** Server-side performance metrics (API response time < 200ms p95)

---

## References

- [Backend Technical Design](./README.md) - Backend architecture and patterns
- [Database Schema](./database-schema.md) - Database design for integration tests
- [Dependency Versions](../architecture/dependencies.md) - Testing tools and versions
- [Go Testing Best Practices](https://go.dev/doc/tutorial/add-a-test) - Official Go testing guide
