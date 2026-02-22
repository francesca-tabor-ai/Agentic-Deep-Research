import express from 'express';
import cors from 'cors';
import {
  initDb,
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
import { runResearch } from './agent/runner.js';

const isProduction = process.env.NODE_ENV === 'production';
const corsOrigin = process.env.CORS_ORIGIN || (isProduction ? undefined : 'http://localhost:5173');

export const app = express();
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10mb' }));

// Lazy DB initialization — safe for serverless: called once per warm instance.
let _dbReady: Promise<void> | null = null;
export function ensureDb(): Promise<void> {
  if (!_dbReady) {
    const dbPath = process.env.DATABASE_PATH || process.env.DB_PATH || DEFAULT_DB_PATH;
    _dbReady = initDb(dbPath).then(() => undefined);
  }
  return _dbReady;
}

// Middleware: ensure DB is ready before handling API requests
app.use('/api', (_req, _res, next) => {
  ensureDb().then(() => next()).catch(next);
});

const MAX_QUERY_TEXT_LENGTH = 10_000;
const MAX_TITLE_LENGTH = 2_000;
const MAX_LIMIT = 500;
const MAX_CONTENT_LENGTH = 2_000_000;
const MAX_FEEDBACK_TEXT_LENGTH = 5_000;
const MAX_NOTE_LENGTH = 5_000;
const MAX_SOURCE_URL_LENGTH = 2_000;

// ---------- Health ----------
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ---------- Research queries ----------
app.get('/api/queries', async (req, res) => {
  try {
    const rawLimit = req.query.limit ? Number(req.query.limit) : 50;
    const limit = Math.min(Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 50, MAX_LIMIT);
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const query = await getResearchQuery(id);
    if (!query) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to get query' : (err instanceof Error ? err.message : 'Failed to get query') });
  }
});

app.get('/api/queries/:id/related', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const { saved } = req.body ?? {};
    if (typeof saved !== 'boolean') { res.status(400).json({ error: 'saved (boolean) is required' }); return; }
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const result = await getResearchResult(id);
    if (!result) { res.status(404).json({ error: 'Not found' }); return; }
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
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
    const feedbackTextVal = typeof feedback_text === 'string' ? feedback_text.trim() || null : null;
    if (feedbackTextVal != null && feedbackTextVal.length > MAX_FEEDBACK_TEXT_LENGTH) {
      res.status(400).json({ error: `feedback_text must be at most ${MAX_FEEDBACK_TEXT_LENGTH} characters` });
      return;
    }
    const feedback = await insertUserFeedback({
      research_result_id: research_result_id != null && Number.isInteger(Number(research_result_id)) ? Number(research_result_id) : null,
      research_query_id: research_query_id != null && Number.isInteger(Number(research_query_id)) ? Number(research_query_id) : null,
      rating: ratingNum,
      feedback_text: feedbackTextVal,
    });
    res.status(201).json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to submit feedback' : (err instanceof Error ? err.message : 'Failed to submit feedback') });
  }
});

// ---------- Metrics ----------
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
    const rawLimit = req.query.limit != null ? Number(req.query.limit) : undefined;
    const limit = rawLimit != null ? Math.min(Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 50, MAX_LIMIT) : undefined;
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
    if (!title || typeof title !== 'string') { res.status(400).json({ error: 'title is required' }); return; }
    const titleTrimmed = title.trim();
    if (!titleTrimmed) { res.status(400).json({ error: 'title cannot be empty' }); return; }
    if (titleTrimmed.length > MAX_TITLE_LENGTH) { res.status(400).json({ error: `title must be at most ${MAX_TITLE_LENGTH} characters` }); return; }
    const contentVal = typeof content === 'string' ? content : null;
    if (contentVal != null && contentVal.length > MAX_CONTENT_LENGTH) {
      res.status(400).json({ error: `content must be at most ${MAX_CONTENT_LENGTH} characters` });
      return;
    }
    const sourceUrlVal = typeof source_url === 'string' ? source_url.trim() || null : null;
    if (sourceUrlVal != null && sourceUrlVal.length > MAX_SOURCE_URL_LENGTH) {
      res.status(400).json({ error: `source_url must be at most ${MAX_SOURCE_URL_LENGTH} characters` });
      return;
    }
    const doc = await insertVaultDocument({
      title: titleTrimmed,
      content: contentVal,
      source_url: sourceUrlVal,
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const ok = await deleteVaultDocument(id);
    if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
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
    if (!Number.isInteger(id)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const { note } = req.body ?? {};
    const noteTrimmed = typeof note === 'string' ? note.trim() : '';
    if (!noteTrimmed) { res.status(400).json({ error: 'note (non-empty string) is required' }); return; }
    if (noteTrimmed.length > MAX_NOTE_LENGTH) {
      res.status(400).json({ error: `note must be at most ${MAX_NOTE_LENGTH} characters` });
      return;
    }
    const annotation = await insertDocumentAnnotation(id, noteTrimmed);
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
    if (!Number.isInteger(docId) || !Number.isInteger(annId)) { res.status(400).json({ error: 'Invalid id' }); return; }
    const ok = await deleteDocumentAnnotation(annId);
    if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: isProduction ? 'Failed to delete annotation' : (err instanceof Error ? err.message : 'Failed to delete annotation') });
  }
});
