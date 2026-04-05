
import './index.css';

function App() {
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
          <select className="bg-[#1c2541] text-white border border-white/10 px-4 py-2 rounded-md outline-none text-sm cursor-pointer hover:bg-[#222c4a] transition-colors">
            <option value="v2">Model Selection (V2)</option>
            <option value="v3">Uniswap V3</option>
          </select>
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

            {/* Chart Area Mock - A sleek curve visually representing the AMM */}
            <div className="flex-1 border-b border-l border-white/10 m-4 relative flex items-end ml-10 mb-14 min-h-[250px]">
               {/* Visual proxy for chart curve */}
               <svg viewBox="0 0 500 200" className="absolute top-0 left-0 w-full h-full overflow-visible preserve-3d">
                  {/* Subtle fill under curve */}
                  <path d="M0,0 Q100,180 500,195 L500,200 L0,200 Z" fill="rgba(0, 224, 255, 0.05)" />
                  {/* The mathematical curve line */}
                  <path d="M0,0 Q100,180 500,195" fill="none" stroke="#60A5FA" strokeWidth="3" />
                  {/* The state point indicator */}
                  <circle cx="120" cy="120" r="8" fill="#00e0ff" className="drop-shadow-[0_0_10px_rgba(0,224,255,0.8)]" />
                  <circle cx="120" cy="120" r="20" fill="rgba(0,224,255,0.15)" />
               </svg>
            </div>

            {/* Chart legends */}
            <div className="flex gap-8 text-[11px] font-bold tracking-widest uppercase mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-[#00e0ff] text-base">●</span> ASSET X RESERVE
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#60A5FA] text-base">●</span> ASSET Y RESERVE
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-5 shadow-sm">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">RESERVE X (ETH)</div>
              <div className="text-2xl font-bold font-mono">1,240.50</div>
            </div>
            <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-5 shadow-sm">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">RESERVE Y (USDC)</div>
              <div className="text-2xl font-bold font-mono">3,101,250</div>
            </div>
            <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-5 shadow-sm">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">INVARIANT (K)</div>
              <div className="text-2xl font-bold font-mono">3.84B</div>
            </div>
            <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-5 shadow-sm flex flex-col">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold text-[#00e0ff]">CURRENT PRICE</div>
              <div className="text-2xl font-bold font-mono flex items-baseline gap-1">
                2,499.80 <span className="text-xs font-sans text-slate-400 font-medium">USDC/ETH</span>
              </div>
            </div>
          </div>

          {/* Advanced Info Banner */}
          <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white/5 shadow-inner border border-white/5 rounded-xl flex justify-center items-center shrink-0 text-xl">
                📊
              </div>
              <div>
                <h3 className="font-semibold text-[16px] text-slate-100">Advanced Slippage Simulation</h3>
                <p className="text-[14px] text-slate-400 mt-1 leading-relaxed">
                  Run historical volatility tests to see how your swap would have performed during high volume periods.
                </p>
              </div>
            </div>
            <button className="whitespace-nowrap px-5 py-2.5 border border-white/10 text-[#00e0ff] text-sm font-semibold rounded hover:bg-white/5 transition-colors">
              Launch Test Suite
            </button>
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
                  <span>Bal: 14.50 ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <input 
                    type="text" 
                    defaultValue="1.00" 
                    className="bg-transparent text-3xl font-semibold font-mono outline-none w-full text-white"
                  />
                  <button className="bg-[#1c2541] flex items-center gap-2 border border-white/5 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#222c4a] transition-colors shrink-0 shadow-sm">
                     <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">🌐</span> ETH
                  </button>
                </div>
              </div>

              {/* Swap Button Wrapper */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex">
                <button className="bg-[#1c2541] border-[4px] border-[#151c31] w-11 h-11 rounded-[12px] flex items-center justify-center hover:bg-[#222c4a] hover:text-[#00e0ff] transition-colors text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/></svg>
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
                    defaultValue="2,491.32" 
                    readOnly
                    className="bg-transparent text-3xl font-semibold font-mono outline-none text-slate-300 w-full"
                  />
                  <button className="bg-[#1c2541] flex items-center gap-2 border border-white/5 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#222c4a] transition-colors shrink-0 shadow-sm">
                     <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">S</span> USDC
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
                <span className="text-[#ff4d4f] font-semibold">0.34%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Liquidity Provider Fee</span>
                <span className="text-[#60A5FA] font-semibold">7.47 USDC</span>
              </div>
            </div>

            <button className="w-full bg-[#00e0ff] hover:bg-[#33e6ff] text-black font-bold text-[14px] tracking-wide py-4 rounded-lg transition-all shadow-[0_0_15px_rgba(0,224,255,0.25)] hover:shadow-[0_0_20px_rgba(0,224,255,0.4)] uppercase">
              Execute Simulation
            </button>
          </div>

          {/* Math Card */}
          <div className="bg-[#151c31] border border-white/5 rounded-[12px] p-6 shadow-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-5 text-[15px] tracking-wide">
              <span className="text-[#00e0ff] text-lg">✨</span> The Math Behind This Swap
            </h3>

            <div className="bg-[#0b1121] p-4 rounded-lg border-l-2 border-[#00e0ff] mb-6 shadow-inner">
              <p className="italic text-slate-400 text-[13px] mb-3 leading-relaxed">
                In a constant product market maker, the product of reserves must remain constant before fees.
              </p>
              <div className="text-center font-mono text-[#00e0ff] text-[13px] bg-white/5 py-2 rounded">
                dy = y - (k / (x + dx))
              </div>
            </div>

            <ol className="list-decimal pl-5 text-[13px] text-slate-300 space-y-3 marker:text-slate-600 marker:font-mono font-medium leading-relaxed">
              <li>Add your input <strong className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">dx</strong> (1 ETH) to the current pool reserve <strong className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">x</strong>.</li>
              <li>Calculate the new reserve <strong className="text-[#00e0ff] font-mono bg-[#00e0ff]/10 px-1 py-0.5 rounded">y'</strong> needed to satisfy <strong className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">k</strong>.</li>
              <li>The difference <strong className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">y - y'</strong> is the amount you receive minus 0.3% fee.</li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;
