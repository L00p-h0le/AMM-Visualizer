import { Droplets, RefreshCw, HelpCircle } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { TOKENS, type PoolState, type Token } from '../types/amm';

interface PoolStatsProps {
  pool: PoolState;
  tokenA: Token;
  tokenB: Token;
  setTokenA: (t: Token) => void;
  setTokenB: (t: Token) => void;
  currentPrice: string;
  resetPool: () => void;
}

export const PoolStats = ({
  pool,
  tokenA,
  tokenB,
  setTokenA,
  setTokenB,
  currentPrice,
  resetPool
}: PoolStatsProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
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
          <div className="text-2xl font-bold tabular-nums">{pool.x.toFixed(2)}</div>
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
          <div className="text-2xl font-bold tabular-nums">{pool.y.toFixed(2)}</div>
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
  );
};
