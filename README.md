# AMM Visualizer

A frontend-only AMM education app that turns swap mechanics into a guided visual simulation. The experience is built around animation, step-by-step progression, and live state changes so users can understand what happens inside an automated market maker instead of only seeing a final quote.

## What the app does

- Simulates swaps against constant-product, constant-sum, and StableSwap-style AMM pools
- Animates the reserve curve and execution path through the full swap flow
- Shows live reserve, fee, slippage, and price impact changes
- Explains each step of the trade in plain language
- Provides a real-time process simulation with stepper controls for input, calculation, output, and rebalance stages
- Includes reusable interaction components for the swap panel, token selector, toast, and liquidity modal

## Current UX direction

The current frontend is built as a polished educational dashboard with:

- A large primary curve visualization
- A swap control panel with live quote feedback
- Metrics for reserves, invariant, and current price
- A math/explanation panel that narrates the swap
- A process simulation panel that animates the full AMM flow step by step
- A secondary educational section for deeper learning

## Component structure

- [components/Animation/](src/components/Animation) contains reusable animation primitives such as `AnimatedBeam`, `RippleButton`, `StarBorder`, `Tilt`, and `GlareHover`
- [components/](src/components) contains the main UI sections and extracted helpers such as `TokenSelect`, `AnimatedInput`, `CustomLiquidityPopup`, and `SwapToast`
- [hooks/](src/hooks) contains shared UI behavior like click-outside handling
- [lib/](src/lib) contains AMM math and shared utilities
- [types/](src/types) contains token, pool, and swap types plus model definitions

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Recharts for curve visualization
- Framer Motion for motion/animation support
- animejs for token path motion

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
- All AMM math stays in utility functions so it can be reused by multiple visual states and models.
- The animation flow shows the complete swap lifecycle: input, execution, reserve shift, output, and final explanation.
- The process simulation panel uses explicit stages so users can step through or replay the AMM flow.
- The implementation checklist in `IMPLEMENTATION_TASK_CHECKLIST.md` is the recommended roadmap for future work.
