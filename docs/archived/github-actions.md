# CI/CD Pipeline Documentation (GitHub Actions - DEPRECATED)

**Status**: Deprecated
**Replacement**: [Forgejo CI/CD Configuration](../tdd/ci-cd/forgejo-ci.md)

---

This document provides historical CI/CD pipeline configuration using GitHub Actions. GitHub Actions has been replaced by Forgejo as the primary CI/CD platform.

## Overview

The CI/CD pipeline ensures code quality, security, and consistency across all environments using GitHub Actions (deprecated).

## Pipeline Stages

### 1. Pre-Commit Checks (Local)

Every commit must pass these checks before being pushed:

```bash
# Frontend
bun run format:check    # Biome format check
bun run lint           # Biome lint
bun run type-check     # TypeScript type check
bun run test:unit      # Unit tests

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
  BUN_VERSION: '1.4.2'  # JavaScript runtime for frontend (TypeScript/JavaScript)
  GO_VERSION: '1.25'    # Go runtime for backend (stdlib + Chi router)
  TEST_DB_NAME: taskmanager_db_testing

jobs:
  frontend:
    name: Frontend CI
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install
      
      - name: Format check
        run: bun run format:check
      
      - name: Lint check
        run: bun run lint
      
      - name: Type check
        run: bun run type-check
      
      - name: Unit tests
        run: bun run test:unit -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: frontend
          fail_ci_if_error: true
      
      - name: E2E tests
        run: bun run test:e2e
      
      - name: Build
        run: bun run build

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
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install
      
      - name: Build application
        run: bun run build
      
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
          bun install -g k6
          k6 run tests/load/api-load-test.js

  deploy-staging:
    name: Deploy to Staging
    needs: [frontend, backend, security, performance]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy Frontend to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy ./frontend --project-name=taskmanager-frontend

      - name: Deploy Backend to OCI
        uses: oracle-actions/oci-deploy@v1
        with:
          api-token: ${{ secrets.OCI_API_TOKEN }}
          service-id: ${{ secrets.OCI_SERVICE_ID }}
          pattern: main

  deploy-production:
    name: Deploy to Production
    needs: [frontend, backend, security, performance]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy Frontend to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy ./frontend --project-name=taskmanager-frontend

      - name: Deploy Backend to OCI
        uses: oracle-actions/oci-deploy@v1
        with:
          api-token: ${{ secrets.OCI_API_TOKEN }}
          service-id: ${{ secrets.OCI_SERVICE_ID }}
          pattern: main
```

## Pre-Commit Hooks

### Husky Configuration

```bash
# Install Husky
bun install husky -D
bunx husky install
bunx husky add .husky/pre-commit
```

### Pre-Commit Hook Script

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Frontend checks
echo "Running frontend checks..."
cd frontend
bun run format:check
bun run lint
bun run type-check
bun run test:unit
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

### Frontend Coverage (Vitest) - Cloudflare Workers Edge Deployment

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
CLOUDFLARE_API_TOKEN:         # Cloudflare API token
CLOUDFLARE_ACCOUNT_ID:        # Cloudflare account ID
CLOUDFLARE_PROJECT_NAME:      # Cloudflare project name (taskmanager-frontend)

# Backend Deployment
OCI_API_TOKEN:                 # OCI API token
OCI_SERVICE_ID:                # OCI service ID

# Security
SNYK_TOKEN:                    # Snyk API token
GITLEAKS_LICENSE:              # Gitleaks license (optional)

# Database (Neon for integration tests)
NEON_DATABASE_URL:            # Neon database connection string (testing branch)
NEON_PROJECT_ID:              # Neon project ID
TEST_DB_NAME:                  # taskmanager_db_testing (Neon branch: testing)

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

### Lighthouse CI Usage

**Browser Support**: Chrome/Chromium-based only (uses Chrome DevTools Protocol)

**Local Testing**:
```bash
# Run Lighthouse CI locally
bun run lighthouse

# Manual Lighthouse CI with custom configuration
lhci autorun --collect.url=http://localhost:3000
```

**Configuration**: Create `lighthouserc.json` in project root:
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**When to Use**:
- Manual performance checks during development
- Critical milestone performance validation
- Production-ready phase (can be added to CI/CD)
- Different from k6 (API load) and Playwright (functional testing)

## Cloudflare Workers Edge Deployment

### Cloudflare Pages Configuration

**Create `wrangler.toml` in project root:**
```toml
name = "taskmanager-frontend"
main = "./.cloudflare/_worker.js"
compatibility_date = "2024-01-01"

[site]
bucket = "./.cloudflare/public"

[build]
command = "bun run build"
cwd = "."
watch_dir = "src"

[vars]
ENVIRONMENT = "production"
API_URL = "https://api.davidcps.my.id"
```

**SvelteKit Adapter Configuration:**
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      platformProxy: {
        pages: true
      }
    })
  }
};
```

**Deploy to Cloudflare Pages:**
```yaml
deploy-cloudflare:
  name: Deploy to Cloudflare Workers
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
      with:
        bun-version: ${{ env.BUN_VERSION }}
    
    - name: Install dependencies
      run: bun install
    
    - name: Build application
      run: bun run build
    
    - name: Deploy to Cloudflare Workers
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        command: pages deploy . --project-name=taskmanager-frontend
```

**Cloudflare Environment Variables:**
```yaml
CLOUDFLARE_API_TOKEN:         # Cloudflare API token
CLOUDFLARE_ACCOUNT_ID:        # Cloudflare account ID
CLOUDFLARE_PROJECT_NAME:      # taskmanager-frontend
```

### Cloudflare DNS + DDNS Configuration

**DNS Configuration:**
- Add A record: `davidcps.my.id` → Cloudflare Pages
- Add CNAME for subdomains: `api.davidcps.my.id` → OCI Instance IP
- Enable CDN caching
- Configure DDNS for dynamic IP updates

**DDNS Script (for OCI Instance):**
```bash
#!/bin/bash
# Update Cloudflare DNS when OCI Instance IP changes

CURRENT_IP=$(curl -s https://api.ipify.org)
ZONE_ID="your-cloudflare-zone-id"
RECORD_ID="your-record-id"

curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"A\",\"name\":\"api.davidcps.my.id\",\"content\":\"$CURRENT_IP\",\"ttl\":1,\"proxied\":false}"
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

# Rollback frontend (Cloudflare Workers)
# Deploy previous version using Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/taskmanager-frontend/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rollback_to": "'$VERSION'"}'

# Rollback backend (OCI)
oci compute instance-action --instance-id $OCI_INSTANCE_ID --action STOP
oci compute instance-action --instance-id $OCI_INSTANCE_ID --action START
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
bun run ci:local
```

## Troubleshooting

### Common Issues

#### Coverage Reports Not Uploading
```bash
# Check if coverage file exists
ls -la coverage/

# Generate coverage manually
bun run test:coverage
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
# Run Lighthouse CI locally
bun run lighthouse

# Run Lighthouse CI with custom URL
lhci autorun --collect.url=http://localhost:3000

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
