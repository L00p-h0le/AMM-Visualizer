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
  const [isSwapping, setIsSwapping] = useState(false); // Used for SwapControls visual state
  const [isSimulating, setIsSimulating] = useState(false); // Used for ProcessSimulation lock
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB');
  const [lastSwapResult, setLastSwapResult] = useState<{ in: number, out: number, priceImpact: number, fee: number } | null>(null);
  const [simulationResult, setSimulationResult] = useState<{ in: number, out: number } | null>(null);
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

  const [pendingPool, setPendingPool] = useState<PoolState | null>(null);

  const calculateSwap = () => {
    let newX = pool.x;
    let newY = pool.y;
    let outAmount = 0;
    const amountWithFee = swapAmount * (1 - FEE_PERCENT);

    if (swapDirection === 'AtoB') {
      const dx = swapAmount;
      if (ammType === 'CPMM') {
        const dy = pool.y - (pool.k / (pool.x + amountWithFee));
        newX = pool.x + dx;
        newY = pool.y - dy;
        outAmount = dy;
      } else if (ammType === 'CSMM') {
        const dy = Math.min(pool.y, amountWithFee);
        newX = pool.x + dx;
        newY = pool.y - dy;
        outAmount = dy;
      } else {
        const leverage = 0.1;
        const dy = (amountWithFee * (1 + leverage)) / (1 + leverage);
        newX = pool.x + dx;
        newY = pool.y - dy;
        outAmount = dy;
      }
    } else {
      const dy = swapAmount;
      if (ammType === 'CPMM') {
        const dx = pool.x - (pool.k / (pool.y + amountWithFee));
        newY = pool.y + dy;
        newX = pool.x - dx;
        outAmount = dx;
      } else if (ammType === 'CSMM') {
        const dx = Math.min(pool.x, amountWithFee);
        newY = pool.y + dy;
        newX = pool.x - dx;
        outAmount = dx;
      } else {
        const leverage = 0.1;
        const dx = (amountWithFee * (1 + leverage)) / (1 + leverage);
        newY = pool.y + dy;
        newX = pool.x - dx;
        outAmount = dx;
      }
    }

    const initialPrice = pool.y / pool.x;
    const finalPrice = newY / newX;
    const priceImpact = Math.abs((finalPrice - initialPrice) / initialPrice) * 100;

    return { newX, newY, outAmount, priceImpact };
  };

  const handleSwap = () => {
    if (swapAmount <= 0) return;
    setIsSwapping(true);
    setPreviousPool({ ...pool });

    const { newX, newY, outAmount, priceImpact } = calculateSwap();

    setLastSwapResult({
      in: swapAmount,
      out: outAmount,
      priceImpact,
      fee: swapAmount * FEE_PERCENT,
    });
    setPool({ x: newX, y: newY, k: pool.k });
    
    // reset button after 1s
    setTimeout(() => setIsSwapping(false), 1000);
  };

  const handleSimulate = () => {
    if (isSimulating || swapAmount <= 0) return;
    setIsSimulating(true);

    const { newX, newY, outAmount } = calculateSwap();

    setSimulationResult({
      in: swapAmount,
      out: outAmount
    });
    setPendingPool({ x: newX, y: newY, k: pool.k });
    
    // Stage 1: Tokens fly from wallet to pool
    setAnimationState('sending');
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
          <PriceCurveChart ammType={ammType} pool={isSimulating && pendingPool ? pendingPool : pool} previousPool={previousPool} />
        </div>
      </section>

      {/* ── Real-time Process Simulation ── */}
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
          setPool={setPool}
          setIsSimulating={setIsSimulating}
          handleSimulate={handleSimulate}
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
