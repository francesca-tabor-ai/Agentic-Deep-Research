/**
 * Phase 3: Research Agent – shared types for RAG, synthesis, and orchestration.
 */

export type SourceType = 'vault' | 'public';

/** A retrieved text chunk with provenance and relevance score. */
export interface RetrievedChunk {
  sourceType: SourceType;
  sourceId: string;
  title: string;
  url: string | null;
  snippet: string;
  score: number;
}

/** One section of the synthesized report with grounded source refs. */
export interface SynthesisSection {
  heading: string;
  text: string;
  sourceIds: string[];
}

/** Output of the synthesis engine: summary, sections, and confidence. */
export interface SynthesisOutput {
  summary: string;
  sections: SynthesisSection[];
  confidence: number;
}

/** Full report content stored in research_results.content (JSON). */
export interface ResearchReportContent {
  summary: string;
  sections: SynthesisSection[];
  confidence: number;
  query: string;
}

/** Options for retrieval (vault + public limits). */
export interface RetrievalOptions {
  vaultLimit?: number;
  publicLimit?: number;
  maxTotal?: number;
}
