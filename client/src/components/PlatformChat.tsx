import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const PROMPT_PROBES = [
  'What is Agentic Deep Research?',
  'How do I run a research task?',
  'What is the Vault and how do I use it?',
  'Where can I see citations and evidence?',
  'What does the Metrics page show?',
  'How do I get started?',
];

function getPlatformResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();

  // Research
  if (
    lower.includes('research') &&
    (lower.includes('run') || lower.includes('how') || lower.includes('start') || lower.includes('task'))
  ) {
    return `To run a research task:
1. Go to **Research** (from the home page or nav).
2. Enter your question or topic in plain language in the query box.
3. Submit to create a query — it appears in the sidebar.
4. Select the query and click **Run research** to start the agent. It will plan, retrieve sources, and synthesize a report with citations.
5. View the result, citations, and feedback on the same page. You can also refine from a previous query to iterate.`;
  }
  if (lower.includes('what is') && lower.includes('research')) {
    return `**Research** is where you ask complex questions in natural language. The system plans the search, retrieves and synthesizes sources, and returns structured answers with full citations and traceability. You can run multiple queries and see related or refined queries in the sidebar.`;
  }

  // Vault
  if (
    lower.includes('vault') &&
    (lower.includes('what') || lower.includes('how') || lower.includes('use'))
  ) {
    return `The **Vault** is your document workspace. You can upload or add documents (with optional titles, content, and source URLs). Those documents are then used as context when running research — so the agent can consider your own materials. You can also search the vault, preview documents, and add annotations (notes) to them.`;
  }

  // Citations / evidence
  if (
    lower.includes('citation') ||
    lower.includes('evidence') ||
    lower.includes('source') ||
    lower.includes('traceability')
  ) {
    return `Every research result is **citation-grounded**: claims in the report link back to sources. After you run a research task, the result view shows the synthesis plus a list of citations. You can verify where information came from and see confidence or feedback. This keeps the research trustworthy and auditable.`;
  }

  // Metrics
  if (
    lower.includes('metric') ||
    (lower.includes('what') && lower.includes('metrics page')) ||
    lower.includes('dashboard')
  ) {
    return `The **Metrics** page gives you an overview of your research activity: counts of queries, runs, and results over time. Use it to see usage patterns and high-level stats. Open it from the main navigation.`;
  }

  // Getting started / what is this platform
  if (
    lower.includes('get started') ||
    lower.includes('getting started') ||
    (lower.includes('what is') && (lower.includes('agentic') || lower.includes('platform') || lower.includes('this'))) ||
    lower.includes('how do i start')
  ) {
    return `**Agentic Deep Research** turns complex questions into synthesized, cited answers. To get started:
1. **Research** — Go to Research, type your question, create a query, then click **Run research** to generate a report.
2. **Vault** (optional) — Add your own documents so research can use them as context.
3. **Metrics** — View usage and activity stats.
Ask in plain language; no need for keywords or query syntax. Need more detail? Ask about Research, Vault, or Metrics.`;
  }

  // Greetings / help
  if (
    /^(hi|hey|hello|howdy|help|what can you do)\s*[?!.]*$/i.test(lower) ||
    lower === 'hi' || lower === 'hello' || lower === 'help'
  ) {
    return `Hi! I’m your guide for **Agentic Deep Research**. I can answer questions about the platform — for example: how to run a research task, what the Vault is, where to see citations, or what the Metrics page shows. Try one of the suggested questions below or ask anything about the platform.`;
  }

  // Default
  return `I’m here to help with **Agentic Deep Research**. I can explain how to run research tasks, use the Vault, understand citations, and what the Metrics page shows. Try asking something like: “How do I run a research task?” or “What is the Vault?” — or pick one of the suggested prompts above.`;
}

function formatAssistantMessage(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(remaining.slice(lastIndex));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

export default function PlatformChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your guide for Agentic Deep Research. Ask me about the platform — how to run research, use the Vault, see citations, or view metrics. You can also tap a suggested question below.",
      timestamp: Date.now(),
    };
    return [welcome];
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    // Simulate a short delay for a more natural feel
    setTimeout(() => {
      const reply = getPlatformResponse(trimmed);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setSending(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleProbeClick = (probe: string) => {
    sendMessage(probe);
  };

  return (
    <>
      {/* Launcher button — bottom right */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg hover:opacity-95 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-label={open ? 'Close chat' : 'Open platform guide'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 flex w-full max-w-md flex-col rounded-3xl border border-border bg-card shadow-xl overflow-hidden"
          role="dialog"
          aria-label="Platform guide chat"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Platform guide</h2>
              <p className="text-xs text-muted-foreground">Ask about Research, Vault &amp; Metrics</p>
            </div>
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto min-h-[200px] max-h-[320px] p-4 space-y-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-foreground border border-border/60'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="leading-relaxed whitespace-pre-wrap">
                      {formatAssistantMessage(msg.content)}
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted/60 border border-border/60 px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Prompt probes */}
          <div className="px-4 pb-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {PROMPT_PROBES.map((probe) => (
                <button
                  key={probe}
                  type="button"
                  onClick={() => handleProbeClick(probe)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 hover:border-primary/30 transition-colors duration-200"
                >
                  {probe}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 pt-0 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the platform…"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-95 disabled:opacity-50 transition-opacity"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
