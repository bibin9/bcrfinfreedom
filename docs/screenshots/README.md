# Screenshots & component reference

Capture these screenshots after `npm run dev` to flesh out the visual record of the app.
File names are referenced in the root `README.md` — keep them stable.

| File                    | Route / State                                            | What to capture                                                |
|-------------------------|----------------------------------------------------------|----------------------------------------------------------------|
| `01-landing.png`        | `/` (phase = landing)                                    | Hero, feature grid, CTA, disclaimer banner                     |
| `02-onboarding-step1.png` | Onboarding step 1 after country detection               | Country select with the "Pre-selected from your location" note |
| `03-onboarding-step2.png` | Onboarding step 2 (IN)                                  | Age + income (pre-filled in ₹ with Intl grouping)              |
| `04-onboarding-step3.png` | Onboarding step 3                                       | Risk slider in "Aggressive" + goal dropdown open               |
| `05-dashboard-light.png`  | Dashboard with US / 32y / moderate / wealth_building   | Top fold: AllocationCard (chart tab) + freedom metrics         |
| `06-dashboard-dark.png`   | Same as above, dark mode                               | Verify contrast, chart tooltip colours                         |
| `07-allocation-math.png`  | AllocationCard "Show the math" tab                     | Numbered explanation trail                                     |
| `08-freedom-projection.png` | FreedomCard's WealthProjection chart                 | Line chart with dashed target-corpus reference line            |
| `09-growth-sectors.png`   | GrowthSectorsCard (IN)                                 | Global + local sectors with the "Updated 2025-Q4" pill         |
| `10-roadmap.png`          | RoadmapCard (UAE)                                      | Shows sukuk reference and SCA regulator mention                |
| `11-tune-panel.png`       | TunePanel sidebar                                      | Savings-rate slider at 50% + corpus input                      |
| `12-mobile.png`           | Dashboard at 375 × 812 (mobile viewport)              | Responsive stack                                               |

## Component catalogue

> Treat this as a lightweight Storybook index: each component is standalone and renders off
> pure props except for the ones marked `[store]`, which read from the Zustand store.

### Layout
- `Header` `[store]` — sticky header with brand, optional "Start over" button, theme toggle.
- `ThemeToggle` `[store]` — writes `dark` class onto `<html>` and persists.
- `Disclaimer` — reusable legal banner. Optional `country` prop appends the country-specific line.
- `ErrorBoundary` `[store]` — catches render errors, exposes "Try again" and "Clear data and reload".

### Onboarding
- `Onboarding` `[store]` — 3-step wizard with progress, per-step validation, auto-IP country pre-fill.

### Dashboard cards
- `AllocationCard` — tabs for chart / breakdown / math. Props: `{ allocation: AllocationResult }`.
- `FreedomCard` — metrics grid + progress bar + projection chart.
  Props: `{ country, projection, age }`.
- `ReturnsCard` — expected-return bar chart. Props: `{ country }`.
- `GrowthSectorsCard` — global + local growth themes. Props: `{ country }`.
- `RoadmapCard` — numbered action list. Props: `{ steps: RoadmapStep[] }`.
- `TunePanel` — live savings-rate slider + corpus input. Controlled via callback props.

### Charts
- `AllocationDonut` — Recharts `<Pie>`. Exports `ASSET_COLORS` for use by list legends.
- `WealthProjection` — Recharts `<LineChart>` with a `<ReferenceLine>` at the freedom target.
- `ReturnComparison` — Recharts `<BarChart>` of per-asset-class expected returns.

### UI primitives (`src/components/ui/`)
- `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `progress.tsx`, `select.tsx`,
  `slider.tsx`, `tabs.tsx`, `tooltip.tsx` — standard shadcn/ui wrappers around Radix.
