import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Users ---
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// --- Documents / Papers (Literature) ---
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  authors: text("authors").array().notNull(),
  abstract: text("abstract"),
  content: text("content"), // Full text or parsed content
  url: text("url"), // Link to the original paper
  doi: text("doi").unique(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// --- Research Tasks / Sessions ---
export const researchTasks = pgTable("research_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  query: text("query").notNull(),
  status: text("status", { enum: ["pending", "planning", "searching", "synthesizing", "completed", "failed"] }).default("pending").notNull(),
  result: text("result"), // Structured summary/report
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResearchTaskSchema = createInsertSchema(researchTasks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResearchTask = z.infer<typeof insertResearchTaskSchema>;
export type ResearchTask = typeof researchTasks.$inferSelect;

// --- Task Citations (Linking tasks to documents) ---
export const taskCitations = pgTable("task_citations", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => researchTasks.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").notNull().references(() => documents.id),
  relevanceScore: text("relevance_score"), // Could be numeric, storing as text for simplicity or JSON
  snippet: text("snippet"), // The specific part of the document cited
});

export const insertTaskCitationSchema = createInsertSchema(taskCitations).omit({ id: true });
export type InsertTaskCitation = z.infer<typeof insertTaskCitationSchema>;
export type TaskCitation = typeof taskCitations.$inferSelect;


// --- API Contract Types ---

export type CreateResearchTaskRequest = {
  query: string;
};

export type ResearchTaskResponse = ResearchTask & {
  citations?: (TaskCitation & { document: Document })[];
};

export type StartResearchTaskResponse = {
  taskId: string;
  status: string;
};
