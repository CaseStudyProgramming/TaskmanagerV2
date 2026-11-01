# Woodpecker CI/CD Configuration

**Version**: 1.0  
**Date**: 2026-11-01  
**Status**: Draft

---

## Overview

This document defines the Woodpecker CI/CD pipeline configuration that replaces GitHub Actions for the Advanced Task Manager project. Woodpecker is a self-hosted CI/CD platform that runs on OCI Debian 26 LTS using Podman.

## Key Requirements

1. **Cron Job**: Full E2E tests at midnight (00:00) on main branch
2. **Pipeline**: Build → Smoke Test → E2E (chromium, firefox, webkit) before merge to main
3. **Resource Limits**: Max 2GB RAM, 1-2 workers (universal for multiple projects)
4. **PR Batching**: Mergify for batching 3 PRs (free tier)
5. **Storage**: Supabase for metadata, OCI Object Storage (200GB) for media files
6. **Deployment**: Manual deployment to OCI Podman
7. **Universal Setup**: Configured for Project A, Project B, and future projects

---

## Woodpecker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WOODPECKER CI/CD                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Server: OCI Debian 26 LTS (Podman)                          │
│  Agent: 1-2 workers (2GB RAM each)                           │
│  Registry: OCI Container Registry / GHCR                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              PIPELINE FLOW                              │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  1. ON PUSH (feature branches)                           │ │
│  │     ├── Format check                                     │ │
│  │     ├── Lint check                                       │ │
│  │     ├── Type check                                       │ │
│  │     ├── Unit tests                                       │ │
│  │     └── Build check                                      │ │
│  │                                                           │ │
│  │  2. ON PR (develop branch)                              │ │
│  │     ├── All above checks                                 │ │
│  │     ├── Integration tests                               │ │
│  │     ├── Coverage analysis (hierarchical)                │ │
│  │     ├── Security scan                                    │ │
│  │     └── Smoke tests                                      │ │
│  │                                                           │ │
│  │  3. ON PUSH (main branch)                                │ │
│  │     ├── All PR checks                                    │ │
│  │     ├── Full E2E tests (chromium, firefox, webkit)      │ │
│  │     ├── Performance check                               │ │
│  │     └── Build and push to registry                      │ │
│  │                                                           │ │
│  │  4. CRON (00:00 daily on main)                          │ │
│  │     ├── Full E2E tests (all browsers)                   │ │
│  │     ├── Smoke tests                                      │ │
│  │     └── Health check                                     │ │
│  │                                                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Woodpecker Server Setup (OCI Debian 26 LTS)

### 1. Install Podman

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Podman
sudo apt install -y podman podman-compose

# Verify installation
podman --version
podman-compose --version

# Enable user namespaces (for rootless containers)
echo "user.max_user_namespaces=15000" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Install Woodpecker Server

```bash
# Create woodpecker directory
sudo mkdir -p /etc/woodpecker
sudo mkdir -p /var/lib/woodpecker

# Create docker-compose for Woodpecker
sudo nano /etc/woodpecker/docker-compose.yml
```

```yaml
# /etc/woodpecker/docker-compose.yml
version: '3.8'

services:
  woodpecker-server:
    image: woodpeckerci/woodpecker-server:latest
    container_name: woodpecker-server
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/lib/woodpecker:/var/lib/woodpecker
    environment:
      - WOODPECKER_OPEN=true
      - WOODPECKER_HOST=https://ci.yourdomain.com
      - WOODPECKER_GITHUB=true
      - WOODPECKER_GITHUB_CLIENT=${GITHUB_CLIENT_ID}
      - WOODPECKER_GITHUB_SECRET=${GITHUB_CLIENT_SECRET}
      - WOODPECKER_AGENT_SECRET=${WOODPECKER_AGENT_SECRET}
      - WOODPECKER_DATABASE_POSTGRES_HOST=postgres
      - WOODPECKER_DATABASE_POSTGRES_USER=woodpecker
      - WOODPECKER_DATABASE_POSTGRES_PASSWORD=${DB_PASSWORD}
      - WOODPECKER_DATABASE_POSTGRES_DATABASE=woodpecker
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    container_name: woodpecker-postgres
    volumes:
      - /var/lib/woodpecker/postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=woodpecker
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=woodpecker
    restart: unless-stopped

  woodpecker-agent:
    image: woodpeckerci/woodpecker-agent:latest
    container_name: woodpecker-agent
    command: agent
    volumes:
      - /var/run/podman/podman.sock:/var/run/docker.sock
    environment:
      - WOODPECKER_SERVER=woodpecker-server:9000
      - WOODPECKER_AGENT_SECRET=${WOODPECKER_AGENT_SECRET}
      - WOODPECKER_MAX_PROCS=2  # 2 workers
      - WOODPECKER_LIMIT_MEM=2048  # 2GB RAM limit
    depends_on:
      - woodpecker-server
    restart: unless-stopped
    privileged: true  # Required for Podman
```

### 3. Configure Woodpecker with Podman

```bash
# Create systemd service for Woodpecker
sudo nano /etc/systemd/system/woodpecker.service
```

```ini
[Unit]
Description=Woodpecker CI
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/etc/woodpecker
ExecStart=/usr/bin/podman-compose up
ExecStop=/usr/bin/podman-compose down
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start Woodpecker
sudo systemctl enable woodpecker
sudo systemctl start woodpecker

# Check status
sudo systemctl status woodpecker
```

### 4. Configure Cloudflare (Free SSL)

```bash
# Add CNAME record in Cloudflare
# ci.yourdomain.com → your-oci-instance-ip

# Woodpecker will use Cloudflare's free SSL
# No need to configure certificates on Woodpecker
```

---

## Woodpecker Pipeline Configuration (.woodpecker.yml)

### Universal Template (for Multiple Projects)

```yaml
# .woodpecker.yml - Universal template for all projects
# This template works for Project A, Project B, and future projects

variables:
  # Project-specific variables (set in Woodpecker UI)
  - &bun_version "1.4.2"
  - &node_version "24.20.0"
  - &go_version "1.27"
  - &project_name "taskmanager"  # Change per project

clone:
  git:
    image: woodpeckerci/plugin-git:latest
    depth: 50

pipeline:
  # Stage 1: Quality Checks (All branches)
  quality-checks:
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run format:check
      - bun run lint
      - bun run type-check
    when:
      event: [push, pull_request]

  # Stage 2: Unit Tests (All branches)
  unit-tests-frontend:
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run test:unit -- --coverage
    when:
      event: [push, pull_request]

  unit-tests-backend:
    image: golang:*go_version
    commands:
      - go test ./... -short -cover
    when:
      event: [push, pull_request]

  # Stage 3: Integration Tests (PR to develop, push to main)
  integration-tests:
    image: golang:*go_version
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
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run build
      - bun run test:smoke
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 7: Full E2E Tests (Push to main only)
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
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run build
      - bun run lighthouse
    when:
      branch: main
      event: [push]

  # Stage 9: Build and Push (Push to main only)
  build-frontend:
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run build
    when:
      branch: main
      event: [push]

  build-backend:
    image: golang:*go_version
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

---

## Cron Job Configuration (Midnight E2E Tests)

### Woodpecker Cron Job

```yaml
# Add to .woodpecker.yml
cron: nightly-e2e
  when:
    event: cron
    cron: "0 0 * * *"  # Midnight daily
    branch: main
```

### Alternative: Systemd Timer (for OCI server)

```bash
# Create systemd timer
sudo nano /etc/systemd/system/woodpecker-cron.service
```

```ini
[Unit]
Description=Woodpecker Cron Job - Nightly E2E Tests

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -X POST \
  -H "Authorization: Bearer ${WOODPECKER_TOKEN}" \
  https://ci.yourdomain.com/api/pipelines/trigger
```

```bash
sudo nano /etc/systemd/system/woodpecker-cron.timer
```

```ini
[Unit]
Description=Run Woodpecker Cron Job Daily at Midnight

[Timer]
OnCalendar=*-*-* 00:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Enable timer
sudo systemctl enable woodpecker-cron.timer
sudo systemctl start woodpecker-cron.timer
```

---

## Mergify Configuration (PR Batching)

### .mergify.yml Configuration

```yaml
# .mergify.yml - PR Batching for 3 PRs (free tier)
# Universal for all projects

pull_request_rules:
  - name: Automatic merge for PRs with 3 approvals
    conditions:
      - "#approved-reviews-by>=1"
      - "#changes-requested-reviews-by==0"
      - base=develop
      - check-success=quality-checks
      - check-success=unit-tests-frontend
      - check-success=unit-tests-backend
      - check-success=integration-tests
      - check-success=coverage-analysis
      - check-success=security-scan
      - check-success=smoke-tests
    actions:
      merge:
        method: squash
        strict: smart
        strict_method: merge
        commit_message_template: |
          {{ title }} (#{{ number }})

          {{ body }}

  - name: Batch merge 3 PRs at once
    conditions:
      - "#approved-reviews-by>=1"
      - "#changes-requested-reviews-by==0"
      - base=develop
      - "#pr>=3"  # Wait for 3 PRs
      - check-success=quality-checks
      - check-success=unit-tests-frontend
      - check-success=unit-tests-backend
      - check-success=integration-tests
      - check-success=coverage-analysis
      - check-success=security-scan
      - check-success=smoke-tests
    actions:
      merge:
        method: squash
        batch_size: 3
        commit_message_template: |
          Batch merge: {{ title }} (#{{ number }})

          {{ body }}

  - name: Delete head branch after merge
    conditions:
      - merged
    actions:
      delete_head_branch: {}
```

---

## Storage Strategy

### Supabase for Metadata

```sql
-- Database schema for metadata
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,  -- OCI Object Storage URL
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    due_date BIGINT,
    tags TEXT[],
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    completed_at BIGINT,
    priority_score INTEGER DEFAULT 0,
    media_urls TEXT[]  -- Array of OCI Object Storage URLs
);
```

### OCI Object Storage for Media Files

```bash
# Install OCI CLI
sudo apt install -y oracle-cloud-cli

# Configure OCI CLI
oci setup config

# Create bucket for media files
oci os bucket create \
  --compartment-id $COMPARTMENT_ID \
  --name taskmanager-media \
  --public-access-type NoPublicAccess

# Upload file
oci os object put \
  --bucket-name taskmanager-media \
  --file /path/to/file.jpg \
  --name file.jpg

# Get pre-authenticated URL (for database storage)
oci os preauth-request create \
  --bucket-name taskmanager-media \
  --name file.jpg \
  --access-type ObjectRead \
  --time-expires 2027-01-01
```

### OCI Object Storage for CI/CD Artifacts

```bash
# Create bucket for CI/CD artifacts with 30-day auto-cleanup
oci os bucket create \
  --compartment-id $COMPARTMENT_ID \
  --name woodpecker-artifacts \
  --public-access-type NoPublicAccess \
  --object-lifecycle-rule-age-days 30
```

**Penting**: `--object-lifecycle-rule-age-days 30` akan otomatis menghapus semua artifacts setelah 30 hari. Ini adalah cara terbaik untuk auto-cleanup tanpa script tambahan. Bisa ubah angka 30 ke berapa hari yang Anda mau (7, 90, dll).

Untuk detail lebih lanjut tentang artifact management, lihat [Woodpecker Artifact Management](./woodpecker-artifacts.md).

### Go Backend Integration

```go
// Upload file to OCI Object Storage
func UploadToOCI(file io.Reader, filename string) (string, error) {
    // OCI SDK integration
    // Returns pre-authenticated URL
    // Store URL in Supabase
    return url, nil
}

// Task with media
type Task struct {
    ID          uuid.UUID
    Title       string
    Description string
    MediaURLs   []string  // OCI Object Storage URLs
    // ... other fields
}
```

---

## Universal Configuration for Multiple Projects

### Project-Specific Variables

Set these in Woodpecker UI for each project:

```yaml
# Project A (taskmanager)
PROJECT_NAME: taskmanager
DB_NAME: taskmanager_db_testing
GITHUB_REPO: username/taskmanager

# Project B (project-b)
PROJECT_NAME: project-b
DB_NAME: project_b_testing
GITHUB_REPO: username/project-b

# Project C (future-project)
PROJECT_NAME: future-project
DB_NAME: future_project_testing
GITHUB_REPO: username/future-project
```

### Shared Configuration

```yaml
# /etc/woodpecker/shared-config.yml
# Shared across all projects

global_env:
  BUN_VERSION: "1.4.2"
  NODE_VERSION: "24.20.0"
  GO_VERSION: "1.27"
  MAX_WORKERS: 2
  MAX_RAM: "2048"

shared_secrets:
  SNYK_TOKEN: shared_snyk_token
  GITHUB_TOKEN: shared_github_token
```

---

## File Permissions Important Notes

### Woodpecker File Permissions

```bash
# Woodpecker server and agent run as root by default
# Ensure proper permissions for mounted volumes

# Woodpecker data directory
sudo chown -R root:root /var/lib/woodpecker
sudo chmod -R 755 /var/lib/woodpecker

# PostgreSQL data directory
sudo chown -R 999:999 /var/lib/woodpecker/postgres
sudo chmod -R 700 /var/lib/woodpecker/postgres

# Woodpecker configuration
sudo chown root:root /etc/woodpecker/docker-compose.yml
sudo chmod 644 /etc/woodpecker/docker-compose.yml

# Systemd service
sudo chown root:root /etc/systemd/system/woodpecker.service
sudo chmod 644 /etc/systemd/system/woodpecker.service
```

### Project File Permissions

```bash
# Ensure .woodpecker.yml has correct permissions
chmod 644 .woodpecker.yml

# Ensure deployment scripts are executable
chmod +x scripts/deploy.sh
chmod +x scripts/coverage_analyzer.py

# Woodpecker agent needs read access to repository
# No special permissions needed for git clones
```

---

## Development Environment

### Local Development Setup

#### Windows/macOS (Docker Desktop)

```bash
# Install Docker Desktop
# https://www.docker.com/products/docker-desktop

# Use same docker-compose.yml
docker-compose up -d
```

#### Linux (Docker Engine)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Use same docker-compose.yml
docker-compose up -d
```

#### Linux/WSL (Podman)

```bash
# Install Podman
sudo apt install -y podman podman-compose

# Use same docker-compose.yml
podman-compose up -d

# Optional: Docker compatibility alias
alias docker=podman
alias docker-compose=podman-compose
```

### Bun Runtime for Frontend

```bash
# Install Bun (for frontend)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run frontend
bun run dev

# Build frontend
bun run build
```

---

## Deployment Script

### scripts/deploy.sh

```bash
#!/bin/bash
# scripts/deploy.sh - Manual deployment script

ENVIRONMENT=$1
PROJECT_NAME=${PROJECT_NAME:-taskmanager}

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: ./deploy.sh <staging|production>"
    exit 1
fi

echo "Deploying $PROJECT_NAME to $ENVIRONMENT..."

# Pull latest image from registry
podman pull ghcr.io/$GITHUB_USERNAME/$PROJECT_NAME-backend:latest

# Stop existing container
podman stop $PROJECT_NAME-backend || true
podman rm $PROJECT_NAME-backend || true

# Start new container
podman run -d \
  --name $PROJECT_NAME-backend \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DB_HOST=$DB_HOST \
  -e DB_PASSWORD=$DB_PASSWORD \
  ghcr.io/$GITHUB_USERNAME/$PROJECT_NAME-backend:latest

# Run smoke tests
bun run test:smoke

echo "Deployment to $ENVIRONMENT completed!"
```

---

## Troubleshooting

### Woodpecker Issues

**Agent not connecting:**
```bash
# Check agent logs
podman logs woodpecker-agent

# Check agent secret
echo $WOODPECKER_AGENT_SECRET

# Restart agent
podman restart woodpecker-agent
```

**Podman permission issues:**
```bash
# Check user namespaces
sysctl user.max_user_namespaces

# Enable user namespaces
echo "user.max_user_namespaces=15000" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Worker Resource Issues

**Out of memory:**
```bash
# Reduce to 1 worker
# Edit docker-compose.yml
WOODPECKER_MAX_PROCS=1

# Restart Woodpecker
sudo systemctl restart woodpecker
```

### File Permission Issues

**Permission denied on woodpecker.yaml:**
```bash
# Fix permissions
chmod 644 .woodpecker.yml

# Ensure file is not executable
chmod -x .woodpecker.yml
```

---

## Migration from GitHub Actions to Woodpecker

### Step 1: Export GitHub Actions Secrets

```bash
# Export secrets from GitHub Actions
# Save to Woodpecker UI as project secrets
```

### Step 2: Create .woodpecker.yml

```bash
# Create .woodpecker.yml in project root
# Copy template from this document
# Customize for project
```

### Step 3: Configure Woodpecker

```bash
# Add repository to Woodpecker
# Configure project settings
# Add secrets
# Enable project
```

### Step 4: Test Pipeline

```bash
# Push to feature branch
git push origin feature/test-woodpecker

# Check Woodpecker UI for pipeline status
# Verify all stages pass
```

### Step 5: Disable GitHub Actions

```bash
# Disable GitHub Actions workflows
# Delete .github/workflows directory
# Update documentation
```

---

## Best Practices

1. **Universal Configuration**: Use shared templates for multiple projects
2. **Resource Management**: Monitor RAM usage, adjust workers as needed
3. **File Permissions**: Always ensure correct permissions on Woodpecker files
4. **Secrets Management**: Use Woodpecker secrets, never commit secrets
5. **Testing**: Test pipeline thoroughly before disabling GitHub Actions
6. **Monitoring**: Monitor Woodpecker server health and agent status
7. **Backup**: Regular backups of Woodpecker database and configuration
8. **Updates**: Keep Woodpecker, Podman, and dependencies updated

---

## References

- [Woodpecker Documentation](https://woodpecker-ci.org/docs/)
- [Podman Documentation](https://docs.podman.io/)
- [Mergify Documentation](https://doc.mergify.io/)
- [Playwright Documentation](https://playwright.dev/)
- [OCI Documentation](https://docs.oracle.com/en-us/iaas/)
- [Supabase Documentation](https://supabase.com/docs)
- [Bun Documentation](https://bun.sh/docs)

---

## Questions?

For questions about Woodpecker CI/CD setup:
1. Check this documentation
2. Review Woodpecker logs
3. Check Woodpecker UI for pipeline status
4. Contact the team for project-specific issues
