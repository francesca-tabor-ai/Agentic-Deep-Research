const BASE = '/api';

export interface ResearchQuery {
  id: number;
  query_text: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  saved_at: string | null;
  parent_query_id: number | null;
}

export interface VaultDocument {
  id: number;
  title: string;
  content: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchQueriesOpts {
  limit?: number;
  status?: string;
  saved?: boolean;
  parent_query_id?: number;
}

export async function fetchQueries(limitOrOpts: number | FetchQueriesOpts = 50): Promise<ResearchQuery[]> {
  const opts = typeof limitOrOpts === 'number' ? { limit: limitOrOpts } : limitOrOpts;
  const limit = opts.limit ?? 50;
  const url = new URL(`${BASE}/queries`);
  url.searchParams.set('limit', String(limit));
  if (opts.status) url.searchParams.set('status', opts.status);
  if (opts.saved === true) url.searchParams.set('saved', 'true');
  if (opts.parent_query_id != null) url.searchParams.set('parent_query_id', String(opts.parent_query_id));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchQuery(id: number): Promise<ResearchQuery> {
  const res = await fetch(`${BASE}/queries/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createQuery(params: {
  query_text: string;
  status?: string;
  parent_query_id?: number | null;
}): Promise<ResearchQuery> {
  const { query_text, status, parent_query_id } = params;
  const res = await fetch(`${BASE}/queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_text, status, parent_query_id: parent_query_id ?? undefined }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateQuerySaved(id: number, saved: boolean): Promise<{ id: number; saved: boolean }> {
  const res = await fetch(`${BASE}/queries/${id}/saved`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saved }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchRelatedQueries(queryId: number): Promise<ResearchQuery[]> {
  const res = await fetch(`${BASE}/queries/${queryId}/related`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchVaultDocuments(limit?: number): Promise<VaultDocument[]> {
  const url = new URL(`${BASE}/vault/documents`);
  if (limit != null) url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchVaultDocuments(query: string, limit = 50): Promise<VaultDocument[]> {
  const url = new URL(`${BASE}/vault/documents`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createVaultDocument(params: {
  title: string;
  content?: string | null;
  source_url?: string | null;
}): Promise<VaultDocument> {
  const res = await fetch(`${BASE}/vault/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteVaultDocument(id: number): Promise<void> {
  const res = await fetch(`${BASE}/vault/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

// ---------- Research agent (Phase 3) ----------

export interface ResearchResult {
  id: number;
  research_query_id: number;
  content: string | null;
  summary: string | null;
  created_at: string;
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

/** Parsed report content from result.content (JSON). */
export interface ResearchReportContent {
  summary: string;
  sections: Array<{ heading: string; text: string; sourceIds: string[] }>;
  confidence: number;
  query: string;
  consensus?: string[];
  disagreements?: string[];
  researchGaps?: string[];
}

export interface RunResearchOutcome {
  researchResultId: number;
  summary: string;
  confidence: number;
  citationCount: number;
}

export async function runQueryResearch(
  queryId: number,
  options?: { vaultDocIds?: number[] }
): Promise<RunResearchOutcome> {
  const res = await fetch(`${BASE}/queries/${queryId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options ?? {}),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchQueryResults(queryId: number): Promise<ResearchResult[]> {
  const res = await fetch(`${BASE}/queries/${queryId}/results`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchResult(resultId: number): Promise<{
  result: ResearchResult;
  citations: Citation[];
}> {
  const res = await fetch(`${BASE}/results/${resultId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------- Document annotations ----------

export interface DocumentAnnotation {
  id: number;
  vault_document_id: number;
  note: string;
  created_at: string;
}

export async function fetchDocumentAnnotations(vaultDocumentId: number): Promise<DocumentAnnotation[]> {
  const res = await fetch(`${BASE}/vault/documents/${vaultDocumentId}/annotations`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createDocumentAnnotation(
  vaultDocumentId: number,
  note: string
): Promise<DocumentAnnotation> {
  const res = await fetch(`${BASE}/vault/documents/${vaultDocumentId}/annotations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteDocumentAnnotation(
  vaultDocumentId: number,
  annotationId: number
): Promise<void> {
  const res = await fetch(`${BASE}/vault/documents/${vaultDocumentId}/annotations/${annotationId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
}
