# AMM Visualizer

A premium, educational AMM simulator for exploring how automated market makers behave under different swap scenarios. The current frontend focuses on a polished constant-product experience with a dark dashboard layout, live swap metrics, and an explanation panel that breaks down the math behind each trade.

## Overview

The app is designed to help users understand:

- How AMM curves change as trades move through the pool
- How reserves, invariant values, fees, and price impact are calculated
- How slippage grows as trade size increases
- How a swap can be explained step by step in plain language

## Current frontend features

- Interactive dashboard-style layout with a dedicated chart area
- AMM model selector for switching between curve models
- Swap simulator with token input, output preview, fee summary, and price impact
- Live pool state cards for reserves, invariant, and current price
- Explanation card showing the math behind the swap
- Secondary insight panel for advanced slippage testing
- Dark, modern UI with Tailwind CSS styling

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

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

## Project structure

```text
Frontend/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ App.tsx
│  ├─ App.css
│  ├─ index.css
│  └─ main.tsx
├─ IMPLEMENTATION_TASK_CHECKLIST.md
├─ package.json
└─ vite.config.ts
```

## Notes

- The repo is intentionally scoped to the frontend application only.
- The current UI is a strong MVP foundation and can be extended later with deeper simulation logic, model adapters, and richer analytics.
- The existing checklist in `IMPLEMENTATION_TASK_CHECKLIST.md` captures the recommended build order for future work.
