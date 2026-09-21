# CI/CD Pipeline Documentation

This document provides comprehensive CI/CD pipeline configuration and best practices for the Advanced Task Manager project.

## Overview

The CI/CD pipeline ensures code quality, security, and consistency across all environments using GitHub Actions.

## Pipeline Stages

### 1. Pre-Commit Checks (Local)

Every commit must pass these checks before being pushed:

```bash
# Frontend
npm run format:check    # Biome format check
npm run lint           # Biome lint
npm run type-check     # TypeScript type check
npm run test:unit      # Unit tests

# Backend
gofmt -l .             # Go format check
golangci-lint run      # Go lint
go vet ./...           # Go vet
go test ./... -short   # Unit tests
```

### 2. Pull Request Checks (CI)

Every PR must pass these checks:

```yaml
# Format, Lint, Type Check
# Full Test Suite (including integration)
# E2E Tests
# Coverage Report (hierarchical thresholds: critical >=93%, overall >=85%)
# Security Scan
# Performance Check
```

## GitHub Actions Configuration

### Main Workflow File

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

env:
  NODE_VERSION: '24.20.0'  # Must be used across development, testing, and production
  GO_VERSION: '1.25'
  TEST_DB_NAME: taskmanager_db_testing

jobs:
  frontend:
    name: Frontend CI
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Format check
        run: npm run format:check
      
      - name: Lint check
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: frontend
          fail_ci_if_error: true
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Build
        run: npm run build

  backend:
    name: Backend CI
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: taskmanager_db_testing
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: ${{ env.GO_VERSION }}
          cache: true
      
      - name: Format check
        run: gofmt -l . | tee /dev/stderr | exit $(wc -l)
      
      - name: Lint
        uses: golangci/golangci-lint-action@v3
        with:
          version: latest
      
      - name: Vet
        run: go vet ./...
      
      - name: Unit tests
        run: go test ./... -short -cover
      
      - name: Integration tests
        run: go test ./... -cover
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: test
          DB_PASSWORD: test
          DB_NAME: ${{ env.TEST_DB_NAME }}
          REDIS_HOST: localhost
          REDIS_PORT: 6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage.out
          flags: backend
          fail_ci_if_error: true
      
      - name: Build
        run: go build -o bin/app ./cmd/api

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Snyk (Frontend)
        uses: snyk/actions/node@master
        with:
          command: test
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run Snyk (Backend)
        uses: snyk/actions/golang@master
        with:
          command: test
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}

  performance:
    name: Performance Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
          urls: |
            http://localhost:3000
          budgetPath: ./.github/lighthouse-budget.json
      
      - name: API Performance Test
        run: |
          npm install -g k6
          k6 run tests/load/api-load-test.js

  deploy-staging:
    name: Deploy to Staging
    needs: [frontend, backend, security, performance]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy Frontend to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend

      - name: Deploy Backend to Koyeb
        uses: koyeb/action-deploy@v2
        with:
          api-token: ${{ secrets.KOYEB_API_TOKEN }}
          service-id: ${{ secrets.KOYEB_SERVICE_ID }}
          pattern: main

  deploy-production:
    name: Deploy to Production
    needs: [frontend, backend, security, performance]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy Frontend to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend

      - name: Deploy Backend to Koyeb
        uses: koyeb/action-deploy@v2
        with:
          api-token: ${{ secrets.KOYEB_API_TOKEN }}
          service-id: ${{ secrets.KOYEB_SERVICE_ID }}
          pattern: main
```

## Pre-Commit Hooks

### Husky Configuration

```bash
# Install Husky
npm install husky -D
npx husky install
npx husky add .husky/pre-commit
```

### Pre-Commit Hook Script

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Frontend checks
echo "Running frontend checks..."
cd frontend
npm run format:check
npm run lint
npm run type-check
npm run test:unit
cd ..

# Backend checks
echo "Running backend checks..."
cd backend
gofmt -l . | exit $(wc -l)
golangci-lint run
go vet ./...
go test ./... -short
cd ..

echo "All checks passed!"
```

## Coverage Configuration

### Frontend Coverage (Vitest)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 85, // Overall baseline
      functions: 85,
      branches: 85,
      statements: 85,
      exclude: [
        'node_modules/',
        'src/shared/types/',
        'src/app/routes/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
      ],
    },
  },
});
```

**Note**: Hierarchical coverage thresholds are enforced via coverage_analyzer.py script:
- Critical files (business logic, services, entities, helpers): >=93% (blocks CI)
- Important files (API handlers, repositories, UI components): >=85% (warning)
- Overall baseline: >=85% (warning)

### Backend Coverage (Go)

```bash
#!/bin/bash
# scripts/check-coverage.sh

COVERAGE=$(go test ./... -cover | grep total | awk '{print $3}' | sed 's/%//')
THRESHOLD=85

if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
    echo "Coverage $COVERAGE% is below threshold $THRESHOLD%"
    exit 1
fi

echo "Coverage $COVERAGE% meets threshold $THRESHOLD%"
```

**Note**: Hierarchical coverage thresholds are enforced via coverage_analyzer.py script:
- Critical files (business logic, services, entities, helpers): >=93% (blocks CI)
- Important files (API handlers, repositories, UI components): >=85% (warning)
- Overall baseline: >=85% (warning)

## Secrets Management

### Required GitHub Secrets

```yaml
# Frontend Deployment
VERCEL_TOKEN:                  # Vercel API token
VERCEL_ORG_ID:                 # Vercel organization ID
VERCEL_PROJECT_ID:             # Vercel project ID

# Backend Deployment
KOYEB_API_TOKEN:               # Koyeb API token
KOYEB_SERVICE_ID:              # Koyeb service ID

# Security
SNYK_TOKEN:                    # Snyk API token
GITLEAKS_LICENSE:              # Gitleaks license (optional)

# Database (for integration tests)
TEST_DB_HOST:                  # Test database host
TEST_DB_PORT:                  # Test database port
TEST_DB_USER:                  # Test database user
TEST_DB_PASSWORD:              # Test database password
TEST_DB_NAME:                  # taskmanager_db_testing

# Redis (for integration tests)
REDIS_HOST:                    # Redis host
REDIS_PORT:                    # Redis port
```

## Performance Budgets

### Lighthouse Budget Configuration

```json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 2000,
          "tolerance": 0.5
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500,
          "tolerance": 0.5
        },
        {
          "metric": "total-blocking-time",
          "budget": 300,
          "tolerance": 0.5
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 200
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        }
      ]
    }
  ]
}
```

## Load Testing

### k6 Configuration

```javascript
// tests/load/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  let res = http.get('https://api.example.com/api/v1/tasks');
  check(res, {
    'status was 200': (r) => r.status == 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

## Deployment Strategies

### Feature Flags

```yaml
# Environment-specific feature flags
FEATURE_OFFLINE_MODE: true
FEATURE_SMART_PRIORITIZATION: true
FEATURE_EXPORT_IMPORT: true
FEATURE_AI_INTEGRATION: false  # Disabled for MVP
```

### Rollback Strategy

```bash
# Manual rollback script
#!/bin/bash
# scripts/rollback.sh

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: ./rollback.sh <version>"
  exit 1
fi

# Rollback frontend
vercel rollback $VERSION

# Rollback backend (Koyeb)
koyeb deployments redeploy --service-id $KOYEB_SERVICE_ID --deployment-id $VERSION
```

## Monitoring

### Health Checks

```go
// Backend health check endpoint
func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
    status := map[string]string{
        "status": "healthy",
        "timestamp": strconv.FormatInt(time.Now().UnixMilli(), 10),
    }
    
    // Check database
    if err := db.Ping(); err != nil {
        status["status"] = "unhealthy"
        status["database"] = "disconnected"
        w.WriteHeader(http.StatusServiceUnavailable)
    }
    
    // Check Redis
    if err := redis.Ping().Err(); err != nil {
        status["status"] = "unhealthy"
        status["redis"] = "disconnected"
        w.WriteHeader(http.StatusServiceUnavailable)
    }
    
    json.NewEncoder(w).Encode(status)
}
```

### Error Tracking

```typescript
// Frontend error tracking
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

## Local Development

### Docker Compose for Local CI

```yaml
# docker-compose.ci.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: taskmanager_db_testing
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Running CI Locally

```bash
# Start services
docker-compose -f docker-compose.ci.yml up -d

# Run full CI pipeline
npm run ci:local
```

## Troubleshooting

### Common Issues

#### Coverage Reports Not Uploading
```bash
# Check if coverage file exists
ls -la coverage/

# Generate coverage manually
npm run test:coverage
go test ./... -coverprofile=coverage.out
```

#### Integration Tests Failing
```bash
# Check database connection
docker-compose -f docker-compose.ci.yml ps

# Verify database name
echo $TEST_DB_NAME  # Should be taskmanager_db_testing
```

#### Performance Budget Failing
```bash
# Run Lighthouse locally
npm run lighthouse

# Check budget configuration
cat .github/lighthouse-budget.json
```

## Best Practices

1. **Always run pre-commit hooks locally** before pushing
2. **Keep CI pipeline fast** by running tests in parallel
3. **Use caching** for dependencies to speed up builds
4. **Monitor CI failures** and fix them immediately
5. **Keep secrets secure** and never commit them
6. **Test deployments** in staging before production
7. **Monitor performance** and budget compliance
8. **Document any CI/CD changes** in this file
