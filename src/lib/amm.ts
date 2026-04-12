import type { AMMType, PoolState } from '../types/amm';

export const FEE_PERCENT = 0.003; // 0.3%

/**
 * StableSwap amplification coefficient.
 * Real Curve pools use 10–2000. Higher A = flatter curve near peg.
 * A=100 is a good educational default (very visible flat region).
 */
export const AMPLIFICATION = 100;

// ─────────────────────────────────────────────────────────────────
//  StableSwap math — Curve Finance invariant (n=2 coins)
//
//  Invariant:  4A(x + y) + D  =  4AD  +  D³ / (4xy)
//
//  When A is large → behaves like x + y = D  (constant sum, flat)
//  When A → 0     → behaves like xy = k     (constant product, curved)
// ─────────────────────────────────────────────────────────────────

/**
 * Solve for the StableSwap invariant D given reserves x, y and
 * amplification A.  Uses Newton's method (converges in <20 iters).
 *
 *   f(D)  = Ann·S + D − (Ann − 1)·D − D^(n+1) / (n^n · ∏x_i)  = 0
 *
 * Iterative formula (from Curve whitepaper):
 *   D_next = (Ann·S + n·D_P) · D  /  ((Ann − 1)·D + (n+1)·D_P)
 *   where  D_P = D^(n+1) / (n^n · ∏x_i)   (for n=2: D³/(4xy))
 */
export function stableSwapSolveD(x: number, y: number, A: number): number {
  const n = 2;
  const Ann = A * n * n; // = 4A
  const S = x + y;
  if (S === 0) return 0;

  let D = S; // initial guess
  for (let i = 0; i < 256; i++) {
    // D_P = D^3 / (4·x·y)
    let D_P = D;
    D_P = (D_P * D) / (2 * x);
    D_P = (D_P * D) / (2 * y);

    const D_prev = D;
    // Newton step
    D = ((Ann * S + D_P * n) * D) / ((Ann - 1) * D + (n + 1) * D_P);

    if (Math.abs(D - D_prev) <= 1e-10) break;
  }
  return D;
}

/**
 * Given one reserve x, the invariant D, and amplification A,
 * solve for the other reserve y.  Newton's method.
 *
 * We solve:   Ann·x·y² + (Ann·x² + D − Ann·D·x)·y  =  D³/(4·Ann)
 *             ⟹ iterative:  y_next = (y² + c) / (2y + b − D)
 *
 *   where  c = D³ / (4 · x · Ann)
 *          b = x + D / Ann
 */
export function stableSwapGetY(
  xReserve: number,
  D: number,
  A: number,
): number {
  const n = 2;
  const Ann = A * n * n;

  // c = D^3 / (4 · xReserve · Ann)
  const c = (D * D * D) / (n * n * xReserve * Ann);
  // b = xReserve + D / Ann
  const b = xReserve + D / Ann;

  let y = D; // initial guess
  for (let i = 0; i < 256; i++) {
    const y_prev = y;
    y = (y * y + c) / (2 * y + b - D);
    if (Math.abs(y - y_prev) <= 1e-10) break;
  }
  return y;
}

// ─────────────────────────────────────────────────────────────────
//  Curve plotting helper
// ─────────────────────────────────────────────────────────────────

/**
 * Generate chart points for a StableSwap curve using **cosine spacing**.
 *
 * Linear spacing puts very few points in the steep-end regions
 * where the curve actually bends (x < ~D*0.1 and x > ~D*0.9),
 * making the curve appear nearly linear.
 *
 * Cosine remapping:  t' = 0.5 − 0.5·cos(t·π)
 * concentrates ~38 % of points in the outer 20 % of the range,
 * making both the flat middle and the steep ends clearly visible.
 */
export function generateStableSwapCurvePoints(
  D: number,
  A: number,
  numPoints = 200,
): { x: number; y: number }[] {
  const xMin = D * 0.02;
  const xMax = D * 0.98;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Cosine remap — packs more samples near both edges
    const tRemapped = 0.5 - 0.5 * Math.cos(t * Math.PI);

    const x = xMin + tRemapped * (xMax - xMin);
    const y = stableSwapGetY(x, D, A);

    if (y > 0 && y < D * 1.1) {
      points.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
      });
    }
  }

  return points;
}

// ─────────────────────────────────────────────────────────────────
//  General helpers
// ─────────────────────────────────────────────────────────────────

/** Compute invariant k for a given AMM model */
export function computeK(x: number, y: number, ammType: AMMType): number {
  if (ammType === 'CPMM') return x * y;
  if (ammType === 'CSMM') return x + y;
  // StableSwap: store D as the invariant
  return stableSwapSolveD(x, y, AMPLIFICATION);
}

/** Fresh default pool for a given AMM model */
export function defaultPool(ammType: AMMType): PoolState {
  return { x: 100, y: 100, k: computeK(100, 100, ammType) };
}

// ─────────────────────────────────────────────────────────────────
//  Swap calculation
// ─────────────────────────────────────────────────────────────────

export function getSpotPrice(
  pool: PoolState,
  ammType: AMMType,
  swapDirection: 'AtoB' | 'BtoA',
): number {
  if (ammType === 'CPMM') {
    return swapDirection === 'AtoB' ? pool.y / pool.x : pool.x / pool.y;
  }
  if (ammType === 'CSMM') {
    return 1.0;
  }
  // StableSwap marginal price: |dy/dx| = (4A + D^3/(4x^2 y)) / (4A + D^3/(4x y^2))
  const D = pool.k;
  const n = 2;
  const Ann = AMPLIFICATION * n * n; // 4A
  const x = pool.x;
  const y = pool.y;

  const numerator = Ann + (D * D * D) / (4 * x * x * y);
  const denominator = Ann + (D * D * D) / (4 * x * y * y);
  const marginal = numerator / denominator;

  return swapDirection === 'AtoB' ? marginal : 1 / marginal;
}

/**
 * Core swap math — pure function, no side-effects.
 *
 * Fee model: the fee is deducted from the input amount *before*
 * the invariant math runs.  The stored reserves use the
 * fee-adjusted input so they stay exactly on the invariant curve
 * (k / D / sum are preserved).  This avoids drift when the caller
 * reuses the old `pool.k` without recomputing it.
 */
export function calculateSwap(
  pool: PoolState,
  ammType: AMMType,
  swapAmount: number,
  swapDirection: 'AtoB' | 'BtoA',
) {
  const amountWithFee = swapAmount * (1 - FEE_PERCENT);
  let newX = pool.x;
  let newY = pool.y;
  let outAmount = 0;

  if (swapDirection === 'AtoB') {
    if (ammType === 'CPMM') {
      const dy = pool.y - (pool.x * pool.y) / (pool.x + amountWithFee);
      newX = pool.x + swapAmount;
      newY = pool.y - dy;
      outAmount = dy;
    } else if (ammType === 'CSMM') {
      const dy = Math.min(pool.y, amountWithFee);
      newX = pool.x + swapAmount;
      newY = pool.y - dy;
      outAmount = dy;
    } else {
      // ── Real StableSwap ──
      const D = pool.k;
      const newXReserve = pool.x + amountWithFee;
      const newYReserve = stableSwapGetY(newXReserve, D, AMPLIFICATION);
      outAmount = pool.y - newYReserve;
      newX = pool.x + swapAmount;
      newY = newYReserve;
    }
  } else {
    if (ammType === 'CPMM') {
      const dx = pool.x - (pool.x * pool.y) / (pool.y + amountWithFee);
      newY = pool.y + swapAmount;
      newX = pool.x - dx;
      outAmount = dx;
    } else if (ammType === 'CSMM') {
      const dx = Math.min(pool.x, amountWithFee);
      newY = pool.y + swapAmount;
      newX = pool.x - dx;
      outAmount = dx;
    } else {
      // ── Real StableSwap ──
      const D = pool.k;
      const newYReserve = pool.y + amountWithFee;
      const newXReserve = stableSwapGetY(newYReserve, D, AMPLIFICATION);
      outAmount = pool.x - newXReserve;
      newY = pool.y + swapAmount;
      newX = newXReserve;
    }
  }

  // ── Price Impact (Slippage) ──
  const spotPrice = getSpotPrice(pool, ammType, swapDirection);
  const idealOut = swapAmount * spotPrice * (1 - FEE_PERCENT);
  const priceImpact = idealOut > 0 ? Math.max(0, ((idealOut - outAmount) / idealOut) * 100) : 0;

  return { newX, newY, outAmount, priceImpact };
}

