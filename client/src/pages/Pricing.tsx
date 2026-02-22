import { Link } from 'wouter';
import {
  Check,
  ArrowRight,
  Users,
  Zap,
  Building2,
} from 'lucide-react';

const tiers = [
  {
    name: 'Individual',
    icon: Zap,
    price: 29,
    period: 'month',
    description: 'For solo researchers and analysts who need citation-backed answers fast.',
    features: [
      '100 research queries per month',
      'Personal document vault (up to 5GB)',
      'Full citation traceability & confidence scores',
      'Query history & refinement',
      'Local or cloud deployment',
      'Email support',
    ],
    cta: 'Start free trial',
    href: '/research',
    highlighted: false,
  },
  {
    name: 'Team',
    icon: Users,
    price: 99,
    period: 'month',
    description: 'For research teams that collaborate and need shared context.',
    features: [
      'Everything in Individual',
      '5 team seats included',
      '500 research queries per month',
      'Shared vault (up to 50GB)',
      'Team query history & templates',
      'SSO & role-based access',
      'Priority support',
    ],
    cta: 'Start team trial',
    href: '/research',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: null,
    period: 'custom',
    description: 'For organizations with security, compliance, and custom needs.',
    features: [
      'Everything in Team',
      'Unlimited seats & queries',
      'Unlimited vault storage',
      'Custom integrations & APIs',
      'Dedicated infrastructure option',
      'SOC 2, GDPR, HIPAA compliance',
      'Dedicated success manager',
    ],
    cta: 'Contact sales',
    href: '/research',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
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
              <Link href="/pricing" className="text-sm font-medium text-foreground tap-scale">
                Pricing
              </Link>
              <Link href="/case-studies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 tap-scale">
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
        <section className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="font-sans text-display sm:text-5xl font-bold text-foreground tracking-tight mb-6">
            Simple, scalable pricing
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start with Individual, scale to Enterprise. Every plan includes citation-grounded
            research, vault integration, and full traceability.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-24">
          {tiers.map(({ name, icon: Icon, price, period, description, features, cta, href, highlighted }) => (
            <div
              key={name}
              className={`relative rounded-3xl border p-8 flex flex-col shadow-soft hover-lift ${
                highlighted
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card'
              }`}
            >
              {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most popular
                </div>
              )}
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Icon className="w-6 h-6" aria-hidden />
              </div>
              <h2 className="font-sans text-xl font-bold text-foreground mb-2">{name}</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
              <div className="mb-8">
                {price !== null ? (
                  <>
                    <span className="font-sans text-4xl font-bold text-foreground">${price}</span>
                    <span className="text-muted-foreground">/{period}</span>
                  </>
                ) : (
                  <span className="font-sans text-2xl font-bold text-foreground">Custom</span>
                )}
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                    <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-medium text-sm transition-all tap-scale ${
                  highlighted
                    ? 'bg-primary text-primary-foreground hover:opacity-95 shadow-soft'
                    : 'border border-border bg-background text-foreground hover:bg-muted/60'
                }`}
              >
                {cta}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-card p-10 sm:p-16 text-center shadow-soft">
          <h2 className="font-sans text-xl font-bold text-foreground mb-3 tracking-tight">
            Need a custom plan?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Higher query limits, more seats, or on-prem deployment? We'll tailor a plan to your
            organization's needs.
          </p>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-background font-medium text-foreground hover:bg-muted/60 transition-colors duration-200 tap-scale"
          >
            Contact sales
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
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
