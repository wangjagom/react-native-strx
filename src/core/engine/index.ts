/**
 * Entry point for the STRX animation engine.
 *
 * Modules:
 * - `plan.ts`: compiling `animate` values into animation plans
 * - `frames.ts`: animatable style/transform frames
 * - `layer.ts`: progress-driven layers sampled on the UI thread
 * - `useStrxAnimationEngine.ts`: the hook that wires them together
 */
export {
  useStrxAnimation,
  useStrxAnimationEngine,
} from './useStrxAnimationEngine';
export type {
  StrxAnimationController,
  StrxAnimationEngine,
  StrxAnimationPlayOptions,
} from './useStrxAnimationEngine';
export {
  compileAnimation,
  estimateAnimationDelay,
  estimateAnimationDuration,
  reverseAnimation,
} from './plan';
export type {
  AnimationPlan,
  StrxCompileOptions,
  StrxCompiledAnimation,
} from './plan';
export type { AnimationFrame } from './frames';
