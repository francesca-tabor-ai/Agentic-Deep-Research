import { useState } from 'react';
import { Upload, FileText, Link as LinkIcon } from 'lucide-react';

export interface VaultUploadProps {
  onUpload: (params: { title: string; content?: string | null; source_url?: string | null }) => Promise<void>;
}

export default function VaultUpload({ onUpload }: VaultUploadProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSubmitting(true);
    try {
      await onUpload({
        title: trimmedTitle,
        content: content.trim() || null,
        source_url: sourceUrl.trim() || null,
      });
      setTitle('');
      setContent('');
      setSourceUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 text-foreground font-medium">
        <Upload className="w-5 h-5 text-primary" />
        <span>Add document to Vault</span>
      </div>
      <div>
        <label htmlFor="vault-title" className="block text-sm font-medium text-foreground mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="vault-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Paper title or document name"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
          disabled={submitting}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-medium text-primary hover:underline"
        >
          {expanded ? 'Hide optional fields' : 'Add content or source URL (optional)'}
        </button>
        {expanded && (
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="vault-content" className="block text-sm font-medium text-muted-foreground mb-1">
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                Content or abstract
              </label>
              <textarea
                id="vault-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste excerpt, abstract, or full text"
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="vault-source-url" className="block text-sm font-medium text-muted-foreground mb-1">
                <LinkIcon className="w-3.5 h-3.5 inline mr-1" />
                Source URL
              </label>
              <input
                id="vault-source-url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={submitting}
              />
            </div>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!title.trim() || submitting}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity tap-scale"
      >
        {submitting ? (
          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {submitting ? 'Adding…' : 'Add to Vault'}
      </button>
    </form>
  );
}
