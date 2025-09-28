# Frontend — Orders Management App

## Overview

This is a React + TypeScript frontend for managing orders, built with modern tools including React Query for data fetching, React Router for navigation, and Vitest for testing. The app provides a comprehensive interface for viewing, searching, filtering, and managing orders.

**⚠️ IMPORTANT: This frontend contains intentional bugs for testing purposes.**

## Quick Start

```bash
npm install
npm run dev     # Starts on http://localhost:5173
```

Make sure you have a backend running on `http://localhost:3001` (Node.js).

## Features

- **Orders List**: Paginated view of all orders
- **Search**: Find orders by customer name or order ID
- **Filtering**: Filter by order status (pending/approved/rejected)
- **Sorting**: Client-side sort by creation date or total amount
- **Order Details**: Modal view for individual order information
- **Approval Actions**: Approve/unapprove orders directly from the list
- **URL State Management**: All filters, search, and pagination reflected in URL

## Project Structure

```
frontend-starter/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── OrderDetail.tsx   # Order details modal
│   │   ├── OrdersTable.tsx   # Main orders list table
│   │   ├── Pagination.tsx    # Pagination controls
│   │   ├── SearchInput.tsx   # Search input component
│   │   └── StatusFilter.tsx  # Status filter dropdown
│   ├── hooks/               # Custom React hooks
│   │   ├── useApproveOrder.ts # Order approval mutation
│   │   ├── useOrder.ts       # Single order fetching
│   │   └── useOrders.ts      # Orders list fetching
│   ├── lib/                 # Shared utilities and configuration
│   │   ├── api.ts           # API client utilities
│   │   ├── queryClient.ts   # React Query client setup
│   │   └── queryKeys.ts     # Query key factories
│   ├── pages/               # Page components
│   │   └── OrdersPage.tsx   # Main orders page
│   ├── types/               # TypeScript type definitions
│   │   └── order.ts         # Order-related types
│   ├── utils/               # Helper functions
│   │   └── clientSort.ts    # Client-side sorting logic
│   ├── App.tsx              # Root app component
│   ├── main.tsx            # Application entry point
│   └── app.css             # Global styles
├── tests/                  # Test files
│   ├── handlers.ts         # MSW API mock handlers
│   ├── orders-page.spec.tsx # Page integration tests
│   └── setup.ts            # Test environment setup
├── index.html              # HTML entry point
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

## Data Types

### Order Interface

```typescript
export type Order = {
  id: string;
  customer: string;
  status: "pending" | "approved" | "rejected";
  total: number;
  createdAt: string;
  isApproved: boolean;
  lineItemCount?: number;
};

export type OrdersResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
};
```

## Key Technologies

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety across the application
- **React Query (@tanstack/react-query)**: Server state management and caching
- **React Router**: Client-side routing and navigation
- **Vite**: Fast development server and build tool
- **Vitest**: Unit and integration testing
- **MSW (Mock Service Worker)**: API mocking for tests
- **Testing Library**: Component testing utilities

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm test`: Run test suite
- `npm run test:watch`: Run tests in watch mode

## State Management Architecture

### React Query Integration

The app uses React Query for all server state management:

- **Queries**: Automatic caching, background refetching, and error handling
- **Mutations**: Optimistic updates for order approval actions
- **Query Keys**: Organized using factory functions for consistent cache invalidation

### URL State Synchronization

All application state is synchronized with the URL:

- `page`: Current page number
- `q`: Search query
- `status`: Status filter
- `sort`: Sort field and direction
- `id`: Selected order ID for detail view

## Component Architecture

### Custom Hooks Pattern

- `useOrders`: Handles orders list fetching with parameters
- `useOrder`: Fetches individual order details
- `useApproveOrder`: Manages order approval mutations

### Separation of Concerns

- **Components**: Pure presentation logic
- **Hooks**: Data fetching and state management
- **Utils**: Business logic and transformations
- **Types**: Shared type definitions

## Testing Strategy

- **Integration Tests**: Test complete user flows using MSW
- **Component Tests**: Test individual components in isolation
- **Mock API**: Realistic API responses using MSW handlers

## Intentional Bugs (For Assignment)

This frontend contains two intentional bugs that need to be identified and fixed:

1. **FE-1: Stale list after approve**
   **What to look for**: After approving or unapproving an order, the orders list doesn't reflect the change immediately. You might see the old approval status until you manually refresh the page or navigate away and back.

   **Scenario**: 
   - Load the orders page
   - Click approve/unapprove on any order
   - Notice the list still shows the old status even though the action succeeded
   - Only after a page refresh does the updated status appear

   **Area to investigate**: The approval mutation logic and how it handles cache updates.

2. **FE-2: Flicker due to unstable keys**
   **What to look for**: Visual flickering or jumpy behavior when the orders list refetches data. Components might seem to "flash" or redraw unnecessarily.

   **Scenario**:
   - Load the orders page  
   - Perform actions that trigger refetch (searching, filtering, pagination)
   - Watch for visual flickering or unstable rendering during data updates
   - The UI might appear to "jump" or redraw components that shouldn't change

   **Area to investigate**: How list items are keyed and rendered during data updates.

## Environment Setup

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:3001
```

## Development Workflow

1. Start your chosen backend (Node.js or .NET)
2. Install frontend dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:5173` in your browser
5. Run tests: `npm test`

## API Integration

The frontend expects these backend endpoints:

- `GET /orders?page=&limit=&q=&status=` - List orders with pagination
- `GET /orders/:id` - Get single order details
- `PATCH /orders/:id` - Update order approval status

## Performance Considerations

- React Query handles caching and background updates automatically
- Client-side sorting for better UX when data is already loaded
- URL state persistence allows for bookmarking and sharing
- Optimistic updates provide immediate feedback for user actions
