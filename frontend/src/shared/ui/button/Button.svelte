<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let fullWidth = false;

  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    danger: 'button-danger',
    success: 'button-success',
  };

  const sizeClasses = {
    small: 'button-small',
    medium: 'button-medium',
    large: 'button-large',
  };

  $: classes = [
    'button',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'button-full-width',
    disabled && 'button-disabled',
  ].filter(Boolean).join(' ');
</script>

<button
  {type}
  {disabled}
  class={classes}
  on:click
>
  <slot />
</button>

<style>
  .button {
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .button-primary {
    background-color: var(--color-primary);
    color: white;
  }

  .button-primary:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  .button-secondary {
    background-color: var(--color-secondary);
    color: white;
  }

  .button-secondary:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .button-danger {
    background-color: var(--color-danger);
    color: white;
  }

  .button-danger:hover:not(:disabled) {
    background-color: #dc2626;
  }

  .button-success {
    background-color: var(--color-success);
    color: white;
  }

  .button-success:hover:not(:disabled) {
    background-color: #16a34a;
  }

  .button-small {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .button-medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .button-large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  .button-full-width {
    width: 100%;
  }

  .button-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
