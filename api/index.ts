/**
 * Vercel serverless entry point — wraps the Express app.
 * All /api/* requests are routed here via vercel.json rewrites.
 * The DB is initialised lazily on first warm invocation (see server/app.ts).
 */
export { app as default } from '../server/app.js';
