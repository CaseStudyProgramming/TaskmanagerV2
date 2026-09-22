import { writable } from 'svelte/store';

interface TaskCreateState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TaskCreateState = {
  isLoading: false,
  error: null,
  success: false
};

export const taskCreateStore = writable<TaskCreateState>(initialState);

export const taskCreateActions = {
  setLoading: (isLoading: boolean) => {
    taskCreateStore.update(state => ({ ...state, isLoading }));
  },
  setError: (error: string | null) => {
    taskCreateStore.update(state => ({ ...state, error }));
  },
  setSuccess: (success: boolean) => {
    taskCreateStore.update(state => ({ ...state, success }));
  },
  reset: () => {
    taskCreateStore.set(initialState);
  }
};
