import { animate, createMotionPath } from 'animejs';

/* ------------------------------------------------------------------ */
/*  Typed wrappers for animejs v4                                      */
/*                                                                     */
/*  animejs ships incomplete TypeScript declarations for motion-path   */
/*  APIs.  These thin wrappers centralise the cast so component code   */
/*  stays type-safe.                                                   */
/* ------------------------------------------------------------------ */

export interface MotionPathResult {
  translateX: unknown;
  translateY: unknown;
  rotate: unknown;
}

export interface AnimeParams {
  translateX?: unknown;
  translateY?: unknown;
  rotate?: unknown;
  opacity?: number[];
  scale?: number[];
  duration?: number;
  ease?: string;
  delay?: number;
  loop?: boolean;
  onComplete?: () => void;
}

/** Create a motion-path helper from an SVG `<path>` element. */
export function createPath(el: SVGPathElement | null): MotionPathResult | null {
  if (!el) return null;
  return (createMotionPath as (e: SVGPathElement) => MotionPathResult | null)(el);
}

/** Run an animejs animation on a DOM element. */
export function animateEl(target: Element | null, params: AnimeParams): void {
  if (!target) return;
  (animate as (t: Element, p: AnimeParams) => void)(target, params);
}
