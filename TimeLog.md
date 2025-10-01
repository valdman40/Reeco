# Development Time Log

This document tracks the time spent on different phases of the full-stack assignment, broken down by 30-60 minute granularity.

## Day 1: Initial Setup & Bug Fixes (4.5 hours)

### 13:00 - 14:30 (1.5h): Project Setup & Analysis
- Downloaded and installed project dependencies (npm install for both backend/frontend)
- Set up development environment and VS Code extensions
- Analyzed existing codebase structure and requirements
- Read through backend and frontend READMEs
- Identified intentional bugs mentioned in documentation
- Initial project exploration and understanding

### 14:30 - 16:00 (1.5h): Backend Bug Fixes
- **BE-1 (14:30-15:00)**: Fixed off-by-one pagination bug in backend
- **BE-2 (15:00-15:50)**: Identified and fixed N+1 query problem, optimized listOrders performance
- **BE-3 (15:50-16:00)**: Fixed validation error status codes (500 → 400) with proper ZodError handling

### 16:00 - 17:30 (1.5h): Server Integration & React Query Issues
- Switched from mock service to real server integration
- Encountered React Query v5 compatibility issues with deprecated callbacks
- Fixed onSuccess/onError deprecation warnings
- Set up proper environment configuration

### 19:30 - 20:30 (1h): Frontend Bug Fixes
- **FE-1**: Fixed approval system cache invalidation issues
- **FE-2**: Eliminated flicker with stable query keys and component persistence
- **FE-3**: Synchronized sort between URL, API, and cache

## Day 2: Feature Development & UX Improvements (4 hours)

### 09:00 - 10:00 (1h): UI Foundation & Search Features
- Enhanced pagination with improved UX
- Added sort by created date functionality
- Improved search input layout and clear button positioning

### 10:00 - 12:00 (2h): Modal System & Component Architecture
- Implemented OrderDetail modal with Ant Design
- Created reusable StatusBadge component
- Improved spacing and layout consistency
- Fixed CSS flexbox and gap issues through iterative debugging

### 12:00 - 13:00 (1h): Universal Button System
- Designed and implemented universal Button component system
- Created primary/secondary button variants
- Updated components across OrderCard, OrderDetail, and OrdersTable
- Ensured consistent button styling throughout application

### 21:30 - 23:30 (2h): Multi-Select & Cancellation Feature
- Implemented multi-select checkbox functionality
- Added order cancellation backend endpoints with `isCancelled` field
- Created cancel order mutation with optimistic updates
- Added visual styling for cancelled orders (lower opacity)

## Day 3: Architecture Refactoring & Frontend Polish (4.5 hours)

### 09:30 - 12:00 (2.5h): Frontend Polish & UI Tweaking
- Improved error handling and retry functionality with React Query refetch
- Enhanced loading UI with 100ms delay to prevent flicker
- Added loading indicators to OrdersTable header
- Improved error state persistence and user experience
- Spent significant time tweaking UI elements and getting layouts right
- Iterative CSS debugging and spacing adjustments

### 12:00 - 13:00 (1h): Architecture Refactoring
- Refactored components to separate data logic from UI concerns
- Complete separation of concerns with Pagination refactoring
- Made ResultsSummary a pure component
- Created custom hooks (useOrdersTable, usePagination, useStatusFilter, useSearchInput, useOrderCard)

### 13:00 - 14:00 (1h): Additional Frontend Tweaking
- Fine-tuned component interactions and user experience
- Polished animations and visual feedback
- Tested and adjusted responsive behavior

## Day 4: Documentation & Final Polish (2 hours)

### 12:30 - 13:30 (1h): Documentation & Bug Fixes
- Fixed sorting parameters not being passed to listOrders function
- Created comprehensive refactoring documentation for frontend README
- Updated project structure documentation to match actual filesystem

### 21:00 - 22:00 (1h): Final Documentation
- Fixed and improved documentation across all README files
- Created AI_LOG.md documenting AI assistance throughout development
- Created TimeLog.md (this document)

## Total Time: ~16.5 hours

### Time Breakdown by Category:
- **Bug Fixes**: 3 hours (Backend: 1.5h, Frontend: 1.5h)
- **Feature Development**: 4 hours (Multi-select, cancellation, modal system, buttons)
- **Architecture Refactoring**: 1 hour (Custom hooks, separation of concerns)
- **UX/UI Polish & Frontend Tweaking**: 4.5 hours (Loading states, error handling, animations, layout adjustments)
- **Documentation**: 2 hours (README updates, AI log, time tracking)
- **Project Setup**: 1.5 hours (Dependencies, environment setup)
- **Learning**: 0.5 hours (React Query videos and research)

### Key Learning Areas:
- React Query videos and documentation research (30m)
- React Query v5 migration and caching strategies (1h)
- N+1 query optimization and database performance (45m)
- Component architecture and separation of concerns (2h)
- CSS debugging and layout systems (30m)
- Error handling and HTTP status codes (30m)