<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { syncQueueStore } from '$features/offline-sync/model/sync-queue.store';

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
    <div class="indicator-content">
      <span class="status-icon">📡</span>
      <span class="status-text">You're offline</span>
      {#if $syncQueueStore.operations.length > 0}
        <span class="sync-info">
          {$syncQueueStore.operations.length} change{$syncQueueStore.operations.length !== 1 ? 's' : ''} pending sync
        </span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .offline-indicator {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }

  .indicator-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background-color: var(--color-warning);
    color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    font-size: 0.875rem;
  }

  .status-icon {
    font-size: 1.25rem;
  }

  .status-text {
    font-weight: 500;
  }

  .sync-info {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
  }
</style>
