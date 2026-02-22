/**
 * Synthesis engine: multi-document analysis and summary with citation grounding.
 * Produces sections with source refs and a confidence score.
 */
import type { RetrievedChunk } from './types.js';
import type { SynthesisOutput, SynthesisSection } from './types.js';

/** Build a short summary from the query and number of sources. */
function buildSummary(query: string, chunks: RetrievedChunk[]): string {
  const sourceCount = new Set(chunks.map((c) => c.sourceId)).size;
  return `Summary for: "${query.slice(0, 100)}${query.length > 100 ? '...' : ''}". Synthesized from ${chunks.length} chunk(s) across ${sourceCount} source(s).`;
}

/** Group chunks by source and produce sections with grounded source IDs. */
function buildSections(chunks: RetrievedChunk[]): SynthesisSection[] {
  const bySource = new Map<string, RetrievedChunk[]>();
  for (const c of chunks) {
    const list = bySource.get(c.sourceId) ?? [];
    list.push(c);
    bySource.set(c.sourceId, list);
  }
  const sections: SynthesisSection[] = [];
  let i = 0;
  for (const [, list] of bySource) {
    const heading = list[0].title || `Source ${i + 1}`;
    const text = list.map((c) => c.snippet).join('\n\n').slice(0, 3000);
    sections.push({
      heading,
      text,
      sourceIds: list.map((c) => c.sourceId),
    });
    i += 1;
  }
  return sections;
}

/**
 * Confidence score 0–1: based on number of sources, coverage, and relevance.
 * - Base 0.3, plus up to 0.4 for source count, up to 0.3 for avg relevance.
 */
export function computeConfidence(chunks: RetrievedChunk[]): number {
  if (chunks.length === 0) return 0;
  const uniqueSources = new Set(chunks.map((c) => c.sourceId)).size;
  const sourceFactor = Math.min(1, uniqueSources / 5) * 0.4; // cap at 5 sources
  const avgScore = chunks.reduce((a, c) => a + c.score, 0) / chunks.length;
  const relevanceFactor = avgScore * 0.3;
  const base = 0.3;
  return Math.min(1, Math.max(0, base + sourceFactor + relevanceFactor));
}

/**
 * Synthesize query + retrieved chunks into a structured report with sections and confidence.
 */
export function synthesize(query: string, chunks: RetrievedChunk[]): SynthesisOutput {
  const summary = buildSummary(query, chunks);
  const sections = buildSections(chunks);
  const confidence = computeConfidence(chunks);
  return { summary, sections, confidence };
}

/**
 * Extract citation records from synthesis output and chunks (for DB insert).
 * Deduplicates by sourceId; returns one citation per unique source used in sections.
 */
export function extractCitations(
  chunks: RetrievedChunk[],
  sectionSourceIds: string[]
): Array<{ sourceId: string; title: string; url: string | null; snippet: string }> {
  const usedIds = new Set(sectionSourceIds);
  const byId = new Map<string, RetrievedChunk>();
  for (const c of chunks) {
    if (usedIds.has(c.sourceId)) byId.set(c.sourceId, c);
  }
  return Array.from(byId.entries()).map(([, c]) => ({
    sourceId: c.sourceId,
    title: c.title,
    url: c.url,
    snippet: c.snippet.slice(0, 1000),
  }));
}
