import { Link } from 'wouter';
import { History, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { ResearchQuery } from '@/api';

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
  isLoading?: boolean;
  selectedId?: number | null;
}

export default function QueryHistorySidebar({
  queries,
  isLoading,
  selectedId,
}: QueryHistorySidebarProps) {
  return (
    <aside className="w-full sm:w-72 shrink-0 border-r border-border bg-card/50 flex flex-col min-h-0">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Query history</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : queries.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-6 text-center">
            No queries yet. Run a research task to see history here.
          </p>
        ) : (
          <ul className="space-y-1">
            {queries.map((q) => {
              const { label, icon: StatusIcon, className } = statusConfig[q.status];
              const isSelected = selectedId === q.id;
              return (
                <li key={q.id}>
                  <Link href={`/research?q=${q.id}`}>
                    <a
                      className={`block px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted/60 text-foreground'
                      }`}
                    >
                      <p className="text-sm font-medium line-clamp-2 mb-1">{q.query_text}</p>
                      <div className={`flex items-center gap-1.5 text-xs ${className}`}>
                        <StatusIcon
                          className={`w-3.5 h-3.5 ${q.status === 'in_progress' ? 'animate-spin' : ''}`}
                        />
                        <span>{label}</span>
                        <span className="text-muted-foreground ml-1">
                          {new Date(q.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
