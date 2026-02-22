import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  researchQueries,
  researchResults,
  citations,
  vaultDocuments,
  userFeedback,
  researchHistory,
  type ResearchQuery,
  type InsertResearchQuery,
  type ResearchResult,
  type InsertResearchResult,
  type Citation,
  type InsertCitation,
  type VaultDocument,
  type InsertVaultDocument,
  type UserFeedback,
  type InsertUserFeedback,
  type ResearchHistoryRecord,
  type InsertResearchHistoryRecord,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Research Query Helpers
 */
export async function createResearchQuery(
  userId: number,
  query: string,
  topic?: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(researchQueries).values({
    userId,
    query,
    topic,
    description,
    status: "pending",
  });

  return result;
}

export async function getResearchQuery(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(researchQueries)
    .where(eq(researchQueries.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserResearchQueries(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(researchQueries)
    .where(eq(researchQueries.userId, userId))
    .orderBy(desc(researchQueries.createdAt));
}

/**
 * Research Result Helpers
 */
export async function createResearchResult(
  queryId: number,
  userId: number,
  summary: string,
  keyFindings: unknown[],
  consensus: string,
  disagreements: unknown[],
  researchGaps: unknown[],
  confidenceScore: number,
  agentReasoning: unknown
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(researchResults).values({
    queryId,
    userId,
    summary,
    keyFindings: JSON.stringify(keyFindings),
    consensus,
    disagreements: JSON.stringify(disagreements),
    researchGaps: JSON.stringify(researchGaps),
    confidenceScore,
    agentReasoning: JSON.stringify(agentReasoning),
  });

  return result;
}

export async function getResearchResult(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(researchResults)
    .where(eq(researchResults.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getResearchResultsByQuery(queryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(researchResults)
    .where(eq(researchResults.queryId, queryId))
    .orderBy(desc(researchResults.createdAt));
}

/**
 * Citation Helpers
 */
export async function addCitation(
  resultId: number,
  source: string,
  sourceUrl?: string,
  authors?: string[],
  publicationDate?: string,
  relevanceScore?: number,
  context?: string,
  citationIndex?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(citations).values({
    resultId,
    source,
    sourceUrl,
    authors: authors ? JSON.stringify(authors) : null,
    publicationDate,
    relevanceScore,
    context,
    citationIndex,
  });
}

export async function getCitationsForResult(resultId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(citations)
    .where(eq(citations.resultId, resultId))
    .orderBy(citations.citationIndex);
}

/**
 * Vault Document Helpers
 */
export async function addVaultDocument(
  userId: number,
  filename: string,
  fileKey: string,
  fileUrl: string,
  fileType?: string,
  fileSize?: number,
  documentType: "paper" | "note" | "dataset" | "protocol" | "other" = "other",
  title?: string,
  description?: string,
  tags?: string[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(vaultDocuments).values({
    userId,
    filename,
    fileKey,
    fileUrl,
    fileType,
    fileSize,
    documentType,
    title,
    description,
    tags: tags ? JSON.stringify(tags) : null,
    isIndexed: 0,
  });
}

export async function getUserVaultDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(vaultDocuments)
    .where(eq(vaultDocuments.userId, userId))
    .orderBy(desc(vaultDocuments.createdAt));
}

export async function getVaultDocument(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(vaultDocuments)
    .where(eq(vaultDocuments.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * User Feedback Helpers
 */
export async function addUserFeedback(
  userId: number,
  resultId: number,
  rating?: number,
  accuracy?: number,
  relevance?: number,
  completeness?: number,
  trustScore?: number,
  comment?: string,
  suggestedImprovements?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(userFeedback).values({
    userId,
    resultId,
    rating,
    accuracy,
    relevance,
    completeness,
    trustScore,
    comment,
    suggestedImprovements,
  });
}

export async function getFeedbackForResult(resultId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userFeedback)
    .where(eq(userFeedback.resultId, resultId));
}

/**
 * Research History Helpers
 */
export async function saveResearchSession(
  userId: number,
  queryId: number,
  resultId?: number,
  sessionName?: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(researchHistory).values({
    userId,
    queryId,
    resultId,
    sessionName,
    notes,
    isSaved: 1,
  });
}

export async function getUserResearchHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(researchHistory)
    .where(eq(researchHistory.userId, userId))
    .orderBy(desc(researchHistory.createdAt));
}


