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
- **No-Cache Policy**: All pipeline stages use --no-cache for clean builds
- **Auto-Cleanup**: Session cleanup after pipeline completion (success or failure)

### 4. Frontend Runtime
- **From**: Node.js (JavaScript runtime)
- **To**: Bun (JavaScript runtime and package manager for frontend - TypeScript/JavaScript)
- **Note**: Backend continues to use Go runtime with stdlib + Chi router

### 5. Storage Strategy
- **Metadata**: Supabase (PostgreSQL) - text metadata + links to VM storage
- **Media Files**: VM Storage (200GB on OCI Debian 26 LTS) - video, photo, media files
- **Media URLs**: VM storage sends links to Supabase database
- **CI/CD Artifacts**: OCI Object Storage (10GB Standard tier PAYG) - Woodpecker artifacts

---

## File Changes

### New Files Created

1. **docs/tdd/ci-cd/woodpecker-ci.md**
   - Complete Woodpecker CI/CD configuration guide
   - Universal template for multiple projects
   - Installation and setup instructions
   - File permissions guide
   - Cron job configuration (midnight E2E tests)
   - Auto-cleanup session configuration
   - No-cache policy configuration

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
   - Updated storage strategy (VM Storage for media files, OCI Object Storage for CI/CD artifacts)
   - Updated frontend runtime to Bun

5. **docs/tdd/project/dependencies.md**
   - Updated Bun as JavaScript runtime for frontend (TypeScript/JavaScript)
   - Clarified Go runtime for backend (stdlib + Chi router)
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

### 5. Configure Cron Job (Nightly E2E Tests at 00:00)

**Setup Cron Job di Woodpecker UI**:

1. Buka Woodpecker UI → Project Settings → Cron Jobs
2. Add new cron job:
   - Name: `nightly-e2e-full-test`
   - Schedule: `0 0 * * *` (midnight daily)
   - Branch: `main`
   - Execute pipeline: `true`

**Testing Cron Job**:

Untuk testing, gunakan schedule yang lebih frequent:
```yaml
cron: "*/5 * * * *"  # Setiap 5 menit (untuk testing)
```

Setelah testing berhasil, kembali ke production schedule:
```yaml
cron: "0 0 * * *"  # Midnight daily
```

**Cron Job yang Dijalankan**:
- E2E tests (chromium, firefox, webkit)
- Smoke tests
- Health check
- Session cleanup (auto)

### 6. Configure Auto-Cleanup Session

**Stage 11: Cleanup Session** sudah ditambahkan di `.woodpecker.yml`:

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

**Woodpecker Agent Configuration** (di docker-compose.yml):

```yaml
woodpecker-agent:
  image: woodpeckerci/woodpecker-agent:latest
  environment:
    - WOODPECKER_SERVER=woodpecker-server:9000
    - WOODPECKER_AGENT_SECRET=${WOODPECKER_AGENT_SECRET}
    - WOODPECKER_MAX_PROCS=2
    - WOODPECKER_LIMIT_MEM=2048
    - WOODPECKER_LIMIT_TIMEOUT=1800  # 30 minutes timeout
    - WOODPECKER_CLEANUP=true  # Auto-cleanup after pipeline
```

**Benefits**:
- Workers tidak menumpuk cache dan artifacts
- Storage lebih hemat
- Mencegah resource exhaustion
- Pipeline lebih predictable

### 7. Configure No-Cache Policy

**Clone Configuration**:
```yaml
clone:
  git:
    image: woodpeckerci/plugin-git:latest
    depth: 1  # Shallow clone
    tags: false  # Don't fetch tags
```

**Dependency Installation**:
```yaml
# Frontend (Bun)
quality-checks:
  image: oven/bun:*bun_version
  commands:
    - rm -rf node_modules .bun
    - bun install --no-cache
    - bun run format:check
    - bun run lint
    - bun run type-check

# Backend (Go)
unit-tests-backend:
  image: golang:*go_version
  commands:
    - go clean -cache -modcache
    - go test ./... -short -cover
```

**Benefits**:
- Consistent builds (install dependencies fresh)
- No cache corruption issues
- Storage savings
- Faster cleanup
- More predictable build times

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
    media_urls TEXT[]  -- Array of VM storage file paths/URLs (links to 200GB VM storage)
    -- ... other fields
);
```

### VM Storage for Media Files (200GB on OCI Debian 26 LTS)

**Storage Location**: `/var/www/media/` on OCI Debian 26 LTS server

```bash
# Create media storage directory
sudo mkdir -p /var/www/media/videos
sudo mkdir -p /var/www/media/photos
sudo mkdir -p /var/www/media/documents

# Set permissions
sudo chown -R www-data:www-data /var/www/media
sudo chmod -R 755 /var/www/media

# Access via backend API
# Backend serves files: https://yourdomain.com/media/videos/video.mp4
```

**Backend Integration**:
```go
// Upload file to VM storage
func UploadToVMStorage(file io.Reader, filename string) (string, error) {
    // Save to /var/www/media/
    // Return file path for database storage
    return "/media/videos/" + filename, nil
}

// Task with media
type Task struct {
    ID          uuid.UUID
    Title       string
    Description string
    MediaURLs   []string  // VM storage file paths/URLs
    // ... other fields
}
```

**VM Storage → Supabase Link**:
1. Backend uploads file to VM Storage (/var/www/media/)
2. Backend generates URL or file path
3. Backend stores URL/path in Supabase database (media_urls column)
4. Frontend retrieves URL from Supabase and displays media

### OCI Object Storage for CI/CD Artifacts (10GB Standard tier PAYG)

```bash
# Install OCI CLI
sudo apt install -y oracle-cloud-cli

# Configure OCI CLI
oci setup config

# Create bucket for CI/CD artifacts with 5-day auto-cleanup
oci os bucket create \
  --compartment-id $COMPARTMENT_ID \
  --name woodpecker-artifacts \
  --public-access-type NoPublicAccess \
  --object-lifecycle-rule-age-days 5
```

**Penting**: `--object-lifecycle-rule-age-days 5` akan otomatis menghapus semua artifacts setelah 5 hari. Dengan OCI Object Storage 10GB Standard tier PAYG, 5-day retention adalah optimal untuk menghemat storage. Bisa ubah angka 5 ke berapa hari yang Anda mau (7, 10, dll), tapi ingat storage limit 10GB.

**Storage Usage dengan 5-day retention**:
- Daily usage: ~635 MB
- 5-day rolling window: ~3.175 GB
- OCI Object Storage limit: 10 GB
- Remaining buffer: 6.825 GB ✅

Untuk detail lebih lanjut tentang artifact management, lihat [Woodpecker Artifact Management](./docs/tdd/ci-cd/woodpecker-artifacts.md).

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
- [x] Configure cron job for midnight E2E tests
- [x] Configure auto-cleanup session after pipeline
- [x] Configure no-cache policy for all pipeline stages
- [x] Update storage configuration (10GB Standard tier PAYG for CI/CD artifacts, VM Storage for media files)
- [ ] Install Woodpecker on OCI server
- [ ] Configure Cloudflare SSL
- [ ] Configure Woodpecker project
- [ ] Add Woodpecker secrets
- [ ] Test pipeline on feature branch
- [ ] Configure cron job in Woodpecker UI (0 0 * * *)
- [ ] Test cron job execution
- [ ] Verify auto-cleanup after pipeline
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
5. Update docker-compose.yml with WOODPECKER_CLEANUP=true and WOODPECKER_LIMIT_TIMEOUT=1800
6. Test pipeline on feature branch
7. Configure cron job in Woodpecker UI (nightly-e2e-full-test, 0 0 * * *)
8. Test cron job execution (use */5 * * * * for testing first)
9. Verify auto-cleanup after pipeline completion
10. Disable GitHub Actions after successful testing
11. Deploy to production

---

**Document Owner**: Development Team  
**Last Updated**: 2026-11-01  
**Status**: Ready for Implementation
