# AMM Visualizer

A frontend-only AMM education app that turns swap mechanics into a guided visual simulation. The experience is designed around animation, step-by-step progression, and live state changes so users can understand what happens inside an automated market maker instead of only seeing a final quote.

## What the app does

- Simulates swaps against constant-product style AMM pools
- Animates the reserve curve and execution point through the full swap flow
- Shows live reserve, fee, slippage, and price impact changes
- Explains each step of the trade in plain language
- Provides a foundation for later Curve and constant-sum model support

## Current UX direction

The current frontend is built as a premium dark dashboard with:

- A large primary curve visualization
- A swap control panel with live quote feedback
- Metrics for reserves, invariant, and current price
- A math/explanation panel that narrates the swap
- A secondary educational section for deeper learning

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Recharts for curve visualization
- Framer Motion for motion/animation support

## Project structure

```text
Frontend/
├─ public/
├─ src/
│  ├─ components/
│  ├─ utils/
│  ├─ App.tsx
│  ├─ App.css
│  ├─ index.css
│  └─ main.tsx
├─ IMPLEMENTATION_TASK_CHECKLIST.md
├─ package.json
└─ vite.config.ts
```

## Run locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Development notes

- The repo is intentionally scoped to the frontend app only.
- All AMM math should stay in utility functions so it can be reused by multiple visual states and models.
- The animation flow is meant to show the complete swap lifecycle: input, execution, reserve shift, output, and final explanation.
- The implementation checklist in `IMPLEMENTATION_TASK_CHECKLIST.md` is the recommended roadmap for future work.
