<script lang="ts">
  import type { Task } from '$entities/task/model/task';
  import { formatDate, isTaskOverdue, isTaskDueSoon } from '$shared/lib/time/time-helpers';
  import PriorityBadge from '$features/task-prioritize/ui/PriorityBadge.svelte';

  export let task: Task;
  export let onEdit?: (task: Task) => void;
  export let onDelete?: (task: Task) => void;

  $: isOverdue = isTaskOverdue(task);
  $: isDueSoon = isTaskDueSoon(task);
</script>

<div class="task-card" class:overdue={isOverdue} class:due-soon={isDueSoon}>
  <div class="task-header">
    <h3 class="task-title">{task.title}</h3>
    <PriorityBadge priority={task.priority} size="small" />
  </div>

  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}

  <div class="task-meta">
    <div class="task-due-date">
      {#if task.dueDate}
        <span class="due-date-label">Due:</span>
        <span class:overdue={isOverdue} class:due-soon={isDueSoon}>
          {formatDate(task.dueDate)}
        </span>
      {/if}
    </div>

    <div class="task-status">
      <span class="status-badge">{task.status.replace('_', ' ')}</span>
    </div>
  </div>

  {#if task.tags.length > 0}
    <div class="task-tags">
      {#each task.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}

  <div class="task-actions">
    {#if onEdit}
      <button class="action-btn edit-btn" on:click={() => onEdit(task)}>Edit</button>
    {/if}
    {#if onDelete}
      <button class="action-btn delete-btn" on:click={() => onDelete(task)}>Delete</button>
    {/if}
  </div>
</div>

<style>
  .task-card {
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.2s;
  }

  .task-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .task-card.overdue {
    border-left: 4px solid var(--color-danger);
  }

  .task-card.due-soon {
    border-left: 4px solid var(--color-warning);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .task-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    flex: 1;
    margin-right: 0.5rem;
  }

  .task-description {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .task-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .task-due-date {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .due-date-label {
    color: var(--color-text-secondary);
  }

  .task-due-date .overdue {
    color: var(--color-danger);
    font-weight: 500;
  }

  .task-due-date .due-soon {
    color: var(--color-warning);
    font-weight: 500;
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    background-color: var(--color-background-secondary);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .task-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tag {
    padding: 0.25rem 0.5rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
  }

  .task-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .action-btn {
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .edit-btn {
    background-color: var(--color-primary);
    color: white;
  }

  .edit-btn:hover {
    background-color: var(--color-primary-dark);
  }

  .delete-btn {
    background-color: var(--color-danger);
    color: white;
  }

  .delete-btn:hover {
    background-color: #dc2626;
  }
</style>
