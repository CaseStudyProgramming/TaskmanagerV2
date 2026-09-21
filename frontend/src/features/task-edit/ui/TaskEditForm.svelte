<script lang="ts">
  import { taskEditStore, taskEditActions } from '../model/task-edit.store';
  import { taskEditSchema, type TaskEditInput } from '../model/task-edit.schema';

  export let taskId: string;

  let formData: Partial<TaskEditInput> = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: []
  };

  let errors: Record<string, string> = {};

  async function handleSubmit() {
    try {
      const validatedData = taskEditSchema.parse({ ...formData, id: taskId });
      taskEditActions.setLoading(true);
      // TODO: Call API to update task
      taskEditActions.setSuccess(true);
      taskEditActions.reset();
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors = error.errors.reduce((acc, err) => {
          acc[err.path[0] as string] = err.message;
          return acc;
        }, {} as Record<string, string>);
      }
      taskEditActions.setError('Validation failed');
    } finally {
      taskEditActions.setLoading(false);
    }
  }
</script>

<div class="task-edit-form">
  <h2>Edit Task</h2>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="title">Title *</label>
      <input
        id="title"
        type="text"
        bind:value={formData.title}
        placeholder="Enter task title"
        class:error={errors.title}
      />
      {#if errors.title}
        <span class="error">{errors.title}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        bind:value={formData.description}
        placeholder="Enter task description"
        rows="4"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="priority">Priority</label>
      <select id="priority" bind:value={formData.priority}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
    </div>

    <div class="form-group">
      <label for="dueDate">Due Date</label>
      <input
        id="dueDate"
        type="date"
        bind:value={formData.dueDate}
      />
    </div>

    <button type="submit" disabled={$taskEditStore.isLoading}>
      {$taskEditStore.isLoading ? 'Updating...' : 'Update Task'}
    </button>
  </form>
</div>

<style>
  .task-edit-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  h2 {
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
  }

  input.error {
    border-color: var(--color-danger);
  }

  .error {
    color: var(--color-danger);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  button {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
