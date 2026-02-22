import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runResearch } from './runner.js';
import type { RunResearchDeps } from './runner.js';
import type { ResearchQuery, VaultDocument, ResearchResult } from '../db.js';

describe('runner', () => {
  const mockQuery: ResearchQuery = {
    id: 1,
    query_text: 'What is agentic AI?',
    status: 'pending',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const mockVaultDocs: VaultDocument[] = [
    {
      id: 1,
      title: 'AI overview',
      content: 'Agentic AI and autonomous systems.',
      source_url: 'https://example.com',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ];

  let deps: RunResearchDeps;
  let statusUpdates: Array<'in_progress' | 'completed' | 'failed'>;
  let insertedResults: Array<{ research_query_id: number; content: string | null; summary: string | null }>;
  let insertedCitations: Array<{ research_result_id: number; source_url: string | null; title: string | null; snippet: string | null }>;

  beforeEach(() => {
    statusUpdates = [];
    insertedResults = [];
    insertedCitations = [];
    deps = {
      getQuery: vi.fn().mockResolvedValue(mockQuery),
      updateStatus: vi.fn().mockImplementation((_id: number, status: 'in_progress' | 'completed' | 'failed') => {
        statusUpdates.push(status);
        return Promise.resolve(null);
      }),
      getVaultDocuments: vi.fn().mockResolvedValue(mockVaultDocs),
      insertResult: vi.fn().mockImplementation((data) => {
        insertedResults.push(data);
        return Promise.resolve({
          id: insertedResults.length,
          research_query_id: data.research_query_id,
          content: data.content,
          summary: data.summary,
          created_at: new Date().toISOString(),
        } as ResearchResult);
      }),
      insertCitationRecord: vi.fn().mockImplementation((data) => {
        insertedCitations.push(data);
        return Promise.resolve({} as never);
      }),
    };
  });

  it('updates status to in_progress then completed on success', async () => {
    await runResearch(1, deps);
    expect(statusUpdates).toContain('in_progress');
    expect(statusUpdates).toContain('completed');
    expect(statusUpdates).not.toContain('failed');
  });

  it('returns researchResultId, summary, confidence, citationCount', async () => {
    const result = await runResearch(1, deps);
    expect(result.researchResultId).toBe(1);
    expect(result.summary).toBeDefined();
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.citationCount).toBeGreaterThanOrEqual(0);
  });

  it('inserts one research result with JSON content and summary', async () => {
    await runResearch(1, deps);
    expect(insertedResults.length).toBe(1);
    expect(insertedResults[0].research_query_id).toBe(1);
    expect(insertedResults[0].summary).toBeDefined();
    const content = JSON.parse(insertedResults[0].content ?? '{}');
    expect(content.summary).toBeDefined();
    expect(content.confidence).toBeDefined();
    expect(content.sections).toBeDefined();
    expect(content.query).toBe(mockQuery.query_text);
  });

  it('inserts citation records for used sources', async () => {
    await runResearch(1, deps);
    expect(insertedCitations.length).toBeGreaterThan(0);
    expect(insertedCitations.every((c) => c.research_result_id === 1)).toBe(true);
  });

  it('throws and sets status to failed when query not found', async () => {
    deps.getQuery = vi.fn().mockResolvedValue(null);
    await expect(runResearch(999, deps)).rejects.toThrow('Query not found');
    expect(statusUpdates).toContain('failed');
  });

  it('throws and sets status to failed when insertResult throws', async () => {
    deps.insertResult = vi.fn().mockRejectedValue(new Error('DB error'));
    await expect(runResearch(1, deps)).rejects.toThrow('DB error');
    expect(statusUpdates).toContain('failed');
  });
});
