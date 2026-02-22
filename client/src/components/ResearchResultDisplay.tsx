import {
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Shield,
  MessageSquare,
  Star,
  GitBranch,
  Link2,
} from 'lucide-react';
import { useState } from 'react';
import type { ResearchResult, Citation, ResearchReportContent, UserFeedback } from '@/api';
import { submitFeedback } from '@/api';

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
  feedback?: UserFeedback[];
  onFeedbackSubmitted?: () => void;
}

function ReasoningPathCard({ result }: { result: ResearchResult }) {
  const [open, setOpen] = useState(false);
  let snapshot: { steps?: string[]; chunk_count?: number; section_count?: number; source_count?: number; vault_sources?: number; public_sources?: number } | null = null;
  if (result.reasoning_snapshot) {
    try {
      snapshot = JSON.parse(result.reasoning_snapshot) as typeof snapshot;
    } catch {
      snapshot = null;
    }
  }
  if (!snapshot) return null;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-foreground flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          How we got here
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 space-y-2 text-sm text-muted-foreground">
          {snapshot.steps && <p>Steps: {snapshot.steps.join(' → ')}</p>}
          {snapshot.chunk_count != null && <p>Retrieved {snapshot.chunk_count} chunks</p>}
          {snapshot.section_count != null && <p>Synthesized into {snapshot.section_count} sections</p>}
          {snapshot.source_count != null && <p>{snapshot.source_count} sources cited</p>}
          {(snapshot.vault_sources != null || snapshot.public_sources != null) && (
            <p>
              Vault: {snapshot.vault_sources ?? 0}, public: {snapshot.public_sources ?? 0}
            </p>
          )}
          {result.duration_ms != null && <p>Run time: {(result.duration_ms / 1000).toFixed(1)}s</p>}
        </div>
      )}
    </div>
  );
}

function AttributionSummary({
  report,
  citationsBySourceId,
  citations,
}: {
  report: ResearchReportContent;
  citationsBySourceId: Map<string, Citation>;
  citations: Citation[];
}) {
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <Link2 className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Source attribution</h2>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          Which sources support each part of this report:
        </p>
        <ul className="space-y-2">
          {report.sections.map((sec, i) => {
            const refs = sec.sourceIds
              .map((id) => citationsBySourceId.get(id))
              .filter(Boolean) as Citation[];
            const list = refs.length ? refs : citations;
            return (
              <li key={i} className="text-sm">
                <span className="font-medium text-foreground">{sec.heading}</span>
                <span className="text-muted-foreground"> ← </span>
                <span className="text-muted-foreground">
                  {list.map((c) => c.title || 'Source').join(', ')}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function FeedbackSection({
  resultId,
  feedback = [],
  onSubmitted,
}: {
  resultId: number;
  feedback: UserFeedback[];
  onSubmitted?: () => void;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating == null && !text.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitFeedback({
        research_result_id: resultId,
        rating: rating ?? undefined,
        feedback_text: text.trim() || undefined,
      });
      setRating(null);
      setText('');
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden" aria-labelledby="feedback-heading">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 id="feedback-heading" className="font-semibold text-foreground">Rate this research</h2>
      </div>
      <div className="p-4 space-y-4">
        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {submitError}
          </p>
        )}
        {feedback.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Previous feedback</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {feedback.map((f) => (
                <li key={f.id}>
                  {f.rating != null && (
                    <span className="inline-flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <Star
                          key={r}
                          className={`w-4 h-4 ${r <= (f.rating ?? 0) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </span>
                  )}
                  {f.feedback_text && ` — ${f.feedback_text}`}
                  <span className="ml-1 text-xs">{new Date(f.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rating (1–5)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={`p-2 rounded-lg border transition-colors ${
                    rating === r
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted/60'
                  }`}
                  aria-label={`${r} stars`}
                >
                  <Star className={`w-5 h-5 ${rating === r ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="feedback-text" className="block text-sm font-medium text-foreground mb-1">
              Comment (optional)
            </label>
            <textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="What was helpful or missing?"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || (rating == null && !text.trim())}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit feedback'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function ResearchResultDisplay({
  result,
  citations,
  feedback = [],
  onFeedbackSubmitted,
}: ResearchResultDisplayProps) {
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

  const confidence = result.confidence ?? report.confidence;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Confidence & run metrics */}
      <div className="flex flex-wrap items-center gap-4">
        <ConfidenceBadge confidence={confidence} />
        {result.duration_ms != null && (
          <span className="text-sm text-muted-foreground">
            Run time: {(result.duration_ms / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {/* Reasoning path (explainability) */}
      <ReasoningPathCard result={result} />

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

      {/* Attribution: section → sources */}
      <AttributionSummary
        report={report}
        citationsBySourceId={citationsBySourceId}
        citations={citations}
      />

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

      {/* Feedback */}
      <FeedbackSection
        resultId={result.id}
        feedback={feedback}
        onSubmitted={onFeedbackSubmitted}
      />
    </div>
  );
}
