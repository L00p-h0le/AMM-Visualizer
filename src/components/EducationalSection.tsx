import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { AMM_MODELS, type AMMType, type Token, type SwapResult } from '../types/amm';

interface EducationalSectionProps {
  ammType: AMMType;
  lastSwapResult: SwapResult | null;
  swapDirection: 'AtoB' | 'BtoA';
  tokenA: Token;
  tokenB: Token;
}

export const EducationalSection = ({ ammType, lastSwapResult, swapDirection, tokenA, tokenB }: EducationalSectionProps) => {
  const selectedAmm = AMM_MODELS.find(m => m.id === ammType) || AMM_MODELS[0];

  return (
    <section className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl space-y-8">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold mb-4">How it works: {selectedAmm.name}</h2>
        <p className="text-slate-400 text-lg">
          {ammType === 'CPMM' && "The Constant Product model ensures that the product of the two token reserves stays constant. This creates a hyperbolic curve where price increases exponentially as liquidity is drained."}
          {ammType === 'CSMM' && "The Constant Sum model keeps the total sum of reserves constant. This allows for zero-slippage trades but risks draining the pool if the price deviates from 1:1."}
          {ammType === 'StableSwap' && "The StableSwap model is a hybrid that provides extremely low slippage for assets that are pegged to each other (like USDC and USDT)."}
        </p>
      </div>

      <AnimatePresence>
        {lastSwapResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700"
          >
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Swap Detail</div>
              <div className="text-xl font-bold text-indigo-400 flex items-center">
                {lastSwapResult.in} {swapDirection === 'AtoB' ? tokenA.symbol : tokenB.symbol}
                <ArrowRight size={16} className="inline mx-2" />
                {lastSwapResult.out.toFixed(4)} {swapDirection === 'AtoB' ? tokenB.symbol : tokenA.symbol}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price Impact (Slippage)</div>
              <div className={cn("text-xl font-bold", lastSwapResult.priceImpact > 5 ? "text-red-400" : "text-green-400")}>
                {lastSwapResult.priceImpact.toFixed(2)}%
              </div>
              <p className="text-[10px] text-slate-500">How much the price shifted due to your trade size.</p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">LP Fee (0.3%)</div>
              <div className="text-xl font-bold text-amber-400">
                {lastSwapResult.fee.toFixed(4)} {swapDirection === 'AtoB' ? tokenA.symbol : tokenB.symbol}
              </div>
              <p className="text-[10px] text-slate-500">Fees paid to liquidity providers for facilitating the swap.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-xl font-bold text-indigo-400">Model Characteristics</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          {ammType === 'CPMM' ? (
            <>
              <li className="flex items-start gap-2 bg-slate-800/30 p-3 rounded-lg">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Infinite liquidity range: Price can theoretically go from 0 to infinity.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-800/30 p-3 rounded-lg">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Deterministic Slippage: Larger trades always result in higher price impact.</span>
              </li>
            </>
          ) : ammType === 'CSMM' ? (
            <>
              <li className="flex items-start gap-2 bg-slate-800/30 p-3 rounded-lg">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Zero Slippage: Trades happen at exactly 1:1 regardless of size.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-800/30 p-3 rounded-lg">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Drainage Risk: If external price changes, arbitrageurs will empty the pool.</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2 bg-slate-800/30 p-3 rounded-lg">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Amplified Liquidity: Extremely low slippage near the peg (1:1).</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-800/30 p-3 rounded-lg">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Dynamic Curve: Transitions to CPMM behavior when assets de-peg.</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </section>
  );
};
