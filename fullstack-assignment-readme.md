# Full-Stack Engineer Assignment

Welcome 👋 and thanks for taking the time. This exercise is designed to show us your coding style, problem-solving, and how you work with our stack. Please **timebox your work to ~5–6 hours** and note what you would do with more time.

---

## Tech Provided

This repo contains:

- **Backends**:

  - `backend-node` → NodeJS (Express + SQLite + zod)

- **Frontend**:
  - `frontend-starter` → React + TypeScript + React Query + React Router + Vitest + MSW

Both backends expose the same API shape at the same base URL (default `http://localhost:3001`).  
The frontend expects `VITE_API_URL` to point there (`.env.example` provided).

---

## Your Tasks

### 1. Bug Fixes

There are several **intentional bugs** in both FE and BE.  
They relate to:

- **Backend:** pagination, item counts, validation responses
- **Frontend:** data fetching, cache behavior, URL state

👉 Explore these areas, debug, and fix what you find. Document your thought process.

---

### 2. Feature Work (end-to-end)

Build a complete **Orders cancel flow** across backend + frontend:

- **Orders list page**

  - Paginated list of orders (`page`, `limit`)
  - Search (`q`) by customer or id
  - Filter by `status` (`pending|approved|rejected|cancelled`)
  - Client-side sort on `createdAt` and `total` (`asc`/`desc`)
  - URL reflects state (`?page=&q=&status=&sort=`)

- **Cancel action from list**

  - Select one or more orders directly in the list
  - Cancel them using a new `PATCH /orders/:id { isCancelled }` endpoint you'll need to create
  - UI should stay consistent with backend state
  - Support optimistic update with rollback on error
  - Cancelled orders should show `cancelled` status in the UI

- **Backend requirements**

  - Add `isCancelled` field to Order model/schema
  - Create endpoint to handle order cancellation
  - Update status logic to handle cancelled state
  - Ensure cancelled orders appear in filtered results

- **States**
  - Handle loading, empty, and error states clearly

---

### 3. Refactor

Pick at least one area in the codebase (your choice) and refactor for clarity and maintainability.  
Examples:

- FE: data fetching mixed with components → separate concerns
- BE: validation, DB access, and routing all tangled → modularize

---

### 4. Testing

Add **1–2 meaningful tests** each on FE and BE:

- FE: use Testing Library + MSW (e.g., query flow or optimistic mutation)
- BE: unit or integration tests around orders listing or patching

---

## Deliverables

- A working repo you can run locally:
  - `backend-node` or `backend-dotnet` (your choice)
  - `frontend-starter`
- **README.md** in your repo:
  - How to run (both apps)
  - What you fixed/added
  - Any assumptions
- **AI_LOG.md** :
  - If you used AI tools (ChatGPT, Copilot, etc.), paste prompts + how you applied results
- **TimeLog.md**:
  - Rough breakdown of time spent (30–60 min granularity)

Optional: screenshots or a short Loom of your app running.

---

## Timebox Reminder

Please **limit yourself to 5–6 hours total**.  
If you don’t finish everything, that’s fine—just document what you would do next.
