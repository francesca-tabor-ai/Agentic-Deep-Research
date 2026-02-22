import { useRoute } from "wouter";
import { useTask } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  ExternalLink, 
  Quote, 
  BookOpen,
  Share2,
  Download
} from "lucide-react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskDetail() {
  const [, params] = useRoute("/task/:id");
  const id = params?.id || "";
  const { data: task, isLoading, error } = useTask(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Task Not Found</h1>
            <p className="text-muted-foreground">The requested research task could not be found.</p>
            <Link href="/">
              <Button>Return Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isProcessing = ["pending", "planning", "searching", "synthesizing"].includes(task.status);

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="space-y-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-serif font-bold leading-tight">
                  {task.query}
                </h1>
                <div className="flex items-center gap-3">
                  <StatusBadge status={task.status} />
                  <span className="text-sm text-muted-foreground">
                    Started {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" disabled={isProcessing} className="hidden md:flex">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Indicator (if processing) */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-primary/5 border border-primary/20 rounded-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-3 h-3 bg-primary rounded-full animate-ping absolute" />
                    <div className="w-3 h-3 bg-primary rounded-full relative" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">Research in Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      The agent is currently <strong>{task.status}</strong>... this may take a few minutes.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Report Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Report Body */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Research Synthesis
                </h2>
                
                {task.result ? (
                  <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline">
                    <ReactMarkdown>{task.result}</ReactMarkdown>
                  </article>
                ) : (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Citations Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card rounded-xl border border-border p-5 sticky top-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Quote className="w-4 h-4 text-primary" />
                  Sources & Citations
                </h3>
                
                {!task.citations || task.citations.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    {isProcessing ? "Gathering sources..." : "No citations available."}
                  </p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {task.citations.map((citation, idx) => (
                      <AccordionItem key={citation.id} value={citation.id} className="border-b-0 mb-2">
                        <AccordionTrigger className="hover:no-underline py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="text-left">
                            <p className="text-sm font-medium line-clamp-2 leading-snug">
                              {citation.document?.title || "Unknown Source"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {citation.document?.authors?.[0] || "Unknown Author"} • {citation.document?.publishedAt ? new Date(citation.document.publishedAt).getFullYear() : "N/D"}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 pt-1">
                          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/50 mb-2">
                            "{citation.snippet}"
                          </div>
                          {citation.document?.url && (
                            <a 
                              href={citation.document.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-primary hover:underline font-medium"
                            >
                              View Source <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
