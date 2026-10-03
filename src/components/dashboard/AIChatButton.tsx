import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare, Send, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAI, SUGGESTED_PROMPTS, type PlanContext } from "@/lib/aiChat";
import { getCountryProfile } from "@/data/countryProfiles";
import { calculateAllocation } from "@/lib/allocation";
import { calculateFreedom } from "@/lib/freedom";
import { toUserInput, useUserStore } from "@/store/userStore";

/**
 * Floating FIRE Assistant — bottom-right pill button.
 * Opens a side panel with chat history, suggested prompts, input.
 * Uses Pollinations.ai (free public LLM proxy) — no API key required.
 */
export function AIChatButton() {
  const phase = useUserStore((s) => s.phase);
  const [open, setOpen] = useState(false);

  // Only render when the user has a plan — otherwise there's nothing to ask about.
  if (phase !== "dashboard") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open FIRE Assistant"
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:scale-105 hover:shadow-orange-500/50 sm:bottom-6 sm:right-6"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  );
}

// ---------------------------------------------------------------------------

function ChatPanel({ onClose }: { onClose: () => void }) {
  const inputs = useUserStore((s) => s.inputs);
  const goals = useUserStore((s) => s.goals);
  const windfalls = useUserStore((s) => s.windfalls);
  const messages = useUserStore((s) => s.aiMessages);
  const addMessage = useUserStore((s) => s.addAiMessage);
  const clearMessages = useUserStore((s) => s.clearAiMessages);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Compute plan context from current store state.
  const context = useMemo<PlanContext | null>(() => {
    const complete = toUserInput(inputs);
    if (!complete) return null;
    const residentCountry = getCountryProfile(complete.country);
    const destinationCountry =
      inputs.retirementCountry && inputs.retirementCountry !== complete.country
        ? getCountryProfile(inputs.retirementCountry)
        : residentCountry;
    const allocation = calculateAllocation({
      age: complete.age,
      risk: complete.risk,
      country: residentCountry,
      goal: complete.goal,
      retirementCountry: destinationCountry,
      freedomAge: inputs.freedomAge,
    });
    const freedom = calculateFreedom({
      ...complete,
      expectedReturn: allocation.expectedReturn,
      savingsRate: inputs.savingsRate ?? 0.3,
      currentCorpus: inputs.currentCorpus ?? 0,
      freedomAge: inputs.freedomAge,
      householdSize: inputs.householdSize ?? "single",
      annualExpensesOverride: inputs.annualExpensesOverride,
      retirementCountry: inputs.retirementCountry,
    });
    return {
      user: complete,
      residentCountry,
      destinationCountry,
      allocation,
      freedom,
      savingsRate: inputs.savingsRate ?? 0.3,
      currentCorpus: inputs.currentCorpus ?? 0,
      goals,
      windfalls,
    };
  }, [inputs, goals, windfalls]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy || !context) return;
    setErr(null);
    const userMsg = text.trim();
    addMessage({ role: "user", content: userMsg });
    setInput("");
    setBusy(true);
    try {
      const reply = await askAI({
        provider: "pollinations",
        context,
        history: messages,
        userMessage: userMsg,
      });
      addMessage({ role: "assistant", content: reply });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="FIRE Assistant"
      className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-background shadow-2xl sm:h-[85vh] sm:max-h-[720px] sm:w-full sm:max-w-md sm:rounded-xl sm:border sm:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-br from-orange-500/15 to-red-500/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">FIRE Assistant</p>
              <p className="text-[11px] text-muted-foreground">
                Powered by Pollinations · free · may be slow
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearMessages}
                aria-label="Clear chat"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
          {messages.length === 0 && (
            <WelcomeBlock onPick={send} />
          )}
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking…
            </div>
          )}
          {err && (
            <div className="rounded-md border border-red-500/40 bg-red-500/5 p-2 text-xs text-red-700 dark:text-red-300">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-0.5">{err}</p>
              <p className="mt-1 text-muted-foreground">
                Pollinations is a free public service and sometimes rate-limits. Try again in a few seconds.
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={context ? "Ask about your plan…" : "Finish your plan first"}
              disabled={busy || !context}
              className="flex-1"
            />
            <Button
              onClick={() => send(input)}
              disabled={busy || !context || !input.trim()}
              className="bg-orange-600 hover:bg-orange-700"
              aria-label="Send message"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Educational only · Not financial advice · Confirm with a registered advisor
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function WelcomeBlock({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="space-y-3 py-3">
      <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-orange-500" />
          <p className="text-sm font-semibold">Hi, I'm your FIRE Assistant 👋</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          I know your current plan — ask me anything about it. I can explain your FIRE
          number, suggest what to change, or help you understand the math.
        </p>
      </div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        Try asking:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs hover:border-orange-500/40 hover:bg-orange-500/5"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
          isUser
            ? "bg-orange-600 text-white"
            : "border border-border bg-card",
        ].join(" ")}
      >
        {content}
      </div>
    </div>
  );
}
