const BASE = '/api';

export interface ResearchQuery {
  id: number;
  query_text: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface VaultDocument {
  id: number;
  title: string;
  content: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchQueries(limit = 50, status?: string): Promise<ResearchQuery[]> {
  const url = new URL(`${BASE}/queries`);
  url.searchParams.set('limit', String(limit));
  if (status) url.searchParams.set('status', status);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchQuery(id: number): Promise<ResearchQuery> {
  const res = await fetch(`${BASE}/queries/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createQuery(query_text: string, status?: string): Promise<ResearchQuery> {
  const res = await fetch(`${BASE}/queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_text, status }),
  });
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

export async function runQueryResearch(queryId: number): Promise<RunResearchOutcome> {
  const res = await fetch(`${BASE}/queries/${queryId}/run`, { method: 'POST' });
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
