import { FileText, BarChart3, BookOpen, Shield, Lightbulb, TrendingUp } from 'lucide-react';

export interface ResearchTemplate {
  id: string;
  title: string;
  description: string;
  queryText: string;
  icon: typeof FileText;
}

const TEMPLATES: ResearchTemplate[] = [
  {
    id: 'competitive',
    title: 'Competitive analysis',
    description: 'Compare players, strengths, gaps, and positioning in a market.',
    queryText: 'What are the main competitors in [industry/product category], their strengths and weaknesses, market positioning, and where are the gaps or opportunities?',
    icon: BarChart3,
  },
  {
    id: 'literature',
    title: 'Literature review',
    description: 'Synthesize academic and industry consensus on a topic.',
    queryText: 'What is the current consensus in the literature on [topic]? Summarize key findings, methodologies, areas of agreement, disagreements, and identify research gaps.',
    icon: BookOpen,
  },
  {
    id: 'market-sizing',
    title: 'Market sizing',
    description: 'Estimate market size, growth, and key drivers.',
    queryText: 'What is the estimated market size for [market/segment], growth rate, key drivers and trends, and leading sources or methodologies used to estimate it?',
    icon: TrendingUp,
  },
  {
    id: 'due-diligence',
    title: 'Due diligence',
    description: 'Risks, red flags, and key considerations for an investment or partnership.',
    queryText: 'What are the main risks, regulatory considerations, competitive threats, and red flags to consider for [company/opportunity/partnership]? Include notable controversies or concerns.',
    icon: Shield,
  },
  {
    id: 'technology-landscape',
    title: 'Technology landscape',
    description: 'Survey technologies, approaches, and adoption for a domain.',
    queryText: 'What are the key technologies, approaches, and tools used in [domain]? Compare maturity, adoption trends, trade-offs, and emerging alternatives.',
    icon: Lightbulb,
  },
  {
    id: 'policy-regulation',
    title: 'Policy and regulation',
    description: 'Regulatory landscape and compliance requirements.',
    queryText: 'What are the current and emerging regulations, policies, or compliance requirements for [industry/region/topic]? Summarize implications, timelines, and key authorities.',
    icon: FileText,
  },
];

export interface ResearchTemplatesProps {
  onSelect: (queryText: string) => void;
}

export default function ResearchTemplates({ onSelect }: ResearchTemplatesProps) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60">
        <h3 className="font-sans text-sm font-semibold text-foreground tracking-tight">
          Start from a template
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pre-built structures for common research workflows
        </p>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.queryText)}
              className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-card text-left hover:bg-muted/50 hover:border-primary/30 hover-lift transition-all duration-200 tap-scale"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-4 h-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-foreground text-sm block truncate">
                  {t.title}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {t.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
