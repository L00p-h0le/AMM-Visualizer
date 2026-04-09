import type { CSSProperties, ReactNode } from 'react';

interface StarBorderProps {
  children: ReactNode;
  className?: string;
  color?: string;
  speed?: string;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: unknown;
}

export function StarBorder({
  children,
  className = '',
  color = 'white',
  speed = '6s',
  as: Component = 'button',
  ...rest
}: StarBorderProps) {
  const wrapperStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    borderRadius: '0.75rem',
    padding: '2px',            /* ← gap where the gradient shows through */
    overflow: 'hidden',
  };

  const borderStyle: CSSProperties = {
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
    background: `conic-gradient(from var(--star-angle), transparent 60%, ${color} 80%, transparent 100%)`,
    animation: `star-spin ${speed} linear infinite`,
  };

  const contentStyle: CSSProperties = {
    position: 'relative',
    display: 'block',
    width: '100%',
    borderRadius: 'calc(0.75rem - 2px)',
  };

  return (
    <>
      <style>{`
        @property --star-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes star-spin {
          from { --star-angle: 0deg; }
          to { --star-angle: 360deg; }
        }
      `}</style>
      {/* @ts-expect-error dynamic element */}
      <Component className={className} style={wrapperStyle} {...rest}>
        <div style={borderStyle} />
        <div style={contentStyle}>{children}</div>
      </Component>
    </>
  );
}
