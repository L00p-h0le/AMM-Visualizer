export type AMMType = 'CPMM' | 'CSMM' | 'StableSwap';

export interface PoolState {
  x: number; // Token A reserve
  y: number; // Token B reserve
  k: number; // Invariant constant
}

export interface Token {
  symbol: string;
  name: string;
  color: string;
}

export interface SwapResult {
  in: number;
  out: number;
  priceImpact: number;
  fee: number;
}

export const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', color: 'bg-indigo-500' },
  { symbol: 'USDC', name: 'USD Coin', color: 'bg-blue-400' },
  { symbol: 'USDT', name: 'Tether', color: 'bg-emerald-500' },
  { symbol: 'BTC', name: 'Bitcoin', color: 'bg-orange-500' },
  { symbol: 'SOL', name: 'Solana', color: 'bg-purple-500' },
];

export const AMM_MODELS = [
  { id: 'CPMM', name: 'Constant Product (x*y=k)', description: 'Standard Uniswap V2 model' },
  { id: 'CSMM', name: 'Constant Sum (x+y=k)', description: 'Zero slippage, high risk' },
  { id: 'StableSwap', name: 'Hybrid StableSwap', description: 'Optimized for pegged assets' },
];
