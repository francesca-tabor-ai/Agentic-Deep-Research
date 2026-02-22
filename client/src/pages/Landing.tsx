import { Link } from 'wouter';
import {
  Search,
  FileSearch,
  BookOpen,
  Shield,
  ArrowRight,
  Library,
  Sparkles,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="font-serif font-semibold text-lg text-foreground">
            Agentic Deep Research
          </span>
          <nav className="flex items-center gap-6">
            <Link
              href="/research"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Research
            </Link>
            <Link
              href="/vault"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Vault
            </Link>
            <Link
              href="/metrics"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Metrics
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start researching
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <section className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4" />
            Trusted, citation-grounded research
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            From question to synthesis in one place
          </h1>
          <p className="text-lg text-muted-foreground text-balance mb-10">
            Ask complex research questions in plain language. The system plans, retrieves sources,
            synthesizes findings, and returns structured answers with full citations and
            traceability.
          </p>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Go to Research
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Capabilities overview */}
        <section className="mb-24">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2 text-center">
            Research capabilities
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Deep Research mode supports literature review, gap identification, and
            workspace-aware retrieval with citations you can verify.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: 'Natural language queries',
                description:
                  'Ask questions or describe topics in your own words. No need for keywords or query syntax.',
              },
              {
                icon: FileSearch,
                title: 'Literature synthesis',
                description:
                  'Multi-document reasoning and structured summaries with consensus and disagreements highlighted.',
              },
              {
                icon: Shield,
                title: 'Citation-grounded answers',
                description:
                  'Every claim links to sources. Confidence scores and evidence traceability built in.',
              },
              {
                icon: BookOpen,
                title: 'Vault integration',
                description:
                  'Upload and reference your own documents. Research is aware of your workspace context.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-border bg-card text-foreground shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center">
          <Library className="w-12 h-12 text-primary mx-auto mb-4 opacity-90" />
          <h2 className="font-serif text-xl font-bold text-foreground mb-2">
            Ready to run a deep research task?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Open the research interface to enter your question, adjust options, and view query
            history. Add documents to your Vault to improve context.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Research
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vault"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background font-medium hover:bg-muted transition-colors"
            >
              Vault
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-24 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          Agentic Deep Research — Phase 2 UI
        </div>
      </footer>
    </div>
  );
}
