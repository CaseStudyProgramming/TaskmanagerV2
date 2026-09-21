import { writable } from 'svelte/store';

interface LoginPageState {
  isLoading: boolean;
  error: string | null;
}

const initialState: LoginPageState = {
  isLoading: false,
  error: null
};

export const loginPageStore = writable<LoginPageState>(initialState);

export const loginPageActions = {
  setLoading: (isLoading: boolean) => {
    loginPageStore.update(state => ({ ...state, isLoading }));
  },
  setError: (error: string | null) => {
    loginPageStore.update(state => ({ ...state, error }));
  }
};
