export type AnimatableChannel =
  | 'opacity'
  | 'translateX'
  | 'translateY'
  | 'scale';

export type PresetDriver = 'timing' | 'spring';

export interface PresetMotionOptions {
  driver: PresetDriver;
  duration?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}

export interface CodexAnimationPreset {
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
} satisfies Record<string, CodexAnimationPreset>;

export const animationPresets: Record<string, CodexAnimationPreset> =
  builtInAnimationPresets;

export type BuiltInAnimationPreset = keyof typeof builtInAnimationPresets;
