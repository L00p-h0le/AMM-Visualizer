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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="text-indigo-500 w-5 h-5" />
          Price Curve Visualization
        </h2>
        <div className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
          Formula: {ammType === 'CPMM' ? 'x * y = k' : 'x + y = k'}
        </div>
      </div>

      <div className="absolute inset-0 pt-20 pb-10 px-4">
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
                    <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-200 text-xs">
                      <p className="font-bold text-indigo-600">Pool State</p>
                      <p>A: {payload[0].value}</p>
                      <p>B: {payload[1]?.value || payload[0].payload.y}</p>
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
              animationDuration={1000}
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

            {/* Visual Line between points if we have a previous pool state */}
            {previousPool && (
              <Line
                data={[{x: previousPool.x, y: previousPool.y}, {x: pool.x, y: pool.y}]}
                type="linear"
                dataKey="y"
                stroke="#4f46e5"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
