import { describe, it, expect } from 'vitest';
import {
  retrieveFromVault,
  retrieveFromPublicSources,
  retrieve,
} from './retrieval.js';
import type { VaultDocument } from '../db.js';

describe('retrieval', () => {
  const mockVaultDocs: VaultDocument[] = [
    {
      id: 1,
      title: 'Microplastics in marine ecosystems',
      content: 'Study on microplastics and ocean food chains. Evidence from samples.',
      source_url: 'https://example.com/1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Unrelated document',
      content: 'Weather and climate in the desert.',
      source_url: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ];

  describe('retrieveFromVault', () => {
    it('returns chunks scored by keyword overlap with query', () => {
      const chunks = retrieveFromVault('microplastics marine', mockVaultDocs, 5);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].sourceType).toBe('vault');
      expect(chunks[0].sourceId).toBe('vault:1');
      expect(chunks[0].title).toBe('Microplastics in marine ecosystems');
      expect(chunks[0].score).toBeGreaterThan(0);
    });

    it('ranks higher-scoring docs first', () => {
      const chunks = retrieveFromVault('microplastics ocean', mockVaultDocs, 5);
      expect(chunks[0].score).toBeGreaterThanOrEqual(chunks[1]?.score ?? 0);
    });

    it('respects limit', () => {
      const chunks = retrieveFromVault('document', mockVaultDocs, 1);
      expect(chunks.length).toBe(1);
    });

    it('returns empty array when no vault docs', () => {
      const chunks = retrieveFromVault('anything', [], 5);
      expect(chunks).toEqual([]);
    });
  });

  describe('retrieveFromPublicSources', () => {
    it('returns mock chunks with query reflected', () => {
      const chunks = retrieveFromPublicSources('agentic AI', 2);
      expect(chunks.length).toBeLessThanOrEqual(2);
      expect(chunks.every((c) => c.sourceType === 'public')).toBe(true);
      expect(chunks[0].sourceId).toMatch(/^public:/);
      expect(chunks[0].snippet).toContain('agentic AI');
    });

    it('respects limit', () => {
      const chunks = retrieveFromPublicSources('test', 1);
      expect(chunks.length).toBe(1);
    });
  });

  describe('retrieve', () => {
    it('combines vault and public chunks and sorts by score', () => {
      const chunks = retrieve('microplastics', mockVaultDocs, {
        vaultLimit: 5,
        publicLimit: 2,
        maxTotal: 10,
      });
      expect(chunks.length).toBeGreaterThan(0);
      const vaultChunks = chunks.filter((c) => c.sourceType === 'vault');
      const publicChunks = chunks.filter((c) => c.sourceType === 'public');
      expect(vaultChunks.length).toBeGreaterThan(0);
      expect(publicChunks.length).toBeGreaterThan(0);
      for (let i = 1; i < chunks.length; i++) {
        expect(chunks[i].score).toBeLessThanOrEqual(chunks[i - 1].score);
      }
    });

    it('respects maxTotal', () => {
      const chunks = retrieve('query', mockVaultDocs, { maxTotal: 2 });
      expect(chunks.length).toBeLessThanOrEqual(2);
    });
  });
});
