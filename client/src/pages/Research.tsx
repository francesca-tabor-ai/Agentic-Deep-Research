import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Play, Loader2, AlertCircle } from 'lucide-react';
import ResearchQueryForm, { type AdvancedOptions } from '@/components/ResearchQueryForm';
import ResearchTemplates from '@/components/ResearchTemplates';
import QueryHistorySidebar from '@/components/QueryHistorySidebar';
import ResearchResultDisplay from '@/components/ResearchResultDisplay';
import {
  fetchQueries,
  createQuery,
  fetchQueryResults,
  runQueryResearch,
  fetchResult,
  fetchRelatedQueries,
  type ResearchQuery,
} from '@/api';

export default function Research() {
  const [queries, setQueries] = useState<ResearchQuery[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<ResearchQuery[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<Awaited<ReturnType<typeof fetchResult>> | null>(null);
  const [refillKey, setRefillKey] = useState<number | null>(null);
  const [refillText, setRefillText] = useState<string | null>(null);
  const [templateQueryText, setTemplateQueryText] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const selectedId = (() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    return q ? parseInt(q, 10) : null;
  })();

  const loadQueries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchQueries({ limit: 50, ...(savedOnly && { saved: true }) });
      setQueries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [savedOnly]);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  useEffect(() => {
    if (selectedId == null) {
      setRelatedQueries([]);
      return;
    }
    let cancelled = false;
    fetchRelatedQueries(selectedId).then((data) => {
      if (!cancelled) setRelatedQueries(data);
    }).catch(() => { if (!cancelled) setRelatedQueries([]); });
    return () => { cancelled = true; };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId != null && refillKey != null && selectedId !== refillKey) {
      setRefillKey(null);
      setRefillText(null);
    }
  }, [selectedId, refillKey]);

  const loadResultForQuery = async (queryId: number) => {
    setResultLoading(true);
    setResultError(null);
    setResultData(null);
    try {
      const results = await fetchQueryResults(queryId);
      if (results.length === 0) return;
      const latest = results[0];
      const { result, citations, feedback } = await fetchResult(latest.id);
      setResultData({ result, citations, feedback });
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
      const created = await createQuery({ query_text: queryText, status: 'pending' });
      setTemplateQueryText(null);
      await loadQueries();
      setLocation(`/research?q=${created.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefine = async (q: ResearchQuery) => {
    try {
      const created = await createQuery({
        query_text: q.query_text,
        status: 'pending',
        parent_query_id: q.id,
      });
      setRefillKey(created.id);
      setRefillText(created.query_text);
      await loadQueries();
      setLocation(`/research?q=${created.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunResearch = async () => {
    if (selectedId == null) return;
    setRunLoading(true);
    setResultError(null);
    try {
      const outcome = await runQueryResearch(selectedId);
      const { result, citations, feedback } = await fetchResult(outcome.researchResultId);
      setResultData({ result, citations, feedback });
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
        relatedQueries={relatedQueries}
        isLoading={loading}
        selectedId={selectedId ?? undefined}
        savedOnly={savedOnly}
        onSavedFilterChange={setSavedOnly}
        onRefine={handleRefine}
        onSaveChange={loadQueries}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="p-4 sm:p-6 border-b border-border flex items-center gap-4">
          <Link href="/">
            <a className="p-2 rounded-2xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors duration-200 tap-scale" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5" />
            </a>
          </Link>
          <div>
            <h1 className="font-sans text-xl font-bold text-foreground tracking-tight">Research</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Enter your question or topic and run a deep research task.
            </p>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-2xl mb-8 space-y-6">
            <ResearchTemplates onSelect={(text) => setTemplateQueryText(text)} />
            <ResearchQueryForm
              key={refillKey ?? 'default'}
              onSubmit={handleSubmit}
              isSubmitting={submitting}
              initialQueryText={refillText ?? templateQueryText ?? undefined}
            />
          </div>

          {selectedId != null && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleRunResearch}
                  disabled={runLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-medium hover:opacity-95 disabled:opacity-50 transition-opacity duration-200 shadow-soft tap-scale"
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
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-700 dark:text-red-400 text-sm" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
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
                  feedback={resultData.feedback}
                  onFeedbackSubmitted={() => selectedId != null && loadResultForQuery(selectedId)}
                />
              )}

              {!resultLoading && !resultData && selectedId != null && (
                <div className="py-10 rounded-2xl border border-dashed border-border bg-muted/20 text-center text-muted-foreground leading-relaxed">
                  <p>No result yet. Click &quot;Run research&quot; to generate a report.</p>
                </div>
              )}
            </div>
          )}

          {selectedId == null && (
            <div className="py-10 rounded-2xl border border-dashed border-border bg-muted/20 text-center text-muted-foreground leading-relaxed">
              <p>Select a query from the sidebar or create one above.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
