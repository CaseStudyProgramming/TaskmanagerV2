import { syncQueueStore, syncQueueActions } from '../model/sync-queue.store';

export async function syncOperations() {
  const state = syncQueueStore.get();
  
  if (state.isSyncing || state.operations.length === 0) {
    return;
  }

  syncQueueActions.setSyncing(true);

  try {
    for (const operation of state.operations) {
      try {
        let response;
        
        switch (operation.type) {
          case 'create':
            response = await fetch(operation.endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(operation.data)
            });
            break;
          case 'update':
            response = await fetch(operation.endpoint, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(operation.data)
            });
            break;
          case 'delete':
            response = await fetch(operation.endpoint, {
              method: 'DELETE'
            });
            break;
        }

        if (response.ok) {
          syncQueueActions.removeOperation(operation.id);
        } else {
          syncQueueActions.incrementRetry(operation.id);
        }
      } catch (error) {
        syncQueueActions.incrementRetry(operation.id);
      }
    }

    syncQueueActions.setLastSyncTime(Date.now());
  } finally {
    syncQueueActions.setSyncing(false);
  }
}

export function setupSyncListener() {
  // Listen for online events
  window.addEventListener('online', syncOperations);
  
  // Set up periodic sync (every 30 seconds)
  const syncInterval = setInterval(() => {
    if (navigator.onLine) {
      syncOperations();
    }
  }, 30000);

  return () => {
    window.removeEventListener('online', syncOperations);
    clearInterval(syncInterval);
  };
}
