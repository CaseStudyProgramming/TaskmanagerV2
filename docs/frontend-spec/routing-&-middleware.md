# Routing & Middleware

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the route mapping, navigation guards, and code-splitting rules for the Advanced Task Manager frontend.

---

## Route Mapping

### Route Structure

**File-Based Routing (SvelteKit):**
```
src/routes/
├── +layout.svelte              # Root layout
├── +layout.server.ts           # Root layout server logic
├── +error.svelte               # Error page
├── +page.svelte                # Home page
├── auth/
│   ├── +layout.svelte          # Auth layout
│   ├── login/
│   │   └── +page.svelte       # Login page
│   └── callback/
│       └── +page.svelte       # OAuth callback page
├── tasks/
│   ├── +layout.svelte          # Tasks layout
│   ├── +page.svelte           # Task list page
│   └── [id]/
│       └── +page.svelte       # Task detail page
└── api/                        # API routes (if needed)
```

### Route Definitions

| Route | File | Purpose | Auth Required |
|-------|------|---------|--------------|
| `/` | `+page.svelte` | Home page | No |
| `/auth/login` | `auth/login/+page.svelte` | Login page | No |
| `/auth/callback` | `auth/callback/+page.svelte` | OAuth callback | No |
| `/tasks` | `tasks/+page.svelte` | Task list | Yes |
| `/tasks/[id]` | `tasks/[id]/+page.svelte` | Task detail | Yes |

### Route Parameters

**Dynamic Route:**
- Export data prop with params
- Access route parameters from data object
- Use parameters in component logic

**Load Function:**
- Fetch data from API using params
- Parse standard response format
- Return data or throw error on failure

---

## Navigation Guards

### Auth Guard

**Protect Routes:**
- Check for access token in cookies
- Allow public routes without authentication
- Redirect to login for protected routes if not authenticated

### Role-Based Guard (Future)

**Check User Role:**
- Fetch user from token
- Check user role for admin routes
- Throw 403 error if unauthorized

---

## Code Splitting

### Lazy Loading

**Component Lazy Loading:**
- Import component dynamically in onMount
- Store component reference
- Render conditionally when loaded

**Route-Based Code Splitting:**
- SvelteKit automatically code-splits by route
- Each route is loaded on-demand
- Reduces initial bundle size

### Dynamic Imports

**Feature-Based Splitting:**
```typescript
// Load feature-specific code
const taskEditor = () => import('./features/task-editor');
const analytics = () => import('./features/analytics');
```

---

## Navigation

### Programmatic Navigation

**Go to Route:**
```typescript
import { goto } from '$app/navigation';

goto('/tasks');
goto('/tasks/123');
goto('/tasks', { replaceState: true });
```

**Navigation with Parameters:**
```typescript
goto(`/tasks/${taskId}`);
```

### Link Component

**SvelteKit Link:**
```svelte
<script>
  import { Link } from 'svelte-navigation';
</script>

<Link to="/tasks">Tasks</Link>
<Link to="/tasks/123">Task Detail</Link>
```

---

## Error Handling

Frontend error handling follows the standard response format defined in [Standard Response Format](../api-specs/standard-response-format.md).

For error codes and their meanings, refer to [Error Codes](../api-specs/error-codes.md).

### Error Pages

**404 Page:**
- Export error status and message
- Display error code and message
- Provide link to home page

**500 Page:**
- Check error status
- Display appropriate message based on status
- Show generic error for non-404 errors

### Error Boundaries

**Component Error Boundary:**
- Listen for window error events
- Store error state
- Display error UI when error occurs
- Allow dismissal of error

---

## SEO

### Meta Tags

**Dynamic Meta Tags:**
- Update document title based on route
- Add meta tags in svelte:head
- Include Open Graph meta tags

### Sitemap (Future)

**Generate Sitemap:**
- Define routes with URLs and last modified dates
- Generate XML sitemap format
- Return XML response with appropriate headers

---

## References

- [Frontend Technical Design](./README.md) - Frontend architecture overview
- [SvelteKit Routing Documentation](https://kit.svelte.dev/docs/routing) - SvelteKit routing documentation
