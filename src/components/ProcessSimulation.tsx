import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Zap, ArrowRight, Coins, Calculator } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { cn } from '../lib/utils';
import type { AMMType, PoolState, Token } from '../types/amm';

interface ProcessSimulationProps {
  pool: PoolState;
  isSwapping: boolean;
  animationState: 'idle' | 'sending' | 'calculating' | 'receiving' | 'balancing';
  swapDirection: 'AtoB' | 'BtoA';
  swapAmount: number;
  tokenA: Token;
  tokenB: Token;
  lastSwapResult: { in: number; out: number; priceImpact: number; fee: number } | null;
  ammType: AMMType;
}

/** Small token particles that trail behind the main token during sending */
const TrailingParticles = ({ symbol, direction }: { symbol: string; direction: 'toPool' | 'toWallet' }) => {
  const delays = [0.3, 0.6, 0.9];
  const fromLeft = direction === 'toPool' ? '18%' : '72%';
  const toLeft = direction === 'toPool' ? '68%' : '22%';

  return (
    <>
      {delays.map((delay, i) => (
        <motion.div
          key={`particle-${direction}-${i}`}
          initial={{ left: fromLeft, top: '50%', opacity: 0, scale: 0.3 }}
          animate={{ left: toLeft, top: '50%', opacity: [0, 0.6, 0], scale: [0.3, 0.5, 0.2] }}
          transition={{ duration: 1.4, delay, ease: 'easeInOut' }}
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
  isSwapping,
  animationState,
  swapDirection,
  swapAmount,
  tokenA,
  tokenB,
  lastSwapResult,
  ammType
}: ProcessSimulationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.4 });
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  // Track first visibility for entrance animation
  useEffect(() => {
    if (isInView && !hasBeenVisible) setHasBeenVisible(true);
  }, [isInView, hasBeenVisible]);

  const inputToken = swapDirection === 'AtoB' ? tokenA : tokenB;
  const outputToken = swapDirection === 'AtoB' ? tokenB : tokenA;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 40 }}
      animate={hasBeenVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'bg-white p-6 rounded-2xl shadow-sm border-2 transition-all duration-500',
        isSwapping ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-2xl scale-[1.01]' : 'border-slate-200'
      )}
    >
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Zap className={cn('w-5 h-5', isSwapping ? 'text-indigo-500 animate-pulse' : 'text-slate-400')} />
        Real-time Process Simulation
      </h2>

      {/* Main Animation Stage */}
      <div className="relative h-72 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-between px-12 border border-slate-100">
        
        {/* ── User Wallet ── */}
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
              {animationState === 'receiving' && lastSwapResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-green-500 font-bold mt-0.5">
                  +{lastSwapResult.out.toFixed(2)} {outputToken.symbol}
                </motion.div>
              )}
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</div>
        </motion.div>

        {/* ── Token Flow Animations ── */}
        <div className="absolute inset-0 pointer-events-none">

          {/* STAGE 1: Tokens flowing Wallet → Pool */}
          <AnimatePresence>
            {animationState === 'sending' && (
              <>
                {/* Main token */}
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
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <TokenIcon symbol={inputToken.symbol} className="shadow-xl w-12 h-12 ring-4 ring-white" />
                </motion.div>

                {/* Trailing particles */}
                <TrailingParticles symbol={inputToken.symbol} direction="toPool" />

                {/* Arrow pulse */}
                <motion.div
                  className="absolute top-1/2 left-[45%] -translate-y-1/2 -translate-x-1/2 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1, 0] }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
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
                animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, repeat: 1, repeatType: 'reverse' }}
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
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <TokenIcon symbol={outputToken.symbol} className="shadow-xl w-12 h-12 ring-4 ring-white" />
                </motion.div>

                <TrailingParticles symbol={outputToken.symbol} direction="toWallet" />

                <motion.div
                  className="absolute top-1/2 left-[45%] -translate-y-1/2 -translate-x-1/2 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1, 0] }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                >
                  <ArrowRight size={28} className="text-green-400 rotate-180" strokeWidth={2} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* ── Liquidity Pool ── */}
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
              transition={{ duration: animationState === 'sending' ? 2 : 1.5, ease: 'easeInOut' }}
              className={cn(
                'w-full h-full rounded-full shadow-inner flex items-center justify-center relative overflow-hidden border-4 transition-colors duration-500',
                animationState === 'sending' ? 'border-indigo-200 bg-indigo-100' : animationState === 'balancing' ? 'border-amber-200 bg-amber-50' : 'border-white bg-slate-200'
              )}
            >
              {/* Token A Reserve Bar */}
              <motion.div
                animate={{
                  height: `${(pool.x / (pool.x + pool.y)) * 100}%`,
                  backgroundColor: pool.x >= pool.y ? '#6366f1' : '#06b6d4',
                }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="absolute bottom-0 left-0 w-1/2 opacity-80"
              />
              {/* Token B Reserve Bar */}
              <motion.div
                animate={{
                  height: `${(pool.y / (pool.x + pool.y)) * 100}%`,
                  backgroundColor: pool.y > pool.x ? '#6366f1' : '#06b6d4',
                }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="absolute bottom-0 right-0 w-1/2 opacity-80"
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

      {/* Step Indicator Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {([
          { key: 'sending', step: 1, label: 'Input', desc: `User sends ${swapAmount} ${inputToken.symbol} to the pool.` },
          { key: 'calculating', step: 2, label: 'Calculate', desc: `Pool computes output using ${ammType} formula.` },
          { key: 'receiving', step: 3, label: 'Output', desc: `Pool returns ${lastSwapResult?.out.toFixed(4) || '—'} ${outputToken.symbol} to user.` },
          { key: 'balancing', step: 4, label: 'Rebalance', desc: `Reserves adjust to maintain the ${ammType} invariant.` },
        ] as const).map(({ key, step, label, desc }) => {
          const isActive = animationState === key;
          const isPast = animationState !== 'idle' &&
            ['sending', 'calculating', 'receiving', 'balancing'].indexOf(animationState) >
            ['sending', 'calculating', 'receiving', 'balancing'].indexOf(key);

          return (
            <div
              key={key}
              className={cn(
                'p-4 rounded-xl transition-all duration-300',
                isActive ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : isPast ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-transparent'
              )}
            >
              <h3 className="text-sm font-bold flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  isActive ? 'bg-indigo-500 animate-ping' : isPast ? 'bg-green-500' : 'bg-slate-300'
                )} />
                {step}. {label}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">{desc}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
