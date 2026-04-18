import { useState } from 'react';
import { motion } from 'motion/react';
import { Droplets, RefreshCw, HelpCircle } from 'lucide-react';
import { Tilt } from './Animation/Tilt';
import { GlareHover } from './Animation/GlareHover';
import { TokenSelect } from './Tokens';
import { type AMMType, type PoolState, type Token } from '../types/amm';
import { computeK } from '../lib/amm';

interface PoolStatsProps {
  pool: PoolState;
  ammType: AMMType;
  tokenA: Token;
  tokenB: Token;
  setTokenA: (t: Token) => void;
  setTokenB: (t: Token) => void;
  setPool: (pool: PoolState) => void;
  currentPrice: string;
  resetPool: () => void;
}

/* ------------------------------------------------------------------ */
/*  PoolStats                                                         */
/* ------------------------------------------------------------------ */

export const PoolStats = ({
  pool,
  ammType,
  tokenA,
  tokenB,
  setTokenA,
  setTokenB,
  setPool,
  currentPrice,
  resetPool,
}: PoolStatsProps) => {
  const [inputX, setInputX] = useState(String(pool.x));
  const [inputY, setInputY] = useState(String(pool.y));
  const [prevPool, setPrevPool] = useState({ x: pool.x, y: pool.y });

  // Sync local inputs when pool changes externally
  // (React 19 "adjust state on prop change" pattern — no useEffect)
  if (pool.x !== prevPool.x || pool.y !== prevPool.y) {
    setPrevPool({ x: pool.x, y: pool.y });
    if (pool.x !== prevPool.x) setInputX(String(pool.x));
    if (pool.y !== prevPool.y) setInputY(String(pool.y));
  }

  const commitValue = (axis: 'x' | 'y') => {
    const raw = axis === 'x' ? inputX : inputY;
    const value = parseFloat(raw);
    if (isNaN(value) || value <= 0) {
      if (axis === 'x') setInputX(String(pool.x));
      else setInputY(String(pool.y));
      return;
    }
    const newX = axis === 'x' ? value : pool.x;
    const newY = axis === 'y' ? value : pool.y;
    setPool({ x: newX, y: newY, k: computeK(newX, newY, ammType) });
  };

  return (
    <Tilt rotationFactor={4} isRevese className="w-full">
      <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border space-y-6 flex flex-col justify-center">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Droplets className="text-purple-400 w-5 h-5 shrink-0" />
            Pool Reserves
          </h2>
          <motion.button
            type="button"
            onClick={() => resetPool()}
            whileHover={{ rotate: 180, scale: 1.04 }}
            whileTap={{ rotate: 360, scale: 0.95 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50"
            title="Reset Pool"
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>

        {/* Token cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Token A */}
          <GlareHover className="bg-white/[0.04] p-4 rounded-xl border border-white/10">
            <div className="flex justify-center mb-3">
              <TokenSelect value={tokenA} onChange={setTokenA} />
            </div>
            <input
              type="number"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              onBlur={() => commitValue('x')}
              min={1}
              className="w-full text-2xl font-bold tabular-nums bg-transparent outline-none focus:text-purple-600 dark:focus:text-purple-400 text-foreground transition-colors text-center"
            />
          </GlareHover>

          {/* Token B */}
          <GlareHover className="bg-white/[0.04] p-4 rounded-xl border border-white/10">
            <div className="flex justify-center mb-3">
              <TokenSelect value={tokenB} onChange={setTokenB} />
            </div>
            <input
              type="number"
              value={inputY}
              onChange={(e) => setInputY(e.target.value)}
              onBlur={() => commitValue('y')}
              min={1}
              className="w-full text-2xl font-bold tabular-nums bg-transparent outline-none focus:text-purple-600 dark:focus:text-purple-400 text-foreground transition-colors text-center"
            />
          </GlareHover>
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Current Price <HelpCircle size={14} className="text-white/30" />
            </span>
            <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
              1 {tokenA.symbol} = {currentPrice} {tokenB.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-sm text-white/50 font-medium">
              {ammType === 'StableSwap' ? 'Invariant (D)' : 'Constant (k)'}
            </span>
            <span className="font-mono font-bold text-foreground">
              {pool.k.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Tilt>
  );
};
