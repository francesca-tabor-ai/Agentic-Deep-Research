# Agentic Deep Research

Minimal research backend (SQLite, types, tests) with a full reference app in **Manus**.

## Quick start

- **Root (this package):** `npm run db:init` to create the SQLite DB; `npm test` to run tests.
- **Full app (Manus):** See [MANUS.md](./MANUS.md) for what Manus contains and how to run or reuse it (`cd Manus && pnpm install && pnpm dev`).

## Layout

| Path | Description |
|------|-------------|
| `server/` | SQLite schema and DB helpers (research queries, vault, results, citations, feedback). |
| `Manus/` | Full LeapSpace Agentic Deep Research app: MySQL + Drizzle, tRPC, auth, LLM research agent, Vite + React UI. |
| [MANUS.md](./MANUS.md) | **Utilisation guide** – what’s in Manus and how to use or copy from it. |

Read **MANUS.md** to utilise Manus (schema, research agent flow, UI patterns) in this repo.
