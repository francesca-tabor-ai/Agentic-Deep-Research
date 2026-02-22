import { db } from "./db";
import {
  users,
  researchTasks,
  documents,
  taskCitations,
  type User,
  type InsertUser,
  type ResearchTask,
  type InsertResearchTask,
  type Document,
  type InsertDocument,
  type TaskCitation,
  type InsertTaskCitation
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Documents
  getDocuments(search?: string): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;

  // Research Tasks
  getTasks(userId: string): Promise<ResearchTask[]>;
  getTask(id: string): Promise<(ResearchTask & { citations?: (TaskCitation & { document: Document })[] }) | undefined>;
  createTask(task: InsertResearchTask): Promise<ResearchTask>;
  updateTaskStatus(id: string, status: ResearchTask["status"], result?: string): Promise<ResearchTask>;

  // Citations
  createCitation(citation: InsertTaskCitation): Promise<TaskCitation>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Documents
  async getDocuments(search?: string): Promise<Document[]> {
    // Basic implementation, ignores search for now
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(doc).returning();
    return document;
  }

  // Research Tasks
  async getTasks(userId: string): Promise<ResearchTask[]> {
    return await db.select().from(researchTasks).where(eq(researchTasks.userId, userId)).orderBy(desc(researchTasks.createdAt));
  }

  async getTask(id: string): Promise<(ResearchTask & { citations?: (TaskCitation & { document: Document })[] }) | undefined> {
    const [task] = await db.select().from(researchTasks).where(eq(researchTasks.id, id));
    if (!task) return undefined;

    const citations = await db
      .select({
        citation: taskCitations,
        document: documents,
      })
      .from(taskCitations)
      .innerJoin(documents, eq(taskCitations.documentId, documents.id))
      .where(eq(taskCitations.taskId, id));

    return {
      ...task,
      citations: citations.map((c) => ({
        ...c.citation,
        document: c.document,
      })),
    };
  }

  async createTask(task: InsertResearchTask): Promise<ResearchTask> {
    const [newTask] = await db.insert(researchTasks).values(task).returning();
    return newTask;
  }

  async updateTaskStatus(id: string, status: ResearchTask["status"], result?: string): Promise<ResearchTask> {
    const [updated] = await db
      .update(researchTasks)
      .set({ status, result, updatedAt: new Date() })
      .where(eq(researchTasks.id, id))
      .returning();
    return updated;
  }

  // Citations
  async createCitation(citation: InsertTaskCitation): Promise<TaskCitation> {
    const [newCitation] = await db.insert(taskCitations).values(citation).returning();
    return newCitation;
  }
}

export const storage = new DatabaseStorage();
