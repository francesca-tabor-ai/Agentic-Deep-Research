import { useState } from "react";
import { useLocation } from "wouter";
import { useTasks, useCreateTask } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  Sparkles, 
  ArrowRight,
  History,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    try {
      const result = await createTask.mutateAsync({ query });
      setLocation(`/task/${result.taskId}`);
    } catch (error) {
      // Error handled by hook toast
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Hero / Search Section */}
          <section className="text-center py-12 md:py-20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Research Agent</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground">
                Deep Research made <span className="text-primary italic">simple</span>.
              </h1>
              
              <p className="text-lg text-muted-foreground text-balance">
                Ask a complex question. Our agent plans, searches, reads, and synthesizes 
                scientific literature to give you a comprehensive report.
              </p>

              <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mt-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                  <div className="relative flex items-center bg-card rounded-xl border border-border shadow-lg">
                    <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., Impact of microplastics on marine biodiversity..."
                      className="w-full pl-12 pr-4 py-6 border-none bg-transparent shadow-none focus-visible:ring-0 text-base"
                      autoFocus
                    />
                    <div className="pr-2">
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={createTask.isPending || !query.trim()}
                        className="rounded-lg w-10 h-10 shrink-0 transition-all hover:scale-105"
                      >
                        {createTask.isPending ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </section>

          {/* Recent Tasks */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-foreground">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Recent Research</h2>
              </div>
              {/* <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button> */}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : tasks?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No research tasks yet</h3>
                <p className="text-muted-foreground mt-1">Start your first deep research task above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks?.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
