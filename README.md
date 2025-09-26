# Full-Stack Orders Management Assignment

This repository contains a complete full-stack application for managing orders, with **intentional bugs** included for testing purposes. Choose one backend and work with the provided frontend to build a comprehensive orders management system.

## Repository Structure

### Backends (Choose One)
- **`backend-node/`** — Node.js + Express + TypeScript + SQLite + Zod

### Frontend
- **`frontend-starter/`** — React + TypeScript + React Query + React Router + Vitest

### Documentation
- **`fullstack-assignment-readme.md`** — Complete assignment instructions
- Each folder has its own detailed README with setup instructions and schemas

## Quick Start

### 1. Choose and Start a Backend

**Option A: Node.js Backend**
```bash
cd backend-node
npm install
npm run seed
npm run dev  # http://localhost:3001
```

### 2. Start the Frontend
```bash
cd frontend-starter
npm install
npm run dev  # http://localhost:5173
```

### 3. Configure Environment
Create `.env` in frontend-starter/:
```
VITE_API_URL=http://localhost:3001
```

## API Endpoints (Both Backends)
- `GET /orders?page=&limit=&q=&status=` — List orders with pagination
- `GET /orders/:id` — Get single order details  
- `PATCH /orders/:id` — Update order approval status

## Intentional Bugs Included

### Backend Bugs (Both Stacks)
1. **BE-1**: Off-by-one pagination error
2. **BE-2**: N+1 query problem for item counts
3. **BE-3**: Validation errors return 500 instead of 400

### Frontend Bugs
1. **FE-1**: Stale list after approve action
2. **FE-2**: Flicker due to unstable query keys
3. **FE-3**: Sort not fully synchronized

## Testing
Each component includes comprehensive test suites:
- **Backend**: API endpoint and integration tests
- **Frontend**: Component tests with MSW for API mocking

Run tests:
```bash
# Backend (Node.js)
cd backend-node && npm test

# Frontend  
cd frontend-starter && npm test
```

## Assignment Goals
1. **Bug Fixes**: Identify and fix all intentional bugs
2. **Feature Development**: Complete the orders management flow
3. **Refactoring**: Improve code structure and maintainability  
4. **Testing**: Add meaningful tests for new functionality

## Documentation
- Each folder contains a detailed README explaining:
  - Setup and run instructions
  - Project structure and architecture
  - API schemas and data types
  - Bug locations and descriptions
  - Testing strategies

See `fullstack-assignment-readme.md` for complete assignment details and requirements.
