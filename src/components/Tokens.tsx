import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { TOKENS, type Token } from '../types/amm';
import { useClickOutside } from '../hooks/useClickOutside';

export type TokenIconProps = {
  symbol: string;
  className?: string;
  animateOnLoad?: boolean;
};

function UsdcIcon({ className }: { className?: string }) {
  return (
    <img
      src="/usdc-official.png"
      alt="USDC"
      className={cn('block object-contain', className)}
    />
  );
}

export const TokenIcon = ({ symbol, className, animateOnLoad = false }: TokenIconProps) => {
  const token = TOKENS.find(t => t.symbol === symbol) || TOKENS[0];
  const [hasError, setHasError] = useState(false);

  const anim = {
    initial: animateOnLoad ? { opacity: 0, scale: 0.85 } : (false as const),
    animate: animateOnLoad ? { opacity: 1, scale: 1 } : undefined,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  };

  if (symbol === 'USDC') {
    return (
      <motion.div {...anim} className={cn('shrink-0', className)}>
        <UsdcIcon className="h-full w-full" />
      </motion.div>
    );
  }

  if (token.icon && !hasError) {
    return (
      <motion.img
        src={token.icon}
        alt={token.name}
        {...anim}
        className={cn('block shrink-0 object-contain', className)}
        onError={() => setHasError(true)}
        loading="eager"
        draggable={false}
      />
    );
  }

  return (
    <motion.div
      {...anim}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm text-xs',
        token.color,
        className,
      )}
    >
      {symbol[0]}
    </motion.div>
  );
};

export type TokenSelectProps = {
  value: Token;
  onChange: (token: Token) => void;
};

export function TokenSelect({ value, onChange }: TokenSelectProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const openMenu = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + 8,
      left: r.left + r.width / 2,
    });
    setOpen(true);
  }, []);

  // Close on click-outside or Escape
  useClickOutside([btnRef, menuRef], () => setOpen(false), open);

  // Reposition on scroll / resize
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
        className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-sm hover:border-purple-400/50 hover:bg-white/10 transition-all text-white/90"
      >
        <TokenIcon symbol={value.symbol} className="w-5 h-5" />
        <span className="font-bold text-sm">{value.symbol}</span>
        <ChevronDown
          className={cn('text-white/50 transition-transform duration-200', open && 'rotate-180')}
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
              className="fixed w-52 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 py-2"
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
                  whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    value.symbol === token.symbol
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-white/70 hover:text-white/90',
                  )}
                >
                  <TokenIcon symbol={token.symbol} className="w-6 h-6 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{token.symbol}</div>
                    <div className="text-[11px] text-white/50 truncate">{token.name}</div>
                  </div>
                  {value.symbol === token.symbol && (
                    <Check size={14} className="text-purple-400 shrink-0" />
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
