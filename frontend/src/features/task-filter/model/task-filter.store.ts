import { writable } from 'svelte/store';

interface TaskFilterState {
  status: string;
  priority: string;
  dueDate: string;
  tags: string[];
}

const initialState: TaskFilterState = {
  status: 'all',
  priority: 'all',
  dueDate: '',
  tags: []
};

export const taskFilterStore = writable<TaskFilterState>(initialState);

export const taskFilterActions = {
  setStatus: (status: string) => {
    taskFilterStore.update(state => ({ ...state, status }));
  },
  setPriority: (priority: string) => {
    taskFilterStore.update(state => ({ ...state, priority }));
  },
  setDueDate: (dueDate: string) => {
    taskFilterStore.update(state => ({ ...state, dueDate }));
  },
  setTags: (tags: string[]) => {
    taskFilterStore.update(state => ({ ...state, tags }));
  },
  reset: () => {
    taskFilterStore.set(initialState);
  }
};
