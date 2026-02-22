import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, AlertTriangle, ExternalLink, ThumbsUp, ThumbsDown, Save } from "lucide-react";
import { useLocation } from "wouter";

interface Citation {
  id: number;
  source: string;
  sourceUrl?: string;
  authors?: string[];
  publicationDate?: string;
  relevanceScore?: number;
  context?: string;
  citationIndex?: number;
}

interface ResearchResult {
  id: number;
  summary: string;
  keyFindings: string[];
  consensus: string;
  disagreements: string[];
  researchGaps: string[];
  confidenceScore: number;
  citations: Citation[];
}

export default function ResearchResults() {
  const [, setLocation] = useLocation();
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Mock research result data
  const result: ResearchResult = {
    id: 1,
    summary: "Recent advances in protein folding using transformer architectures have demonstrated significant improvements over traditional methods. These AI-driven approaches leverage attention mechanisms to predict protein structures with unprecedented accuracy.",
    keyFindings: [
      "Transformer-based models achieve 95%+ accuracy on CASP14 benchmark",
      "Attention mechanisms effectively capture long-range dependencies in protein sequences",
      "Multi-MSA (Multiple Sequence Alignment) inputs improve prediction reliability",
      "End-to-end training reduces computational overhead compared to traditional pipelines",
    ],
    consensus: "The research community widely accepts that transformer architectures represent a paradigm shift in protein structure prediction. There is strong agreement that attention mechanisms are crucial for capturing sequence-structure relationships.",
    disagreements: [
      "Debate exists regarding the necessity of evolutionary information (MSA) vs. raw sequence alone",
      "Some researchers question the generalization of models trained primarily on AlphaFold datasets",
      "Disagreement on computational resource requirements for practical deployment",
    ],
    researchGaps: [
      "Limited research on protein-protein interaction prediction using transformers",
      "Few studies on real-time prediction for drug discovery applications",
      "Insufficient work on uncertainty quantification in predictions",
      "Gaps in understanding how transformers handle rare protein families",
    ],
    confidenceScore: 87,
    citations: [
      {
        id: 1,
        source: "AlphaFold2: Highly accurate protein structure prediction with AlphaFold",
        sourceUrl: "https://example.com/alphafold2",
        authors: ["Jumper, J.", "Evans, R.", "et al."],
        publicationDate: "2021",
        relevanceScore: 98,
        context: "Foundational work on transformer-based protein folding",
        citationIndex: 1,
      },
      {
        id: 2,
        source: "Attention is All You Need",
        sourceUrl: "https://example.com/attention",
        authors: ["Vaswani, A.", "Shazeer, N.", "et al."],
        publicationDate: "2017",
        relevanceScore: 95,
        context: "Original transformer architecture paper",
        citationIndex: 2,
      },
      {
        id: 3,
        source: "ESMFold: Protein structure prediction from language models",
        sourceUrl: "https://example.com/esmfold",
        authors: ["Lin, Z.", "Akin, H.", "et al."],
        publicationDate: "2022",
        relevanceScore: 92,
        context: "Alternative transformer approach using language models",
        citationIndex: 3,
      },
    ],
  };

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-500/20 text-green-300 border-green-500/30";
    if (score >= 70) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-red-500/20 text-red-300 border-red-500/30";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 85) return "High Confidence";
    if (score >= 70) return "Medium Confidence";
    return "Low Confidence";
  };

  const handleSubmitFeedback = async () => {
    setIsSubmittingFeedback(true);
    try {
      // TODO: Call tRPC procedure to submit feedback
      console.log("Submitting feedback:", { rating: feedbackRating, comment: feedbackComment });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Research Results</h1>
            <p className="text-sm text-muted-foreground">Protein folding with transformer architectures</p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/research")}>
            New Research
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Confidence Score Card */}
            <Card className="research-card border-2 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">Research Quality Metrics</h2>
                  <p className="text-sm text-muted-foreground">AI-generated analysis confidence and trust indicators</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getConfidenceBadgeColor(result.confidenceScore)}`}>
                  <span className="text-2xl font-bold">{result.confidenceScore}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence Level</span>
                  <Badge className={getConfidenceBadgeColor(result.confidenceScore)}>
                    {getConfidenceLabel(result.confidenceScore)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Citation Coverage</span>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">100%</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sources Referenced</span>
                  <Badge variant="outline">{result.citations.length} sources</Badge>
                </div>
              </div>
            </Card>

            {/* Summary */}
            <Card className="research-card">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Executive Summary
              </h3>
              <p className="text-foreground leading-relaxed">{result.summary}</p>
            </Card>

            {/* Key Findings */}
            <Card className="research-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Key Findings</h3>
              <div className="space-y-3">
                {result.keyFindings.map((finding, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <p className="text-foreground text-sm">{finding}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Consensus & Disagreements */}
            <Tabs defaultValue="consensus" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="consensus">Consensus</TabsTrigger>
                <TabsTrigger value="disagreements">Disagreements</TabsTrigger>
              </TabsList>

              <TabsContent value="consensus" className="mt-4">
                <Card className="research-card">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Research Consensus</h4>
                      <p className="text-sm text-muted-foreground">Areas of agreement across sources</p>
                    </div>
                  </div>
                  <p className="text-foreground leading-relaxed">{result.consensus}</p>
                </Card>
              </TabsContent>

              <TabsContent value="disagreements" className="mt-4">
                <Card className="research-card">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Conflicting Findings</h4>
                      <p className="text-sm text-muted-foreground">Areas where researchers disagree</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {result.disagreements.map((disagreement, idx) => (
                      <div key={idx} className="flex gap-2 p-2 rounded border border-yellow-500/20 bg-yellow-500/5">
                        <span className="text-yellow-400 font-bold">•</span>
                        <p className="text-sm text-foreground">{disagreement}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Research Gaps */}
            <Card className="research-card">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Research Gaps</h4>
                  <p className="text-sm text-muted-foreground">Areas needing further investigation</p>
                </div>
              </div>
              <div className="space-y-2">
                {result.researchGaps.map((gap, idx) => (
                  <div key={idx} className="flex gap-2 p-2 rounded border border-blue-500/20 bg-blue-500/5">
                    <span className="text-blue-400 font-bold">→</span>
                    <p className="text-sm text-foreground">{gap}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Citations */}
            <Card className="research-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sources & Citations</h3>
              <div className="space-y-3">
                {result.citations.map((citation) => (
                  <div key={citation.id} className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{citation.source}</h4>
                        {citation.authors && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {citation.authors.join(", ")}
                            {citation.publicationDate && ` (${citation.publicationDate})`}
                          </p>
                        )}
                      </div>
                      {citation.relevanceScore && (
                        <Badge variant="outline" className="ml-2">
                          {citation.relevanceScore}% relevant
                        </Badge>
                      )}
                    </div>
                    {citation.context && (
                      <p className="text-sm text-muted-foreground mb-2 italic">"{citation.context}"</p>
                    )}
                    {citation.sourceUrl && (
                      <a
                        href={citation.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View Source <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Feedback Card */}
            <Card className="research-card">
              <h3 className="font-semibold text-foreground mb-4">Research Quality Feedback</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rate this research</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFeedbackRating(rating)}
                        className={`w-8 h-8 rounded text-lg transition-colors ${
                          feedbackRating === rating
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Feedback (optional)</label>
                  <Textarea
                    placeholder="Share your thoughts on this research analysis..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="min-h-20 text-sm"
                  />
                </div>

                <Button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback}
                  className="w-full gap-2"
                >
                  {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </Card>

            {/* Trust Indicators */}
            <Card className="research-card border-green-500/20 bg-green-500/5">
              <h3 className="font-semibold text-foreground mb-3">Trust Indicators</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-muted-foreground">All claims cited</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-muted-foreground">Confidence scored</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-muted-foreground">Sources traceable</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-muted-foreground">Reasoning transparent</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="research-card">
              <h3 className="font-semibold text-foreground mb-3">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full gap-2" onClick={() => setLocation("/research")}>
                  <Save className="h-4 w-4" />
                  Save Session
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
