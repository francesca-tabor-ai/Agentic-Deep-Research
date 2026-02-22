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

  afterEach(() => {
    closeDb();
  });

  describe('init and connection', () => {
    it('creates schema and returns db instance', () => {
      const database = getDb();
      expect(database).toBeDefined();
      const res = database.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
      const names = (res[0]?.values ?? []).map((row) => row[0]) as string[];
      expect(names).toContain('research_queries');
      expect(names).toContain('vault_documents');
      expect(names).toContain('research_results');
      expect(names).toContain('citations');
      expect(names).toContain('user_feedback');
    });

    it('getDb returns same instance after init', () => {
      const first = getDb();
      const second = getDb();
      expect(second).toBe(first);
    });
  });

  describe('research_queries', () => {
    it('inserts and retrieves a research query', () => {
      const inserted = insertResearchQuery({ query_text: 'What is agentic AI?' });
      expect(inserted.id).toBeGreaterThan(0);
      expect(inserted.query_text).toBe('What is agentic AI?');
      expect(inserted.status).toBe('pending');
      expect(inserted.created_at).toBeDefined();
      expect(inserted.updated_at).toBeDefined();

      const found = getResearchQuery(inserted.id);
      expect(found).not.toBeNull();
      expect(found!.query_text).toBe(inserted.query_text);
    });

    it('defaults status to pending', () => {
      const q = insertResearchQuery({ query_text: 'Test' });
      expect(q.status).toBe('pending');
    });

    it('accepts explicit status', () => {
      const q = insertResearchQuery({ query_text: 'Test', status: 'in_progress' });
      expect(q.status).toBe('in_progress');
    });

    it('returns null for missing id', () => {
      expect(getResearchQuery(99999)).toBeNull();
    });

    it('lists queries ordered by created_at desc', () => {
      insertResearchQuery({ query_text: 'First' });
      insertResearchQuery({ query_text: 'Second' });
      const list = listResearchQueries();
      expect(list.length).toBeGreaterThanOrEqual(2);
      const texts = list.map((q) => q.query_text);
      expect(texts).toContain('First');
      expect(texts).toContain('Second');
    });

    it('filters list by status', () => {
      insertResearchQuery({ query_text: 'A', status: 'pending' });
      insertResearchQuery({ query_text: 'B', status: 'completed' });
      insertResearchQuery({ query_text: 'C', status: 'completed' });
      const list = listResearchQueries({ status: 'completed' });
      expect(list.every((q) => q.status === 'completed')).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('limits list results', () => {
      insertResearchQuery({ query_text: '1' });
      insertResearchQuery({ query_text: '2' });
      insertResearchQuery({ query_text: '3' });
      const list = listResearchQueries({ limit: 2 });
      expect(list.length).toBe(2);
    });

    it('updates research query status', () => {
      const q = insertResearchQuery({ query_text: 'Update me' });
      const updated = updateResearchQueryStatus(q.id, 'completed');
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('completed');
      expect(getResearchQuery(q.id)!.status).toBe('completed');
    });
  });

  describe('vault_documents', () => {
    it('inserts and retrieves a vault document', () => {
      const inserted = insertVaultDocument({
        title: 'Doc 1',
        content: 'Some content',
        source_url: 'https://example.com',
      });
      expect(inserted.id).toBeGreaterThan(0);
      expect(inserted.title).toBe('Doc 1');
      expect(inserted.content).toBe('Some content');
      expect(inserted.source_url).toBe('https://example.com');

      const found = getVaultDocument(inserted.id);
      expect(found).not.toBeNull();
      expect(found!.title).toBe(inserted.title);
    });

    it('allows null content and source_url', () => {
      const doc = insertVaultDocument({ title: 'Minimal' });
      expect(doc.content).toBeNull();
      expect(doc.source_url).toBeNull();
    });

    it('returns null for missing id', () => {
      expect(getVaultDocument(99999)).toBeNull();
    });

    it('lists vault documents', () => {
      insertVaultDocument({ title: 'A' });
      insertVaultDocument({ title: 'B' });
      const list = listVaultDocuments();
      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('listVaultDocuments respects limit', () => {
      insertVaultDocument({ title: '1' });
      insertVaultDocument({ title: '2' });
      insertVaultDocument({ title: '3' });
      const list = listVaultDocuments(2);
      expect(list.length).toBe(2);
    });

    it('deletes vault document', () => {
      const doc = insertVaultDocument({ title: 'To delete' });
      const ok = deleteVaultDocument(doc.id);
      expect(ok).toBe(true);
      expect(getVaultDocument(doc.id)).toBeNull();
    });

    it('delete returns false when id not found', () => {
      expect(deleteVaultDocument(99999)).toBe(false);
    });
  });

  describe('research_results', () => {
    it('inserts and retrieves a research result', () => {
      const query = insertResearchQuery({ query_text: 'Q' });
      const result = insertResearchResult({
        research_query_id: query.id,
        content: 'Long content',
        summary: 'Short summary',
      });
      expect(result.id).toBeGreaterThan(0);
      expect(result.research_query_id).toBe(query.id);
      expect(result.content).toBe('Long content');
      expect(result.summary).toBe('Short summary');

      const found = getResearchResult(result.id);
      expect(found).not.toBeNull();
      expect(found!.summary).toBe(result.summary);
    });

    it('lists results by research_query_id', () => {
      const query = insertResearchQuery({ query_text: 'Q' });
      insertResearchResult({ research_query_id: query.id, summary: 'R1' });
      insertResearchResult({ research_query_id: query.id, summary: 'R2' });
      const list = listResearchResultsByQueryId(query.id);
      expect(list.length).toBe(2);
      expect(list.every((r) => r.research_query_id === query.id)).toBe(true);
    });
  });

  describe('citations', () => {
    it('inserts and retrieves a citation', () => {
      const query = insertResearchQuery({ query_text: 'Q' });
      const result = insertResearchResult({ research_query_id: query.id });
      const citation = insertCitation({
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

      const found = getCitation(citation.id);
      expect(found).not.toBeNull();
    });

    it('lists citations by research_result_id', () => {
      const query = insertResearchQuery({ query_text: 'Q' });
      const result = insertResearchResult({ research_query_id: query.id });
      insertCitation({ research_result_id: result.id, title: 'C1' });
      insertCitation({ research_result_id: result.id, title: 'C2' });
      const list = listCitationsByResultId(result.id);
      expect(list.length).toBe(2);
      expect(list.every((c) => c.research_result_id === result.id)).toBe(true);
    });
  });

  describe('user_feedback', () => {
    it('inserts feedback for a research result', () => {
      const query = insertResearchQuery({ query_text: 'Q' });
      const result = insertResearchResult({ research_query_id: query.id });
      const feedback = insertUserFeedback({
        research_result_id: result.id,
        rating: 5,
        feedback_text: 'Very helpful',
      });
      expect(feedback.id).toBeGreaterThan(0);
      expect(feedback.research_result_id).toBe(result.id);
      expect(feedback.rating).toBe(5);
      expect(feedback.feedback_text).toBe('Very helpful');

      const found = getUserFeedback(feedback.id);
      expect(found).not.toBeNull();
    });

    it('inserts feedback for a research query', () => {
      const query = insertResearchQuery({ query_text: 'Q' });
      const feedback = insertUserFeedback({
        research_query_id: query.id,
        rating: 3,
      });
      expect(feedback.research_query_id).toBe(query.id);
      expect(feedback.rating).toBe(3);
    });

    it('throws when neither result nor query id provided', () => {
      expect(() =>
        insertUserFeedback({})
      ).toThrow('Either research_result_id or research_query_id must be set');
    });

    it('lists feedback by research_result_id', () => {
      const query = insertResearchQuery({ query_text: 'Q' });
      const result = insertResearchResult({ research_query_id: query.id });
      insertUserFeedback({ research_result_id: result.id, rating: 1 });
      insertUserFeedback({ research_result_id: result.id, rating: 2 });
      const list = listUserFeedbackByResultId(result.id);
      expect(list.length).toBe(2);
    });

    it('lists feedback by research_query_id', () => {
      const query = insertResearchQuery({ query_text: 'Q' });
      insertUserFeedback({ research_query_id: query.id, rating: 4 });
      const list = listUserFeedbackByQueryId(query.id);
      expect(list.length).toBe(1);
      expect(list[0].rating).toBe(4);
    });
  });
});
