/**
 * AI chat client — Anthropic + OpenAI, called directly from the browser.
 *
 * Why BYOK (Bring Your Own Key)?
 *   - Matches our "no backend, no accounts" promise.
 *   - User's key stays in localStorage; never sent to our server (we have none).
 *   - User sees + controls their own cost.
 *   - No per-user rate limit for us to manage.
 *
 * We DO support non-streaming only for v1 — simpler, works everywhere.
 */

import type {
  AllocationResult,
  CountryProfile,
  FreedomProjection,
  Goal,
  UserInput,
  Windfall,
} from "@/types";

export type AIProvider = "pollinations" | "anthropic" | "openai";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface PlanContext {
  user: UserInput;
  residentCountry: CountryProfile;
  destinationCountry: CountryProfile;
  freedom: FreedomProjection;
  allocation: AllocationResult;
  savingsRate: number;
  currentCorpus: number;
  goals: Goal[];
  windfalls: Windfall[];
}

/** Default models per provider — fast & cheap, plenty good for Q&A. */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  pollinations: "openai", // Pollinations' alias for gpt-4o-mini
  anthropic: "claude-haiku-4-5-20251001",
  openai: "gpt-4o-mini",
};

/**
 * Build the system prompt. We inject the user's actual plan state so the
 * AI can give answers that reference their real numbers, not generic FIRE
 * advice.
 */
export function buildSystemPrompt(ctx: PlanContext): string {
  const money = (v: number) =>
    `${ctx.destinationCountry.currencySymbol}${Math.round(v).toLocaleString()}`;

  const years = ctx.freedom.yearsToFreedomAtCurrentRate;
  const yearsText =
    years != null && years <= 60
      ? `~${Math.round(years)} years`
      : "longer than 60 years";

  const expatLine =
    ctx.residentCountry.code !== ctx.destinationCountry.code
      ? `User is an expat: lives in ${ctx.residentCountry.name} (${ctx.residentCountry.flag}) but plans to retire in ${ctx.destinationCountry.name} (${ctx.destinationCountry.flag}).`
      : `User lives and plans to retire in ${ctx.residentCountry.name} (${ctx.residentCountry.flag}).`;

  const goalsLine =
    ctx.goals.length > 0
      ? `User has ${ctx.goals.length} life goals saved: ${ctx.goals.map((g) => g.name).join(", ")}.`
      : "User has no life goals saved yet.";

  const windfallsLine =
    ctx.windfalls.length > 0
      ? `User expects windfalls: ${ctx.windfalls.map((w) => `${w.name} (${w.targetYear})`).join(", ")}.`
      : "User has no windfalls recorded.";

  return `You are the BCR FIRE Assistant — a Financial Independence, Retire Early planning helper built into the BCR FIRE app by BibinCutRiver, a UAE-based banking-payments IT developer.

== Current user's plan state ==
${expatLine}
Age: ${ctx.user.age}
Monthly income: ${ctx.residentCountry.currencySymbol}${ctx.user.monthlyIncome.toLocaleString()} (resident currency)
Savings rate: ${(ctx.savingsRate * 100).toFixed(0)}%
Current invested corpus: ${ctx.residentCountry.currencySymbol}${ctx.currentCorpus.toLocaleString()}
Risk profile: ${ctx.user.risk}
Primary goal: ${ctx.user.goal.replace(/_/g, " ")}
Expected blended return: ${(ctx.allocation.expectedReturn * 100).toFixed(1)}%/yr
Inflation (destination): ${(ctx.freedom.inflationRateUsed * 100).toFixed(1)}%/yr
Household: ${ctx.freedom.householdSize}

== FIRE target ==
Target FIRE corpus (at retirement): ${money(ctx.freedom.targetCorpus)}
Freedom age: ${ctx.freedom.freedomAge}
Required monthly SIP: ${ctx.freedom.requiredMonthlySIP != null ? money(ctx.freedom.requiredMonthlySIP) : "—"}
Current monthly savings: ${money(ctx.freedom.currentMonthlySavings)}
Monthly shortfall: ${money(ctx.freedom.monthlyShortfall)}
Years to FIRE at current rate: ${yearsText}

== Life goals ==
${goalsLine}

== Expected windfalls ==
${windfallsLine}

== Your rules ==
1. EDUCATIONAL only. NEVER give specific "do X with Y rupees" financial advice. Always recommend consulting a SEBI/SCA/FCA/SEC-registered advisor for actual decisions.
2. Keep responses CONCISE: 3-5 sentences unless they ask for depth.
3. Use plain English — explain jargon (SIP, ELSS, SWR, NPS) on first use.
4. REFERENCE their actual numbers when relevant ("your ₹5.7 Cr target", "at your 30% savings rate").
5. If asked about tax or country regulation, remind them your knowledge may be out of date.
6. If they ask something off-topic (e.g. coding help), politely redirect to FIRE/finance questions.
7. Suggest tabs/features of the app when helpful: "Open the Reality Check tab" / "Add a goal in the Goals tab".
8. Markdown is OK (bold, bullet lists) but keep it simple.
`;
}

// ---------------------------------------------------------------------------
// Pollinations.ai — free public LLM proxy (no API key required)
// ---------------------------------------------------------------------------

async function callPollinations(
  model: string,
  systemPrompt: string,
  history: AIChatMessage[],
  userMessage: string,
): Promise<string> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages,
      model,
      temperature: 0.5,
      private: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Pollinations error (${response.status}): ${body.slice(0, 200) || response.statusText}`,
    );
  }

  // Pollinations usually returns plain text; some models return OpenAI-shape JSON.
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    const choice = parsed?.choices?.[0]?.message?.content;
    if (typeof choice === "string") return choice;
  } catch {
    /* not JSON — treat as plain text */
  }
  return text;
}

// ---------------------------------------------------------------------------
// Anthropic API (BYOK)
// ---------------------------------------------------------------------------

async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: AIChatMessage[],
  userMessage: string,
): Promise<string> {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Anthropic API error (${response.status}): ${errorBody.slice(0, 200)}`,
    );
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Unexpected Anthropic response shape");
  }
  return text;
}

// ---------------------------------------------------------------------------
// OpenAI API
// ---------------------------------------------------------------------------

async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: AIChatMessage[],
  userMessage: string,
): Promise<string> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI API error (${response.status}): ${errorBody.slice(0, 200)}`,
    );
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("Unexpected OpenAI response shape");
  }
  return text;
}

// ---------------------------------------------------------------------------

export interface AIChatRequest {
  provider: AIProvider;
  /** Not needed for pollinations provider. */
  apiKey?: string;
  model?: string;
  context: PlanContext;
  history: AIChatMessage[];
  userMessage: string;
}

export async function askAI(req: AIChatRequest): Promise<string> {
  const model = req.model ?? DEFAULT_MODELS[req.provider];
  const systemPrompt = buildSystemPrompt(req.context);
  if (req.provider === "pollinations") {
    return callPollinations(model, systemPrompt, req.history, req.userMessage);
  }
  if (!req.apiKey) throw new Error("API key required for this provider");
  if (req.provider === "anthropic") {
    return callAnthropic(req.apiKey, model, systemPrompt, req.history, req.userMessage);
  }
  return callOpenAI(req.apiKey, model, systemPrompt, req.history, req.userMessage);
}

/** Suggested conversation starters, shown as chips on first open. */
export const SUGGESTED_PROMPTS = [
  "Explain my FIRE number in simple terms",
  "What's the single biggest thing I can do to retire sooner?",
  "Is my savings rate realistic?",
  "What should I focus on in the next 12 months?",
  "How risky is my allocation for my age?",
  "Which country-specific accounts should I max out first?",
];
