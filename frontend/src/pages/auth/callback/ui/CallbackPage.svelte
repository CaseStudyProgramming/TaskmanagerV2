<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore } from '$app/store/app-store';

  onMount(() => {
    // TODO: Handle OAuth callback
    appStore.setLoading(true);
    // Process the callback from Google OAuth
    setTimeout(() => {
      appStore.setLoading(false);
      appStore.setNotification({
        message: 'Authentication callback will be implemented',
        type: 'info'
      });
    }, 1000);
  });
</script>

<div class="callback-page">
  <div class="callback-container">
    <div class="spinner"></div>
    <p>Processing authentication...</p>
  </div>
</div>

<style>
  .callback-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--color-background-secondary);
  }

  .callback-container {
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  p {
    color: var(--color-text-secondary);
  }
</style>
