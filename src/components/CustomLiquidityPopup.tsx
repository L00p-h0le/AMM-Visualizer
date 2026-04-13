import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { RippleButton } from './Animation/RippleButton';
import type { Token } from '../types/amm';
import { useClickOutside } from '../hooks/useClickOutside';

export function CustomLiquidityPopup({
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

  const handleClose = () => {
    setValA('');
    setValB('');
    onClose();
  };

  useClickOutside([panelRef], handleClose, open);

  const handleSubmit = () => {
    const a = parseFloat(valA);
    const b = parseFloat(valB);
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return;
    onAdd(a, b);
    handleClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[9998]"
          />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[340px] bg-[#1a1a1a]/95 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white/90">Custom Liquidity</h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-white/50 uppercase">
                  {tokenA.symbol}
                </label>
                <input
                  type="number"
                  value={valA}
                  onChange={(e) => setValA(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  autoFocus
                  className="w-full bg-black/40 px-3 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-white/90 outline-none focus:border-purple-400 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-white/50 uppercase">
                  {tokenB.symbol}
                </label>
                <input
                  type="number"
                  value={valB}
                  onChange={(e) => setValB(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  className="w-full bg-black/40 px-3 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-white/90 outline-none focus:border-purple-400 transition-colors"
                />
              </div>
            </div>

            <RippleButton
              onClick={handleSubmit}
              className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_28px_rgba(168,85,247,0.6)] transition-all"
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
