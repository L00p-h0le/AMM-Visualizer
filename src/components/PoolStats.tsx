import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, RefreshCw, HelpCircle, ChevronDown, Check } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { Tilt } from './motion-primitives/tilt';
import { GlareHover } from './motion-primitives/glare-hover';
import { TOKENS, type AMMType, type PoolState, type Token } from '../types/amm';
import { computeK } from '../lib/amm';
import { cn } from '../lib/utils';

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
/*  TokenSelect - portal-based dropdown that escapes any transform    */
/* ------------------------------------------------------------------ */

type TokenSelectProps = {
  value: Token;
  onChange: (token: Token) => void;
};

function TokenSelect({ value, onChange }: TokenSelectProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  /* Recalculate position every time we open */
  const openMenu = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + 8,
      left: r.left + r.width / 2,
    });
    setOpen(true);
  }, []);

  /* Close on outside click or Escape */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /* Reposition on scroll / resize while open */
  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      if (!btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left + r.width / 2 });
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  return (
    <>
      <motion.button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm hover:border-indigo-300 transition-all"
      >
        <TokenIcon symbol={value.symbol} className="w-5 h-5" />
        <span className="font-bold text-sm">{value.symbol}</span>
        <ChevronDown
          className={cn('text-slate-400 transition-transform duration-200', open && 'rotate-180')}
          size={14}
        />
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="fixed w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2"
              style={{
                top: pos.top,
                left: pos.left,
                transform: 'translateX(-50%)',
                zIndex: 9999,
              }}
            >
              {TOKENS.map((token, index) => (
                <motion.button
                  key={token.symbol}
                  type="button"
                  onClick={() => {
                    onChange(token);
                    setOpen(false);
                  }}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 2, backgroundColor: 'rgba(238,242,255,0.7)' }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    value.symbol === token.symbol
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700',
                  )}
                >
                  <TokenIcon symbol={token.symbol} className="w-6 h-6 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{token.symbol}</div>
                    <div className="text-[11px] text-slate-400 truncate">{token.name}</div>
                  </div>
                  {value.symbol === token.symbol && (
                    <Check size={14} className="text-indigo-500 shrink-0" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
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

  useEffect(() => {
    setInputX(String(pool.x));
  }, [pool.x]);
  useEffect(() => {
    setInputY(String(pool.y));
  }, [pool.y]);

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
    <Tilt rotationFactor={4} isRevese className="h-full w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 h-full flex flex-col justify-center">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="shrink-0"
            >
              <Droplets className="text-indigo-500 w-5 h-5" />
            </motion.div>
            Pool Reserves
          </h2>
          <motion.button
            type="button"
            onClick={() => resetPool()}
            whileHover={{ rotate: 180, scale: 1.04 }}
            whileTap={{ rotate: 360, scale: 0.95 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            title="Reset Pool"
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>

        {/* Token cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Token A */}
          <GlareHover className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-center mb-3">
              <TokenSelect value={tokenA} onChange={setTokenA} />
            </div>
            <input
              type="number"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              onBlur={() => commitValue('x')}
              min={1}
              className="w-full text-2xl font-bold tabular-nums bg-transparent outline-none focus:text-indigo-600 transition-colors text-center"
            />
          </GlareHover>

          {/* Token B */}
          <GlareHover className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-center mb-3">
              <TokenSelect value={tokenB} onChange={setTokenB} />
            </div>
            <input
              type="number"
              value={inputY}
              onChange={(e) => setInputY(e.target.value)}
              onBlur={() => commitValue('y')}
              min={1}
              className="w-full text-2xl font-bold tabular-nums bg-transparent outline-none focus:text-indigo-600 transition-colors text-center"
            />
          </GlareHover>
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 flex items-center gap-1">
              Current Price <HelpCircle size={14} className="text-slate-300" />
            </span>
            <span className="font-mono font-semibold text-indigo-600">
              1 {tokenA.symbol} = {currentPrice} {tokenB.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Constant (k)</span>
            <span className="font-mono font-semibold text-slate-700">
              {pool.k.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Tilt>
  );
};
