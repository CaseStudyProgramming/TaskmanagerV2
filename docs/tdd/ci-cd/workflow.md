# Development Workflow

This document defines the complete development workflow from local development to production deployment, following global senior developer standards.

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. LOCAL DEVELOPMENT                                         │
│     ├── Code changes                                          │
│     ├── Pre-commit checks (automated)                         │
│     └── Commit to feature branch                              │
│                                                               │
│  2. PUSH TO REMOTE                                           │
│     ├── Push to feature branch                                │
│     ├── Create Pull Request                                   │
│     └── CI/CD pipeline triggers                              │
│                                                               │
│  3. CI/CD VALIDATION                                          │
│     ├── Format check                                         │
│     ├── Lint check                                           │
│     ├── Type check                                           │
│     ├── Unit tests                                           │
│     ├── Integration tests                                    │
│     ├── Coverage analysis (hierarchical thresholds)         │
│     ├── Security scan                                        │
│     └── Performance check (on main/develop)                   │
│                                                               │
│  4. CODE REVIEW                                             │
│     ├── Peer review                                          │
│     ├── Documentation review                                 │
│     └── Approval                                             │
│                                                               │
│  5. MERGE STRATEGY                                          │
│     ├── Feature → Develop (auto-merge if checks pass)        │
│     └── Develop → Main (manual approval + E2E tests)        │
│                                                               │
│  6. DEPLOYMENT                                             │
│     ├── Develop branch → Staging (automatic)                 │
│     └── Main branch → Production (manual approval)            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 1. Local Development Workflow

### Pre-Commit Setup

**Install pre-commit hooks:**
```bash
# Install Husky for pre-commit hooks
bun install husky -D
bunx husky install
bunx husky add .husky/pre-commit
```

### Pre-Commit Checklist (Automated)

**Every commit MUST pass these checks:**

```bash
#!/bin/sh
# .husky/pre-commit

echo "🔍 Running pre-commit checks..."

# Frontend checks
echo "📦 Frontend checks..."
cd frontend
bun run format:check    # Biome format check
bun run lint           # Biome lint
bun run type-check     # TypeScript type check
bun run test:unit      # Unit tests
cd ..

# Backend checks
echo "🔧 Backend checks..."
cd backend
gofmt -l . | exit $(wc -l)         # Go format check
golangci-lint run                  # Go lint
go vet ./...                       # Go vet
go test ./... -short               # Unit tests
cd ..

echo "✅ All pre-commit checks passed!"
```

### Commit Process

```bash
# 1. Create feature branch
git checkout -b feature/task-prioritization

# 2. Make changes
# ...code changes...

# 3. Pre-commit hooks run automatically
git add .
git commit -m "feat: implement smart task prioritization"

# 4. Push to remote
git push origin feature/task-prioritization
```

## 2. Branch Strategy

### Branch Naming Convention

```bash
feature/feature-name        # New features
fix/bug-description         # Bug fixes
hotfix/critical-bug         # Critical production fixes
refactor/description         # Code refactoring
docs/documentation         # Documentation updates
test/test-improvement      # Test improvements
```

### Branch Protection Rules

**Protected Branches:**
- `main` - Production branch
- `develop` - Staging/integration branch

**Branch Protection Rules:**
```yaml
# GitHub Branch Protection Settings
main:
  required_status_checks:
    - format-check
    - lint-check
    - type-check
    - unit-tests
    - integration-tests
    - coverage-report
    - security-scan
    - e2e-tests
  require_pull_request_reviews: true
  required_approving_review_count: 1
  enforce_admins: true

develop:
  required_status_checks:
    - format-check
    - lint-check
    - type-check
    - unit-tests
    - integration-tests
    - coverage-report
    - security-scan
  require_pull_request_reviews: true
  required_approving_review_count: 1
```

## 3. CI/CD Pipeline Workflow (Forgejo Actions)

### Pipeline Stages by Branch

#### Feature Branches
```yaml
# Fast feedback loop (skip expensive checks)
- Format check
- Lint check
- Type check
- Unit tests
- Build check
# SKIP: Integration tests, E2E tests, performance check
```

#### Develop Branch
```yaml
# Full validation for staging
- Format check
- Lint check
- Type check
- Unit tests
- Integration tests
- Coverage report (hierarchical thresholds: critical >=93%, overall >=85%)
- Security scan
- Smoke tests
- Build and push to registry
# SKIP: E2E tests (on merge to main)
```

#### Main Branch
```yaml
# Complete validation for production
- Format check
- Lint check
- Type check
- Unit tests
- Integration tests
- Coverage report (hierarchical thresholds: critical >=93%, overall >=85%)
- Security scan
- Smoke tests
- E2E tests (chromium, firefox, webkit)
- Performance check
- Build and push to registry
- Deploy to production (manual trigger)
```

#### Cron Job (Midnight Daily)
```yaml
# Full E2E tests on main branch at midnight (00:00)
- E2E tests (chromium, firefox, webkit)
- Smoke tests
- Health check
- Session cleanup (auto)
```

### CI/CD Workflow Steps

```yaml
# .forgejo/workflows/ci.yml - Forgejo Actions CI/CD Pipeline
# See forgejo-ci.md for complete configuration

name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [develop]
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'  # Midnight daily

env:
  BUN_VERSION: '1.4.2'
  GO_VERSION: '1.27'

jobs:
  # Stage 1: Quality Checks (All branches)
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install --no-cache
      
      - name: Format check
        run: bun run format:check
      
      - name: Lint
        run: bun run lint
      
      - name: Type check
        run: bun run type-check

  # Stage 2: Unit Tests (All branches)
  unit-tests-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install --no-cache
      
      - name: Run unit tests
        run: bun run test:unit -- --coverage

  unit-tests-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
      
      - name: Run unit tests
        run: go test ./... -short -cover

  # Stage 3: Integration Tests (PR to develop, push to main)
  integration-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: taskmanager_db_testing
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
      
      - name: Run integration tests
        run: go test ./... -cover
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USER: test
          DB_PASSWORD: test
          DB_NAME: taskmanager_db_testing

  # Stage 4: Coverage Analysis (PR to develop, push to main)
  coverage-analysis:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    needs: [integration-tests]
    steps:
      - uses: actions/checkout@v4
      
      - name: Install coverage tools
        run: pip install coverage-parser
      
      - name: Analyze coverage
        run: python3 scripts/coverage_analyzer.py

  # Stage 5: Security Scan (PR to develop, push to main)
  security-scan:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk
        uses: snyk/actions/golang@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Stage 6: Smoke Tests (PR to develop, push to main)
  smoke-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install --no-cache
      
      - name: Build
        run: bun run build
      
      - name: Run smoke tests
        run: bun run test:smoke
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 7: Full E2E Tests (Push to main and cron at midnight)
  e2e-tests-chromium:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - rm -rf node_modules .bun
      - bun install --no-cache
      - bun run test:e2e --project=chromium
    when:
      branch: main
      event: [push, cron]
      cron: "0 0 * * *"

  e2e-tests-firefox:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - rm -rf node_modules .bun
      - bun install --no-cache
      - bun run test:e2e --project=firefox
    when:
      branch: main
      event: [push, cron]
      cron: "0 0 * * *"

  e2e-tests-webkit:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - rm -rf node_modules .bun
      - bun install --no-cache
      - bun run test:e2e --project=webkit
    when:
      branch: main
      event: [push, cron]
      cron: "0 0 * * *"

  # Stage 8: Performance Check (Push to main only)
  performance-check:
    image: oven/bun:1.4.2
    commands:
      - bun install
      - bun run build
      - bun run lighthouse
    when:
      branch: main
      event: [push]

  # Stage 9: Build and Push (Push to main only)
  build-frontend:
    image: oven/bun:1.4.2
    commands:
      - bun install
      - bun run build
    when:
      branch: main
      event: [push]

  build-backend:
    image: golang:1.27
    commands:
      - go build -o bin/app ./cmd/api
    when:
      branch: main
      event: [push]

  push-to-registry:
    image: quay.io/podman/stable
    commands:
      - podman login ghcr.io -u $${GITHUB_USERNAME} -p $${GITHUB_TOKEN}
      - podman build -t ghcr.io/$${GITHUB_USERNAME}/$${PROJECT_NAME}-backend:latest ./backend
      - podman push ghcr.io/$${GITHUB_USERNAME}/$${PROJECT_NAME}-backend:latest
    secrets: [github_username, github_token]
    when:
      branch: main
      event: [push]

  # Stage 10: Manual Deployment (Manual trigger only)
  deploy-staging:
    image: quay.io/podman/stable
    commands:
      - echo "Deploying to staging..."
      - ./scripts/deploy.sh staging
    when:
      branch: main
      event: manual

  deploy-production:
    image: quay.io/podman/stable
    commands:
      - echo "Deploying to production..."
      - ./scripts/deploy.sh production
    when:
      branch: main
      event: manual

  # Stage 11: Cleanup Session (Auto-cleanup after pipeline completes)
  cleanup-session:
    image: quay.io/podman/stable
    commands:
      - echo "Cleaning up session after pipeline..."
      - podman system prune -f --all
      - podman volume prune -f
      - podman image prune -a -f
      - echo "Cleanup completed at $(date)"
    when:
      event: [push, pull_request, cron]
      status: [success, failure]
```

## 4. Code Review Process

### Pull Request Requirements

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Coverage requirements met (critical >=93%, overall >=85%)
```

### Review Process

```bash
# 1. Create PR from feature to develop
git checkout develop
git pull origin develop
git checkout feature/task-prioritization
git push origin feature/task-prioritization
# Create PR on GitHub

# 2. CI/CD runs automatically
# - Quality checks
# - Unit tests
# - Integration tests (for develop PR)
# - Coverage analysis
# - Security scan

# 3. Peer review
# - At least 1 approval required
# - Review checklist completion
# - Address review comments

# 4. Merge to develop
# - Auto-merge if all checks pass and approved
# - Or manual merge by maintainer
```

## 5. Merge Strategy

### Feature → Develop (Automatic)

```yaml
# Conditions for auto-merge:
- All CI/CD checks pass
- At least 1 code review approval
- No merge conflicts
- Coverage critical >=93%, overall >=85%
- No security vulnerabilities

# Merge method:
- Squash merge (clean history)
- Automatic deployment to staging
```

### Develop → Main (Manual)

```yaml
# Conditions for merge:
- All CI/CD checks pass
- At least 1 code review approval
- E2E tests pass
- Performance checks pass
- Coverage critical >=93%, overall >=85%
- No security vulnerabilities
- Manual approval from maintainer

# Merge method:
- Squash merge with semantic versioning
- Manual deployment to production
```

## 6. Deployment Strategy

### Environment-Specific Deployments

#### Staging (Develop Branch)
```yaml
# Automatic deployment
trigger: push to develop
environment: staging
checks:
  - All CI/CD checks
  - No E2E tests (for speed)
  - No performance checks
deployment:
  - Cloudflare Workers edge (frontend)
  - OCI Instance (backend, A1.Flex - 2 OCPUs, 12 GB RAM, Podman, Nginx)
  - Neon (database - staging branch)
  - Upstash (cache - staging)
```

#### Production (Main Branch)
```yaml
# Manual deployment with approval
trigger: push to main (requires approval)
environment: production
checks:
  - All CI/CD checks
  - E2E tests (critical flows)
  - Performance checks
  - Security scan
deployment:
  - Cloudflare Workers edge (frontend)
  - OCI Instance (backend, A1.Flex - 2 OCPUs, 12 GB RAM, Podman, Nginx)
  - Neon (database - production branch)
  - Upstash (cache - production)
```

### Deployment Workflow

```bash
# 1. Merge to develop (automatic staging deployment)
git checkout develop
git merge feature/task-prioritization
git push origin develop
# → Automatic deployment to staging

# 2. Test in staging
# - Manual testing
# - Smoke tests
# - Integration verification

# 3. Create release PR for main
git checkout main
git pull origin main
git checkout develop
git pull origin develop
git checkout main
git merge develop
git push origin main
# → Manual approval required for production deployment

# 4. Production deployment (manual approval)
# - Forgejo Actions waits for approval
# - Maintainer approves deployment
# - Full E2E tests run
# - Performance checks run
# - Deployment to production
```

## 7. Quality Gates

### Pre-Commit Quality Gates

```yaml
mandatory_checks:
  - format: zero formatting issues
  - lint: zero lint warnings
  - type_check: zero type errors
  - unit_tests: all unit tests pass
  - build: successful build

blocking_conditions:
  - Any format issues
  - Any lint warnings
  - Any type errors
  - Any unit test failures
  - Build failures
```

### CI/CD Quality Gates

```yaml
develop_branch_gates:
  - format: zero formatting issues
  - lint: zero lint warnings
  - type_check: zero type errors
  - unit_tests: 100% pass rate
  - integration_tests: 100% pass rate
  - coverage: overall >=85% (warn), critical >=93% (block), important >=85% (warn)
  - security: zero high/critical vulnerabilities
  - build: successful build

main_branch_gates:
  - develop_branch_gates (all above)
  - e2e_tests: 100% pass rate
  - performance: meets budget requirements
  - manual_approval: required
```

**Note on Coverage Gates:**
- Critical coverage (business logic, services, entities, helpers) >=93% blocks CI
- Overall coverage >=85% is baseline (warning if below)
- See [Coverage Strategy](./coverage-strategy.md) for detailed hierarchical thresholds

## 8. Testing Strategy by Environment

### Local Development
```bash
# Unit tests only (fast feedback)
bun run test:unit
go test ./... -short

# Skip integration and E2E tests for speed
```

### Feature Branch CI
```bash
# Quality checks + unit tests (fast feedback)
- Format check
- Lint check
- Type check
- Unit tests
- Build check

# Skip integration, E2E, performance for speed
```

### Develop Branch CI
```bash
# Full validation except E2E
- Format check
- Lint check
- Type check
- Unit tests
- Integration tests
- Coverage analysis (hierarchical thresholds: critical >=93%, overall >=85%)
- Security scan
- Build and push

# Skip E2E and performance for speed
```

### Main Branch CI
```bash
# Complete validation
- Format check
- Lint check
- Type check
- Unit tests
- Integration tests
- Coverage analysis (hierarchical thresholds: critical >=93%, overall >=85%)
- Security scan
- E2E tests (critical flows)
- Performance check
- Build and push
- Deployment
```

## 9. Rollback Strategy

### Automatic Rollback Triggers

```yaml
automatic_rollback_conditions:
  - Health check failures (> 5 consecutive)
  - Error rate > 5% for 5 minutes
  - Response time > 1s (p95) for 5 minutes
  - Critical security vulnerability detected
```

### Manual Rollback Process

```bash
# 1. Identify bad deployment
# Check monitoring dashboards
# Review error logs
# Identify regression point

# 2. Rollback to previous version
# Forgejo Actions rollback
# Or manual OCI rollback

# 3. Create hotfix branch
git checkout -b hotfix/critical-issue
git checkout main
git cherry-pick <previous-good-commit>

# 4. Fix the issue
# ...fix implementation...

# 5. Fast-track through review
# Bypass some checks for critical fixes
# Maintainer approval required

# 6. Deploy hotfix
# Merge to main with approval
# Deploy to production
```

## 10. Monitoring and Alerts

### Key Metrics

```yaml
development_metrics:
  - Pre-commit hook success rate
  - CI/CD pass rate
  - Average build time
  - Test coverage trends

production_metrics:
  - Error rate
  - Response time (p95)
  - Uptime
  - Deployment success rate
```

### Alert Configuration

```yaml
alerts:
  critical:
    - Production deployment failure
    - Security vulnerability detected
    - Performance degradation > 50%
  warning:
    - CI/CD failure rate > 10%
    - Coverage drop below 85%
    - Performance degradation > 20%
```

## 11. Troubleshooting Workflow

### Common Issues and Solutions

**Pre-commit hook failures:**
```bash
# Format issues
bun run format:check
bun run format:write  # Auto-fix

# Lint issues
bun run lint
# Fix lint errors manually

# Type errors
bun run type-check
# Fix type errors

# Test failures
bun run test:unit
# Fix failing tests
```

**CI/CD failures:**
```bash
# Check logs in Forgejo Actions
# Identify failing stage
# Reproduce locally
# Fix issue
# Push to branch
# CI/CD re-runs automatically
```

**Coverage failures:**
```bash
# Generate coverage report
bun run test:coverage
go test ./... -cover

# Analyze low coverage files
# Add tests for business logic
# Re-run CI/CD
```

## 12. Best Practices

### Development Practices

1. **Small, frequent commits** - Easier to review and rollback
2. **Descriptive commit messages** - Follow conventional commits
3. **Branch per feature** - Isolated development
4. **Update documentation** - Keep docs in sync with code
5. **Test locally first** - Don't rely solely on CI/CD

### Code Review Practices

1. **Review thoroughly** - Don't just approve
2. **Check documentation** - Ensure docs are updated
3. **Verify tests** - Ensure adequate test coverage
4. **Security mindset** - Look for security issues
5. **Performance awareness** - Consider performance impact

### Deployment Practices

1. **Test in staging** - Never deploy directly to production
2. **Monitor after deployment** - Watch for issues
3. **Have rollback plan** - Know how to rollback quickly
4. **Document deployments** - Keep deployment records
5. **Learn from failures** - Post-mortem analysis

## 13. Tool Configuration

### Package.json Scripts

```json
{
  "scripts": {
    "pre-commit": "bun run format:check && bun run lint && bun run type-check && bun run test:unit",
    "format:check": "biome check",
    "format:write": "biome check --write",
    "lint": "biome lint",
    "type-check": "tsc --noEmit",
    "test:unit": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "build": "vite build"
  }
}
```

### Go Makefile

```makefile
.PHONY: test lint format vet build

test:
	go test ./... -short

test-coverage:
	go test ./... -coverprofile=coverage.out
	go tool cover -html=coverage.out

lint:
	golangci-lint run

format:
	gofmt -l .

vet:
	go vet ./...

build:
	go build -o bin/app ./cmd/api

pre-commit: format lint vet test build
```

## 14. Documentation Updates

### When to Update Documentation

1. **Architecture changes** - Update architecture docs
2. **API changes** - Update API documentation
3. **Workflow changes** - Update this workflow document
4. **New features** - Update PRD and feature docs
5. **Testing changes** - Update TDD guidelines

### Documentation Review Checklist

```markdown
- [ ] Architecture documentation updated
- [ ] API documentation updated
- [ ] TDD guidelines updated
- [ ] Workflow documentation updated
- [ ] README.md updated
- [ ] Code comments updated
```

## 15. Session Cleanup Workflow

### Auto-Cleanup After Pipeline

**Stage 11: Cleanup Session** dijalankan otomatis setelah pipeline selesai (baik sukses maupun gagal):

```yaml
cleanup-session:
  image: quay.io/podman/stable
  commands:
    - echo "Cleaning up session after pipeline..."
    - podman system prune -f --all
    - podman volume prune -f
    - podman image prune -a -f
    - echo "Cleanup completed at $(date)"
  when:
    event: [push, pull_request, cron]
    status: [success, failure]
```

**Cleanup Operations**:
- `podman system prune -f --all`: Hapus semua containers, networks, dan unused images
- `podman volume prune -f`: Hapus semua unused volumes
- `podman image prune -a -f`: Hapus semua unused images

**Benefits**:
- ✅ Workers tidak menumpuk cache dan artifacts
- ✅ Storage lebih hemat
- ✅ Mencegah resource exhaustion
- ✅ Pipeline lebih predictable

**Execution**:
- Diambil untuk semua event types (push, pull_request, cron)
- Diambil untuk semua status (success, failure)
- Menjamin cleanup bahkan jika pipeline gagal

### Forgejo Agent Configuration

**Environment variables untuk cleanup**:
```yaml
FORGEJO_LIMIT_TIMEOUT=1800  # 30 minutes timeout
FORGEJO_CLEANUP=true  # Auto-cleanup after pipeline
```

## 16. Cron Job Setup (Nightly E2E Tests)

### Configuration di Forgejo UI

**Setup Cron Job**:
1. Buka Forgejo UI → Project Settings → Cron Jobs
2. Add new cron job:
   - Name: `nightly-e2e-full-test`
   - Schedule: `0 0 * * *` (midnight daily)
   - Branch: `main`
   - Execute pipeline: `true`

**Schedule Format**:
- `0 0 * * *` = Setiap hari jam 00:00 (midnight)
- Format: `minute hour day month day-of-week`
- Contoh lain:
  - `0 6 * * *` = Setiap hari jam 06:00
  - `0 */12 * * *` = Setiap 12 jam
  - `0 0 * * 0` = Setiap hari Minggu jam 00:00

### Testing Cron Job

**Untuk testing, gunakan schedule yang lebih frequent**:
```yaml
cron: "*/5 * * * *"  # Setiap 5 menit (untuk testing)
```

**Setelah testing, kembali ke production schedule**:
```yaml
cron: "0 0 * * *"  # Midnight daily
```

### Cron Job Workflow

**Cron job menjalankan**:
1. E2E tests (chromium, firefox, webkit)
2. Smoke tests
3. Health check
4. Session cleanup (auto)

**Branch restriction**:
- Hanya berjalan di `main` branch
- Tidak berjalan di feature branches atau develop

This workflow ensures quality, security, and reliability while maintaining development velocity following global senior developer standards.