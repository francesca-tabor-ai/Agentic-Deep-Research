import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { fetchMetrics, type ResearchMetrics } from '@/api';

export default function Metrics() {
  const [metrics, setMetrics] = useState<ResearchMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load metrics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
            <Link href="/">
              <a className="p-2 rounded-2xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors duration-200 tap-scale" aria-label="Back to home">
                <ArrowLeft className="w-5 h-5" />
              </a>
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-2xl border border-red-200 bg-red-500/10 text-red-700 dark:text-red-400 p-4">
            {error || 'No metrics available.'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
          <Link href="/">
            <a className="p-2 rounded-2xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors duration-200 tap-scale" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5" />
            </a>
          </Link>
          <div>
            <h1 className="font-sans text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" aria-hidden />
              Evaluation metrics
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
              Research runs and user feedback over time.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" aria-hidden />
              <span className="text-sm font-medium">Total runs</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalRuns}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4" aria-hidden />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.completedRuns}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertCircle className="w-4 h-4" aria-hidden />
              <span className="text-sm font-medium">Failed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.failedRuns}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MessageSquare className="w-4 h-4" aria-hidden />
              <span className="text-sm font-medium">Feedback count</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalFeedbackCount}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-sans font-semibold text-foreground mb-3 flex items-center gap-2 tracking-tight">
              <TrendingUp className="w-5 h-5 text-primary" aria-hidden />
              Average confidence
            </h2>
            {metrics.avgConfidence != null ? (
              <p className="text-3xl font-bold text-foreground">
                {Math.round(metrics.avgConfidence * 100)}%
              </p>
            ) : (
              <p className="text-muted-foreground">No data yet</p>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-sans font-semibold text-foreground mb-3 flex items-center gap-2 tracking-tight">
              <Clock className="w-5 h-5 text-primary" aria-hidden />
              Average run time
            </h2>
            {metrics.avgDurationMs != null ? (
              <p className="text-3xl font-bold text-foreground">
                {(metrics.avgDurationMs / 1000).toFixed(1)}s
              </p>
            ) : (
              <p className="text-muted-foreground">No data yet</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" aria-hidden />
            <h2 className="font-sans font-semibold text-foreground tracking-tight">User rating distribution</h2>
          </div>
          <div className="p-4 space-y-4">
            {metrics.avgRating != null && (
              <p className="text-sm text-muted-foreground">
                Average rating: <span className="font-medium text-foreground">{metrics.avgRating.toFixed(1)}</span> / 5
              </p>
            )}
            {metrics.ratingDistribution.length > 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((r) => {
                  const item = metrics.ratingDistribution.find((d) => d.rating === r);
                  const count = item?.count ?? 0;
                  const total = metrics.ratingDistribution.reduce((a, d) => a + d.count, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={r} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground w-8">{r} ★</span>
                      <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all min-w-[2px]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No ratings yet. Submit feedback on a research result.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
