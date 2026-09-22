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

## 3. CI/CD Pipeline Workflow

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
- Build and push to GHCR
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
- E2E tests (critical user flows)
- Performance check
- Build and push to GHCR
- Deploy to production (manual approval)
```

### CI/CD Workflow Steps

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop, feature/*]

jobs:
  # Stage 1: Quality Checks (Fast)
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Format check
      - name: Lint check
      - name: Type check

  # Stage 2: Unit Tests (Fast)
  unit-tests:
    runs-on: ubuntu-latest
    needs: quality-checks
    steps:
      - name: Frontend unit tests
      - name: Backend unit tests

  # Stage 3: Integration Tests (Medium)
  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    services:
      postgres:
        image: postgres:16
        environment:
          POSTGRES_DB: taskmanager_db_testing
      redis:
        image: redis:7-alpine
    steps:
      - name: Backend integration tests
      - name: Frontend integration tests

  # Stage 4: Coverage Analysis (Medium)
  coverage-report:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    steps:
      - name: Generate coverage report
      - name: Analyze coverage by category (business logic >93%)
      - name: Check hierarchical thresholds
      - name: Upload coverage to Codecov
      - name: Upload coverage to Codecov

  # Stage 5: Security Scan (Medium)
  security-scan:
    runs-on: ubuntu-latest
    needs: unit-tests
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    steps:
      - name: Snyk security scan
      - name: Gitleaks secret scan

  # Stage 6: E2E Tests (Slow)
  e2e-tests:
    runs-on: ubuntu-latest
    needs: [coverage-report, security-scan]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Start test environment
        run: docker-compose -f docker-compose.test.yml up -d
      - name: Run Playwright E2E tests
      - name: Cleanup test environment
        run: docker-compose -f docker-compose.test.yml down -v

  # Stage 7: Performance Check (Slow)
  performance-check:
    runs-on: ubuntu-latest
    needs: [coverage-report, security-scan]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Lighthouse CI
      - name: API load testing with k6

  # Stage 8: Build and Push
  build-push:
    runs-on: ubuntu-latest
    needs: [coverage-report, security-scan]
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    steps:
      - name: Build and push to GHCR
      - name: Update deployment tags

  # Stage 9: Deploy
  deploy:
    runs-on: ubuntu-latest
    needs: [build-push]
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    environment:
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    steps:
      - name: Deploy to environment
      - name: Run smoke tests
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
  - Koyeb (backend)
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
  - Koyeb (backend)
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
# Or manual Koyeb rollback

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