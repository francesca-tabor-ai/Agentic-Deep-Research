# Replit Reference Implementation

The **`Replit/`** folder contains a full-stack reference implementation of the Agentic Deep Research product. Use it as the source for UI patterns, API contracts, and agent workflow behaviour.

## What’s in Replit

| Area | Location | Description |
|------|----------|-------------|
| **Product spec** | `Replit/attached_assets/LeapSpace_Agentic_Deep_Research_*.txt` | Full PRD + 3-year roadmap (also summarized in `docs/PRD-LeapSpace-Agentic-Deep-Research.md`) |
| **Client** | `Replit/client/` | React + Vite, wouter, TanStack Query, Tailwind, shadcn-style UI |
| **Server** | `Replit/server/` | Express, Drizzle + PostgreSQL, API routes, background task worker |
| **Shared** | `Replit/shared/` | API route definitions, Zod schemas, Drizzle schema |
| **Integrations** | `Replit/server/replit_integrations/` | Audio, chat, image, batch (Replit-specific) |

## Running the Replit app

From the repo root:

```bash
cd Replit
npm install
# Set DATABASE_URL for PostgreSQL (or use Replit's default)
npm run dev
```

Serves API + Vite dev server on `PORT` (default 5000).

## Key files to reuse or align with

### API and data
- **`shared/routes.ts`** – API path and method definitions; Zod request/response schemas for tasks and documents.
- **`shared/schema.ts`** – Drizzle schema: `users`, `documents`, `researchTasks`, `taskCitations`. Defines task status flow: `pending` → `planning` → `searching` → `synthesizing` → `completed` / `failed`.
- **`server/routes.ts`** – Task CRUD, document list, background worker that runs planning/search/synthesis (with optional OpenAI), citation creation.

### Client
- **`client/src/App.tsx`** – Routes: `/`, `/task/:id`, `/vault`, `/library`, `/settings`.
- **`client/src/pages/Home.tsx`** – Deep Research entry: search input, create task, recent tasks grid.
- **`client/src/pages/TaskDetail.tsx`** – Single task view, progress, result, citations.
- **`client/src/pages/Vault.tsx`** – Vault/document list.
- **`client/src/hooks/use-tasks.ts`** – `useTasks`, `useTask(id)` (with polling while not terminal), `useCreateTask()`; uses `@shared/routes` for types and URLs.
- **`client/requirements.md`** – Notes: framer-motion, date-fns, clsx, tailwind-merge; polling for task updates; Vault aesthetic; accordion citations.

### Server behaviour
- **Background worker** (`processTaskBackground` in `server/routes.ts`): updates status through planning → searching → synthesizing; uses vault documents + OpenAI to produce a short markdown report; stores result and at least one citation.
- **Seeding** – Creates mock user `researcher_alpha`, sample documents (e.g. “Attention Is All You Need”, AlphaFold), and sample tasks with citations.

## Relationship to the root project

- **Root `server/db.ts`** uses SQLite and a different schema: `research_queries`, `vault_documents`, `research_results`, `citations`, `user_feedback`. Status values are `pending` | `in_progress` | `completed` | `failed`. This is a lighter, local-first stack.
- **Replit** uses PostgreSQL + Drizzle and a task-centric model with richer status flow and document/task/citation tables. Use Replit’s `shared/schema.ts` and `shared/routes.ts` as the reference for API and domain model when extending the product.

When adding features (e.g. new task states, citation shape, or RAG), check Replit’s shared types and server behaviour first so the main repo and Replit stay aligned where intended.
