# Changelog

Summary of phases and features. This repo implements a local-first research app with SQLite and a Vite React UI.

---

## Phase 7: Polish & Testing (final checkpoint)

- **E2E / integration tests:** `server/workflow.test.ts` — full research workflow: create query → run research → get result → submit feedback → metrics (in-memory DB).
- **Accessibility:** Skip-to-main-content link (keyboard focusable), `aria-label` on main nav, `role="main"` and `id="main-content"` on main, `role="alert"` for errors, section headings and form labels.
- **Error handling:** Feedback form shows submit errors; API returns consistent `{ error: string }`; client displays run/load errors with alert role.
- **Performance:** Metrics page lazy-loaded (React.lazy + Suspense) to reduce initial bundle.
- **Documentation:** [docs/USER-GUIDE.md](./USER-GUIDE.md) — running the app, Research, Vault, Metrics, API overview, accessibility, troubleshooting. README updated with quick start and scripts.

---

## Phase 6: Trust & Feedback Infrastructure

- User feedback: POST /api/feedback, list by result/query; feedback form (1–5 stars + comment) on result view.
- Attribution: “Source attribution” section (section → sources); evidence transparency and synthesis by source.
- Explainability: “How we got here” — reasoning snapshot (steps, chunk/section/source counts, run time); `research_results.confidence`, `duration_ms`, `reasoning_snapshot`.
- Metrics: GET /api/metrics, /metrics dashboard (runs, confidence, run time, rating distribution).

---

## Phase 5: Workspace & Context Integration

- Vault: search (GET ?q=), document preview slide-over, annotations (list/add/delete).
- Research: saved queries filter, save/unsave, refine (parent_query_id), related queries.
- API: vault search, PATCH queries/:id/saved, GET queries/:id/related, annotation routes, run with vaultDocIds.
- Retrieval: optional vaultDocIds (workspace-aware runs); runner accepts vaultDocIds.

---

## Phase 4 and earlier

- **Phase 3:** Research agent — retrieval (vault + public), synthesis (sections, confidence), citations, runner (run research, persist result).
- **Phase 2:** UI — Landing, Research (query form, history sidebar, result display), Vault (upload, list, delete).
- **Phase 1:** Backend — SQLite schema (research_queries, vault_documents, research_results, citations, user_feedback), API (queries, results, vault), initDb and migrations.

---

## Final checkpoint (Phase 7 complete)

- **Tests:** Unit tests (db, agent, React components) + workflow integration test. Run: `npm test`.
- **Build:** `npm run build` (client). API runs with `npm run api` (Node + tsx).
- **User guide:** [docs/USER-GUIDE.md](./USER-GUIDE.md).
- **Database:** SQLite at `data/research.db` (or `DATABASE_PATH`). Migrations in `initDb` for new columns.
