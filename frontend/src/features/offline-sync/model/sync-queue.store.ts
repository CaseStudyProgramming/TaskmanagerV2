import { writable } from 'svelte/store';

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface SyncQueueState {
  operations: SyncOperation[];
  isSyncing: boolean;
  lastSyncTime: number | null;
}

const initialState: SyncQueueState = {
  operations: [],
  isSyncing: false,
  lastSyncTime: null
};

export const syncQueueStore = writable<SyncQueueState>(initialState);

export const syncQueueActions = {
  addOperation: (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    syncQueueStore.update(state => ({
      ...state,
      operations: [
        ...state.operations,
        {
          ...operation,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          retryCount: 0
        }
      ]
    }));
  },
  removeOperation: (id: string) => {
    syncQueueStore.update(state => ({
      ...state,
      operations: state.operations.filter(op => op.id !== id)
    }));
  },
  incrementRetry: (id: string) => {
    syncQueueStore.update(state => ({
      ...state,
      operations: state.operations.map(op =>
        op.id === id ? { ...op, retryCount: op.retryCount + 1 } : op
      )
    }));
  },
  setSyncing: (isSyncing: boolean) => {
    syncQueueStore.update(state => ({ ...state, isSyncing }));
  },
  setLastSyncTime: (time: number) => {
    syncQueueStore.update(state => ({ ...state, lastSyncTime: time }));
  },
  clearQueue: () => {
    syncQueueStore.update(state => ({ ...state, operations: [] }));
  }
};
