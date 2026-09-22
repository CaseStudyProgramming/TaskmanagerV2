<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  // Auth state
  const authState = writable({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Auth context key
  const AUTH_KEY = Symbol('auth');

  // Provide auth context
  setContext(AUTH_KEY, {
    authState,
    login: (token: string, user: any) => {
      authState.set({
        isAuthenticated: true,
        user,
        token
      });
      localStorage.setItem('auth_token', token);
    },
    logout: () => {
      authState.set({
        isAuthenticated: false,
        user: null,
        token: null
      });
      localStorage.removeItem('auth_token');
    },
    checkAuth: () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        authState.update(state => ({
          ...state,
          isAuthenticated: true,
          token
        }));
      }
    }
  });
</script>

<slot />
