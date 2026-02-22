import initSqlJs, { SqlJsStatic } from 'sql.js';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { Pool } from 'pg';

export const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'research.db');

/** When set (e.g. Railway PostgreSQL), use pg instead of SQLite. */
let pgPool: Pool | null = null;

export type ResearchQueryStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface ResearchQuery {
  id: number;
  query_text: string;
  status: ResearchQueryStatus;
  created_at: string;
  updated_at: string;
  saved_at: string | null;
  parent_query_id: number | null;
}

export interface ResearchQueryInsert {
  query_text: string;
  status?: ResearchQueryStatus;
  parent_query_id?: number | null;
}

export interface VaultDocument {
  id: number;
  title: string;
  content: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VaultDocumentInsert {
  title: string;
  content?: string | null;
  source_url?: string | null;
}

export interface ResearchResult {
  id: number;
  research_query_id: number;
  content: string | null;
  summary: string | null;
  created_at: string;
  confidence: number | null;
  duration_ms: number | null;
  reasoning_snapshot: string | null;
}

export interface ResearchResultInsert {
  research_query_id: number;
  content?: string | null;
  summary?: string | null;
  confidence?: number | null;
  duration_ms?: number | null;
  reasoning_snapshot?: string | null;
}

export interface Citation {
  id: number;
  research_result_id: number;
  source_url: string | null;
  title: string | null;
  snippet: string | null;
  source_id: string | null;
  created_at: string;
}

export interface CitationInsert {
  research_result_id: number;
  source_url?: string | null;
  title?: string | null;
  snippet?: string | null;
  source_id?: string | null;
}

export interface UserFeedback {
  id: number;
  research_result_id: number | null;
  research_query_id: number | null;
  rating: number | null;
  feedback_text: string | null;
  created_at: string;
}

export interface UserFeedbackInsert {
  research_result_id?: number | null;
  research_query_id?: number | null;
  rating?: number | null;
  feedback_text?: string | null;
}

type SqlJsDatabase = InstanceType<SqlJsStatic['Database']>;

let sqlJs: SqlJsStatic | null = null;
let db: SqlJsDatabase | null = null;
let dbPath: string | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS research_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vault_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS research_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  research_query_id INTEGER NOT NULL REFERENCES research_queries(id) ON DELETE CASCADE,
  content TEXT,
  summary TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (research_query_id) REFERENCES research_queries(id)
);

CREATE INDEX IF NOT EXISTS idx_research_results_query ON research_results(research_query_id);

CREATE TABLE IF NOT EXISTS citations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  research_result_id INTEGER NOT NULL REFERENCES research_results(id) ON DELETE CASCADE,
  source_url TEXT,
  title TEXT,
  snippet TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (research_result_id) REFERENCES research_results(id)
);

CREATE INDEX IF NOT EXISTS idx_citations_result ON citations(research_result_id);

CREATE TABLE IF NOT EXISTS user_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  research_result_id INTEGER REFERENCES research_results(id) ON DELETE SET NULL,
  research_query_id INTEGER REFERENCES research_queries(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  feedback_text TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (research_result_id) REFERENCES research_results(id),
  FOREIGN KEY (research_query_id) REFERENCES research_queries(id),
  CHECK (research_result_id IS NOT NULL OR research_query_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_result ON user_feedback(research_result_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_query ON user_feedback(research_query_id);

CREATE TABLE IF NOT EXISTS document_annotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vault_document_id INTEGER NOT NULL REFERENCES vault_documents(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (vault_document_id) REFERENCES vault_documents(id)
);
CREATE INDEX IF NOT EXISTS idx_document_annotations_doc ON document_annotations(vault_document_id);
`;

const PG_SCHEMA = `
CREATE TABLE IF NOT EXISTS research_queries (
  id SERIAL PRIMARY KEY,
  query_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  saved_at TIMESTAMPTZ,
  parent_query_id INTEGER REFERENCES research_queries(id)
);
CREATE TABLE IF NOT EXISTS vault_documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS research_results (
  id SERIAL PRIMARY KEY,
  research_query_id INTEGER NOT NULL REFERENCES research_queries(id) ON DELETE CASCADE,
  content TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence REAL,
  duration_ms INTEGER,
  reasoning_snapshot TEXT
);
CREATE INDEX IF NOT EXISTS idx_research_results_query ON research_results(research_query_id);
CREATE TABLE IF NOT EXISTS citations (
  id SERIAL PRIMARY KEY,
  research_result_id INTEGER NOT NULL REFERENCES research_results(id) ON DELETE CASCADE,
  source_url TEXT,
  title TEXT,
  snippet TEXT,
  source_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_citations_result ON citations(research_result_id);
CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  research_result_id INTEGER REFERENCES research_results(id) ON DELETE SET NULL,
  research_query_id INTEGER REFERENCES research_queries(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (research_result_id IS NOT NULL OR research_query_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_user_feedback_result ON user_feedback(research_result_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_query ON user_feedback(research_query_id);
CREATE TABLE IF NOT EXISTS document_annotations (
  id SERIAL PRIMARY KEY,
  vault_document_id INTEGER NOT NULL REFERENCES vault_documents(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_annotations_doc ON document_annotations(vault_document_id);
`;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJs) {
    sqlJs = await initSqlJs();
  }
  return sqlJs;
}

function runAndGetLastId(database: SqlJsDatabase, sql: string, params?: unknown[]): number {
  if (params && params.length > 0) {
    database.run(sql, params);
  } else {
    database.run(sql);
  }
  const res = database.exec('SELECT last_insert_rowid() as id');
  const id = res[0]?.values?.[0]?.[0];
  return typeof id === 'number' ? id : Number(id) || 0;
}

function runAndGetChanges(database: SqlJsDatabase, sql: string, params?: unknown[]): number {
  if (params && params.length > 0) {
    database.run(sql, params);
  } else {
    database.run(sql);
  }
  const res = database.exec('SELECT changes() as c');
  const c = res[0]?.values?.[0]?.[0];
  return typeof c === 'number' ? c : Number(c) || 0;
}

function getRow<T>(database: SqlJsDatabase, sql: string, params: unknown[]): T | null {
  const stmt = database.prepare(sql);
  try {
    stmt.bind(params);
    if (stmt.step()) {
      return stmt.getAsObject() as T;
    }
    return null;
  } finally {
    stmt.free();
  }
}

function getRows<T>(database: SqlJsDatabase, sql: string, params: unknown[] = []): T[] {
  const stmt = database.prepare(sql);
  const rows: T[] = [];
  try {
    stmt.bind(params);
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T);
    }
    return rows;
  } finally {
    stmt.free();
  }
}

/**
 * Initialize the database and create schema. Idempotent. Call once at startup.
 * When DATABASE_URL is set (e.g. Railway PostgreSQL), uses PostgreSQL; otherwise SQLite.
 */
export async function initDb(dbPathArg: string = DEFAULT_DB_PATH): Promise<SqlJsDatabase | void> {
  if (process.env.DATABASE_URL) {
    const poolConfig: { connectionString: string; ssl?: { rejectUnauthorized: boolean } } = {
      connectionString: process.env.DATABASE_URL,
    };
    // Railway and most hosted Postgres require SSL
    if (process.env.DATABASE_SSL !== 'false') {
      poolConfig.ssl = { rejectUnauthorized: false };
    }
    pgPool = new Pool(poolConfig);
    await pgPool.query(PG_SCHEMA);
    console.log('Database initialized (PostgreSQL)');
    return;
  }
  const SQL = await getSqlJs();
  if (dbPathArg === ':memory:') {
    db = new SQL.Database();
  } else {
    const dir = path.dirname(dbPathArg);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const buf = existsSync(dbPathArg)
      ? readFileSync(dbPathArg)
      : null;
    db = new SQL.Database(buf ?? undefined);
  }
  db.exec(SCHEMA);
  try {
    const info = db.exec("PRAGMA table_info(citations)");
    const columns = (info[0]?.values ?? []) as unknown[][];
    const hasSourceId = columns.some((col) => col[1] === 'source_id');
    if (!hasSourceId) db.run('ALTER TABLE citations ADD COLUMN source_id TEXT');
  } catch {
    // ignore
  }
  try {
    const qInfo = db.exec("PRAGMA table_info(research_queries)");
    const qCols = (qInfo[0]?.values ?? []) as unknown[][];
    if (!qCols.some((c) => c[1] === 'saved_at')) db.run('ALTER TABLE research_queries ADD COLUMN saved_at TEXT');
    if (!qCols.some((c) => c[1] === 'parent_query_id')) db.run('ALTER TABLE research_queries ADD COLUMN parent_query_id INTEGER REFERENCES research_queries(id)');
  } catch {
    // ignore
  }
  try {
    const rInfo = db.exec("PRAGMA table_info(research_results)");
    const rCols = (rInfo[0]?.values ?? []) as unknown[][];
    if (!rCols.some((c) => c[1] === 'confidence')) db.run('ALTER TABLE research_results ADD COLUMN confidence REAL');
    if (!rCols.some((c) => c[1] === 'duration_ms')) db.run('ALTER TABLE research_results ADD COLUMN duration_ms INTEGER');
    if (!rCols.some((c) => c[1] === 'reasoning_snapshot')) db.run('ALTER TABLE research_results ADD COLUMN reasoning_snapshot TEXT');
  } catch {
    // ignore
  }
  dbPath = dbPathArg;
  return db;
}

/**
 * Get the current database instance (SQLite) or pg Pool (PostgreSQL). Call initDb() first.
 */
export function getDb(): SqlJsDatabase | Pool {
  if (pgPool) return pgPool;
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

/**
 * Close the database. Async when using PostgreSQL.
 */
export async function closeDb(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
    return;
  }
  if (db && dbPath && dbPath !== ':memory:') {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
  if (db) db.close();
  db = null;
  dbPath = null;
}

// ---------- PostgreSQL helpers (used when DATABASE_URL is set) ----------
function toIso(row: Record<string, unknown>, keys: string[]): void {
  for (const k of keys) {
    if (row[k] instanceof Date) row[k] = (row[k] as Date).toISOString();
  }
}

async function getRowPg<T>(sql: string, params: unknown[]): Promise<T | null> {
  if (!pgPool) throw new Error('PG not initialized');
  const r = await pgPool.query(sql, params);
  const row = r.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  toIso(row, ['created_at', 'updated_at', 'saved_at']);
  return row as T;
}

async function getRowsPg<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (!pgPool) throw new Error('PG not initialized');
  const r = await pgPool.query(sql, params);
  for (const row of r.rows as Record<string, unknown>[]) {
    toIso(row, ['created_at', 'updated_at', 'saved_at']);
  }
  return r.rows as T[];
}

async function runAndGetLastIdPg(sql: string, params: unknown[]): Promise<number> {
  if (!pgPool) throw new Error('PG not initialized');
  const r = await pgPool.query(sql, params);
  const id = r.rows[0]?.id;
  return typeof id === 'number' ? id : Number(id) || 0;
}

async function runAndGetChangesPg(sql: string, params: unknown[]): Promise<number> {
  if (!pgPool) throw new Error('PG not initialized');
  const r = await pgPool.query(sql, params);
  return r.rowCount ?? 0;
}

// ---------- research_queries ----------

export async function insertResearchQuery(
  data: ResearchQueryInsert,
  database?: SqlJsDatabase
): Promise<ResearchQuery> {
  if (pgPool && database === undefined) {
    const status = data.status ?? 'pending';
    const r = await pgPool.query(
      'INSERT INTO research_queries (query_text, status, parent_query_id) VALUES ($1, $2, $3) RETURNING *',
      [data.query_text, status, data.parent_query_id ?? null]
    );
    const row = r.rows[0] as Record<string, unknown>;
    if (!row) throw new Error('Insert failed');
    toIso(row, ['created_at', 'updated_at', 'saved_at']);
    return row as ResearchQuery;
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const status = data.status ?? 'pending';
  const id = runAndGetLastId(
    d,
    'INSERT INTO research_queries (query_text, status, parent_query_id) VALUES (?, ?, ?)',
    [data.query_text, status, data.parent_query_id ?? null]
  );
  return getRow<ResearchQuery>(d, 'SELECT * FROM research_queries WHERE id = ?', [id])!;
}

export async function getResearchQuery(
  id: number,
  database?: SqlJsDatabase
): Promise<ResearchQuery | null> {
  if (pgPool && database === undefined) return getRowPg<ResearchQuery>('SELECT * FROM research_queries WHERE id = $1', [id]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRow<ResearchQuery>(d, 'SELECT * FROM research_queries WHERE id = ?', [id]);
}

export async function listResearchQueries(
  opts?: { status?: ResearchQueryStatus; limit?: number; saved?: boolean; parent_query_id?: number },
  database?: SqlJsDatabase
): Promise<ResearchQuery[]> {
  if (pgPool && database === undefined) {
    let sql = 'SELECT * FROM research_queries';
    const params: (string | number | null)[] = [];
    const conditions: string[] = [];
    if (opts?.status) { conditions.push('status = $' + (params.length + 1)); params.push(opts.status); }
    if (opts?.saved === true) conditions.push('saved_at IS NOT NULL');
    if (opts?.parent_query_id != null) { conditions.push('parent_query_id = $' + (params.length + 1)); params.push(opts.parent_query_id); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    if (opts?.limit) { sql += ' LIMIT $' + (params.length + 1); params.push(opts.limit); }
    return getRowsPg<ResearchQuery>(sql, params);
  }
  const d = database ?? getDb() as SqlJsDatabase;
  let sql = 'SELECT * FROM research_queries';
  const params: (string | number | null)[] = [];
  const conditions: string[] = [];
  if (opts?.status) { conditions.push('status = ?'); params.push(opts.status); }
  if (opts?.saved === true) conditions.push('saved_at IS NOT NULL');
  if (opts?.parent_query_id != null) { conditions.push('parent_query_id = ?'); params.push(opts.parent_query_id); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY created_at DESC';
  if (opts?.limit) { sql += ' LIMIT ?'; params.push(opts.limit); }
  return getRows<ResearchQuery>(d, sql, params);
}

export async function updateResearchQueryStatus(
  id: number,
  status: ResearchQueryStatus,
  database?: SqlJsDatabase
): Promise<ResearchQuery | null> {
  if (pgPool && database === undefined) {
    await pgPool.query("UPDATE research_queries SET status = $1, updated_at = NOW() WHERE id = $2", [status, id]);
    return getRowPg<ResearchQuery>('SELECT * FROM research_queries WHERE id = $1', [id]);
  }
  const d = database ?? getDb() as SqlJsDatabase;
  d.run(
    "UPDATE research_queries SET status = ?, updated_at = datetime('now') WHERE id = ?",
    [status, id]
  );
  return getRow<ResearchQuery>(d, 'SELECT * FROM research_queries WHERE id = ?', [id]);
}

export async function updateResearchQuerySaved(
  id: number,
  saved: boolean,
  database?: SqlJsDatabase
): Promise<ResearchQuery | null> {
  if (pgPool && database === undefined) {
    await pgPool.query("UPDATE research_queries SET saved_at = $1, updated_at = NOW() WHERE id = $2", [saved ? new Date().toISOString() : null, id]);
    return getRowPg<ResearchQuery>('SELECT * FROM research_queries WHERE id = $1', [id]);
  }
  const d = database ?? getDb() as SqlJsDatabase;
  d.run(
    "UPDATE research_queries SET saved_at = ?, updated_at = datetime('now') WHERE id = ?",
    [saved ? new Date().toISOString() : null, id]
  );
  return getRow<ResearchQuery>(d, 'SELECT * FROM research_queries WHERE id = ?', [id]);
}

// ---------- vault_documents ----------

export async function insertVaultDocument(
  data: VaultDocumentInsert,
  database?: SqlJsDatabase
): Promise<VaultDocument> {
  if (pgPool && database === undefined) {
    const r = await pgPool.query(
      'INSERT INTO vault_documents (title, content, source_url) VALUES ($1, $2, $3) RETURNING *',
      [data.title, data.content ?? null, data.source_url ?? null]
    );
    const row = r.rows[0] as Record<string, unknown>;
    if (!row) throw new Error('Insert failed');
    toIso(row, ['created_at', 'updated_at']);
    return row as VaultDocument;
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const id = runAndGetLastId(d, 'INSERT INTO vault_documents (title, content, source_url) VALUES (?, ?, ?)', [data.title, data.content ?? null, data.source_url ?? null]);
  return getRow<VaultDocument>(d, 'SELECT * FROM vault_documents WHERE id = ?', [id])!;
}

export async function getVaultDocument(
  id: number,
  database?: SqlJsDatabase
): Promise<VaultDocument | null> {
  if (pgPool && database === undefined) return getRowPg<VaultDocument>('SELECT * FROM vault_documents WHERE id = $1', [id]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRow<VaultDocument>(d, 'SELECT * FROM vault_documents WHERE id = ?', [id]);
}

export async function listVaultDocuments(
  limit?: number,
  database?: SqlJsDatabase
): Promise<VaultDocument[]> {
  if (pgPool && database === undefined) {
    const sql = limit ? 'SELECT * FROM vault_documents ORDER BY created_at DESC LIMIT $1' : 'SELECT * FROM vault_documents ORDER BY created_at DESC';
    return limit ? getRowsPg<VaultDocument>(sql, [limit]) : getRowsPg<VaultDocument>(sql);
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const sql = limit ? 'SELECT * FROM vault_documents ORDER BY created_at DESC LIMIT ?' : 'SELECT * FROM vault_documents ORDER BY created_at DESC';
  return limit ? getRows<VaultDocument>(d, sql, [limit]) : getRows<VaultDocument>(d, sql);
}

/** Simple search: tokenize query, filter docs by term match in title/content, return by relevance. */
export async function searchVaultDocuments(
  query: string,
  limit: number = 50,
  database?: SqlJsDatabase
): Promise<VaultDocument[]> {
  const all = pgPool && database === undefined
    ? await getRowsPg<VaultDocument>('SELECT * FROM vault_documents ORDER BY created_at DESC')
    : getRows<VaultDocument>(database ?? getDb() as SqlJsDatabase, 'SELECT * FROM vault_documents ORDER BY created_at DESC', []);
  const terms = query.toLowerCase().trim().split(/\s+/).filter((w) => w.length > 1);
  if (!terms.length) return all.slice(0, limit);
  const scored = all.map((doc) => {
    const text = [doc.title, doc.content ?? ''].join(' ').toLowerCase();
    const hits = terms.filter((t) => text.includes(t)).length;
    return { doc, score: hits / terms.length };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.doc);
}

export async function getVaultDocumentsByIds(
  ids: number[],
  database?: SqlJsDatabase
): Promise<VaultDocument[]> {
  if (!ids.length) return [];
  if (pgPool && database === undefined) {
    const placeholders = ids.map((_, i) => '$' + (i + 1)).join(',');
    return getRowsPg<VaultDocument>(`SELECT * FROM vault_documents WHERE id IN (${placeholders})`, ids);
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const placeholders = ids.map(() => '?').join(',');
  return getRows<VaultDocument>(d, `SELECT * FROM vault_documents WHERE id IN (${placeholders})`, ids);
}

// ---------- document_annotations ----------

export interface DocumentAnnotation {
  id: number;
  vault_document_id: number;
  note: string;
  created_at: string;
}

export async function listDocumentAnnotations(
  vaultDocumentId: number,
  database?: SqlJsDatabase
): Promise<DocumentAnnotation[]> {
  if (pgPool && database === undefined) return getRowsPg<DocumentAnnotation>('SELECT * FROM document_annotations WHERE vault_document_id = $1 ORDER BY created_at', [vaultDocumentId]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRows<DocumentAnnotation>(d, 'SELECT * FROM document_annotations WHERE vault_document_id = ? ORDER BY created_at', [vaultDocumentId]);
}

export async function insertDocumentAnnotation(
  vaultDocumentId: number,
  note: string,
  database?: SqlJsDatabase
): Promise<DocumentAnnotation> {
  if (pgPool && database === undefined) {
    const r = await pgPool.query('INSERT INTO document_annotations (vault_document_id, note) VALUES ($1, $2) RETURNING *', [vaultDocumentId, note]);
    const row = r.rows[0] as Record<string, unknown>;
    if (!row) throw new Error('Insert failed');
    toIso(row, ['created_at']);
    return row as DocumentAnnotation;
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const id = runAndGetLastId(d, 'INSERT INTO document_annotations (vault_document_id, note) VALUES (?, ?)', [vaultDocumentId, note]);
  const row = getRow<DocumentAnnotation>(d, 'SELECT * FROM document_annotations WHERE id = ?', [id]);
  if (!row) throw new Error('Insert failed');
  return row;
}

export async function deleteDocumentAnnotation(
  id: number,
  database?: SqlJsDatabase
): Promise<boolean> {
  if (pgPool && database === undefined) { const n = await runAndGetChangesPg('DELETE FROM document_annotations WHERE id = $1', [id]); return n > 0; }
  const d = database ?? getDb() as SqlJsDatabase;
  return runAndGetChanges(d, 'DELETE FROM document_annotations WHERE id = ?', [id]) > 0;
}

// ---------- research_results ----------

export async function deleteVaultDocument(
  id: number,
  database?: SqlJsDatabase
): Promise<boolean> {
  if (pgPool && database === undefined) { const n = await runAndGetChangesPg('DELETE FROM vault_documents WHERE id = $1', [id]); return n > 0; }
  const d = database ?? getDb() as SqlJsDatabase;
  return runAndGetChanges(d, 'DELETE FROM vault_documents WHERE id = ?', [id]) > 0;
}

// ---------- research_results ----------

export async function insertResearchResult(
  data: ResearchResultInsert,
  database?: SqlJsDatabase
): Promise<ResearchResult> {
  if (pgPool && database === undefined) {
    const r = await pgPool.query(
      'INSERT INTO research_results (research_query_id, content, summary, confidence, duration_ms, reasoning_snapshot) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.research_query_id, data.content ?? null, data.summary ?? null, data.confidence ?? null, data.duration_ms ?? null, data.reasoning_snapshot ?? null]
    );
    const row = r.rows[0] as Record<string, unknown>;
    if (!row) throw new Error('Insert failed');
    toIso(row, ['created_at']);
    return row as ResearchResult;
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const id = runAndGetLastId(d, 'INSERT INTO research_results (research_query_id, content, summary, confidence, duration_ms, reasoning_snapshot) VALUES (?, ?, ?, ?, ?, ?)', [data.research_query_id, data.content ?? null, data.summary ?? null, data.confidence ?? null, data.duration_ms ?? null, data.reasoning_snapshot ?? null]);
  return getRow<ResearchResult>(d, 'SELECT * FROM research_results WHERE id = ?', [id])!;
}

export async function getResearchResult(
  id: number,
  database?: SqlJsDatabase
): Promise<ResearchResult | null> {
  if (pgPool && database === undefined) return getRowPg<ResearchResult>('SELECT * FROM research_results WHERE id = $1', [id]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRow<ResearchResult>(d, 'SELECT * FROM research_results WHERE id = ?', [id]);
}

export async function listResearchResultsByQueryId(
  researchQueryId: number,
  database?: SqlJsDatabase
): Promise<ResearchResult[]> {
  if (pgPool && database === undefined) return getRowsPg<ResearchResult>('SELECT * FROM research_results WHERE research_query_id = $1 ORDER BY created_at DESC', [researchQueryId]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRows<ResearchResult>(d, 'SELECT * FROM research_results WHERE research_query_id = ? ORDER BY created_at DESC', [researchQueryId]);
}

// ---------- citations ----------

export async function insertCitation(
  data: CitationInsert,
  database?: SqlJsDatabase
): Promise<Citation> {
  if (pgPool && database === undefined) {
    const r = await pgPool.query(
      'INSERT INTO citations (research_result_id, source_url, title, snippet, source_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.research_result_id, data.source_url ?? null, data.title ?? null, data.snippet ?? null, data.source_id ?? null]
    );
    const row = r.rows[0] as Record<string, unknown>;
    if (!row) throw new Error('Insert failed');
    toIso(row, ['created_at']);
    return row as Citation;
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const id = runAndGetLastId(d, 'INSERT INTO citations (research_result_id, source_url, title, snippet, source_id) VALUES (?, ?, ?, ?, ?)', [data.research_result_id, data.source_url ?? null, data.title ?? null, data.snippet ?? null, data.source_id ?? null]);
  return getRow<Citation>(d, 'SELECT * FROM citations WHERE id = ?', [id])!;
}

export async function getCitation(
  id: number,
  database?: SqlJsDatabase
): Promise<Citation | null> {
  if (pgPool && database === undefined) return getRowPg<Citation>('SELECT * FROM citations WHERE id = $1', [id]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRow<Citation>(d, 'SELECT * FROM citations WHERE id = ?', [id]);
}

export async function listCitationsByResultId(
  researchResultId: number,
  database?: SqlJsDatabase
): Promise<Citation[]> {
  if (pgPool && database === undefined) return getRowsPg<Citation>('SELECT * FROM citations WHERE research_result_id = $1 ORDER BY created_at', [researchResultId]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRows<Citation>(d, 'SELECT * FROM citations WHERE research_result_id = ? ORDER BY created_at', [researchResultId]);
}

// ---------- user_feedback ----------

export async function insertUserFeedback(
  data: UserFeedbackInsert,
  database?: SqlJsDatabase
): Promise<UserFeedback> {
  if (data.research_result_id == null && data.research_query_id == null) throw new Error('Either research_result_id or research_query_id must be set');
  if (pgPool && database === undefined) {
    const r = await pgPool.query(
      'INSERT INTO user_feedback (research_result_id, research_query_id, rating, feedback_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.research_result_id ?? null, data.research_query_id ?? null, data.rating ?? null, data.feedback_text ?? null]
    );
    const row = r.rows[0] as Record<string, unknown>;
    if (!row) throw new Error('Insert failed');
    toIso(row, ['created_at']);
    return row as UserFeedback;
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const id = runAndGetLastId(d, 'INSERT INTO user_feedback (research_result_id, research_query_id, rating, feedback_text) VALUES (?, ?, ?, ?)', [data.research_result_id ?? null, data.research_query_id ?? null, data.rating ?? null, data.feedback_text ?? null]);
  return getRow<UserFeedback>(d, 'SELECT * FROM user_feedback WHERE id = ?', [id])!;
}

export async function getUserFeedback(
  id: number,
  database?: SqlJsDatabase
): Promise<UserFeedback | null> {
  if (pgPool && database === undefined) return getRowPg<UserFeedback>('SELECT * FROM user_feedback WHERE id = $1', [id]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRow<UserFeedback>(d, 'SELECT * FROM user_feedback WHERE id = ?', [id]);
}

export async function listUserFeedbackByResultId(
  researchResultId: number,
  database?: SqlJsDatabase
): Promise<UserFeedback[]> {
  if (pgPool && database === undefined) return getRowsPg<UserFeedback>('SELECT * FROM user_feedback WHERE research_result_id = $1 ORDER BY created_at DESC', [researchResultId]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRows<UserFeedback>(d, 'SELECT * FROM user_feedback WHERE research_result_id = ? ORDER BY created_at DESC', [researchResultId]);
}

export async function listUserFeedbackByQueryId(
  researchQueryId: number,
  database?: SqlJsDatabase
): Promise<UserFeedback[]> {
  if (pgPool && database === undefined) return getRowsPg<UserFeedback>('SELECT * FROM user_feedback WHERE research_query_id = $1 ORDER BY created_at DESC', [researchQueryId]);
  const d = database ?? getDb() as SqlJsDatabase;
  return getRows<UserFeedback>(d, 'SELECT * FROM user_feedback WHERE research_query_id = ? ORDER BY created_at DESC', [researchQueryId]);
}

// ---------- metrics (aggregates for dashboard) ----------

export interface ResearchMetrics {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  avgConfidence: number | null;
  avgDurationMs: number | null;
  totalFeedbackCount: number;
  avgRating: number | null;
  ratingDistribution: { rating: number; count: number }[];
  recentResultIds: number[];
}

export async function getResearchMetrics(database?: SqlJsDatabase): Promise<ResearchMetrics> {
  if (pgPool && database === undefined) {
    const totalRuns = Number((await getRowPg<{ n: unknown }>('SELECT COUNT(*) as n FROM research_results', []))?.n ?? 0);
    const completedQueries = Number((await getRowPg<{ n: unknown }>('SELECT COUNT(DISTINCT research_query_id) as n FROM research_results', []))?.n ?? 0);
    const failedRuns = Number((await getRowPg<{ n: unknown }>("SELECT COUNT(*) as n FROM research_queries WHERE status = 'failed'", []))?.n ?? 0);
    const avgConfRow = await getRowPg<{ avg: number | null }>('SELECT AVG(confidence) as avg FROM research_results WHERE confidence IS NOT NULL', []);
    const avgConfidence = avgConfRow?.avg != null ? Number(avgConfRow.avg) : null;
    const avgDurRow = await getRowPg<{ avg: number | null }>('SELECT AVG(duration_ms) as avg FROM research_results WHERE duration_ms IS NOT NULL', []);
    const avgDurationMs = avgDurRow?.avg != null ? Math.round(Number(avgDurRow.avg)) : null;
    const totalFeedbackCount = Number((await getRowPg<{ n: unknown }>('SELECT COUNT(*) as n FROM user_feedback WHERE rating IS NOT NULL', []))?.n ?? 0);
    const avgRatingRow = await getRowPg<{ avg: number | null }>('SELECT AVG(rating) as avg FROM user_feedback WHERE rating IS NOT NULL', []);
    const avgRating = avgRatingRow?.avg != null ? Math.round(Number(avgRatingRow.avg) * 10) / 10 : null;
    const distRows = await getRowsPg<{ rating: number; count: unknown }>('SELECT rating, COUNT(*) as count FROM user_feedback WHERE rating IS NOT NULL GROUP BY rating ORDER BY rating', []);
    const ratingDistribution = distRows.map((r) => ({ rating: Number(r.rating), count: Number(r.count ?? 0) }));
    const recentRows = await getRowsPg<{ id: number }>('SELECT id FROM research_results ORDER BY created_at DESC LIMIT 20', []);
    return { totalRuns, completedRuns: completedQueries, failedRuns, avgConfidence, avgDurationMs, totalFeedbackCount, avgRating, ratingDistribution, recentResultIds: recentRows.map((r) => r.id) };
  }
  const d = database ?? getDb() as SqlJsDatabase;
  const totalRuns = (getRow<{ n: number }>(d, 'SELECT COUNT(*) as n FROM research_results', [])?.n as number) ?? 0;
  const completedQueries = getRow<{ n: number }>(d, "SELECT COUNT(DISTINCT research_query_id) as n FROM research_results", [])?.n as number ?? 0;
  const failedRuns = (getRow<{ n: number }>(d, "SELECT COUNT(*) as n FROM research_queries WHERE status = 'failed'", [])?.n as number) ?? 0;
  const avgConfRow = getRow<{ avg: number | null }>(d, 'SELECT AVG(confidence) as avg FROM research_results WHERE confidence IS NOT NULL', []);
  const avgConfidence = avgConfRow?.avg != null ? Number(avgConfRow.avg) : null;
  const avgDurRow = getRow<{ avg: number | null }>(d, 'SELECT AVG(duration_ms) as avg FROM research_results WHERE duration_ms IS NOT NULL', []);
  const avgDurationMs = avgDurRow?.avg != null ? Math.round(Number(avgDurRow.avg)) : null;
  const totalFeedbackCount = (getRow<{ n: number }>(d, 'SELECT COUNT(*) as n FROM user_feedback WHERE rating IS NOT NULL', [])?.n as number) ?? 0;
  const avgRatingRow = getRow<{ avg: number | null }>(d, 'SELECT AVG(rating) as avg FROM user_feedback WHERE rating IS NOT NULL', []);
  const avgRating = avgRatingRow?.avg != null ? Math.round(Number(avgRatingRow.avg) * 10) / 10 : null;
  const distRows = getRows<{ rating: number; count: number }>(d, 'SELECT rating as rating, COUNT(*) as count FROM user_feedback WHERE rating IS NOT NULL GROUP BY rating ORDER BY rating', []);
  const ratingDistribution = distRows.map((r) => ({ rating: Number(r.rating), count: Number(r.count) }));
  const recentRows = getRows<{ id: number }>(d, 'SELECT id FROM research_results ORDER BY created_at DESC LIMIT 20', []);
  return { totalRuns, completedRuns: completedQueries, failedRuns, avgConfidence, avgDurationMs, totalFeedbackCount, avgRating, ratingDistribution, recentResultIds: recentRows.map((r) => r.id) };
}

// CLI: tsx server/db.ts init
if (typeof process !== 'undefined' && process.argv?.[2] === 'init') {
  initDb()
    .then(() => {
      console.log(process.env.DATABASE_URL ? 'Database initialized (PostgreSQL)' : 'Database initialized at ' + DEFAULT_DB_PATH);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
