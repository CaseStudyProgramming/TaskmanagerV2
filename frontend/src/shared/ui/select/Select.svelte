<script lang="ts">
  export let options: Array<{ value: string; label: string }> = [];
  export let value = '';
  export let placeholder = 'Select an option';
  export let disabled = false;
  export let error = '';
  export let label = '';
  export let required = false;
  export let name = '';

  $: id = `select-${name || Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="select-wrapper">
  {#if label}
    <label for={id} class="select-label">
      {label}
      {#if required}
        <span class="required">*</span>
      {/if}
    </label>
  {/if}
  <select
    {id}
    {name}
    {value}
    {disabled}
    class:error={error}
    on:change
  >
    <option value="">{placeholder}</option>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  {#if error}
    <span class="select-error">{error}</span>
  {/if}
</div>

<style>
  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .select-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .required {
    color: var(--color-danger);
  }

  select {
    padding: 0.625rem 0.875rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-family: inherit;
    background-color: var(--color-background);
    cursor: pointer;
    transition: border-color 0.2s;
  }

  select:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  select.error {
    border-color: var(--color-danger);
  }

  select:disabled {
    background-color: var(--color-background-secondary);
    cursor: not-allowed;
  }

  .select-error {
    font-size: 0.75rem;
    color: var(--color-danger);
  }
</style>
