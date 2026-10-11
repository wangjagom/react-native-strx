export type AnimatableChannel =
  'opacity' | 'translateX' | 'translateY' | 'scale';

export type PresetDriver = 'timing' | 'spring';

export interface PresetMotionOptions {
  driver: PresetDriver;
  duration?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}

export interface StrxPreset {
  initial: Partial<Record<AnimatableChannel, number>>;
  target: Partial<Record<AnimatableChannel, number>>;
  options: PresetMotionOptions;
}

const SLIDE_DISTANCE = 24;

const builtInAnimationPresets = {
  'fade-in': {
    initial: { opacity: 0 },
    target: { opacity: 1 },
    options: { driver: 'timing', duration: 300 },
  },
  'fade-out': {
    initial: { opacity: 1 },
    target: { opacity: 0 },
    options: { driver: 'timing', duration: 250 },
  },
  'slide-up': {
    initial: { translateY: SLIDE_DISTANCE },
    target: { translateY: 0 },
    options: { driver: 'timing', duration: 320 },
  },
  'slide-down': {
    initial: { translateY: -SLIDE_DISTANCE },
    target: { translateY: 0 },
    options: { driver: 'timing', duration: 320 },
  },
  'slide-left': {
    initial: { translateX: SLIDE_DISTANCE },
    target: { translateX: 0 },
    options: { driver: 'timing', duration: 320 },
  },
  'slide-right': {
    initial: { translateX: -SLIDE_DISTANCE },
    target: { translateX: 0 },
    options: { driver: 'timing', duration: 320 },
  },
  'scale-up': {
    initial: { scale: 0.92 },
    target: { scale: 1 },
    options: { driver: 'timing', duration: 260 },
  },
  'scale-in': {
    initial: { scale: 0.92 },
    target: { scale: 1 },
    options: { driver: 'timing', duration: 260 },
  },
  'scale-down': {
    initial: { scale: 1.08 },
    target: { scale: 1 },
    options: { driver: 'timing', duration: 260 },
  },
  'scale-out': {
    initial: { scale: 1 },
    target: { scale: 0.92 },
    options: { driver: 'timing', duration: 220 },
  },
  bounce: {
    initial: { translateY: -16, scale: 0.96 },
    target: { translateY: 0, scale: 1 },
    options: {
      driver: 'spring',
      damping: 8,
      stiffness: 180,
      mass: 0.9,
    },
  },
} satisfies Record<string, StrxPreset>;

/**
 * Registry of preset animations available to `animate` tokens.
 *
 * Read-only for app code; register custom presets with `definePreset`.
 */
export const animationPresets: Record<string, StrxPreset> = {
  ...builtInAnimationPresets,
};

let presetRegistryVersion = 0;

/** Looks up a registered preset without reading inherited object keys. */
export function getPreset(name: string): StrxPreset | undefined {
  return Object.prototype.hasOwnProperty.call(animationPresets, name)
    ? animationPresets[name]
    : undefined;
}

/**
 * Registers or replaces a preset so it can be used as an `animate` token.
 *
 * Call this at module scope, before components using the preset render:
 *
 * ```ts
 * definePreset('pop-in', {
 *   initial: { opacity: 0, scale: 0.8 },
 *   target: { opacity: 1, scale: 1 },
 *   options: { driver: 'spring', damping: 12, stiffness: 200 },
 * });
 * ```
 */
export function definePreset(name: string, preset: StrxPreset): void {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error(
      `[react-native-strx] Invalid preset name "${name}". Use lowercase letters, digits, and dashes.`,
    );
  }

  animationPresets[name] = preset;
  presetRegistryVersion += 1;
}

/**
 * Monotonic counter bumped by `definePreset`, used to invalidate caches that
 * depend on preset definitions.
 */
export function getPresetRegistryVersion(): number {
  return presetRegistryVersion;
}

export type BuiltInAnimationPreset = keyof typeof builtInAnimationPresets;
