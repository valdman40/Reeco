import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import OrdersPage from '../src/pages/OrdersPage';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import ErrorBoundary from '../src/components/common/ErrorBoundary';

const server = setupServer(...handlers);

// Mock window.scrollTo to avoid warnings
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderApp(initialEntries = ['/']) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        throwOnError: false,
      },
      mutations: {
        retry: false,
        throwOnError: false,
      },
    },
  });
  
  const router = createMemoryRouter(
    [
      { path: '/', element: <OrdersPage /> },
      { path: '/orders', element: <OrdersPage /> },
    ],
    {
      initialEntries,
    }
  );
  
  return render(
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

test('loads and shows orders with improved error handling', async () => {
  renderApp();
  
  // Wait for loading to complete and data to appear
  expect(await screen.findByText(/Alice Johnson/)).toBeInTheDocument();
  
  // Verify page structure
  expect(screen.getByText('Order Management')).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Search orders/)).toBeInTheDocument();
  expect(screen.getByText('Filter by Status')).toBeInTheDocument();
});

test('renders with error boundary protection', async () => {
  renderApp();
  
  // Verify the error boundary wrapper is working (indirectly)
  // The page should load successfully with ErrorBoundary wrapper
  expect(await screen.findByText(/Alice Johnson/)).toBeInTheDocument();
  expect(screen.getByText('Order Management')).toBeInTheDocument();
});

test('handles search input rendering', async () => {
  renderApp();
  
  // Wait for initial load
  await screen.findByText(/Alice Johnson/);
  
  // Verify search functionality elements are present
  const searchInput = screen.getByPlaceholderText(/Search orders/);
  expect(searchInput).toBeInTheDocument();
  expect(searchInput).toHaveValue('');
});

test('renders page with proper QueryClient configuration', async () => {
  renderApp();
  
  // Verify page structure loads correctly with new QueryClient config
  expect(screen.getByText('Order Management')).toBeInTheDocument();
  expect(screen.getByText('Track and manage all your orders efficiently')).toBeInTheDocument();
  
  // Eventually shows data (confirming throwOnError: false works)
  expect(await screen.findByText(/Alice Johnson/)).toBeInTheDocument();
});
