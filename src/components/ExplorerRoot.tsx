import { useState, useMemo } from 'react';
import { Header } from './Header';
import { PoolStats } from './PoolStats';
import { SwapControls } from './SwapControls';
import { PriceCurveChart } from './PriceCurveChart';
import { ProcessSimulation } from './ProcessSimulation';
import { EducationalSection } from './EducationalSection';
import { TOKENS, type AMMType, type PoolState, type Token, type SwapResult } from '../types/amm';
import { calculateSwap, computeK, defaultPool } from '../lib/amm';

export const useExplorerSections = () => {
  /* ── State ── */
  const [ammType, setAmmType] = useState<AMMType>('CPMM');
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [pool, setPool] = useState<PoolState>(defaultPool('CPMM'));
  const [previousPool, setPreviousPool] = useState<PoolState | null>(null);
  const [swapAmount, setSwapAmount] = useState(10);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
  const [lastSwapResult, setLastSwapResult] = useState<SwapResult | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'sending' | 'calculating' | 'receiving' | 'balancing'>('idle');

  const currentPrice = (pool.y / pool.x).toFixed(4);

  const simulationData = useMemo(() => {
    if (animationState === 'idle') return null;
    const { newX, newY, out } = calculateSwap(pool, ammType, swapAmount, swapDirection);
    return {
      result: { in: swapAmount, out },
      pendingPool: { x: newX, y: newY, k: computeK(newX, newY, ammType) } as PoolState,
    };
  }, [animationState, pool, ammType, swapAmount, swapDirection]);

  const simulationResult = simulationData?.result ?? null;
  const pendingPool = simulationData?.pendingPool ?? null;

  const resetPool = (overrideType?: AMMType) => {
    const type = overrideType ?? ammType;
    setPool(defaultPool(type));
    setLastSwapResult(null);
    setPreviousPool(null);
    setAnimationState('idle');
  };

  const handleSetTokenA = (t: Token) => { setTokenA(t); resetPool(); };
  const handleSetTokenB = (t: Token) => { setTokenB(t); resetPool(); };

  const handleSwap = () => {
    if (swapAmount <= 0) return;
    setIsSwapping(true);
    setPreviousPool({ ...pool });
    const result = calculateSwap(pool, ammType, swapAmount, swapDirection);
    setLastSwapResult(result);
    setPool({ x: result.newX, y: result.newY, k: result.kAfter });
    setTimeout(() => setIsSwapping(false), 1000);
  };

  const handleAddLiquidity = (amountA: number, amountB: number) => {
    setPreviousPool(null);
    setLastSwapResult(null);
    setPool(prev => {
      const newX = prev.x + amountA;
      const newY = prev.y + amountB;
      return { x: newX, y: newY, k: computeK(newX, newY, ammType) };
    });
  };

  return {
    ExplorerTools: (
      <div id="explorer-tools">
        <Header ammType={ammType} setAmmType={setAmmType} resetPool={resetPool} />
        <div className="bg-slate-100 border border-slate-200/60 p-6 md:p-8 rounded-[2.5rem] mt-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
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
                resetPool={resetPool}
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
              <PriceCurveChart ammType={ammType} pool={pendingPool ? pendingPool : pool} previousPool={previousPool} />
            </div>
          </div>
        </div>
      </div>
    ),
    SimulationSection: (
      <div id="process-simulation">
        <ProcessSimulation
          pool={pool}
          animationState={animationState}
          swapDirection={swapDirection}
          swapAmount={swapAmount}
          tokenA={tokenA}
          tokenB={tokenB}
          simulationResult={simulationResult}
          ammType={ammType}
          pendingPool={pendingPool}
          setAnimationState={setAnimationState}
        />
      </div>
    ),
    EducationSection: (
      <div id="how-it-works">
        <EducationalSection
          ammType={ammType}
          lastSwapResult={lastSwapResult}
          swapDirection={swapDirection}
          tokenA={tokenA}
          tokenB={tokenB}
        />
      </div>
    ),
  };
};

