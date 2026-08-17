import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes fresh in cache
        gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
        retry: (failureCount, error: any) => {
          // Retry on network errors or 503/502/504 cold starts up to 3 times
          if (failureCount < 3) return true;
          return false;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount) => failureCount < 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: false, // Prevent aggressive simultaneous RPC requests on hover
    defaultPreloadStaleTime: 1000 * 60 * 5,
  });

  return router;
};
