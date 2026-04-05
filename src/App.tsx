import { useState } from 'react';
import './index.css';
import { AmmChart } from './components/AmmChart';
import { simulateSwap, type PoolState } from './utils/amm';

function App() {
  const [pool] = useState<PoolState>({
    reserveX: 1240.50,
    reserveY: 3101250
  });

  const [inputAmount, setInputAmount] = useState<string>("5");
  const [isXToY, setIsXToY] = useState<boolean>(true);
  
  // This state locks the simulation variables onto the chart & math explanations
  // until the user presses "Execute Simulation"
  const [chartAmount, setChartAmount] = useState<number>(0);

  // Mocks for user wallet balance 
  const balanceX = 10000;
  const balanceY = 25000000;

  const parsedAmount = parseFloat(inputAmount) || 0;
  
  // 1. Live Simulation: Used strictly for the "YOU GET (EST.)", Fee, and Price Impact UI so UX is responsive as you type.
  const liveSimulation = simulateSwap({
    pool,
    amountIn: parsedAmount,
    isTokenXToY: isXToY
  });

  // 2. Visualizer Simulation: The frozen snapshot that animates the chart and math descriptions upon click.
  const visualSimulation = simulateSwap({
    pool,
    amountIn: chartAmount,
    isTokenXToY: isXToY
  });

  const tokenIn = isXToY ? "ETH" : "USDC";
  const tokenOut = isXToY ? "USDC" : "ETH";
  const balanceIn = isXToY ? balanceX : balanceY;

  const handleToggleSwap = () => {
    setIsXToY(!isXToY);
    setChartAmount(0); // clear chart on direction swap
  };

  const handleExecuteSimulation = () => {
    if (parsedAmount <= 0 || parsedAmount > balanceIn) return;
    // Commits the current input amount to the visualizer graph!
    setChartAmount(parsedAmount);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-6 md:p-8 flex flex-col gap-8">
      
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] tracking-widest text-[#00e0ff] uppercase font-bold">
            Sovereign Intelligence
          </h1>
          <span className="text-[11px] text-slate-400 tracking-wider">
            THE LEDGER V1.0.4-ALPHA
          </span>
        </div>
        <div>
          <div className="bg-[#1c2541] text-[#00e0ff] border border-white/10 px-4 py-2 rounded-md text-[13px] font-bold tracking-wider shadow-inner">
            MODEL: UNISWAP V2
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          {/* Main Chart Area */}
          <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-6 shadow-lg min-h-[480px] flex flex-col relative w-full overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-[26px] font-semibold mb-1">Constant Product Curve</h2>
                <div className="text-[15px] text-slate-400">Visualizing x * y = k (Uniswap V2 Core Model)</div>
              </div>
              <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded text-[11px] font-semibold tracking-wider text-slate-300">
                <span className="w-1.5 h-1.5 bg-[#00e0ff] rounded-full shadow-[0_0_8px_rgba(0,224,255,0.8)]"></span>
                LIVE SYNC
              </div>
            </div>

            {/* Render the dynamically generated AMM mathematical curve! */}
            <div className="flex-1 border-b border-l border-white/10 m-4 relative flex items-end ml-10 mb-[65px] min-h-[280px]">
              <div className="absolute top-0 left-0 w-full h-full -translate-y-8">
                <AmmChart
                  reserveX={pool.reserveX}
                  reserveY={pool.reserveY}
                  deltaX={isXToY ? chartAmount : -visualSimulation.amountOut}
                  deltaY={isXToY ? -visualSimulation.amountOut : chartAmount}
                />
              </div>
            </div>

            {/* Chart legends */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] font-bold tracking-widest uppercase mt-auto opacity-80">
              <div className="flex items-center gap-2">
                <span className="text-[#3b82f6] text-base">●</span> ORIGINAL STATE
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00e0ff] text-base">●</span> SIMULATED EXECUTION TARGET
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ef4444] text-base">■</span> PRICE IMPACT (LOST VALUE)
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-5 shadow-sm">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">RESERVE X (ETH)</div>
              <div className="text-2xl font-bold font-mono text-white transition-all">
                {visualSimulation.newReserveX.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-5 shadow-sm">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">RESERVE Y (USDC)</div>
              <div className="text-2xl font-bold font-mono text-white transition-all">
                {visualSimulation.newReserveY.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-5 shadow-sm">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">INVARIANT (K)</div>
              <div className="text-2xl font-bold font-mono text-white">
                {(visualSimulation.k / 1e9).toFixed(2)}B
              </div>
            </div>
            <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-5 shadow-sm flex flex-col">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold text-[#00e0ff]">CURRENT PRICE</div>
              <div className="text-2xl font-bold font-mono flex items-baseline gap-1 text-white transition-all">
                {(visualSimulation.newReserveY / visualSimulation.newReserveX).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                <span className="text-xs font-sans text-slate-400 font-medium">USDC/ETH</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Swap Box */}
          <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold tracking-wide">Simulate Swap</h3>
              <span className="w-6 h-6 rounded-full bg-white/5 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-white/10 transition-colors">i</span>
            </div>

            <div className="flex flex-col gap-2 relative">
              
              {/* You Pay */}
              <div className="bg-[#0b1121] rounded-xl p-4 border border-transparent focus-within:border-[#00e0ff]/50 transition-colors">
                <div className="flex justify-between text-[11px] text-slate-400 mb-3 font-semibold tracking-wider">
                  <span>YOU PAY</span>
                  <span>Bal: {balanceIn.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={inputAmount}
                    onChange={(e) => {
                       setInputAmount(e.target.value);
                       setChartAmount(0); // clear chart to force new simulation execution
                    }}
                    className="bg-transparent text-3xl font-semibold font-mono outline-none w-full text-white"
                  />
                  <button className="bg-[#1c2541] flex items-center gap-2 border border-white/5 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#222c4a] transition-colors shrink-0 shadow-sm">
                    {isXToY ? (
                      <><span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">🌐</span> ETH</>
                    ) : (
                      <><span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">S</span> USDC</>
                    )}
                  </button>
                </div>
              </div>

              {/* Swap Button Wrapper */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex">
                <button
                  onClick={handleToggleSwap}
                  className="bg-[#1c2541] border-[4px] border-[#151c31] w-11 h-11 rounded-[12px] flex items-center justify-center hover:bg-[#222c4a] hover:text-[#00e0ff] transition-colors text-slate-400 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" /></svg>
                </button>
              </div>

              {/* You Get */}
              <div className="bg-[#0b1121] rounded-xl p-4 border border-transparent focus-within:border-[#00e0ff]/50 transition-colors">
                <div className="flex justify-between text-[11px] text-slate-400 mb-3 font-semibold tracking-wider">
                  <span>YOU GET (EST.)</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={liveSimulation.amountOut.toLocaleString('en-US', { maximumFractionDigits: 5 })}
                    readOnly
                    className="bg-transparent text-3xl font-semibold font-mono outline-none text-slate-300 w-full"
                  />
                  <button className="bg-[#1c2541] flex items-center gap-2 border border-white/5 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#222c4a] transition-colors shrink-0 shadow-sm">
                    {isXToY ? (
                      <><span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">S</span> USDC</>
                    ) : (
                      <><span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">🌐</span> ETH</>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Metrics */}
            <div className="flex flex-col gap-3 py-6 px-1 text-[13px] font-medium border-t border-white/5 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Slippage Tolerance</span>
                <span className="text-white font-semibold">0.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Price Impact</span>
                <span className="text-[#ff4d4f] font-semibold">
                  {(liveSimulation.priceImpact * 100).toFixed(3)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Liquidity Provider Fee</span>
                <span className="text-[#60A5FA] font-semibold">
                  {liveSimulation.feeAmount.toFixed(5)} {tokenIn}
                </span>
              </div>
            </div>

            <button
              onClick={handleExecuteSimulation}
              disabled={parsedAmount <= 0 || parsedAmount > balanceIn}
              className="w-full bg-[#00e0ff] disabled:opacity-50 hover:bg-[#33e6ff] text-black font-bold text-[14px] tracking-wide py-4 rounded-lg transition-all shadow-[0_0_15px_rgba(0,224,255,0.25)] hover:shadow-[0_0_20px_rgba(0,224,255,0.4)] uppercase"
            >
              {parsedAmount > balanceIn ? "Insufficient Balance" : "Execute Simulation"}
            </button>
          </div>

          {/* Math Card */}
          <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-6 shadow-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-5 text-[15px] tracking-wide">
              <span className="text-[#00e0ff] text-lg">✨</span> The Math Behind This Swap
            </h3>

            <div className="bg-[#0b1121] p-4 rounded-lg border-l-2 border-[#00e0ff] mb-6 shadow-inner">
              <p className="italic text-slate-400 text-[13px] mb-3 leading-relaxed">
                In a constant product market maker, the product of reserves must remain constant during the swap.
              </p>
              <div className="text-center font-mono text-[#00e0ff] text-[13px] bg-white/5 py-2 rounded">
                (x + dx * 0.997) * (y - dy) = k
              </div>
            </div>

            {chartAmount > 0 ? (
              <ol className="list-decimal pl-5 text-[13px] text-slate-300 space-y-3 marker:text-slate-600 marker:font-mono font-medium leading-[1.6]">
                <li>
                  Your input is <strong className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">{chartAmount} {tokenIn}</strong>. 
                  First, a 0.3% liquidity provider fee (<strong className="text-red-400 font-mono bg-white/5 px-1 py-0.5 rounded">{visualSimulation.feeAmount.toFixed(5)} {tokenIn}</strong>) is deducted, leaving <strong className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">{(chartAmount - visualSimulation.feeAmount).toFixed(5)} {tokenIn}</strong> for the active trade.
                </li>
                <li>
                  The pool adds your input to its reserves. To keep the invariant <strong className="text-[#00e0ff] font-mono bg-[#00e0ff]/10 px-1 py-0.5 rounded">k = {(visualSimulation.k / 1e9).toFixed(2)}B</strong> constant, 
                  the {tokenOut} reserve drops from <strong className="text-slate-400 line-through">{(isXToY ? pool.reserveY : pool.reserveX).toFixed(2)}</strong> down to <strong className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">{(isXToY ? visualSimulation.newReserveY : visualSimulation.newReserveX).toFixed(2)}</strong>.
                </li>
                <li>
                  This difference is the exact amount you receive: <strong className="text-[#00e0ff] font-mono bg-[#00e0ff]/10 px-1 py-0.5 rounded">{visualSimulation.amountOut.toFixed(5)} {tokenOut}</strong>. 
                  Because your trade shifts the ratio of the pool, you incur a Price Impact of <strong className="text-[#ff4d4f] font-mono bg-white/5 px-1 py-0.5 rounded">{(visualSimulation.priceImpact * 100).toFixed(3)}%</strong> compared to the current spot price.
                </li>
              </ol>
            ) : (
              <div className="text-center text-slate-400 text-sm py-4 italic">
                Set an amount and click "Execute Simulation" to view the mathematical breakdown.
              </div>
            )}
            
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;
