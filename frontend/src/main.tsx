import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import App from './App.tsx';

// Create React Query client with default configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time matches backend cache (5 minutes for courses)
      staleTime: 5 * 60 * 1000,
      // Retry failed requests
      retry: 3,
      // Refetch on window focus (disable for mobile/data savings)
      refetchOnWindowFocus: false,
      // Keep previous data while fetching new data
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry failed mutations
      retry: 2,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);
