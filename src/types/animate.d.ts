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

export type AnimateEasingToken =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";

export type AnimateLayoutToken =
  | "layout-linear"
  | "layout-spring"
  | "layout-fade"
  | "layout-spring-stiff"
  | "layout-spring-bouncy";

export type AnimateTransitionToken =
  | "transition"
  | "transition-all"
  | "transition-colors"
  | "transition-opacity"
  | "transition-transform"
  | "transition-spacing"
  | "transition-layout";

export type AnimateTimingToken =
  | `duration-${number}`
  | `delay-${number}`
  | `repeat-${number}`
  | "repeat-infinite"
  | AnimateEasingToken;

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

export type AnimateScalar = number | string;
export type AnimateDimension = number | `${number}%`;
export type AnimateColor = string;

export interface AnimateTransformStyle {
  perspective?: number;
  translateX?: AnimateScalar;
  translateY?: AnimateScalar;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: AnimateScalar;
  rotateX?: AnimateScalar;
  rotateY?: AnimateScalar;
  rotateZ?: AnimateScalar;
  skewX?: AnimateScalar;
  skewY?: AnimateScalar;
}

export interface AnimateStyle extends AnimateTransformStyle {
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
  duration?: number;
  delay?: number;
  easing?: AnimateEasingToken | (string & {});
  repeat?: number | "infinite";
}

export type PresetAnimateObject = AnimateTimingOptions & {
  type: AnimatePresetToken | (string & {});
  from?: never;
  to?: never;
};

export type CustomFromToAnimateObject = AnimateTimingOptions & {
  type?: never;
  from: AnimateStyle;
  to: AnimateStyle;
};

export type AnimateObject = PresetAnimateObject | CustomFromToAnimateObject;

export type AnimateEntry = AnimateToken | AnimateObject;

export type AnimateValue = AnimateEntry | readonly AnimateValue[];

export type AnimateProp = AnimateValue;
