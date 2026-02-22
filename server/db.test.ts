import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initDb,
  getDb,
  closeDb,
  insertResearchQuery,
  getResearchQuery,
  listResearchQueries,
  updateResearchQueryStatus,
  insertVaultDocument,
  getVaultDocument,
  listVaultDocuments,
  deleteVaultDocument,
  insertResearchResult,
  getResearchResult,
  listResearchResultsByQueryId,
  insertCitation,
  getCitation,
  listCitationsByResultId,
  insertUserFeedback,
  getUserFeedback,
  listUserFeedbackByResultId,
  listUserFeedbackByQueryId,
} from './db.js';

describe('database', () => {
  beforeEach(async () => {
    closeDb();
    await initDb(':memory:');
  });

  afterEach(async () => {
    await closeDb();
  });

  describe('init and connection', () => {
    it('creates schema and returns db instance', () => {
      const database = getDb();
      expect(database).toBeDefined();
      if ('exec' in database) {
        const res = database.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        const names = (res[0]?.values ?? []).map((row) => row[0]) as string[];
        expect(names).toContain('research_queries');
        expect(names).toContain('vault_documents');
        expect(names).toContain('research_results');
        expect(names).toContain('citations');
        expect(names).toContain('user_feedback');
      }
    });

    it('getDb returns same instance after init', () => {
      const first = getDb();
      const second = getDb();
      expect(second).toBe(first);
    });
  });

  describe('research_queries', () => {
    it('inserts and retrieves a research query', async () => {
      const inserted = await insertResearchQuery({ query_text: 'What is agentic AI?' });
      expect(inserted.id).toBeGreaterThan(0);
      expect(inserted.query_text).toBe('What is agentic AI?');
      expect(inserted.status).toBe('pending');
      expect(inserted.created_at).toBeDefined();
      expect(inserted.updated_at).toBeDefined();

      const found = await getResearchQuery(inserted.id);
      expect(found).not.toBeNull();
      expect(found!.query_text).toBe(inserted.query_text);
    });

    it('defaults status to pending', async () => {
      const q = await insertResearchQuery({ query_text: 'Test' });
      expect(q.status).toBe('pending');
    });

    it('accepts explicit status', async () => {
      const q = await insertResearchQuery({ query_text: 'Test', status: 'in_progress' });
      expect(q.status).toBe('in_progress');
    });

    it('returns null for missing id', async () => {
      expect(await getResearchQuery(99999)).toBeNull();
    });

    it('lists queries ordered by created_at desc', async () => {
      await insertResearchQuery({ query_text: 'First' });
      await insertResearchQuery({ query_text: 'Second' });
      const list = await listResearchQueries();
      expect(list.length).toBeGreaterThanOrEqual(2);
      const texts = list.map((q) => q.query_text);
      expect(texts).toContain('First');
      expect(texts).toContain('Second');
    });

    it('filters list by status', async () => {
      await insertResearchQuery({ query_text: 'A', status: 'pending' });
      await insertResearchQuery({ query_text: 'B', status: 'completed' });
      await insertResearchQuery({ query_text: 'C', status: 'completed' });
      const list = await listResearchQueries({ status: 'completed' });
      expect(list.every((q) => q.status === 'completed')).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('limits list results', async () => {
      await insertResearchQuery({ query_text: '1' });
      await insertResearchQuery({ query_text: '2' });
      await insertResearchQuery({ query_text: '3' });
      const list = await listResearchQueries({ limit: 2 });
      expect(list.length).toBe(2);
    });

    it('updates research query status', async () => {
      const q = await insertResearchQuery({ query_text: 'Update me' });
      const updated = await updateResearchQueryStatus(q.id, 'completed');
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('completed');
      expect((await getResearchQuery(q.id))!.status).toBe('completed');
    });
  });

  describe('vault_documents', () => {
    it('inserts and retrieves a vault document', async () => {
      const inserted = await insertVaultDocument({
        title: 'Doc 1',
        content: 'Some content',
        source_url: 'https://example.com',
      });
      expect(inserted.id).toBeGreaterThan(0);
      expect(inserted.title).toBe('Doc 1');
      expect(inserted.content).toBe('Some content');
      expect(inserted.source_url).toBe('https://example.com');

      const found = await getVaultDocument(inserted.id);
      expect(found).not.toBeNull();
      expect(found!.title).toBe(inserted.title);
    });

    it('allows null content and source_url', async () => {
      const doc = await insertVaultDocument({ title: 'Minimal' });
      expect(doc.content).toBeNull();
      expect(doc.source_url).toBeNull();
    });

    it('returns null for missing id', async () => {
      expect(await getVaultDocument(99999)).toBeNull();
    });

    it('lists vault documents', async () => {
      await insertVaultDocument({ title: 'A' });
      await insertVaultDocument({ title: 'B' });
      const list = await listVaultDocuments();
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('listVaultDocuments respects limit', async () => {
      await insertVaultDocument({ title: '1' });
      await insertVaultDocument({ title: '2' });
      await insertVaultDocument({ title: '3' });
      const list = await listVaultDocuments(2);
      expect(list.length).toBe(2);
    });

    it('deletes vault document', async () => {
      const doc = await insertVaultDocument({ title: 'To delete' });
      const ok = await deleteVaultDocument(doc.id);
      expect(ok).toBe(true);
      expect(await getVaultDocument(doc.id)).toBeNull();
    });

    it('delete returns false when id not found', async () => {
      expect(await deleteVaultDocument(99999)).toBe(false);
    });
  });

  describe('research_results', () => {
    it('inserts and retrieves a research result', async () => {
      const query = await insertResearchQuery({ query_text: 'Q' });
      const result = await insertResearchResult({
        research_query_id: query.id,
        content: 'Long content',
        summary: 'Short summary',
      });
      expect(result.id).toBeGreaterThan(0);
      expect(result.research_query_id).toBe(query.id);
      expect(result.content).toBe('Long content');
      expect(result.summary).toBe('Short summary');

      const found = await getResearchResult(result.id);
      expect(found).not.toBeNull();
      expect(found!.summary).toBe(result.summary);
    });

    it('lists results by research_query_id', async () => {
      const query = await insertResearchQuery({ query_text: 'Q' });
      await insertResearchResult({ research_query_id: query.id, summary: 'R1' });
      await insertResearchResult({ research_query_id: query.id, summary: 'R2' });
      const list = await listResearchResultsByQueryId(query.id);
      expect(list.length).toBe(2);
      expect(list.every((r) => r.research_query_id === query.id)).toBe(true);
    });
  });

  describe('citations', () => {
    it('inserts and retrieves a citation', async () => {
      const query = await insertResearchQuery({ query_text: 'Q' });
      const result = await insertResearchResult({ research_query_id: query.id });
      const citation = await insertCitation({
        research_result_id: result.id,
        source_url: 'https://cite.com',
        title: 'Source',
        snippet: 'Relevant snippet',
      });
      expect(citation.id).toBeGreaterThan(0);
      expect(citation.research_result_id).toBe(result.id);
      expect(citation.source_url).toBe('https://cite.com');
      expect(citation.title).toBe('Source');
      expect(citation.snippet).toBe('Relevant snippet');

      const found = await getCitation(citation.id);
      expect(found).not.toBeNull();
    });

    it('lists citations by research_result_id', async () => {
      const query = await insertResearchQuery({ query_text: 'Q' });
      const result = await insertResearchResult({ research_query_id: query.id });
      await insertCitation({ research_result_id: result.id, title: 'C1' });
      await insertCitation({ research_result_id: result.id, title: 'C2' });
      const list = await listCitationsByResultId(result.id);
      expect(list.length).toBe(2);
      expect(list.every((c) => c.research_result_id === result.id)).toBe(true);
    });
  });

  describe('user_feedback', () => {
    it('inserts feedback for a research result', async () => {
      const query = await insertResearchQuery({ query_text: 'Q' });
      const result = await insertResearchResult({ research_query_id: query.id });
      const feedback = await insertUserFeedback({
        research_result_id: result.id,
        rating: 5,
        feedback_text: 'Very helpful',
      });
      expect(feedback.id).toBeGreaterThan(0);
      expect(feedback.research_result_id).toBe(result.id);
      expect(feedback.rating).toBe(5);
      expect(feedback.feedback_text).toBe('Very helpful');

      const found = await getUserFeedback(feedback.id);
      expect(found).not.toBeNull();
    });

    it('inserts feedback for a research query', async () => {
      const query = await insertResearchQuery({ query_text: 'Q' });
      const feedback = await insertUserFeedback({
        research_query_id: query.id,
        rating: 3,
      });
      expect(feedback.research_query_id).toBe(query.id);
      expect(feedback.rating).toBe(3);
    });

    it('throws when neither result nor query id provided', async () => {
      await expect(insertUserFeedback({} as never)).rejects.toThrow('Either research_result_id or research_query_id must be set');
    });

    it('lists feedback by research_result_id', async () => {
      const query = await insertResearchQuery({ query_text: 'Q' });
      const result = await insertResearchResult({ research_query_id: query.id });
      await insertUserFeedback({ research_result_id: result.id, rating: 1 });
      await insertUserFeedback({ research_result_id: result.id, rating: 2 });
      const list = await listUserFeedbackByResultId(result.id);
      expect(list.length).toBe(2);
    });

    it('lists feedback by research_query_id', async () => {
      const query = await insertResearchQuery({ query_text: 'Q' });
      await insertUserFeedback({ research_query_id: query.id, rating: 4 });
      const list = await listUserFeedbackByQueryId(query.id);
      expect(list.length).toBe(1);
      expect(list[0].rating).toBe(4);
    });
  });
});
