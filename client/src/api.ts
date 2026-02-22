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
