# Backend Testing Strategy (Bun/Node.js/TypeScript)

**Version**: 1.0
**Date**: 2026-11-10
**Status**: Draft

---

## Overview

This document defines the testing strategy for Bun/Node.js/TypeScript backend (including frameworks like NestJS, ElysiaJS, Hono, etc.), including when to use mocking vs integration testing, testing pyramid, and pragmatic guidelines based on senior developer best practices for JavaScript/TypeScript server environments.

---

## Technology Stack

| Tool | Purpose | Environment |
|------|---------|-------------|
| **Biome** | Linter, formatter, bundler | Bun/Node.js runtime |
| **Vitest** | Unit testing framework | Bun/Node.js runtime |
| **Jest** | Alternative unit testing framework | Node.js runtime |
| **Supertest** | HTTP assertion library | API testing |
| **testcontainers-node** | Container-based testing | Integration tests |
| **mocked or msw** | HTTP mocking | API mocking |

---

## Testing Pyramid for Bun/Node.js

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
| (Vitest/Jest)  | - Business logic
| (Services)     | - Controllers
| (Utilities)    | - DTOs
\----------------/ - Fast, isolated
```

---

## Testing Types

### 1. Unit Tests (Vitest/Jest)

**Purpose:** Test services, controllers, utilities, DTOs in isolation

**Scope:**
- Service layer (business logic)
- Controller logic (validation, transformation)
- Utilities and helpers
- DTOs and mappers

**When to Use:**
- Pure functions without side effects
- Business logic independent of I/O
- Service methods and controller logic
- Data transformation logic

### 2. Integration Tests (testcontainers-node)

**Purpose:** Test against real external services (database, cache, etc.)

**Scope:**
- Database operations (SQL queries, migrations)
- Cache operations (Redis)
- API endpoints (HTTP handlers)
- Repository layer

**When to Use:**
- Database operations (SQL queries, constraints)
- Cache operations (Redis)
- HTTP handlers (with real HTTP server)
- Repository layer tests

### 3. API Tests (Supertest)

**Purpose:** Test HTTP endpoints with assertions

**Scope:**
- API endpoint responses
- HTTP status codes
- Response validation
- Error handling

**When to Use:**
- API endpoint testing
- HTTP request/response validation
- Error handling tests
- API contract testing

---

## Framework-Specific Testing

### NestJS Testing

**Testing Modules:**
- Test modules with `Test.createTestingModule()`
- Mock providers with custom providers
- Test controllers and services
- Use NestJS testing utilities

### ElysiaJS Testing

**Testing with Bun Test:**
- Use Bun's built-in test runner
- Test Elysia routes
- Mock database connections
- Use Elysia's testing utilities

### Hono Testing

**Testing with Bun Test:**
- Use Hono's testing utilities
- Test routes and middleware
- Mock context and requests
- Use `@hono/testing` package

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
- Internal HTTP services → Supertest/HTTP server

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
- ✅ Integration test dengan Supertest atau real HTTP server

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
- Linting (Biome) → 10-30s
- Unit tests (Vitest/Jest) → 30-60s
- Coverage check → 10-20s (blocks jika < threshold)
- Security scan (Snyk) → 30-60s (blocks jika critical vuln)
- Integration tests (testcontainers-node) → 1-2min
- API tests (Supertest) → Bagian integration tests

**Total:** ~2-4min per PR

### Weekly / Before Release (Deep Analysis)
**Wajib dijalankan sebelum production release:**
- Security deep scan (OWASP ZAP) → 5-10min
- Performance testing (k6) → 5-10min
- Full E2E test suite (via Playwright frontend) → 10-20min
- Dependency audit (npm audit / bun audit) → 2-5min

**Total:** ~20-45min per run

### Nightly (jam 12 malam) (Regression Test)
**Automated schedule:**
- Full test suite (unit + integration + E2E) → 15-30min
- Performance regression test → 10-20min
- Security scan → 5-10min

**Total:** ~30-60min per run

---

## Testing Tools

### Backend (Bun/Node.js/TypeScript)
- **Vitest**: Unit testing framework (primary for Bun)
- **Jest**: Alternative unit testing framework (Node.js)
- **Supertest**: HTTP assertion library for API testing
- **testcontainers-node**: Container-based integration tests (primary)
- **Biome**: Linter and formatter
- **mocked or msw**: HTTP mocking (optional, pragmatic use)

### API Testing (Backend Focus)
- **Supertest**: HTTP assertion library for API testing
- **Scope:** Test API endpoints secara langsung (backend responsibility)
- **Kapan:** Setiap commit/PR (bagian integration tests)
- **Purpose:** API contract, HTTP status codes, response validation, error handling

### Security Testing (Backend Focus)
- **OWASP ZAP**: Dynamic application security testing (server-side)
- **Snyk**: Dependency vulnerability scanning
- **npm audit**: Node.js dependency auditing
- **bun audit**: Bun dependency auditing
- **Scope:** Server-side vulnerabilities (SQL injection, auth, server-side validation)
- **Kapan:** PR / weekly / nightly
- **Purpose:** Server-side security vulnerabilities

### Performance Testing (Backend Focus)
- **k6**: Load testing and performance monitoring
- **wrk**: HTTP benchmarking tool
- **Scope:** API response time, throughput, load handling, server performance
- **Kapan:** PR / weekly / before release
- **Purpose:** Server-side performance metrics (API response time < 200ms p95)

---

## Future Backend Frameworks (Bun/Node.js)

### NestJS
- Built-in testing utilities
- Test modules and providers
- Controller and service testing
- E2E testing support

### ElysiaJS
- Bun test integration
- Route testing utilities
- Mock support
- Type-safe testing

### Hono
- @hono/testing package
- Route and middleware testing
- Request/response mocking
- Cloudflare Workers testing

---

## References

- [Backend Technical Design](./README.md) - Backend architecture and patterns
- [Backend Testing Strategy (Go)](./testing-strategy-go.md) - Go testing guidelines (for comparison)
- [Backend Testing Strategy (Rust)](./testing-strategy-rust.md) - Rust testing guidelines (for comparison)
- [Frontend Testing Strategy (SvelteKit/Next.js/Nuxt)](../frontend-spec/testing-strategy-sveltekit.md) - Frontend testing guidelines
- [Dependency Versions](../architecture/dependencies.md) - Testing tools and versions
- [Vitest Documentation](https://vitest.dev/) - Unit testing framework
- [Jest Documentation](https://jestjs.io/) - Alternative unit testing framework
- [Testcontainers Node](https://testcontainers.org/) - Container-based testing
