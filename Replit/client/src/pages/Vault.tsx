import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useDocuments } from "@/hooks/use-documents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, ExternalLink, Database } from "lucide-react";
import { format } from "date-fns";

export default function Vault() {
  const [search, setSearch] = useState("");
  const { data: documents, isLoading } = useDocuments(search);

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">My Vault</h1>
              <p className="text-muted-foreground">
                All gathered scientific literature and sources from your research.
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search papers..."
                  className="pl-9 bg-card"
                />
              </div>
              <Button>
                <Search className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
          </div>

          {isLoading ? (
             <div className="space-y-4">
               {[1, 2, 3, 4].map((i) => (
                 <Skeleton key={i} className="h-24 w-full rounded-xl" />
               ))}
             </div>
          ) : documents?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Vault is empty</h3>
              <p className="text-muted-foreground">Documents cited in your research will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents?.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-1">
                      <FileText className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 hover:text-primary transition-colors cursor-pointer">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {doc.abstract || "No abstract available."}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {doc.authors.slice(0, 3).join(", ")}{doc.authors.length > 3 ? " et al." : ""}
                        </span>
                        <span>•</span>
                        <span>
                          {doc.publishedAt ? format(new Date(doc.publishedAt), "MMMM yyyy") : "Date Unknown"}
                        </span>
                        {doc.doi && (
                          <>
                            <span>•</span>
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">DOI: {doc.doi}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {doc.url && (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="self-start md:self-center"
                      >
                        <Button variant="outline" size="sm">
                          Source <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
