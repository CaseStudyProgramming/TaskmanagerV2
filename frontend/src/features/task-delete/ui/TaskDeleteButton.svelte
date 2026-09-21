<script lang="ts">
  import { taskDeleteStore, taskDeleteActions } from '../model/task-delete.store';
  import { deleteTask } from '../api/task-delete.api';

  export let taskId: string;
  export let taskTitle: string;

  let showConfirm = false;

  async function handleDelete() {
    try {
      taskDeleteActions.setLoading(true);
      await deleteTask(taskId);
      taskDeleteActions.setSuccess(true);
      showConfirm = false;
      // TODO: Emit event or callback to refresh task list
    } catch (error) {
      taskDeleteActions.setError('Failed to delete task');
    } finally {
      taskDeleteActions.setLoading(false);
    }
  }
</script>

<div class="task-delete-button">
  <button
    class="delete-btn"
    on:click={() => showConfirm = true}
    disabled={$taskDeleteStore.isLoading}
  >
    Delete
  </button>

  {#if showConfirm}
    <div class="confirm-dialog">
      <div class="confirm-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete "{taskTitle}"?</p>
        <div class="confirm-actions">
          <button class="cancel-btn" on:click={() => showConfirm = false}>
            Cancel
          </button>
          <button class="confirm-btn" on:click={handleDelete} disabled={$taskDeleteStore.isLoading}>
            {$taskDeleteStore.isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .delete-btn {
    padding: 0.5rem 1rem;
    background-color: var(--color-danger);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .delete-btn:hover:not(:disabled) {
    background-color: #dc2626;
  }

  .delete-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .confirm-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .confirm-content {
    background: var(--color-background);
    padding: 2rem;
    border-radius: var(--radius-lg);
    max-width: 400px;
    width: 90%;
    box-shadow: var(--shadow-lg);
  }

  h3 {
    margin-bottom: 1rem;
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
  }

  .confirm-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .cancel-btn {
    padding: 0.5rem 1rem;
    background-color: var(--color-secondary);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
  }

  .confirm-btn {
    padding: 0.5rem 1rem;
    background-color: var(--color-danger);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
  }

  .confirm-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
