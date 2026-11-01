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

## 3. CI/CD Pipeline Workflow (Woodpecker)

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
# Full E2E tests on main branch at midnight
- E2E tests (chromium, firefox, webkit)
- Smoke tests
- Health check
```

### CI/CD Workflow Steps

```yaml
# .woodpecker.yml - Woodpecker CI/CD Pipeline
# See woodpecker-ci.md for complete configuration

clone:
  git:
    image: woodpeckerci/plugin-git:latest
    depth: 50

pipeline:
  # Stage 1: Quality Checks (All branches)
  quality-checks:
    image: oven/bun:1.4.2
    commands:
      - bun install
      - bun run format:check
      - bun run lint
      - bun run type-check
    when:
      event: [push, pull_request]

  # Stage 2: Unit Tests (All branches)
  unit-tests-frontend:
    image: oven/bun:1.4.2
    commands:
      - bun install
      - bun run test:unit -- --coverage
    when:
      event: [push, pull_request]

  unit-tests-backend:
    image: golang:1.27
    commands:
      - go test ./... -short -cover
    when:
      event: [push, pull_request]

  # Stage 3: Integration Tests (PR to develop, push to main)
  integration-tests:
    image: golang:1.27
    commands:
      - go test ./... -cover
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: test
      DB_PASSWORD: test
      DB_NAME: taskmanager_db_testing
    services:
      postgres:
        image: postgres:16-alpine
        environment:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: taskmanager_db_testing
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 4: Coverage Analysis (PR to develop, push to main)
  coverage-analysis:
    image: python:3.12-alpine
    commands:
      - pip install coverage-parser
      - python3 scripts/coverage_analyzer.py
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 5: Security Scan (PR to develop, push to main)
  security-scan:
    image: snyk/snyk-cli:latest
    commands:
      - snyk auth $${SNYK_TOKEN}
      - snyk test --severity-threshold=high
    secrets: [snyk_token]
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 6: Smoke Tests (PR to develop, push to main)
  smoke-tests:
    image: oven/bun:1.4.2
    commands:
      - bun install
      - bun run build
      - bun run test:smoke
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 7: Full E2E Tests (Push to main and cron)
  e2e-tests-chromium:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - bun install
      - bun run test:e2e --project=chromium
    when:
      branch: main
      event: [push, cron]

  e2e-tests-firefox:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - bun install
      - bun run test:e2e --project=firefox
    when:
      branch: main
      event: [push, cron]

  e2e-tests-webkit:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - bun install
      - bun run test:e2e --project=webkit
    when:
      branch: main
      event: [push, cron]

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
  - Vercel (frontend)
  - OCI (backend, 2 OCPU + 12GB RAM, Nginx)
  - Supabase (database - staging)
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
  - Vercel (frontend)
  - OCI (backend, 2 OCPU + 12GB RAM, Nginx)
  - Supabase (database - production)
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
# - GitHub Actions waits for approval
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
# GitHub Actions rollback
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
# Check logs in GitHub Actions
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

This workflow ensures quality, security, and reliability while maintaining development velocity following global senior developer standards.