<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { syncQueueStore } from '../model/sync-queue.store';

  let isOnline = navigator.onLine;

  onMount(() => {
    const handleOnline = () => isOnline = true;
    const handleOffline = () => isOnline = false;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
</script>

{#if !isOnline}
  <div class="offline-indicator">
    <span class="status-dot"></span>
    <span>You're offline. Changes will sync when connection is restored.</span>
    {#if $syncQueueStore.operations.length > 0}
      <span class="pending-count">{$syncQueueStore.operations.length} pending</span>
    {/if}
  </div>
{/if}

<style>
  .offline-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: var(--color-warning);
    color: white;
    font-size: 0.875rem;
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background-color: white;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .pending-count {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-sm);
    font-weight: 500;
  }
</style>
