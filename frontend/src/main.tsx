import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './app.css';
import { queryClient } from './lib/queryClient';
import ErrorBoundary from './components/common/ErrorBoundary';

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
    return;
  }

  // console.log('Starting mock service worker...');
  const { worker } = await import('./mocks/browser');

  return worker
    .start({
      onUnhandledRequest: 'warn',
    })
    .then(() => {
      // console.log('Mock service worker started successfully');
    });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
});
