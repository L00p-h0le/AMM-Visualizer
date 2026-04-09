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
      <path
        d="M29.4 17.1c-1.5-1.4-3.3-2.1-5.4-2.1-4.6 0-8.1 3.3-8.1 9s3.5 9 8.1 9c2.1 0 3.9-.7 5.4-2.1"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16.6 18.8c-1.1.9-1.7 2.2-1.7 3.8 0 1.7.8 3 2.4 3.9"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M31.8 20.1h1.9M31.8 24h3.4M31.8 27.9h1.9"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="white"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
      >
        USDC
      </text>
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
