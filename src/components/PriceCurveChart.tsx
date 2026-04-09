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
import { Tilt } from './motion-primitives/tilt';
import { AMPLIFICATION, generateStableSwapCurvePoints } from '../lib/amm';

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
    className="text-indigo-500"
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
    if (isStableSwap) {
      return generateStableSwapCurvePoints(pool.k, AMPLIFICATION);
    }

    const data: { x: number; y: number }[] = [];
    const minX = Math.max(5, pool.x - 80);
    const maxX = pool.x + 120;
    const step = (maxX - minX) / 60;

    for (let x = minX; x <= maxX; x += step) {
      let y = 0;
      if (ammType === 'CPMM') {
        y = pool.k / x;
      } else {
        y = Math.max(0, pool.k - x);
      }
      data.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
    }
    return data;
  }, [pool, ammType, isStableSwap]);

  /* ── price / slippage metrics ── */
  const metrics = useMemo(() => {
    if (!previousPool) return null;

    const priceBefore = previousPool.y / previousPool.x;
    const priceAfter  = pool.y / pool.x;
    const priceChange = ((priceAfter - priceBefore) / priceBefore) * 100;

    const deltaX = Math.abs(pool.x - previousPool.x);
    const deltaY = Math.abs(pool.y - previousPool.y);

    const executionPrice = deltaX > 0 ? deltaY / deltaX : 0;
    const slippage = Math.abs((executionPrice - priceBefore) / priceBefore) * 100;

    return { priceBefore, priceAfter, priceChange, deltaX, deltaY, executionPrice, slippage };
  }, [pool, previousPool]);

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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full min-h-[500px] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AnimatedTrendingUp />
            Price Curve Visualization
          </h2>
          <div className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-200 text-xs text-slate-600">
                        <p className="font-bold text-indigo-600 mb-1">Pool State</p>
                        <p>A (x): <span className="font-mono">{payload[0].payload.x}</span></p>
                        <p>B (y): <span className="font-mono">{payload[0].value}</span></p>
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
                  stroke="#fff"
                  strokeWidth={2}
                  label={{ value: 'Before', position: 'top', fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                />
              )}

              <ReferenceDot
                x={pool.x}
                y={pool.y}
                r={previousPool ? 9 : 8}
                fill="#4f46e5"
                stroke="#fff"
                strokeWidth={3}
                label={{ value: currentDotLabel, position: 'bottom', fontSize: 10, fill: '#4f46e5', fontWeight: 600 }}
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
                <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg px-4 py-3 space-y-2 min-w-[210px]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
                        className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                      <span className="text-slate-500">Before: <span className="font-mono font-semibold">{previousPool.x.toFixed(1)}, {previousPool.y.toFixed(1)}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                        className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 ring-1 ring-indigo-200" />
                      <span className="text-slate-500">After: <span className="font-mono font-semibold">{pool.x.toFixed(1)}, {pool.y.toFixed(1)}</span></span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 space-y-1.5">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                      className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Price Change</span>
                      <span className={`font-mono font-bold ${metrics.priceChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {metrics.priceChange >= 0 ? '+' : ''}{metrics.priceChange.toFixed(2)}%
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                      className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Slippage</span>
                      <span className={`font-mono font-bold ${
                        metrics.slippage > 1 ? 'text-red-500' : metrics.slippage > 0.5 ? 'text-amber-500' : 'text-green-600'
                      }`}>
                        {metrics.slippage.toFixed(3)}%
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                      className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{'\u0394'}A</span>
                      <span className="font-mono font-semibold text-slate-600">
                        {pool.x > previousPool.x ? '+' : ''}{(pool.x - previousPool.x).toFixed(2)}
                      </span>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}
                      className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{'\u0394'}B</span>
                      <span className="font-mono font-semibold text-slate-600">
                        {pool.y > previousPool.y ? '+' : ''}{(pool.y - previousPool.y).toFixed(2)}
                      </span>
                    </motion.div>
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pt-1">
                    <div className="text-[10px] text-slate-400 mb-1">Slippage Impact</div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(metrics.slippage * 10, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          metrics.slippage > 1 ? 'bg-red-400' : metrics.slippage > 0.5 ? 'bg-amber-400' : 'bg-green-400'
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
