/**
 * Public entry point for the STRX animation engine.
 *
 * The implementation lives in `./engine/`:
 * - `plan.ts`: compiling `animate` values into animation plans
 * - `frames.ts`: animatable style/transform frames
 * - `layer.ts`: progress-driven layers sampled on the UI thread
 * - `useStrxAnimationEngine.ts`: the hook that wires them together
 */
export {
  useCodexAnimation,
  useCodexAnimationEngine,
} from './engine/useStrxAnimationEngine';
export type {
  CodexAnimationController,
  CodexAnimationEngine,
  CodexAnimationPlayOptions,
} from './engine/useStrxAnimationEngine';
export {
  compileCodexAnimation,
  estimateCodexAnimationDelay,
  estimateCodexAnimationDuration,
  reverseCodexAnimation,
} from './engine/plan';
export type {
  AnimationPlan,
  CodexCompileOptions,
  CodexCompiledAnimation,
} from './engine/plan';
export type { AnimationFrame } from './engine/frames';
