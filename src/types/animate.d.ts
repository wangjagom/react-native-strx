import type { ViewStyle } from "react-native";

/**
 * STRX intentionally keeps the runtime token type open.
 *
 * Rich autocomplete for string tokens is provided by:
 * STRX Animation IntelliSense
 *
 * This type file only provides a minimal set of known tokens
 * and keeps custom string tokens valid.
 */

/**
 * Built-in entrance/exit preset names.
 *
 * Example: `animate="fade-in duration-300"`.
 */
export type AnimatePresetToken =
  | "fade-in"
  | "fade-out"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "scale-out"
  | "scale-up"
  | "scale-down"
  | "bounce";

/** Easing tokens accepted by preset, from/to, event, and transition animations. */
export type AnimateEasingToken =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";

/**
 * Native Reanimated layout transition tokens.
 *
 * Use these when size or position changes should animate on the UI thread.
 */
export type AnimateLayoutToken =
  | "layout-linear"
  | "layout-spring"
  | "layout-fade"
  | "layout-spring-stiff"
  | "layout-spring-bouncy";

/**
 * Implicit transition tokens for animating changes in the static `style` prop.
 *
 * Example: `animate="transition-colors duration-250"`.
 */
export type AnimateTransitionToken =
  | "transition"
  | "transition-all"
  | "transition-colors"
  | "transition-opacity"
  | "transition-transform"
  | "transition-spacing"
  | "transition-layout";

/**
 * Timing and playback modifiers.
 *
 * `duration-*` and `delay-*` are milliseconds. `play-*` is total play count.
 */
export type AnimateTimingToken =
  | `duration-${number}`
  | `delay-${number}`
  | `repeat-${number}`
  | "repeat-infinite"
  | `play-${number}`
  | "play-infinite"
  | AnimateEasingToken;

/** Tailwind-like utilities that can be used with `from:`, `to:`, or `exit:` prefixes. */
export type AnimateUtilityToken =
  | `opacity-${number}`
  | `translate-x-${number}`
  | `-translate-x-${number}`
  | `translate-y-${number}`
  | `-translate-y-${number}`
  | `scale-${number}`
  | `scale-x-${number}`
  | `scale-y-${number}`
  | `rotate-${number}`
  | `-rotate-${number}`
  | `w-${number}`
  | `h-${number}`;

/**
 * Prefix tokens that create explicit keyframes.
 *
 * Example: `from:opacity-0 to:opacity-100 duration-300`.
 */
export type AnimateModifierToken =
  | `from:${AnimateUtilityToken}`
  | `to:${AnimateUtilityToken}`
  | `exit:${AnimateUtilityToken}`
  | `from:${string}`
  | `to:${string}`
  | `exit:${string}`;

export type AnimateKnownToken =
  | AnimatePresetToken
  | AnimateLayoutToken
  | AnimateTransitionToken
  | AnimateTimingToken
  | AnimateModifierToken;

/**
 * Allows known STRX tokens while still accepting custom user tokens.
 *
 * Example:
 * animate="fade-in duration-300"
 * animate="from:opacity-0 to:opacity-100"
 * animate="my-custom-token"
 */
export type AnimateToken = AnimateKnownToken | (string & {});

/** Numeric or string animation value, such as `24`, `"45deg"`, or `"50%"`. */
export type AnimateScalar = number | string;
/** Numeric or percentage dimension accepted by explicit from/to style objects. */
export type AnimateDimension = number | `${number}%`;
/** Color value accepted by Reanimated color timing, such as `"#fff"` or `"transparent"`. */
export type AnimateColor = string;

export interface AnimateTransformStyle {
  /** 3D perspective distance. Usually paired with rotateX/rotateY. */
  perspective?: number;
  /** Horizontal translation in pixels or a supported string value. */
  translateX?: AnimateScalar;
  /** Vertical translation in pixels or a supported string value. */
  translateY?: AnimateScalar;
  /** Uniform scale. `1` is neutral. */
  scale?: number;
  /** Horizontal scale. `1` is neutral. */
  scaleX?: number;
  /** Vertical scale. `1` is neutral. */
  scaleY?: number;
  /** Rotation angle, typically a string such as `"45deg"`. */
  rotate?: AnimateScalar;
  /** X-axis 3D rotation angle. */
  rotateX?: AnimateScalar;
  /** Y-axis 3D rotation angle. */
  rotateY?: AnimateScalar;
  /** Z-axis rotation angle. */
  rotateZ?: AnimateScalar;
  /** X-axis skew angle. */
  skewX?: AnimateScalar;
  /** Y-axis skew angle. */
  skewY?: AnimateScalar;
}

/**
 * Explicit animatable style object used by `{ from, to }` animations.
 *
 * Non-interpolatable layout/display styles are intentionally excluded.
 */
export interface AnimateStyle extends AnimateTransformStyle {
  /** Opacity from `0` to `1`. */
  opacity?: number;

  width?: AnimateDimension;
  height?: AnimateDimension;
  minWidth?: AnimateDimension;
  minHeight?: AnimateDimension;
  maxWidth?: AnimateDimension;
  maxHeight?: AnimateDimension;

  top?: AnimateDimension;
  right?: AnimateDimension;
  bottom?: AnimateDimension;
  left?: AnimateDimension;

  margin?: AnimateDimension;
  marginTop?: AnimateDimension;
  marginRight?: AnimateDimension;
  marginBottom?: AnimateDimension;
  marginLeft?: AnimateDimension;
  marginHorizontal?: AnimateDimension;
  marginVertical?: AnimateDimension;

  padding?: AnimateDimension;
  paddingTop?: AnimateDimension;
  paddingRight?: AnimateDimension;
  paddingBottom?: AnimateDimension;
  paddingLeft?: AnimateDimension;
  paddingHorizontal?: AnimateDimension;
  paddingVertical?: AnimateDimension;

  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;

  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;

  backgroundColor?: AnimateColor;
  borderColor?: AnimateColor;
  borderTopColor?: AnimateColor;
  borderRightColor?: AnimateColor;
  borderBottomColor?: AnimateColor;
  borderLeftColor?: AnimateColor;

  transform?: ViewStyle["transform"];
}

export interface AnimateTimingOptions {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** Easing token. Unknown values fall back to STRX's safe default easing. */
  easing?: AnimateEasingToken | (string & {});
  /** Legacy repeat count. Prefer `playCount` for new code. */
  repeat?: number | "infinite";
  /** Total number of times to play the animation. */
  playCount?: number | "infinite";
}

/**
 * How an array of animation entries is orchestrated.
 *
 * - `parallel`: start together.
 * - `serial`: each entry waits for the previous delay + duration.
 * - `stagger`: each entry starts at `interval` offsets; previous explicit delays also push later entries.
 */
export type PlaybackMode = "parallel" | "serial" | "stagger";

export type PresetAnimateObject = AnimateTimingOptions & {
  /** Built-in or custom preset token name. */
  type: AnimatePresetToken | (string & {});
  from?: never;
  to?: never;
};

export type CustomFromToAnimateObject = AnimateTimingOptions & {
  type?: never;
  /** Initial keyframe style. */
  from: AnimateStyle;
  /** Target keyframe style. */
  to: AnimateStyle;
};

export type AnimateObject = PresetAnimateObject | CustomFromToAnimateObject;

export type AnimateEntry = AnimateToken | AnimateObject;

export type AnimateValue = AnimateEntry | readonly AnimateValue[];

/**
 * Value accepted by every STRX `animate` prop.
 *
 * Supports token strings, preset objects, `{ from, to }` objects, and nested arrays.
 */
export type AnimateProp = AnimateValue;
