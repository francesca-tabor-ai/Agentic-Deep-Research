import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, FileUp, History } from "lucide-react";
import { useLocation } from "wouter";

interface ResearchQuery {
  id: number;
  query: string;
  topic?: string;
  createdAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
}

export default function Research() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const [queryText, setQueryText] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentQueries, setRecentQueries] = useState<ResearchQuery[]>([]);
  const [showVaultUpload, setShowVaultUpload] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <p className="mb-4 text-foreground">Please sign in to access research features.</p>
          <Button onClick={() => setLocation("/")}>Return Home</Button>
        </Card>
      </div>
    );
  }

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setIsSubmitting(true);
    try {
      console.log("Submitting query:", { queryText, topic });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deep Research</h1>
            <p className="text-sm text-muted-foreground">Autonomous literature analysis with trusted AI</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Research Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Input Card */}
            <Card className="research-card">
              <h2 className="text-lg font-semibold text-foreground mb-4">Research Query</h2>
              <form onSubmit={handleSubmitQuery} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Research Question
                  </label>
                  <Textarea
                    placeholder="Enter your research question or topic. Example: What are the latest advances in protein folding using transformer architectures?"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    className="min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Topic (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Machine Learning, Biology, Chemistry"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !queryText.trim()}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Start Research
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowVaultUpload(!showVaultUpload)} 
                    className="gap-2"
                  >
                    <FileUp className="h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>
              </form>
            </Card>

            {/* Vault Upload Section */}
            {showVaultUpload && (
              <Card className="research-card border-dashed border-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">Upload Research Documents</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-card/50 transition-colors">
                  <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">Drag and drop your files here</p>
                  <p className="text-xs text-muted-foreground">Supported: PDF, TXT, DOCX (Max 50MB)</p>
                  <input type="file" multiple className="hidden" />
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>💡 Tip: Upload your private research notes, datasets, and papers to combine with public literature for personalized insights.</p>
                </div>
              </Card>
            )}

            {/* Research Agent Workflow Visualization */}
            <Card className="research-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Research Agent Workflow</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">1</div>
                  <div>
                    <p className="font-medium text-foreground">Query Planning</p>
                    <p className="text-sm text-muted-foreground">Agent decomposes your research question into sub-tasks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">2</div>
                  <div>
                    <p className="font-medium text-foreground">Multi-Source Retrieval</p>
                    <p className="text-sm text-muted-foreground">Searches public databases and your vault documents</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">3</div>
                  <div>
                    <p className="font-medium text-foreground">Synthesis & Analysis</p>
                    <p className="text-sm text-muted-foreground">Analyzes findings, identifies consensus and conflicts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">4</div>
                  <div>
                    <p className="font-medium text-foreground">Citation Grounding</p>
                    <p className="text-sm text-muted-foreground">Every claim is linked to sources with confidence scores</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Research History */}
            <Card className="research-card">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Recent Research</h3>
              </div>
              {recentQueries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No research queries yet. Start with a question above.</p>
              ) : (
                <div className="space-y-2">
                  {recentQueries.map((q) => (
                    <div key={q.id} className="p-2 rounded border border-border/50 hover:bg-card/50 cursor-pointer transition-colors">
                      <p className="text-xs font-medium text-foreground truncate">{q.query}</p>
                      <p className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Trust Indicators */}
            <Card className="research-card">
              <h3 className="font-semibold text-foreground mb-4">Trust Indicators</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">100% citation coverage</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">Confidence scoring</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">Transparent reasoning</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">Source traceability</span>
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="research-card bg-blue-500/5 border-blue-500/20">
              <h3 className="font-semibold text-foreground mb-3">Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Be specific in your research question</li>
                <li>• Upload relevant documents for context</li>
                <li>• Review confidence scores carefully</li>
                <li>• Provide feedback to improve results</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
