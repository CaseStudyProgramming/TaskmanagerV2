<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore } from '$app/store/app-store';

  onMount(() => {
    appStore.setLoading(false);
  });
</script>

<div class="task-detail-page">
  <div class="header">
    <h1>Task Details</h1>
    <div class="actions">
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  </div>
  <div class="task-content">
    <p class="empty-state">Task not found</p>
  </div>
</div>

<style>
  .task-detail-page {
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

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .edit-btn:hover {
    background-color: var(--color-primary-dark);
  }

  .delete-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--color-danger);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .delete-btn:hover {
    background-color: #dc2626;
  }

  .task-content {
    min-height: 200px;
  }

  .empty-state {
    text-align: center;
    color: var(--color-text-secondary);
    padding: 3rem;
  }
</style>
