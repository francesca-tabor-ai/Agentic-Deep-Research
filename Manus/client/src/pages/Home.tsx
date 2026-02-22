import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, Zap, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">LeapSpace</span>
          </div>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                <Button onClick={() => setLocation("/research")} variant="default">
                  Start Researching
                </Button>
              </div>
            ) : (
              <Button asChild variant="default">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Autonomous Research Intelligence
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Conduct deep literature analysis with trusted AI. Every claim is traceable to its source. 
            Every reasoning step is transparent. Accelerate discovery with verifiable intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => setLocation("/research")} className="gap-2">
                Begin Deep Research <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="gap-2">
                  <a href={getLoginUrl()}>
                    Get Started <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16 text-foreground">
            Trustworthy Research at Scale
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <Card className="research-card">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Autonomous Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Multi-step reasoning that synthesizes literature, identifies consensus, 
                    and highlights conflicting findings automatically.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="research-card">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Full Attribution</h3>
                  <p className="text-sm text-muted-foreground">
                    Every claim is grounded in sources. Inline citations, confidence scores, 
                    and transparent reasoning paths for complete verifiability.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="research-card">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Workspace Vault</h3>
                  <p className="text-sm text-muted-foreground">
                    Securely upload and index your private research documents, notes, and datasets. 
                    Combine with public literature for personalized insights.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="research-card">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Research History</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your research journey. Save queries, refine results iteratively, 
                    and build on previous discoveries.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container py-20 border-t border-border/50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Built for Trust
          </h2>
          <p className="text-muted-foreground mb-12">
            Scientific research demands verifiability. LeapSpace is designed from the ground up 
            to provide transparent, traceable, and trustworthy AI-powered analysis. Every output 
            is auditable. Every reasoning step is visible.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Citation Coverage</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">≤2%</div>
              <p className="text-sm text-muted-foreground">Hallucination Rate Target</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">≥90%</div>
              <p className="text-sm text-muted-foreground">Retrieval Relevance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl rounded-lg border border-primary/20 bg-primary/5 p-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Ready to Transform Your Research?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join researchers accelerating discovery with trustworthy AI.
          </p>
          {isAuthenticated ? (
            <Button size="lg" onClick={() => setLocation("/research")} className="gap-2">
              Start Deep Research <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" asChild className="gap-2">
              <a href={getLoginUrl()}>
                Get Started Free <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>LeapSpace Agentic Deep Research © 2026. Trustworthy AI for Scientific Discovery.</p>
        </div>
      </footer>
    </div>
  );
}
