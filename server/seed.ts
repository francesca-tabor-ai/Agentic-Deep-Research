/**
 * Seed the database with sample data. Run after db:init.
 * Usage: npm run db:seed (or tsx server/seed.ts)
 */
import {
  initDb,
  closeDb,
  DEFAULT_DB_PATH,
  insertResearchQuery,
  updateResearchQuerySaved,
  insertVaultDocument,
  insertResearchResult,
  insertCitation,
  insertUserFeedback,
  insertDocumentAnnotation,
} from './db.js';

async function seed() {
  const dbPath = process.env.DATABASE_PATH || process.env.DB_PATH || DEFAULT_DB_PATH;
  await initDb(dbPath);

  console.log('Seeding database...');

  // Research queries (mix of completed, one pending)
  const q1 = await insertResearchQuery({
    query_text: 'What are the main benefits of agentic AI for research workflows?',
    status: 'completed',
  });
  await updateResearchQuerySaved(q1.id, true);

  const q2 = await insertResearchQuery({
    query_text: 'Compare retrieval-augmented generation (RAG) vs fine-tuning for knowledge grounding.',
    status: 'completed',
  });

  const q3 = await insertResearchQuery({
    query_text: 'Best practices for citation and source attribution in AI-generated reports.',
    status: 'pending',
  });

  // Vault documents
  const v1 = await insertVaultDocument({
    title: 'Internal research guidelines 2024',
    content: 'All external claims must be backed by at least one primary source. Use the vault for sensitive or proprietary context. Confidence scores should be shown for every synthesis.',
    source_url: null,
  });
  const v2 = await insertVaultDocument({
    title: 'RAG architecture notes',
    content: 'Chunk size 512 tokens, overlap 64. Embedding model: text-embedding-3-small. Retriever returns top 10; re-ranker optional.',
    source_url: 'https://example.com/rag-notes',
  });

  // Research results (for completed queries)
  const r1 = await insertResearchResult({
    research_query_id: q1.id,
    content: 'Agentic AI improves research by breaking work into steps (retrieve, synthesize, cite), allowing human-in-the-loop checks, and keeping a clear audit trail. Benefits include traceability, confidence scoring, and the ability to refine queries iteratively.',
    summary: 'Agentic research workflows offer traceability, confidence scores, and iterative refinement.',
    confidence: 0.88,
    duration_ms: 12400,
    reasoning_snapshot: 'Synthesized from 3 vault docs and 2 external sources.',
  });
  await insertCitation({
    research_result_id: r1.id,
    source_url: 'https://example.com/agentic-ai-overview',
    title: 'Agentic AI for Research',
    snippet: 'Step-by-step decomposition enables verification at each stage.',
    source_id: 'doc-1',
  });
  await insertCitation({
    research_result_id: r1.id,
    source_url: null,
    title: 'Internal research guidelines 2024',
    snippet: 'Confidence scores should be shown for every synthesis.',
    source_id: `vault-${v1.id}`,
  });

  const r2 = await insertResearchResult({
    research_query_id: q2.id,
    content: 'RAG retrieves relevant passages at query time and conditions the LLM on them; fine-tuning updates model weights on a dataset. RAG is faster to adapt and keeps sources explicit; fine-tuning can capture nuanced patterns but risks forgetting and opacity.',
    summary: 'RAG favors adaptability and transparency; fine-tuning favors learned nuance with higher cost and opacity.',
    confidence: 0.82,
    duration_ms: 9800,
  });
  await insertCitation({
    research_result_id: r2.id,
    source_url: 'https://arxiv.org/abs/example-rag',
    title: 'RAG vs Fine-tuning',
    snippet: 'Retrieval-augmented generation preserves source attribution.',
    source_id: 'arxiv-1',
  });

  // User feedback
  await insertUserFeedback({
    research_result_id: r1.id,
    rating: 5,
    feedback_text: 'Very clear and well cited.',
  });
  await insertUserFeedback({
    research_result_id: r2.id,
    rating: 4,
    feedback_text: null,
  });

  // Document annotations (on vault docs)
  await insertDocumentAnnotation(v1.id, 'Review chunk sizes for next quarter.');
  await insertDocumentAnnotation(v2.id, 'Consider adding re-ranker to pipeline.');

  console.log('Seed complete.');
  console.log('  Queries:', 3, '| Vault docs:', 2, '| Results:', 2, '| Citations:', 3, '| Feedback:', 2, '| Annotations:', 2);
  await closeDb();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
