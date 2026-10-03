# FinFreedom Advisor

A country-aware financial-freedom and investment-allocation guide. Users answer **five**
questions — country, age, monthly income, risk appetite, and goal — and get a personalised
portfolio allocation, a financial-freedom number, a projected wealth curve, a growing-markets
view, and a prioritised action roadmap referencing their country's specific tax-advantaged
accounts and investment vehicles.

> **Disclaimer.** Educational purposes only. Not financial advice. Consult a licensed financial
> advisor before investing. Past performance does not guarantee future returns.

---

## Features

- **Country-aware engine.** 15 profiles (AE, SA, IN, US, GB, CA, AU, SG, DE, JP, MY, PH, PK, BD, EG)
  each with currency, indices, tax-advantaged accounts, popular investment vehicles, inflation
  rate, emergency-fund recommendation, retirement age, regulator, and stability score.
- **Sharia awareness.** Fixed-income labels switch to "Sukuk" and vehicle suggestions include
  Shariah-compliant options in Muslim-majority markets.
- **Smart allocation engine.** "100 − age" baseline, risk multiplier, stability drag, goal tilt,
  and a 5% crypto cap that only applies to aggressive profiles under 60 in sufficiently stable
  economies. Returns a transparent `explanation` trail.
- **Financial-freedom calculator.** 25× annual-expenses target, closed-form annuity math,
  required monthly SIP to hit age 50 / 55 / 60, years-to-freedom at current savings rate,
  and a year-by-year wealth projection.
- **Live tuning.** Savings-rate slider and current-corpus input recompute the whole dashboard
  instantly.
- **Personalised roadmap.** Prioritised action list referencing country-specific accounts
  (NPS / 401(k) / ISA / SRS / PPF / LISA / PRS / PERA / Riester / iDeCo / VPS …).
- **Visualisations.** Recharts donut, line (with freedom-target reference line), and bar charts.
- **Accessibility.** WCAG-minded: skip-link, `role="img"` + `aria-label` on charts, visible focus
  ring, `sr-only` headings where needed, keyboard-accessible slider and select primitives.
- **Dark mode.** Persisted, class-based, honours system preferences via `meta[name="color-scheme"]`.
- **Offline-friendly state.** Zustand + `localStorage` persistence, no signup, no backend.

---

## Tech stack

| Layer       | Choice                                                                    |
|-------------|---------------------------------------------------------------------------|
| Framework   | React 18 + Vite 5 + TypeScript (strict)                                   |
| Styling     | Tailwind CSS 3 + CSS variables for light/dark tokens                      |
| UI          | shadcn/ui primitives (Radix under the hood)                               |
| State       | Zustand + `persist` middleware                                            |
| Charts      | Recharts                                                                  |
| Icons       | lucide-react                                                              |
| Testing     | Vitest + @testing-library/jest-dom                                        |
| Geolocation | `ipapi.co` (best-effort, silent fallback)                                 |

---

## Getting started

```bash
npm install
npm run dev         # http://localhost:5173
npm run build       # typecheck + production build to dist/
npm run preview     # serve the built app
npm test            # run Vitest once
npm run test:watch  # watch mode
npm run typecheck   # tsc --noEmit
```

Node 18+ recommended.

---

## Project structure

```
finfreedom-advisor/
├── index.html
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                 # React entry
│   ├── App.tsx                  # Shell: header, phase routing, error boundary
│   ├── index.css                # Tailwind + light/dark CSS variables
│   ├── types/index.ts           # Shared domain types
│   ├── data/
│   │   ├── countryProfiles.ts   # 15 country ecosystems — foundation of the app
│   │   └── growthSectors.ts     # Curated global + local growth themes
│   ├── lib/
│   │   ├── allocation.ts        # calculateAllocation() — "show the math"
│   │   ├── freedom.ts           # calculateFreedom() + annuity primitives
│   │   ├── roadmap.ts           # generateRoadmap() — country-specific steps
│   │   ├── formatters.ts        # Intl currency / percent / years
│   │   └── utils.ts             # cn, clamp, round
│   ├── store/userStore.ts       # Zustand store w/ localStorage persist
│   ├── hooks/useDetectedCountry.ts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Onboarding.tsx       # 3-step wizard
│   │   └── Dashboard.tsx        # Wires allocation → freedom → roadmap
│   └── components/
│       ├── ui/                  # shadcn primitives (Button, Card, …)
│       ├── charts/              # AllocationDonut, WealthProjection, ReturnComparison
│       ├── dashboard/           # Cards that compose the dashboard
│       └── layout/              # Header, ThemeToggle, Disclaimer, ErrorBoundary
├── tests/
│   ├── allocation.test.ts
│   ├── freedom.test.ts
│   └── setup.ts
├── docs/
│   └── screenshots/             # Placeholders + component notes
├── package.json
├── tsconfig.json
├── vite.config.ts               # Includes manualChunks split for Recharts
├── tailwind.config.js
└── postcss.config.js
```

---

## Architecture overview

```
UserInput (country, age, income, risk, goal)
         │
         ▼
 calculateAllocation ──► AllocationResult { breakdown, expectedReturn, explanation }
         │
         ▼
 calculateFreedom (uses expectedReturn) ──► FreedomProjection { targetCorpus,
                                                                 yearsToFreedom,
                                                                 monthlyForAge50/55/60,
                                                                 projection[] }
         │
         ▼
 generateRoadmap (uses country accounts / vehicles) ──► RoadmapStep[]
         │
         ▼
 Dashboard renders everything; TunePanel writes savingsRate & currentCorpus
 back into the store and the whole pipeline re-memoizes.
```

### Engine design

The **allocation engine** (`src/lib/allocation.ts`) is a deterministic pipeline:

1. Baseline equity = clamp(100 − age, 25, 90) / 100.
2. Multiply by a risk multiplier (0.75 / 1.00 / 1.20).
3. Apply a stability drag: for countries with `stabilityScore < 0.7`, shift
   `(0.7 − score) × 0.5` from equities into the defensive sleeve.
4. Apply a goal tilt (early retirement +5%, wealth building +3%, passive income −5%,
   child education −7%, home purchase −12%).
5. Split equities local/international with home bias = clamp(0.3 + score × 0.4, 0.3, 0.6).
6. Cash floor scales with emergency-fund months (5% / 10% / 15% for 6m / 9m / 12m).
7. Gold scales with instability.
8. Crypto is ONLY added for aggressive profiles under 60 in countries with
   `stabilityScore ≥ 0.5`, capped at 5%, funded from bonds first.

The **freedom calculator** (`src/lib/freedom.ts`) uses the 25× rule (4% SWR) and
closed-form annuity math, with a zero-rate fallback path so dividing by zero is impossible.
All projections compound monthly to match typical retail SIP / recurring-investment cadence.

---

## Testing

```
npm test
```

23 Vitest tests cover:

- **Allocation engine**
  - Breakdown sums to ~100 for every country profile.
  - 100-age baseline (young > old equity).
  - Aggressive > conservative equity at the same age.
  - Crypto appears only for aggressive / under-60 / stable-enough markets.
  - Sukuk labelling in Sharia markets.
  - Less stable economies receive larger cash + gold cushions.
  - Home-purchase goal reduces equity vs early-retirement at identical inputs.
  - No negative percents across 15 × 3 × 4 combinations.
  - `explanation` trail is non-empty.
- **Freedom calculator**
  - 25× rule for target corpus.
  - Nulls for past target ages.
  - Monotonically increasing projection with positive savings.
  - Custom `savingsRate` override changes target and years-to-freedom as expected.
  - `currentCorpus` reduces required monthly contribution.
  - `monthlyInvestmentFor` / `yearsToTarget` primitive smoke tests
    (including zero-return division safety and known closed-form values).

---

## Deployment

The app is a pure static SPA — any static host works.

### Vercel

```bash
npm install -g vercel
vercel
```

`vercel.json` is not required; Vercel auto-detects Vite.

### Netlify

```bash
npm run build
# Drag-and-drop dist/ into Netlify, or:
npx netlify deploy --prod --dir=dist
```

Add a SPA fallback rule if you later add client-side routing (none is wired yet,
so not needed today):

```
# public/_redirects
/*    /index.html   200
```

---

## Design decisions (and why)

1. **5 inputs, no more.** The product ethos is zero-friction onboarding. Everything else
   (expected return, emergency fund size, tax-advantaged accounts, savings-rate default) is
   inferred from the country profile + risk + goal. Users can override on the dashboard.
2. **`stabilityScore`, `expectedEquityReturn`, `expectedBondReturn` are modelling inputs,
   not live data.** They're curated long-run approximations. The "Updated 2025-Q4" pill on
   the growth-sectors card signals this clearly. Replacing with a market-data API is a
   one-module swap.
3. **Default savings rate = 30%.** Deliberately conservative; the dashboard exposes a
   slider so users can sanity-check.
4. **localStorage only.** No sign-up, no PII leaves the device. IP detection is best-effort
   and explicitly labelled when applied.
5. **Bundle split.** `vite.config.ts` splits Recharts and Radix into separate chunks so the
   initial Landing + Onboarding payload stays small; the heavy charting chunk only loads
   when the user reaches the dashboard (effectively after onboarding, in the same session).

---

## License

MIT. Educational use only — see the in-app disclaimer.
