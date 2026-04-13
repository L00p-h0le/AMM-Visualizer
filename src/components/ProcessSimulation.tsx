import { User, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useRef, useMemo } from 'react';
import { AnimatedBeam } from './Animation/AnimatedBeam';
import type { PoolState, Token, AMMType } from '../types/amm';

interface ProcessSimulationProps {
  pool: PoolState;
  animationState: 'idle' | 'sending' | 'calculating' | 'receiving' | 'balancing';
  swapDirection: 'AtoB' | 'BtoA';
  swapAmount: number;
  tokenA: Token;
  tokenB: Token;
  simulationResult: { in: number; out: number } | null;
  pendingPool: PoolState | null;
  ammType: AMMType;
  setAnimationState: (s: 'idle' | 'sending' | 'calculating' | 'receiving' | 'balancing') => void;
}

export const ProcessSimulation = ({
  pool,
  animationState,
  swapDirection,
  swapAmount,
  tokenA,
  tokenB,
  simulationResult,
  ammType,
  pendingPool,
  setAnimationState,
}: ProcessSimulationProps) => {
  const inputToken = swapDirection === 'AtoB' ? tokenA : tokenB;
  const outputToken = swapDirection === 'AtoB' ? tokenB : tokenA;

  const sequence = ['idle', 'sending', 'calculating', 'receiving', 'balancing'] as const;
  const currentIndex = sequence.indexOf(animationState);

  // Manual reset logic: clicking forward on the final step returns to idle
  const nextStep = () => {
    if (currentIndex < sequence.length - 1) {
      setAnimationState(sequence[currentIndex + 1]);
    } else {
      setAnimationState('idle');
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) setAnimationState(sequence[currentIndex - 1]);
  };

  // Beam Visibility Logic
  const sendingActive = animationState === 'sending';
  const receivingActive = animationState === 'receiving';

  const stepLabels: Record<string, string> = {
    idle: 'READY',
    sending: 'STEP 1',
    calculating: 'STEP 2',
    receiving: 'STEP 3',
    balancing: 'FINAL STEP',
  };

  const explanations = useMemo<Record<string, { tooltip: string; math: string | React.ReactNode }>>(() => ({
    idle: {
      tooltip: `Wallet is ready to send ${swapAmount} ${inputToken.symbol}.`,
      math:
        ammType === 'CPMM'
          ? 'x * y = k'
          : ammType === 'CSMM'
            ? 'x + y = k'
            : 'f(x,y) = D',
    },
    sending: {
      tooltip: `Transferring ${swapAmount} ${inputToken.symbol} from the user wallet.`,
      math: (
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">Receiving Input</span>
          <span className="font-mono text-indigo-600">+{swapAmount} {inputToken.symbol}</span>
        </div>
      ),
    },
    calculating: {
      tooltip: `Wallet has already submitted ${inputToken.symbol}. The contract is now computing the quote.`,
      math: (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-slate-400 font-mono">
            {ammType === 'CPMM'
              ? '(x + \u0394x)(y - \u0394y) = k'
              : ammType === 'CSMM'
                ? '(x + \u0394x) + (y - \u0394y) = k'
                : 'f(x+\u0394x, y-\u0394y) = D'}
          </span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: currentIndex >= 2 ? 1 : 0 }}
            className="font-mono text-indigo-600 text-[11px] text-center"
          >
            {ammType === 'CPMM' ? (
              '\u0394y = y - k/(x+\u0394x)'
            ) : ammType === 'CSMM' ? (
              '\u0394y = \u0394x'
            ) : (
              <span className="text-[9px]">Iterative Solv: \u0394y = y - y_new</span>
            )}
          </motion.span>
        </div>
      ),
    },
    receiving: {
      tooltip: `Wallet is about to receive ${(simulationResult?.out || 0).toFixed(4)} ${outputToken.symbol}.`,
      math: (
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">Releasing Output</span>
          <span className="font-mono text-green-600">{(simulationResult?.out || 0).toFixed(4)} {outputToken.symbol}</span>
        </div>
      ),
    },
    balancing: {
      tooltip: `Wallet has completed the route and holds the received output asset.`,
      math: (
        <div className="flex flex-col items-center gap-1 px-2 text-center">
          <span className="text-[10px] text-slate-400">Updated reserves:</span>
          <span className="text-[10px] font-mono text-indigo-600">
            {(pendingPool?.x || pool.x).toFixed(2)} {tokenA.symbol} & {(pendingPool?.y || pool.y).toFixed(2)} {tokenB.symbol}
          </span>
        </div>
      ),
    },
  }), [swapAmount, inputToken.symbol, outputToken.symbol, currentIndex, simulationResult, pendingPool, pool.x, pool.y, tokenA.symbol, tokenB.symbol, ammType]);

  const poolTooltips = useMemo<Record<string, string>>(() => ({
    sending: `Receiving ${swapAmount} ${inputToken.symbol} from the User`,
    receiving: `Transferring ${(simulationResult?.out || 0).toFixed(4)} ${outputToken.symbol} back to the User`,
    balancing: `Updated reserves`,
  }), [swapAmount, inputToken.symbol, outputToken.symbol, simulationResult]);

  const current = explanations[animationState];

  // Logic: Update balance only after specific steps
  const displayWalletBalance = currentIndex >= 1 ? 0 : swapAmount; // Simplified demonstration of "after send done"
  const displayReceiveValue = currentIndex >= 3 ? (simulationResult?.out || 0) : 0;

  // Pool balance logic
  const displayPoolX = currentIndex >= 2 ? (pendingPool?.x || pool.x) : pool.x;
  const displayPoolY = currentIndex >= 4 ? (pendingPool?.y || pool.y) : pool.y;

  // Animation Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-[#13111C] p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 min-h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="mb-10 px-2 text-left">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-white/90 tracking-tight">Real-time Process Simulation</h2>
        </div>
        <p className="text-sm text-white/50 font-medium ml-2">
          Current Price · 1 {tokenA.symbol} = {(pool.y / pool.x).toFixed(4)} {tokenB.symbol}
        </p>
      </div>

      {/* Main Stage */}
      <div
        ref={stageRef}
        className="flex-1 relative bg-black/20 rounded-[2.5rem] border border-white/10 shadow-[inner_0_2px_10px_rgba(255,255,255,0.02)] flex flex-col items-center justify-center p-8 min-h-[500px]"
      >
        {/* Animated Beams */}
        <AnimatedBeam
          containerRef={stageRef}
          fromRef={walletRef}
          toRef={poolRef}
          isTransferring={sendingActive}
          symbol={inputToken.symbol}
          curvature={-360}
        />
        <AnimatedBeam
          containerRef={stageRef}
          fromRef={poolRef}
          toRef={walletRef}
          isTransferring={receivingActive}
          symbol={outputToken.symbol}
          curvature={250}
        />

        {/* Step Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="px-3 py-0.5 bg-[#1a1a1a] border border-white/10 rounded-full shadow-sm flex items-center justify-center">
            <span className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase leading-none">{stepLabels[animationState]}</span>
          </div>
        </div>

        {/* Content Row: Parallel alignment */}
        <div className="w-full max-w-5xl flex items-center justify-between gap-4">

          {/* USER WALLET */}
          <div className="flex flex-col items-center group">
            {/* Tooltip bubble - Wallet Context (Steps 1, 3, 4) */}
            <div className="h-20 mb-4 flex items-end">
              <AnimatePresence mode="wait">
                {['idle', 'sending', 'receiving', 'balancing'].includes(animationState) && (
                  <motion.div
                    key={animationState}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="bg-[#1a1a1a]/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/10 relative text-[11px] text-white/70 leading-relaxed font-medium max-w-[150px]"
                  >
                    {explanations[animationState].tooltip}
                    {/* Bubble Tail */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45 -mt-1.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wallet Card */}
            <div
              ref={walletRef}
              className={cn(
                "w-40 h-52 bg-white/[0.04] backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] p-5 flex flex-col items-center gap-4 transition-all duration-500 z-10",
                currentIndex === 1 ? "ring-2 ring-purple-400 scale-[1.02]" : ""
              )}
            >
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-white/90 tracking-tight mt-2">
                  {animationState === 'idle' ? swapAmount : displayWalletBalance} {inputToken.symbol}
                </span>
              </div>
              <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/50">Send</span>
                  <span className="font-bold text-white/90">{swapAmount} {inputToken.symbol}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/50">Receive</span>
                  <span className="font-bold text-white/90">{displayReceiveValue.toFixed(4)} {outputToken.symbol}</span>
                </div>
              </div>
            </div>
            <span className="mt-4 text-[11px] font-bold text-white/30 uppercase tracking-[0.15em]">USER WALLET</span>
          </div>

          {/* AMM MODEL */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative">
              {/* Tooltip bubble - AMM Context (Diagonally Left) - Positioned relative to the Card */}
              <AnimatePresence mode="wait">
                {animationState === 'calculating' && (
                  <motion.div
                    key={animationState}
                    initial={{ opacity: 0, scale: 0.9, x: 20, y: 10 }}
                    animate={{ opacity: 1, scale: 1, x: -25, y: -10 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20, y: 10 }}
                    className="absolute bottom-full left-0 -translate-x-[60%] bg-[#1a1a1a]/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/10 text-[11px] text-white/70 leading-relaxed font-medium w-[170px] z-20 mb-1"
                  >
                    {current.tooltip}
                    {/* Bubble Tail */}
                    <div className="absolute top-full right-6 w-3 h-3 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45 -mt-1.5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div
                className={cn(
                  "w-44 h-56 bg-white/[0.04] backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] flex flex-col p-6 items-center gap-4 transition-all duration-500 z-10",
                  currentIndex === 2 ? "ring-2 ring-purple-400 scale-[1.02]" : ""
                )}
              >
                <span className="text-2xl font-black text-white/90 tracking-tighter mt-4">{ammType}</span>

                {/* Math Display Area */}
                <div className="flex-1 w-full bg-black/40 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={animationState}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full flex justify-center"
                    >
                      {current.math}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* LIQUIDITY POOL */}
          <div className="flex flex-col items-center">
            {/* Tooltip bubble - Pool Context (Steps 1, 3, 4) */}
            <div className="h-20 mb-4 flex items-end">
              <AnimatePresence mode="wait">
                {['sending', 'receiving', 'balancing'].includes(animationState) && (
                  <motion.div
                    key={animationState}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="bg-[#1a1a1a]/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/10 relative text-[11px] text-white/70 leading-relaxed font-medium max-w-[150px] text-center"
                  >
                    {poolTooltips[animationState]}
                    {/* Bubble Tail */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45 -mt-1.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div
              ref={poolRef}
              className={cn(
                "w-44 h-44 relative flex items-center justify-center z-10 transition-all duration-500 rounded-full",
                currentIndex === 3 ? "ring-2 ring-purple-400 scale-[1.02]" : "ring-transparent"
              )}
            >
              {/* Large Circular Chart */}
              <div className="w-44 h-44 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-[#1a1a1a] flex flex-col bg-[#0a0a0a]">
                {/* Upper: Token A */}
                <div className="h-1/2 w-full flex items-center justify-center relative bg-purple-500/80">
                  <div className="flex flex-col items-center text-white">
                    <span className="text-[10px] font-bold text-white/70 uppercase">{tokenA.symbol}</span>
                    <span className="text-xs font-bold">{displayPoolX.toFixed(2)}</span>
                  </div>
                </div>
                {/* Lower: Token B */}
                <div className="h-1/2 w-full flex items-center justify-center bg-fuchsia-400/80">
                  <div className="flex flex-col items-center text-white">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{tokenB.symbol}</span>
                    <span className="text-xs font-bold">{displayPoolY.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="mt-4 text-[11px] font-bold text-white/30 uppercase tracking-[0.15em]">LIQUIDITY POOL</span>
          </div>

        </div>

        {/* Global Controls - Manual Navigation */}
        <div className="absolute bottom-8 flex items-center gap-6">
          <button
            onClick={prevStep}
            disabled={currentIndex === 0}
            className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-sm flex items-center justify-center text-white/50 hover:text-purple-400 hover:border-purple-400/50 hover:bg-white/10 transition-all disabled:opacity-30 group"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <button
            onClick={nextStep}
            className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-sm flex items-center justify-center text-white/50 hover:text-purple-400 hover:border-purple-400/50 hover:bg-white/10 transition-all group"
          >
            {currentIndex === sequence.length - 1 ? (
              <RotateCcw className="w-5 h-5 transition-transform group-hover:rotate-[-45deg]" />
            ) : (
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
