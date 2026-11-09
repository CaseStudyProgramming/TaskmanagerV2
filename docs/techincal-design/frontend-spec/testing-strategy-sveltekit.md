# Frontend Testing Strategy (SvelteKit/Next.js/Nuxt)

**Version**: 1.0
**Date**: 2026-11-10
**Status**: Draft

---

## Overview

This document defines the testing strategy for SvelteKit, Next.js, and Nuxt frontends, including unit tests, component tests, E2E tests, and pragmatic guidelines based on senior developer best practices for JavaScript/TypeScript frontend environments.

**Note:** SvelteKit, Next.js, and Nuxt share similar testing strategies due to their common JavaScript/TypeScript ecosystem. Framework-specific differences are noted where applicable.

---

## Technology Stack

| Tool | Purpose | Environment |
|------|---------|-------------|
| **Biome** | Linter, formatter, bundler | Node.js/Bun runtime |
| **Vitest** | Unit testing framework | Node.js/Bun runtime |
| **@testing-library/svelte** | Component testing utilities (SvelteKit) | Node.js/Bun runtime |
| **@testing-library/react** | Component testing utilities (Next.js) | Node.js/Bun runtime |
| **@testing-library/vue** | Component testing utilities (Nuxt) | Node.js/Bun runtime |
| **@testing-library/jest-dom** | Custom Jest matchers | Node.js/Bun runtime |
| **Playwright** | E2E testing framework | Browser runtime |

---

## Testing Pyramid for Frontend Frameworks

```
         E2E Tests (10%)
        /\
       /  \      Playwright
      /----\     - Real browser
     /      \    - Critical user flows
    /        \   - Slow, expensive
   /----------\
  /  Component \   Component Tests (30%)
 /  Tests (30%)\  - Testing Library
/----------------\ - Framework components
|| Unit Tests (60%)|
|| (Vitest)       | - Pure functions
|| (Utilities)    | - Composables/Hooks
|| (Business)     | - State management
|\----------------/ - Fast, isolated
```

---

## Testing Types

### 1. Unit Tests (Vitest)

**Purpose:** Test pure functions, utilities, composables, hooks in isolation

**Scope:**
- Pure functions (data transformation, validation)
- Utilities (date formatting, string manipulation)
- Composables (Svelte stores, Vue composables)
- Hooks (React hooks)
- Business logic (priority calculation, filtering)

**When to Use:**
- Pure functions without side effects
- Business logic independent of UI
- Utilities and helpers
- Data transformation logic

### 2. Component Tests (Testing Library)

**Purpose:** Test components in isolation (user behavior simulation)

**Scope:**
- Component rendering
- User interactions (click, input, form submission)
- Component props and events
- Component state changes

**Framework-Specific Tools:**
- **SvelteKit:** @testing-library/svelte
- **Next.js:** @testing-library/react
- **Nuxt:** @testing-library/vue

**When to Use:**
- Interactive components (buttons, forms, modals)
- Component logic (state, events, props)
- UI behavior (validation, error handling)
- Component composition

### 3. E2E Tests (Playwright)

**Purpose:** Test complete user flows in real browser

**Scope:**
- Critical user journeys (login, create task, delete task)
- Cross-page navigation
- API integration (real backend)
- Browser compatibility

**When to Use:**
- Critical user flows (signup, login, checkout)
- Cross-component interactions
- API integration (real backend)
- Browser-specific behavior (localStorage, service worker)

---

## Framework-Specific Testing

### SvelteKit-Specific Testing

**Server-Side Testing (Load Functions):**
- Test server-side load functions
- Test server actions (form submissions)
- Test API routes
- Test with request/response objects

**Service Worker Testing:**
- Test service worker caching
- Test offline functionality
- Test background sync
- Test IndexedDB integration

### Next.js-Specific Testing

**Server-Side Testing (getServerSideProps, getStaticProps):**
- Test server-side props functions
- Test API routes
- Test middleware
- Test with Next.js testing utilities

**App Router Testing:**
- Test React Server Components
- Test route handlers
- Test metadata generation
- Test streaming responses

### Nuxt-Specific Testing

**Server-Side Testing (useAsyncData, useFetch):**
- Test composables for data fetching
- Test API routes
- Test middleware
- Test with Nuxt testing utilities

**Vue Component Testing:**
- Test Vue 3 composition API
- Test Nuxt auto-imports
- Test page components
- Test layout components

---

## Rule of Thumb dari Senior Dev

### 1. Test User Behavior, Not Implementation

**Principle:** Focus on what users see and do, not how components are implemented

**Best Practices:**
- Test user interactions (click, type, submit)
- Test visible outcomes (text changes, element visibility)
- Avoid testing internal state or implementation details
- Use accessible selectors (test IDs, ARIA labels)

### 2. Don't Test Third-Party Libraries

**Principle:** Trust that libraries work, test your code instead

**Best Practices:**
- Don't test library functions directly
- Test your code that uses libraries
- Mock external dependencies if needed
- Test error handling for library failures

### 3. Test Critical Paths, Not Every Component

**Priority:**
1. Critical user flows (login, create task, delete task)
2. Complex components (forms, modals, data tables)
3. Business logic (validation, filtering, sorting)
4. Simple presentational components (optional)

### 4. Use Test IDs for Selectors

**Principle:** Use stable selectors that won't break with styling changes

**Best Practices:**
- Use data-testid attributes for selectors
- Avoid CSS classes (brittle with styling changes)
- Avoid element types (brittle with structure changes)
- Keep selectors semantic and descriptive

---

## Anti-Patterns yang Dihindari

### 1. Testing Implementation Details
- ❌ Test internal state or private methods
- ✅ Test user-visible behavior and outcomes

### 2. Testing Third-Party Libraries
- ❌ Test library functions or methods
- ✅ Test your code that uses libraries

### 3. Over-testing Simple Components
- ❌ Test every single presentational component
- ✅ Focus on critical and complex components

### 4. Brittle Selectors
- ❌ Use CSS classes or element types as selectors
- ✅ Use data-testid or ARIA labels for stable selectors

---

## Pragmatic Approach untuk Task Manager

### Testing Strategy
- **Unit test:** Business logic, utilities, composables/hooks
- **Component test:** Interactive components, forms, modals
- **E2E test:** Critical user flows (login, create task, delete task)
- **Mocking:** External API calls (optional, pragmatic)

### Current Stack
- **Framework:** SvelteKit (primary) / Next.js / Nuxt (alternatives)
- **State:** Svelte stores / React hooks / Vue composables
- **API:** Backend API integration
- **Offline:** IndexedDB + Service Worker

### Exceptions (Future Features)
- **Real-time features** (WebSocket) → Integration test with WebSocket
- **Complex animations** → Component test with animation library
- **File uploads** → Component test with file input mocking

---

## Quality Standards

### Test Coverage Requirements

#### Unit Tests: Hierarchical Coverage Thresholds
- **Critical files** (business logic, services, entities, helpers): >=93% (blocks CI)
- **Important files** (UI components, composables, hooks): >=85% (warning)
- **Overall baseline**: >=85% (warning)

#### Component Tests: Critical Paths
- Interactive components (forms, modals, buttons)
- Business logic components (data tables, filters)
- User flow components (authentication, navigation)

#### E2E Tests: User Journeys
- Critical user flows (login, create task, delete task)
- Cross-page navigation
- Browser compatibility (Chromium, Firefox, WebKit)

#### Security Tests: OWASP Top 10
- XSS protection
- CSRF protection
- Content Security Policy
- Input validation

### Performance Requirements
- Unit tests: < 100ms per test
- Component tests: < 500ms per test
- E2E tests: < 30s per test

---

## Testing Timeline (CI/CD Pipeline)

### Setiap Commit/PR (Fast Feedback Loop)
**Wajib dijalankan sebelum merge:**
- Linting (Biome) → 10-30s
- Unit tests (Vitest) → 30-60s
- Coverage check → 10-20s (blocks jika < threshold)
- Security scan (Snyk) → 30-60s (blocks jika critical vuln)
- Component tests (Testing Library) → 30-60s
- API tests (MSW) → Bagian component tests

**Total:** ~2-4min per PR

### Weekly / Before Release (Deep Analysis)
**Wajib dijalankan sebelum production release:**
- Security deep scan (OWASP ZAP) → 5-10min
- Performance testing (Lighthouse) → 5-10min
- Full E2E test suite (Playwright) → 10-20min
- Dependency audit (npm audit / bun audit) → 2-5min

**Total:** ~20-45min per run

### Nightly (jam 12 malam) (Regression Test)
**Automated schedule:**
- Full test suite (unit + component + E2E) → 15-30min
- Performance regression test (Lighthouse) → 10-20min
- Security scan → 5-10min

**Total:** ~30-60min per run

---

## Testing Tools

### Frontend (SvelteKit/Next.js/Nuxt)
- **Vitest**: Unit testing framework (primary)
- **@testing-library/svelte**: Component testing (SvelteKit)
- **@testing-library/react**: Component testing (Next.js)
- **@testing-library/vue**: Component testing (Nuxt)
- **@testing-library/jest-dom**: Custom matchers
- **Playwright**: E2E testing framework
- **Biome**: Linter and formatter

### API Testing (Frontend Focus)
- **MSW (Mock Service Worker)**: API mocking for frontend
- **fetch-mock**: HTTP request mocking
- **Scope:** Test API calls dari frontend perspective
- **Kapan:** PR (component tests)
- **Purpose:** Frontend handles API responses correctly, error handling, loading states

### Security Testing (Frontend Focus)
- **OWASP ZAP**: Dynamic application security testing (client-side)
- **Snyk**: Dependency vulnerability scanning
- **npm audit**: Node.js dependency auditing
- **bun audit**: Bun dependency auditing
- **Scope:** Client-side vulnerabilities (XSS, CSRF, CSP, input validation)
- **Kapan:** PR / weekly / nightly
- **Purpose:** Client-side security vulnerabilities

### Performance Testing (Frontend Focus)
- **Lighthouse**: Performance auditing (primary)
- **k6**: Load testing and performance monitoring
- **WebPageTest**: Web performance analysis
- **Scope:** Rendering performance, loading performance, FCP, LCP, TTI, CLS
- **Kapan:** PR / weekly / before release
- **Purpose:** Client-side performance metrics (FCP < 1.5s, LCP < 2.5s)

---

## Framework-Specific Tools

### SvelteKit
- **@sveltejs/kit**: Built-in testing utilities
- **svelte-check**: Type checking
- **@testing-library/svelte**: Component testing

### Next.js
- **@next/test-utils**: Next.js testing utilities
- **@testing-library/react**: Component testing
- **jest**: Alternative testing framework

### Nuxt
- **@nuxt/test-utils**: Nuxt testing utilities
- **@testing-library/vue**: Component testing
- **vitest**: Primary testing framework

---

## References

- [Frontend Technical Design](./README.md) - Frontend architecture and patterns
- [Backend Testing Strategy (Go)](../backend-spec/testing-strategy-go.md) - Backend testing guidelines
- [Dependency Versions](../architecture/dependencies.md) - Testing tools and versions
- [Vitest Documentation](https://vitest.dev/) - Unit testing framework
- [Playwright Documentation](https://playwright.dev/) - E2E testing framework
- [Testing Library](https://testing-library.com/) - Component testing utilities
- [Biome Documentation](https://biomejs.dev/) - Linter and formatter
