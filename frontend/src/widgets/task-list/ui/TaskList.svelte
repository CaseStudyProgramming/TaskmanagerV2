<script lang="ts">
  import type { Task } from '$entities/task/model/task';
  import TaskCard from '$widgets/task-card/ui/TaskCard.svelte';

  export let tasks: Task[] = [];
  export let loading = false;
  export let emptyMessage = 'No tasks found';
  export let onEdit?: (task: Task) => void;
  export let onDelete?: (task: Task) => void;
</script>

<div class="task-list">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>
  {:else if tasks.length === 0}
    <div class="empty-state">
      <p>{emptyMessage}</p>
    </div>
  {:else}
    <div class="tasks">
      {#each tasks as task (task.id)}
        <TaskCard
          {task}
          {onEdit}
          {onDelete}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .task-list {
    width: 100%;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-state p {
    color: var(--color-text-secondary);
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
  }

  .empty-state p {
    color: var(--color-text-secondary);
    font-size: 1.125rem;
  }

  .tasks {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
