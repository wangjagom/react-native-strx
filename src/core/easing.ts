/**
 * Resolves a STRX easing token at progress `t` (0..1).
 *
 * Runs on the UI thread. Unknown names fall back to smoothstep, matching the
 * `ease` token.
 */
export function applyEasing(name: string, t: number): number {
  'worklet';

  if (name === 'linear') {
    return t;
  }

  if (name === 'ease-in') {
    return t * t * t;
  }

  if (name === 'ease-out') {
    return 1 - Math.pow(1 - t, 3);
  }

  if (name === 'ease-in-out') {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  return t * t * (3 - 2 * t);
}
