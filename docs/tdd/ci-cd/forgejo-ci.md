# Forgejo CI/CD Configuration

**Version**: 2.0
**Date**: 2026-11-07
**Status**: Active

---

## Overview

This document defines the Forgejo CI/CD pipeline configuration. Forgejo is a self-hosted software forge with built-in Actions (GitHub Actions compatible) that runs on OCI Ubuntu 26.04 ARM64 using Podman.

**Architecture:**
- **Source of Truth**: GitHub (personal account)
- **CI/CD Platform**: Forgejo (self-hosted)
- **Integration**: GitHub Mirror → Forgejo
- **Pipeline**: Forgejo Actions (100% GitHub Actions compatible)

## Key Requirements

1. **GitHub Mirror**: Push to GitHub, mirror sync to Forgejo
2. **Cron Job**: Full E2E tests at midnight (00:00) on main branch
3. **Pipeline**: Build → Smoke Test → E2E (chromium, firefox, webkit) before merge to main
4. **Resource Limits**: Max 2GB RAM, 1-2 workers (universal for multiple projects)
5. **Storage**:
   - Neon for database CI-FORGEJO-OCI (metadata, logs, artifacts)
   - Neon for application database TaskmanagerV2 (separate project)
   - VM Storage (200GB on OCI) for video, photo, media files
6. **Deployment**: Manual deployment to OCI Podman
7. **Universal Setup**: Configured for 8 projects with GitHub mirror
8. **No-Cache Policy**: All pipeline stages use --no-cache to ensure clean builds
9. **Auto-Cleanup**: Session cleanup after pipeline completion (success or failure)

---

## Forgejo Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FORGEJO CI/CD ARCHITECTURE               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. GITHUB (Source of Truth)                                │
│     └── Repository: github.com/davidtan/taskmanagerV2        │
│                                                               │
│  2. GITHUB → FORGEJO MIRRORING                              │
│     ├── GitHub webhook → Forgejo mirror webhook            │
│     └── Forgejo pulls changes every 5 minutes               │
│                                                               │
│  3. FORGEJO SERVER (OCI Instance)                           │
│     ├── Domain: ci.davidcps.my.id                            │
│     ├── Database: Neon (CI-FORGEJO-OCI)                     │
│     └── Stores: Repositories, Actions configs, logs         │
│                                                               │
│  4. FORGEJO ACTIONS RUNNER (OCI Instance)                   │
│     ├── Runtime: Podman (rootless)                           │
│     ├── Resource: 2GB RAM                                    │
│     └── Executes: Pipelines in containers                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              PIPELINE FLOW                              │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  1. ON PUSH TO GITHUB (feature branches)                 │
│  │     ├── GitHub webhook triggers mirror sync              │
│  │     ├── Forgejo mirror sync completes                    │
│  │     ├── Forgejo Actions trigger:                         │
│  │     │   ├── Format check                                 │
│  │     │   ├── Lint check                                   │
│  │     │   ├── Type check                                   │
│  │     │   ├── Unit tests                                   │
│  │     │   └── Build check                                  │
│  │                                                           │ │
│  │  2. ON PR TO GITHUB (develop branch)                     │
│  │     ├── Mirror sync to Forgejo                           │
│  │     ├── All above checks                                 │
│  │     ├── Integration tests                               │
│  │     ├── Coverage analysis (hierarchical)                │
│  │     ├── Security scan                                    │
│  │     └── Smoke tests                                      │
│  │                                                           │ │
│  │  3. ON PUSH TO GITHUB (main branch)                      │
│  │     ├── Mirror sync to Forgejo                           │
│  │     ├── All PR checks                                    │
│  │     ├── Full E2E tests (chromium, firefox, webkit)      │
│  │     ├── Performance check                               │
│  │     └── Build and push to registry                      │
│  │                                                           │ │
│  │  4. CRON (00:00 daily on main - Forgejo)                 │
│  │     ├── Full E2E tests (all browsers)                   │
│  │     ├── Smoke tests                                      │
│  │     └── Health check                                     │
│  │                                                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Forgejo Server Setup (OCI Ubuntu 26.04 ARM64)

### Current Setup

**Platform**: OCI Ubuntu 26.04 ARM64 (Ampere A1.Flex)
**Container Runtime**: Podman 5.7.0
**Forgejo Version**: v17.0.1
**Database**: Neon PostgreSQL (project: CI-FORGEJO-OCI)
**SSL**: Let's Encrypt wildcard certificate
**Reverse Proxy**: Nginx with Cloudflare proxy
**Domain**: ci.davidcps.my.id

### Directory Structure

```
/home/ubuntu/apps/
├── forgejo/
│   ├── docker-compose.yml
│   └── .env (optional, can use env vars in compose)
└── forgejo-proxy/
    ├── docker-compose.yml
    └── nginx.conf
```

### Forgejo Docker Compose

```yaml
# /home/ubuntu/apps/forgejo/docker-compose.yml
version: '3.8'

services:
  forgejo:
    image: codeberg.org/forgejo/forgejo:7.0.1
    container_name: forgejo
    environment:
      # Database Configuration
      - FORGEJO__database__DB_TYPE=postgres
      - FORGEJO__database__HOST=ep-broad-king-azlvkfiu.c-3.ap-southeast-1.aws.neon.tech
      - FORGEJO__database__NAME=ci-forgejo-oci
      - FORGEJO__database__USER=ci-forgejo-oci_owner
      - FORGEJO__database__PASSWD=npg_g6D4amnjezEJ
      - FORGEJO__database__SSL_MODE=require
      
      # Server Configuration
      - FORGEJO__server__DOMAIN=ci.davidcps.my.id
      - FORGEJO__server__ROOT_URL=https://ci.davidcps.my.id
      - FORGEJO__server__SSH_DOMAIN=ci.davidcps.my.id
      - FORGEJO__server__SSH_PORT=2222
      - FORGEJO__server__HTTP_PORT=3000
      - FORGEJO__server__OFFLINE_MODE=false
      
      # Admin Account (Auto-created)
      - FORGEJO__admin__user=davidtan
      - FORGEJO__admin__password=<CHANGE_ME_USE_STRONG_PASSWORD>
      - FORGEJO__admin__email=admin@davidcps.my.id
      
      # Security
      - FORGEJO__security__INSTALL_LOCK=true
      - FORGEJO__security__DISABLE_REGISTRATION=true
      - FORGEJO__security__REQUIRE_SIGNIN_VIEW=true
      
      # Actions (CI/CD)
      - FORGEJO__actions__ENABLED=true
      
      # Timezone
      - TZ=Asia/Singapore
      
    volumes:
      - /home/ubuntu/forgejo-data:/data
    ports:
      - "3000:3000"
      - "2222:2222"
    networks:
      - forgejo-net
    restart: unless-stopped

networks:
  forgejo-net:
    external: true
```

### Nginx Reverse Proxy Configuration

```nginx
# /home/ubuntu/apps/forgejo-proxy/nginx.conf
user nginx;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name ci.davidcps.my.id;
        return 301 https://$host$request_uri;
    }

    # HTTPS - Forgejo
    server {
        listen 443 ssl;
        server_name ci.davidcps.my.id;

        ssl_certificate /etc/letsencrypt/live/davidcps.my.id/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/davidcps.my.id/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://forgejo:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

### Network Configuration

```bash
# Create shared network for containers
podman network create forgejo-net

# Start Forgejo
cd /home/ubuntu/apps/forgejo
podman-compose up -d

# Start Nginx reverse proxy
cd /home/ubuntu/apps/forgejo-proxy
podman-compose up -d
```

### Firewall Configuration (iptables)

```bash
# Add iptables rules for HTTP/HTTPS/SSH
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 2222 -j ACCEPT

# Make persistent
sudo netfilter-persistent save
```

### SSL Certificate (Let's Encrypt Wildcard)

Certificate already exists from previous Woodpecker setup:
- Full chain: `/etc/letsencrypt/live/davidcps.my.id/fullchain.pem`
- Private key: `/etc/letsencrypt/live/davidcps.my.id/privkey.pem`
- Auto-renewal: Configured by certbot (systemd timer)

### Neon Database Configuration

**Current Setup:**
- Database: Neon PostgreSQL
- Project: CI-FORGEJO-OCI (muddy-bread-34400791)
- Database Name: ci-forgejo-oci
- Region: aws-ap-southeast-1
- Schema: Created automatically by Forgejo

**Connection String:**
```
postgresql://ci-forgejo-oci_owner:npg_g6D4amnjezEJ@ep-broad-king-azlvkfiu.c-3.ap-southeast-1.aws.neon.tech/ci-forgejo-oci?sslmode=require
```

**Benefits of Neon:**
- ✅ Auto-backup and point-in-time recovery
- ✅ Scalable storage (no local storage limits)
- ✅ No maintenance (managed by Neon)
- ✅ Pricing based on usage (cost-effective for CI/CD)
- ✅ High availability and durability

**Important Security Note:**
- Password stored in docker-compose.yml should be rotated regularly
- Use file permissions 600 to restrict access
- Consider using encrypted secrets for production

---

## GitHub Mirror Configuration

### Why GitHub Mirror?

**Architecture Decision:**
- GitHub remains as "source of truth" for code
- Forgejo provides CI/CD pipeline execution
- Mirror sync ensures Forgejo always has latest code
- Developers continue using GitHub workflow

### Setup GitHub Mirror in Forgejo

**Step 1: Create Repository in Forgejo**
1. Login to Forgejo: https://ci.davidcps.my.id
2. Click "+" → "New Repository"
3. Repository name: `taskmanagerV2`
4. Description: "Mirror from GitHub"
5. Visibility: Private
6. Click "Create Repository"

**Step 2: Configure Mirror Settings**
1. Go to repository → Settings → Repository Settings
2. Scroll to "Mirroring Settings"
3. Click "Add Mirror"
4. Repository URL: `https://github.com/davidtan/taskmanagerV2.git`
5. Direction: "Pull from remote"
6. Sync interval: Every 5 minutes
7. Click "Add Mirror"

**Step 3: Configure GitHub Webhook (Optional)**
1. Go to GitHub repository → Settings → Webhooks
2. Add webhook: `https://ci.davidcps.my.id/api/v1/repos/davidtan/taskmanagerV2/hooks/git-mirror`
3. Content type: application/json
4. Events: Push events
5. Click "Add webhook"

**Verification:**
```bash
# Trigger manual sync in Forgejo UI
# Repository → Actions → Sync Now

# Check last sync time
# Repository → Settings → Mirroring Settings
```

---

## Forgejo Actions Runner Setup

### Runner Architecture

**Forgejo Actions Runner** is similar to GitHub Actions runner but connects to Forgejo server.

**Setup Location:** OCI Instance (same as Forgejo server)
**Runtime:** Podman (rootless)
**Resource:** 2GB RAM limit
**Network:** forgejo-net

### Runner Installation

```bash
# SSH to OCI instance
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@149.118.41.53

# Create runner directory
mkdir -p /home/ubuntu/apps/forgejo-runner
cd /home/ubuntu/apps/forgejo-runner

# Download Forgejo Actions Runner
curl -o runner https://code.forgejo.org/forgejo/runner/releases/download/v3.5.1/runner-linux-arm64
chmod +x runner

# Register runner (get token from Forgejo UI)
# Repository → Settings → Actions → Runners → New Runner
./runner register --instance https://ci.davidcps.my.id --token YOUR_RUNNER_TOKEN

# Configure runner
./runner config

# Start runner as service
./runner daemon
```

### Runner Configuration

**Config file: `.runner`**
```yaml
runner:
  capacity: 1
  envs:
    BUN_VERSION: 1.4.2
    GO_VERSION: 1.27
  labels:
    - linux
    - arm64
    - podman
```

### Resource Limits

**Memory Limit:** 2GB per job
**Timeout:** 30 minutes per job
**Auto-cleanup:** Enabled

---

## Forgejo Pipeline Configuration (.forgejo/workflows/*.yml)

### Universal Template (for Multiple Projects)

```yaml
# .forgejo/workflows/ci.yml
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

  # Stage 7: Full E2E Tests (Push to main and cron at midnight)
  e2e-tests-chromium:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    container:
      image: mcr.microsoft.com/playwright:v1.63.0
      options: --userns=keep-id
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install --no-cache
      
      - name: Install Playwright Browsers
        run: bunx playwright install --with-deps chromium
      
      - name: Run E2E tests - Chromium
        run: bun run test:e2e --project=chromium
        env:
          CI: true
          PLAYWRIGHT_BROWSERS_PATH: 0

  e2e-tests-firefox:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: e2e-tests-chromium
    container:
      image: mcr.microsoft.com/playwright:v1.63.0
      options: --userns=keep-id
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install --no-cache
      
      - name: Install Playwright Browsers
        run: bunx playwright install --with-deps firefox
      
      - name: Run E2E tests - Firefox
        run: bun run test:e2e --project=firefox
        env:
          CI: true
          PLAYWRIGHT_BROWSERS_PATH: 0

  e2e-tests-webkit:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: e2e-tests-firefox
    container:
      image: mcr.microsoft.com/playwright:v1.63.0
      options: --userns=keep-id
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install --no-cache
      
      - name: Install Playwright Browsers
        run: bunx playwright install --with-deps webkit
      
      - name: Run E2E tests - WebKit
        run: bun run test:e2e --project=webkit
        env:
          CI: true
          PLAYWRIGHT_BROWSERS_PATH: 0

  # Stage 8: Performance Check (Push to main only)
  performance-check:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [e2e-tests-webkit]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install
      
      - name: Build
        run: bun run build
      
      - name: Run Lighthouse
        run: bun run lighthouse

  # Stage 9: Build and Push (Push to main only)
  build:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [performance-check]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: ${{ env.BUN_VERSION }}
      
      - name: Install dependencies
        run: bun install
      
      - name: Build frontend
        run: bun run build
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}
      
      - name: Build backend
        run: go build -o bin/app ./cmd/api

  # Stage 10: Manual Deployment (Manual trigger only)
  deploy-staging:
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch'
    environment: staging
    steps:
      - name: Deploy to staging
        run: ./scripts/deploy.sh staging

  deploy-production:
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch'
    environment: production
    steps:
      - name: Deploy to production
        run: ./scripts/deploy.sh production
```

---

## Cron Job Configuration (Midnight E2E Tests)

### Forgejo Cron Job (Jam 00:00)

**Konfigurasi Cron Job di .forgejo/workflows/ci.yml:**

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Midnight daily
```

**Setup Cron Job di Forgejo UI:**

1. Buka Forgejo UI → Repository Settings → Actions
2. Configure schedule in workflow file
3. No additional UI setup needed (unlike Woodpecker)

**Cron Schedule Format:**
- `0 0 * * *` = Setiap hari jam 00:00 (midnight)
- Format: `minute hour day month day-of-week`
- Untuk testing: gunakan `*/5 * * * *` (setiap 5 menit)

---

## Playwright Configuration for CI/CD

**playwright.config.ts:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: 1,  // 1 worker untuk 2GB RAM
  use: {
    // --no-sandbox untuk Podman rootless (acceptable untuk CI/CD)
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    headless: true,
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
  ],
});
```

---

## Auto-Cleanup Session Configuration

**Forgejo Actions Runner Auto-cleanup:**

Forgejo Actions runner automatically cleans up containers after job completion. Additional cleanup can be configured in runner config:

```yaml
runner:
  cleanup:
    enabled: true
    schedule: '0 */6 * * *'  # Every 6 hours
```

---

## Summary of Changes from Woodpecker

| Aspect | Woodpecker | Forgejo |
|--------|-----------|---------|
| Platform | Woodpecker Server + Agent | Forgejo Server + Actions Runner |
| Database | CI-WOODPECKER-OCI | CI-FORGEJO-OCI |
| Integration | GitHub OAuth | GitHub Mirror |
| Pipeline Config | .woodpecker.yml | .forgejo/workflows/*.yml |
| Syntax | Woodpecker-specific | GitHub Actions compatible |
| Runner | Woodpecker Agent | Forgejo Actions Runner |
| Cron | UI + YAML | YAML only |
| Source of Truth | GitHub | GitHub (mirror) |

---

## Migration Guide

### For Existing Projects

1. **Create repository in Forgejo**
2. **Setup GitHub mirror**
3. **Copy .woodpecker.yml to .forgejo/workflows/ci.yml**
4. **Convert Woodpecker syntax to GitHub Actions syntax**
5. **Test pipeline**
6. **Delete .woodpecker.yml**

### Syntax Conversion Examples

**Woodpecker:**
```yaml
pipeline:
  test:
    image: oven/bun:1.4.2
    commands:
      - bun run test
```

**Forgejo Actions:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: 1.4.2
      - run: bun run test
```

---

## Troubleshooting

### Common Issues

**Mirror sync not working:**
- Check GitHub webhook configuration
- Verify mirror settings in Forgejo
- Check Forgejo logs for sync errors

**Runner not picking up jobs:**
- Verify runner is online in Forgejo UI
- Check runner logs: `./runner logs`
- Ensure runner labels match job requirements

**Playwright sandbox errors:**
- Ensure `--no-sandbox` flag is set
- Check Podman permissions
- Verify container networking

**Database connection errors:**
- Verify Neon connection string
- Check SSL mode is set to `require`
- Test connection: `psql -h host -U user -d database`
