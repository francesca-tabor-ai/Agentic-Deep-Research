# Manus – Reference App & Utilisation Guide

**Manus** (`/Manus`) is a full **LeapSpace Agentic Deep Research** application. This document summarises what it contains and how to use it in this repo.

---

## What Manus Provides

| Area | Contents |
|------|----------|
| **Roadmap** | `Manus/todo.md` – phased TODO (DB, UI, research agent, output display, workspace, feedback, polish) |
| **Schema** | Drizzle + MySQL: `users`, `research_queries`, `research_results`, `citations`, `vault_documents`, `user_feedback`, `research_history` |
| **Backend** | Express + tRPC, auth (Manus OAuth), research router with **executeDeepResearch** (planning + synthesis via LLM), DB helpers in `server/db.ts` |
| **Research agent** | Query planning (LLM) → synthesis (key findings, consensus, disagreements, gaps, confidence) → result + citations |
| **Client** | Vite + React, wouter, theme context, auth hook; pages: Home, Research (query + vault upload), ResearchResults (structured result + citations + feedback) |
| **UI** | Radix-based component set under `client/src/components/ui/` (cards, forms, tabs, badges, etc.) |

---

## Root Project vs Manus

| | **Repo root** (`server/`) | **Manus** (`Manus/`) |
|---|---------------------------|------------------------|
| **DB** | SQLite (sync, `node:sqlite`) | MySQL (Drizzle ORM) |
| **Schema** | research_queries, vault_documents, research_results, citations, user_feedback | Same concepts + users, research_history; richer fields (e.g. keyFindings, confidenceScore, agentReasoning) |
| **API** | None (DB only) | tRPC (research, auth, system) |
| **Auth** | None | Manus OAuth + session |
| **LLM** | None | `server/_core/llm.ts` + used in research router |

Root is minimal (DB + types + tests); Manus is the full app (DB + API + auth + LLM + UI).

---

## How to Utilise Manus

### 1. Run Manus as the full reference app

- From repo root: `cd Manus && pnpm install && pnpm dev`
- Requires: Node, pnpm, MySQL (`DATABASE_URL`), and any env used by Manus (OAuth, LLM, etc.). See `Manus/server/_core/env.ts` and `.env.example` if present.

### 2. Reuse design and behaviour

- **Schema ideas**: Use `Manus/drizzle/schema.ts` and `Manus/todo.md` to align root schema (e.g. when adding consensus, confidence, research history).
- **Agent flow**: `Manus/server/routers/research.ts` → `executeDeepResearch`: planning prompt → synthesis prompt → create result + citations. Adapt this flow for the root stack (e.g. call the same logical steps from a future API that uses root’s SQLite).
- **UI/UX**: `Manus/client/src/pages/Research.tsx` and `ResearchResults.tsx` show query form, vault upload, workflow explanation, and result layout (summary, findings, consensus/disagreements, gaps, citations, feedback). Reuse or copy patterns into your own client.

### 3. Copy specific artefacts into the root project

- **Types**: Map from `Manus/drizzle/schema.ts` and `Manus/shared/types.ts` when extending root types.
- **DB helpers**: Manus `server/db.ts` has create/get/list for queries, results, citations, vault, feedback, history. Use as reference; reimplement against root’s SQLite and naming (e.g. `query_text` vs `query`) where you keep root as source of truth.
- **Research router**: If you add a backend (e.g. tRPC or REST), the structure and prompts in `Manus/server/routers/research.ts` are a good template; swap Manus DB/LLM calls for your own.

### 4. Keep both in sync conceptually

- Use `Manus/todo.md` for feature parity and phases (e.g. “vault management”, “feedback”, “research history”).
- When adding tables or columns in root, check Manus schema for fields you might want (e.g. confidence score, agent reasoning JSON, citation relevance).

---

## Key Files to Open

| Purpose | Path |
|--------|------|
| Roadmap & phases | `Manus/todo.md` |
| DB schema (Drizzle) | `Manus/drizzle/schema.ts` |
| Research API & agent logic | `Manus/server/routers/research.ts` |
| DB CRUD | `Manus/server/db.ts` |
| LLM integration | `Manus/server/_core/llm.ts` |
| Research UI | `Manus/client/src/pages/Research.tsx` |
| Results UI | `Manus/client/src/pages/ResearchResults.tsx` |
| App router & routes | `Manus/client/src/App.tsx`, `Manus/server/routers.ts` |

---

## Summary

- **Manus** = full LeapSpace Agentic Deep Research app (MySQL, tRPC, auth, LLM, React UI). Use it as the reference implementation and for design/UX/schema/agent flow.
- **Root** = minimal Agentic-Deep-Research (SQLite, types, tests). Use Manus to inform schema evolution, agent behaviour, and UI when extending the root project.
