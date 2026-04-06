import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { AMM_MODELS, type AMMType } from '../types/amm';

interface HeaderProps {
  ammType: AMMType;
  setAmmType: (type: AMMType) => void;
  resetPool: () => void;
}

export const Header = ({ ammType, setAmmType, resetPool }: HeaderProps) => {
  const [showAmmDropdown, setShowAmmDropdown] = useState(false);
  const selectedAmm = AMM_MODELS.find(m => m.id === ammType) || AMM_MODELS[0];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Zap className="text-indigo-600 w-10 h-10" />
          AMM Explorer
        </h1>
        <p className="text-slate-500 mt-1">Visualize Automated Market Maker mechanics in real-time.</p>
      </div>
      
      {/* AMM Model Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setShowAmmDropdown(!showAmmDropdown)}
          className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all min-w-[240px] justify-between"
        >
          <div className="text-left">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Model</div>
            <div className="font-bold text-slate-900">{selectedAmm.name}</div>
          </div>
          <ChevronDown className={cn("text-slate-400 transition-transform", showAmmDropdown && "rotate-180")} size={20} />
        </button>

        <AnimatePresence>
          {showAmmDropdown && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden"
            >
              {AMM_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setAmmType(model.id as AMMType);
                    setShowAmmDropdown(false);
                    resetPool();
                  }}
                  className={cn(
                    "w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                    ammType === model.id && "bg-indigo-50/50"
                  )}
                >
                  <div className={cn("font-bold", ammType === model.id ? "text-indigo-600" : "text-slate-900")}>
                    {model.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{model.description}</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
