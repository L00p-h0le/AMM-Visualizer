# AMM Visualizer Implementation Checklist

## 1. App foundation
- [x] Set up the main layout shell (top bar, chart area, swap panel, metrics row, explanation card)
- [x] Define shared theme tokens for colors, spacing, radius, shadows, and typography
- [x] Create reusable primitives for cards, buttons, inputs, badges, and selectors

## 2. Simulation core
- [x] Build a pure Uniswap V2 simulation engine
- [x] Calculate input amount, output amount, fee, slippage, price impact, updated reserves, and invariant `k`
- [x] Ensure math and fees are extracted to pure utility functions (Single Source of Truth)
- [x] Ensure any future I/O operations (like fetching live pool reserves) use `async/await`

## 3. Chart and visualization
- [ ] Render the AMM curve from generated data points
- [ ] Show the current pool position and trade execution point
- [ ] Add before/after markers and animated transitions on state changes
- [ ] Ensure the chart updates instantly when inputs change

## 4. Swap workflow
- [ ] Connect amount input to the simulation engine
- [ ] Add token selectors, balance display, and swap direction toggle
- [ ] Wire the Execute Simulation action to refresh pool state and derived values

## 5. Explain mode
- [ ] Generate step-by-step explanations from simulation results
- [ ] Explain what changed, why price moved, how fees were applied, and how slippage occurred
- [ ] Keep the explanation concise and readable

## 6. Secondary insights
- [ ] Integrate simple slippage visualization into the main chart/sequence (Avoid separate advanced cards unless proven necessary)
- [ ] Keep analytics, liquidity, and documentation out of the MVP unless they directly support learning

## 7. QA and polish
- [ ] Tune spacing, contrast, and responsive behavior
- [ ] Add loading, empty, and error states
- [ ] Test edge cases such as zero amount, large swaps, low liquidity, and invalid inputs
- [ ] Verify mobile layout and chart readability
