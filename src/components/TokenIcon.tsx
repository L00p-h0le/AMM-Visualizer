import { cn } from '../lib/utils';
import { TOKENS } from '../types/amm';

export const TokenIcon = ({ symbol, className }: { symbol: string, className?: string }) => {
  const token = TOKENS.find(t => t.symbol === symbol) || TOKENS[0];
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-xs", token.color, className)}>
      {symbol[0]}
    </div>
  );
};
