<script lang="ts">
  import { taskFilterStore, taskFilterActions } from '../model/task-filter.store';
  import { taskFilterSchema, type TaskFilterInput } from '../model/task-filter.schema';

  let filters: TaskFilterInput = {
    status: 'all',
    priority: 'all',
    dueDate: '',
    tags: []
  };

  let newTag = '';

  function addTag() {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      filters.tags = [...filters.tags, newTag.trim()];
      taskFilterActions.setTags(filters.tags);
      newTag = '';
    }
  }

  function removeTag(tag: string) {
    filters.tags = filters.tags.filter(t => t !== tag);
    taskFilterActions.setTags(filters.tags);
  }

  function resetFilters() {
    filters = {
      status: 'all',
      priority: 'all',
      dueDate: '',
      tags: []
    };
    taskFilterActions.reset();
  }
</script>

<div class="task-filter-panel">
  <h3>Filter Tasks</h3>
  
  <div class="filter-group">
    <label for="status">Status</label>
    <select id="status" bind:value={filters.status} on:change={() => taskFilterActions.setStatus(filters.status)}>
      <option value="all">All</option>
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>

  <div class="filter-group">
    <label for="priority">Priority</label>
    <select id="priority" bind:value={filters.priority} on:change={() => taskFilterActions.setPriority(filters.priority)}>
      <option value="all">All</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>
  </div>

  <div class="filter-group">
    <label for="dueDate">Due Date</label>
    <input
      id="dueDate"
      type="date"
      bind:value={filters.dueDate}
      on:change={() => taskFilterActions.setDueDate(filters.dueDate)}
    />
  </div>

  <div class="filter-group">
    <label>Tags</label>
    <div class="tag-input">
      <input
        type="text"
        bind:value={newTag}
        placeholder="Add tag and press Enter"
        on:keydown={(e) => e.key === 'Enter' && addTag()}
      />
      <button type="button" on:click={addTag}>Add</button>
    </div>
    <div class="tags">
      {#each filters.tags as tag}
        <span class="tag">
          {tag}
          <button on:click={() => removeTag(tag)}>×</button>
        </span>
      {/each}
    </div>
  </div>

  <button class="reset-btn" on:click={resetFilters}>Reset Filters</button>
</div>

<style>
  .task-filter-panel {
    padding: 1.5rem;
    background-color: var(--color-background-secondary);
    border-radius: var(--radius-lg);
    margin-bottom: 1.5rem;
  }

  h3 {
    margin-bottom: 1rem;
  }

  .filter-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  select,
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .tag-input {
    display: flex;
    gap: 0.5rem;
  }

  .tag-input input {
    flex: 1;
  }

  .tag-input button {
    padding: 0.5rem 1rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
  }

  .tag button {
    background: none;
    color: white;
    padding: 0;
    font-size: 1rem;
  }

  .reset-btn {
    width: 100%;
    padding: 0.5rem 1rem;
    background-color: var(--color-secondary);
    color: white;
    border-radius: var(--radius-md);
    margin-top: 1rem;
  }
</style>
