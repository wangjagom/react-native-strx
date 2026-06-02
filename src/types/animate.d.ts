import type { ViewStyle } from 'react-native';

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

export type AnimateLayoutToken =
  | 'layout-linear'
  | 'layout-spring'
  | 'layout-fade'
  | 'layout-spring-stiff'
  | 'layout-spring-bouncy';

export type AnimateTransitionToken =
  | 'transition'
  | 'transition-all'
  | 'transition-colors'
  | 'transition-opacity'
  | 'transition-transform'
  | 'transition-spacing'
  | 'transition-layout';

export type AnimateTimingToken =
  | `duration-${number}`
  | `delay-${number}`
  | `repeat-${number}`
  | 'repeat-infinite'
  | AnimateEasing;

export type AnimateCommonTimingToken =
  | 'duration-75'
  | 'duration-100'
  | 'duration-150'
  | 'duration-200'
  | 'duration-250'
  | 'duration-300'
  | 'duration-500'
  | 'duration-700'
  | 'duration-1000'
  | 'delay-75'
  | 'delay-100'
  | 'delay-150'
  | 'delay-200'
  | 'delay-300'
  | 'delay-500'
  | 'repeat-1'
  | 'repeat-2'
  | 'repeat-3'
  | 'repeat-infinite'
  | AnimateEasing;

export type AnimateOpacityUtilityToken =
  | 'opacity-0'
  | 'opacity-5'
  | 'opacity-10'
  | 'opacity-15'
  | 'opacity-20'
  | 'opacity-25'
  | 'opacity-30'
  | 'opacity-35'
  | 'opacity-40'
  | 'opacity-45'
  | 'opacity-50'
  | 'opacity-55'
  | 'opacity-60'
  | 'opacity-65'
  | 'opacity-70'
  | 'opacity-75'
  | 'opacity-80'
  | 'opacity-85'
  | 'opacity-90'
  | 'opacity-95'
  | 'opacity-100'
  | `opacity-${number}`;

export type AnimateTransformUtilityToken =
  | `translate-x-${number}`
  | `-translate-x-${number}`
  | `translate-y-${number}`
  | `-translate-y-${number}`
  | `scale-${number}`
  | `scale-x-${number}`
  | `scale-y-${number}`
  | `rotate-${number}`
  | `-rotate-${number}`;

export type AnimateDimensionUtilityToken = `w-${number}` | `h-${number}`;

export type AnimateUtilityToken =
  | AnimateOpacityUtilityToken
  | AnimateTransformUtilityToken
  | AnimateDimensionUtilityToken;

export type AnimatePrefixedToken =
  | `from:${AnimateUtilityToken}`
  | `to:${AnimateUtilityToken}`
  | `exit:${AnimateUtilityToken}`
  | `from:${string}`
  | `to:${string}`
  | `exit:${string}`;

export type AnimateAutocompleteToken =
  | AnimatePresetType
  | AnimateLayoutToken
  | AnimateTransitionToken
  | AnimateCommonTimingToken
  | `from:${AnimateUtilityToken}`
  | `to:${AnimateUtilityToken}`
  | `exit:${AnimateUtilityToken}`;

export type AnimateKnownToken =
  | AnimatePresetType
  | AnimateLayoutToken
  | AnimatePrefixedToken
  | AnimateTransitionToken
  | AnimateTimingToken;

export type AnimateTokenList =
  | AnimateAutocompleteToken
  | `${AnimateAutocompleteToken} ${string}`;

export type AnimateToken =
  | AnimateTokenList
  | AnimateKnownToken
  | (string & {});

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
