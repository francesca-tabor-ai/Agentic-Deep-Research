import { describe, it, expect } from 'vitest';
import {
  synthesize,
  computeConfidence,
  extractCitations,
} from './synthesis.js';
import type { RetrievedChunk } from './types.js';

const mockChunks: RetrievedChunk[] = [
  {
    sourceType: 'vault',
    sourceId: 'vault:1',
    title: 'Source A',
    url: 'https://a.com',
    snippet: 'First snippet content.',
    score: 0.9,
  },
  {
    sourceType: 'vault',
    sourceId: 'vault:2',
    title: 'Source B',
    url: 'https://b.com',
    snippet: 'Second snippet content.',
    score: 0.7,
  },
  {
    sourceType: 'public',
    sourceId: 'public:1',
    title: 'Public source',
    url: 'https://p.com',
    snippet: 'Public snippet.',
    score: 0.8,
  },
];

describe('synthesis', () => {
  describe('synthesize', () => {
    it('returns summary, sections, and confidence', () => {
      const out = synthesize('What is X?', mockChunks);
      expect(out.summary).toBeDefined();
      expect(out.summary.length).toBeGreaterThan(0);
      expect(out.sections).toBeDefined();
      expect(Array.isArray(out.sections)).toBe(true);
      expect(out.confidence).toBeGreaterThanOrEqual(0);
      expect(out.confidence).toBeLessThanOrEqual(1);
    });

    it('includes query in summary', () => {
      const out = synthesize('What is agentic AI?', mockChunks);
      expect(out.summary).toContain('What is agentic AI?');
    });

    it('sections have heading, text, and sourceIds', () => {
      const out = synthesize('query', mockChunks);
      expect(out.sections.length).toBeGreaterThan(0);
      for (const s of out.sections) {
        expect(s.heading).toBeDefined();
        expect(s.text).toBeDefined();
        expect(Array.isArray(s.sourceIds)).toBe(true);
      }
    });
  });

  describe('computeConfidence', () => {
    it('returns 0 for empty chunks', () => {
      expect(computeConfidence([])).toBe(0);
    });

    it('returns value in [0, 1] for non-empty chunks', () => {
      const c = computeConfidence(mockChunks);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1);
    });

    it('increases with more sources and higher scores', () => {
      const oneChunk = computeConfidence([mockChunks[0]]);
      const threeChunks = computeConfidence(mockChunks);
      expect(threeChunks).toBeGreaterThanOrEqual(oneChunk);
    });
  });

  describe('extractCitations', () => {
    it('returns one entry per unique sourceId used in sections', () => {
      const sourceIds = ['vault:1', 'vault:2', 'vault:1'];
      const citations = extractCitations(mockChunks, sourceIds);
      const vault1Count = citations.filter((c) => c.sourceId === 'vault:1').length;
      expect(vault1Count).toBe(1);
      expect(citations.length).toBe(2);
    });

    it('includes title, url, snippet for each citation', () => {
      const citations = extractCitations(mockChunks, ['vault:1']);
      expect(citations[0].title).toBe('Source A');
      expect(citations[0].url).toBe('https://a.com');
      expect(citations[0].snippet).toContain('First snippet');
    });

    it('returns empty array when no sourceIds match', () => {
      const citations = extractCitations(mockChunks, ['unknown:id']);
      expect(citations).toEqual([]);
    });
  });
});
