import initSqlJs, { SqlJsStatic } from 'sql.js';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'research.db');

export type ResearchQueryStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface ResearchQuery {
  id: number;
  query_text: string;
  status: ResearchQueryStatus;
  created_at: string;
  updated_at: string;
}

export interface ResearchQueryInsert {
  query_text: string;
  status?: ResearchQueryStatus;
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
}

export interface ResearchResultInsert {
  research_query_id: number;
  content?: string | null;
  summary?: string | null;
}

export interface Citation {
  id: number;
  research_result_id: number;
  source_url: string | null;
  title: string | null;
  snippet: string | null;
  created_at: string;
}

export interface CitationInsert {
  research_result_id: number;
  source_url?: string | null;
  title?: string | null;
  snippet?: string | null;
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
 */
export async function initDb(dbPathArg: string = DEFAULT_DB_PATH): Promise<SqlJsDatabase> {
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
  dbPath = dbPathArg;
  return db;
}

/**
 * Get the current database instance. Call initDb() first (e.g. at app startup).
 */
export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

/**
 * Close the database and, if using a file path, persist to disk.
 */
export function closeDb(): void {
  if (db && dbPath && dbPath !== ':memory:') {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
  if (db) {
    db.close();
  }
  db = null;
  dbPath = null;
}

// ---------- research_queries ----------

export function insertResearchQuery(
  data: ResearchQueryInsert,
  database?: SqlJsDatabase
): ResearchQuery {
  const d = database ?? getDb();
  const status = data.status ?? 'pending';
  const id = runAndGetLastId(
    d,
    'INSERT INTO research_queries (query_text, status) VALUES (?, ?)',
    [data.query_text, status]
  );
  return getResearchQuery(id, d)!;
}

export function getResearchQuery(
  id: number,
  database?: SqlJsDatabase
): ResearchQuery | null {
  const d = database ?? getDb();
  return getRow<ResearchQuery>(d, 'SELECT * FROM research_queries WHERE id = ?', [id]);
}

export function listResearchQueries(
  opts?: { status?: ResearchQueryStatus; limit?: number },
  database?: SqlJsDatabase
): ResearchQuery[] {
  const d = database ?? getDb();
  let sql = 'SELECT * FROM research_queries';
  const params: (string | number)[] = [];
  if (opts?.status) {
    sql += ' WHERE status = ?';
    params.push(opts.status);
  }
  sql += ' ORDER BY created_at DESC';
  if (opts?.limit) {
    sql += ' LIMIT ?';
    params.push(opts.limit);
  }
  return getRows<ResearchQuery>(d, sql, params);
}

export function updateResearchQueryStatus(
  id: number,
  status: ResearchQueryStatus,
  database?: SqlJsDatabase
): ResearchQuery | null {
  const d = database ?? getDb();
  d.run(
    "UPDATE research_queries SET status = ?, updated_at = datetime('now') WHERE id = ?",
    [status, id]
  );
  return getResearchQuery(id, d);
}

// ---------- vault_documents ----------

export function insertVaultDocument(
  data: VaultDocumentInsert,
  database?: SqlJsDatabase
): VaultDocument {
  const d = database ?? getDb();
  const id = runAndGetLastId(
    d,
    'INSERT INTO vault_documents (title, content, source_url) VALUES (?, ?, ?)',
    [data.title, data.content ?? null, data.source_url ?? null]
  );
  return getVaultDocument(id, d)!;
}

export function getVaultDocument(
  id: number,
  database?: SqlJsDatabase
): VaultDocument | null {
  const d = database ?? getDb();
  return getRow<VaultDocument>(d, 'SELECT * FROM vault_documents WHERE id = ?', [id]);
}

export function listVaultDocuments(
  limit?: number,
  database?: SqlJsDatabase
): VaultDocument[] {
  const d = database ?? getDb();
  const sql = limit
    ? 'SELECT * FROM vault_documents ORDER BY created_at DESC LIMIT ?'
    : 'SELECT * FROM vault_documents ORDER BY created_at DESC';
  return limit ? getRows<VaultDocument>(d, sql, [limit]) : getRows<VaultDocument>(d, sql);
}

export function deleteVaultDocument(
  id: number,
  database?: SqlJsDatabase
): boolean {
  const d = database ?? getDb();
  const n = runAndGetChanges(d, 'DELETE FROM vault_documents WHERE id = ?', [id]);
  return n > 0;
}

// ---------- research_results ----------

export function insertResearchResult(
  data: ResearchResultInsert,
  database?: SqlJsDatabase
): ResearchResult {
  const d = database ?? getDb();
  const id = runAndGetLastId(
    d,
    'INSERT INTO research_results (research_query_id, content, summary) VALUES (?, ?, ?)',
    [data.research_query_id, data.content ?? null, data.summary ?? null]
  );
  return getResearchResult(id, d)!;
}

export function getResearchResult(
  id: number,
  database?: SqlJsDatabase
): ResearchResult | null {
  const d = database ?? getDb();
  return getRow<ResearchResult>(d, 'SELECT * FROM research_results WHERE id = ?', [id]);
}

export function listResearchResultsByQueryId(
  researchQueryId: number,
  database?: SqlJsDatabase
): ResearchResult[] {
  const d = database ?? getDb();
  return getRows<ResearchResult>(
    d,
    'SELECT * FROM research_results WHERE research_query_id = ? ORDER BY created_at DESC',
    [researchQueryId]
  );
}

// ---------- citations ----------

export function insertCitation(
  data: CitationInsert,
  database?: SqlJsDatabase
): Citation {
  const d = database ?? getDb();
  const id = runAndGetLastId(
    d,
    'INSERT INTO citations (research_result_id, source_url, title, snippet) VALUES (?, ?, ?, ?)',
    [
      data.research_result_id,
      data.source_url ?? null,
      data.title ?? null,
      data.snippet ?? null,
    ]
  );
  return getCitation(id, d)!;
}

export function getCitation(
  id: number,
  database?: SqlJsDatabase
): Citation | null {
  const d = database ?? getDb();
  return getRow<Citation>(d, 'SELECT * FROM citations WHERE id = ?', [id]);
}

export function listCitationsByResultId(
  researchResultId: number,
  database?: SqlJsDatabase
): Citation[] {
  const d = database ?? getDb();
  return getRows<Citation>(
    d,
    'SELECT * FROM citations WHERE research_result_id = ? ORDER BY created_at',
    [researchResultId]
  );
}

// ---------- user_feedback ----------

export function insertUserFeedback(
  data: UserFeedbackInsert,
  database?: SqlJsDatabase
): UserFeedback {
  const d = database ?? getDb();
  if (data.research_result_id == null && data.research_query_id == null) {
    throw new Error('Either research_result_id or research_query_id must be set');
  }
  const id = runAndGetLastId(
    d,
    'INSERT INTO user_feedback (research_result_id, research_query_id, rating, feedback_text) VALUES (?, ?, ?, ?)',
    [
      data.research_result_id ?? null,
      data.research_query_id ?? null,
      data.rating ?? null,
      data.feedback_text ?? null,
    ]
  );
  return getUserFeedback(id, d)!;
}

export function getUserFeedback(
  id: number,
  database?: SqlJsDatabase
): UserFeedback | null {
  const d = database ?? getDb();
  return getRow<UserFeedback>(d, 'SELECT * FROM user_feedback WHERE id = ?', [id]);
}

export function listUserFeedbackByResultId(
  researchResultId: number,
  database?: SqlJsDatabase
): UserFeedback[] {
  const d = database ?? getDb();
  return getRows<UserFeedback>(
    d,
    'SELECT * FROM user_feedback WHERE research_result_id = ? ORDER BY created_at DESC',
    [researchResultId]
  );
}

export function listUserFeedbackByQueryId(
  researchQueryId: number,
  database?: SqlJsDatabase
): UserFeedback[] {
  const d = database ?? getDb();
  return getRows<UserFeedback>(
    d,
    'SELECT * FROM user_feedback WHERE research_query_id = ? ORDER BY created_at DESC',
    [researchQueryId]
  );
}

// CLI: tsx server/db.ts init
if (typeof process !== 'undefined' && process.argv?.[2] === 'init') {
  initDb()
    .then(() => {
      console.log('Database initialized at', DEFAULT_DB_PATH);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
