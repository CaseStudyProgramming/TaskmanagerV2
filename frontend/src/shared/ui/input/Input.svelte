<script lang="ts">
  export let type: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' = 'text';
  export let placeholder = '';
  export let value = '';
  export let disabled = false;
  export let error = '';
  export let label = '';
  export let required = false;
  export let name = '';

  $: id = `input-${name || Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="input-wrapper">
  {#if label}
    <label for={id} class="input-label">
      {label}
      {#if required}
        <span class="required">*</span>
      {/if}
    </label>
  {/if}
  <input
    {id}
    {name}
    {type}
    {placeholder}
    {value}
    {disabled}
    class:error={error}
    on:input
  />
  {#if error}
    <span class="input-error">{error}</span>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .input-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .required {
    color: var(--color-danger);
  }

  input {
    padding: 0.625rem 0.875rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  input.error {
    border-color: var(--color-danger);
  }

  input:disabled {
    background-color: var(--color-background-secondary);
    cursor: not-allowed;
  }

  .input-error {
    font-size: 0.75rem;
    color: var(--color-danger);
  }
</style>
