import { useMemo } from 'react';

interface AmmChartProps {
  reserveX: number;
  reserveY: number;
  deltaX?: number;
  deltaY?: number;
}

export const AmmChart = ({ reserveX, reserveY, deltaX = 0, deltaY = 0 }: AmmChartProps) => {
  const width = 600;
  const height = 300;
  const padding = 30;

  const k = reserveX * reserveY;

  const currentX = reserveX;
  const currentY = reserveY;
  
  // Predict execution path
  const nextX = reserveX + deltaX;
  const nextY = reserveY + deltaY;
  
  // Tangent line derivative (Spot Price theoretical path mathematically)
  const spotSlope = - (reserveY / reserveX);
  const expectedYAtNextX = currentY + spotSlope * deltaX;

  const hasTrade = deltaX !== 0 || deltaY !== 0;

  const leftX = Math.min(currentX, nextX);
  const rightX = Math.max(currentX, nextX);
  const tradeWidth = rightX - leftX;

  // Dynamic Camera Zoom Mathematical Engine:
  // Automatically scales and crops the viewport to magnify small trades
  const frameWidth = hasTrade 
      ? Math.max(reserveX * 0.08, tradeWidth * 3) 
      : reserveX * 3.3;

  const frameCenter = hasTrade 
      ? (leftX + rightX) / 2 
      : reserveX * 1.85;

  const minXRaw = frameCenter - frameWidth / 2;
  const minX = Math.max(reserveX * 0.02, minXRaw); // safety > 0
  const maxX = minX + frameWidth;

  const minY = k / maxX;
  const maxY = k / minX;

  // Map theoretical reserves to SVG bounding box
  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding);
  const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding);

  // Generate hyperbola path string
  const pathD = useMemo(() => {
    let d = '';
    const steps = 150;
    const stepSize = (maxX - minX) / steps;
    
    for (let i = 0; i <= steps; i++) {
        const x = minX + (stepSize * i);
        const y = k / x;
        const px = scaleX(x);
        const py = scaleY(y);
        
        if (i === 0) {
            d += `M ${px} ${py} `;
        } else {
            d += `L ${px} ${py} `;
        }
    }
    return d;
  }, [k, minX, maxX]);

  return (
    <div className="w-full h-full relative overflow-visible">
      {/* Absolute positioning relative to parent div */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[110%] overflow-visible">
        {/* Subtle geometric fill under curve */}
        <path 
           d={`${pathD} L ${scaleX(maxX)} ${scaleY(minY)} L ${scaleX(minX)} ${scaleY(minY)} Z`}
           fill="rgba(0, 224, 255, 0.04)"
           className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
        />
        {/* Main AMM Curve Line */}
        <path 
          d={pathD} 
          fill="none" 
          stroke="#60A5FA" 
          strokeWidth="3" 
          strokeLinecap="round"
          className="drop-shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
        />
        
        {/* Current State Point (Before Swap) */}
        <circle 
          cx={scaleX(currentX)} 
          cy={scaleY(currentY)} 
          r={hasTrade ? "5" : "7"} 
          fill="#3b82f6" 
          className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${hasTrade ? "opacity-30" : "drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]"}`}
        />
        
        {/* New State Point (After Swap) */}
        {hasTrade && (
          <>
            {/* Price Impact / Slippage Visualizers */}
            {/* 1. Theoretical Constant Price Tangent Line */}
            <line 
              x1={scaleX(currentX)} y1={scaleY(currentY)} 
              x2={scaleX(nextX)} y2={scaleY(expectedYAtNextX)} 
              stroke="#ff4d4f" strokeDasharray="3 4" strokeWidth="2" strokeLinecap="round"
              className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-60"
            />
            {/* 2. Lost Value (Slippage) Vertical Drop Line gap representing lost value mathematically */}
            <line 
              x1={scaleX(nextX)} y1={scaleY(nextY)} 
              x2={scaleX(nextX)} y2={scaleY(expectedYAtNextX)} 
              stroke="#ef4444" strokeWidth="4" strokeLinecap="round"
              className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            />

            {/* Execution Target Marker */}
            <circle 
              cx={scaleX(nextX)} 
              cy={scaleY(nextY)} 
              r="7" 
              fill="#00e0ff" 
              className="drop-shadow-[0_0_16px_rgba(0,224,255,1)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            />
            {/* Guide line mapping the swap delta along X */}
            <line 
              x1={scaleX(currentX)} y1={scaleY(currentY)} 
              x2={scaleX(nextX)} y2={scaleY(currentY)} 
              stroke="rgba(0, 224, 255, 0.4)" strokeDasharray="4 4" strokeWidth="2" 
              className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            />
            {/* Guide line mapping the swap delta along Y */}
            <line 
              x1={scaleX(nextX)} y1={scaleY(currentY)} 
              x2={scaleX(nextX)} y2={scaleY(nextY)} 
              stroke="rgba(0, 224, 255, 0.4)" strokeDasharray="4 4" strokeWidth="2" 
              className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            />
          </>
        )}
      </svg>
    </div>
  );
}
