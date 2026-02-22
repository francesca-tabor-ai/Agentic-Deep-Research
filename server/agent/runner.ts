/**
 * Research agent orchestration: multi-step run (retrieve → synthesize → cite → save).
 * Updates query status and persists result + citations to DB.
 */
import type { VaultDocument } from '../db.js';
import {
  getResearchQuery,
  updateResearchQueryStatus,
  listVaultDocuments,
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
  insertResult: (data: { research_query_id: number; content: string | null; summary: string | null }) => ReturnType<typeof insertResearchResult>;
  insertCitationRecord: (data: { research_result_id: number; source_url: string | null; title: string | null; snippet: string | null }) => ReturnType<typeof insertCitation>;
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

/**
 * Multi-step research run: in_progress → retrieve (vault + public) → synthesize → cite → save → completed.
 */
export function runResearch(queryId: number, deps: RunResearchDeps = defaultDeps): RunResearchResult {
  const query = deps.getQuery(queryId);
  if (!query) throw new Error(`Query not found: ${queryId}`);

  deps.updateStatus(queryId, 'in_progress');

  try {
    const vaultDocs = deps.getVaultDocuments();
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

    const result = deps.insertResult({
      research_query_id: queryId,
      content: contentJson,
      summary: synthesis.summary.slice(0, 500),
    });

    for (const c of citationRecords) {
      deps.insertCitationRecord({
        research_result_id: result.id,
        source_url: c.url,
        title: c.title,
        snippet: c.snippet,
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
