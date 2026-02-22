import {
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import type { ResearchResult, Citation, ResearchReportContent } from '@/api';

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const level =
    confidence >= 0.7 ? 'high' : confidence >= 0.4 ? 'medium' : 'low';
  const label = level === 'high' ? 'High confidence' : level === 'medium' ? 'Medium confidence' : 'Low confidence';
  const bg =
    level === 'high'
      ? 'bg-primary/15 text-primary'
      : level === 'medium'
        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
        : 'bg-muted text-muted-foreground';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${bg}`}
        title={`${pct}% confidence`}
      >
        <Shield className="w-4 h-4" />
        {label} — {pct}%
      </span>
      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CitationLink({
  citation,
  index,
}: {
  citation: Citation;
  index: number;
}) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className="font-medium text-muted-foreground shrink-0">[{index + 1}]</span>
      {citation.source_url ? (
        <a
          href={citation.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1 break-all"
        >
          {citation.title || 'Source'}
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      ) : (
        <span className="text-foreground">{citation.title || 'Source'}</span>
      )}
    </li>
  );
}

function SectionWithCitations({
  section,
  citationsBySourceId,
  citationList,
}: {
  section: ResearchReportContent['sections'][0];
  citationsBySourceId: Map<string, Citation>;
  citationList: Citation[];
}) {
  const refs = section.sourceIds
    .map((id) => citationsBySourceId.get(id))
    .filter(Boolean) as Citation[];
  const fallbackRefs = refs.length === 0 ? citationList : refs;

  return (
    <section className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground">{section.heading}</h3>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-foreground whitespace-pre-wrap">{section.text}</p>
        <div className="pt-2 border-t border-border/60">
          <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
          <ul className="space-y-1">
            {fallbackRefs.map((c, i) => (
              <CitationLink key={c.id} citation={c} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function EvidenceTraceCard({ citation, index }: { citation: Citation; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-foreground">
          [{index + 1}] {citation.title || 'Untitled source'}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 space-y-2">
          {citation.source_url && (
            <a
              href={citation.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Open source <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {citation.snippet && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap border-l-2 border-primary/30 pl-3">
              {citation.snippet}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export interface ResearchResultDisplayProps {
  result: ResearchResult;
  citations: Citation[];
}

export default function ResearchResultDisplay({ result, citations }: ResearchResultDisplayProps) {
  let report: ResearchReportContent | null = null;
  try {
    report = result.content ? (JSON.parse(result.content) as ResearchReportContent) : null;
  } catch {
    report = null;
  }

  const citationsBySourceId = new Map<string, Citation>();
  citations.forEach((c) => {
    if (c.source_id) citationsBySourceId.set(c.source_id, c);
  });

  if (!report) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>Unable to parse report content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Confidence */}
      <div className="flex flex-wrap items-center gap-4">
        <ConfidenceBadge confidence={report.confidence} />
      </div>

      {/* Key findings / Summary */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Key findings
        </h2>
        <p className="text-foreground whitespace-pre-wrap">{report.summary}</p>
      </section>

      {/* Consensus vs. disagreement */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-foreground">Consensus &amp; disagreement</h2>
        </div>
        <div className="p-4 space-y-4">
          {report.consensus && report.consensus.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Consensus</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {report.consensus.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.disagreements && report.disagreements.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Disagreements
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {report.disagreements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {(!report.consensus || report.consensus.length === 0) &&
            (!report.disagreements || report.disagreements.length === 0) && (
              <p className="text-sm text-muted-foreground">
                Consensus and disagreement analysis can be added by the research agent in a future
                update.
              </p>
            )}
        </div>
      </section>

      {/* Structured sections with inline citations */}
      <section>
        <h2 className="font-semibold text-foreground mb-4">Synthesis by source</h2>
        <div className="space-y-4">
          {report.sections.map((sec, i) => (
            <SectionWithCitations
              key={i}
              section={sec}
              citationsBySourceId={citationsBySourceId}
              citationList={citations}
            />
          ))}
        </div>
      </section>

      {/* Research gaps */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Research gaps</h2>
        </div>
        <div className="p-4">
          {report.researchGaps && report.researchGaps.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {report.researchGaps.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Identified research gaps will appear here when the agent supports gap analysis.
            </p>
          )}
        </div>
      </section>

      {/* Source transparency / evidence traces */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-foreground">Evidence &amp; source transparency</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            All sources used in this report. Expand to view excerpts.
          </p>
        </div>
        <div className="p-4 space-y-2">
          {citations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No citations recorded.</p>
          ) : (
            citations.map((c, i) => (
              <EvidenceTraceCard key={c.id} citation={c} index={i} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
