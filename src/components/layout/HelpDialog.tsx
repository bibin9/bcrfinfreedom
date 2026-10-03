import { useEffect, useState } from "react";

/** Anywhere in the app: window.dispatchEvent(new Event(OPEN_HELP_EVENT)) opens this dialog. */
export const OPEN_HELP_EVENT = "bcr-fire:open-help";
import {
  BookOpen,
  Calculator,
  Compass,
  Download,
  Flame,
  HelpCircle,
  LayoutDashboard,
  PieChart,
  Sliders,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "@/components/layout/FeedbackDialog";

/**
 * The in-app user manual. Designed for "first-time, never-heard-of-FIRE"
 * users — short sentences, real-world examples, no jargon without a
 * plain-English translation right after.
 */
export function HelpDialog() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_HELP_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_HELP_EVENT, onOpen);
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Help and user manual"
          className="gap-1.5 border-orange-500/40 text-orange-700 hover:bg-orange-500/10 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-200"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New here?</span>
          <span className="sm:hidden">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="border-b border-border px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 pr-16 text-xl">
            <BookOpen className="h-5 w-5 text-orange-500" />
            How to use BCR FIRE
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center justify-between gap-2">
            <span>A 5-minute guide for anyone — no finance background needed.</span>
            <a
              href="/BCR_FIRE_User_Manual.pdf"
              download="BCR_FIRE_User_Manual.pdf"
              className="inline-flex items-center gap-1.5 rounded-md border border-orange-500/40 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-500/15 dark:text-orange-300"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-5 py-4">
          <Manual />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------

function Manual() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {/* Origin story — the thing that makes this not another SaaS */}
      <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
        <p className="text-[11px] uppercase tracking-wider text-orange-600 dark:text-orange-400">
          Who built this
        </p>
        <p className="mt-1 text-sm font-medium">
          🇦🇪 A UAE-based banking-payments IT developer who built the FIRE tool he needed himself.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Every country, every goal, every edge case here comes from solving a real problem —
          not a product manager guessing. Free, no signup, your data never leaves your device.
        </p>
        <p className="mt-2 text-xs">
          Something confusing or missing? <FeedbackDialog />
        </p>
      </div>

      {/* 1. What is this app */}
      <Section title="1. What is this app?" icon={<Sparkles className="h-4 w-4" />}>
        <p>
          <strong>BCR FIRE</strong> helps you figure out one simple question:{" "}
          <em>"When can I stop working and live off my savings?"</em>
        </p>
        <p>
          It does the maths for you using your country's real numbers — inflation,
          investment returns, average living costs — so you see how much money you
          really need and how to get there.
        </p>
        <Callout>
          <strong>Educational only.</strong> Numbers shown are estimates, not
          financial advice. Talk to a registered advisor before investing.
        </Callout>
      </Section>

      {/* 2. What is FIRE */}
      <Section title="2. What does 'FIRE' mean?" icon={<Flame className="h-4 w-4 text-orange-500" />}>
        <p>
          <strong>FIRE = Financial Independence, Retire Early.</strong> It's a
          global movement built on one simple rule:
        </p>
        <BigQuote>
          When your savings are <strong>25× your yearly spending</strong>, you can
          live off them for life. That's the "4% rule".
        </BigQuote>
        <p>Example, very simple:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>You spend <strong>₹14 lakhs / year</strong> on everything (rent, food, school, fuel).</li>
          <li>25 × ₹14L = <strong>₹3.5 crores</strong>. That's your FIRE number.</li>
          <li>Hit ₹3.5 Cr → take out 4% (₹14L) every year → your savings still grow on the other 96%.</li>
        </ul>
        <p>
          The app figures out <strong>your</strong> FIRE number based on where you
          live and your lifestyle, then shows you how many years it'll take.
        </p>
      </Section>

      {/* 3. Quick start */}
      <Section title="3. Quick start — 3 steps" icon={<Compass className="h-4 w-4" />}>
        <Step n={1} title="Tell us about you">
          Pick your country, age, and monthly income. You can change these any
          time by hitting <strong>Edit</strong> at the top.
        </Step>
        <Step n={2} title="Set your lifestyle in Fine-tune">
          On the right side of the dashboard, pick <strong>Single</strong> or{" "}
          <strong>Family of 4</strong>. The app uses your country's average for
          that household. If you spend more (or less), type the real number in{" "}
          <em>"Your annual expenses"</em>.
        </Step>
        <Step n={3} title="Read your FIRE plan">
          Open the <strong>Freedom</strong> tab. The big orange box is your{" "}
          <strong>FI Ratio</strong> — how close you are to FIRE today. Below it
          are FIRE tiers, charts, and a year-by-year plan.
        </Step>
      </Section>

      {/* 4. Each tab explained */}
      <Section title="4. What each tab does" icon={<LayoutDashboard className="h-4 w-4" />}>
        <TabRow
          name="Overview"
          plain="The big picture — your allocation, FIRE number, expected returns. Start here."
        />
        <TabRow
          name="Allocation"
          plain="Where your money should go: stocks, bonds, gold, real estate, crypto. With reasons for each."
        />
        <TabRow
          name="Funds"
          plain="Real fund names you can actually buy in your country — index funds, ELSS, ETFs, sukuks, etc."
        />
        <TabRow
          name="Compounding"
          plain="A chart showing what your money turns into in 10, 20, 30 years. The 'eighth wonder of the world' visualised."
        />
        <TabRow
          name="Freedom (FIRE)"
          plain="Your FIRE number, tiers (Lean / Standard / Fat / Coast), savings-rate chart, and year-by-year plan."
        />
        <TabRow
          name="Paths"
          plain="A side-by-side comparison: disciplined investor vs someone who waits — eye-opening at age 60."
        />
        <TabRow
          name="Crypto"
          plain="Honest, no-hype crypto guidance for your country: rules, pitfalls, and learning links."
        />
        <TabRow
          name="Start"
          plain="Concrete first steps — open which account, buy which fund, in what order."
        />
        <TabRow
          name="NRI"
          plain="Only appears if you check NRI. Indian non-resident options: NRE/NRO/GIFT-City."
        />
      </Section>

      {/* 5. Fine-tune panel */}
      <Section title="5. The Fine-tune panel (right side)" icon={<Sliders className="h-4 w-4" />}>
        <p>This is your control panel. Every slide updates the numbers live:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Savings rate</strong> — what % of your salary you save each
            month. <em>Most powerful lever</em> — doubling it roughly halves
            your years to FIRE.
          </li>
          <li>
            <strong>Target freedom age</strong> — pick when you want to stop
            working. Younger = bigger SIP needed.
          </li>
          <li>
            <strong>Household</strong> — Single or Family of 4. Changes the
            country expense benchmark.
          </li>
          <li>
            <strong>Your annual expenses</strong> — type your real number if
            you know it. Best accuracy.
          </li>
          <li>
            <strong>Current invested corpus</strong> — what you already have
            invested today. Counts toward your FI Ratio.
          </li>
        </ul>
      </Section>

      {/* 6. FIRE Tiers */}
      <Section title="6. FIRE tiers in plain English" icon={<PieChart className="h-4 w-4" />}>
        <TierRow
          name="🌱 LeanFIRE"
          mult="15× expenses"
          plain="Frugal retirement. Smaller home, public transport, cooking at home. Cheapest exit."
        />
        <TierRow
          name="🔥 FIRE"
          mult="25× expenses"
          plain="The classic. Live your current lifestyle indefinitely on 4% withdrawals."
        />
        <TierRow
          name="🏆 FatFIRE"
          mult="33× expenses"
          plain="Comfortable. Travel, eat out, hobbies — all included. Uses safer 3% withdrawals."
        />
        <TierRow
          name="📈 CoastFIRE"
          mult="varies"
          plain="The amount you need today that — even if you stop saving — compounds into your full FIRE number by retirement age. Once you hit Coast, you can take a lower-paying job you love."
        />
      </Section>

      {/* 7. Key numbers */}
      <Section title="7. Key numbers, explained" icon={<Calculator className="h-4 w-4" />}>
        <KeyRow
          term="FI Ratio"
          plain="Your current invested money ÷ today's FIRE number, as a %. Hits 100% = you're free."
        />
        <KeyRow
          term="FIRE number"
          plain="Total money you need to retire. Always 25× your yearly spending (after inflation if it's a future target)."
        />
        <KeyRow
          term="Required SIP"
          plain="How much you need to invest every month to hit FIRE by your target age."
        />
        <KeyRow
          term="Years to FIRE"
          plain="How many years until your wealth crosses your FIRE number at your current savings."
        />
        <KeyRow
          term="Expected return"
          plain="What your portfolio earns per year on average, based on your country and allocation. India ~11%, UAE ~8%, US ~8.5% etc."
        />
        <KeyRow
          term="Inflation"
          plain="How fast prices rise per year. Things cost more in 20 years — the app builds that in."
        />
        <KeyRow
          term="SIP"
          plain="Systematic Investment Plan. A fixed amount you invest every month, automatically. The FIRE engine."
        />
      </Section>

      {/* 8. Pro tips */}
      <Section title="8. Pro tips for accurate numbers" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Be honest about expenses.</strong> Track 3 months of spending
            and put the average into <em>"Your annual expenses"</em>. The FIRE
            number is only as good as this input.
          </li>
          <li>
            <strong>Pick the country you'll retire in</strong>, not just where
            you live now. An NRI in UAE retiring in India should pick India for
            the FIRE number.
          </li>
          <li>
            <strong>Update yearly</strong>, not daily. After every salary raise
            or big life change (marriage, kids, house).
          </li>
          <li>
            <strong>Automate the SIP on payday.</strong> Money you don't see is
            money you don't spend. People who automate save 3× better.
          </li>
          <li>
            <strong>Don't panic-sell during dips.</strong> Compounding rewards
            consistency. The Paths tab shows what happens to people who do.
          </li>
        </ul>
      </Section>

      {/* 9. Install as app */}
      <Section title="9. Install on your phone" icon={<Download className="h-4 w-4" />}>
        <p>You can install BCR FIRE like a real app — no app store needed:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Android (Chrome / Edge):</strong> Tap the "Install" banner
            at the bottom, or open the menu (⋮) → <em>Install app</em> /{" "}
            <em>Add to Home screen</em>.
          </li>
          <li>
            <strong>iPhone (Safari):</strong> Tap the Share button (the box
            with an up-arrow) → <em>Add to Home Screen</em>.
          </li>
        </ul>
        <p className="text-muted-foreground">
          Once installed: orange flame icon on your home screen, launches
          fullscreen, works offline. Your data stays on your device.
        </p>
      </Section>

      {/* 10. FAQ */}
      <Section title="10. Frequently asked questions" icon={<HelpCircle className="h-4 w-4" />}>
        <FAQ q="Is my data sent anywhere?">
          No. Everything lives in your browser's local storage. Nothing leaves
          your phone. You can hit <em>Start over</em> in the header to wipe it.
        </FAQ>
        <FAQ q="What if I'm an expat saving in one country, retiring in another?">
          Right now, pick the country you'll <strong>retire in</strong> — that
          drives your FIRE number. Use the NRI checkbox if you're an Indian
          non-resident. A proper dual-country mode is on the roadmap.
        </FAQ>
        <FAQ q="Why does my FIRE number look so big?">
          Inflation. ₹14L today becomes ₹36L in 18 years at 5.5% inflation. The
          app sizes your corpus for what life will actually cost <em>then</em>,
          not now.
        </FAQ>
        <FAQ q="What's a 'good' savings rate?">
          Whatever you can sustain. The classic FIRE community targets 50%+.
          Most retail savers do 10–20%. Even moving from 15% → 25% knocks 5–8
          years off your timeline.
        </FAQ>
        <FAQ q="Should I include my house in 'current corpus'?">
          No. Only <strong>liquid investments</strong> — mutual funds, stocks,
          ETFs, fixed deposits, gold ETFs. Your primary home doesn't generate
          withdrawal income.
        </FAQ>
        <FAQ q="The app's expected return seems high — is that realistic?">
          It's a 20–30 year nominal average for your country's main index. Short
          periods will be lower or higher. The 4% rule is built to survive bad
          decades.
        </FAQ>
      </Section>

      {/* Footer */}
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Disclaimer</p>
        <p className="mt-1">
          BCR FIRE is an educational tool by BibinCutRiver. Numbers are
          illustrative approximations using publicly available country data.
          This is not investment advice. Consult a SEBI/SCA/FCA/SEC-registered
          advisor before acting. Past performance does not guarantee future
          returns.
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        {icon}
        {title}
      </h3>
      <div className="space-y-2 text-foreground/90">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
      {children}
    </div>
  );
}

function BigQuote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-orange-500 bg-orange-500/5 p-3 text-foreground">
      {children}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md border border-border p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-sm font-bold text-orange-600 dark:text-orange-400">
        {n}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function TabRow({ name, plain }: { name: string; plain: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3 border-b border-border py-2 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-primary">{name}</span>
      <span className="text-xs text-muted-foreground">{plain}</span>
    </div>
  );
}

function TierRow({ name, mult, plain }: { name: string; mult: string; plain: string }) {
  return (
    <div className="rounded-md border border-border p-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{mult}</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{plain}</p>
    </div>
  );
}

function KeyRow({ term, plain }: { term: string; plain: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-border py-1.5 last:border-0">
      <span className="text-xs font-semibold text-foreground">{term}</span>
      <span className="text-xs text-muted-foreground">{plain}</span>
    </div>
  );
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="rounded-md border border-border p-2.5 [&_summary]:cursor-pointer">
      <summary className="text-sm font-medium">{q}</summary>
      <p className="mt-1.5 text-xs text-muted-foreground">{children}</p>
    </details>
  );
}
