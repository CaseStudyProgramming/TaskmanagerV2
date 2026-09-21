<script lang="ts">
  export let priority: 'low' | 'medium' | 'high' | 'urgent';
  export let size: 'small' | 'medium' | 'large' = 'medium';

  const priorityConfig = {
    low: { color: '#22c55e', label: 'Low' },
    medium: { color: '#f59e0b', label: 'Medium' },
    high: { color: '#f97316', label: 'High' },
    urgent: { color: '#ef4444', label: 'Urgent' }
  };

  $: config = priorityConfig[priority];
</script>

<span
  class="priority-badge"
  class:small={size === 'small'}
  class:large={size === 'large'}
  style="--priority-color: {config.color}"
>
  {config.label}
</span>

<style>
  .priority-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    background-color: var(--priority-color);
    color: white;
  }

  .priority-badge.small {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  .priority-badge.large {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
</style>
