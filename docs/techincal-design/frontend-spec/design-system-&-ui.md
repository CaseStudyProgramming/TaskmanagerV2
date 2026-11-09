# Design System & UI

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the component anatomy, theme tokens, and accessibility (WCAG) standards for the Advanced Task Manager frontend.

---

## Design System

### Component Anatomy

**Component Structure:**
```
component-name/
├── ui/
│   ├── ComponentName.svelte       # Main component
│   ├── ComponentName.spec.ts      # Unit tests
│   └── ComponentName.stories.ts   # Storybook stories (future)
└── index.ts                        # Public API
```

**Component Best Practices:**
- Single responsibility
- Reusable and composable
- Accessible by default
- Type-safe props
- Clear prop naming

### Example Component

**Component Structure:**
- Script block with TypeScript
- Props interface with type annotations
- Derived reactive classes
- HTML template with bindings
- Scoped styles with utility classes

---

## Theme Tokens

### Color Palette

**Primary Colors:**
```css
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

**Semantic Colors:**
```css
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #3b82f6;
```

**Neutral Colors:**
```css
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

### Typography

**Font Families:**
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Font Sizes:**
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

**Font Weights:**
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing

**Spacing Scale:**
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## Accessibility (WCAG)

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Implementation:**
- Use high contrast colors for text
- Verify contrast ratios meet WCAG AA standards
- Avoid low contrast combinations

### Keyboard Navigation

**Focus Styles:**
```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary-600);
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**Tab Order:**
- Logical tab order follows visual order
- Use semantic HTML
- Avoid `tabindex` (except for special cases)

### Screen Reader Support

**ARIA Labels:**
```svelte
<button aria-label="Create new task">
  <Icon name="plus" />
</button>

<input
  type="text"
  aria-label="Task title"
  aria-describedby="title-help"
/>
<span id="title-help">Enter a descriptive title for your task</span>
```

**Live Regions:**
```svelte
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>
```

### Semantic HTML

**Use Semantic Elements:**
```svelte
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/tasks">Tasks</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>Task Manager</h1>
  <section>
    <h2>Create Task</h2>
    <!-- Task form -->
  </section>
</main>

<footer>
  <p>&copy; 2024 Task Manager</p>
</footer>
```

---

## Responsive Design

### Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

**Tailwind Responsive Classes:**
```svelte
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid -->
</div>
```

### Mobile-First Approach

**Base Styles (Mobile):**
```css
.container {
  padding: 1rem;
}
```

**Desktop Styles:**
```css
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

---

## Icon System

**Icon Library:** Lucide Icons

**Usage:**
```svelte
<script>
  import { Plus, Trash, Edit } from 'lucide-svelte';
</script>

<Plus size={24} />
<Trash size={20} />
<Edit size={16} />
```

**Icon Sizes:**
```css
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 48px;
```

---

## Animation

**Transitions:**
```css
.transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-slow {
  transition-duration: 300ms;
}
```

**Animations:**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
```

---

## References

- [Frontend Technical Design](./README.md) - Frontend architecture overview
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
- [Lucide Icons](https://lucide.dev/) - Icon library
