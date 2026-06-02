import type { ViewStyle } from 'react-native';

export type AnimateLayoutToken =
  | 'layout-linear'
  | 'layout-spring'
  | 'layout-fade'
  | 'layout-spring-stiff'
  | 'layout-spring-bouncy';

export type AnimatePrefixedToken =
  | `from:${string}`
  | `to:${string}`
  | `exit:${string}`;

export type AnimateTransitionToken =
  | 'transition'
  | 'transition-all'
  | 'transition-colors'
  | 'transition-opacity'
  | 'transition-transform'
  | 'transition-spacing'
  | 'transition-layout';

export type AnimateToken =
  | AnimateLayoutToken
  | AnimatePrefixedToken
  | AnimateTransitionToken
  | (string & {});

export type AnimatePresetType =
  | 'fade-in'
  | 'fade-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in'
  | 'scale-out'
  | 'scale-up'
  | 'scale-down'
  | 'bounce';

export type AnimateEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';

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
  transform?: ViewStyle['transform'];
}

export interface AnimateTimingOptions {
  duration?: number;
  delay?: number;
  easing?: AnimateEasing | (string & {});
  repeat?: number | 'infinite';
}

export type PresetAnimateObject = AnimateTimingOptions & {
  type: AnimatePresetType | (string & {});
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
