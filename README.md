# Agentic Deep Research

Citation-grounded research app: natural language queries, vault documents, synthesis with sources, feedback, and metrics. SQLite backend + Vite React UI.

## Quick start

1. **Database:** `npm run db:init` (creates `data/research.db`).
2. **Run app:** `npm run dev:all` — API on http://localhost:3000, UI on http://localhost:5173.
3. **Tests:** `npm test`.

See **[docs/USER-GUIDE.md](./docs/USER-GUIDE.md)** for using Research, Vault, and Metrics.

## Layout

| Path | Description |
|------|-------------|
| `server/` | API, SQLite schema (queries, vault, results, citations, feedback, metrics), research agent (retrieval, synthesis, runner). |
| `client/` | Vite + React UI: Research, Vault, Metrics, landing. |
| `docs/` | [User guide](./docs/USER-GUIDE.md), [Changelog](./docs/CHANGELOG.md), [Roadmap](./docs/ROADMAP.md) (future phases). |
| `Manus/` | Full reference app (MySQL, Drizzle, tRPC, auth). See [MANUS.md](./MANUS.md). |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (UI only). |
| `npm run api` | Start API server. |
| `npm run dev:all` | API + UI concurrently. |
| `npm run build` | Production build (client). |
| `npm test` | Vitest (unit + integration). |
| `npm run db:init` | Initialize SQLite database. |
