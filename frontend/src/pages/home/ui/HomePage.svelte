<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore } from '$app/store/app-store';

  onMount(() => {
    appStore.setLoading(false);
  });
</script>

<div class="home-page">
  <h1>Welcome to Task Manager</h1>
  <p>Manage your tasks efficiently with our modern task management system.</p>
</div>

<style>
  .home-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
  }
</style>
