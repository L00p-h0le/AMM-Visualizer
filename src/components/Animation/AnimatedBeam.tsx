import React, { useEffect, useId, useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { createPath, animateEl } from "../../lib/anime";
import { TokenIcon } from "../TokenIcon";

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  fromRef: React.RefObject<HTMLDivElement | null>;
  toRef: React.RefObject<HTMLDivElement | null>;
  isTransferring: boolean;
  symbol?: string;
  curvature?: number;
  duration?: number;
}

interface TokenProps {
  tokenId: number;
  symbol: string;
  pathRef: React.RefObject<SVGPathElement | null>;
  duration: number;
  onComplete: (id: number) => void;
  key?: React.Key;
}


const Token = ({ tokenId, symbol, pathRef, duration, onComplete }: TokenProps) => {
  const tokenRef = useRef<SVGGElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tokenRef.current || !pathRef.current) return;

    const mp = createPath(pathRef.current);
    if (!mp) return;

    // Main path animation
    animateEl(tokenRef.current, {
      translateX: mp.translateX,
      translateY: mp.translateY,
      rotate: mp.rotate,
      opacity: [0, 1, 1, 0],
      scale: [0.4, 1.1, 1.1, 0.4],
      duration,
      ease: 'easeInOutCubic',
      onComplete: () => onComplete(tokenId),
    });

    if (iconRef.current) {
      animateEl(iconRef.current, {
        rotate: [0, 360],
        duration: duration * 0.8,
        delay: Math.random() * 300,
        ease: 'linear',
        loop: true,
      });
    }
  }, [tokenId, pathRef, duration, onComplete]);

  return (
    <g ref={tokenRef} style={{ opacity: 0 }}>
      <foreignObject width="60" height="60" x="-30" y="-30">
        <div className="flex items-center justify-center w-full h-full">
          <div ref={iconRef} className="relative z-10 flex items-center justify-center w-8 h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            <TokenIcon symbol={symbol} className="w-full h-full" />
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
  symbol = "ETH",
  curvature = -100,
  duration = 3500,
}: AnimatedBeamProps) => {
  const id = useId();
  const [path, setPath] = useState("");
  const pathRef = useRef<SVGPathElement>(null);
  const [tokens, setTokens] = useState<{ id: number }[]>([]);
  const [delayedShow, setDelayedShow] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isTransferring) {
      setDelayedShow(true);
      // Spawning phase is 3s. Vanish 1s after completion -> 4s total
      timeout = setTimeout(() => {
        setDelayedShow(false);
      }, 4000);
    } else {
      setDelayedShow(false);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isTransferring]);


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
    let timeoutId: any;
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

    if (!isTransferring) {
      setTokens([]);
    }

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
        animate={delayedShow ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {tokens.map((token) => (
        <Token
          key={token.id}
          tokenId={token.id}
          symbol={symbol}
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
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="30%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
          <stop offset="70%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
