import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import OrdersPage from '../src/pages/OrdersPage';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderApp() {
  const qc = new QueryClient();
  const router = createMemoryRouter([{ path: '/', element: <OrdersPage /> }], {
    initialEntries: ['/'],
  });
  render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

test('loads and shows rows', async () => {
  renderApp();
  expect(await screen.findByText(/User 1/)).toBeInTheDocument();
});
