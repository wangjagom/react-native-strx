import "./react-native";

import { Image } from "../components/Image";
import { Pressable } from "../components/Pressable";
import { ScrollView } from "../components/ScrollView";
import { Text } from "../components/Text";
import { TextInput } from "../components/TextInput";
import { Timeline } from "../components/Timeline";
import { View } from "../components/View";
import { useTimeline } from "../core/useTimeline";
import { LayoutGroup } from "../context/LayoutGroupContext";
import { StrxLayoutRoot } from "../context/StrxLayoutContext";

export { Image } from "../components/Image";
export type { CodexImageProps } from "../components/Image";
export { Pressable } from "../components/Pressable";
export type { CodexPressableProps } from "../components/Pressable";
export { ScrollView } from "../components/ScrollView";
export type { CodexScrollViewProps } from "../components/ScrollView";
export { Text } from "../components/Text";
export type { CodexTextProps } from "../components/Text";
export { TextInput } from "../components/TextInput";
export type { CodexTextInputProps } from "../components/TextInput";
export { Timeline } from "../components/Timeline";
export type { TimelineProps } from "../components/Timeline";
export { View } from "../components/View";
export type { CodexViewProps, LayoutPropagationMode } from "../components/View";
export { LayoutGroup, useLayoutGroup } from "../context/LayoutGroupContext";
export { LayoutNodeContext, useLayoutNode } from "../context/LayoutNodeContext";
export { StrxLayoutRoot, useStrxLayout } from "../context/StrxLayoutContext";
export type {
  StrxLayoutContextType,
  StrxLayoutDemand,
  StrxLayoutPropagationMode,
  StrxLayoutTransitionType,
  StrxMeasuredNode,
} from "../context/StrxLayoutContext";
export type {
  LayoutNodeContextType,
  LayoutTransitionType,
} from "../context/LayoutNodeContext";
export type {
  LayoutGroupContextValue,
  LayoutGroupProps,
  LayoutGroupTransition,
  LayoutTransitionBuilder,
} from "../context/LayoutGroupContext";
export { animationPresets } from "../core/presets";
export type {
  AnimatableChannel,
  BuiltInAnimationPreset,
  CodexAnimationPreset,
  PresetMotionOptions,
} from "../core/presets";
export {
  compileCodexAnimation,
  estimateCodexAnimationDuration,
  useCodexAnimation,
  useCodexAnimationEngine,
} from "../core/useCodexAnimation";
export type {
  CodexAnimationController,
  CodexAnimationEngine,
  CodexAnimationPlayOptions,
  CodexCompiledAnimation,
} from "../core/useCodexAnimation";
export { useTimeline } from "../core/useTimeline";
export type {
  StrxTimelineController,
  StrxTimelinePlayable,
  UseTimelineOptions,
} from "../core/useTimeline";
export { normalizeAnimate } from "../parser/normalize";
export type { StandardAnimConfig } from "../parser/normalize";
export type {
  AnimateLayoutToken,
  AnimateEntry,
  AnimateObject,
  AnimateProp,
  AnimateScalar,
  AnimateStyle,
  AnimateToken,
  AnimateTransitionToken,
  AnimateTransformStyle,
  AnimateValue,
  CustomFromToAnimateObject,
  PlaybackMode,
  PresetAnimateObject,
} from "./animate";

export { createStrxComponent } from "../components/createStrxComponent";
export type {
  StrxComponentOptions,
  StrxComponentProps,
} from "../components/createStrxComponent";
export { Image as StrxImage } from "../components/Image";
export { ScrollView as StrxScrollView } from "../components/ScrollView";
export { TextInput as StrxTextInput } from "../components/TextInput";
export { Timeline as StrxTimeline } from "../components/Timeline";
export { View as StrxView } from "../components/View";
export { Text as StrxText } from "../components/Text";
export { Pressable as StrxPressable } from "../components/Pressable";

/**
 * Namespace API for STRX primitives.
 *
 * Prefer this import style when writing app code so animated STRX components
 * stay visually distinct from React Native built-ins:
 *
 * ```tsx
 * import { Strx } from "react-native-strx";
 *
 * <Strx.View animate="fade-in layout-spring" />
 * ```
 */
export declare const Strx: Readonly<{
  /**
   * Animated container component.
   *
   * Accepts React Native `View` props plus STRX props such as `animate`,
   * `layoutClip`, `layoutPropagation`, `playback`, `interval`, and `strxId`.
   */
  View: typeof View;
  /**
   * Animated text component.
   *
   * Accepts React Native `Text` props plus STRX animation and timeline props.
   */
  Text: typeof Text;
  /**
   * Animated press target.
   *
   * Accepts React Native `Pressable` props, including event callbacks such as
   * `onPress`, plus STRX animation and timeline props.
   */
  Pressable: typeof Pressable;
  /**
   * Animated image component.
   *
   * Accepts React Native `Image` props plus STRX animation and layout props.
   */
  Image: typeof Image;
  /**
   * Animated scroll container.
   *
   * Accepts React Native `ScrollView` props plus STRX animation and layout
   * context props.
   */
  ScrollView: typeof ScrollView;
  /**
   * Animated text input component.
   *
   * Accepts React Native `TextInput` props, including text/focus callbacks,
   * plus STRX animation and timeline props.
   */
  TextInput: typeof TextInput;
  /**
   * Render-time choreography wrapper that injects timing into child `animate`
   * props.
   */
  Timeline: typeof Timeline;
  /**
   * Provider required for event timelines and layout propagation registry.
   */
  LayoutRoot: typeof StrxLayoutRoot;
  /**
   * Provider that gives descendants a shared default layout transition.
   */
  LayoutGroup: typeof LayoutGroup;
  /**
   * Hook for event-driven animation timelines controlled by `play`, `reset`,
   * and `stop`.
   */
  useTimeline: typeof useTimeline;
}>;
