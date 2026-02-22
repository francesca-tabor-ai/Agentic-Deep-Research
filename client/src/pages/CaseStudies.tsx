import { Link } from 'wouter';
import { ArrowRight, Quote } from 'lucide-react';

const caseStudies = [
  {
    company: 'Meridian Labs',
    industry: 'Life sciences',
    quote:
      'We cut literature review time from 3 weeks to 2 days. Every claim is traceable—exactly what we need for regulatory submissions.',
    outcome: '70% faster literature reviews',
  },
  {
    company: 'Stride Capital',
    industry: 'Financial services',
    quote:
      'Our analysts ask complex questions and get synthesis in minutes instead of days. The vault keeps our research proprietary.',
    outcome: '5x more research output per analyst',
  },
  {
    company: 'Atlas Product',
    industry: 'Product & strategy',
    quote:
      'We went from scattered notes and spreadsheets to one place: ask a question, get a structured answer with citations. Game changer for product decisions.',
    outcome: 'Unified research workflow',
  },
];

const logos = [
  'Meridian Labs',
  'Stride Capital',
  'Atlas Product',
  'Vertex Analytics',
  'Nexus Research',
  'Horizon Group',
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <a
        href="#main-content"
        className="absolute -left-[9999px] w-px h-px overflow-hidden focus:left-4 focus:top-4 focus:z-[100] focus:w-auto focus:h-auto focus:overflow-visible focus:px-4 focus:py-2 focus:rounded-2xl focus:ring-2 focus:ring-primary focus:bg-background focus:outline-none"
      >
        Skip to main content
      </a>
      <header className="border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-sans text-lg font-semibold tracking-tight text-foreground hover:opacity-90 transition-opacity">
            Agentic Deep Research
          </Link>
          <nav className="flex items-center gap-4 sm:gap-8" aria-label="Main navigation">
            <div className="hidden md:flex items-center gap-8">
              <Link href="/research" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 tap-scale">
                Research
              </Link>
              <Link href="/vault" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 tap-scale">
                Vault
              </Link>
              <Link href="/metrics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 tap-scale">
                Metrics
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 tap-scale">
                Pricing
              </Link>
              <Link href="/case-studies" className="text-sm font-medium text-foreground tap-scale">
                Case Studies
              </Link>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity duration-200 shadow-soft tap-scale"
            >
              Start researching
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32" role="main">
        {/* Scrolling logos */}
        <section className="mb-28" aria-label="Trusted by">
          <p className="text-center text-sm font-medium text-muted-foreground mb-10">
            Trusted by researchers and teams at
          </p>
          <div className="relative flex overflow-hidden">
            <div className="flex animate-scroll-left shrink-0 gap-16 pr-16">
              {[...logos, ...logos].map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-center shrink-0 min-w-[140px] h-12 rounded-xl border border-border bg-card px-6 font-sans font-semibold text-foreground/80"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="text-center max-w-2xl mx-auto mb-24">
          <h1 className="font-sans text-display sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            How teams use Agentic Deep Research
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From life sciences to finance to product—see how teams cut research time and ship
            insights with full traceability.
          </p>
        </section>

        {/* Case study cards */}
        <section className="space-y-10 mb-28">
          {caseStudies.map(({ company, industry, quote, outcome }, i) => (
            <article
              key={company}
              className="rounded-3xl border border-border bg-card p-10 sm:p-14 shadow-soft hover-lift animate-fade-in-up opacity-0"
              style={{ animationDelay: `${100 + i * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="md:w-1/3 shrink-0">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                    {industry}
                  </p>
                  <h2 className="font-sans text-2xl font-bold text-foreground">{company}</h2>
                  <p className="mt-2 text-sm font-semibold text-foreground">{outcome}</p>
                </div>
                <div className="flex-1">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" aria-hidden />
                  <blockquote className="text-lg text-muted-foreground leading-relaxed">
                    "{quote}"
                  </blockquote>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-card p-10 sm:p-16 text-center shadow-soft">
          <h2 className="font-sans text-xl font-bold text-foreground mb-3 tracking-tight">
            Ready to accelerate your research?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Join teams who've cut research time and shipped insights with full citation
            traceability.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition-opacity duration-200 shadow-soft tap-scale"
            >
              Start researching
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-background font-medium text-foreground hover:bg-muted/60 transition-colors duration-200 tap-scale"
            >
              View pricing
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Agentic Deep Research</span>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors tap-scale">
              Pricing
            </Link>
            <Link href="/case-studies" className="text-sm text-muted-foreground hover:text-foreground transition-colors tap-scale">
              Case Studies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
