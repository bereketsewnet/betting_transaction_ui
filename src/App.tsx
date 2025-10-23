import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext';
import { SocketProvider } from './providers/SocketProvider';
import { AppRoutes } from './routes/AppRoutes';
import './i18n';
import './styles/global.css';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--color-success)',
                    secondary: 'var(--color-secondary)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--color-error)',
                    secondary: 'var(--color-secondary)',
                  },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

