<script lang="ts">
  import { appStore } from '$app/store/app-store';
  import { getContext } from 'svelte';

  const theme = getContext('theme');
</script>

<header class="header">
  <div class="header-content">
    <div class="logo">
      <h1>Task Manager</h1>
    </div>
    <nav class="nav">
      <a href="/">Home</a>
      <a href="/tasks">Tasks</a>
    </nav>
    <div class="header-actions">
      <button class="theme-toggle" on:click={theme?.toggleTheme}>
        {theme?.themeState === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  </div>
</header>

<style>
  .header {
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo h1 {
    font-size: 1.5rem;
    margin: 0;
  }

  .nav {
    display: flex;
    gap: 2rem;
  }

  .nav a {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav a:hover {
    color: var(--color-primary);
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .theme-toggle {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.5rem;
    cursor: pointer;
    font-size: 1.25rem;
    transition: background-color 0.2s;
  }

  .theme-toggle:hover {
    background-color: var(--color-background-secondary);
  }
</style>
