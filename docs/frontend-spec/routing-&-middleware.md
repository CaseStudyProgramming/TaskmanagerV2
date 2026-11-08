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
```svelte
<!-- src/routes/tasks/[id]/+page.svelte -->
<script lang="ts">
  export let data;

  const taskId = data.params.id;
</script>

<h1>Task {taskId}</h1>
```

**Load Function:**
```typescript
// src/routes/tasks/[id]/+page.ts
export async function load({ params, fetch }) {
  const response = await fetch(`/api/v1/tasks/${params.id}`);
  const data = await response.json();

  if (data.status.is_success) {
    return {
      task: data.data,
    };
  }

  throw error(404, 'Task not found');
}
```

---

## Navigation Guards

### Auth Guard

**Protect Routes:**
```typescript
// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, url }) {
  const token = cookies.get('access_token');

  // Allow public routes
  const publicRoutes = ['/', '/auth/login', '/auth/callback'];
  if (publicRoutes.includes(url.pathname)) {
    return {};
  }

  // Check authentication
  if (!token) {
    throw redirect(302, '/auth/login');
  }

  return {};
}
```

### Role-Based Guard (Future)

**Check User Role:**
```typescript
export async function load({ cookies, url }) {
  const token = cookies.get('access_token');
  const user = await getUserFromToken(token);

  // Admin-only routes
  if (url.pathname.startsWith('/admin') && user.role !== 'admin') {
    throw error(403, 'Forbidden');
  }

  return {};
}
```

---

## Code Splitting

### Lazy Loading

**Component Lazy Loading:**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let TaskForm;

  onMount(async () => {
    TaskForm = (await import('./components/TaskForm.svelte')).default;
  });
</script>

{#if TaskForm}
  <svelte:component this={TaskForm} />
{/if}
```

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

### Error Pages

**404 Page:**
```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';

  $: error = $page.error;
</script>

<h1>{error.status}</h1>
<p>{error.message}</p>

<a href="/">Go Home</a>
```

**500 Page:**
```svelte
<!-- src/routes/+error.svelte (handles both 404 and 500) -->
<script lang="ts">
  import { page } from '$app/stores';

  $: error = $page.error;
</script>

{#if error.status === 404}
  <h1>Page Not Found</h1>
{:else}
  <h1>Something went wrong</h1>
{/if}

<p>{error.message}</p>
```

### Error Boundaries

**Component Error Boundary:**
```svelte
<script lang="ts">
  let error = null;

  function handleError(event) {
    error = event.error;
  }
</script>

<svelte:window on:error={handleError} />

{#if error}
  <div class="error">
    <h2>An error occurred</h2>
    <p>{error.message}</p>
    <button on:click={() => (error = null)}>Dismiss</button>
  </div>
{:else}
  <slot />
{/if}
```

---

## SEO

### Meta Tags

**Dynamic Meta Tags:**
```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';

  $: {
    document.title = $page.url.pathname === '/' ? 'Task Manager' : 'Task Manager - Tasks';
  }
</script>

<svelte:head>
  <meta name="description" content="Advanced task management application" />
  <meta name="keywords" content="task, management, productivity" />
  <meta property="og:title" content="Task Manager" />
  <meta property="og:description" content="Advanced task management application" />
  <meta property="og:type" content="website" />
</svelte:head>
```

### Sitemap (Future)

**Generate Sitemap:**
```typescript
// src/routes/sitemap.xml/+server.ts
export async function GET() {
  const routes = [
    { url: 'https://davidcps.my.id', lastmod: new Date() },
    { url: 'https://davidcps.my.id/tasks', lastmod: new Date() },
  ];

  const sitemap = generateSitemap(routes);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

---

## References

- [Frontend Technical Design](./README.md) - Frontend architecture overview
- [SvelteKit Routing Documentation](https://kit.svelte.dev/docs/routing) - SvelteKit routing documentation
