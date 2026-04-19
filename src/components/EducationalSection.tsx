import { useState, useEffect, useRef } from 'react';
import { AMM_MODELS, type AMMType, type Token, type SwapResult } from '../types/amm';
import { cn } from '../lib/utils';

interface EducationalSectionProps {
  ammType: AMMType;
  lastSwapResult: SwapResult | null;
  swapDirection: 'AtoB' | 'BtoA';
  tokenA: Token;
  tokenB: Token;
}

export const EducationalSection = ({ ammType }: Pick<EducationalSectionProps, 'ammType'>) => {
  const [activeModelId, setActiveModelId] = useState<AMMType>(ammType);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync with global model change from the top section
  useEffect(() => {
    const index = AMM_MODELS.findIndex(m => m.id === ammType);
    if (index !== -1 && scrollRef.current) {
      const scrollWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: index * scrollWidth, behavior: 'smooth' });
    }
  }, [ammType]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / offsetWidth);
    if (AMM_MODELS[index]) {
      setActiveModelId(AMM_MODELS[index].id as AMMType);
    }
  };

  const scrollToModel = (id: AMMType) => {
    const index = AMM_MODELS.findIndex(m => m.id === id);
    if (index !== -1 && scrollRef.current) {
      const scrollWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: index * scrollWidth, behavior: 'smooth' });
    }
  };


  return (
    <div className="space-y-8">
      {/* "How it works" stays outside for context */}
      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
        How it works:
      </h2>
      
      {/* Main Educational Carousel Container */}
      <section className="relative group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {AMM_MODELS.map((model) => (
            <div
              key={model.id}
              className="min-w-full snap-center p-8 md:p-12 space-y-12"
            >
              <div className="max-w-3xl space-y-4">
                <h3 className="text-4xl font-bold text-purple-600 tracking-tight">
                  {model.name.split(' (')[0]}
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  {model.id === 'CPMM' && "The Constant Product model ensures that the total product of the two token reserves stays constant. This creates a hyperbolic curve where the price increases exponentially as liquidity is drained, preventing the pool from ever reaching zero."}
                  {model.id === 'CSMM' && "The Constant Sum model maintains a fixed total amount of assets. While this allows for theoretically zero slippage, it is vulnerable to being 'drained' if the external market price moves away from 1:1."}
                  {model.id === 'StableSwap' && "The Hybrid StableSwap model leverages a specialized invariant that combines both Constant Sum and Constant Product math. It provides extremely high capital efficiency and near-zero slippage near the 1:1 peg."}
                </p>
              </div>

              {/* Model Deep Dive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-600 font-bold uppercase text-[10px] tracking-[0.2em]">
                    Key Advantage
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed">
                    {model.id === 'CPMM' && "Allows for continuous, permissionless trading across any price range without needing external price oracles."}
                    {model.id === 'CSMM' && "Provides the most efficient trades possible (1:1) as long as the pool remains balanced."}
                    {model.id === 'StableSwap' && "Massive efficiency for correlated assets; handles billions in volume with cents in slippage."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                    Main Tradeoff
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed">
                    {model.id === 'CPMM' && "Impermanent Loss: LPs lose value if the price of paired tokens diverges from their entry point."}
                    {model.id === 'CSMM' && "Systemic Risk: Arbitrageurs will completely drain the 'cheap' token if the market price deviates from 1:1."}
                    {model.id === 'StableSwap' && "Complexity: If one asset de-pegs permanently, the model reverts to inefficient CPMM behavior."}
                  </p>
                </div>
              </div>

              {/* FAQ Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                <div className="bg-white border border-slate-100 p-6 rounded-2-5xl shadow-sm hover:border-purple-100 transition-colors group">
                  <h4 className="text-base font-bold mb-2 text-slate-900">Can we control slippage?</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Yes. Users can set a <strong className="text-slate-700">Slippage Tolerance</strong> (e.g., 0.5%). If the real price moves further before the tx confirms, the execution reverts to protect your funds.
                  </p>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2-5xl shadow-sm hover:border-purple-100 transition-colors group">
                  <h4 className="text-base font-bold mb-2 text-slate-900">Are LP fees constant?</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Usually, yes (0.3% is standard). Some protocols use <strong className="text-slate-700">Dynamic Fees</strong> that increase during high volatility or decrease for stablecoin-only pairs.
                  </p>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2-5xl shadow-sm hover:border-purple-100 transition-colors group">
                  <h4 className="text-base font-bold mb-2 text-slate-900">Can the pool be drained?</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {model.id === 'CPMM' && "In CPMM, it is mathematically impossible to empty the pool. As reserves drop, the cost approaches infinity, pricing out all buyers."}
                    {model.id === 'CSMM' && "Yes. CSMM is highly vulnerable. If the market price deviates from 1:1, arbitrageurs will drain the reserve completely."}
                    {model.id === 'StableSwap' && "Essentially no. StableSwap transitions to CPMM behavior if reserves become unbalanced, protecting the final tokens."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots - Bottom of Card */}
        <div className="flex items-center justify-center gap-4 pb-8 pt-4 bg-white">
          {AMM_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => scrollToModel(model.id as AMMType)}
              className={cn(
                "rounded-full transition-all duration-300",
                activeModelId === model.id
                  ? "bg-purple-600 w-3 h-3 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  : "bg-slate-200 hover:bg-slate-300 w-1.5 h-1.5"
              )}
              title={model.name}
            />
          ))}
        </div>

        {/* Side shadows to indicate scrollability */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50/10 to-transparent pointer-events-none rounded-l-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50/10 to-transparent pointer-events-none rounded-r-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
      </section>
    </div>
  );
};

