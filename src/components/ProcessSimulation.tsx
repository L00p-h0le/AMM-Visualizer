import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowRight, Coins, Calculator, ChevronLeft, ChevronRight } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { cn } from '../lib/utils';
import { InView } from './motion-primitives/in-view';
import { TransitionPanel } from './motion-primitives/transition-panel';
import type { AMMType, PoolState, Token } from '../types/amm';

interface ProcessSimulationProps {
  pool: PoolState;
  isSimulating: boolean;
  animationState: 'idle' | 'sending' | 'calculating' | 'receiving' | 'balancing';
  swapDirection: 'AtoB' | 'BtoA';
  swapAmount: number;
  tokenA: Token;
  tokenB: Token;
  simulationResult: { in: number; out: number } | null;
  ammType: AMMType;
  pendingPool: PoolState | null;
  setAnimationState: (s: 'idle' | 'sending' | 'calculating' | 'receiving' | 'balancing') => void;
  setIsSimulating: (b: boolean) => void;
  handleSimulate: () => void;
}

/** Small token particles that trail behind the main token during sending */
const TrailingParticles = ({ symbol, direction }: { symbol: string; direction: 'toPool' | 'toWallet' }) => {
  const delays = [0.5, 1.0, 1.5];
  const fromLeft = direction === 'toPool' ? '18%' : '72%';
  const toLeft = direction === 'toPool' ? '68%' : '22%';

  return (
    <>
      {delays.map((delay, i) => (
        <motion.div
          key={`particle-${direction}-${i}`}
          initial={{ left: fromLeft, top: '50%', opacity: 0, scale: 0.3 }}
          animate={{ left: toLeft, top: '50%', opacity: [0, 0.6, 0], scale: [0.3, 0.5, 0.2] }}
          transition={{ duration: 2.5, delay, ease: 'easeInOut' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
        >
          <TokenIcon symbol={symbol} className="w-5 h-5 opacity-60" />
        </motion.div>
      ))}
    </>
  );
};

export const ProcessSimulation = ({
  pool,
  isSimulating,
  animationState,
  swapDirection,
  swapAmount,
  tokenA,
  tokenB,
  simulationResult,
  ammType,
  pendingPool,
  setAnimationState,
  setIsSimulating,
  handleSimulate,
}: ProcessSimulationProps) => {

  const inputToken = swapDirection === 'AtoB' ? tokenA : tokenB;
  const outputToken = swapDirection === 'AtoB' ? tokenB : tokenA;

  // Stepper logic
  const sequence = ['idle', 'sending', 'calculating', 'receiving', 'balancing'] as const;
  const currentIndex = sequence.indexOf(animationState);

  const prevStep = () => {
    if (currentIndex > 1) {
      setAnimationState(sequence[currentIndex - 1]);
    }
  };

  const nextStep = () => {
    if (currentIndex > 0 && currentIndex < sequence.length - 1) {
      setAnimationState(sequence[currentIndex + 1]);
    } else if (currentIndex === sequence.length - 1) {
      // Finish: reset simulation (visual only, pool unchanged)
      setIsSimulating(false);
      setAnimationState('idle');
    }
  };

  return (
    <InView
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-200 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className={cn('w-5 h-5', isSimulating ? 'text-indigo-500 animate-pulse' : 'text-slate-400')} />
            Real-time Process Simulation
          </h2>
          {animationState === 'idle' && (
            <button
              onClick={handleSimulate}
              className="px-6 py-2 bg-indigo-100/50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              Start
            </button>
          )}
        </div>

        {/* Split Layout: 70% Animation, 30% Explanation */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">

          {/* LEFT: 70% Animation Stage */}
          <div className="lg:w-[70%] relative h-72 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-between px-4 md:px-12 border border-slate-100">

            {/* User Wallet */}
            <motion.div
              className="flex flex-col items-center gap-3 z-10"
              animate={animationState === 'sending' ? { scale: [1, 0.95, 1] } : animationState === 'receiving' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1 }}
            >
              <div className={cn(
                'w-20 h-20 bg-white rounded-2xl shadow-sm border-2 flex items-center justify-center transition-all duration-500',
                animationState === 'sending' ? 'border-amber-300 shadow-amber-100' : animationState === 'receiving' ? 'border-green-300 shadow-green-100' : 'border-slate-200'
              )}>
                <div className="text-center">
                  <div className="text-slate-500 font-bold text-xs uppercase tracking-tighter">Wallet</div>
                  {animationState === 'sending' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-amber-500 font-bold mt-0.5">
                      −{swapAmount} {inputToken.symbol}
                    </motion.div>
                  )}
                  {animationState === 'receiving' && simulationResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-green-500 font-bold mt-0.5">
                      +{simulationResult.out.toFixed(2)} {outputToken.symbol}
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</div>
            </motion.div>

            {/* Token Flow Animations */}
            <div className="absolute inset-0 pointer-events-none">

              {/* STAGE 1: Tokens flowing Wallet → Pool */}
              <AnimatePresence>
                {animationState === 'sending' && (
                  <>
                    <motion.div
                      key="token-to-pool"
                      initial={{ left: '18%', top: '50%', opacity: 0, scale: 0.4 }}
                      animate={{
                        left: ['18%', '35%', '55%', '72%'],
                        top: ['50%', '42%', '56%', '50%'],
                        opacity: [0, 1, 1, 0.8],
                        scale: [0.4, 1, 1.1, 0.6],
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 4, ease: 'easeInOut' }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                      <TokenIcon symbol={inputToken.symbol} className="shadow-xl w-12 h-12 ring-4 ring-white" />
                    </motion.div>
                    <TrailingParticles symbol={inputToken.symbol} direction="toPool" />
                    <motion.div
                      className="absolute top-1/2 left-[45%] -translate-y-1/2 -translate-x-1/2 z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.5, 1, 0] }}
                      transition={{ duration: 4, ease: 'easeInOut' }}
                    >
                      <ArrowRight size={28} className="text-indigo-400" strokeWidth={2} />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* STAGE 2: Calculating badge */}
              <AnimatePresence>
                {animationState === 'calculating' && (
                  <motion.div
                    key="calc-badge"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30
                      bg-white px-5 py-3 rounded-xl shadow-lg border border-indigo-200 flex items-center gap-3"
                  >
                    <Calculator size={20} className="text-indigo-500 animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-slate-700">Computing output...</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {ammType === 'CPMM' ? 'Δy = y − k/(x+Δx)' : ammType === 'CSMM' ? 'Δy = min(y, Δx)' : 'StableSwap curve'}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* STAGE 3: Tokens flowing Pool → Wallet */}
              <AnimatePresence>
                {animationState === 'receiving' && (
                  <>
                    <motion.div
                      key="token-to-wallet"
                      initial={{ left: '72%', top: '50%', opacity: 0, scale: 0.4 }}
                      animate={{
                        left: ['72%', '55%', '35%', '22%'],
                        top: ['50%', '58%', '44%', '50%'],
                        opacity: [0, 1, 1, 0.8],
                        scale: [0.4, 1, 1.1, 0.6],
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 4, ease: 'easeInOut' }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                      <TokenIcon symbol={outputToken.symbol} className="shadow-xl w-12 h-12 ring-4 ring-white" />
                    </motion.div>
                    <TrailingParticles symbol={outputToken.symbol} direction="toWallet" />
                    <motion.div
                      className="absolute top-1/2 left-[45%] -translate-y-1/2 -translate-x-1/2 z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.5, 1, 0] }}
                      transition={{ duration: 4, ease: 'easeInOut' }}
                    >
                      <ArrowRight size={28} className="text-green-400 rotate-180" strokeWidth={2} />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Liquidity Pool */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <motion.div
                  animate={
                    animationState === 'sending'
                      ? { scale: [1, 1.06, 1], boxShadow: ['0 0 0 rgba(99,102,241,0)', '0 0 30px rgba(99,102,241,0.3)', '0 0 0 rgba(99,102,241,0)'] }
                      : animationState === 'balancing'
                        ? { scale: [1, 1.08, 0.96, 1], rotate: [0, 8, -8, 0] }
                        : {}
                  }
                  transition={{ duration: animationState === 'sending' ? 4 : 3, ease: 'easeInOut' }}
                  className={cn(
                    'w-full h-full rounded-full shadow-inner flex items-center justify-center relative overflow-hidden border-4 transition-colors duration-500 border-slate-200 bg-slate-200',
                    animationState === 'sending' ? 'shadow-indigo-200' : ''
                  )}
                >
                  {/* Token A Reserve Bar */}
                  <motion.div
                    animate={{ height: `${(pool.x / (pool.x + pool.y)) * 100}%` }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    className={cn("absolute top-0 left-0 right-0 w-full opacity-90", tokenA.color)}
                  />
                  {/* Token B Reserve Bar */}
                  <motion.div
                    animate={{ height: `${(pool.y / (pool.x + pool.y)) * 100}%` }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    className={cn("absolute bottom-0 left-0 right-0 w-full opacity-90", tokenB.color)}
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
                    className={cn('opacity-20 transition-opacity duration-500', animationState === 'balancing' && 'animate-spin-slow opacity-100')}
                  />
                </svg>
              </div>
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Liquidity Pool</div>
            </div>
          </div>

          {/* RIGHT: 30% Dynamic Explanation */}
          <div className="lg:w-[30%] bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Current Process</div>
            <div className="relative min-h-[140px] overflow-hidden">
              <TransitionPanel
                activeIndex={currentIndex}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                variants={{
                  enter: { opacity: 0, y: 15 },
                  center: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -15 }
                }}
              >
                {[
                  <div key="idle" className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Ready</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Enter a swap amount and click Start to simulate the AMM execution path step-by-step.</p>
                  </div>,
                  <div key="sending" className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-indigo-600 mb-2">1. Input</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">User overrides wallet and sends <strong className="text-slate-800">{swapAmount} {inputToken.symbol}</strong> to the liquidity pool smart contract.</p>
                  </div>,
                  <div key="calculating" className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-indigo-600 mb-2">2. Calculate</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Pool computes the exact output required. The <strong className="text-slate-800">{ammType}</strong> invariant dictates the price curve shift.</p>
                  </div>,
                  <div key="receiving" className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-green-600 mb-2">3. Output</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Pool returns <strong className="text-slate-800">{(simulationResult?.out || 0).toFixed(4)} {outputToken.symbol}</strong> back to the user's wallet address.</p>
                  </div>,
                  <div key="balancing" className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-amber-600 mb-2">4. Rebalance</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Reserves are permanently updated. The new invariant is stabilized at <strong className="text-slate-800 font-mono">k = {(pendingPool?.k || pool.k).toLocaleString()}</strong>.</p>
                  </div>
                ]}
              </TransitionPanel>
            </div>

            {/* Stepper Controls */}
            {animationState !== 'idle' && (
              <div className="mt-8 flex items-center justify-between border-t border-indigo-200/50 pt-4 z-20">
                <button
                  onClick={prevStep}
                  disabled={currentIndex <= 1}
                  className="p-2 hover:bg-slate-200/50 rounded-lg text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs font-bold shrink-0"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="flex gap-1.5 flex-1 justify-center px-4">
                  {sequence.slice(1).map((s, i) => (
                    <div key={s} className={cn(
                      "flex-1 h-1.5 rounded-full transition-colors",
                      s === animationState ? "bg-indigo-500" : i < currentIndex ? "bg-indigo-300" : "bg-indigo-100"
                    )} />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-indigo-200 shrink-0"
                >
                  {currentIndex === sequence.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </InView>
  );
};
