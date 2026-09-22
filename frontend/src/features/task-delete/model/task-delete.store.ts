import { writable } from 'svelte/store';

interface TaskDeleteState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TaskDeleteState = {
  isLoading: false,
  error: null,
  success: false
};

export const taskDeleteStore = writable<TaskDeleteState>(initialState);

export const taskDeleteActions = {
  setLoading: (isLoading: boolean) => {
    taskDeleteStore.update(state => ({ ...state, isLoading }));
  },
  setError: (error: string | null) => {
    taskDeleteStore.update(state => ({ ...state, error }));
  },
  setSuccess: (success: boolean) => {
    taskDeleteStore.update(state => ({ ...state, success }));
  },
  reset: () => {
    taskDeleteStore.set(initialState);
  }
};
