import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, FileText, ExternalLink, Trash2, Search, X, MessageSquarePlus } from 'lucide-react';
import VaultUpload from '@/components/VaultUpload';
import {
  fetchVaultDocuments,
  searchVaultDocuments,
  createVaultDocument,
  deleteVaultDocument,
  fetchDocumentAnnotations,
  createDocumentAnnotation,
  deleteDocumentAnnotation,
  type VaultDocument,
  type DocumentAnnotation,
} from '@/api';

export default function Vault() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [previewAnnotations, setPreviewAnnotations] = useState<DocumentAnnotation[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = searchQ.trim()
        ? await searchVaultDocuments(searchQ.trim())
        : await fetchVaultDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQ]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

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
      if (previewDoc?.id === id) setPreviewDoc(null);
      await loadDocs();
    } catch (err) {
      console.error(err);
    }
  };

  const openPreview = async (doc: VaultDocument) => {
    setPreviewDoc(doc);
    setPreviewAnnotations([]);
    setNewNote('');
    try {
      const anns = await fetchDocumentAnnotations(doc.id);
      setPreviewAnnotations(anns);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshPreviewAnnotations = useCallback(async () => {
    if (!previewDoc) return;
    try {
      const anns = await fetchDocumentAnnotations(previewDoc.id);
      setPreviewAnnotations(anns);
    } catch (err) {
      console.error(err);
    }
  }, [previewDoc]);

  const handleAddAnnotation = async () => {
    if (!previewDoc || !newNote.trim()) return;
    setAddingNote(true);
    try {
      await createDocumentAnnotation(previewDoc.id, newNote.trim());
      setNewNote('');
      await refreshPreviewAnnotations();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteAnnotation = async (annId: number) => {
    if (!previewDoc) return;
    try {
      await deleteDocumentAnnotation(previewDoc.id, annId);
      await refreshPreviewAnnotations();
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
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <h2 className="font-semibold text-foreground">Your documents</h2>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search vault…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
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
                    <button
                      type="button"
                      onClick={() => openPreview(doc)}
                      className="text-left hover:opacity-80 transition-opacity"
                    >
                      <h3 className="font-medium text-foreground">{doc.title}</h3>
                    </button>
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
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openPreview(doc)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      aria-label="Preview"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      aria-label="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40"
          onClick={() => setPreviewDoc(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Document preview"
        >
          <div
            className="w-full max-w-xl bg-card border-l border-border shadow-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <h2 className="font-semibold text-foreground truncate pr-2">{previewDoc.title}</h2>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {previewDoc.source_url && (
                <a
                  href={previewDoc.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Source <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {previewDoc.content || 'No content.'}
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4" />
                  Annotations
                </h3>
                <div className="space-y-2 mb-3">
                  {previewAnnotations.map((ann) => (
                    <div
                      key={ann.id}
                      className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 text-sm"
                    >
                      <p className="flex-1 min-w-0">{ann.note}</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnotation(ann.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                        aria-label="Delete annotation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a note…"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAnnotation()}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddAnnotation}
                    disabled={!newNote.trim() || addingNote}
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {addingNote ? 'Adding…' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
