# Frontend Technical Design

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the frontend technical design, technology stack, architecture patterns, and coding standards for the Advanced Task Manager project.

## Architecture Decision Records

See [frontend-spec/adr/README.md](./adr/README.md) for frontend-specific ADRs.

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | SvelteKit | 1.20+ | Frontend framework |
| **Language** | TypeScript | 5.0+ | Type-safe JavaScript |
| **Runtime** | Bun | 1.0+ | JavaScript runtime |
| **Package Manager** | Bun | 1.0+ | Dependency management |
| **Architecture** | FSD + Vertical Slices | - | Feature-Sliced Design pattern |
| **Styling** | Tailwind CSS | 3.3+ | Utility-first CSS |
| **Validation** | Zod | 3.22+ | Runtime validation |
| **Build Tool** | Bun build | - | Build tool via SvelteKit |
| **Code Quality** | Biome.js | 1.0+ | Linting and formatting |
| **Testing** | Vitest | 1.0+ | Unit testing |
| **E2E Testing** | Playwright | 1.40+ | End-to-end testing |
| **Deployment** | Cloudflare Workers | - | Edge deployment |
| **Adapter** | @sveltejs/adapter-cloudflare | - | Cloudflare adapter |

### External Services

| Service | Technology | Purpose |
|---------|------------|---------|
| **API** | Backend API (Go) | RESTful API backend |
| **Auth** | Google OAuth 2.0 | User authentication |
| **CDN** | Cloudflare CDN | Static asset delivery |
| **Edge** | Cloudflare Workers | Edge functions |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Bun** | Package manager and runtime |
| **Biome** | Linting and formatting |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **TypeScript** | Type checking |
| **SvelteKit Dev** | Development server |

---

## Architecture Patterns

### Feature-Sliced Design (FSD)

The frontend follows FSD principles with clear separation across app, pages, features, entities, shared, and widgets layers.

#### Layer Structure

```
src/
├── app/                 # App layer (global configuration)
│   ├── providers/       # Global providers
│   ├── routes/          # Route configuration
│   ├── styles/          # Global styles
│   └── store/           # Global state
├── pages/               # Pages layer (route components)
│   ├── home/
│   ├── auth/
│   └── tasks/
├── features/            # Features layer (business logic)
│   ├── task-create/
│   ├── task-edit/
│   ├── task-delete/
│   ├── task-filter/
│   ├── task-prioritize/
│   ├── auth-google/
│   ├── export-import/
│   └── offline-sync/
├── entities/            # Entities layer (domain models)
│   ├── task/
│   ├── user/
│   └── auth/
├── shared/              # Shared layer (utilities)
│   ├── api/
│   ├── config/
│   ├── lib/
│   ├── ui/
│   ├── segments/
│   └── types/
└── widgets/             # Widgets layer (reusable components)
    ├── task-card/
    ├── task-list/
    ├── priority-badge/
    └── offline-indicator/
```

### Vertical Slice Pattern

Vertical slices are applied within the FSD layers to ensure feature-focused organization:

**Feature Vertical Slice:**
```
task-create/
├── model/              # State management and business logic
│   ├── task-create.store.ts
│   ├── task-create.store.spec.ts
│   └── task-create.schema.ts
├── api/                # API integration
│   ├── task-create.api.ts
│   └── task-create.api.spec.ts
└── ui/                 # UI components
    ├── TaskCreateForm.svelte
    └── TaskCreateForm.spec.ts
```

**Benefits:**
- Feature-focused development
- Easy to locate related code
- Independent feature testing
- Clear separation of concerns
- Easy to add/remove features

---

## Directory Conventions

### Project Structure

```
frontend/
├── src/                     # Source code
│   ├── app/                 # App layer
│   ├── pages/               # Pages layer
│   ├── features/            # Features layer
│   ├── entities/            # Entities layer
│   ├── shared/              # Shared layer
│   └── widgets/             # Widgets layer
├── static/                  # Static assets
├── tests/                   # E2E tests
├── svelte.config.js         # Svelte configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
├── biome.json               # Biome configuration
├── package.json             # Dependencies
├── bun.lockb                # Lock file
└── wrangler.toml            # Cloudflare Workers config
```

### File Naming Conventions

| File Type | Convention | Example |
|-----------|------------|---------|
| **Svelte components** | PascalCase.svelte | `TaskCard.svelte` |
| **TypeScript files** | kebab-case.ts | `task-create.store.ts` |
| **Test files** | kebab-case.spec.ts | `task-create.store.spec.ts` |
| **Type files** | types.ts | `types.ts` |
| **Config files** | filename.config.ext | `tailwind.config.js` |

---

## Coding Standards

### TypeScript Code Style

**Formatting:**
- Use Biome for all code formatting
- Run `biome check --write .` before committing
- Use strict TypeScript mode

**Naming:**
- Components: PascalCase
- Functions: camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase
- Files: kebab-case

**Comments:**
- Document public APIs with JSDoc
- Comment on "why", not "what"
- Keep comments concise and accurate

**Type Safety:**
- Use TypeScript strict mode
- Avoid `any` type
- Use type inference where possible
- Use union types for variants

### Example Code

For complete implementation examples, refer to the specific design documents for state management, routing, and UI components.

---

## Rendering Strategy

### Server-Side Rendering (SSR)

**Strategy:** Hybrid SSR + Client-Side Hydration

**Why SSR:**
- Better SEO (if needed in future)
- Faster initial page load
- Better perceived performance
- Improved accessibility

**When to use SSR:**
- Public pages (home, marketing)
- First page load
- SEO-critical pages

**When to use CSR:**
- Authenticated pages
- Complex interactive features
- Real-time data updates

### Static Site Generation (SSG)

**Strategy:** Pre-render static pages at build time

**Use Cases:**
- Marketing pages
- Documentation
- Landing pages

**Configuration:**
- Configure SvelteKit adapter for Cloudflare Workers
- Set platform proxy for pages
- Configure build output directory

---

## State Management

### Client-Side Data Flow

**Svelte Stores:**
- Use Svelte stores for feature-level state
- Use derived stores for computed values
- Use custom stores for complex logic

**State Layers:**
```
Component Layer (UI State)
    ↓
Feature Layer (Business Logic)
    ↓
Entity Layer (Domain State)
    ↓
Shared Layer (Global State)
```

### Hydration Rules

**Hydration Strategy:**
- Load initial data from server (SSR)
- Hydrate client-side stores with server data
- Update state via API calls
- Persist critical state to localStorage

**Example:**
- Load initial data from server using load function
- Hydrate client-side stores with server data
- Update state via API calls
- Persist critical state to localStorage

---

## API Integration

### API Client

**Shared API Client:**
- Request method with endpoint and options
- Type-safe response handling
- Error handling for non-OK responses
- Convenience methods for GET and POST

### Response Handling

**Standard Response Parser:**
- Parse standard response format with status, data, and meta
- Check is_success flag
- Extract data on success
- Throw error on failure

---

## Quality Standards

### Performance Requirements

- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.5s
- Cumulative Layout Shift (CLS) < 0.1

### Code Quality

- Code coverage > 80% (unit tests)
- Code coverage > 70% (E2E tests)
- Zero critical linting errors
- Zero TypeScript errors

### Testing Strategy

**Unit Tests:**
- Test component logic in isolation
- Mock external dependencies
- Test edge cases and error conditions
- Use Vitest for testing

**E2E Tests:**
- Test complete user flows
- Test with real browser (Chromium, Firefox, WebKit)
- Run in CI/CD pipeline
- Use Playwright for testing

For detailed testing guidelines for SvelteKit frontend, see [Testing Strategy (SvelteKit)](./testing-strategy-sveltekit.md).

---

## Deployment

### Cloudflare Workers Configuration

**SvelteKit Adapter:**
- Import Cloudflare adapter
- Configure adapter with platform proxy
- Enable pages for SSR

**Wrangler Configuration:**
- Configure worker name and entry point
- Set compatibility date
- Configure site bucket for static assets
- Set build command and watch directory
- Define environment variables

### CI/CD Pipeline

**Forgejo Actions Workflow:**
- Trigger on push to main/develop branches
- Setup Bun runtime
- Install dependencies
- Run linting, type checking, build, and tests
- Run E2E tests

---

## References

- [System Architecture ADRs](../architecture/adr/README.md) - System architecture decisions
- [Frontend FSD Architecture](../tdd/architecture/frontend-fsd.md) - Detailed FSD implementation
- [State Management](./state-management.md) - State management patterns
- [Design System & UI](./design-system-&-ui.md) - UI component design
- [Routing & Middleware](./routing-&-middleware.md) - Routing configuration
- [Testing Strategy (SvelteKit)](./testing-strategy-sveltekit.md) - SvelteKit-specific testing guidelines
- [Frontend Quality & Reliability](../tdd/quality-reliability/frontend-quality-reliability.md) - Quality requirements
