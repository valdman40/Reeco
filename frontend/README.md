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
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── OrderCard.tsx     # Individual order card
│   │   ├── OrderDetail.tsx   # Order details modal
│   │   ├── OrdersTable.tsx   # Main orders list table
│   │   ├── Pagination.tsx    # Pagination controls
│   │   ├── ResultsSummary.tsx # Search results summary
│   │   ├── SearchInput.tsx   # Search input field
│   │   ├── StatusFilter.tsx  # Status filter dropdown
│   │   ├── common/          # Shared UI elements
│   │   │   ├── ErrorDisplay.tsx    # Error messages
│   │   │   ├── LoadingMessage.tsx  # Loading states
│   │   │   ├── StatusBadge.tsx     # Status badges
│   │   │   └── buttons/            # Button elements
│   │   │       ├── Button.tsx      # Generic button
│   │   │       └── NextPrevButton.tsx # Navigation buttons
│   │   └── icons/           # Icon elements
│   │       └── ErrorIcon.tsx # Error icon
│   ├── hooks/               # Custom React hooks
│   │   ├── useApproveOrder.ts # Order approval mutation
│   │   ├── useDebounce.ts    # Debounce hook for search
│   │   ├── useOrder.ts       # Single order fetching
│   │   ├── useOrders.ts      # Orders list fetching
│   │   └── useOrdersSearch.ts # Orders search functionality
│   ├── lib/                 # Shared utilities and configuration
│   │   ├── api.ts           # API client utilities
│   │   ├── queryClient.ts   # React Query client setup
│   │   └── queryKeys.ts     # Query key factories
│   ├── mocks/               # MSW mock setup
│   │   └── browser.ts       # Browser MSW setup
│   ├── pages/               # Page components
│   │   └── OrdersPage.tsx   # Main orders page
│   ├── types/               # TypeScript type definitions
│   │   └── order.ts         # Order-related types
│   ├── utils/               # Helper functions
│   │   ├── clientSort.ts    # Client-side sorting logic
│   │   └── statusConfig.ts  # Status configuration
│   ├── App.tsx              # Root app component
│   ├── main.tsx            # Application entry point
│   ├── app.css             # Global styles
│   └── vite-env.d.ts       # Vite type definitions
├── tests/                  # Test files
│   ├── handlers.ts         # MSW API mock handlers
│   ├── orders-page.spec.tsx # Page integration tests
│   └── setup.ts            # Test environment setup
├── public/                 # Static assets
│   └── mockServiceWorker.js # MSW service worker
├── .env.example            # Environment variables template
├── .prettierrc             # Prettier configuration
├── index.html              # HTML entry point
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # Node-specific TypeScript config
└── vite.config.ts         # Vite configuration
```

## Data Types

### Order Interface

```typescript
export type Order = {
  id: string;
  customer: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  total: number;
  createdAt: string;
  isApproved: boolean;
  isCancelled: boolean;
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
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Ant Design**: UI component library
- **Lucide React**: Icon library
- **Framer Motion**: Animation library

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
- `useDebounce`: Debounces input values for search functionality
- `useOrdersSearch`: Combines search functionality with orders fetching

### Separation of Concerns

- **Components**: Pure presentation logic
- **Hooks**: Data fetching and state management
- **Utils**: Business logic and transformations
- **Types**: Shared type definitions

## Testing Strategy

- **Integration Tests**: Test complete user flows using MSW
- **Component Tests**: Test individual components in isolation
- **Mock API**: Realistic API responses using MSW handlers

## Bug Analysis & Solutions (Assignment Completed)

This frontend originally contained intentional bugs that have been successfully identified, analyzed, and fixed during development:

### ✅ **FE-1: Stale list after approve** - RESOLVED
   **Problem Identified**: After approving or unapproving an order, the orders list didn't reflect changes immediately due to missing cache invalidation in the mutation logic.

   **Root Cause**: The `useApproveOrder` hook wasn't invalidating React Query cache after successful mutations, causing stale data to persist in the orders list.

   **Solution Applied** (Commit `87a3646`):
   ```typescript
   // Added proper cache invalidation in useApproveOrder.ts
   onSettled: (_data, _error, variables) => {
     queryClient.invalidateQueries({ queryKey: ['orders'] });
     queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
   },
   ```

   **Result**: Orders list now updates immediately after approve/unapprove actions without requiring page refresh.

### ✅ **FE-2: Flicker due to unstable keys** - RESOLVED  
   **Problem Identified**: Visual flickering occurred during data refetches due to unstable React Query keys that included undefined values, causing unnecessary component re-renders.

   **Root Cause**: Query keys included undefined values (`q`, `status`, `sort`) which created different key signatures on each render, breaking React Query's caching mechanism.

   **Solution Applied** (Commit `ad67c7f`):
   ```typescript
   // Fixed query key stability in queryKeys.ts
   orders: (p) => [
     'orders',
     {
       page: p.page,
       limit: p.limit,
       // Only include defined values to ensure stable keys
       ...(p.q && { q: p.q }),
       ...(p.status && { status: p.status }),
       ...(p.sort && { sort: p.sort }),
     },
   ]
   ```

   **Result**: Eliminated flickering by ensuring consistent query keys, allowing React Query to properly cache and reuse data.

### ✅ **Bonus FE-3: Sort synchronization** - RESOLVED
   **Problem Discovered**: Sort state wasn't properly synchronized between URL parameters, API requests, and React Query cache.

   **Solution Applied** (Commit `6e3702f`): Enhanced query key factory and added proper sort parameter parsing to maintain consistency across the application state.

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

The `.env` file should contain:
```
VITE_API_URL=http://localhost:3001
```

## Development Workflow

1. Start your chosen backend (Node.js) on port 3001
2. Install frontend dependencies: `npm install`
3. Copy and configure environment: `cp .env.example .env`
4. Start development server: `npm run dev`
5. Open `http://localhost:5173` in your browser
6. Run tests: `npm test`

**Prerequisites:**
- Node.js 18+ 
- npm or yarn package manager
- Backend server running on http://localhost:3001

## API Integration

The frontend expects these backend endpoints:

- `GET /orders?page=&limit=&q=&status=&sort=` - List orders with pagination and sorting
  - `sort`: Format is `field:direction` (e.g., `total:desc`, `createdAt:asc`)
- `GET /orders/:id` - Get single order details
- `PATCH /orders/:id` - Update order approval status

## Refactor

This project underwent comprehensive architecture refactoring to implement proper separation of concerns and follow React best practices. The refactoring focused on extracting business logic from UI components into custom hooks.

### Major Refactoring Areas

#### 1. Component-to-Hook Logic Extraction
**Problem**: Components were tightly coupled with business logic, URL management, and data fetching, making them difficult to test and reuse.

**Solution**: Created dedicated custom hooks to handle specific concerns:

- **`useOrdersTable`**: Extracted table sorting, multi-select logic, and order actions
- **`useStatusFilter`**: Extracted status filtering and URL state management  
- **`useSearchInput`**: Extracted search debouncing and URL synchronization
- **`useOrderCard`**: Extracted navigation and approval logic for individual orders
- **`usePagination`**: Extracted pagination logic and URL navigation

#### 2. Pure UI Components
**Transformation**: All interactive components were refactored into pure presentational components:

- **OrdersTable**: Now receives sorted data and handlers as props
- **StatusFilter**: Pure dropdown component with onChange handlers
- **SearchInput**: Pure input field with debounced onChange
- **OrderCard**: Pure display component with click handlers
- **Pagination**: Pure navigation component with page handlers
- **ResultsSummary**: Pure display component receiving search/filter data as props

#### 3. Clear Data Flow Architecture
**Before**: Components directly accessed URL parameters and managed their own state
```
Component → useSearchParams → Business Logic → State Management
```

**After**: Clean unidirectional data flow
```
OrdersPage → Custom Hooks → Pure Components → User Interaction → Hooks → URL/State
```

#### 4. Benefits Achieved

- **Testability**: Business logic can be tested independently of UI components
- **Reusability**: Pure components can be reused with different data sources
- **Maintainability**: Clear separation makes code easier to understand and modify
- **Performance**: Reduced re-renders through better component isolation
- **Type Safety**: Better TypeScript support with explicit prop interfaces

#### 5. Consistent Architecture Pattern
All interactive components now follow the same pattern:
1. Custom hook handles business logic and state management
2. Component receives data and handlers as props
3. Component focuses solely on rendering and user interaction
4. URL state and side effects are managed in hooks

This refactoring transformed the codebase from mixed concerns to clean architecture, making it production-ready and maintainable.

## Performance Considerations

- React Query handles caching and background updates automatically
- Client-side sorting for better UX when data is already loaded
- URL state persistence allows for bookmarking and sharing
- Optimistic updates provide immediate feedback for user actions
