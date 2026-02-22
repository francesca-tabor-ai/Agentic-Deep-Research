# Agentic Deep Research

**Turn questions into synthesis—with every claim traceable to a source.**

Agentic Deep Research is a local-first research assistant that helps you go from a broad question to a structured, citation-backed answer. You ask in plain language; the system retrieves from your own documents and public sources, synthesizes findings, and returns a report where every section is tied to specific evidence. No black box: you see confidence scores, source attribution, and a clear reasoning path for every run.

**Built for** analysts, researchers, and product teams who need to move fast without sacrificing rigor—and who want to keep sensitive context in their own vault instead of the cloud. Run it locally with SQLite and a single `npm run dev:all`; your data stays on your machine.

**What you get:** natural-language research queries, a personal document vault that feeds into answers, saved and refined query history, user feedback and evaluation metrics, and a UI designed for clarity and trust (humanist typography, cool palette, gradient accents used sparingly). The stack is minimal on purpose: one backend, one front end, no external LLM required for the core flow—so you can integrate your own models or extend the agent when you’re ready.

---

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
