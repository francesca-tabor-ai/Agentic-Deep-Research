import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, FileText, ExternalLink, Trash2 } from 'lucide-react';
import VaultUpload from '@/components/VaultUpload';
import {
  fetchVaultDocuments,
  createVaultDocument,
  deleteVaultDocument,
  type VaultDocument,
} from '@/api';

export default function Vault() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await fetchVaultDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUpload = async (params: {
    title: string;
    content?: string | null;
    source_url?: string | null;
  }) => {
    await createVaultDocument(params);
    await loadDocs();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this document from the Vault?')) return;
    try {
      await deleteVaultDocument(id);
      await loadDocs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <a className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
          </Link>
          <div>
            <h1 className="font-serif text-xl font-bold text-foreground">Vault</h1>
            <p className="text-sm text-muted-foreground">
              Documents you add here can be used as context for research.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <VaultUpload onUpload={handleUpload} />

        <section>
          <h2 className="font-semibold text-foreground mb-4">Your documents</h2>
          {loading ? (
            <div className="text-muted-foreground text-sm py-8">Loading…</div>
          ) : documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
              <p className="text-muted-foreground">No documents yet. Add one above.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{doc.title}</h3>
                    {doc.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {doc.content}
                      </p>
                    )}
                    {doc.source_url && (
                      <a
                        href={doc.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        Source
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Added {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                    aria-label="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
