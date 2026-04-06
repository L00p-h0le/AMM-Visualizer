import { useState, useEffect } from 'react';
import { Droplets, RefreshCw, HelpCircle } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { TOKENS, type AMMType, type PoolState, type Token } from '../types/amm';

interface PoolStatsProps {
  pool: PoolState;
  ammType: AMMType;
  tokenA: Token;
  tokenB: Token;
  setTokenA: (t: Token) => void;
  setTokenB: (t: Token) => void;
  setPool: (pool: PoolState) => void;
  currentPrice: string;
  resetPool: () => void;
}

/** Recalculate k based on the AMM type */
const computeK = (x: number, y: number, ammType: AMMType): number => {
  if (ammType === 'CPMM') return x * y;
  return x + y; // CSMM and StableSwap simplified
};

import { Tilt } from './motion-primitives/tilt';

export const PoolStats = ({
  pool,
  ammType,
  tokenA,
  tokenB,
  setTokenA,
  setTokenB,
  setPool,
  currentPrice,
  resetPool
}: PoolStatsProps) => {
  // Local string state so users can freely type without snapping
  const [inputX, setInputX] = useState(String(pool.x));
  const [inputY, setInputY] = useState(String(pool.y));

  // Sync local inputs when pool changes externally (swap, reset, etc.)
  useEffect(() => { setInputX(String(pool.x)); }, [pool.x]);
  useEffect(() => { setInputY(String(pool.y)); }, [pool.y]);

  const commitValue = (axis: 'x' | 'y') => {
    const raw = axis === 'x' ? inputX : inputY;
    const value = parseFloat(raw);
    if (isNaN(value) || value <= 0) {
      // Revert to current pool value
      if (axis === 'x') setInputX(String(pool.x));
      else setInputY(String(pool.y));
      return;
    }
    const newX = axis === 'x' ? value : pool.x;
    const newY = axis === 'y' ? value : pool.y;
    setPool({ x: newX, y: newY, k: computeK(newX, newY, ammType) });
  };

  return (
    <Tilt rotationFactor={4} isRevese className="h-full w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Droplets className="text-indigo-500 w-5 h-5" />
            Pool Reserves
          </h2>
          <button
            onClick={resetPool}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            title="Reset Pool"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TokenIcon symbol={tokenA.symbol} className="w-6 h-6" />
                <span className="text-xs font-bold text-slate-500 uppercase">{tokenA.symbol}</span>
              </div>
              <select
                value={tokenA.symbol}
                onChange={(e) => setTokenA(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[0])}
                className="bg-transparent text-[10px] font-bold text-indigo-600 outline-none cursor-pointer"
              >
                {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
            </div>
            <input
              type="number"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              onBlur={() => commitValue('x')}
              min={1}
              className="w-full text-2xl font-bold tabular-nums bg-transparent outline-none focus:text-indigo-600 transition-colors"
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TokenIcon symbol={tokenB.symbol} className="w-6 h-6" />
                <span className="text-xs font-bold text-slate-500 uppercase">{tokenB.symbol}</span>
              </div>
              <select
                value={tokenB.symbol}
                onChange={(e) => setTokenB(TOKENS.find(t => t.symbol === e.target.value) || TOKENS[1])}
                className="bg-transparent text-[10px] font-bold text-indigo-600 outline-none cursor-pointer"
              >
                {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
            </div>
            <input
              type="number"
              value={inputY}
              onChange={(e) => setInputY(e.target.value)}
              onBlur={() => commitValue('y')}
              min={1}
              className="w-full text-2xl font-bold tabular-nums bg-transparent outline-none focus:text-indigo-600 transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 flex items-center gap-1">
              Current Price <HelpCircle size={14} className="text-slate-300" />
            </span>
            <span className="font-mono font-semibold text-indigo-600">1 {tokenA.symbol} = {currentPrice} {tokenB.symbol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Constant (k)</span>
            <span className="font-mono font-semibold text-slate-700">{pool.k.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Tilt>
  );
};
