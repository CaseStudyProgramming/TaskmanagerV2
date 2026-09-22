<script lang="ts">
  export let priority: 'low' | 'medium' | 'high' | 'urgent';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let showLabel = true;

  const priorityConfig = {
    low: { color: '#22c55e', icon: '↓', label: 'Low' },
    medium: { color: '#f59e0b', icon: '→', label: 'Medium' },
    high: { color: '#f97316', icon: '↑', label: 'High' },
    urgent: { color: '#ef4444', icon: '⚡', label: 'Urgent' }
  };

  $: config = priorityConfig[priority];
</script>

<span
  class="priority-badge"
  class:small={size === 'small'}
  class:large={size === 'large'}
  style="--priority-color: {config.color}"
>
  <span class="priority-icon">{config.icon}</span>
  {#if showLabel}
    <span class="priority-label">{config.label}</span>
  {/if}
</span>

<style>
  .priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
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

  .priority-icon {
    font-size: 1em;
  }

  .priority-label {
    font-size: 0.875em;
  }
</style>
