import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type GlareHoverProps = {
  children: ReactNode;
  className?: string;
};

export function GlareHover({ children, className }: GlareHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glare, setGlare] = useState({ x: 50, y: 50, visible: false });

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setGlare({ x, y, visible: true });
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerMove}
      onPointerLeave={() => setGlare((prev) => ({ ...prev, visible: false }))}
      className={cn('group relative', className)}
      style={{
        boxShadow: glare.visible
          ? '0 0 20px rgba(99,102,241,0.18), inset 0 1px 12px rgba(129,140,248,0.10)'
          : 'none',
        transition: 'box-shadow 0.35s ease',
      }}
    >
      {/* Radial spotlight \u2014 indigo-tinted so it\u2019s visible on light bg */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
        style={{
          background: `radial-gradient(260px circle at ${glare.x}% ${glare.y}%, rgba(129,140,248,0.22), rgba(199,210,254,0.09) 40%, transparent 70%)`,
          opacity: glare.visible ? 1 : 0,
        }}
      />
      {/* Moving streak highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
        style={{
          background:
            'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.50) 42%, transparent 56%)',
          transform: `translateX(${(glare.x - 50) * 0.5}%) translateY(${(glare.y - 50) * 0.35}%) rotate(10deg)`,
          opacity: glare.visible ? 1 : 0,
        }}
      />
      {/* Content \u2014 z-20 so it\u2019s above the glare layers */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
