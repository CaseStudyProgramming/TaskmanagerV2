<script lang="ts">
  import { setContext } from 'svelte';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

  // Create query client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: 1
      }
    }
  });

  // Query client context key
  const QUERY_CLIENT_KEY = Symbol('queryClient');

  // Provide query client context
  setContext(QUERY_CLIENT_KEY, queryClient);
</script>

<QueryClientProvider client={queryClient}>
  <slot />
</QueryClientProvider>
