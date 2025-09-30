# Backend (Node.js) — Orders API

## Overview
This is a Node.js Express backend for managing orders, built with TypeScript, SQLite, and Zod validation. The API provides endpoints for listing, retrieving, and updating orders with built-in search, filtering, and pagination capabilities.

**⚠️ IMPORTANT: This backend contains intentional bugs for testing purposes.**

## Quick Start
```bash
npm install
npm run seed    # Initialize database with test data
npm run dev     # Starts on http://localhost:3001
```

## API Endpoints

### GET `/orders`
Lists orders with support for pagination, search, and filtering.

**Query Parameters:**
- `page` (number): Page number (starts from 1)
- `limit` (number): Items per page (default: 10)
- `q` (string): Search by customer name or order ID
- `status` (string): Filter by status (`pending`, `approved`, `rejected`)

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customer": "John Doe", 
      "status": "pending",
      "total": 99.99,
      "createdAt": "2023-01-15T10:30:00.000Z",
      "isApproved": false,
      "lineItemCount": 3
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 50
}
```

### GET `/orders/:id`
Retrieves a single order by ID.

**Path Parameters:**
- `id` (string): Order ID (UUID format)

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "customer": "John Doe",
  "status": "pending", 
  "total": 99.99,
  "createdAt": "2023-01-15T10:30:00.000Z",
  "isApproved": false,
  "lineItemCount": 3
}
```

### PATCH `/orders/:id`
Updates order approval status.

**Path Parameters:**
- `id` (string): Order ID (UUID format)

**Request Body:**
```json
{
  "isApproved": true
}
```

**Response:** Returns updated order object

## Data Schema

### Order Type
```typescript
export interface Order {
  id: string;
  customer: string;
  status: 'pending' | 'approved' | 'rejected';
  total: number;        // Decimal value (converted from cents)
  createdAt: string;    // ISO timestamp
  isApproved: boolean;
  lineItemCount?: number; // Calculated field
}

export interface OrdersResponse {
  items: Order[];
  page: number;
  limit: number; 
  total: number;
}
```

### Database Tables
- `orders`: Main order data
  - `id` (TEXT): Primary key (UUID)
  - `customer` (TEXT): Customer name
  - `status` (TEXT): Order status with CHECK constraint
  - `total_cents` (INTEGER): Price in cents
  - `created_at` (TEXT): ISO timestamp
  - `is_approved` (INTEGER): Boolean as 0/1

- `order_items`: Line items for orders (enables N+1 query scenarios)
  - `id` (TEXT): Primary key
  - `order_id` (TEXT): Foreign key to orders
  - `sku` (TEXT): Product SKU
  - `qty` (INTEGER): Quantity

## Project Structure
```
backend/
├── src/
│   ├── db.ts              # SQLite database connection
│   ├── server.ts          # Express app and routes
│   ├── orders.repo.ts     # Database queries and repository
│   ├── validation.ts      # Zod validation schemas
│   ├── errors.ts          # Custom error classes
│   └── seed.ts            # Database seeding script
├── test/
│   ├── orders.list.spec.ts    # Tests for list endpoint
│   └── orders.patch.spec.ts   # Tests for patch endpoint
├── data/
│   ├── schema.sql         # Database schema
│   └── app.db            # SQLite database file
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Key Technologies
- **Node.js + Express**: Web framework
- **TypeScript**: Type safety
- **SQLite**: File-based database
- **Zod**: Runtime type validation
- **Vitest**: Testing framework
- **ts-node**: TypeScript execution

## Scripts
- `npm run dev`: Start development server with auto-reload
- `npm run seed`: Initialize database with test data
- `npm test`: Run test suite

**Note**: The backend uses `tsx` for direct TypeScript execution in development. For production deployment, you may want to add build and start scripts.

## Intentional Bugs (For Assignment)
This backend contains three intentional bugs that need to be identified and fixed:

### Bug Issues & Impact

**Bug 1 - Pagination Problem:**
This bug causes incorrect data to be returned when paginating through orders. Users will experience skipped records or duplicate records when navigating between pages, making the pagination unreliable.

**Bug 2 - Performance Issue:**
This bug creates a database performance bottleneck that becomes worse as the number of orders increases. Each order triggers additional database queries, leading to slow response times and potential database connection exhaustion under load.

**Bug 3 - HTTP Status Code Issue:**  
This bug returns incorrect HTTP status codes for client errors, making it difficult for frontend applications to properly handle validation failures and provide appropriate user feedback.

### Testing Scenarios

**Testing Bug 1 (Pagination):**
```bash
# Test pagination with multiple pages
curl "http://localhost:3001/orders?page=1&limit=5"
curl "http://localhost:3001/orders?page=2&limit=5"
curl "http://localhost:3001/orders?page=3&limit=5"

# Expected: Sequential records without gaps or duplicates
# Actual: Records will be skipped or duplicated between pages
```

**Testing Bug 2 (Performance):**
```bash
# Monitor database queries while fetching orders
curl "http://localhost:3001/orders?limit=20"

# Expected: Minimal database queries (1-2 queries total)
# Actual: One query per order plus the main query (21+ queries)
# Use browser dev tools Network tab to measure response time
```

**Testing Bug 3 (HTTP Status):**
```bash
# Send invalid data to trigger validation error
curl -X PATCH "http://localhost:3001/orders/invalid-uuid" \
  -H "Content-Type: application/json" \
  -d '{"isApproved": "not-a-boolean"}'

# Expected: 400 Bad Request
# Actual: 500 Internal Server Error
```

## Testing
Run the test suite:
```bash
npm test
```

Tests cover:
- Orders listing with pagination and filtering
- Order approval/unapproval functionality
- Error handling scenarios

## Development Notes
- Database uses SQLite WAL mode for better concurrency
- All monetary values stored as cents, converted to decimals in API responses
- Validation errors should return 400 status codes with descriptive messages
- Database is automatically created from `data/schema.sql` on first connection
- Database seeding creates sample data via `npm run seed`
- CORS is enabled for frontend development
- The database file (`data/app.db`) is created automatically and should not be committed to version control

## Prerequisites
- Node.js 18+ 
- npm or yarn package manager

## Environment Setup
The server runs on port 3001 by default. Make sure your frontend's `VITE_API_URL` points to `http://localhost:3001`.

**Development Setup:**
1. Install dependencies: `npm install`
2. Initialize database: `npm run seed`
3. Start development server: `npm run dev`

The database will be automatically created in the `data/` directory when you first run the seed command.