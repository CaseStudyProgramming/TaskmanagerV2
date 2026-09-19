# Dependency Versions Documentation

## Overview

This document specifies the exact dependency versions for the Advanced Task Manager project's backend and frontend. All versions are the latest stable releases as of September 2025, ensuring compatibility, security, and performance.

---

## Frontend Dependencies

### Core Framework & Language

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v24.20.0 | JavaScript runtime |
| **TypeScript** | ^5.6.0 | Type-safe JavaScript |
| **SvelteKit** | ^2.8.0 | Web framework |
| **Svelte** | ^5.20.0 | UI framework |
| **Vite** | ^6.0.0 | Build tool and dev server |

### Package Manager

| Dependency | Version | Purpose |
|------------|---------|---------|
| **bun** | ^1.2.0 | Fast package manager and runtime |

### Styling

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | ^4.0.0 | Utility-first CSS framework |
| **PostCSS** | ^8.4.49 | CSS transformation |
| **Autoprefixer** | ^10.4.20 | CSS vendor prefixing |

### Validation & Schema

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Zod** | ^4.0.0 | Schema validation and type inference |

### Code Quality

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Biome.js** | ^2.0.0 | Linting and formatting (ESLint/Prettier replacement) |
| **@biomejs/biome** | ^2.0.0 | Biome CLI tool |

### Testing

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Vitest** | ^3.0.0 | Unit testing framework |
| **@testing-library/svelte** | ^5.0.0 | Component testing utilities |
| **@testing-library/jest-dom** | ^6.6.0 | Custom Jest matchers |
| **Playwright** | ^1.50.0 | E2E testing framework |
| **@playwright/test** | ^1.50.0 | Playwright test runner |

### Build & Development Tools

| Dependency | Version | Purpose |
|------------|---------|---------|
| **svelte-preprocess** | ^6.0.0 | Svelte preprocessor for TypeScript/PostCSS |
| **@sveltejs/adapter-vercel** | ^5.0.0 | Vercel deployment adapter |
| **@sveltejs/adapter-static** | ^3.0.0 | Static site generation adapter |

### API & HTTP

| Dependency | Version | Purpose |
|------------|---------|---------|
| **axios** | ^1.7.9 | HTTP client (optional, can use native fetch) |

### Offline & Storage

| Dependency | Version | Purpose |
|------------|---------|---------|
| **idb** | ^8.0.0 | IndexedDB wrapper for offline storage |
| **workbox-window** | ^7.3.0 | Service worker registration |

### Utilities

| Dependency | Version | Purpose |
|------------|---------|---------|
| **date-fns** | ^4.1.0 | Date manipulation utilities |
| **clsx** | ^2.1.1 | Conditional className utility |

### Frontend package.json Example

```json
{
  "name": "taskmanager-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check",
    "check:watch": "svelte-kit sync && svelte-check --watch",
    "format": "biome format --write",
    "format:check": "biome format",
    "lint": "biome lint",
    "type-check": "svelte-check --tsconfig ./tsconfig.json",
    "test:unit": "vitest",
    "test:unit:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.0.0",
    "@playwright/test": "^1.50.0",
    "@sveltejs/adapter-vercel": "^5.0.0",
    "@sveltejs/kit": "^2.8.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/svelte": "^5.0.0",
    "@types/node": "^24.0.0",
    "autoprefixer": "^10.4.20",
    "biome": "^2.0.0",
    "postcss": "^8.4.49",
    "svelte": "^5.20.0",
    "svelte-check": "^4.0.0",
    "svelte-preprocess": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "tslib": "^2.8.1",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "idb": "^8.0.0",
    "workbox-window": "^7.3.0",
    "zod": "^4.0.0"
  },
  "engines": {
    "node": ">=24.20.0",
    "bun": ">=1.2.0"
  }
}
```

---

## Backend Dependencies

### Core Language & Framework

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Go** | 1.25+ | Programming language |
| **Chi** | ^5.1.0 | Idiomatic HTTP router |
| **Standard Library** | Go 1.25+ | Built-in packages (crypto, http, etc.) |

### ORM & Database

| Dependency | Version | Purpose |
|------------|---------|---------|
| **SQLBoiler** | ^4.17.0 | ORM for code generation |
| **lib/pq** | ^1.10.9 | PostgreSQL driver |
| **pgx** | ^5.7.0 | PostgreSQL driver (alternative, higher performance) |

### API Specification

| Dependency | Version | Purpose |
|------------|---------|---------|
| **oapi-codegen** | ^2.5.0 | OpenAPI 3.0+ code generation |

### Validation

| Dependency | Version | Purpose |
|------------|---------|---------|
| **go-playground/validator** | ^10.23.0 | Struct validation |
| **go-validator** | ^10.23.0 | Alternative validation package |

### Authentication & Security

| Dependency | Version | Purpose |
|------------|---------|---------|
| **golang-jwt/jwt** | ^5.2.0 | JWT token generation and validation |
| **golang.org/x/oauth2** | ^0.24.0 | OAuth2 client (Google OAuth) |
| **golang.org/x/crypto** | ^0.31.0 | Cryptographic functions |

### Caching

| Dependency | Version | Purpose |
|------------|---------|---------|
| **redis/go-redis** | ^9.7.0 | Redis client |

### HTTP & Utilities

| Dependency | Version | Purpose |
|------------|---------|---------|
| **stretchr/testify** | ^1.9.0 | Testing assertions and mocking |
| **golang/mock** | ^1.6.0 | Interface mocking |
| **testcontainers-go** | ^0.33.0 | Container-based testing |

### Logging & Monitoring

| Dependency | Version | Purpose |
|------------|---------|---------|
| **uber-go/zap** | ^1.27.0 | Structured logging |
| **prometheus/client_golang** | ^1.20.0 | Prometheus metrics |
| **opentelemetry-go** | ^1.32.0 | OpenTelemetry tracing |

### Configuration

| Dependency | Version | Purpose |
|------------|---------|---------|
| **spf13/viper** | ^1.19.0 | Configuration management |
| **kelseyhightower/envconfig** | ^1.4.0 | Environment variable parsing |

### Code Quality

| Dependency | Version | Purpose |
|------------|---------|---------|
| **golangci-lint** | ^1.62.0 | Go linting aggregator |
| **gofmt** | Built-in | Go formatter |
| **go vet** | Built-in | Go static analysis |

### Backend go.mod Example

```go
module github.com/yourusername/taskmanager-backend

go 1.25

require (
    github.com/go-chi/chi/v5 v5.1.0
    github.com/go-playground/validator/v10 v10.23.0
    github.com/golang-jwt/jwt/v5 v5.2.0
    github.com/google/uuid v1.7.0
    github.com/oapi-codegen/oapi-codegen/v2 v2.5.0
    github.com/redis/go-redis/v9 v9.7.0
    github.com/spf13/viper v1.19.0
    github.com/stretchr/testify v1.9.0
    github.com/volatiletech/sqlboiler/v4 v4.17.0
    github.com/volatiletech/sqlboiler/v4/drivers/sqlboiler-psql v4.17.0
    go.uber.org/zap v1.27.0
    golang.org/x/crypto v0.31.0
    golang.org/x/oauth2 v0.24.0
    gopkg.in/yaml.v3 v3.0.1
)

require (
    github.com/kelseyhightower/envconfig v1.4.0
    github.com/lib/pq v1.10.9
    github.com/prometheus/client_golang v1.20.0
    go.opentelemetry.io/otel v1.32.0
    go.opentelemetry.io/otel/trace v1.32.0
    golang.org/x/net v0.31.0
    golang.org/x/sys v0.28.0
    golang.org/x/text v0.22.0
)
```

---

## Infrastructure Dependencies

### Database

| Dependency | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16.x | Primary database (via Supabase) |
| **Redis** | 7.x | Caching layer (via Upstash) |

### Reverse Proxy

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Nginx** | 1.27.x | Reverse proxy and load balancer |

### Monitoring

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Grafana** | 11.x | Monitoring and visualization (Free tier) |
| **Prometheus** | 3.x | Metrics collection (optional, can use Grafana Cloud) |

### Containerization

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Docker** | 27.x | Container platform (primary recommendation) |
| **Podman** | 5.x | Alternative container platform (recommended for development) |
| **podman-compose** | ^1.2.0 | Docker Compose alternative for Podman |

### CI/CD

| Dependency | Version | Purpose |
|------------|---------|---------|
| **GitHub Actions** | Latest | CI/CD automation |

---

## Development Tools

### Version Control

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Git** | 2.47+ | Version control system |

### API Documentation

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Swagger/OpenAPI** | 3.0+ | API specification |

### Security Scanning

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Snyk** | Latest | Dependency vulnerability scanning |
| **gitleaks** | ^8.21.0 | Secret scanning |

### Performance Testing

| Dependency | Version | Purpose |
|------------|---------|---------|
| **k6** | ^0.55.0 | Load testing |
| **Lighthouse CI** | ^0.17.0 | Performance testing |

---

## Container Platform Strategy

### Final Decision

**Development:** Flexible container platform support
- **Windows/macOS**: Docker Desktop (recommended)
- **Linux**: Docker (recommended) or Podman (optional)
- **All platforms**: Same Dockerfile and docker-compose.yml

**CI/CD:** Docker only
- **GitHub Actions**: Native Docker support (pre-installed)
- **All operations**: Build, test, push using Docker

**Production:** PaaS managed services
- **Registry**: GitHub Container Registry (GHCR)
- **No Docker/Podman on servers**: PaaS providers handle container runtime

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  DEVELOPMENT (Multi-OS Platform Flexibility)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Windows   │  │    macOS    │  │    Linux    │          │
│  │  Docker     │  │  Docker     │  │ Docker/     │          │
│  │  Desktop    │  │  Desktop    │  │ Podman      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                 │                 │                 │
│         └─────────────────┴─────────────────┘                 │
│                           │                                   │
│                    Same Dockerfile                            │
│                    Same docker-compose.yml                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  CI/CD (GitHub Actions - Docker Only)                          │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  DOCKER (Native Support, Pre-installed)                │    │
│  │  • Build Docker image (docker build)                   │    │
│  │  • Run tests in container (docker run)                 │    │
│  │  • Push to GHCR (docker push)                          │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  CONTAINER REGISTRY (GHCR)                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  GitHub Container Registry                              │    │
│  │  • Integrated with GitHub (no additional signup)       │    │
│  │  • Free for public/private repos                       │    │
│  │  • Automatic authentication with GITHUB_TOKEN          │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PRODUCTION (PaaS - No Docker/Podman on Servers)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vercel     │  │    Koyeb     │  │   Supabase   │      │
│  │  (Frontend)  │  │  (Backend)   │  │  (Database)  │      │
│  │  Managed     │  │  Managed     │  │  Managed     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                             │
│  │   Upstash    │                                             │
│  │  (Cache)     │                                             │
│  │  Managed     │                                             │
│  └──────────────┘                                             │
│                                                              │
│  ❌ NO Docker/Podman installation on production servers       │
│  ✅ PaaS providers handle container runtime internally        │
└─────────────────────────────────────────────────────────────┘
```

### Development Environment Setup

#### Windows Development (Docker Desktop)
```bash
# Install Docker Desktop for Windows
# Download from: https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker-compose --version

# Start services
docker-compose up -d
```

#### macOS Development (Docker Desktop)
```bash
# Install Docker Desktop for Mac
# Download from: https://www.docker.com/products/docker-desktop

# Or install via Homebrew
brew install --cask docker

# Verify installation
docker --version
docker-compose --version

# Start services
docker-compose up -d
```

#### Linux Development (Docker or Podman)

**Option 1: Docker (Recommended for consistency)**
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version

# Start services
docker-compose up -d
```

**Option 2: Podman (For security-conscious users)**
```bash
# Install Podman
sudo apt install podman podman-compose

# Optional: Docker compatibility alias for familiar commands
alias docker=podman
alias docker-compose=podman-compose

# Start services (works with same docker-compose.yml)
docker-compose up -d
```

**Note:** Both Docker and Podman can use the same Dockerfile and docker-compose.yml. OCI standard ensures compatibility.

### CI/CD Pipeline (Docker Only)

**Why Docker in CI/CD?**
- GitHub Actions has native Docker support (pre-installed)
- No setup required on runners
- Rich ecosystem of Docker actions
- Better caching and performance
- Industry standard

**GitHub Actions Configuration:**
```yaml
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # DOCKER - Setup (native support)
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # DOCKER - Login to GHCR (automatic GitHub token)
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # DOCKER - Build and push to GHCR
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ghcr.io/${{ github.repository_owner }}/taskmanager-backend:latest
            ghcr.io/${{ github.repository_owner }}/taskmanager-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # DOCKER - Run tests in container
      - name: Run tests
        run: |
          docker run --rm ghcr.io/${{ github.repository_owner }}/taskmanager-backend:latest go test ./...
```

### Container Registry: GitHub Container Registry (GHCR)

**Why GHCR?**
- **No additional signup required** - Integrated with GitHub
- **Free for public/private repositories**
- **Automatic authentication** - Uses GITHUB_TOKEN
- **Native GitHub Actions support**
- **Same platform as code repository**

**Benefits:**
- Single platform for code and containers
- No external registry accounts needed
- Integrated permissions and access control
- Better security with GitHub token management

### Production Deployment (PaaS - No Docker/Podman Needed)

**Why PaaS?**
- No server management required
- Automatic scaling and load balancing
- Built-in monitoring and health checks
- Managed security updates
- No Docker/Podman installation on servers

**Production Architecture:**
- **Frontend (Vercel)**: Automatically builds from Git, no containers needed
- **Backend (Koyeb)**: Pulls Docker image from GHCR, runs in managed infrastructure
- **Database (Supabase)**: Managed PostgreSQL service
- **Cache (Upstash)**: Managed Redis service

**Deployment Process:**
```bash
# 1. CI/CD builds and pushes to GHCR (using Docker)
# 2. Koyeb automatically pulls latest image from GHCR
# 3. Koyeb runs container in their managed infrastructure
# 4. No Docker/Podman installation needed on production servers
```

**Koyeb Configuration:**
```yaml
# In Koyeb dashboard (no Docker commands needed)
# Image: ghcr.io/yourusername/taskmanager-backend:latest
# Registry: GitHub Container Registry
# Authentication:
#   - Username: GitHub username
#   - Password: GitHub Personal Access Token (PAT)
# Port: 8080
# Environment variables: (configured in dashboard)
# Scaling: Auto-scaling enabled
# Health checks: Automatic
```

### Key Benefits of This Strategy

**Development Flexibility:**
- Team members can use Docker or Podman based on preference
- Same Dockerfile and docker-compose.yml work across platforms
- No need to force single tool on all developers

**CI/CD Simplicity:**
- Docker native support in GitHub Actions
- No setup required on runners
- Rich ecosystem of Docker actions
- Industry standard approach

**Production Simplicity:**
- No Docker/Podman installation on servers
- PaaS providers handle container runtime
- Focus on application logic, not infrastructure
- Automatic scaling and management

**Registry Convenience:**
- GHCR integrated with GitHub (no additional signup)
- Free for project needs
- Automatic authentication
- Single platform for code and containers

## Version Management Strategy

### Dependency Update Policy

1. **Security Updates**: Apply immediately when critical vulnerabilities are identified
2. **Minor Updates**: Review and apply monthly during maintenance windows
3. **Major Updates**: Evaluate and apply quarterly with thorough testing
4. **Latest Versions**: Always use the latest stable versions for new dependencies

### Version Pinning

- **Frontend**: Use caret ranges (`^`) for dependencies to allow minor and patch updates
- **Backend**: Use specific versions in go.mod for reproducible builds
- **Infrastructure**: Pin to major versions with rolling updates for minor/patch

### Compatibility Matrix

| Component | Frontend | Backend | Infrastructure |
|-----------|----------|---------|----------------|
| Node.js | 24.20.0 | N/A | N/A |
| Go | N/A | 1.25+ | N/A |
| PostgreSQL | N/A | Compatible with 16.x | 16.x |
| Redis | N/A | Compatible with 7.x | 7.x |

---

## Installation Instructions

### Frontend Setup

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Verify Node.js version
node --version  # Should be v24.20.0

# Verify Bun version
bun --version  # Should be 1.2.0+
```

### Backend Setup

```bash
# Verify Go version
go version  # Should be go1.25+

# Install dependencies
go mod download

# Verify dependencies
go mod verify
```

### Infrastructure Setup

#### Docker Setup

```bash
# Verify Docker version
docker --version  # Should be 27.x

# Verify Docker Compose
docker-compose --version

# Start local services
docker-compose up -d
```

#### Podman Setup (Alternative)

```bash
# Verify Podman version
podman --version  # Should be 5.x

# Install podman-compose (if not already installed)
pip install podman-compose

# Or enable Docker compatibility API
sudo systemctl enable --now podman.socket
sudo ln -s /usr/bin/podman /usr/bin/docker

# Start local services with podman-compose
podman-compose up -d

# Or with Docker compatibility (if enabled)
docker-compose up -d
```

---

## Dependency Audit Commands

### Frontend Audit

```bash
# Check for outdated packages
bun outdated

# Run security audit
bun audit

# Check for vulnerabilities
bun pm audit
```

### Backend Audit

```bash
# Check for outdated dependencies
go list -u -m all

# Update dependencies
go get -u ./...

# Tidy go.mod
go mod tidy

# Verify dependencies
go mod verify
```

### Security Scanning

```bash
# Run Snyk scan (frontend)
snyk test --severity-threshold=high

# Run Snyk scan (backend)
snyk test --severity-threshold=high

# Run gitleaks
gitleaks detect --source .
```

---

## Troubleshooting

### Common Dependency Issues

#### Docker Installation Issues

**Docker not running:**
```bash
# Start Docker daemon
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker is running
docker ps
```

**Docker permission denied:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

**Docker Desktop (Windows/macOS) not starting:**
```bash
# Restart Docker Desktop
# Check if WSL2 is properly installed (Windows)
wsl --list --verbose

# Or restart WSL
wsl --shutdown
```

#### Frontend

**Issue**: Node.js version mismatch
```bash
# Use Node.js version manager to switch versions
nvm use 24.20.0
# or
nvm install 24.20.0
```

**Issue**: Bun installation issues
```bash
# Reinstall Bun
curl -fsSL https://bun.sh/install | bash
```

#### Backend

**Issue**: Go version mismatch
```bash
# Install Go 1.25+
# Visit https://go.dev/dl/ and download the appropriate version
```

**Issue**: Go module issues
```bash
# Clean up go.mod and go.sum
go mod tidy
go mod verify
```

---

## Maintenance Schedule

### Weekly
- Check for security advisories
- Review dependency updates

### Monthly
- Apply minor dependency updates
- Run security audits
- Update this documentation

### Quarterly
- Evaluate major dependency updates
- Perform compatibility testing
- Update infrastructure components

---

## References

- [Node.js Releases](https://nodejs.org/en/download)
- [Go Releases](https://go.dev/dl/)
- [Bun Documentation](https://bun.sh/docs)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [SQLBoiler Documentation](https://github.com/volatiletech/sqlboiler)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Documentation](https://upstash.com/docs)
- [Container Strategy](../architecture/container-strategy.md) - Container platform strategy

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-09-19 | 1.0.0 | Initial dependency version documentation with latest stable versions |

---

**Note**: This document should be updated whenever dependency versions change. Always test changes in a development environment before applying to production.