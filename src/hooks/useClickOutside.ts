import { useEffect, useRef } from 'react';

/**
 * Dismiss handler — fires `onOutside` on click-outside or Escape.
 */
export function useClickOutside(
  refs: { readonly current: Element | null }[],
  onOutside: () => void,
  active = true,
) {
  const cb = useRef(onOutside);
  const savedRefs = useRef(refs);

  // Keep refs up-to-date after each render (not during render)
  useEffect(() => {
    cb.current = onOutside;
    savedRefs.current = refs;
  });

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (e: MouseEvent) => {
      if (savedRefs.current.some((r) => r.current?.contains(e.target as Node))) return;
      cb.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cb.current();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [active]);
}
