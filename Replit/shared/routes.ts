import { z } from 'zod';
import {
  insertUserSchema,
  insertResearchTaskSchema,
  users,
  researchTasks,
  documents,
  taskCitations
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

const documentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string().nullable(),
  url: z.string().nullable(),
  doi: z.string().nullable(),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
});

const taskCitationSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  documentId: z.string().uuid(),
  relevanceScore: z.string().nullable(),
  snippet: z.string().nullable(),
  document: documentSchema.optional(),
});

const researchTaskResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  query: z.string(),
  status: z.enum(["pending", "planning", "searching", "synthesizing", "completed", "failed"]),
  result: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  citations: z.array(taskCitationSchema).optional(),
});

export const api = {
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks' as const,
      responses: {
        200: z.array(researchTaskResponseSchema),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tasks/:id' as const,
      responses: {
        200: researchTaskResponseSchema,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks' as const,
      input: z.object({ query: z.string().min(1, "Query is required") }),
      responses: {
        201: z.object({ taskId: z.string(), status: z.string() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  documents: {
    list: {
        method: 'GET' as const,
        path: '/api/documents' as const,
        input: z.object({ search: z.string().optional() }).optional(),
        responses: {
            200: z.array(documentSchema),
        }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
