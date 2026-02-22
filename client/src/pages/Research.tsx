import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Play, Loader2, AlertCircle } from 'lucide-react';
import ResearchQueryForm, { type AdvancedOptions } from '@/components/ResearchQueryForm';
import QueryHistorySidebar from '@/components/QueryHistorySidebar';
import ResearchResultDisplay from '@/components/ResearchResultDisplay';
import {
  fetchQueries,
  createQuery,
  fetchQueryResults,
  runQueryResearch,
  fetchResult,
} from '@/api';

export default function Research() {
  const [queries, setQueries] = useState<Awaited<ReturnType<typeof fetchQueries>>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<Awaited<ReturnType<typeof fetchResult>> | null>(null);
  const [, setLocation] = useLocation();

  const selectedId = (() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    return q ? parseInt(q, 10) : null;
  })();

  const loadQueries = async () => {
    setLoading(true);
    try {
      const data = await fetchQueries(50);
      setQueries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const loadResultForQuery = async (queryId: number) => {
    setResultLoading(true);
    setResultError(null);
    setResultData(null);
    try {
      const results = await fetchQueryResults(queryId);
      if (results.length === 0) return;
      const latest = results[0];
      const { result, citations } = await fetchResult(latest.id);
      setResultData({ result, citations });
    } catch (err) {
      setResultError(err instanceof Error ? err.message : 'Failed to load result');
    } finally {
      setResultLoading(false);
    }
  };

  useEffect(() => {
    if (selectedId != null) {
      loadResultForQuery(selectedId);
    } else {
      setResultData(null);
      setResultError(null);
    }
  }, [selectedId]);

  const handleSubmit = async (queryText: string, _options?: AdvancedOptions) => {
    setSubmitting(true);
    try {
      const created = await createQuery(queryText, 'pending');
      await loadQueries();
      setLocation(`/research?q=${created.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunResearch = async () => {
    if (selectedId == null) return;
    setRunLoading(true);
    setResultError(null);
    try {
      const outcome = await runQueryResearch(selectedId);
      const { result, citations } = await fetchResult(outcome.researchResultId);
      setResultData({ result, citations });
      await loadQueries();
    } catch (err) {
      setResultError(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col sm:flex-row">
      <QueryHistorySidebar
        queries={queries}
        isLoading={loading}
        selectedId={selectedId ?? undefined}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="p-4 sm:p-6 border-b border-border flex items-center gap-4">
          <Link href="/">
            <a className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
          </Link>
          <div>
            <h1 className="font-serif text-xl font-bold text-foreground">Research</h1>
            <p className="text-sm text-muted-foreground">
              Enter your question or topic and run a deep research task.
            </p>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-2xl mb-8">
            <ResearchQueryForm onSubmit={handleSubmit} isSubmitting={submitting} />
          </div>

          {selectedId != null && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleRunResearch}
                  disabled={runLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {runLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running…
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run research
                    </>
                  )}
                </button>
                <span className="text-sm text-muted-foreground">
                  Query #{selectedId} — run the agent to generate a report.
                </span>
              </div>

              {resultError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {resultError}
                </div>
              )}

              {resultLoading && (
                <div className="flex items-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading result…
                </div>
              )}

              {!resultLoading && resultData && (
                <ResearchResultDisplay
                  result={resultData.result}
                  citations={resultData.citations}
                />
              )}

              {!resultLoading && !resultData && selectedId != null && (
                <div className="py-8 rounded-xl border border-dashed border-border bg-muted/20 text-center text-muted-foreground">
                  <p>No result yet. Click &quot;Run research&quot; to generate a report.</p>
                </div>
              )}
            </div>
          )}

          {selectedId == null && (
            <div className="py-8 rounded-xl border border-dashed border-border bg-muted/20 text-center text-muted-foreground">
              <p>Select a query from the sidebar or create one above.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
