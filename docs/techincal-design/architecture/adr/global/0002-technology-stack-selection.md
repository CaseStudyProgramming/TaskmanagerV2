# ADR 0002: Technology Stack Selection

**Status**: Superseded by ADR 0004 (SSL/TLS mode) and ADR 0005 (Container Registry)

**Date**: 2026-11-09

**Context**: We need to select a technology stack for the Advanced Task Manager that balances performance, developer experience, scalability, and cost.

**Decision**: Frontend: SvelteKit + TypeScript + Bun; Backend: Go + Chi + SQLBoiler; Database: Neon PostgreSQL; Cache: Upstash Redis; Deployment: Cloudflare Workers (frontend) + OCI Instance (backend).

**Consequences**: This stack provides excellent performance, type safety, and cost-effectiveness while maintaining developer productivity.

---

## Context

The Advanced Task Manager requires:
- High performance for global accessibility
- Type safety for reliability
- Cost-effective infrastructure
- Good developer experience
- Scalability for future growth

We evaluated multiple technology options across frontend, backend, database, and infrastructure.

## Decision

### Frontend
- **Framework**: SvelteKit
  - Excellent performance (compile-time optimizations)
  - Simple and intuitive API
  - Built-in TypeScript support
  - Great developer experience
- **Language**: TypeScript (strict mode)
  - Type safety and better tooling
  - Improved code quality
  - Better IDE support
- **Runtime**: Bun
  - Fast JavaScript runtime
  - Compatibility with Node.js ecosystem
  - Integrated package manager
- **Architecture**: Feature-Sliced Design (FSD) + Vertical Slices
  - Clear separation of concerns
  - Feature-focused development
  - Scalable architecture

### Backend
- **Language**: Go
  - Excellent performance
  - Strong concurrency support
  - Simple and predictable
  - Great for microservices
- **Framework**: Chi
  - Idiomatic HTTP router
  - Minimal and fast
  - Excellent middleware support
- **Architecture**: Domain-Driven Design (DDD) + Vertical Slices
  - Clear domain boundaries
  - Business logic encapsulation
  - Testable and maintainable
- **ORM**: SQLBoiler
  - Type-safe database access
  - Code generation
  - Excellent performance

### Database
- **Database**: Neon PostgreSQL
  - Branch-first workflow
  - Automatic scaling
  - Excellent developer experience
  - Cost-effective

### Cache
- **Cache**: Upstash Redis
  - Global edge caching
  - Simple API
  - Cost-effective
  - Good performance

### Deployment
- **Frontend**: Cloudflare Workers
  - Global edge deployment
  - Excellent performance
  - Cost-effective (free tier)
  - DDoS protection
- **Backend**: OCI Instance (A1.Flex)
  - Cost-effective compute
  - Flexible configuration
  - Full control
  - Podman for containers

## Consequences

**Positive:**
- Excellent performance across the stack
- Type safety reduces bugs
- Cost-effective infrastructure
- Good developer experience
- Scalable architecture
- Global edge deployment for frontend

**Negative:**
- Smaller ecosystem for Go compared to JavaScript
- Learning curve for DDD and FSD patterns
- Managed services require internet connectivity

**Neutral:**
- Bun is relatively new (but stable)
- Neon is cloud-only (no self-hosting option)
- Cloudflare Workers has some limitations (execution time, memory)

## Alternatives Considered

### Frontend Alternatives
1. **React + Next.js**
   - Rejected: More complex, slower build times
2. **Vue + Nuxt**
   - Rejected: Smaller ecosystem than React/Svelte
3. **Vanilla JavaScript**
   - Rejected: Lack of type safety, harder to maintain

### Backend Alternatives
1. **Node.js + Express**
   - Rejected: Slower performance, single-threaded
2. **Python + FastAPI**
   - Rejected: Slower performance, GIL limitations
3. **Rust + Actix**
   - Rejected: Steeper learning curve, longer development time

### Database Alternatives
1. **MySQL**
   - Rejected: Less advanced features than PostgreSQL
2. **MongoDB**
   - Rejected: Less structured, schema changes harder
3. **Self-hosted PostgreSQL**
   - Rejected: Higher operational overhead

## References

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Go Documentation](https://go.dev/doc/)
- [Neon Documentation](https://neon.tech/docs)
- [Upstash Documentation](https://upstash.com/docs)

## Superseded By

This ADR is partially superseded by:

1. [ADR 0004: Upgrade to Cloudflare Full Strict SSL/TLS Mode](../infrastructure/0004-upgrade-to-cloudflare-full-strict-ssl.md)
2. [ADR 0005: Migrate to OCI Container Registry](../infrastructure/0005-migrate-to-oci-container-registry.md)

**What Changed (ADR 0004):**
- **SSL/TLS Mode**: Changed from Cloudflare Flexible to Full (strict)
- **Reason**: Let's Encrypt wildcard certificate now installed on OCI instance
- **Impact**: End-to-end encryption from browser to origin

**What Changed (ADR 0005):**
- **Container Registry**: Changed from GitHub Container Registry (GHCR) to OCI Registry
- **Reason**: Better integration with OCI ecosystem and artifact management
- **Impact**: Updated CI/CD pipeline, deployment scripts, and documentation

**What Remains Valid:**
- All other technology stack decisions (frontend, backend, database, cache, deployment platform)
- Infrastructure choices remain unchanged
- Only SSL/TLS configuration and container registry were updated
