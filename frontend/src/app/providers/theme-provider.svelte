<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  // Theme state
  const themeState = writable<'light' | 'dark'>('light');

  // Theme context key
  const THEME_KEY = Symbol('theme');

  // Provide theme context
  setContext(THEME_KEY, {
    themeState,
    toggleTheme: () => {
      themeState.update(current => {
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        return newTheme;
      });
    },
    setTheme: (theme: 'light' | 'dark') => {
      themeState.set(theme);
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  });

  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (savedTheme) {
    themeState.set(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    themeState.set('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
</script>

<slot />
