import { writable } from 'svelte/store';

interface HomePageState {
  isLoading: boolean;
  recentTasks: any[];
}

const initialState: HomePageState = {
  isLoading: false,
  recentTasks: []
};

export const homePageStore = writable<HomePageState>(initialState);

export const homePageActions = {
  setLoading: (isLoading: boolean) => {
    homePageStore.update(state => ({ ...state, isLoading }));
  },
  setRecentTasks: (tasks: any[]) => {
    homePageStore.update(state => ({ ...state, recentTasks: tasks }));
  }
};
