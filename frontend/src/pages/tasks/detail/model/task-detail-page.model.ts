import { writable } from 'svelte/store';

interface TaskDetailPageState {
  isLoading: boolean;
  task: any;
  error: string | null;
}

const initialState: TaskDetailPageState = {
  isLoading: false,
  task: null,
  error: null
};

export const taskDetailPageStore = writable<TaskDetailPageState>(initialState);

export const taskDetailPageActions = {
  setLoading: (isLoading: boolean) => {
    taskDetailPageStore.update(state => ({ ...state, isLoading }));
  },
  setTask: (task: any) => {
    taskDetailPageStore.update(state => ({ ...state, task }));
  },
  setError: (error: string | null) => {
    taskDetailPageStore.update(state => ({ ...state, error }));
  }
};
