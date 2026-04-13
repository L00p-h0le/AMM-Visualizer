import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PoolStats } from './components/PoolStats';
import { SwapControls } from './components/SwapControls';
import { PriceCurveChart } from './components/PriceCurveChart';
import { ProcessSimulation } from './components/ProcessSimulation';
import { EducationalSection } from './components/EducationalSection';
import { TOKENS, type AMMType, type PoolState, type Token, type SwapResult } from './types/amm';
import { calculateSwap, computeK, defaultPool } from './lib/amm';
import FloatingLines from './components/FloatingLines';
import Lenis from 'lenis';

const ENABLED_WAVES: Array<'top' | 'middle' | 'bottom'> = ['top', 'middle', 'bottom'];

export default function App() {
  /* ── Smooth Scrolling ── */
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

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

  /* ── Simulation: derived from current state (no useEffect / setState) ── */
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

  /* ── Helpers ── */
  const resetPool = (overrideType?: AMMType) => {
    const type = overrideType ?? ammType;
    setPool(defaultPool(type));
    setLastSwapResult(null);
    setPreviousPool(null);
    setAnimationState('idle');
  };

  const handleSetTokenA = (t: Token) => { setTokenA(t); resetPool(); };
  const handleSetTokenB = (t: Token) => { setTokenB(t); resetPool(); };

  /* ── Swap (instant) ── */
  const handleSwap = () => {
    if (swapAmount <= 0) return;
    setIsSwapping(true);
    setPreviousPool({ ...pool });

    const result = calculateSwap(pool, ammType, swapAmount, swapDirection);

    setLastSwapResult(result);
    setPool({ x: result.newX, y: result.newY, k: result.kAfter });
    setTimeout(() => setIsSwapping(false), 1000);
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
    <div className="dark relative min-h-screen bg-[#030303] text-white/90 selection:bg-purple-500/30">

      {/* Background layer */}
      <div style={{
        position: 'fixed',  // fixed so it stays while scrolling
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none'  // so it doesn't block clicks
      }}>
        <FloatingLines
          enabledWaves={ENABLED_WAVES}
          lineCount={5}
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }} className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-12">
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
        </section>

        <section>
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
    </div>
  );
}
