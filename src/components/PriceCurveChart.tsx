import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { AMMType, PoolState } from '../types/amm';

interface PriceCurveChartProps {
  ammType: AMMType;
  pool: PoolState;
  previousPool: PoolState | null;
}

import { Tilt } from './motion-primitives/tilt';

export const PriceCurveChart = ({ ammType, pool, previousPool }: PriceCurveChartProps) => {
  const chartData = useMemo(() => {
    const data = [];
    const minX = Math.max(5, pool.x - 80);
    const maxX = pool.x + 120;
    const step = (maxX - minX) / 60;

    for (let x = minX; x <= maxX; x += step) {
      let y = 0;
      if (ammType === 'CPMM') {
        y = pool.k / x;
      } else if (ammType === 'CSMM') {
        y = Math.max(0, pool.k - x);
      } else {
        const leverage = 0.1;
        y = (pool.k - leverage * x) / (1 + leverage);
      }
      data.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
    }
    return data;
  }, [pool, ammType]);

  return (
    <Tilt rotationFactor={4} isRevese className="h-full w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full min-h-[500px] flex flex-col">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="text-indigo-500 w-5 h-5" />
            Price Curve Visualization
          </h2>
          <div className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Formula: {ammType === 'CPMM' ? 'x * y = k' : 'x + y = k'}
          </div>
        </div>

        <div className="relative flex-1 min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="x"
                type="number"
                domain={['dataMin', 'dataMax']}
                label={{ value: 'Token A Reserve', position: 'insideBottom', offset: -5, fontSize: 12 }}
                tick={{ fontSize: 10 }}
              />
              <YAxis
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
              <Line
                type="monotone"
                dataKey="y"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />

              {/* Previous Point Marker */}
              {previousPool && (
                <ReferenceDot
                  x={previousPool.x}
                  y={previousPool.y}
                  r={6}
                  fill="#94a3b8"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}

              {/* Current Point Marker */}
              <ReferenceDot
                x={pool.x}
                y={pool.y}
                r={8}
                fill="#4f46e5"
                stroke="#fff"
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>

          {/* Dot legend — top-right corner of chart */}
          {previousPool && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-[11px] space-y-1.5 z-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span className="text-slate-500">Previous State: <span className="font-mono font-semibold">{previousPool.x.toFixed(1)}, {previousPool.y.toFixed(1)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 ring-1 ring-indigo-200" />
                <span className="text-slate-500">Current State: <span className="font-mono font-semibold">{pool.x.toFixed(1)}, {pool.y.toFixed(1)}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Tilt>
  );
};
