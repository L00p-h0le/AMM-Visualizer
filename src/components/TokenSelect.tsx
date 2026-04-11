import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { TOKENS, type Token } from '../types/amm';
import { cn } from '../lib/utils';
import { useClickOutside } from '../hooks/useClickOutside';

type TokenSelectProps = {
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
