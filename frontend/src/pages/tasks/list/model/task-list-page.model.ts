import { writable } from 'svelte/store';

interface TaskListPageState {
  isLoading: boolean;
  tasks: any[];
  filter: string;
  sortBy: string;
}

const initialState: TaskListPageState = {
  isLoading: false,
  tasks: [],
  filter: 'all',
  sortBy: 'priority'
};

export const taskListPageStore = writable<TaskListPageState>(initialState);

export const taskListPageActions = {
  setLoading: (isLoading: boolean) => {
    taskListPageStore.update(state => ({ ...state, isLoading }));
  },
  setTasks: (tasks: any[]) => {
    taskListPageStore.update(state => ({ ...state, tasks }));
  },
  setFilter: (filter: string) => {
    taskListPageStore.update(state => ({ ...state, filter }));
  },
  setSortBy: (sortBy: string) => {
    taskListPageStore.update(state => ({ ...state, sortBy }));
  }
};
