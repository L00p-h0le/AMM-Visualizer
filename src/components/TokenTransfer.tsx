import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Droplets, Plus, Info } from 'lucide-react';
import { AnimatedBeam } from './AnimatedBeam';

export default function TokenTransfer() {
  const [isTransferring, setIsTransferring] = useState(false);
  const [walletBalance, setWalletBalance] = useState(12450.00);
  const [poolLiquidity, setPoolLiquidity] = useState(1050200.00);

  const containerRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);

  const startTransfer = useCallback(() => {
    if (isTransferring) return;
    setIsTransferring(true);
    
    // Balances update slightly after animation starts for realism
    setTimeout(() => {
      setWalletBalance(prev => prev - 500);
      setPoolLiquidity(prev => prev + 500);
    }, 2000);

    // Reset transferring state after animation duration
    // Spawning lasts 3s + 3.5s travel duration = ~6.5s
    setTimeout(() => {
      setIsTransferring(false);
    }, 7000);
  }, [isTransferring]);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 font-sans overflow-hidden bg-[#050505]"
    >
      {/* Animated Beam Layer */}
      <AnimatedBeam 
        containerRef={containerRef}
        fromRef={walletRef}
        toRef={poolRef}
        isTransferring={isTransferring}
        curvature={-150}
      />

      <div className="w-full max-w-5xl relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Liquidity Protocol
          </h1>
          <p className="text-white/40 font-mono text-sm uppercase tracking-[0.3em]">
            Automated Market Maker v3.0
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* User Wallet Card */}
          <motion.div 
            ref={walletRef}
            className="glass-panel rounded-[2rem] p-8 flex flex-col items-center text-center relative group"
            whileHover={{ y: -5, borderColor: 'rgba(59, 130, 246, 0.3)' }}
          >
            <div className="absolute top-4 right-4 text-white/10 group-hover:text-blue-400/40 transition-colors">
              <Info size={16} />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <Wallet size={32} />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">Available Balance</span>
            <div className="text-3xl font-mono font-medium tracking-tight">
              {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-sm text-blue-400 ml-2">ETH</span>
            </div>
          </motion.div>

          {/* Center Action Zone */}
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="h-24 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isTransferring ? (
                  <motion.div
                    key="transferring"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="text-emerald-400 font-mono text-xs animate-pulse">STREAMING ASSETS</div>
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-400"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={startTransfer}
              disabled={isTransferring}
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(52, 211, 153, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all
                ${isTransferring 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                  : 'bg-white text-black hover:bg-emerald-400 shadow-2xl'}
              `}
            >
              <div className="flex items-center gap-3">
                <Plus size={18} />
                {isTransferring ? 'Processing' : 'Add Liquidity'}
              </div>
            </motion.button>
          </div>

          {/* Liquidity Pool Card */}
          <motion.div 
            ref={poolRef}
            className="glass-panel rounded-[2rem] p-8 flex flex-col items-center text-center relative group"
            whileHover={{ y: -5, borderColor: 'rgba(52, 211, 153, 0.3)' }}
          >
            <div className="absolute top-4 right-4 text-white/10 group-hover:text-emerald-400/40 transition-colors">
              <Info size={16} />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(52,211,153,0.1)]">
              <Droplets size={32} />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">Total Pool Value</span>
            <div className="text-3xl font-mono font-medium tracking-tight">
              {poolLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-sm text-emerald-400 ml-2">ETH</span>
            </div>
          </motion.div>

        </div>

        {/* Footer Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Network Fee', value: '$2.45' },
            { label: 'Slippage', value: '0.1%' },
            { label: 'Price Impact', value: '<0.01%' },
            { label: 'APY', value: '12.4%' }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-lg font-mono text-white/80">{stat.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

