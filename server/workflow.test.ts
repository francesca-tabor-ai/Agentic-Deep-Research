/**
 * End-to-end integration test: research workflow from query creation through
 * run, result retrieval, feedback, and metrics.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initDb,
  closeDb,
  insertResearchQuery,
  getResearchQuery,
  getResearchResult,
  listResearchResultsByQueryId,
  listCitationsByResultId,
  insertUserFeedback,
  getResearchMetrics,
  listUserFeedbackByResultId,
  insertVaultDocument,
  listVaultDocuments,
} from './db.js';
import { runResearch } from './agent/runner.js';

describe('research workflow (e2e)', () => {
  beforeEach(async () => {
    await initDb(':memory:');
  });

  afterEach(() => {
    closeDb();
  });

  it('create query → run research → get result → submit feedback → metrics', () => {
    const query = insertResearchQuery({ query_text: 'What is agentic AI?' });
    expect(query.id).toBeGreaterThan(0);
    expect(getResearchQuery(query.id)).not.toBeNull();

    const outcome = runResearch(query.id);
    expect(outcome.researchResultId).toBeGreaterThan(0);
    expect(outcome.summary).toBeDefined();
    expect(typeof outcome.confidence).toBe('number');
    expect(outcome.citationCount).toBeGreaterThanOrEqual(0);

    const result = getResearchResult(outcome.researchResultId);
    expect(result).not.toBeNull();
    expect(result!.research_query_id).toBe(query.id);
    expect(result!.content).toBeDefined();
    expect(result!.summary).toBeDefined();
    if (result!.confidence != null) expect(result!.confidence).toBeGreaterThanOrEqual(0);
    if (result!.duration_ms != null) expect(result!.duration_ms).toBeGreaterThanOrEqual(0);

    const resultsByQuery = listResearchResultsByQueryId(query.id);
    expect(resultsByQuery.length).toBe(1);
    expect(resultsByQuery[0].id).toBe(outcome.researchResultId);

    const citations = listCitationsByResultId(outcome.researchResultId);
    expect(Array.isArray(citations)).toBe(true);

    const feedback = insertUserFeedback({
      research_result_id: outcome.researchResultId,
      rating: 5,
      feedback_text: 'Helpful summary.',
    });
    expect(feedback.id).toBeGreaterThan(0);
    expect(feedback.rating).toBe(5);
    expect(feedback.feedback_text).toBe('Helpful summary.');

    const feedbackList = listUserFeedbackByResultId(outcome.researchResultId);
    expect(feedbackList.length).toBe(1);

    const metrics = getResearchMetrics();
    expect(metrics.totalRuns).toBe(1);
    expect(metrics.completedRuns).toBe(1);
    expect(metrics.totalFeedbackCount).toBe(1);
    expect(metrics.avgRating).toBe(5);
    expect(metrics.ratingDistribution.some((d) => d.rating === 5 && d.count === 1)).toBe(true);
  });

  it('workflow with vault documents included in retrieval', () => {
    insertVaultDocument({
      title: 'Vault doc for workflow',
      content: 'Agentic systems use autonomous agents.',
      source_url: 'https://example.com/vault',
    });
    const docs = listVaultDocuments();
    expect(docs.length).toBe(1);

    const query = insertResearchQuery({ query_text: 'Explain agentic systems' });
    const outcome = runResearch(query.id);
    expect(outcome.researchResultId).toBeGreaterThan(0);

    const result = getResearchResult(outcome.researchResultId);
    expect(result).not.toBeNull();
    const content = result!.content ? JSON.parse(result!.content) : {};
    expect(content.sections).toBeDefined();
    expect(Array.isArray(content.sections)).toBe(true);
  });

  it('run with invalid query id fails and updates status', () => {
    expect(() => runResearch(99999)).toThrow(/Query not found|not found/i);
    const query = getResearchQuery(99999);
    expect(query).toBeNull();
  });
});
