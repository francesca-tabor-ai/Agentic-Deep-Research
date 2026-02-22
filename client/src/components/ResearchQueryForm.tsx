import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

export interface ResearchQueryFormProps {
  onSubmit: (queryText: string, options?: AdvancedOptions) => void;
  isSubmitting?: boolean;
  /** Pre-fill the input (e.g. when refining from a previous query). */
  initialQueryText?: string;
}

export interface AdvancedOptions {
  depth?: 'standard' | 'deep' | 'comprehensive';
  includeVault?: boolean;
  maxSources?: number;
}

const DEPTH_LABELS: Record<NonNullable<AdvancedOptions['depth']>, string> = {
  standard: 'Standard',
  deep: 'Deep',
  comprehensive: 'Comprehensive',
};

export default function ResearchQueryForm({
  onSubmit,
  isSubmitting = false,
  initialQueryText,
}: ResearchQueryFormProps) {
  const [queryText, setQueryText] = useState(initialQueryText ?? '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  useEffect(() => {
    if (initialQueryText != null) setQueryText(initialQueryText);
  }, [initialQueryText]);
  const [depth, setDepth] = useState<AdvancedOptions['depth']>('standard');
  const [includeVault, setIncludeVault] = useState(true);
  const [maxSources, setMaxSources] = useState(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = queryText.trim();
    if (!trimmed) return;
    onSubmit(trimmed, {
      depth,
      includeVault,
      maxSources: maxSources > 0 ? maxSources : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label htmlFor="query-input" className="sr-only">
          Research question or topic
        </label>
        <textarea
          id="query-input"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="e.g. What is the current consensus on microplastics in marine food chains? Or: recent advances in CRISPR delivery for gene therapy."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y min-h-[120px]"
          disabled={isSubmitting}
        />
        <div className="absolute bottom-3 right-3 text-muted-foreground/60 text-xs">
          Natural language — describe your topic or question
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          Advanced options
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {showAdvanced && (
          <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border/60">
            <div>
              <label htmlFor="depth" className="block text-sm font-medium text-foreground mb-1">
                Depth
              </label>
              <select
                id="depth"
                value={depth}
                onChange={(e) => setDepth(e.target.value as AdvancedOptions['depth'])}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {(Object.keys(DEPTH_LABELS) as Array<keyof typeof DEPTH_LABELS>).map((k) => (
                  <option key={k} value={k}>
                    {DEPTH_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeVault}
                onChange={(e) => setIncludeVault(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/50"
              />
              <span className="text-sm text-foreground">Include Vault documents in context</span>
            </label>
            <div>
              <label htmlFor="max-sources" className="block text-sm font-medium text-foreground mb-1">
                Max sources (optional)
              </label>
              <input
                id="max-sources"
                type="number"
                min={1}
                max={100}
                value={maxSources}
                onChange={(e) => setMaxSources(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!queryText.trim() || isSubmitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Run research
          </>
        )}
      </button>
    </form>
  );
}
