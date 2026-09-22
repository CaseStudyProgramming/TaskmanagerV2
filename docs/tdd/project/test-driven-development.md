# Test-Driven Development Guidelines
## Advanced Task Manager

**Version**: 1.0  
**Date**: 2025-09-18  
**Status**: Draft

---

## 1. Testing Philosophy

### 1.1 Core Principles
- **Test First**: Write tests before implementation when possible
- **Red-Green-Refactor**: Follow the TDD cycle
- **Fast Feedback**: Tests should run quickly
- **Isolation**: Tests should be independent
- **Clarity**: Test names should describe behavior
- **Maintainability**: Tests should be easy to understand and modify

### 1.2 Testing Pyramid
```
        ┌──────────────┐
        │   E2E Tests  │  (10% - Critical user journeys)
        ├──────────────┤
        │Integration   │  (20% - API endpoints, services)
        ├──────────────┤
        │  Unit Tests  │  (70% - Functions, components)
        └──────────────┘
```

### 1.3 Quality Standards
- **Unit Test Coverage**: Hierarchical thresholds (critical >=93%, overall >=85%)
- **Integration Test Coverage**: Critical paths 100%
- **E2E Test Coverage**: Main user flows 100%
- **Build Status**: Must pass all checks
- **Type Check**: Zero errors
- **Lint Check**: Zero warnings
- **Format Check**: Zero formatting issues
- **Database Testing**: Must use `taskmanager_db_testing` database

---

## 2. Testing Stack

### 2.1 Frontend Testing

#### Unit & Component Testing
- **Framework**: Vitest
- **Component Testing**: @testing-library/svelte
- **Assertions**: @testing-library/jest-dom
- **Mocking**: Vitest built-in mocking
- **Coverage**: c8 or vitest coverage

#### E2E Testing
- **Framework**: Playwright
- **Assertions**: Playwright built-in
- **Visual Regression**: Playwright screenshots
- **Parallel Execution**: Playwright workers

#### Type Checking
- **Tool**: TypeScript (strict mode)
- **Config**: tsconfig.json strict mode enabled

#### Linting & Formatting
- **Linting**: Biome.js (eslint replacement)
- **Formatting**: Biome.js (prettier replacement)
- **Config**: biome.json

### 2.2 Backend Testing

#### Unit Testing
- **Framework**: Go testing package
- **Assertions**: Testify
- **Mocking**: Testify/mock, gomock
- **Coverage**: go test -cover

#### Integration Testing
- **Framework**: Go testing package
- **Database**: testcontainers-go or docker-compose
- **HTTP Server**: httptest package
- **Assertions**: Testify

#### API Contract Testing
- **Tool**: oapi-codegen generated types
- **Validation**: OpenAPI specification compliance
- **Schema Validation**: JSON Schema validation

#### Linting & Formatting
- **Linting**: golangci-lint
- **Formatting**: gofmt
- **Static Analysis**: go vet, staticcheck

### 2.3 Security Testing
- **Tool**: OWASP ZAP
- **Dependency Scanning**: Snyk or bun audit
- **Secret Scanning**: gitleaks
- **SAST**: SonarQube (optional)

### 2.4 Performance Testing
- **Load Testing**: k6 (API performance, throughput, concurrent users)
- **Frontend Performance**: Lighthouse CI (Chrome-based, FCP, LCP, CLS, bundle size)
- **API Performance**: Apache Bench (ab) or wrk

---

## 3. Test Structure & Organization

### 3.1 Frontend Structure (FSD + Vertical Slices)
```
src/
├── app/
│   ├── providers/
│   │   ├── auth-provider.ts
│   │   └── auth-provider.spec.ts        # Provider tests
│   ├── routes/
│   │   └── routes.ts
│   └── styles/
│       └── global.css
├── pages/
│   ├── home/
│   │   ├── ui/
│   │   │   └── HomePage.svelte
│   │   ├── HomePage.spec.ts             # Page component tests
│   │   └── index.ts
│   ├── auth/
│   │   ├── login/
│   │   │   ├── ui/
│   │   │   │   └── LoginPage.svelte
│   │   │   ├── LoginPage.spec.ts
│   │   │   └── index.ts
│   │   └── callback/
│   │       ├── ui/
│   │       │   └── CallbackPage.svelte
│   │       ├── CallbackPage.spec.ts
│   │       └── index.ts
│   └── tasks/
│       ├── list/
│       │   ├── ui/
│       │   │   └── TaskListPage.svelte
│       │   ├── TaskListPage.spec.ts
│       │   └── index.ts
│       └── detail/
│           ├── ui/
│           │   └── TaskDetailPage.svelte
│           ├── TaskDetailPage.spec.ts
│           └── index.ts
├── features/
│   ├── task-create/
│   │   ├── model/
│   │   │   ├── task-create.model.ts
│   │   │   └── task-create.model.spec.ts  # Feature model tests
│   │   ├── api/
│   │   │   ├── task-create.api.ts
│   │   │   └── task-create.api.spec.ts    # Feature API tests
│   │   └── ui/
│   │       ├── TaskCreateForm.svelte
│   │       └── TaskCreateForm.spec.ts     # Feature UI tests
│   ├── task-edit/
│   │   ├── model/
│   │   │   ├── task-edit.model.ts
│   │   │   └── task-edit.model.spec.ts
│   │   ├── api/
│   │   │   ├── task-edit.api.ts
│   │   │   └── task-edit.api.spec.ts
│   │   └── ui/
│   │       ├── TaskEditForm.svelte
│   │       └── TaskEditForm.spec.ts
│   ├── task-delete/
│   │   ├── model/
│   │   │   ├── task-delete.model.ts
│   │   │   └── task-delete.model.spec.ts
│   │   ├── api/
│   │   │   ├── task-delete.api.ts
│   │   │   └── task-delete.api.spec.ts
│   │   └── ui/
│   │       ├── TaskDeleteButton.svelte
│   │       └── TaskDeleteButton.spec.ts
│   ├── task-filter/
│   │   ├── model/
│   │   │   ├── task-filter.model.ts
│   │   │   └── task-filter.model.spec.ts
│   │   ├── api/
│   │   │   ├── task-filter.api.ts
│   │   │   └── task-filter.api.spec.ts
│   │   └── ui/
│   │       ├── TaskFilterPanel.svelte
│   │       └── TaskFilterPanel.spec.ts
│   ├── task-prioritize/
│   │   ├── model/
│   │   │   ├── priority-calculator.ts
│   │   │   └── priority-calculator.spec.ts  # Priority algorithm tests
│   │   ├── api/
│   │   │   ├── task-prioritize.api.ts
│   │   │   └── task-prioritize.api.spec.ts
│   │   └── ui/
│   │       ├── PriorityBadge.svelte
│   │       └── PriorityBadge.spec.ts
│   ├── auth-google/
│   │   ├── model/
│   │   │   ├── google-auth.model.ts
│   │   │   └── google-auth.model.spec.ts
│   │   ├── api/
│   │   │   ├── google-auth.api.ts
│   │   │   └── google-auth.api.spec.ts
│   │   └── ui/
│   │       ├── GoogleLoginButton.svelte
│   │       └── GoogleLoginButton.spec.ts
│   ├── export-import/
│   │   ├── model/
│   │   │   ├── export-import.model.ts
│   │   │   └── export-import.model.spec.ts
│   │   ├── api/
│   │   │   ├── export-import.api.ts
│   │   │   └── export-import.api.spec.ts
│   │   └── ui/
│   │       ├── ExportButton.svelte
│   │       ├── ExportButton.spec.ts
│   │       ├── ImportButton.svelte
│   │       └── ImportButton.spec.ts
│   └── offline-sync/
│       ├── model/
│       │   ├── sync-queue.model.ts
│       │   └── sync-queue.model.spec.ts    # Sync logic tests
│       ├── api/
│       │   ├── offline-sync.api.ts
│       │   └── offline-sync.api.spec.ts
│       └── ui/
│           ├── OfflineIndicator.svelte
│           └── OfflineIndicator.spec.ts
├── entities/
│   ├── task/
│   │   ├── model/
│   │   │   ├── task.ts
│   │   │   └── task.spec.ts                # Entity tests
│   │   └── lib/
│   │       ├── task-utils.ts
│   │       └── task-utils.spec.ts
│   ├── user/
│   │   ├── model/
│   │   │   ├── user.ts
│   │   │   └── user.spec.ts
│   │   └── lib/
│   │       ├── user-utils.ts
│   │       └── user-utils.spec.ts
│   └── auth/
│       ├── model/
│       │   ├── session.ts
│       │   └── session.spec.ts
│       └── lib/
│           ├── auth-utils.ts
│           └── auth-utils.spec.ts
├── shared/
│   ├── api/
│   │   ├── client.ts
│   │   └── client.spec.ts                  # Shared API client tests
│   ├── config/
│   │   ├── config.ts
│   │   └── config.spec.ts
│   ├── lib/
│   │   ├── validation.ts
│   │   ├── validation.spec.ts             # Utility tests
│   │   ├── time-helpers.ts
│   │   ├── time-helpers.spec.ts           # Time helper tests (93%+ mandatory)
│   │   ├── response-helpers.ts
│   │   ├── response-helpers.spec.ts       # Response helper tests (93%+ mandatory)
│   │   └── string-helpers.ts
│   ├── ui/
│   │   ├── Button.svelte
│   │   ├── Button.spec.ts                 # Shared UI component tests
│   │   ├── Input.svelte
│   │   └── Input.spec.ts
│   └── types/
│       └── index.ts
└── widgets/
    ├── task-card/
    │   ├── TaskCard.svelte
    │   └── TaskCard.spec.ts                # Widget tests
    ├── task-list/
    │   ├── TaskList.svelte
    │   └── TaskList.spec.ts
    ├── priority-badge/
    │   ├── PriorityBadge.svelte
    │   └── PriorityBadge.spec.ts
    └── offline-indicator/
        ├── OfflineIndicator.svelte
        └── OfflineIndicator.spec.ts

tests/
├── e2e/
│   ├── auth.spec.ts                        # E2E auth tests
│   ├── tasks.spec.ts                       # E2E task management tests
│   ├── offline.spec.ts                     # E2E offline mode tests
│   └── export-import.spec.ts               # E2E export/import tests
└── fixtures/
    ├── tasks.json
    └── users.json
```

### 3.2 Backend Structure (DDD + Vertical Slices)
```
internal/
├── domain/
│   ├── task/
│   │   ├── entity.go
│   │   ├── entity_test.go              # Domain entity tests
│   │   ├── valueobject.go
│   │   ├── valueobject_test.go         # Value object tests
│   │   ├── repository.go
│   │   └── service.go
│   ├── user/
│   │   ├── entity.go
│   │   ├── entity_test.go
│   │   ├── valueobject.go
│   │   ├── valueobject_test.go
│   │   ├── repository.go
│   │   └── service.go
│   └── auth/
│       ├── entity.go
│       ├── entity_test.go
│       ├── valueobject.go
│       ├── valueobject_test.go
│       ├── repository.go
│       └── service.go
├── application/
│   ├── task/
│   │   ├── command/
│   │   │   ├── create_task.go
│   │   │   ├── create_task_test.go      # Command handler tests
│   │   │   ├── update_task.go
│   │   │   └── update_task_test.go
│   │   ├── query/
│   │   │   ├── get_task.go
│   │   │   ├── get_task_test.go        # Query handler tests
│   │   │   ├── list_tasks.go
│   │   │   └── list_tasks_test.go
│   │   ├── dto/
│   │   └── service.go
│   │   └── service_test.go             # Application service tests
│   ├── user/
│   │   ├── command/
│   │   │   ├── create_user.go
│   │   │   ├── create_user_test.go
│   │   │   └── update_user.go
│   │   ├── query/
│   │   │   ├── get_user.go
│   │   │   └── get_user_test.go
│   │   ├── dto/
│   │   └── service.go
│   │   └── service_test.go
│   └── auth/
│       ├── command/
│       │   ├── login.go
│       │   ├── login_test.go
│       │   └── refresh_token.go
│       ├── query/
│       │   ├── validate_token.go
│       │   └── validate_token_test.go
│       ├── dto/
│       └── service.go
│       └── service_test.go
├── infrastructure/
│   ├── persistence/
│   │   ├── postgresql/
│   │   │   ├── task_repository.go
│   │   │   ├── task_repository_test.go  # Repository implementation tests
│   │   │   ├── user_repository.go
│   │   │   ├── user_repository_test.go
│   │   │   └── auth_repository.go
│   │   └── redis/
│   │       ├── cache_repository.go
│   │       └── cache_repository_test.go
│   ├── external/
│   │   ├── google_oauth.go
│   │   └── google_oauth_test.go         # External service tests
│   └── messaging/
│       └── event_bus.go
└── shared/
    ├── time/
    │   ├── epoch.go
    │   └── epoch_test.go                 # Time helper tests (93%+ mandatory)
    ├── response/
    │   ├── response.go
    │   └── response_test.go             # Response helper tests (93%+ mandatory)
    ├── validation/
    │   ├── validators.go
    │   └── validators_test.go            # Validation helper tests (93%+ mandatory)
    └── utils/
        ├── string.go
        └── string_test.go
└── interfaces/
    ├── http/
    │   ├── task/
    │   │   ├── handler.go
    │   │   ├── handler_test.go          # HTTP handler tests
    │   │   ├── middleware.go
    │   │   └── response.go
    │   ├── user/
    │   │   ├── handler.go
    │   │   ├── handler_test.go
    │   │   ├── middleware.go
    │   │   └── response.go
    │   └── auth/
    │       ├── handler.go
    │       ├── handler_test.go
    │       ├── middleware.go
    │       └── response.go
    └── cli/
        └── commands.go

tests/
├── integration/
│   ├── api_test.go                     # API integration tests
│   ├── database_test.go                # Database integration tests
│   └── auth_flow_test.go               # Auth flow integration tests
└── e2e/
    └── user_flows_test.go              # End-to-end user flow tests
```

### 3.3 Test Naming Conventions

#### Frontend (Vitest)
Use descriptive test names that read like requirements. See examples in [Frontend Testing Examples](../testing/frontend-examples.md).

#### Backend (Go)
Use table-driven tests for multiple scenarios. See examples in [Backend Testing Examples](../testing/backend-examples.md).

---

## 4. Testing Standards

### 4.1 Pre-Commit Checklist

Every commit must pass:
1. ✅ **Format Check**
   - Frontend: `biome check --write`
   - Backend: `gofmt -l .` (should be empty)

2. ✅ **Lint Check**
   - Frontend: `biome check`
   - Backend: `golangci-lint run`

3. ✅ **Type Check**
   - Frontend: `tsc --noEmit`
   - Backend: `go vet ./...`

4. ✅ **Unit Tests**
   - Frontend: `bun run test:unit`
   - Backend: `go test ./... -short`

5. ✅ **Build Check**
   - Frontend: `bun run build`
   - Backend: `go build ./...`

### 4.2 CI/CD Pipeline Checks

Every PR must pass:
1. ✅ All pre-commit checks
2. ✅ **Full Test Suite** (including integration)
   - Frontend: `bun run test:ci`
   - Backend: `go test ./... -cover`
3. ✅ **E2E Tests**
   - `bun run test:e2e`
4. ✅ **Coverage Report**
   - Minimum 80% coverage
5. ✅ **Security Scan**
   - `bun audit` or `snyk test`
6. ✅ **Performance Check**
   - Lighthouse CI (frontend)
   - API response time < 200ms (p95)

### 4.3 Helper Functions Testing Requirements

All helper functions MUST have comprehensive tests with 93%+ coverage (critical category).

#### Required Helper Functions

**Backend (Go):**
- Time helpers: `EpochToTime`, `TimeToEpoch`, `NowEpoch`, `IsValidEpoch`
- Response helpers: `SuccessResponse`, `ErrorResponse`, `PaginatedResponse`
- Validation helpers: `IsValidEmail`, `IsValidUUID`, `SanitizeString`

**Frontend (TypeScript):**
- Time helpers: `epochToDate`, `dateToEpoch`, `nowEpoch`, `formatEpoch`
- Response helpers: `extractData`, `extractError`, `isSuccess`
- Validation helpers: email validation, UUID validation

#### Testing Examples

See detailed testing examples in:
- [Backend Testing Examples](../testing/backend-examples.md)
- [Frontend Testing Examples](../testing/frontend-examples.md)

### 4.4 API Response Format Testing

All API endpoints MUST return responses in the standard format defined in [API Standard Response Format](../api/standard-response-format.md).

#### Required Response Tests

- Response structure validation (status, data, meta fields)
- Status code validation (200, 201, 400, 401, 403, 404, 409, 500)
- Meta field validation (timestamp, request_id)
- Pagination meta validation (for list endpoints)
- Error detail validation (for error responses)

#### Testing Examples

See detailed response format testing examples in:
- [Backend Response Format Tests](../testing/backend-examples.md#response-format-tests)
- [Frontend Response Format Tests](../testing/frontend-examples.md#api-response-format-tests)

### 4.5 Coverage Requirements (Hierarchical Strategy)

#### Coverage Philosophy
**Business quality over coverage numbers.** We use hierarchical thresholds to ensure critical code is well-tested.

#### Coverage Strategy
- **Overall Baseline**: 85% (warning if below, doesn't block)
- **Critical Threshold**: 93% (blocks CI if below - business logic, services, entities, helpers)
- **Important Threshold**: 85% (warning if below - API handlers, repositories, UI components)
- **Excluded Files**: Type definitions, error pages, boilerplate, auto-generated (not counted)

#### Coverage Analysis Process
1. **Run Coverage Report**
2. **Analyze Coverage by File Type** (using coverage_analyzer.py)
3. **Check Hierarchical Thresholds**
4. **Generate Coverage Report**

#### File Type Classification & Thresholds

   | File Type | Coverage Threshold | Enforcement | Action Required |
   |-----------|-------------------|-------------|------------------|
   | **Business Logic** | 93% | Block | **Mandatory** - Add tests to reach 93%+ |
   | **Services/Use Cases** | 93% | Block | **Mandatory** - Add tests to reach 93%+ |
   | **Domain Entities** | 93% | Block | **Mandatory** - Add tests to reach 93%+ |
   | **Value Objects** | 93% | Block | **Mandatory** - Add tests to reach 93%+ |
   | **Utilities/Helpers** | 93% | Block | **Mandatory** - Add tests to reach 93%+ |
   | **API Handlers** | 85% | Warn | Add tests for critical paths |
   | **Repository Implementation** | 80% | Warn | Add integration tests |
   | **Components (UI)** | 80% | Warn | Add component tests |
   | **Middleware** | 75% | Warn | Add tests for security-critical middleware |
   | **Type Definitions** | Exclude | N/A | No tests required (interfaces, types, DTOs) |
   | **Error Pages** | Exclude | N/A | No tests required (404, 500 pages) |
   | **Boilerplate Code** | Exclude | N/A | No tests required (generated code, configs) |
   | **Auto-generated** | Exclude | N/A | No tests required |

#### Coverage Enforcement Logic
```python
if critical_coverage < 93%:
    FAIL_CI  # Block even if overall coverage is good
elif overall_coverage < 85%:
    WARN     # Warning only, don't block
elif important_coverage < 85%:
    WARN     # Warning only, don't block
else:
    PASS
```

#### Coverage Analysis Tool
Use `scripts/coverage_analyzer.py` to analyze coverage by file type:
```bash
python3 scripts/coverage_analyzer.py coverage.out
```

This tool:
- Classifies files by type (critical, important, excluded)
- Calculates coverage per category
- Enforces hierarchical thresholds
- Generates detailed coverage report

#### Coverage Enforcement
- CI/CD pipeline fails if critical coverage < 93% (regardless of overall)
- Pull requests must show coverage by category
- New business logic files must have 93%+ coverage
- Manual review required for excluded files
- Coverage report artifacts saved for analysis

---

## 5. Frontend Testing Guidelines

### 5.1 Component Testing with Testing Library

Component testing should follow Testing Library best practices. See detailed examples in [Frontend Testing Examples](../testing/frontend-examples.md#component-tests).

#### Rules
- Test user behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Avoid testing internal state
- Mock external dependencies
- Test accessibility attributes

### 5.2 Store Testing

Store testing should verify state management logic. See examples in [Frontend Testing Examples](../testing/frontend-examples.md#store-tests).

### 5.3 Utility Function Testing

Utility function testing should cover edge cases and error scenarios. See examples in [Frontend Testing Examples](../testing/frontend-examples.md#utility-function-tests).

### 5.4 API Client Testing

API client testing should mock HTTP requests and responses. See examples in [Frontend Testing Examples](../testing/frontend-examples.md#api-client-tests).

### 5.5 E2E Testing with Playwright

E2E tests should cover critical user journeys. See detailed examples in [Frontend Testing Examples](../testing/frontend-examples.md#e2e-tests).

#### Required E2E Test Scenarios
- User authentication flow (Google OAuth)
- Task CRUD operations
- Task filtering and sorting
- Offline mode functionality
- Export/import functionality
- Priority-based task ordering

---

## 6. Backend Testing Guidelines

### 6.1 Unit Testing

Backend unit tests should follow Go testing best practices. See detailed examples in [Backend Testing Examples](../testing/backend-examples.md).

#### Required Unit Test Categories
- Domain entity tests (entities, value objects)
- Application service tests (commands, queries)
- Repository implementation tests
- HTTP handler tests
- Middleware tests
- Helper function tests (time, response, validation)

### 6.2 Integration Testing

Integration tests should test the interaction between components. See detailed examples in [Backend Testing Examples](../testing/backend-examples.md#integration-tests).

#### Required Integration Test Categories
- API endpoint integration tests
- Database integration tests
- External service integration tests
- Authentication flow integration tests

### 6.3 Testing Patterns

#### Table-Driven Tests
Use table-driven tests for multiple scenarios. See examples in [Backend Testing Examples](../testing/backend-examples.md#table-driven-tests).

#### Mocking
Use Testify for mocking dependencies. See examples in [Backend Testing Examples](../testing/backend-examples.md#mocking-with-testify).

---

## 7. Test Data Management

### 7.1 Fixtures

Use fixtures for consistent test data. See examples in:
- [Frontend Fixtures](../testing/frontend-examples.md#fixtures)
- [Backend Fixtures](../testing/backend-examples.md#fixtures)

### 7.2 Test Database Setup

Test database setup MUST use `taskmanager_db_testing`. See detailed setup in [Backend Testing Examples](../testing/backend-examples.md#test-database-setup).

---

## 8. Testing Database Requirements

### 8.1 Mandatory Database Naming

All testing environments MUST use the following database naming convention:

| Environment | Database Name | Purpose |
|-------------|---------------|---------|
| **Testing** | `taskmanager_db_testing` | **MANDATORY** for all test environments |
| Development | `taskmanager_db_dev` | Local development |
| Production | `taskmanager_db` | Production environment |

### 8.2 Database Verification

Tests must verify they are using the correct database. See implementation in [Backend Testing Examples](../testing/backend-examples.md#test-database-setup).

### 8.3 Environment Configuration

Set the test database name via environment variable. See examples in [GitHub Actions Documentation](../ci-cd/github-actions.md#environment-configuration).

### 8.4 CI/CD Configuration

GitHub Actions configuration for test database. See full configuration in [GitHub Actions Documentation](../ci-cd/github-actions.md).

### 8.5 Connection String Examples

Connection strings for different environments. See examples in [GitHub Actions Documentation](../ci-cd/github-actions.md).

---

## 9. Security Testing

### 9.1 OWASP Top 10 Coverage

Security tests must cover OWASP Top 10 vulnerabilities. See detailed examples in:
- [Backend Security Tests](../testing/backend-examples.md#security-tests)
- [Frontend Security Tests](../testing/frontend-examples.md#security-tests)

#### Required Security Tests
- SQL injection prevention
- XSS protection
- Authentication/authorization
- CSRF protection
- Input validation
- Output encoding

### 9.2 Security Scanning

Security scanning is automated in CI/CD. See configuration in [GitHub Actions Documentation](../ci-cd/github-actions.md#security).

#### Security Tools
- Snyk (dependency scanning)
- bun audit (frontend dependencies)
- gitleaks (secret scanning)
- OWASP ZAP (security scanning)

---

## 10. Performance Testing

### 10.1 Load Testing

Load testing ensures performance under stress. See configuration in [GitHub Actions Documentation](../ci-cd/github-actions.md#performance-testing).

#### Performance Requirements
- API response time < 200ms (p95)
- Page load time < 2 seconds
- Support 10,000 concurrent users

### 10.2 Frontend Performance

Frontend performance is monitored via Lighthouse CI. See configuration in [GitHub Actions Documentation](../ci-cd/github-actions.md#performance-budgets).

---

## 11. CI/CD Integration

CI/CD pipeline configuration and setup. See complete documentation in [GitHub Actions Documentation](../ci-cd/github-actions.md).

### 11.1 Pipeline Stages

#### Pre-Commit Checks (Local)
- Format check (Biome, gofmt)
- Lint check (Biome, golangci-lint)
- Type check (TypeScript, go vet)
- Unit tests (Vitest, Go tests)
- Build check

#### CI/CD Pipeline Checks
- All pre-commit checks
- Full test suite (including integration)
- E2E tests
- Coverage report (hierarchical thresholds: critical >=93%, overall >=85%)
- Security scan
- Performance check

### 11.2 Coverage Enforcement

Coverage thresholds are enforced in CI/CD. See configuration in [GitHub Actions Documentation](../ci-cd/github-actions.md#coverage-configuration).

### 11.3 Pre-commit Hooks

Pre-commit hooks configuration. See detailed setup in [GitHub Actions Documentation](../ci-cd/github-actions.md#pre-commit-hooks).

---

## 12. Best Practices

### 12.1 General Guidelines
- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive Names**: Test names should read like requirements
- **One Assertion per Test**: Prefer multiple tests over multiple assertions
- **Test Independence**: Tests should not depend on each other
- **Fast Feedback**: Unit tests should run in < 100ms
- **Mock External Dependencies**: Don't test external services
- **Test Edge Cases**: Empty, null, boundary values
- **Avoid Magic Numbers**: Use constants in tests

### 12.2 Frontend Specific
- Test user interactions, not implementation
- Use data-testid for reliable element selection
- Mock API calls, don't hit real endpoints
- Test accessibility (ARIA attributes, keyboard navigation)
- Test responsive behavior (different viewports)

### 12.3 Backend Specific
- Use table-driven tests for multiple scenarios
- Mock database calls in unit tests
- Use testcontainers for integration tests
- Test error cases (timeouts, connection failures)
- Validate input at the handler level

### 12.4 Common Anti-Patterns
- ❌ Testing private methods directly
- ❌ Over-mocking (mock everything)
- ❌ Fragile selectors (testing by CSS classes)
- ❌ Tests that depend on execution order
- ❌ Tests that are too slow
- ❌ Tests that are hard to understand
- ❌ Testing third-party libraries

---

## 13. Troubleshooting

### 13.1 Common Issues

#### Flaky Tests
- Use retries with exponential backoff
- Add explicit waits instead of sleep
- Isolate async operations
- Use deterministic test data

#### Slow Tests
- Mock external dependencies
- Use in-memory databases for tests
- Parallelize test execution
- Remove unnecessary setup/teardown

#### Coverage Gaps
- Identify untested code paths
- Add tests for edge cases
- Review error handling
- Test validation logic

---

## 14. Resources

### 14.1 Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Go Testing Package](https://golang.org/pkg/testing/)
- [Testify](https://github.com/stretchr/testify)

### 14.2 Best Practices
- [Testing JavaScript Applications](https://testingjavascript.com/)
- [Go Testing Best Practices](https://go.dev/doc/tutorial/add-a-test)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

### 14.3 Coverage Analysis Tools

Coverage analysis tools and configuration. See detailed setup in [GitHub Actions Documentation](../ci-cd/github-actions.md#coverage-analysis-tools).

### 14.4 Coverage Enforcement

Coverage threshold enforcement scripts and configuration. See detailed setup in [GitHub Actions Documentation](../ci-cd/github-actions.md#coverage-enforcement).

---

**Document Owner**: Development Team  
**Last Updated**: 2025-09-18  
**Next Review**: After first testing cycle
