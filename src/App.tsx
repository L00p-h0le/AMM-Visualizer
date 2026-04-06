import { useState } from 'react';
import './index.css';
import { Header } from './components/Header';
import { PoolStats } from './components/PoolStats';
import { SwapControls } from './components/SwapControls';
import { PriceCurveChart } from './components/PriceCurveChart';
import { ProcessSimulation } from './components/ProcessSimulation';
import { EducationalSection } from './components/EducationalSection';

import { TOKENS, type AMMType, type PoolState, type Token } from './types/amm';

export default function App() {
  const [ammType, setAmmType] = useState<AMMType>('CPMM');
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [pool, setPool] = useState<PoolState>({ x: 100, y: 100, k: 10000 });
  const [previousPool, setPreviousPool] = useState<PoolState | null>(null);
  const [swapAmount, setSwapAmount] = useState<number>(10);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
  const [lastSwapResult, setLastSwapResult] = useState<{ in: number, out: number, priceImpact: number, fee: number } | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'sending' | 'calculating' | 'receiving' | 'balancing'>('idle');

  const FEE_PERCENT = 0.003; // 0.3% standard fee
  const currentPrice = (pool.y / pool.x).toFixed(4);

  const resetPool = () => {
    setPool({ x: 100, y: 100, k: 10000 });
    setLastSwapResult(null);
    setPreviousPool(null);
  };

  const handleSetTokenA = (t: Token) => {
    setTokenA(t);
    resetPool();
  };

  const handleSetTokenB = (t: Token) => {
    setTokenB(t);
    resetPool();
  };

  const handleSwap = () => {
    if (isSwapping) return;
    setIsSwapping(true);
    setPreviousPool({ ...pool });

    // Stage 1: Tokens fly from wallet to pool (2s)
    setAnimationState('sending');

    setTimeout(() => {
      // Stage 2: Pool calculates output (1.5s)
      setAnimationState('calculating');

      // Compute the swap math during this stage
      setPool(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let outAmount = 0;
        const amountWithFee = swapAmount * (1 - FEE_PERCENT);

        if (swapDirection === 'AtoB') {
          const dx = swapAmount;
          if (ammType === 'CPMM') {
            const dy = prev.y - (prev.k / (prev.x + amountWithFee));
            newX = prev.x + dx;
            newY = prev.y - dy;
            outAmount = dy;
          } else if (ammType === 'CSMM') {
            const dy = Math.min(prev.y, amountWithFee);
            newX = prev.x + dx;
            newY = prev.y - dy;
            outAmount = dy;
          } else {
            const leverage = 0.1;
            const dy = (amountWithFee * (1 + leverage)) / (1 + leverage);
            newX = prev.x + dx;
            newY = prev.y - dy;
            outAmount = dy;
          }
        } else {
          const dy = swapAmount;
          if (ammType === 'CPMM') {
            const dx = prev.x - (prev.k / (prev.y + amountWithFee));
            newY = prev.y + dy;
            newX = prev.x - dx;
            outAmount = dx;
          } else if (ammType === 'CSMM') {
            const dx = Math.min(prev.x, amountWithFee);
            newY = prev.y + dy;
            newX = prev.x - dx;
            outAmount = dx;
          } else {
            const leverage = 0.1;
            const dx = (amountWithFee * (1 + leverage)) / (1 + leverage);
            newY = prev.y + dy;
            newX = prev.x - dx;
            outAmount = dx;
          }
        }

        const initialPrice = prev.y / prev.x;
        const finalPrice = newY / newX;
        const priceImpact = Math.abs((finalPrice - initialPrice) / initialPrice) * 100;

        setLastSwapResult({
          in: swapAmount,
          out: outAmount,
          priceImpact,
          fee: swapAmount * FEE_PERCENT,
        });
        return { ...prev, x: newX, y: newY };
      });

      setTimeout(() => {
        // Stage 3: Output tokens fly pool → wallet (2s)
        setAnimationState('receiving');

        setTimeout(() => {
          // Stage 4: Pool rebalances (1.5s)
          setAnimationState('balancing');

          setTimeout(() => {
            setIsSwapping(false);
            setAnimationState('idle');
          }, 1500);
        }, 2000);
      }, 1500);
    }, 2000);
  };

  const handleAddLiquidity = (amountA: number, amountB: number) => {
    setPreviousPool(null);
    setPool(prev => {
      const newX = prev.x + amountA;
      const newY = prev.y + amountB;
      let newK = prev.k;
      if (ammType === 'CPMM') newK = newX * newY;
      else if (ammType === 'CSMM') newK = newX + newY;
      else newK = newX + newY; // Simplified
      return { x: newX, y: newY, k: newK };
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <Header ammType={ammType} setAmmType={setAmmType} resetPool={resetPool} />

      {/* ── Hero Section ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Pool Reserves + Swap (stacked, height matches chart) */}
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

        {/* Right Column: Price Curve Visualization */}
        <div className="lg:col-span-8">
          <PriceCurveChart ammType={ammType} pool={pool} previousPool={previousPool} />
        </div>
      </section>

      {/* ── Real-time Process Simulation ── */}
      <section>
        <ProcessSimulation
          pool={pool}
          isSwapping={isSwapping}
          animationState={animationState}
          swapDirection={swapDirection}
          swapAmount={swapAmount}
          tokenA={tokenA}
          tokenB={tokenB}
          lastSwapResult={lastSwapResult}
          ammType={ammType}
        />
      </section>

      {/* ── How It Works ── */}
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
