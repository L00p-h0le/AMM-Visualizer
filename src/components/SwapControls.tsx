import { useState, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RefreshCw, Zap, NotepadText, Info, X } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { Tilt } from './motion-primitives/tilt';
import { StarBorder } from './motion-primitives/star-border';
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

/* ================================================================== */
/*  Ripple Button (magicui style)                                     */
/* ================================================================== */

function RippleButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  return (
    <button
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRipples((prev) => [
          ...prev,
          { x: e.clientX - rect.left, y: e.clientY - rect.top, id },
        ]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
        onClick?.();
      }}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ width: 0, height: 0, opacity: 0.45 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute rounded-full bg-white/40 pointer-events-none"
            style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

/* ================================================================== */
/*  Animated Input (ozgeozkaraa01 style - NO bottom underline)        */
/* ================================================================== */

function AnimatedInput({
  label,
  value,
  onValueChange,
  readOnly = false,
  suffix,
}: {
  label: string;
  value: string | number;
  onValueChange?: (v: number) => void;
  readOnly?: boolean;
  suffix?: ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      <motion.label
        className="text-xs font-medium uppercase block"
        animate={{ color: focused ? '#6366f1' : '#94a3b8' }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>

      <div
        className={cn(
          'relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300',
          focused
            ? 'border-indigo-400 bg-white shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
            : 'border-slate-200 bg-slate-50',
          readOnly && 'opacity-75',
        )}
      >
        <input
          type="number"
          value={value}
          onChange={onValueChange ? (e) => onValueChange(Number(e.target.value)) : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          readOnly={readOnly}
          className={cn(
            'bg-transparent text-xl font-bold w-full outline-none transition-colors duration-200',
            readOnly
              ? 'text-slate-400 cursor-default'
              : focused
                ? 'text-indigo-700'
                : 'text-slate-800',
          )}
        />
        {suffix}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Custom Liquidity Popup (portal)                                   */
/* ================================================================== */

function CustomLiquidityPopup({
  open,
  onClose,
  tokenA,
  tokenB,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  tokenA: Token;
  tokenB: Token;
  onAdd: (a: number, b: number) => void;
}) {
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setValA('');
    setValB('');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSubmit = () => {
    const a = parseFloat(valA);
    const b = parseFloat(valB);
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return;
    onAdd(a, b);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-[9998]"
          />
          {/* Card */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Custom Liquidity</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-400 uppercase">
                  {tokenA.symbol}
                </label>
                <input
                  type="number"
                  value={valA}
                  onChange={(e) => setValA(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  autoFocus
                  className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-400 uppercase">
                  {tokenB.symbol}
                </label>
                <input
                  type="number"
                  value={valB}
                  onChange={(e) => setValB(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <RippleButton
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Add Liquidity
            </RippleButton>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ================================================================== */
/*  SwapControls                                                      */
/* ================================================================== */

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
  const [flipCount, setFlipCount] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Auto-show toast when a new swap result arrives, auto-dismiss after 4s
  useEffect(() => {
    if (lastSwapResult && !isSwapping) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSwapResult, isSwapping]);

  const handleSwapDirection = () => {
    setFlipCount((p) => p + 1);
    setSwapDirection((p) => (p === 'AtoB' ? 'BtoA' : 'AtoB'));
  };

  const fromToken = swapDirection === 'AtoB' ? tokenA : tokenB;
  const toToken = swapDirection === 'AtoB' ? tokenB : tokenA;

  return (
    <Tilt rotationFactor={4} isRevese className="h-full w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
        {/* Tabs - HeroUI secondary variant with sliding indicator */}
        <div className="flex relative border-b border-slate-100">
          {(['swap', 'liquidity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-1 py-4 text-sm font-bold z-[1] transition-colors"
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="swap-tab-indicator"
                  className="absolute inset-0 bg-indigo-50/60 border-b-2 border-indigo-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  'relative z-[1]',
                  activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                {tab === 'swap' ? 'Swap' : 'Liquidity'}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'swap' ? (
              <motion.div
                key="swap"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold">Swap Simulation</h2>

                <div className="space-y-4">
                  {/* You Pay */}
                  <div className="relative">
                    <AnimatedInput
                      label="You Pay"
                      value={swapAmount}
                      onValueChange={setSwapAmount}
                      suffix={
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm shrink-0">
                          <TokenIcon symbol={fromToken.symbol} className="w-5 h-5" />
                          <span className="font-bold text-sm">{fromToken.symbol}</span>
                        </div>
                      }
                    />

                    <button
                      onClick={handleSwapDirection}
                      className="absolute left-1/2 -bottom-5 -translate-x-1/2 z-10 bg-white p-2 rounded-full border border-slate-200 shadow-md hover:shadow-lg transition-shadow text-indigo-600"
                    >
                      <motion.div
                        animate={{ rotate: flipCount * 180 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      >
                        <RefreshCw size={16} />
                      </motion.div>
                    </button>
                  </div>

                  {/* You Receive */}
                  <div className="pt-3">
                    <AnimatedInput
                      label="You Receive (Est.)"
                      value={
                        swapAmount > 0
                          ? estimateOutput(pool, ammType, swapAmount, swapDirection).toFixed(4)
                          : '0.0000'
                      }
                      readOnly
                      suffix={
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm shrink-0">
                          <TokenIcon symbol={toToken.symbol} className="w-5 h-5" />
                          <span className="font-bold text-sm">{toToken.symbol}</span>
                        </div>
                      }
                    />
                  </div>

                  {/* Execute Swap - ReactBits StarBorder */}
                  <StarBorder
                    as="button"
                    color="#a5b4fc"
                    speed="4s"
                    onClick={handleSwap}
                    disabled={isSwapping || swapAmount <= 0}
                    className={cn(
                      isSwapping && 'cursor-not-allowed opacity-70',
                    )}
                  >
                    <div
                      className={cn(
                        'py-4 font-bold text-white text-center rounded-[10px] transition-colors',
                        isSwapping || swapAmount <= 0
                          ? 'bg-slate-400'
                          : 'bg-indigo-600 hover:bg-indigo-700',
                      )}
                    >
                      {isSwapping ? 'Simulating...' : 'Execute Swap'}
                    </div>
                  </StarBorder>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="liquidity"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Heading - Plus opens popup */}
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setShowCustom(true)}
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                    whileHover={{ rotate: 90, scale: 1.2 }}
                    className="text-indigo-500 hover:text-indigo-600 transition-colors"
                    title="Add custom liquidity"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                  Add Liquidity
                </h2>

                <p className="text-xs text-slate-500">
                  Adding liquidity increases the constant 'k', shifting the curve outward and
                  reducing slippage.
                </p>

                {/* Preset options with ripple buttons */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Add 10% Liquidity</span>
                    <RippleButton
                      onClick={() => handleAddLiquidity(pool.x * 0.1, pool.y * 0.1)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Add Now
                    </RippleButton>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Add 50% Liquidity</span>
                    <RippleButton
                      onClick={() => handleAddLiquidity(pool.x * 0.5, pool.y * 0.5)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Add Now
                    </RippleButton>
                  </div>
                </div>

                {/* Arbitrage note - NotepadText icon, Info as non-link tooltip */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 flex gap-3">
                  <NotepadText size={16} className="shrink-0 mt-0.5" />
                  <p>
                    When you add liquidity, you must provide both tokens in proportion to the
                    current price to avoid{' '}
                    <span className="inline-flex items-baseline gap-1">
                      <span className="font-semibold underline decoration-amber-300">
                        arbitrage
                      </span>
                      <motion.span
                        whileHover={{ rotate: [0, -12, 12, -8, 0], scale: 1.3 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex text-amber-600 cursor-help"
                        title="Arbitrage is the practice of profiting from price differences between markets. In AMMs, disproportional liquidity creates arbitrage opportunities."
                      >
                        <Info size={12} />
                      </motion.span>
                    </span>
                    .
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
      </div>


      {/* Swap success toast – portaled to top-right */}
      {createPortal(
        <AnimatePresence>
          {showToast && lastSwapResult && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              className="fixed top-6 right-6 z-[9999] bg-white border border-green-200 shadow-xl rounded-2xl p-4 pr-6 min-w-[260px] max-w-[340px]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                  <Zap size={16} className="text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-green-800 text-sm">Swap Successful</div>
                  <div className="text-xs text-green-600 mt-0.5">
                    Swapped {lastSwapResult.in.toFixed(2)} for {lastSwapResult.out.toFixed(4)}
                  </div>
                </div>
              </div>
              {/* Auto-dismiss progress bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-[3px] bg-green-400 rounded-b-2xl"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 2, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Custom liquidity popup */}
      <CustomLiquidityPopup
        open={showCustom}
        onClose={() => setShowCustom(false)}
        tokenA={tokenA}
        tokenB={tokenB}
        onAdd={handleAddLiquidity}
      />
    </Tilt>
  );
};
