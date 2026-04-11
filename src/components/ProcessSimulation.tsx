import { Zap, User, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
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
      math: `x * y = k`,
    },
    sending: {
      tooltip: `Preparing to transfer ${swapAmount} ${inputToken.symbol} from the user wallet.`,
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
          <span className="text-[10px] text-slate-400 font-mono">(x + Δx)(y - Δy) = k</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: currentIndex >= 2 ? 1 : 0 }}
            className="font-mono text-indigo-600 text-sm"
          >
            Δy = y - k/(x+Δx)
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
  }), [swapAmount, inputToken.symbol, outputToken.symbol, currentIndex, simulationResult, pendingPool, pool.x, pool.y, tokenA.symbol, tokenB.symbol]);

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
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="mb-10 px-2 text-left">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
            <Zap className="w-4 h-4 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Real-time Process Simulation</h2>
        </div>
        <p className="text-sm text-slate-400 font-medium ml-10">
          Current Price · 1 {tokenA.symbol} = {(pool.y / pool.x).toFixed(4)} {tokenB.symbol}
        </p>
      </div>

      {/* Main Stage */}
      <div
        ref={stageRef}
        className="flex-1 relative bg-slate-50/50 rounded-[2.5rem] border border-slate-100/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center p-8 min-h-[500px]"
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 -ml-[19px]">
          <div className="px-3 py-0.5 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase leading-none">{stepLabels[animationState]}</span>
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
                    className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 relative text-[11px] text-slate-500 leading-relaxed font-medium max-w-[150px]"
                  >
                    {explanations[animationState].tooltip}
                    {/* Bubble Tail */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45 -mt-1.5 shadow-[2px_2px_2px_rgba(0,0,0,0.02)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wallet Card */}
            <div
              ref={walletRef}
              className={cn(
                "w-40 h-52 bg-white rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] p-5 flex flex-col items-center gap-4 transition-all duration-500 border-2 z-10",
                currentIndex === 1 ? "border-indigo-400 scale-[1.02]" : "border-transparent"
              )}
            >
              <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-slate-900 tracking-tight mt-2">
                  {animationState === 'idle' ? swapAmount : displayWalletBalance} {inputToken.symbol}
                </span>
              </div>
              <div className="w-full pt-4 border-t border-slate-50 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Send</span>
                  <span className="font-bold text-slate-900">{swapAmount} {inputToken.symbol}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Receive</span>
                  <span className="font-bold text-slate-900">{displayReceiveValue.toFixed(4)} {outputToken.symbol}</span>
                </div>
              </div>
            </div>
            <span className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">USER WALLET</span>
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
                    className="absolute bottom-full left-0 -translate-x-[60%] bg-white p-4 rounded-xl shadow-lg border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium w-[170px] z-20 mb-1"
                  >
                    {current.tooltip}
                    {/* Bubble Tail */}
                    <div className="absolute top-full right-6 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45 -mt-1.5 shadow-[2px_2px_2px_rgba(0,0,0,0.02)]" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div
                className={cn(
                  "w-44 h-56 bg-white rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] flex flex-col p-6 items-center gap-4 transition-all duration-500 border-2 z-10",
                  currentIndex === 2 ? "border-indigo-400 scale-[1.02]" : "border-transparent"
                )}
              >
                <span className="text-2xl font-black text-slate-800 tracking-tighter mt-4">{ammType}</span>

                {/* Math Display Area */}
                <div className="flex-1 w-full bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100/50 overflow-hidden">
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
            <div className="h-20 mb-4" /> {/* Empty spacer to maintain row alignment */}
            <div
              ref={poolRef}
              className="w-48 h-48 relative flex items-center justify-center z-10"
            >
              {/* Large Circular Chart */}
              <div className="w-40 h-40 rounded-full shadow-2xl overflow-hidden border-8 border-white flex flex-col bg-slate-100">
                {/* Upper: Token A */}
                <div className="h-1/2 w-full flex items-center justify-center relative bg-indigo-500/80">
                  <div className="flex flex-col items-center text-white">
                    <span className="text-[10px] font-bold text-white/70 uppercase">{tokenA.symbol}</span>
                    <span className="text-xs font-bold">{displayPoolX.toFixed(2)}</span>
                  </div>
                </div>
                {/* Lower: Token B */}
                <div className="h-1/2 w-full flex items-center justify-center bg-blue-400/80">
                  <div className="flex flex-col items-center text-white">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{tokenB.symbol}</span>
                    <span className="text-xs font-bold">{displayPoolY.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">LIQUIDITY POOL</span>
          </div>

        </div>

        {/* Global Controls - Manual Navigation */}
        <div className="absolute bottom-8 flex items-center gap-6">
          <button
            onClick={prevStep}
            disabled={currentIndex === 0}
            className="w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all disabled:opacity-30 group"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <button
            onClick={nextStep}
            className="w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
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
