/**
 * Research agent orchestration: multi-step run (retrieve → synthesize → cite → save).
 * Updates query status and persists result + citations to DB.
 */
import type { VaultDocument } from '../db.js';
import {
  getResearchQuery,
  updateResearchQueryStatus,
  listVaultDocuments,
  getVaultDocumentsByIds,
  insertResearchResult,
  insertCitation,
} from '../db.js';
import { retrieve } from './retrieval.js';
import { synthesize, extractCitations } from './synthesis.js';
import type { ResearchReportContent, SynthesisOutput } from './types.js';

export interface RunResearchDeps {
  getQuery: (id: number) => ReturnType<typeof getResearchQuery>;
  updateStatus: (id: number, status: 'in_progress' | 'completed' | 'failed') => ReturnType<typeof updateResearchQueryStatus>;
  getVaultDocuments: () => VaultDocument[];
  insertResult: (data: {
    research_query_id: number;
    content: string | null;
    summary: string | null;
    confidence?: number | null;
    duration_ms?: number | null;
    reasoning_snapshot?: string | null;
  }) => ReturnType<typeof insertResearchResult>;
  insertCitationRecord: (data: { research_result_id: number; source_url: string | null; title: string | null; snippet: string | null; source_id?: string | null }) => ReturnType<typeof insertCitation>;
}

const defaultDeps: RunResearchDeps = {
  getQuery: getResearchQuery,
  updateStatus: updateResearchQueryStatus,
  getVaultDocuments: () => listVaultDocuments(),
  insertResult: insertResearchResult,
  insertCitationRecord: insertCitation,
};

export interface RunResearchResult {
  researchResultId: number;
  summary: string;
  confidence: number;
  citationCount: number;
}

export interface RunResearchOptions {
  /** When set, only these vault document IDs are used (workspace-aware). */
  vaultDocIds?: number[];
}

/**
 * Multi-step research run: in_progress → retrieve (vault + public) → synthesize → cite → save → completed.
 * Options.vaultDocIds restricts retrieval to specific vault docs (workspace-aware).
 */
export function runResearch(
  queryId: number,
  deps: RunResearchDeps = defaultDeps,
  options?: RunResearchOptions
): RunResearchResult {
  const query = deps.getQuery(queryId);
  if (!query) {
    deps.updateStatus(queryId, 'failed');
    throw new Error(`Query not found: ${queryId}`);
  }

  deps.updateStatus(queryId, 'in_progress');

  const startMs = Date.now();

  try {
    const vaultDocs =
      options?.vaultDocIds?.length &&
      options.vaultDocIds.length > 0
        ? getVaultDocumentsByIds(options.vaultDocIds)
        : deps.getVaultDocuments();
    const chunks = retrieve(query.query_text, vaultDocs);

    const synthesis: SynthesisOutput = synthesize(query.query_text, chunks);
    const allSourceIds = synthesis.sections.flatMap((s) => s.sourceIds);
    const citationRecords = extractCitations(chunks, allSourceIds);

    const reportContent: ResearchReportContent = {
      summary: synthesis.summary,
      sections: synthesis.sections,
      confidence: synthesis.confidence,
      query: query.query_text,
    };
    const contentJson = JSON.stringify(reportContent);

    const durationMs = Date.now() - startMs;
    const vaultCount = new Set(chunks.filter((c) => c.sourceType === 'vault').map((c) => c.sourceId)).size;
    const publicCount = new Set(chunks.filter((c) => c.sourceType === 'public').map((c) => c.sourceId)).size;
    const reasoningSnapshot = JSON.stringify({
      steps: ['retrieval', 'synthesis', 'cite'],
      chunk_count: chunks.length,
      section_count: synthesis.sections.length,
      source_count: citationRecords.length,
      vault_sources: vaultCount,
      public_sources: publicCount,
      source_ids: [...new Set(allSourceIds)].slice(0, 50),
    });

    const result = deps.insertResult({
      research_query_id: queryId,
      content: contentJson,
      summary: synthesis.summary.slice(0, 500),
      confidence: synthesis.confidence,
      duration_ms: durationMs,
      reasoning_snapshot: reasoningSnapshot,
    });

    for (const c of citationRecords) {
      deps.insertCitationRecord({
        research_result_id: result.id,
        source_url: c.url,
        title: c.title,
        snippet: c.snippet,
        source_id: c.sourceId,
      });
    }

    deps.updateStatus(queryId, 'completed');

    return {
      researchResultId: result.id,
      summary: synthesis.summary,
      confidence: synthesis.confidence,
      citationCount: citationRecords.length,
    };
  } catch (err) {
    deps.updateStatus(queryId, 'failed');
    throw err;
  }
}
