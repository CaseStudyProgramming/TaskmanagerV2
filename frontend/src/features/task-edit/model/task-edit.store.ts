import { writable } from 'svelte/store';

interface TaskEditState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TaskEditState = {
  isLoading: false,
  error: null,
  success: false
};

export const taskEditStore = writable<TaskEditState>(initialState);

export const taskEditActions = {
  setLoading: (isLoading: boolean) => {
    taskEditStore.update(state => ({ ...state, isLoading }));
  },
  setError: (error: string | null) => {
    taskEditStore.update(state => ({ ...state, error }));
  },
  setSuccess: (success: boolean) => {
    taskEditStore.update(state => ({ ...state, success }));
  },
  reset: () => {
    taskEditStore.set(initialState);
  }
};
