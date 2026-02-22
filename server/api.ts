import express from 'express';
import cors from 'cors';
import {
  initDb,
  closeDb,
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
} from './db.js';
import { runResearch } from './agent/runner.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// ---------- Research queries ----------
app.get('/api/queries', (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const status = req.query.status as string | undefined;
    const saved = req.query.saved === 'true';
    const parent_query_id = req.query.parent_query_id != null ? Number(req.query.parent_query_id) : undefined;
    const opts = { limit, ...(status && { status: status as 'pending' | 'in_progress' | 'completed' | 'failed' }), ...(saved && { saved: true }), ...(parent_query_id != null && Number.isInteger(parent_query_id) && { parent_query_id }) };
    const queries = listResearchQueries(opts);
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list queries' });
  }
});

app.post('/api/queries', (req, res) => {
  try {
    const { query_text, status, parent_query_id } = req.body ?? {};
    if (!query_text || typeof query_text !== 'string') {
      res.status(400).json({ error: 'query_text is required' });
      return;
    }
    const query = insertResearchQuery({
      query_text,
      status,
      parent_query_id: parent_query_id != null && Number.isInteger(Number(parent_query_id)) ? Number(parent_query_id) : undefined,
    });
    res.status(201).json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create query' });
  }
});

app.get('/api/queries/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const query = getResearchQuery(id);
    if (!query) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get query' });
  }
});

app.get('/api/queries/:id/related', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const queries = listResearchQueries({ parent_query_id: id, limit: 50 });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list related queries' });
  }
});

app.patch('/api/queries/:id/saved', (req, res) => {
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
    updateResearchQuerySaved(id, saved);
    res.json({ id, saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update saved state' });
  }
});

app.post('/api/queries/:id/run', (req, res) => {
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
    const outcome = runResearch(id, undefined, options);
    res.json(outcome);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Research run failed' });
  }
});

app.get('/api/queries/:id/results', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const results = listResearchResultsByQueryId(id);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list results' });
  }
});

app.get('/api/results/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const result = getResearchResult(id);
    if (!result) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const citations = listCitationsByResultId(id);
    res.json({ result, citations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get result' });
  }
});

// ---------- Vault documents ----------
app.get('/api/vault/documents', (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = req.query.limit != null ? Number(req.query.limit) : undefined;
    if (q) {
      const docs = searchVaultDocuments(q, limit ?? 50);
      res.json(docs);
    } else {
      const docs = listVaultDocuments(limit);
      res.json(docs);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

app.post('/api/vault/documents', (req, res) => {
  try {
    const { title, content, source_url } = req.body ?? {};
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    const doc = insertVaultDocument({
      title: title.trim(),
      content: typeof content === 'string' ? content : null,
      source_url: typeof source_url === 'string' ? source_url : null,
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

app.delete('/api/vault/documents/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const ok = deleteVaultDocument(id);
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ---------- Document annotations ----------
app.get('/api/vault/documents/:id/annotations', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const annotations = listDocumentAnnotations(id);
    res.json(annotations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list annotations' });
  }
});

app.post('/api/vault/documents/:id/annotations', (req, res) => {
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
    const annotation = insertDocumentAnnotation(id, note.trim());
    res.status(201).json(annotation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create annotation' });
  }
});

app.delete('/api/vault/documents/:docId/annotations/:annId', (req, res) => {
  try {
    const docId = Number(req.params.docId);
    const annId = Number(req.params.annId);
    if (!Number.isInteger(docId) || !Number.isInteger(annId)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const ok = deleteDocumentAnnotation(annId);
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete annotation' });
  }
});

async function main() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});
