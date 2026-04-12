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

  const inToken = swapDirection === 'AtoB' ? tokenA : tokenB;
  const outToken = swapDirection === 'AtoB' ? tokenB : tokenA;

  return (
    <section className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl space-y-12">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold mb-4 text-indigo-400">
          How it works: {selectedAmm.name.split(' (')[0]}
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed">
          {ammType === 'CPMM' && "The Constant Product model ensures that the total product of the two token reserves stays constant. This creates a hyperbolic curve where the price increases exponentially as liquidity is drained, preventing the pool from ever reaching zero."}
          {ammType === 'CSMM' && "The Constant Sum model maintains a fixed total amount of assets. While this allows for theoretically zero slippage, it is vulnerable to being 'drained' if the external market price moves away from 1:1."}
          {ammType === 'StableSwap' && "The Hybrid StableSwap model leverages a specialized invariant that combines both Constant Sum and Constant Product math. It provides extremely high capital efficiency and near-zero slippage near the 1:1 peg."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {lastSwapResult && (
          <motion.div
            key="swap-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
          >
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Realized Output</div>
              <div className="text-xl font-bold text-white flex items-center truncate">
                {lastSwapResult.in} {inToken.symbol}
                <ArrowRight size={14} className="mx-2 text-indigo-500 shrink-0" />
                {lastSwapResult.out.toFixed(4)} {outToken.symbol}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Price Impact</div>
              <div className={cn("text-xl font-bold", lastSwapResult.priceImpact > 5 ? "text-rose-400" : "text-emerald-400")}>
                {lastSwapResult.priceImpact.toFixed(2)}%
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Difference between market price and realized price.</p>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">LP Fee (0.3%)</div>
              <div className="text-xl font-bold text-amber-400">
                {lastSwapResult.fee.toFixed(4)} {inToken.symbol}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">100% enters pool; fee stays as LP reward.</p>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Invariant Shift ({lastSwapResult.invariantName})</div>
              <div className="text-xl font-bold text-sky-400 flex items-center gap-2">
                {lastSwapResult.kBefore.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <ArrowRight size={14} className="text-sky-600" />
                {lastSwapResult.kAfter.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="text-[10px] text-emerald-400 font-medium">↑ Improved via fee accumulation</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Deep Dive: Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-slate-800/20 p-8 rounded-2xl border border-slate-700/30">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-xs tracking-[0.2em]">
            Key Advantage
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            {ammType === 'CPMM' && "Allows for continuous, permissionless trading across any price range without needing external price oracles."}
            {ammType === 'CSMM' && "Provides the most efficient trades possible (1:1) as long as the pool remains balanced."}
            {ammType === 'StableSwap' && "Massive efficiency for correlated assets; handles billions in volume with cents in slippage."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold uppercase text-xs tracking-[0.2em]">
            Main Tradeoff
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            {ammType === 'CPMM' && "Impermanent Loss: LPs lose value if the price of paired tokens diverges from their entry point."}
            {ammType === 'CSMM' && "Systemic Risk: Arbitrageurs will completely drain the 'cheap' token if the market price deviates from 1:1."}
            {ammType === 'StableSwap' && "Complexity: If one asset de-pegs permanently, the model reverts to inefficient CPMM behavior."}
          </p>
        </div>
      </div>

      {/* FAQ Cards: Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/20 border border-slate-700/30 p-6 rounded-2xl hover:bg-slate-800/40 transition-colors group">
          <h4 className="text-lg font-bold mb-2">Can we control slippage?</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Yes. Users can set a <strong>Slippage Tolerance</strong> (e.g., 0.5%). If the real price moves further before the tx confirms, the execution reverts to protect your funds.
          </p>
        </div>

        <div className="bg-slate-800/20 border border-slate-700/30 p-6 rounded-2xl hover:bg-slate-800/40 transition-colors group">
          <h4 className="text-lg font-bold mb-2">Are LP fees constant?</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Usually, yes (0.3% is standard). Some protocols use <strong>Dynamic Fees</strong> that increase during high volatility or decrease for stablecoin-only pairs.
          </p>
        </div>

        <div className="bg-slate-800/20 border border-slate-700/30 p-6 rounded-2xl hover:bg-slate-800/40 transition-colors group">
          <h4 className="text-lg font-bold mb-2">Can the pool be drained?</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            {ammType === 'CPMM' && "In CPMM, it is mathematically impossible to empty the pool. As reserves drop, the cost approaches infinity, pricing out all buyers."}
            {ammType === 'CSMM' && "Yes. CSMM is highly vulnerable. If the market price deviates from 1:1, arbitrageurs will drain the reserve completely."}
            {ammType === 'StableSwap' && "Essentially no. StableSwap transitions to CPMM behavior if reserves become unbalanced, protecting the final tokens."}
          </p>
        </div>
      </div>
    </section>
  );
};
