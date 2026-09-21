# Dependency Versions

This document tracks the exact dependency versions used in the Advanced Task Manager project. This is the single source of truth for all version requirements.

**Important**: When adding or updating dependencies, this file MUST be updated accordingly.

---

## Frontend Dependencies

### Core Framework & Language

**Node.js**
- version: v24.20.0
- purpose: JavaScript runtime (must be used across development, testing, and production)
- doc link: https://nodejs.org/en/download

**TypeScript**
- version: 7.0.2
- purpose: Type-safe JavaScript
- doc link: https://github.com/microsoft/TypeScript/releases

**SvelteKit**
- version: ^2.8.0
- purpose: Web framework
- doc link: https://kit.svelte.dev/docs

**Svelte**
- version: svelte@5.57.1
- purpose: Web framework
- doc link: https://github.com/sveltejs/svelte/releases

**Vite**
- version: ^6.0.0
- purpose: Build tool and dev server
- doc link: https://vitejs.dev/

### Package Manager

**bun**
- version: ^1.4.2
- purpose: Fast package manager and runtime
- doc link: https://bun.sh/docs

### Styling

**Tailwind CSS**
- version: ^4.3.3
- purpose: Utility-first CSS framework
- doc link: https://tailwindcss.com/docs


### Validation & Schema

**Zod**
- version: ^4.0.0
- purpose: Schema validation and type inference
- doc link: https://zod.dev/

### Code Quality

**@biomejs/biome**
- version: ^2.0.0
- purpose: Biome CLI tool
- doc link: https://biomejs.dev/

### Testing

**Vitest**
- version: ^3.0.0
- purpose: Unit testing framework
- doc link: https://vitest.dev/

**@testing-library/svelte**
- version: ^5.0.0
- purpose: Component testing utilities
- doc link: https://testing-library.com/docs/svelte-testing-library/intro/

**@testing-library/jest-dom**
- version: ^6.6.0
- purpose: Custom Jest matchers
- doc link: https://github.com/testing-library/jest-dom

**Playwright**
- version: ^1.50.0
- purpose: E2E testing framework
- doc link: https://playwright.dev/

**@playwright/test**
- version: ^1.50.0
- purpose: Playwright test runner
- doc link: https://playwright.dev/docs/api/class-test

### Build & Development Tools

**svelte-preprocess**
- version: ^6.0.0
- purpose: Svelte preprocessor for TypeScript/PostCSS
- doc link: https://github.com/sveltejs/svelte-preprocess

**@sveltejs/adapter-vercel**
- version: ^5.0.0
- purpose: Vercel deployment adapter
- doc link: https://vercel.com/docs/frameworks/sveltekit

**@sveltejs/adapter-static**
- version: ^3.0.0
- purpose: Static site generation adapter
- doc link: https://kit.svelte.dev/docs/adapter-static

### API & HTTP

**Fetch API**
- version: Built-in
- purpose: Native browser API for HTTP requests
- doc link: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

### Offline & Storage

**idb**
- version: ^8.0.0
- purpose: IndexedDB wrapper for offline storage
- doc link: https://github.com/jakearchibald/idb

**workbox-window**
- version: ^7.3.0
- purpose: Service worker registration
- doc link: https://developer.chrome.com/docs/workbox/

### Utilities

**date-fns**
- version: ^4.1.0
- purpose: Date manipulation utilities
- doc link: https://date-fns.org/

**clsx**
- version: ^2.1.1
- purpose: Conditional className utility
- doc link: https://github.com/lukeed/clsx

---

## Backend Dependencies

### Core Language & Framework

**Go**
- version: 1.27+
- purpose: Programming language
- doc link: https://go.dev/dl/

**Chi**
- version: ^5.1.0
- purpose: Idiomatic HTTP router
- doc link: https://github.com/go-chi/chi

**Standard Library**
- version: Go 1.25+
- purpose: Built-in packages (crypto, http, etc.)
- doc link: https://pkg.go.dev/std

### ORM & Database

**SQLBoiler**
- version: ^4.17.0
- purpose: ORM for code generation
- doc link: https://github.com/volatiletech/sqlboiler

**lib/pq**
- version: ^1.10.9
- purpose: PostgreSQL driver
- doc link: https://github.com/lib/pq

**pgx**
- version: ^5.7.0
- purpose: PostgreSQL driver (alternative, higher performance)
- doc link: https://github.com/jackc/pgx

### API Specification

**oapi-codegen**
- version: ^2.80+
- purpose: OpenAPI 3.1+ code generation
- doc link: https://github.com/oapi-codegen/oapi-codegen

### Validation

**go-playground/validator**
- version: ^10.23.0
- purpose: Struct validation
- doc link: https://github.com/go-playground/validator

**go-validator**
- version: ^10.23.0
- purpose: Alternative validation package
- doc link: https://github.com/asaskevich/govalidator

### Authentication & Security

**golang-jwt/jwt**
- version: ^5.2.0
- purpose: JWT token generation and validation
- doc link: https://github.com/golang-jwt/jwt

**golang.org/x/oauth2**
- version: ^0.24.0
- purpose: OAuth2 client (Google OAuth)
- doc link: https://pkg.go.dev/golang.org/x/oauth2

**golang.org/x/crypto**
- version: ^0.31.0
- purpose: Cryptographic functions
- doc link: https://pkg.go.dev/golang.org/x/crypto

### Caching

**redis/go-redis**
- version: ^9.7.0
- purpose: Redis client
- doc link: https://github.com/redis/go-redis

### HTTP & Utilities

**stretchr/testify**
- version: ^1.9.0
- purpose: Testing assertions and mocking
- doc link: https://github.com/stretchr/testify

**golang/mock**
- version: ^1.6.0
- purpose: Interface mocking
- doc link: https://github.com/golang/mock

**testcontainers-go**
- version: ^0.33.0
- purpose: Container-based testing
- doc link: https://golang.testcontainers.org/

### Logging & Monitoring

**uber-go/zap**
- version: ^1.27.0
- purpose: Structured logging
- doc link: https://github.com/uber-go/zap

**prometheus/client_golang**
- version: ^1.20.0
- purpose: Prometheus metrics
- doc link: https://github.com/prometheus/client_golang

**opentelemetry-go**
- version: ^1.32.0
- purpose: OpenTelemetry tracing
- doc link: https://github.com/open-telemetry/opentelemetry-go

### Configuration

**spf13/viper**
- version: ^1.19.0
- purpose: Configuration management
- doc link: https://github.com/spf13/viper

**kelseyhightower/envconfig**
- version: ^1.4.0
- purpose: Environment variable parsing
- doc link: https://github.com/kelseyhightower/envconfig

### Code Quality

**golangci-lint**
- version: ^1.62.0
- purpose: Go linting aggregator
- doc link: https://golangci-lint.run/

**gofmt**
- version: Built-in
- purpose: Go formatter
- doc link: https://pkg.go.dev/cmd/gofmt

**go vet**
- version: Built-in
- purpose: Go static analysis
- doc link: https://pkg.go.dev/cmd/vet

---

## Infrastructure Dependencies

### Database

**PostgreSQL**
- version: 16.x
- purpose: Primary database (via Supabase)
- doc link: https://www.postgresql.org/docs/

**Redis**
- version: 7.x
- purpose: Caching layer (via Upstash)
- doc link: https://redis.io/docs/

### Database Limits (Free Tier)

**Supabase**
- PostgreSQL database: 500MB
- Monthly Active Users: 50,000
- File storage: 1GB

**Upstash**
- Commands/day: 10,000
- Storage: 256MB

### Reverse Proxy

**Nginx**
- version: 1.27.x
- purpose: Reverse proxy and load balancer
- doc link: https://nginx.org/en/docs/

### Monitoring

**Grafana**
- version: 11.x
- purpose: Monitoring and visualization (Free tier)
- doc link: https://grafana.com/docs/

**Prometheus**
- version: 3.x
- purpose: Metrics collection (optional, can use Grafana Cloud)
- doc link: https://prometheus.io/docs/

### Containerization

**Docker**
- version: 27.x
- purpose: Container platform (primary recommendation)
- doc link: https://docs.docker.com/

**Podman**
- version: 5.x
- purpose: Alternative container platform (recommended for development)
- doc link: https://docs.podman.io/

**podman-compose**
- version: ^1.2.0
- purpose: Docker Compose alternative for Podman
- doc link: https://github.com/containers/podman-compose

### CI/CD

**GitHub Actions**
- version: Latest
- purpose: CI/CD automation
- doc link: https://docs.github.com/en/actions

### Platform Limits (Free Tier)

**Vercel**
- Bandwidth/month: 100GB
- Node.js runtime: See Node.js version in Frontend Dependencies

**Koyeb**
- RAM: 512MB
- vCPU: 0.5
- Persistent storage: 1GB

**Grafana**
- Cloud Grafana: Free tier

---

## Development Tools

### Version Control

**Git**
- version: 2.47+
- purpose: Version control system
- doc link: https://git-scm.com/doc

### API Documentation

**Swagger/OpenAPI**
- version: 3.0+
- purpose: API specification
- doc link: https://swagger.io/specification/

### Security Scanning

**Snyk**
- version: Latest
- purpose: Dependency vulnerability scanning
- doc link: https://snyk.io/docs/

**gitleaks**
- version: ^8.21.0
- purpose: Secret scanning
- doc link: https://github.com/gitleaks/gitleaks

### Performance Testing

**k6**
- version: ^0.55.0
- purpose: Load testing
- doc link: https://k6.io/docs/

**Lighthouse CI**
- version: ^0.17.0
- purpose: Performance testing
- doc link: https://github.com/GoogleChrome/lighthouse-ci

---

## Compatibility Matrix

**Node.js**
- Frontend: 24.20.0
- Backend: N/A
- Infrastructure: N/A

**Go**
- Frontend: N/A
- Backend: 1.27+
- Infrastructure: N/A

**PostgreSQL**
- Frontend: N/A
- Backend: Compatible with 16.x
- Infrastructure: 16.x

**Redis**
- Frontend: N/A
- Backend: Compatible with 7.x
- Infrastructure: 7.x

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

**2025-09-19**
- version: 1.0.0
- changes: Initial dependency version documentation with latest stable versions

**2025-09-20**
- version: 1.1.0
- changes: Simplified to focus only on dependency versions

**2025-09-21**
- version: 1.2.0
- changes: Converted from table format to bullet point format with version, purpose, and doc link
