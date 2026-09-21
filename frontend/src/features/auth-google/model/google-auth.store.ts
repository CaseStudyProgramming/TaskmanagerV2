import { writable } from 'svelte/store';

interface GoogleAuthState {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: any;
}

const initialState: GoogleAuthState = {
  isLoading: false,
  error: null,
  isAuthenticated: false,
  user: null
};

export const googleAuthStore = writable<GoogleAuthState>(initialState);

export const googleAuthActions = {
  setLoading: (isLoading: boolean) => {
    googleAuthStore.update(state => ({ ...state, isLoading }));
  },
  setError: (error: string | null) => {
    googleAuthStore.update(state => ({ ...state, error }));
  },
  setAuthenticated: (isAuthenticated: boolean, user: any) => {
    googleAuthStore.update(state => ({ ...state, isAuthenticated, user }));
  },
  logout: () => {
    googleAuthStore.set(initialState);
  }
};
