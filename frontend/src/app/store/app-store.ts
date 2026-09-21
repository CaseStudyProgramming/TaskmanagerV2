import { writable } from 'svelte/store';

interface AppState {
  isLoading: boolean;
  error: string | null;
  notification: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;
}

const initialState: AppState = {
  isLoading: false,
  error: null,
  notification: null
};

export const appStore = writable<AppState>(initialState);

export const appActions = {
  setLoading: (isLoading: boolean) => {
    appStore.update(state => ({ ...state, isLoading }));
  },
  setError: (error: string | null) => {
    appStore.update(state => ({ ...state, error }));
  },
  setNotification: (notification: AppState['notification']) => {
    appStore.update(state => ({ ...state, notification }));
  },
  clearNotification: () => {
    appStore.update(state => ({ ...state, notification: null }));
  }
};
