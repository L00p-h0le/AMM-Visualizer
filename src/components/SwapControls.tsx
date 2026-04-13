import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RefreshCw, NotepadText, Info } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { Tilt } from './Animation/Tilt';
import { StarBorder } from './Animation/StarBorder';
import { cn } from '../lib/utils';
import type { AMMType, PoolState, Token, SwapResult } from '../types/amm';
import { calculateSwap } from '../lib/amm';
import { RippleButton } from './Animation/RippleButton';
import { AnimatedInput } from './AnimatedInput';
import { CustomLiquidityPopup } from './CustomLiquidityPopup';
import { SwapToast } from './SwapToast';

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

  const handleSwapDirection = () => {
    setFlipCount((p) => p + 1);
    setSwapDirection((p) => (p === 'AtoB' ? 'BtoA' : 'AtoB'));
  };

  const fromToken = swapDirection === 'AtoB' ? tokenA : tokenB;
  const toToken = swapDirection === 'AtoB' ? tokenB : tokenA;

  const estimatedOutput = useMemo(
    () => swapAmount > 0 ? calculateSwap(pool, ammType, swapAmount, swapDirection).out.toFixed(4) : '0.0000',
    [pool, ammType, swapAmount, swapDirection],
  );

  return (
    <Tilt rotationFactor={4} isRevese className="w-full">
      <div className="bg-[#13111C] rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
        {/* Tabs */}
        <div className="flex relative border-b border-white/10">
          {(['swap', 'liquidity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-1 py-4 text-sm font-bold z-[1] transition-colors"
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="swap-tab-indicator"
                  className="absolute inset-0 bg-purple-500/10 border-b-2 border-purple-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  'relative z-[1]',
                  activeTab === tab ? 'text-purple-400' : 'text-white/50 hover:text-white/90',
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
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/10 shadow-sm shrink-0">
                          <TokenIcon symbol={fromToken.symbol} className="w-5 h-5" />
                          <span className="font-bold text-sm">{fromToken.symbol}</span>
                        </div>
                      }
                    />

                    <button
                      onClick={handleSwapDirection}
                      className="absolute left-1/2 -bottom-5 -translate-x-1/2 z-10 bg-[#1a1a1a] p-2 rounded-full border border-white/10 shadow-md hover:shadow-purple-500/20 transition-all text-purple-400"
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
                      value={estimatedOutput}
                      readOnly
                      suffix={
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/10 shadow-sm shrink-0">
                          <TokenIcon symbol={toToken.symbol} className="w-5 h-5" />
                          <span className="font-bold text-sm">{toToken.symbol}</span>
                        </div>
                      }
                    />
                  </div>

                  {/* Execute Swap */}
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
                        'py-4 font-bold text-white text-center rounded-[10px] transition-all',
                        isSwapping || swapAmount <= 0
                          ? 'bg-white/10 text-white/50'
                          : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_28px_rgba(168,85,247,0.6)]',
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
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Add custom liquidity"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                  Add Liquidity
                </h2>

                <p className="text-xs text-white/50">
                  Adding liquidity increases the constant 'k', shifting the curve outward and
                  reducing slippage.
                </p>

                {/* Preset options with ripple buttons */}
                <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Add 10% Liquidity</span>
                    <RippleButton
                      onClick={() => handleAddLiquidity(pool.x * 0.1, pool.y * 0.1)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-500 shadow-purple-500/40 shadow-lg transition-all"
                    >
                      Add Now
                    </RippleButton>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Add 50% Liquidity</span>
                    <RippleButton
                      onClick={() => handleAddLiquidity(pool.x * 0.5, pool.y * 0.5)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-500 shadow-purple-500/40 shadow-lg transition-all"
                    >
                      Add Now
                    </RippleButton>
                  </div>
                </div>

                {/* Arbitrage note */}
                <div className="bg-transparent border border-white/10 p-4 rounded-xl text-xs text-white/50 flex gap-3">
                  <NotepadText size={16} className="shrink-0 mt-0.5 text-purple-400" />
                  <p>
                    When you add liquidity, you must provide both tokens in proportion to the
                    current price to avoid{' '}
                    <span className="inline-flex items-baseline gap-1">
                      <span className="font-semibold underline decoration-white/30 text-white/90">
                        arbitrage
                      </span>
                      <motion.span
                        whileHover={{ rotate: [0, -12, 12, -8, 0], scale: 1.3 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex text-purple-400 cursor-help"
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

      {/* Swap success toast (self-managing, portaled to body) */}
      <SwapToast result={lastSwapResult} isSwapping={isSwapping} />

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
