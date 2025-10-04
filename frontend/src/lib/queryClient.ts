import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      // Don't throw errors to error boundaries - let components handle them
      throwOnError: false,
    },
    mutations: {
      // Don't throw errors to error boundaries - let components handle them
      throwOnError: false,
    },
  },
});
