import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightLeft, Plus, RefreshCw, Zap, Info } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { Tilt } from './motion-primitives/tilt';
import { cn } from '../lib/utils';
import type { AMMType, PoolState, Token, SwapResult } from '../types/amm';
import { estimateOutput } from '../lib/amm';

interface SwapControlsProps {
  ammType: AMMType;
  pool: PoolState;
  tokenA: Token;
  tokenB: Token;
  swapAmount: number;
  setSwapAmount: (val: number) => void;
  swapDirection: 'AtoB' | 'BtoA';
  setSwapDirection: React.Dispatch<React.SetStateAction<'AtoB' | 'BtoA'>>;
  isSwapping: boolean;
  lastSwapResult: SwapResult | null;
  handleSwap: () => void;
  handleAddLiquidity: (aA: number, aB: number) => void;
}

export const SwapControls = ({
  ammType,
  pool,
  tokenA,
  tokenB,
  swapAmount,
  setSwapAmount,
  swapDirection,
  setSwapDirection,
  isSwapping,
  lastSwapResult,
  handleSwap,
  handleAddLiquidity,
}: SwapControlsProps) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap');

  return (
    <Tilt rotationFactor={4} isRevese className="h-full w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('swap')}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-all",
              activeTab === 'swap' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveTab('liquidity')}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-all",
              activeTab === 'liquidity' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Liquidity
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'swap' ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ArrowRightLeft className="text-indigo-500 w-5 h-5" />
                Swap Simulation
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <label className="text-xs font-medium text-slate-400 uppercase mb-1 block">You Pay</label>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-indigo-300 transition-all">
                    <input
                      type="number"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(Number(e.target.value))}
                      className="bg-transparent text-xl font-bold w-full outline-none"
                    />
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                      <TokenIcon symbol={swapDirection === 'AtoB' ? tokenA.symbol : tokenB.symbol} className="w-5 h-5" />
                      <span className="font-bold text-sm">{swapDirection === 'AtoB' ? tokenA.symbol : tokenB.symbol}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSwapDirection(prev => prev === 'AtoB' ? 'BtoA' : 'AtoB')}
                    className="absolute left-1/2 -bottom-6 -translate-x-1/2 z-10 bg-white p-2 rounded-full border border-slate-200 shadow-md hover:scale-110 transition-transform text-indigo-600"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div className="pt-4">
                  <label className="text-xs font-medium text-slate-400 uppercase mb-1 block">You Receive (Est.)</label>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 opacity-80">
                    <span className="text-xl font-bold text-slate-400">
                      {swapAmount > 0
                        ? estimateOutput(pool, ammType, swapAmount, swapDirection).toFixed(4)
                        : '0.0000'}
                    </span>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                      <TokenIcon symbol={swapDirection === 'AtoB' ? tokenB.symbol : tokenA.symbol} className="w-5 h-5" />
                      <span className="font-bold text-sm">{swapDirection === 'AtoB' ? tokenB.symbol : tokenA.symbol}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSwap}
                  disabled={isSwapping || swapAmount <= 0}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg",
                    isSwapping ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
                  )}
                >
                  {isSwapping ? "Simulating..." : "Execute Swap"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="text-indigo-500 w-5 h-5" />
                Add Liquidity
              </h2>
              <p className="text-xs text-slate-500">
                Adding liquidity increases the constant 'k', shifting the curve outward and reducing slippage.
              </p>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Add 10% Liquidity</span>
                    <button
                      onClick={() => handleAddLiquidity(pool.x * 0.1, pool.y * 0.1)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      Add Now
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Add 50% Liquidity</span>
                    <button
                      onClick={() => handleAddLiquidity(pool.x * 0.5, pool.y * 0.5)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      Add Now
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 flex gap-3">
                  <Info size={16} className="shrink-0" />
                  <p>When you add liquidity, you must provide both tokens in proportion to the current price to avoid arbitrage.</p>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {lastSwapResult && activeTab === 'swap' && !isSwapping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border border-green-100 p-4 rounded-xl text-sm text-green-800"
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <Zap size={14} /> Swap Successful
                </div>
                Swapped {lastSwapResult.in.toFixed(2)} for {lastSwapResult.out.toFixed(4)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Tilt>
  );
};
