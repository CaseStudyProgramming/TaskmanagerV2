import { writable } from 'svelte/store';

interface CallbackPageState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CallbackPageState = {
  isLoading: true,
  error: null,
  success: false
};

export const callbackPageStore = writable<CallbackPageState>(initialState);

export const callbackPageActions = {
  setLoading: (isLoading: boolean) => {
    callbackPageStore.update(state => ({ ...state, isLoading }));
  },
  setError: (error: string | null) => {
    callbackPageStore.update(state => ({ ...state, error }));
  },
  setSuccess: (success: boolean) => {
    callbackPageStore.update(state => ({ ...state, success }));
  }
};
