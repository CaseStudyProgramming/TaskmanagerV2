# Advanced Task Manager

A globally accessible task management application with offline mode, export/import capabilities, and AI-powered smart prioritization.

## Project Structure

```
taskmanagerV2/
├── backend/                    # Go backend (Chi + DDD)
│   ├── Dockerfile             # Backend container image
│   └── .dockerignore          # Docker ignore patterns
├── frontend/                  # SvelteKit frontend (FSD architecture)
│   └── .dockerignore          # Docker ignore patterns
├── docs/                      # Project documentation
│   ├── project/               # Project-level docs (PRD, TDD, dependencies)
│   ├── architecture/          # Architecture docs (DDD, FSD, container strategy)
│   ├── api/                   # API documentation
│   ├── testing/               # Testing examples and guidelines
│   ├── ci-cd/                 # CI/CD configuration
│   └── quality-reliability/   # Quality and reliability requirements
├── .github/                   # GitHub Actions workflows
│   └── workflows/             # CI/CD pipeline definitions
└── docker-compose.dev.yml     # Local development environment
```

## Quick Start

### Prerequisites

- **Node.js**: v24.20.0
- **Go**: 1.25+
- **Docker** or **Podman**: For local development
- **Bun**: Package manager (optional)

### Local Development

```bash
# Start local services (PostgreSQL, Redis)
docker-compose -f docker-compose.dev.yml up -d

# Backend development
cd backend
go mod download
go run main.go

# Frontend development
cd frontend
bun install
bun run dev
```

### Container Platform Strategy

- **Development**: Docker (Windows/macOS) or Podman (Linux optional)
- **CI/CD**: Docker (GitHub Actions native support)
- **Production**: PaaS (Koyeb, Vercel, Supabase, Upstash)
- **Registry**: GitHub Container Registry (GHCR)

See [Container Strategy](docs/architecture/container-strategy.md) for details.

## Documentation

### Project Documentation
- [Product Requirements Document (PRD)](docs/project/prd.md)
- [Test-Driven Development (TDD)](docs/project/tdd.md)
- [Dependency Versions](docs/project/dependencies.md)

### Architecture
- [Backend DDD Architecture](docs/architecture/backend-ddd.md)
- [Frontend FSD Architecture](docs/architecture/frontend-fsd.md)
- [Container Strategy](docs/architecture/container-strategy.md)

### API
- [Standard Response Format](docs/api/standard-response-format.md)

### Testing
- [Backend Testing Examples](docs/testing/backend-examples.md)
- [Frontend Testing Examples](docs/testing/frontend-examples.md)

### CI/CD
- [GitHub Actions Configuration](docs/ci-cd/github-actions.md)

### Quality & Reliability
- [Backend Quality & Reliability](docs/quality-reliability/backend-quality-reliability.md)
- [Frontend Quality & Reliability](docs/quality-reliability/frontend-quality-reliability.md)

## Technology Stack

### Frontend
- **Framework**: SvelteKit
- **Language**: TypeScript (strict mode)
- **Architecture**: Feature-Sliced Design (FSD)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Testing**: Vitest, Playwright
- **Code Quality**: Biome.js

### Backend
- **Language**: Go 1.25+
- **Framework**: Chi (HTTP router)
- **Architecture**: Domain-Driven Design (DDD)
- **ORM**: SQLBoiler
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Testing**: Go testing, Testify

### Infrastructure
- **Frontend**: Vercel (PaaS)
- **Backend**: Koyeb (PaaS)
- **Database**: Supabase (Managed PostgreSQL)
- **Cache**: Upstash (Managed Redis)
- **Registry**: GitHub Container Registry

## CI/CD Pipeline

- **Format Check**: Biome.js (frontend), gofmt (backend)
- **Lint Check**: Biome.js (frontend), golangci-lint (backend)
- **Type Check**: TypeScript (frontend), go vet (backend)
- **Unit Tests**: Vitest (frontend), go test (backend)
- **Integration Tests**: Database integration tests
- **E2E Tests**: Playwright
- **Security Scan**: Snyk, gitleaks
- **Build & Push**: Docker to GHCR

See [GitHub Actions Configuration](docs/ci-cd/github-actions.md) for details.

## Development Guidelines

### Pre-Commit Checklist

```bash
# Frontend
bun run format:check
bun run lint
bun run type-check
bun run test:unit

# Backend
gofmt -l .
golangci-lint run
go vet ./...
go test ./... -short
```

### Code Standards

- **Frontend**: TypeScript strict mode, Biome.js linting/formatting
- **Backend**: Go standard formatting, golangci-lint
- **Testing**: 90%+ coverage requirement
- **Documentation**: Update docs with code changes

## Deployment

### Production Deployment

1. **CI/CD** builds and pushes to GHCR
2. **Koyeb** pulls latest image and deploys
3. **Vercel** builds frontend from Git
4. **Supabase/Upstash** managed services

See [Container Strategy](docs/architecture/container-strategy.md) for deployment details.

## License

[Specify your license here]

## Contributing

See [TDD Guidelines](docs/project/tdd.md) and [Documentation Standards](docs/README.md) for contribution guidelines.