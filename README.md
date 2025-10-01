# Full-Stack Orders Management Assignment
### Backends
- **`backend/`** — Node.js + Express + TypeScript + SQLite + Zod

### Frontend
- **`frontend/`** — React + TypeScript + React Query + React Router + Vitest

### Documentation
- **`backend/README.md`** — Backend setup, architecture, API schemas, and bug descriptions
- **`frontend/README.md`** — Frontend setup, component architecture, refactoring details, and bug fixes  
- **`TimeLog.md`** — Detailed time breakdown of development phases (16.5 hours total)
- **`AI_LOG.md`** — Documentation of AI assistance throughout development process
- **`fullstack-assignment-readme.md`** — Original assignment instructions and requirements

## Quick Start

### 1. Start a Backend
```bash
cd backend
npm install
npm run seed
npm run dev  # http://localhost:3001
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### 3. Configure Environment
Copy and configure `.env` in frontend/ (use `.env.example` as template):
```
VITE_API_URL=http://localhost:3001
```

## Development Notes & Reflections

### What Went Well:
- Systematic approach to bug identification and fixing
- Clean architecture refactoring with proper separation of concerns
- Comprehensive testing and documentation throughout development
- Good balance between feature development and code quality

### Challenges Faced:
- React Query v5 compatibility issues required careful migration
- CSS flexbox and gap properties needed iterative debugging
- N+1 query problem required understanding database optimization
- Balancing feature completeness with time constraints

### If I Had More Time:
- Complete comprehensive testing suite (both frontend and backend), especially for order cancellation flow
- Refactor backend to modularize validation, DB access, and routing concerns
- Implement more advanced filtering options (date ranges, amount ranges)
- Add animations and transitions for better user experience
- Optimize bundle size and implement code splitting
- Add accessibility features and ARIA labels
- Implement real-time updates with WebSocket connection
