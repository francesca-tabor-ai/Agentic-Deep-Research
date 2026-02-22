import { Link } from 'wouter';
import { History, FileText, Loader2, CheckCircle, XCircle, Bookmark, BookmarkCheck, GitBranch } from 'lucide-react';
import type { ResearchQuery } from '@/api';
import { updateQuerySaved } from '@/api';

const statusConfig: Record<
  ResearchQuery['status'],
  { label: string; icon: typeof Loader2; className: string }
> = {
  pending: {
    label: 'Pending',
    icon: FileText,
    className: 'text-muted-foreground',
  },
  in_progress: {
    label: 'In progress',
    icon: Loader2,
    className: 'text-primary',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'text-green-600',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'text-red-600',
  },
};

export interface QueryHistorySidebarProps {
  queries: ResearchQuery[];
  relatedQueries?: ResearchQuery[];
  isLoading?: boolean;
  selectedId?: number | null;
  savedOnly?: boolean;
  onSavedFilterChange?: (savedOnly: boolean) => void;
  onRefine?: (query: ResearchQuery) => void;
  onSaveChange?: () => void;
}

export default function QueryHistorySidebar({
  queries,
  relatedQueries = [],
  isLoading,
  selectedId,
  savedOnly = false,
  onSavedFilterChange,
  onRefine,
  onSaveChange,
}: QueryHistorySidebarProps) {
  const handleToggleSaved = async (e: React.MouseEvent, q: ResearchQuery) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateQuerySaved(q.id, !q.saved_at);
      onSaveChange?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefine = (e: React.MouseEvent, q: ResearchQuery) => {
    e.preventDefault();
    e.stopPropagation();
    onRefine?.(q);
  };

  return (
    <aside className="w-full sm:w-72 shrink-0 border-r border-border bg-card/50 flex flex-col min-h-0">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Query history</h2>
        </div>
        {onSavedFilterChange && (
          <div className="flex rounded-lg border border-border p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => onSavedFilterChange(false)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                !savedOnly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onSavedFilterChange(true)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${
                savedOnly ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              Saved
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : queries.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-6 text-center">
            {savedOnly ? 'No saved queries.' : 'No queries yet. Run a research task to see history here.'}
          </p>
        ) : (
          <ul className="space-y-1">
            {queries.map((q) => {
              const { label, icon: StatusIcon, className } = statusConfig[q.status];
              const isSelected = selectedId === q.id;
              return (
                <li key={q.id}>
                  <Link href={`/research?q=${q.id}`}>
                    <span
                      className={`relative block px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer group ${
                        isSelected
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <p className="text-sm font-medium line-clamp-2 mb-1 pr-6">{q.query_text}</p>
                      <div className={`flex items-center gap-1.5 text-xs ${className}`}>
                        <StatusIcon
                          className={`w-3.5 h-3.5 ${q.status === 'in_progress' ? 'animate-spin' : ''}`}
                        />
                        <span>{label}</span>
                        <span className="text-muted-foreground ml-1">
                          {new Date(q.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleToggleSaved(e, q)}
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          title={q.saved_at ? 'Unsave' : 'Save'}
                          aria-label={q.saved_at ? 'Unsave' : 'Save'}
                        >
                          {q.saved_at ? (
                            <BookmarkCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        {onRefine && (
                          <button
                            type="button"
                            onClick={(e) => handleRefine(e, q)}
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            title="Refine / New from this"
                            aria-label="Refine"
                          >
                            <GitBranch className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {relatedQueries.length > 0 && selectedId != null && (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Related (refinements)
            </h3>
            <ul className="space-y-1">
              {relatedQueries.map((q) => {
                const { label, icon: StatusIcon, className } = statusConfig[q.status];
                const isSelected = selectedId === q.id;
                return (
                  <li key={q.id}>
                    <Link href={`/research?q=${q.id}`}>
                      <span
                        className={`block px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <p className="text-xs font-medium line-clamp-2 mb-1">{q.query_text}</p>
                        <div className={`flex items-center gap-1 text-xs ${className}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{label}</span>
                        </div>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
