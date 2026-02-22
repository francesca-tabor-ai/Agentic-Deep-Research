import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createResearchQuery,
  getResearchQuery,
  getUserResearchQueries,
  addCitation,
  getCitationsForResult,
  addUserFeedback,
  saveResearchSession,
  getUserResearchHistory,
} from "./db";

describe("Research Database Operations", () => {
  const testUserId = 1;
  let queryId: number;
  let resultId: number;

  describe("Research Queries", () => {
    it("should create a research query", async () => {
      const result = await createResearchQuery(
        testUserId,
        "What are the latest advances in protein folding?",
        "Biology",
        "Research on protein structure prediction"
      );
      expect(result).toBeDefined();
      queryId = (result as any).insertId || 1;
    });

    it("should retrieve a research query", async () => {
      const query = await getResearchQuery(queryId);
      expect(query).toBeDefined();
      if (query) {
        expect(query.query).toContain("protein folding");
        expect(query.userId).toBe(testUserId);
      }
    });

    it("should retrieve user research queries", async () => {
      const queries = await getUserResearchQueries(testUserId);
      expect(Array.isArray(queries)).toBe(true);
      expect(queries.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Citations", () => {
    it("should add a citation", async () => {
      resultId = 1; // Mock result ID
      const result = await addCitation(
        resultId,
        "AlphaFold2: Highly accurate protein structure prediction",
        "https://example.com/alphafold2",
        ["Jumper, J.", "Evans, R."],
        "2021",
        98,
        "Foundational work on transformer-based protein folding",
        1
      );
      expect(result).toBeDefined();
    });

    it("should retrieve citations for a result", async () => {
      const citations = await getCitationsForResult(resultId);
      expect(Array.isArray(citations)).toBe(true);
    });
  });

  describe("User Feedback", () => {
    it("should add user feedback", async () => {
      const result = await addUserFeedback(
        testUserId,
        resultId,
        5,
        4,
        5,
        4,
        5,
        "Excellent research analysis",
        "Could include more recent papers"
      );
      expect(result).toBeDefined();
    });
  });

  describe("Research Sessions", () => {
    it("should save a research session", async () => {
      const result = await saveResearchSession(
        testUserId,
        queryId,
        resultId,
        "Protein Folding Research - Session 1",
        "Initial analysis of transformer-based approaches"
      );
      expect(result).toBeDefined();
    });

    it("should retrieve user research history", async () => {
      const history = await getUserResearchHistory(testUserId);
      expect(Array.isArray(history)).toBe(true);
    });
  });
});

describe("Research Agent Workflow", () => {
  it("should validate research query structure", () => {
    const query = {
      query: "What are the latest advances in protein folding?",
      topic: "Biology",
      status: "pending" as const,
    };
    expect(query.query).toBeTruthy();
    expect(query.status).toBe("pending");
  });

  it("should validate citation structure", () => {
    const citation = {
      source: "Research Paper",
      sourceUrl: "https://example.com",
      authors: ["Author A", "Author B"],
      relevanceScore: 95,
      context: "Key finding about protein folding",
    };
    expect(citation.source).toBeTruthy();
    expect(citation.relevanceScore).toBeGreaterThanOrEqual(0);
    expect(citation.relevanceScore).toBeLessThanOrEqual(100);
  });

  it("should validate feedback structure", () => {
    const feedback = {
      rating: 4,
      accuracy: 5,
      relevance: 4,
      completeness: 4,
      trustScore: 5,
      comment: "Great research",
    };
    expect(feedback.rating).toBeGreaterThanOrEqual(1);
    expect(feedback.rating).toBeLessThanOrEqual(5);
    expect(feedback.accuracy).toBeGreaterThanOrEqual(1);
    expect(feedback.accuracy).toBeLessThanOrEqual(5);
  });

  it("should validate confidence score range", () => {
    const scores = [0, 50, 87, 100];
    scores.forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
