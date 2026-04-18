import { motion } from 'motion/react';
import FloatingLines from '../Animation/FloatingLines';

export const HeroSection = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Floating Lines Background restricted to Hero */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <FloatingLines
          linesGradient={['#8B5CF6', '#D946EF', '#6366F1']}
          animationSpeed={0.5}
          parallax={true}
          parallaxStrength={0.1}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-6xl md:text-8xl font-playfair font-bold tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-white">AMM </span>
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-300 bg-clip-text text-transparent">
            Explorer
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Visualize Automated Market Maker Models Used in Decentralized Finance
        </motion.p>
      </div>
    </div>
  );
};
