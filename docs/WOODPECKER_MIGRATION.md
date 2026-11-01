# Woodpecker CI/CD Migration Summary

**Date**: 2026-11-01  
**Status**: Complete

---

## Overview

This document summarizes the migration from GitHub Actions to Woodpecker CI/CD for the Advanced Task Manager project.

## Key Changes

### 1. CI/CD Platform
- **From**: GitHub Actions
- **To**: Woodpecker CI (self-hosted on OCI Debian 26 LTS)

### 2. Infrastructure
- **Server**: OCI Debian 26 LTS with Podman
- **Workers**: 1-2 workers (2GB RAM each)
- **Registry**: GitHub Container Registry (GHCR) or OCI Container Registry
- **SSL**: Cloudflare Free SSL

### 3. Pipeline Changes
- **Cron Job**: Full E2E tests at midnight (00:00) on main branch
- **E2E Tests**: Playwright with chromium, firefox, webkit
- **PR Batching**: Mergify for batching 3 PRs (free tier)
- **Deployment**: Manual deployment trigger

### 4. Frontend Runtime
- **From**: Node.js
- **To**: Bun (package manager and runtime)

### 5. Storage Strategy
- **Metadata**: Supabase (PostgreSQL)
- **Media Files**: OCI Object Storage (200GB)
- **Media URLs**: Stored in Supabase database

---

## File Changes

### New Files Created

1. **docs/tdd/ci-cd/woodpecker-ci.md**
   - Complete Woodpecker CI/CD configuration guide
   - Universal template for multiple projects
   - Installation and setup instructions
   - File permissions guide

2. **.woodpecker.yml**
   - Woodpecker pipeline configuration
   - Universal template for Project A, Project B, etc.
   - All pipeline stages defined

3. **.mergify.yml**
   - PR batching configuration
   - Batches 3 PRs at once (free tier)
   - Automatic merge rules

4. **scripts/deploy.sh**
   - Manual deployment script
   - Staging and production deployment
   - Smoke tests after deployment

### Updated Files

1. **docs/README.md**
   - Added Woodpecker CI/CD documentation link
   - Marked GitHub Actions as deprecated

2. **docs/tdd/README.md**
   - Added Woodpecker CI/CD documentation link
   - Marked GitHub Actions as deprecated

3. **docs/tdd/ci-cd/workflow.md**
   - Updated pipeline stages for Woodpecker
   - Added cron job configuration
   - Updated workflow steps

4. **docs/prd.md**
   - Updated infrastructure section
   - Added Woodpecker CI/CD
   - Added Mergify for PR batching
   - Added OCI Object Storage
   - Updated frontend runtime to Bun

5. **docs/tdd/project/dependencies.md**
   - Updated Bun as runtime (not just package manager)
   - Added Woodpecker CI/CD dependency
   - Added Mergify dependency

---

## Setup Steps

### 1. Install Woodpecker on OCI Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Podman
sudo apt install -y podman podman-compose

# Create woodpecker directory
sudo mkdir -p /etc/woodpecker
sudo mkdir -p /var/lib/woodpecker

# Create docker-compose.yml (see woodpecker-ci.md)
sudo nano /etc/woodpecker/docker-compose.yml

# Enable and start Woodpecker
sudo systemctl enable woodpecker
sudo systemctl start woodpecker
```

### 2. Configure Cloudflare

```bash
# Add CNAME record in Cloudflare
# ci.yourdomain.com → your-oci-instance-ip
```

### 3. Configure Woodpecker Project

1. Add repository to Woodpecker
2. Configure project settings
3. Add secrets (SNYK_TOKEN, GITHUB_USERNAME, GITHUB_TOKEN)
4. Enable project

### 4. Test Pipeline

```bash
# Push to feature branch
git push origin feature/test-woodpecker

# Check Woodpecker UI for pipeline status
```

### 5. Configure Cron Job

```bash
# Add cron job in Woodpecker UI
# Schedule: 0 0 * * * (midnight daily)
# Branch: main
```

---

## Universal Configuration

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
```

### Shared Configuration

```yaml
# /etc/woodpecker/shared-config.yml
global_env:
  BUN_VERSION: "1.4.2"
  NODE_VERSION: "24.20.0"
  GO_VERSION: "1.27"
  MAX_WORKERS: 2
  MAX_RAM: "2048"
```

---

## Development Environment

### Local Development (All Platforms)

```bash
# Windows/macOS (Docker Desktop)
docker-compose up -d

# Linux (Docker Engine)
docker-compose up -d

# Linux/WSL (Podman)
podman-compose up -d
```

### Bun Runtime for Frontend

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run frontend
bun run dev

# Build frontend
bun run build
```

---

## File Permissions Important Notes

### Woodpecker File Permissions

```bash
# Woodpecker data directory
sudo chown -R root:root /var/lib/woodpecker
sudo chmod -R 755 /var/lib/woodpecker

# PostgreSQL data directory
sudo chown -R 999:999 /var/lib/woodpecker/postgres
sudo chmod -R 700 /var/lib/woodpecker/postgres

# Woodpecker configuration
sudo chown root:root /etc/woodpecker/docker-compose.yml
sudo chmod 644 /etc/woodpecker/docker-compose.yml
```

### Project File Permissions

```bash
# Ensure .woodpecker.yml has correct permissions
chmod 644 .woodpecker.yml

# Ensure deployment scripts are executable
chmod +x scripts/deploy.sh
```

---

## Storage Strategy

### Supabase for Metadata

```sql
-- Database schema for metadata
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    media_urls TEXT[]  -- Array of OCI Object Storage URLs
    -- ... other fields
);
```

### OCI Object Storage for Media Files

```bash
# Install OCI CLI
sudo apt install -y oracle-cloud-cli

# Configure OCI CLI
oci setup config

# Create bucket
oci os bucket create \
  --compartment-id $COMPARTMENT_ID \
  --name taskmanager-media

# Upload file
oci os object put \
  --bucket-name taskmanager-media \
  --file /path/to/file.jpg

# Get pre-authenticated URL
oci os preauth-request create \
  --bucket-name taskmanager-media \
  --name file.jpg
```

---

## Migration Checklist

- [x] Create Woodpecker CI/CD documentation
- [x] Create .woodpecker.yml configuration
- [x] Create .mergify.yml configuration
- [x] Create scripts/deploy.sh
- [x] Update workflow.md
- [x] Update PRD.md
- [x] Update dependencies.md
- [x] Update README.md files
- [ ] Install Woodpecker on OCI server
- [ ] Configure Cloudflare SSL
- [ ] Configure Woodpecker project
- [ ] Add Woodpecker secrets
- [ ] Test pipeline on feature branch
- [ ] Configure cron job
- [ ] Disable GitHub Actions (after testing)
- [ ] Deploy to staging
- [ ] Deploy to production

---

## Troubleshooting

### Woodpecker Issues

**Agent not connecting:**
```bash
podman logs woodpecker-agent
podman restart woodpecker-agent
```

**Podman permission issues:**
```bash
echo "user.max_user_namespaces=15000" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Worker Resource Issues

**Out of memory:**
```bash
# Reduce to 1 worker
WOODPECKER_MAX_PROCS=1
```

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

## Next Steps

1. Install Woodpecker on OCI server
2. Configure Cloudflare SSL
3. Add repository to Woodpecker
4. Configure project settings and secrets
5. Test pipeline on feature branch
6. Configure cron job for midnight E2E tests
7. Disable GitHub Actions after successful testing
8. Deploy to production

---

**Document Owner**: Development Team  
**Last Updated**: 2026-11-01  
**Status**: Ready for Implementation
