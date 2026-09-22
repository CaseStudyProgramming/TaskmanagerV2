<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore } from '$app/store/app-store';

  onMount(() => {
    appStore.setLoading(false);
  });
</script>

<div class="task-list-page">
  <div class="header">
    <h1>My Tasks</h1>
    <button class="create-btn">Create Task</button>
  </div>
  <div class="task-list">
    <p class="empty-state">No tasks yet. Create your first task!</p>
  </div>
</div>

<style>
  .task-list-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
  }

  .create-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .create-btn:hover {
    background-color: var(--color-primary-dark);
  }

  .task-list {
    min-height: 200px;
  }

  .empty-state {
    text-align: center;
    color: var(--color-text-secondary);
    padding: 3rem;
  }
</style>
