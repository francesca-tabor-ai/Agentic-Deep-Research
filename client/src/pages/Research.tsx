import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import ResearchQueryForm, { type AdvancedOptions } from '@/components/ResearchQueryForm';
import QueryHistorySidebar from '@/components/QueryHistorySidebar';
import { fetchQueries, createQuery } from '@/api';

export default function Research() {
  const [queries, setQueries] = useState<Awaited<ReturnType<typeof fetchQueries>>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [, setLocation] = useLocation();

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

  const selectedId = (() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    return q ? parseInt(q, 10) : null;
  })();

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
          <div className="max-w-2xl">
            <ResearchQueryForm onSubmit={handleSubmit} isSubmitting={submitting} />
            {selectedId && (
              <div className="mt-8 p-4 rounded-xl border border-border bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Query #{selectedId} selected. Results view will appear in a later phase.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
