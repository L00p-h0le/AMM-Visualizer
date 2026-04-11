import { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { TOKENS } from '../types/amm';

const SVG_ICONS: Record<string, string> = {
  ETH: 'https://svgl.app/library/eth.svg',
  BTC: 'https://svgl.app/library/btc.svg',
  SOL: 'https://svgl.app/library/sol.svg',
  USDT: 'https://svgl.app/library/tether.svg',
};

type TokenIconProps = {
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
  const iconUrl = SVG_ICONS[symbol];
  const [hasError, setHasError] = useState(false);

  if (symbol === 'USDC') {
    return (
      <motion.div
        initial={animateOnLoad ? { opacity: 0, scale: 0.85 } : false}
        animate={animateOnLoad ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('shrink-0', className)}
      >
        <UsdcIcon className="h-full w-full" />
      </motion.div>
    );
  }

  if (iconUrl && !hasError) {
    return (
      <motion.img
        src={iconUrl}
        alt={token.name}
        initial={animateOnLoad ? { opacity: 0, scale: 0.85 } : false}
        animate={animateOnLoad ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('block shrink-0 object-contain', className)}
        onError={() => setHasError(true)}
        loading="eager"
        draggable={false}
      />
    );
  }

  return (
    <motion.div
      initial={animateOnLoad ? { opacity: 0, scale: 0.85 } : false}
      animate={animateOnLoad ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.35, ease: 'easeOut' }}
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
