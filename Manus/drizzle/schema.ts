import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Research Queries - stores user research questions and parameters
 */
export const researchQueries = mysqlTable("research_queries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  query: text("query").notNull(),
  topic: varchar("topic", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResearchQuery = typeof researchQueries.$inferSelect;
export type InsertResearchQuery = typeof researchQueries.$inferInsert;

/**
 * Research Results - stores the output of research agent analysis
 */
export const researchResults = mysqlTable("research_results", {
  id: int("id").autoincrement().primaryKey(),
  queryId: int("queryId").notNull(),
  userId: int("userId").notNull(),
  summary: text("summary"),
  keyFindings: text("keyFindings"), // JSON array of findings
  consensus: text("consensus"),
  disagreements: text("disagreements"), // JSON array of conflicting findings
  researchGaps: text("researchGaps"), // JSON array of identified gaps
  confidenceScore: int("confidenceScore"), // 0-100 score
  agentReasoning: text("agentReasoning"), // JSON trace of agent steps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResearchResult = typeof researchResults.$inferSelect;
export type InsertResearchResult = typeof researchResults.$inferInsert;

/**
 * Citations - stores source citations with full attribution metadata
 */
export const citations = mysqlTable("citations", {
  id: int("id").autoincrement().primaryKey(),
  resultId: int("resultId").notNull(),
  source: varchar("source", { length: 255 }).notNull(), // Paper title, URL, or document name
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  authors: text("authors"), // JSON array of author names
  publicationDate: varchar("publicationDate", { length: 50 }),
  relevanceScore: int("relevanceScore"), // 0-100
  context: text("context"), // The text snippet where this citation is used
  citationIndex: int("citationIndex"), // Order in which citation appears
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Citation = typeof citations.$inferSelect;
export type InsertCitation = typeof citations.$inferInsert;

/**
 * Vault Documents - stores user's private research documents
 */
export const vaultDocuments = mysqlTable("vault_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(), // S3 key for the file
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(), // S3 URL
  fileType: varchar("fileType", { length: 50 }), // pdf, txt, docx, etc.
  fileSize: int("fileSize"), // in bytes
  documentType: mysqlEnum("documentType", ["paper", "note", "dataset", "protocol", "other"]).default("other").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  tags: text("tags"), // JSON array of tags for organization
  embedding: text("embedding"), // Vector embedding for semantic search (stored as JSON)
  isIndexed: int("isIndexed").default(0), // Boolean flag for retrieval readiness
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VaultDocument = typeof vaultDocuments.$inferSelect;
export type InsertVaultDocument = typeof vaultDocuments.$inferInsert;

/**
 * User Feedback - stores feedback on research quality for continuous improvement
 */
export const userFeedback = mysqlTable("user_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  resultId: int("resultId").notNull(),
  rating: int("rating"), // 1-5 star rating
  accuracy: int("accuracy"), // 1-5 rating for accuracy
  relevance: int("relevance"), // 1-5 rating for relevance
  completeness: int("completeness"), // 1-5 rating for completeness
  trustScore: int("trustScore"), // 1-5 rating for trustworthiness
  comment: text("comment"),
  suggestedImprovements: text("suggestedImprovements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = typeof userFeedback.$inferInsert;

/**
 * Research History - tracks saved research sessions for iteration
 */
export const researchHistory = mysqlTable("research_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  queryId: int("queryId").notNull(),
  resultId: int("resultId"),
  sessionName: varchar("sessionName", { length: 255 }),
  notes: text("notes"),
  isSaved: int("isSaved").default(1), // Boolean flag
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResearchHistoryRecord = typeof researchHistory.$inferSelect;
export type InsertResearchHistoryRecord = typeof researchHistory.$inferInsert;