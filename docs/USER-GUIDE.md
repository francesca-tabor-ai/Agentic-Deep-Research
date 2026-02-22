# User Guide — Agentic Deep Research

This guide describes how to run and use the research app (root package: SQLite backend + Vite React UI).

## Running the app

1. **Initialize the database** (first time only):
   ```bash
   npm run db:init
   ```
   This creates `data/research.db` (or the path in `DATABASE_PATH` / `DB_PATH`).

2. **Start the API server and the UI**:
   ```bash
   npm run dev:all
   ```
   - API: http://localhost:3000  
   - UI: http://localhost:5173  

   Or run separately: `npm run api` in one terminal and `npm run dev` in another.

3. **Open the UI** at http://localhost:5173 (Vite will open it if configured).

## Research workflow

1. **Go to Research** (nav or “Start researching”).
2. **Enter your question** in natural language (e.g. “What is the current consensus on microplastics in marine food chains?”).
3. **Submit** to create a query. It appears in the **Query history** sidebar with status “Pending”.
4. **Select the query** in the sidebar, then click **Run research**. The agent retrieves from the Vault and public sources, synthesizes a report, and saves citations.
5. **View the result**: summary, confidence, synthesis by source, evidence list, and **Source attribution** (which sources support which sections).
6. **Explainability**: open **How we got here** to see retrieval/synthesis steps and run time.
7. **Rate the research**: use the feedback form (1–5 stars and optional comment). Your rating is used in the **Metrics** dashboard.

You can **Save** queries (bookmark), **Refine** (create a follow-up from the same text), and filter history by **Saved** or **All**. **Related** shows refinements of the current query.

## Vault (workspace documents)

1. **Go to Vault** from the nav.
2. **Add a document**: title (required), optional content and source URL. Documents are indexed and searchable.
3. **Search** the vault with the search box; results filter as you type.
4. **Preview** a document by clicking its title or the search icon: view full content and **Annotations**.
5. **Annotations**: in the preview, add notes and delete them. They are stored per document for your reference.

Documents in the Vault are used automatically in research runs (unless you restrict to specific docs via the API). Adding relevant papers or notes improves context.

## Metrics dashboard

1. **Go to Metrics** from the nav.
2. View **Total runs**, **Completed**, **Failed**, and **Feedback count**.
3. **Average confidence** and **Average run time** (from stored results).
4. **User rating distribution**: bar chart of 1–5 star ratings from feedback.

Use this to monitor research quality and user satisfaction.

## API overview

- **Health:** `GET /api/health`  
- **Queries:** `GET/POST /api/queries`, `GET/PATCH /api/queries/:id`, `POST /api/queries/:id/run`, `GET /api/queries/:id/related`, `GET /api/queries/:id/results`  
- **Results:** `GET /api/results/:id` (includes citations and feedback)  
- **Feedback:** `POST /api/feedback` (body: `research_result_id` or `research_query_id`, optional `rating` 1–5, optional `feedback_text`)  
- **Metrics:** `GET /api/metrics`  
- **Vault:** `GET/POST /api/vault/documents` (GET with `?q=...` to search), `GET/POST/DELETE /api/vault/documents/:id/annotations`  

See the server routes in `server/api.ts` for full details.

## Accessibility and keyboard

- **Skip to main content**: press Tab on load to focus the skip link, then Enter to jump to main content.
- **Navigation**: all main links are keyboard-focusable; use Tab and Enter.
- **Research result errors** and **feedback submit errors** are announced to screen readers (`role="alert"`).

## Troubleshooting

- **“Failed to list queries” / 500 errors**: ensure the DB is initialized (`npm run db:init`) and the API is running.
- **Run research fails**: check the API terminal for errors; ensure the query exists and the DB is writable.
- **Empty metrics**: run at least one research task and optionally submit feedback to see averages and distribution.
