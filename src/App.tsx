import { useState } from 'react';
import { Header } from './components/Header';
import { PoolStats } from './components/PoolStats';
import { SwapControls } from './components/SwapControls';
import { PriceCurveChart } from './components/PriceCurveChart';
import { ProcessSimulation } from './components/ProcessSimulation';
import { EducationalSection } from './components/EducationalSection';
import { TOKENS, type AMMType, type PoolState, type Token, type SwapResult } from './types/amm';
import { calculateSwap, computeK, defaultPool, FEE_PERCENT } from './lib/amm';

export default function App() {
  /* ── State ── */
  const [ammType, setAmmType] = useState<AMMType>('CPMM');
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [pool, setPool] = useState<PoolState>(defaultPool('CPMM'));
  const [previousPool, setPreviousPool] = useState<PoolState | null>(null);
  const [pendingPool, setPendingPool] = useState<PoolState | null>(null);
  const [swapAmount, setSwapAmount] = useState(10);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
  const [lastSwapResult, setLastSwapResult] = useState<SwapResult | null>(null);
  const [simulationResult, setSimulationResult] = useState<{ in: number; out: number } | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'sending' | 'calculating' | 'receiving' | 'balancing'>('idle');

  const currentPrice = (pool.y / pool.x).toFixed(4);

  /* ── Helpers ── */
  const resetPool = (overrideType?: AMMType) => {
    const type = overrideType ?? ammType;
    setPool(defaultPool(type));
    setLastSwapResult(null);
    setPreviousPool(null);
  };

  const handleSetTokenA = (t: Token) => { setTokenA(t); resetPool(); };
  const handleSetTokenB = (t: Token) => { setTokenB(t); resetPool(); };

  /* ── Swap (instant) ── */
  const handleSwap = () => {
    if (swapAmount <= 0) return;
    setIsSwapping(true);
    setPreviousPool({ ...pool });

    const { newX, newY, outAmount, priceImpact } = calculateSwap(pool, ammType, swapAmount, swapDirection);

    setLastSwapResult({ in: swapAmount, out: outAmount, priceImpact, fee: swapAmount * FEE_PERCENT });
    setPool({ x: newX, y: newY, k: pool.k });
    setTimeout(() => setIsSwapping(false), 1000);
  };

  /* ── Simulate (step-through animation) ── */
  const handleSimulate = () => {
    if (isSimulating || swapAmount <= 0) return;
    setIsSimulating(true);

    const { newX, newY, outAmount } = calculateSwap(pool, ammType, swapAmount, swapDirection);

    setSimulationResult({ in: swapAmount, out: outAmount });
    setPendingPool({ x: newX, y: newY, k: pool.k });
    setAnimationState('sending');
  };

  /* ── Liquidity ── */
  const handleAddLiquidity = (amountA: number, amountB: number) => {
    setPreviousPool(null);
    setLastSwapResult(null);
    setPool(prev => {
      const newX = prev.x + amountA;
      const newY = prev.y + amountB;
      return { x: newX, y: newY, k: computeK(newX, newY, ammType) };
    });
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      <Header ammType={ammType} setAmmType={setAmmType} resetPool={resetPool} />

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
          <PoolStats
            pool={pool}
            ammType={ammType}
            tokenA={tokenA}
            tokenB={tokenB}
            setTokenA={handleSetTokenA}
            setTokenB={handleSetTokenB}
            setPool={setPool}
            currentPrice={currentPrice}
            resetPool={() => resetPool()}
          />
          <SwapControls
            ammType={ammType}
            pool={pool}
            tokenA={tokenA}
            tokenB={tokenB}
            swapAmount={swapAmount}
            setSwapAmount={setSwapAmount}
            swapDirection={swapDirection}
            setSwapDirection={setSwapDirection}
            isSwapping={isSwapping}
            lastSwapResult={lastSwapResult}
            handleSwap={handleSwap}
            handleAddLiquidity={handleAddLiquidity}
          />
        </div>
        <div className="lg:col-span-8">
          <PriceCurveChart ammType={ammType} pool={isSimulating && pendingPool ? pendingPool : pool} previousPool={previousPool} />
        </div>
      </section>

      <section>
        <ProcessSimulation
          pool={pool}
          isSimulating={isSimulating}
          animationState={animationState}
          swapDirection={swapDirection}
          swapAmount={swapAmount}
          tokenA={tokenA}
          tokenB={tokenB}
          simulationResult={simulationResult}
          ammType={ammType}
          pendingPool={pendingPool}
          setAnimationState={setAnimationState}
          setIsSimulating={setIsSimulating}
          handleSimulate={handleSimulate}
        />
      </section>

      <section>
        <EducationalSection
          ammType={ammType}
          lastSwapResult={lastSwapResult}
          swapDirection={swapDirection}
          tokenA={tokenA}
          tokenB={tokenB}
        />
      </section>

      <footer className="text-center py-8 text-slate-400 text-sm">
        AMM Explorer &bull; Built for educational purposes &bull; 2026
      </footer>
    </div>
  );
}
