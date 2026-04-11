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
    <svg viewBox="0 0 48 48" className={cn('block', className)} aria-hidden="true" role="img">
      <circle cx="24" cy="24" r="24" fill="#2775CA" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="white" strokeWidth="2.6" opacity="0.95" />
      {/* Dollar sign S-curve */}
      <path
        d="M20.5 18.5c0-2.5 2-4.5 4-4.5s3.5 1.5 3.5 3.5c0 3-7.5 3-7.5 7 0 2 1.5 3.5 3.5 3.5s4-2 4-4.5"
        fill="none"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vertical line through dollar sign */}
      <line x1="24" y1="11" x2="24" y2="37" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
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
