import express from 'express';
import cors from 'cors';
import {
  initDb,
  closeDb,
  DEFAULT_DB_PATH,
  listResearchQueries,
  insertResearchQuery,
  getResearchQuery,
  getResearchResult,
  listResearchResultsByQueryId,
  listCitationsByResultId,
  listVaultDocuments,
  searchVaultDocuments,
  insertVaultDocument,
  deleteVaultDocument,
  updateResearchQuerySaved,
  listDocumentAnnotations,
  insertDocumentAnnotation,
  deleteDocumentAnnotation,
  insertUserFeedback,
  listUserFeedbackByResultId,
  listUserFeedbackByQueryId,
  getResearchMetrics,
} from './db.js';
import { createServer } from 'http';
import { runResearch } from './agent/runner.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');
const isProduction = process.env.NODE_ENV === 'production';

// CORS: in production allow CORS_ORIGIN; in dev default to Vite
const corsOrigin = process.env.CORS_ORIGIN || (isProduction ? undefined : 'http://localhost:5173');
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10mb' }));

// ---------- Health (for load balancers / orchestrators) ----------
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ---------- Research queries ----------
app.get('/api/queries', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const status = req.query.status as string | undefined;
    const saved = req.query.saved === 'true';
    const parent_query_id = req.query.parent_query_id != null ? Number(req.query.parent_query_id) : undefined;
    const opts = { limit, ...(status && { status: status as 'pending' | 'in_progress' | 'completed' | 'failed' }), ...(saved && { saved: true }), ...(parent_query_id != null && Number.isInteger(parent_query_id) && { parent_query_id }) };
    const queries = await listResearchQueries(opts);
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to list queries' : (err instanceof Error ? err.message : 'Failed to list queries') });
  }
});

const MAX_QUERY_TEXT_LENGTH = 10_000;
const MAX_TITLE_LENGTH = 2_000;

app.post('/api/queries', async (req, res) => {
  try {
    const { query_text, status, parent_query_id } = req.body ?? {};
    if (!query_text || typeof query_text !== 'string') {
      res.status(400).json({ error: 'query_text is required' });
      return;
    }
    const trimmed = query_text.trim();
    if (!trimmed) {
      res.status(400).json({ error: 'query_text cannot be empty' });
      return;
    }
    if (trimmed.length > MAX_QUERY_TEXT_LENGTH) {
      res.status(400).json({ error: `query_text must be at most ${MAX_QUERY_TEXT_LENGTH} characters` });
      return;
    }
    const query = await insertResearchQuery({
      query_text: trimmed,
      status,
      parent_query_id: parent_query_id != null && Number.isInteger(Number(parent_query_id)) ? Number(parent_query_id) : undefined,
    });
    res.status(201).json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to create query' : (err instanceof Error ? err.message : 'Failed to create query') });
  }
});

app.get('/api/queries/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const query = await getResearchQuery(id);
    if (!query) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to get query' : (err instanceof Error ? err.message : 'Failed to get query') });
  }
});

app.get('/api/queries/:id/related', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const queries = await listResearchQueries({ parent_query_id: id, limit: 50 });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to list related queries' : (err instanceof Error ? err.message : 'Failed to list related queries') });
  }
});

app.patch('/api/queries/:id/saved', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const { saved } = req.body ?? {};
    if (typeof saved !== 'boolean') {
      res.status(400).json({ error: 'saved (boolean) is required' });
      return;
    }
    await updateResearchQuerySaved(id, saved);
    res.json({ id, saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to update saved state' : (err instanceof Error ? err.message : 'Failed to update saved state') });
  }
});

app.post('/api/queries/:id/run', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const { vaultDocIds } = req.body ?? {};
    const options =
      Array.isArray(vaultDocIds) && vaultDocIds.length > 0
        ? { vaultDocIds: vaultDocIds.filter((x: unknown) => Number.isInteger(Number(x))).map(Number) }
        : undefined;
    const outcome = await runResearch(id, undefined, options);
    res.json(outcome);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Research run failed' : (err instanceof Error ? err.message : 'Research run failed') });
  }
});

app.get('/api/queries/:id/results', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const results = await listResearchResultsByQueryId(id);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to list results' : (err instanceof Error ? err.message : 'Failed to list results') });
  }
});

app.get('/api/results/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const result = await getResearchResult(id);
    if (!result) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const citations = await listCitationsByResultId(id);
    const feedback = await listUserFeedbackByResultId(id);
    res.json({ result, citations, feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to get result' : (err instanceof Error ? err.message : 'Failed to get result') });
  }
});

// ---------- Feedback ----------
app.get('/api/results/:id/feedback', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const feedback = await listUserFeedbackByResultId(id);
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to list feedback' : (err instanceof Error ? err.message : 'Failed to list feedback') });
  }
});

app.get('/api/queries/:id/feedback', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const feedback = await listUserFeedbackByQueryId(id);
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to list feedback' : (err instanceof Error ? err.message : 'Failed to list feedback') });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { research_result_id, research_query_id, rating, feedback_text } = req.body ?? {};
    if (research_result_id == null && research_query_id == null) {
      res.status(400).json({ error: 'research_result_id or research_query_id is required' });
      return;
    }
    const ratingNum = rating != null ? Number(rating) : null;
    if (ratingNum != null && (ratingNum < 1 || ratingNum > 5 || !Number.isInteger(ratingNum))) {
      res.status(400).json({ error: 'rating must be an integer 1–5' });
      return;
    }
    const feedback = await insertUserFeedback({
      research_result_id: research_result_id != null && Number.isInteger(Number(research_result_id)) ? Number(research_result_id) : null,
      research_query_id: research_query_id != null && Number.isInteger(Number(research_query_id)) ? Number(research_query_id) : null,
      rating: ratingNum,
      feedback_text: typeof feedback_text === 'string' ? feedback_text.trim() || null : null,
    });
    res.status(201).json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to submit feedback' : (err instanceof Error ? err.message : 'Failed to submit feedback') });
  }
});

// ---------- Metrics (dashboard) ----------
app.get('/api/metrics', async (_req, res) => {
  try {
    const metrics = await getResearchMetrics();
    res.json(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to load metrics' : (err instanceof Error ? err.message : 'Failed to load metrics') });
  }
});

// ---------- Vault documents ----------
app.get('/api/vault/documents', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = req.query.limit != null ? Number(req.query.limit) : undefined;
    if (q) {
      const docs = await searchVaultDocuments(q, limit ?? 50);
      res.json(docs);
    } else {
      const docs = await listVaultDocuments(limit);
      res.json(docs);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to list documents' : (err instanceof Error ? err.message : 'Failed to list documents') });
  }
});

app.post('/api/vault/documents', async (req, res) => {
  try {
    const { title, content, source_url } = req.body ?? {};
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    const titleTrimmed = title.trim();
    if (!titleTrimmed) {
      res.status(400).json({ error: 'title cannot be empty' });
      return;
    }
    if (titleTrimmed.length > MAX_TITLE_LENGTH) {
      res.status(400).json({ error: `title must be at most ${MAX_TITLE_LENGTH} characters` });
      return;
    }
    const doc = await insertVaultDocument({
      title: titleTrimmed,
      content: typeof content === 'string' ? content : null,
      source_url: typeof source_url === 'string' ? source_url : null,
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to create document' : (err instanceof Error ? err.message : 'Failed to create document') });
  }
});

app.delete('/api/vault/documents/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const ok = await deleteVaultDocument(id);
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to delete document' : (err instanceof Error ? err.message : 'Failed to delete document') });
  }
});

// ---------- Document annotations ----------
app.get('/api/vault/documents/:id/annotations', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const annotations = await listDocumentAnnotations(id);
    res.json(annotations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to list annotations' : (err instanceof Error ? err.message : 'Failed to list annotations') });
  }
});

app.post('/api/vault/documents/:id/annotations', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const { note } = req.body ?? {};
    if (typeof note !== 'string' || !note.trim()) {
      res.status(400).json({ error: 'note (non-empty string) is required' });
      return;
    }
    const annotation = await insertDocumentAnnotation(id, note.trim());
    res.status(201).json(annotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to create annotation' : (err instanceof Error ? err.message : 'Failed to create annotation') });
  }
});

app.delete('/api/vault/documents/:docId/annotations/:annId', async (req, res) => {
  try {
    const docId = Number(req.params.docId);
    const annId = Number(req.params.annId);
    if (!Number.isInteger(docId) || !Number.isInteger(annId)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const ok = await deleteDocumentAnnotation(annId);
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to delete annotation' : (err instanceof Error ? err.message : 'Failed to delete annotation') });
  }
});

let server: ReturnType<typeof createServer> | null = null;

function shutdown(signal: string) {
  return () => {
    console.log(`${signal} received, shutting down gracefully...`);
    const done = (code: number) => {
      closeDb().then(() => process.exit(code)).catch((err) => {
        console.error('Error closing DB:', err);
        process.exit(1);
      });
    };
    if (server) {
      server.close((err) => {
        if (err) console.error('Error closing server:', err);
        done(err ? 1 : 0);
      });
    } else {
      done(0);
    }
  };
}

async function main() {
  const dbPath = process.env.DATABASE_PATH || process.env.DB_PATH || DEFAULT_DB_PATH;
  await initDb(dbPath);
  server = createServer(app);
  server.listen(PORT, HOST, () => {
    console.log(`API listening on http://${HOST}:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));
