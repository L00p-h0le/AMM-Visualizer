import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import type { SwapResult } from '../types/amm';

interface SwapToastProps {
  result: SwapResult | null;
  isSwapping: boolean;
}

export function SwapToast({ result, isSwapping }: SwapToastProps) {
  const [dismissed, setDismissed] = useState(false);
  const [prevResult, setPrevResult] = useState<SwapResult | null>(null);

  // When a new result arrives, un-dismiss (React 19 "adjust state on prop change" pattern)
  if (result !== prevResult) {
    setPrevResult(result);
    setDismissed(false);
  }

  const visible = !!result && !isSwapping && !dismissed;

  // Auto-dismiss after 2s (setTimeout is async, not a sync setState in effect)
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setDismissed(true), 2000);
    return () => clearTimeout(timer);
  }, [visible]);

  return createPortal(
    <AnimatePresence>
      {visible && result && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          className="fixed top-6 right-6 z-[9999] bg-white border border-green-200 shadow-xl rounded-2xl p-4 pr-6 min-w-[260px] max-w-[340px]"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
              <Check size={16} className="text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-green-800 text-sm">Swap Successful</div>
              <div className="text-xs text-green-600 mt-0.5">
                Swapped {result.in.toFixed(2)} for {result.out.toFixed(4)}
              </div>
            </div>
          </div>
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
  );
}
