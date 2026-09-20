# Dependency Versions

This document tracks the exact dependency versions used in the Advanced Task Manager project. This is the single source of truth for all version requirements.

**Important**: When adding or updating dependencies, this file MUST be updated accordingly.

---

## Frontend Dependencies

### Core Framework & Language

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v24.20.0 | JavaScript runtime (must be used across development, testing, and production) |
| **TypeScript** | ^5.6.0 | Type-safe JavaScript |
| **SvelteKit** | ^2.8.0 | Web framework |
| **Vite** | ^6.0.0 | Build tool and dev server |

### Package Manager

| Dependency | Version | Purpose |
|------------|---------|---------|
| **bun** | ^1.4.2 | Fast package manager and runtime |

### Styling

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | ^4.3.3 | Utility-first CSS framework |


### Validation & Schema

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Zod** | ^4.0.0 | Schema validation and type inference |

### Code Quality

| Dependency | Version | Purpose |
|------------|---------|---------|
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

use fetch

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

---

## Backend Dependencies

### Core Language & Framework

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Go** | 1.27+ | Programming language |
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
| **oapi-codegen** | ^2.80+ | OpenAPI 3.1+ code generation |

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

---

## Infrastructure Dependencies

### Database

| Dependency | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16.x | Primary database (via Supabase) |
| **Redis** | 7.x | Caching layer (via Upstash) |

### Database Limits (Free Tier)

| Service | Resource | Limit |
|---------|----------|-------|
| **Supabase** | PostgreSQL database | 500MB |
| **Supabase** | Monthly Active Users | 50,000 |
| **Supabase** | File storage | 1GB |
| **Upstash** | Commands/day | 10,000 |
| **Upstash** | Storage | 256MB |

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

### Platform Limits (Free Tier)

| Platform | Resource | Limit |
|----------|----------|-------|
| **Vercel** | Bandwidth/month | 100GB |
| **Vercel** | Node.js runtime | See Node.js version in Frontend Dependencies |
| **Koyeb** | RAM | 512MB |
| **Koyeb** | vCPU | 0.5 |
| **Koyeb** | Persistent storage | 1GB |
| **Grafana** | Cloud Grafana | Free tier |

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

## Compatibility Matrix

| Component | Frontend | Backend | Infrastructure |
|-----------|----------|---------|----------------|
| Node.js | 24.20.0  | N/A | N/A |
| Go | N/A | 1.27+ | N/A |
| PostgreSQL | N/A | Compatible with 16.x | 16.x |
| Redis | N/A | Compatible with 7.x | 7.x |

---

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

---

## Documentation Links

- [Node.js Releases](https://nodejs.org/en/download)
- [Go Releases](https://go.dev/dl/)
- [Bun Documentation](https://bun.sh/docs)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [SQLBoiler Documentation](https://github.com/volatiletech/sqlboiler)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Documentation](https://upstash.com/docs)

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-09-19 | 1.0.0 | Initial dependency version documentation with latest stable versions |
| 2025-09-20 | 1.1.0 | Simplified to focus only on dependency versions |
