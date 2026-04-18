import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import type { AMMType, PoolState } from '../types/amm';
import { Tilt } from './Animation/Tilt';
import { AMPLIFICATION, generateStableSwapCurvePoints, getSpotPrice, FEE_PERCENT } from '../lib/amm';

/** Animated TrendingUp icon — draws in on mount */
const AnimatedTrendingUp = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-purple-400"
  >
    <motion.polyline
      points="22 7 13.5 15.5 8.5 10.5 2 17"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
    />
    <motion.polyline
      points="16 7 22 7 22 13"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.9, ease: 'easeOut' }}
    />
  </motion.svg>
);

interface PriceCurveChartProps {
  ammType: AMMType;
  pool: PoolState;
  previousPool: PoolState | null;
}

export const PriceCurveChart = ({ ammType, pool, previousPool }: PriceCurveChartProps) => {
  const isStableSwap = ammType === 'StableSwap';

  // For StableSwap, pool.k stores D (the invariant)
  const axisBound = isStableSwap ? Math.ceil(pool.k * 1.05) : undefined;

  /* ── curve data ── */
  const chartData = useMemo(() => {
    let data: { x: number; y: number }[] = [];

    if (isStableSwap) {
      data = generateStableSwapCurvePoints(pool.k, AMPLIFICATION);
    } else {
      const minX = Math.max(5, pool.x - 80);
      const maxX = pool.x + 120;
      const step = (maxX - minX) / 60;

      for (let x = minX; x <= maxX; x += step) {
        let y = 0;
        if (ammType === 'CPMM') {
          y = pool.k / x;
        } else {
          y = pool.k - x;
        }

        // Only add points that are valid (x > 0, y >= 0)
        // Filtering y >= 0 and stopping once we hit 0 prevents the "bump" artifact
        if (x > 0 && y >= 0) {
          data.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
          if (y === 0) break; // Stop generating points once we hit the axis
        }
      }
    }

    // Exact pool point to ensure the tooltip "locks in" on the final state
    const injectedPoints: { x: number; y: number }[] = [
      { x: Number(pool.x.toFixed(2)), y: Number(pool.y.toFixed(2)) }
    ];

    // Merge, deduplicate (keeping injected point first), and sort
    return [...injectedPoints, ...data]
      .filter((v, i, a) => a.findIndex(t => t.x === v.x) === i)
      .sort((a, b) => a.x - b.x);
  }, [pool, previousPool, ammType, isStableSwap]);

  /* ── price / slippage metrics ── */
  const metrics = useMemo(() => {
    if (!previousPool) return null;

    const swapDirection = pool.x > previousPool.x ? 'AtoB' : 'BtoA';

    // Use centralized logic for spot price (initial price)
    const initialSpotPrice = getSpotPrice(previousPool, ammType, swapDirection);

    // Price change is based on MARGINAL spot price change
    const finalSpotPrice = getSpotPrice(pool, ammType, swapDirection);
    const priceChange = ((finalSpotPrice - initialSpotPrice) / initialSpotPrice) * 100;

    const deltaX = Math.abs(pool.x - previousPool.x);
    const deltaY = Math.abs(pool.y - previousPool.y);

    // Realized execution price (output per unit of input)
    const outAmount = swapDirection === 'AtoB' ? deltaY : deltaX;
    const inAmount = swapDirection === 'AtoB' ? deltaX : deltaY;

    // Slippage = realized out vs ideal out at initial spot price
    const idealOut = inAmount * (1 - FEE_PERCENT) * initialSpotPrice;
    const slippage = idealOut > 0 ? Math.max(0, ((idealOut - outAmount) / idealOut) * 100) : 0;

    return { priceChange, deltaX, deltaY, slippage };
  }, [pool, previousPool, ammType]);

  /* ── trade-impact zone bounds ── */
  const tradeZone = useMemo(() => {
    if (!previousPool) return null;
    return {
      x1: Math.min(previousPool.x, pool.x),
      x2: Math.max(previousPool.x, pool.x),
      y1: Math.min(previousPool.y, pool.y),
      y2: Math.max(previousPool.y, pool.y),
    };
  }, [pool, previousPool]);

  const currentDotLabel = previousPool ? 'After' : 'Current';

  const formulaLabel =
    ammType === 'CPMM'
      ? 'x \u00b7 y = k'
      : ammType === 'CSMM'
        ? 'x + y = k'
        : `4A(x+y)+D = 4AD+D\u00b3/4xy  [A=${AMPLIFICATION}]`;

  return (
    <Tilt rotationFactor={4} isRevese className="h-full w-full">
      <div className="bg-[#13111C] p-6 rounded-2xl border border-white/5 h-full min-h-[500px] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
            <AnimatedTrendingUp />
            Price Curve Visualization
          </h2>
          <div className="text-xs font-mono text-white/50 bg-white/5 border border-white/10 px-2 py-1 rounded">
            {formulaLabel}
          </div>
        </div>

        {/* Chart — square aspect for StableSwap, flex-fill for others */}
        <div className={`relative w-full ${isStableSwap ? 'flex justify-center items-start' : 'flex-1 min-h-[300px]'}`}>
          {/*
           * StableSwap slope is ~-1 near equilibrium.
           * A wide (non-square) canvas makes that look linear.
           * aspect={1} forces equal pixel width & height so the
           * flat middle and steep ends are geometrically accurate.
           */}
          <ResponsiveContainer
            width="100%"
            {...(isStableSwap ? { aspect: 1 } : { height: '100%' })}
          >
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
              <XAxis
                dataKey="x"
                type="number"
                domain={isStableSwap ? [0, axisBound!] : ['dataMin', 'dataMax']}
                label={{ value: 'Token A Reserve', position: 'insideBottom', offset: -5, fontSize: 12 }}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                domain={isStableSwap ? [0, axisBound!] : undefined}
                label={{ value: 'Token B Reserve', angle: -90, position: 'insideLeft', fontSize: 12 }}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const hoveredX = payload[0].payload.x;
                    const hoveredY = payload[0].value as number;

                    // Proximity thresholds for snapping to dots
                    // Since step is ~3.3 in CSMM/CPMM and ~1.0 in StableSwap, 2.0 is a good threshold
                    const threshold = isStableSwap ? 1.5 : 3.0;

                    let displayX = hoveredX;
                    let displayY = hoveredY;
                    let isExactDot = false;
                    let dotLabel = "";

                    if (previousPool && Math.abs(hoveredX - previousPool.x) < threshold) {
                      displayX = previousPool.x;
                      displayY = previousPool.y;
                      isExactDot = true;
                      dotLabel = "Before";
                    } else if (Math.abs(hoveredX - pool.x) < threshold) {
                      displayX = pool.x;
                      displayY = pool.y;
                      isExactDot = true;
                      dotLabel = currentDotLabel;
                    }

                    return (
                      <div className="bg-[#1a1a1a]/95 backdrop-blur-md p-3 rounded-lg shadow-xl border border-white/10 text-xs text-white/90">
                        <p className={`font-bold mb-1 ${isExactDot ? 'text-purple-400' : 'text-white/50 font-mono'}`}>
                          {isExactDot ? `Pool State (${dotLabel})` : 'Theoretical State'}
                        </p>
                        <p>A (x): <span className="font-mono">{displayX.toFixed(2)}</span></p>
                        <p>B (y): <span className="font-mono">{displayY.toFixed(2)}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {tradeZone && (
                <ReferenceArea
                  x1={tradeZone.x1}
                  x2={tradeZone.x2}
                  y1={tradeZone.y1}
                  y2={tradeZone.y2}
                  fill="#6366f1"
                  fillOpacity={0.08}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  strokeOpacity={0.3}
                  ifOverflow="extendDomain"
                />
              )}

              {previousPool && (
                <>
                  <ReferenceLine y={previousPool.y} stroke="#94a3b8" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine x={previousPool.x} stroke="#94a3b8" strokeDasharray="3 3" strokeOpacity={0.5} />
                </>
              )}

              <Line
                type="monotone"
                dataKey="y"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />

              {previousPool && (
                <ReferenceDot
                  x={previousPool.x}
                  y={previousPool.y}
                  r={7}
                  fill="#94a3b8"
                  stroke="#1a1a1a"
                  strokeWidth={2}
                  label={{ value: 'Before', position: 'top', fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                />
              )}

              <ReferenceDot
                x={pool.x}
                y={pool.y}
                r={previousPool ? 9 : 8}
                fill="#a855f7"
                stroke="#1a1a1a"
                strokeWidth={3}
                label={{ value: currentDotLabel, position: 'bottom', fontSize: 10, fill: '#a855f7', fontWeight: 600 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Animated metrics overlay */}
          <AnimatePresence>
            {previousPool && metrics && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute top-3 right-3 z-10"
              >
                <div className="bg-[#1a1a1a]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-lg px-4 py-3 space-y-2 min-w-[210px]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
                        className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                      <span className="text-white/50">Before: <span className="font-mono font-semibold text-white/90">{previousPool.x.toFixed(1)}, {previousPool.y.toFixed(1)}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                        className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 ring-1 ring-purple-400/30" />
                      <span className="text-white/50">After: <span className="font-mono font-semibold text-white/90">{pool.x.toFixed(1)}, {pool.y.toFixed(1)}</span></span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 space-y-1.5">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                      className="flex justify-between text-[11px]">
                      <span className="text-white/50">Price Change</span>
                      <span className={`font-mono font-bold ${metrics.priceChange >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {metrics.priceChange >= 0 ? '+' : ''}{metrics.priceChange.toFixed(2)}%
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                      className="flex justify-between text-[11px]">
                      <span className="text-white/50">Slippage</span>
                      <span className={`font-mono font-bold ${metrics.slippage > 1 ? 'text-red-400' : metrics.slippage > 0.5 ? 'text-amber-400' : 'text-green-500'
                        }`}>
                        {metrics.slippage.toFixed(3)}%
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                      className="flex justify-between text-[11px]">
                      <span className="text-white/50">{'\u0394'}A</span>
                      <span className="font-mono font-semibold text-white/90">
                        {pool.x > previousPool.x ? '+' : ''}{(pool.x - previousPool.x).toFixed(2)}
                      </span>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}
                      className="flex justify-between text-[11px]">
                      <span className="text-white/50">{'\u0394'}B</span>
                      <span className="font-mono font-semibold text-white/90">
                        {pool.y > previousPool.y ? '+' : ''}{(pool.y - previousPool.y).toFixed(2)}
                      </span>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pt-1">
                    <div className="text-[10px] text-white/50 mb-1">Slippage Impact</div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(metrics.slippage * 10, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
                        className={`h-full rounded-full ${metrics.slippage > 1 ? 'bg-red-400' : metrics.slippage > 0.5 ? 'bg-amber-400' : 'bg-green-400'
                          }`}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Tilt>
  );
};
