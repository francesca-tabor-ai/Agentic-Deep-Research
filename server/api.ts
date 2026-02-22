import express from 'express';
import cors from 'cors';
import {
  initDb,
  closeDb,
  listResearchQueries,
  insertResearchQuery,
  getResearchQuery,
  listVaultDocuments,
  insertVaultDocument,
  deleteVaultDocument,
} from './db.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// ---------- Research queries ----------
app.get('/api/queries', (_req, res) => {
  try {
    const limit = _req.query.limit ? Number(_req.query.limit) : 50;
    const status = _req.query.status as string | undefined;
    const queries = listResearchQueries(
      status ? { status: status as 'pending' | 'in_progress' | 'completed' | 'failed', limit } : { limit }
    );
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list queries' });
  }
});

app.post('/api/queries', (req, res) => {
  try {
    const { query_text, status } = req.body ?? {};
    if (!query_text || typeof query_text !== 'string') {
      res.status(400).json({ error: 'query_text is required' });
      return;
    }
    const query = insertResearchQuery({ query_text, status });
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

// ---------- Vault documents ----------
app.get('/api/vault/documents', (_req, res) => {
  try {
    const limit = _req.query.limit ? Number(_req.query.limit) : undefined;
    const docs = listVaultDocuments(limit);
    res.json(docs);
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
