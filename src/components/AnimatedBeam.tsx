import React, { useEffect, useId, useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { animate, createMotionPath } from "animejs";

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  fromRef: React.RefObject<HTMLDivElement | null>;
  toRef: React.RefObject<HTMLDivElement | null>;
  isTransferring: boolean;
  curvature?: number;
  duration?: number;
  delay?: number;
}

interface TokenProps {
  tokenId: number;
  pathRef: React.RefObject<SVGPathElement | null>;
  duration: number;
  onComplete: (id: number) => void;
  key?: React.Key;
}

const EthIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-top`} x1="15.927" y1="4" x2="15.927" y2="23.998" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id={`${id}-bottom`} x1="15.927" y1="20.298" x2="15.927" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#064e3b" />
        </linearGradient>
      </defs>
      <path d="M15.927 23.998L7.53 19.028L15.927 4L24.324 19.028L15.927 23.998Z" fill={`url(#${id}-top)`} fillOpacity="0.9" />
      <path d="M15.927 28L7.53 20.298L15.927 25.268L24.324 20.298L15.927 28Z" fill={`url(#${id}-bottom)`} fillOpacity="0.8" />
    </svg>
  );
};

const Token = ({ tokenId, pathRef, duration, onComplete }: TokenProps) => {
  const tokenRef = useRef<SVGGElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const filterId = useId();

  useEffect(() => {
    if (tokenRef.current && pathRef.current) {
      const motionPath: any = createMotionPath(pathRef.current);

      if (motionPath) {
        // Main path animation
        (animate as any)(tokenRef.current, {
          translateX: motionPath.translateX,
          translateY: motionPath.translateY,
          rotate: motionPath.rotate,
          opacity: [0, 1, 1, 0],
          scale: [0.4, 1.1, 1.1, 0.4],
          duration: duration,
          ease: 'easeInOutCubic',
          onComplete: () => {
            onComplete(tokenId);
          }
        });

        // Subtle independent rotation for the icon
        if (iconRef.current) {
          (animate as any)(iconRef.current, {
            rotate: [0, 360],
            duration: duration * 0.8,
            delay: Math.random() * 300,
            ease: 'linear',
            loop: true
          });
        }
      }
    }
  }, [tokenId, pathRef, duration, onComplete]);

  return (
    <g ref={tokenRef} style={{ opacity: 0 }}>
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.05" />
          </feComponentTransfer>
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>
      <foreignObject width="60" height="60" x="-30" y="-30">
        <div className="flex items-center justify-center w-full h-full">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden">
            {/* Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30" style={{ filter: `url(#${filterId})` }} />
            
            {/* Pulsing Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-lg animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-[ping_3s_linear_infinite]" />
            
            <div ref={iconRef} className="relative z-10 flex items-center justify-center">
              <EthIcon size={24} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};


export const AnimatedBeam = ({
  containerRef,
  fromRef,
  toRef,
  isTransferring,
  curvature = -100,
  duration = 3500,
}: AnimatedBeamProps) => {
  const id = useId();
  const [path, setPath] = useState("");
  const pathRef = useRef<SVGPathElement>(null);
  const [tokens, setTokens] = useState<{ id: number }[]>([]);

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2 + curvature;

      setPath(`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    return () => window.removeEventListener("resize", updatePath);
  }, [containerRef, fromRef, toRef, curvature]);

  // Spawn tokens when transferring with organic jitter
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;
    const startTime = Date.now();
    const spawnDuration = 3000;

    const spawnToken = () => {
      if (!isTransferring || !isActive || Date.now() - startTime > spawnDuration) return;

      setTokens((prev) => [...prev, { id: Date.now() + Math.random() }]);

      // Randomize next spawn time between 350ms and 650ms for an organic feel
      const nextSpawnDelay = 350 + Math.random() * 300;
      timeoutId = setTimeout(spawnToken, nextSpawnDelay);
    };

    if (isTransferring) {
      spawnToken();
    }

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [isTransferring]);

  const handleTokenComplete = useCallback((tokenId: number) => {
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));
  }, []);

  return (
    <svg
      fill="none"
      width="100%"
      height="100%"
      viewBox="0 0 100% 100%"
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={path}
        stroke="white"
        strokeOpacity="0.03"
        strokeWidth="1"
        strokeLinecap="round"
      />

      <motion.path
        ref={pathRef}
        d={path}
        stroke={`url(#${id})`}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isTransferring ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {tokens.map((token) => (
        <Token 
          key={token.id} 
          tokenId={token.id} 
          pathRef={pathRef} 
          duration={duration}
          onComplete={handleTokenComplete}
        />
      ))}

      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

