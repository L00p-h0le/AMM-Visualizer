import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { AMM_MODELS, type AMMType } from '../types/amm';
import { useClickOutside } from '../hooks/useClickOutside';

interface HeaderProps {
  ammType: AMMType;
  setAmmType: (type: AMMType) => void;
  resetPool: (ammType?: AMMType) => void;
}

export const Header = ({ ammType, setAmmType, resetPool }: HeaderProps) => {
  const [showAmmDropdown, setShowAmmDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedAmm = AMM_MODELS.find(m => m.id === ammType) || AMM_MODELS[0];

  useClickOutside([dropdownRef], () => setShowAmmDropdown(false), showAmmDropdown);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Zap className="text-indigo-600 w-10 h-10" />
          AMM Explorer
        </h1>
        <p className="text-slate-500 mt-1">Visualize Automated Market Maker mechanics in real-time.</p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <motion.button
          type="button"
          onClick={() => setShowAmmDropdown(!showAmmDropdown)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all min-w-[240px] justify-between"
        >
          <div className="text-left">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Model</div>
            <div className="font-bold text-slate-900">{selectedAmm.name}</div>
          </div>
          <ChevronDown className={cn('text-slate-400 transition-transform', showAmmDropdown && 'rotate-180')} size={20} />
        </motion.button>

        <AnimatePresence>
          {showAmmDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden origin-top-right"
            >
              <div className="p-2">
                {AMM_MODELS.map((model, index) => (
                  <motion.button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setAmmType(model.id as AMMType);
                      setShowAmmDropdown(false);
                      resetPool(model.id as AMMType);
                    }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ x: 2 }}
                    className={cn(
                      'w-full text-left p-4 rounded-xl transition-colors border border-transparent',
                      ammType === model.id ? 'bg-indigo-50/70 border-indigo-100' : 'hover:bg-slate-50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={cn('font-bold', ammType === model.id ? 'text-indigo-600' : 'text-slate-900')}>
                          {model.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{model.description}</div>
                      </div>
                      {ammType === model.id && <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
