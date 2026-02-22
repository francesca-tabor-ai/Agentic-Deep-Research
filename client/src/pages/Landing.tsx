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
      <a
        href="#main-content"
        className="absolute -left-[9999px] w-px h-px overflow-hidden focus:left-4 focus:top-4 focus:z-[100] focus:w-auto focus:h-auto focus:overflow-visible focus:px-4 focus:py-2 focus:rounded-2xl focus:ring-2 focus:ring-primary focus:bg-background focus:outline-none"
      >
        Skip to main content
      </a>
      {/* Hero */}
      <header className="border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <span className="font-sans text-lg font-semibold tracking-tight text-foreground">
            Agentic Deep Research
          </span>
          <nav className="flex items-center gap-8" aria-label="Main navigation">
            <Link
              href="/research"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Research
            </Link>
            <Link
              href="/vault"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Vault
            </Link>
            <Link
              href="/metrics"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Metrics
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity duration-200 shadow-soft"
            >
              Start researching
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32" role="main">
        <section className="text-center max-w-3xl mx-auto mb-28">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-signature text-white text-sm font-medium mb-8 shadow-soft">
            <Sparkles className="w-4 h-4 opacity-90" aria-hidden />
            Trusted, citation-grounded research
          </div>
          <h1 className="font-sans text-display sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            From question to synthesis in one place
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance mb-12 leading-relaxed font-normal">
            Ask complex research questions in plain language. The system plans, retrieves sources,
            synthesizes findings, and returns structured answers with full citations and
            traceability.
          </p>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-signature text-white font-semibold hover:opacity-95 transition-opacity duration-200 shadow-soft-lg"
          >
            Go to Research
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
        </section>

        {/* Capabilities overview */}
        <section className="mb-32">
          <h2 className="font-sans text-2xl font-bold text-foreground mb-3 text-center tracking-tight">
            Research capabilities
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16 text-base leading-relaxed">
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
                className="p-8 rounded-3xl border border-border bg-card text-foreground shadow-soft hover:shadow-soft-lg transition-shadow duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <Icon className="w-6 h-6" aria-hidden />
                </div>
                <h3 className="font-sans font-semibold text-foreground mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-border bg-card p-10 sm:p-16 text-center shadow-soft">
          <Library className="w-14 h-14 text-primary mx-auto mb-5 opacity-90" aria-hidden />
          <h2 className="font-sans text-xl font-bold text-foreground mb-3 tracking-tight">
            Ready to run a deep research task?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Open the research interface to enter your question, adjust options, and view query
            history. Add documents to your Vault to improve context.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition-opacity duration-200 shadow-soft"
            >
              Research
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              href="/vault"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-background font-medium text-foreground hover:bg-muted/60 transition-colors duration-200"
            >
              Vault
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-32 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground leading-relaxed">
          Agentic Deep Research — citation-grounded research with vault and metrics
        </div>
      </footer>
    </div>
  );
}
