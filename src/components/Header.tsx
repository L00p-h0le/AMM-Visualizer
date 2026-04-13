import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
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
        <h1 className="text-4xl font-bold tracking-tight text-white/90">
          AMM Explorer
        </h1>
        <p className="text-white/50 mt-1">Visualize Automated Market Maker mechanics in real-time.</p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <motion.button
          type="button"
          onClick={() => setShowAmmDropdown(!showAmmDropdown)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="flex items-center gap-3 bg-white/[0.04] backdrop-blur-md px-6 py-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all min-w-[240px] justify-between"
        >
          <div className="text-left">
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Model</div>
            <div className="font-bold text-white/90">{selectedAmm.name}</div>
          </div>
          <ChevronDown className={cn('text-white/50 transition-transform', showAmmDropdown && 'rotate-180')} size={20} />
        </motion.button>

        <AnimatePresence>
          {showAmmDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute right-0 mt-2 w-72 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 z-50 overflow-hidden origin-top-right"
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
                      ammType === model.id ? 'bg-purple-500/20 border-purple-400/30' : 'hover:bg-white/5',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={cn('font-bold', ammType === model.id ? 'text-purple-400' : 'text-white/90')}>
                          {model.name}
                        </div>
                        <div className="text-xs text-white/50 mt-1">{model.description}</div>
                      </div>
                      {ammType === model.id && <Check size={16} className="text-purple-400 shrink-0 mt-0.5" />}
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
