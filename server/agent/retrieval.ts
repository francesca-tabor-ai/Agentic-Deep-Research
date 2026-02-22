/**
 * RAG retrieval: vault documents + public sources (mock). Combines and ranks chunks.
 */
import type { VaultDocument } from '../db.js';
import type { RetrievedChunk, RetrievalOptions } from './types.js';

const DEFAULT_VAULT_LIMIT = 20;
const DEFAULT_PUBLIC_LIMIT = 10;
const DEFAULT_MAX_TOTAL = 25;

/** Tokenize for simple keyword overlap (lowercase, split on non-alpha). */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/** Score 0–1: fraction of query terms that appear in doc (title + content). */
function scoreVaultDoc(queryTokens: string[], doc: VaultDocument): number {
  const text = [doc.title, doc.content ?? ''].join(' ').toLowerCase();
  if (!queryTokens.length) return 0;
  let hits = 0;
  for (const t of queryTokens) {
    if (text.includes(t)) hits += 1;
  }
  return hits / queryTokens.length;
}

/**
 * Retrieve from vault: score by keyword overlap, return top N chunks.
 * Each doc becomes one or more chunks (full content as single snippet if short; else split by paragraph).
 */
export function retrieveFromVault(
  query: string,
  vaultDocuments: VaultDocument[],
  limit: number = DEFAULT_VAULT_LIMIT
): RetrievedChunk[] {
  const queryTokens = tokenize(query);
  const scored = vaultDocuments.map((doc) => ({
    doc,
    score: scoreVaultDoc(queryTokens, doc),
  }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);
  const chunks: RetrievedChunk[] = [];
  for (const { doc, score } of top) {
    const content = (doc.content ?? doc.title).trim();
    const snippet = content.slice(0, 2000) || doc.title;
    chunks.push({
      sourceType: 'vault',
      sourceId: `vault:${doc.id}`,
      title: doc.title,
      url: doc.source_url ?? null,
      snippet,
      score,
    });
  }
  return chunks;
}

/**
 * Public sources: mock implementation. Returns placeholder chunks for the query.
 * Replace with Semantic Scholar / API in production.
 */
export function retrieveFromPublicSources(
  query: string,
  limit: number = DEFAULT_PUBLIC_LIMIT
): RetrievedChunk[] {
  const queryNorm = query.slice(0, 80).trim();
  const mockChunks: RetrievedChunk[] = [
    {
      sourceType: 'public',
      sourceId: 'public:mock-1',
      title: 'Literature overview: ' + queryNorm,
      url: 'https://example.com/source1',
      snippet: `Relevant discussion related to "${queryNorm}". This is a placeholder from the public retrieval layer. Multiple studies suggest further investigation.`,
      score: 0.85,
    },
    {
      sourceType: 'public',
      sourceId: 'public:mock-2',
      title: 'Related findings',
      url: 'https://example.com/source2',
      snippet: `Additional context for the query. Placeholder snippet for RAG integration with real APIs (e.g. Semantic Scholar) in a later phase.`,
      score: 0.7,
    },
  ];
  return mockChunks.slice(0, limit);
}

/**
 * Combined retrieval: vault + public, merged and sorted by score, capped at maxTotal.
 */
export function retrieve(
  query: string,
  vaultDocuments: VaultDocument[],
  options: RetrievalOptions = {}
): RetrievedChunk[] {
  const vaultLimit = options.vaultLimit ?? DEFAULT_VAULT_LIMIT;
  const publicLimit = options.publicLimit ?? DEFAULT_PUBLIC_LIMIT;
  const maxTotal = options.maxTotal ?? DEFAULT_MAX_TOTAL;

  const fromVault = retrieveFromVault(query, vaultDocuments, vaultLimit);
  const fromPublic = retrieveFromPublicSources(query, publicLimit);
  const combined = [...fromVault, ...fromPublic].sort((a, b) => b.score - a.score);
  return combined.slice(0, maxTotal);
}
