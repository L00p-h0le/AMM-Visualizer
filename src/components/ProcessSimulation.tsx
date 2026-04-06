import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowRight, Coins } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { cn } from '../lib/utils';
import type { AMMType, PoolState, Token } from '../types/amm';

interface ProcessSimulationProps {
  pool: PoolState;
  isSwapping: boolean;
  animationState: 'idle' | 'sending' | 'receiving' | 'balancing';
  swapDirection: 'AtoB' | 'BtoA';
  swapAmount: number;
  tokenA: Token;
  tokenB: Token;
  lastSwapResult: any;
  ammType: AMMType;
}

export const ProcessSimulation = ({
  pool,
  isSwapping,
  animationState,
  swapDirection,
  swapAmount,
  tokenA,
  tokenB,
  lastSwapResult,
  ammType
}: ProcessSimulationProps) => {
  return (
    <div className={cn(
      "bg-white p-6 rounded-2xl shadow-sm border-2 transition-all duration-500",
      isSwapping ? "border-indigo-500 ring-4 ring-indigo-50 shadow-2xl scale-[1.02]" : "border-slate-200"
    )}>
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Zap className={cn("w-5 h-5", isSwapping ? "text-indigo-500 animate-pulse" : "text-slate-400")} />
        Real-time Process Simulation
      </h2>

      <div className="relative h-64 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-around p-8 border border-slate-100">
        {/* User Side */}
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
            <div className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Wallet</div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</div>
        </div>

        {/* Animation Path */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {animationState === 'sending' && (
              <motion.div
                key="swap-sending"
                initial={{ left: "20%", top: "50%", opacity: 0, scale: 0.5 }}
                animate={{ 
                  left: "50%", 
                  top: "50%",
                  opacity: 1,
                  scale: 1.2
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center z-30"
              >
                <TokenIcon 
                  symbol={swapDirection === 'AtoB' ? tokenA.symbol : tokenB.symbol} 
                  className="shadow-xl w-10 h-10 ring-4 ring-white" 
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {animationState === 'receiving' && (
              <motion.div
                key="swap-receiving"
                initial={{ left: "50%", top: "50%", opacity: 0, scale: 1.2 }}
                animate={{ 
                  left: "20%", 
                  top: "50%",
                  opacity: 1,
                  scale: 1
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center z-30"
              >
                <TokenIcon 
                  symbol={swapDirection === 'AtoB' ? tokenB.symbol : tokenA.symbol} 
                  className="shadow-xl w-10 h-10 ring-4 ring-white" 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visual Flow Lines */}
          <div className="absolute top-1/2 left-[35%] -translate-y-1/2 text-slate-200">
            <ArrowRight size={40} strokeWidth={1} className={cn(animationState === 'sending' && "text-indigo-300 animate-pulse")} />
          </div>
          <div className="absolute top-1/2 left-[65%] -translate-y-1/2 text-slate-200">
            <ArrowRight size={40} strokeWidth={1} className={cn("rotate-180", animationState === 'receiving' && "text-indigo-300 animate-pulse")} />
          </div>
        </div>

        {/* Pool Side */}
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <motion.div 
              animate={animationState === 'balancing' ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              className="w-full h-full bg-slate-200 rounded-full shadow-inner flex items-center justify-center relative overflow-hidden border-4 border-white"
            >
              {/* Token A Reserve (Blue if more, Cyan if less) */}
              <motion.div 
                animate={{ 
                  height: `${(pool.x / (pool.x + pool.y)) * 100}%`,
                  backgroundColor: pool.x >= pool.y ? "#3b82f6" : "#06b6d4" 
                }}
                className="absolute bottom-0 left-0 w-1/2 transition-all duration-1000 ease-in-out opacity-80"
              />
              {/* Token B Reserve (Blue if more, Cyan if less) */}
              <motion.div 
                animate={{ 
                  height: `${(pool.y / (pool.x + pool.y)) * 100}%`,
                  backgroundColor: pool.y > pool.x ? "#3b82f6" : "#06b6d4" 
                }}
                className="absolute bottom-0 right-0 w-1/2 transition-all duration-1000 ease-in-out opacity-80"
              />
              
              <div className="z-20 flex flex-col items-center text-white drop-shadow-md">
                <Coins size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-1">Pool</span>
              </div>
            </motion.div>
            
            {/* K Constant Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="80" cy="80" r="76"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2"
                strokeDasharray="10 5"
                className={cn("opacity-20", animationState === 'balancing' && "animate-spin-slow opacity-100")}
              />
            </svg>
          </div>
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Liquidity Pool</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn("p-4 rounded-xl transition-all", animationState === 'sending' ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50")}>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", animationState === 'sending' ? "bg-indigo-500 animate-ping" : "bg-slate-300")} />
            1. Input
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            User sends {swapAmount} {swapDirection === 'AtoB' ? tokenA.symbol : tokenB.symbol} to the pool.
          </p>
        </div>
        <div className={cn("p-4 rounded-xl transition-all", animationState === 'receiving' ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50")}>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", animationState === 'receiving' ? "bg-indigo-500 animate-ping" : "bg-slate-300")} />
            2. Output
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Pool calculates and returns {lastSwapResult?.out.toFixed(4) || "—"} {swapDirection === 'AtoB' ? tokenB.symbol : tokenA.symbol}.
          </p>
        </div>
        <div className={cn("p-4 rounded-xl transition-all", animationState === 'balancing' ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50")}>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", animationState === 'balancing' ? "bg-indigo-500 animate-ping" : "bg-slate-300")} />
            3. Rebalance
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Reserves adjust to maintain the {ammType} invariant.
          </p>
        </div>
      </div>
    </div>
  );
};
