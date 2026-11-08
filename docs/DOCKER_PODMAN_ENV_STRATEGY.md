# Environment Variables Strategy: Docker (Dev) and Podman (Production)

This document explains the strategy for managing environment variables across development (Docker) and production (Podman) environments.

## Architecture Overview

```
Development (Local Machine):
- Runtime: Docker OR Podman (team choice)
- Env Source: .env file (local)
- Build: Docker/Podman image locally
- Push: Push to GHCR
- Registry: GitHub Container Registry (GHCR)

CI/CD (Forgejo Actions on OCI):
- Runtime: Podman (runner)
- Env Source: Forgejo Secrets
- Pull: Pull from GHCR (image built by dev)
- Test: Run tests
- Registry: GHCR

Production (OCI Instance):
- Runtime: Podman
- Env Source: .env.production file (server)
- Pull: Pull from GHCR
- Registry: GHCR
```

**Note:**
- Forgejo app (UI, API) runs in Podman containers on OCI
- Forgejo Actions runner runs with Podman (consistent with Forgejo app)
- Development team can use Docker or Podman (both supported)
- **Docker images built by Docker users can be run by Podman in CI/CD**
- Image format is universal (OCI compliant)

## File Structure

```
taskmanagerV2/
├── .env                          # Development env (di-ignore)
├── .env.example                  # Development template (di-commit)
├── .env.production               # Production env (di-ignore, server only)
├── .env.production.example       # Production template (di-commit)
├── .env.test                    # Test env (di-ignore, CI/CD only)
├── .env.test.example            # Test template (di-commit)
├── docker-compose.yml            # Local Docker compose
├── docker-compose.prod.yml       # Production Podman compose
└── .forgejo/
    └── workflows/
        └── ci.yml                # CI/CD workflow
```

## Environment Layers

### 1. Development Environment

**Target:** Local developers using Docker

**Env Source:** `.env` file (local machine)

**File:** `.env.example` (template)
```bash
# Database (Local Development)
POSTGRES_USER=dev_user
POSTGRES_PASSWORD=dev_password
POSTGRES_DB=taskmanager_dev
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/taskmanager_dev

# Neon Database (for testing with Neon)
NEON_API_KEY=your-neon-api-key
NEON_DATABASE_URL=postgresql://user:password@neon-host/db

# Application
NODE_ENV=development
PORT=3000

# API Keys
FORGEJO_TOKEN=your-forgejo-token
GITHUB_TOKEN=your-github-token
```

**Usage:**
```bash
# Copy template
cp .env.example .env

# Edit with actual values
nano .env

# Run with Docker
docker-compose up --build
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    env_file:
      - .env  # Load from local .env
    ports:
      - "3000:3000"
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: taskmanager_db
```

---

### 2. CI/CD Environment

**Target:** Forgejo Actions runner on OCI instance

**Runtime:** Podman (consistent with Forgejo app)

**Env Source:** Forgejo Secrets

**Important:**
- Dev builds image with Docker OR Podman (team choice)
- Dev pushes image to GHCR
- Forgejo runner (Podman) pulls from GHCR
- **Docker images are compatible with Podman - both can use same image**
- No issue if dev uses Docker and CI/CD uses Podman

**Setup in Forgejo:**
1. Repository → Settings → Secrets
2. Add secrets:
   - `TEST_DATABASE_URL` - Test database connection string
   - `NEON_API_KEY` - Neon API key for tests
   - `GITHUB_TOKEN` - GitHub token for pushing images

**Forgejo Workflow:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          podman build -t ghcr.io/casestudyprogramming/taskmanager-backend:${{ github.sha }} ./backend
      
      - name: Login to GHCR
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u casestudyprogramming --password-stdin
      
      - name: Push to GHCR
        run: |
          docker push ghcr.io/casestudyprogramming/taskmanager-backend:${{ github.sha }}
      
      - name: Run tests
        run: |
          docker run --env TEST_DATABASE_URL="${{ secrets.TEST_DATABASE_URL }}" \
            ghcr.io/casestudyprogramming/taskmanager-backend:${{ github.sha }} \
            npm test
```

---

### 3. Production Environment

**Target:** OCI instance with Podman

**Env Source:** `.env.production` file (on server)

**File:** `.env.production.example` (template)
```bash
# Database (Production)
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=<CHANGE_ME_STRONG_PASSWORD>
POSTGRES_DB=taskmanager_prod
DATABASE_URL=postgresql://prod_user:<CHANGE_ME>@db-host:5432/taskmanager_prod

# Neon Database (if using Neon)
NEON_API_KEY=<CHANGE_ME_NEON_API_KEY>
NEON_DATABASE_URL=postgresql://user:<CHANGE_ME>@neon-host/db

# Application
NODE_ENV=production
PORT=3000

# API Keys
FORGEJO_TOKEN=<CHANGE_ME>
GITHUB_TOKEN=<CHANGE_ME>

# CORS
ALLOWED_ORIGINS=https://davidcps.my.id

# Logging
LOG_LEVEL=info
```

**Setup on OCI Instance:**
```bash
# SSH to OCI instance
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip>

# Clone repository
git clone https://github.com/CaseStudyProgramming/TaskmanagerV2.git
cd TaskmanagerV2

# Copy production env template
cp .env.production.example .env.production

# Edit with actual production values
nano .env.production
```

**docker-compose.prod.yml:**
```yaml
version: '3.8'
services:
  backend:
    image: ghcr.io/casestudyprogramming/taskmanager-backend:latest
    env_file:
      - .env.production  # Load from server .env.production
    ports:
      - "3000:3000"
    depends_on:
      - db
    restart: unless-stopped
  
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    restart: unless-stopped
```

**Run with Podman:**
```bash
# On OCI instance
podman-compose -f docker-compose.prod.yml up -d
```

---

## Workflow Summary

### Developer Workflow

1. **Clone repository**
   ```bash
   git clone https://github.com/CaseStudyProgramming/TaskmanagerV2.git
   cd TaskmanagerV2
   ```

2. **Setup development env**
   ```bash
   cp .env.example .env
   nano .env  # Fill in actual values
   ```

3. **Run locally with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Test locally**
   ```bash
   docker-compose exec backend npm test
   ```

5. **Build image**
   ```bash
   docker build -t taskmanager-backend ./backend
   ```

6. **Push to GHCR**
   ```bash
   docker tag taskmanager-backend ghcr.io/casestudyprogramming/taskmanager-backend:latest
   docker push ghcr.io/casestudyprogramming/taskmanager-backend:latest
   ```

7. **Submit PR to GitHub**
   - PR triggers CI/CD
   - CI/CD builds and tests
   - If passes, merge to main

---

### CI/CD Workflow (Forgejo Actions)

1. **Trigger:** Push or PR to GitHub
2. **Checkout:** Pull code from GitHub
3. **Build:** Build Docker image
4. **Test:** Run tests with CI secrets
5. **Push:** Push image to GHCR
6. **Tag:** Tag with SHA or branch name

---

### Production Deployment Workflow

1. **SSH to OCI instance**
   ```bash
   ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip>
   ```

2. **Pull latest code**
   ```bash
   cd /home/ubuntu/apps/TaskmanagerV2
   git pull origin main
   ```

3. **Pull latest image from GHCR**
   ```bash
   podman pull ghcr.io/casestudyprogramming/taskmanager-backend:latest
   ```

4. **Update container**
   ```bash
   podman-compose -f docker-compose.prod.yml down
   podman-compose -f docker-compose.prod.yml up -d
   ```

5. **Verify deployment**
   ```bash
   podman ps
   curl http://localhost:3000/health
   ```

---

## Security Best Practices

### Development
- ✅ `.env` file di-ignore dari Git
- ✅ Local env values only
- ✅ Use test databases for development

### CI/CD
- ✅ Secrets in Forgejo (not in code)
- ✅ Test environment isolated
- ✅ Rotate secrets regularly

### Production
- ✅ `.env.production` di-ignore dari Git
- ✅ Strong passwords for production
- ✅ File permissions 600 on .env.production
- ✅ Rotate production credentials regularly

### GitIgnore Configuration
```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.development
.env.production
.env.test
```

---

## Troubleshooting

### Issue: Env variables not loading in Docker

**Solution:**
```bash
# Verify .env file exists
ls -la .env

# Check docker-compose.yml has env_file
cat docker-compose.yml | grep env_file

# Test with specific env
docker-compose config
```

### Issue: Podman can't find .env.production

**Solution:**
```bash
# Verify file exists on server
ls -la .env.production

# Check permissions
chmod 600 .env.production

# Verify docker-compose.prod.yml path
podman-compose -f docker-compose.prod.yml config
```

### Issue: CI/CD tests failing due to missing env

**Solution:**
```bash
# Check Forgejo secrets
# Repository → Settings → Secrets

# Verify secret names match workflow
# Ensure secrets are set for the correct repository
```

---

## Summary

| Environment | Runtime | Env Source | Container Tool |
|-------------|---------|------------|----------------|
| Development | Docker | .env (local) | Docker Compose |
| CI/CD | Docker | Forgejo Secrets | Docker |
| Production | Podman | .env.production (server) | Podman Compose |

**Key Points:**
- Development uses Docker with local .env
- CI/CD uses Docker with Forgejo secrets
- Production uses Podman with server .env.production
- All env files (.env, .env.production) are ignored from Git
- Only templates (.env.example, .env.production.example) are committed
