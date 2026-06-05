import { Image } from "./components/Image";
import { Pressable } from "./components/Pressable";
import { ScrollView } from "./components/ScrollView";
import { Text } from "./components/Text";
import { TextInput } from "./components/TextInput";
import { Timeline } from "./components/Timeline";
import { View } from "./components/View";
import { useTimeline } from "./core/useTimeline";
import { LayoutGroup } from "./context/LayoutGroupContext";
import { StrxLayoutRoot } from "./context/StrxLayoutContext";

export { Image } from "./components/Image";
export type { CodexImageProps } from "./components/Image";
export { Pressable } from "./components/Pressable";
export type { CodexPressableProps } from "./components/Pressable";
export { ScrollView } from "./components/ScrollView";
export type { CodexScrollViewProps } from "./components/ScrollView";
export { Text } from "./components/Text";
export type { CodexTextProps } from "./components/Text";
export { TextInput } from "./components/TextInput";
export type { CodexTextInputProps } from "./components/TextInput";
export { Timeline } from "./components/Timeline";
export type { TimelineProps } from "./components/Timeline";
export { View } from "./components/View";
export type { CodexViewProps, LayoutPropagationMode } from "./components/View";
export { LayoutGroup, useLayoutGroup } from "./context/LayoutGroupContext";
export { LayoutNodeContext, useLayoutNode } from "./context/LayoutNodeContext";
export { StrxLayoutRoot, useStrxLayout } from "./context/StrxLayoutContext";
export type {
  StrxLayoutContextType,
  StrxLayoutDemand,
  StrxLayoutPropagationMode,
  StrxLayoutTransitionType,
  StrxMeasuredNode,
} from "./context/StrxLayoutContext";
export type {
  LayoutNodeContextType,
  LayoutTransitionType,
} from "./context/LayoutNodeContext";
export type {
  LayoutGroupContextValue,
  LayoutGroupProps,
  LayoutGroupTransition,
  LayoutTransitionBuilder,
} from "./context/LayoutGroupContext";
export { animationPresets } from "./core/presets";
export type {
  AnimatableChannel,
  BuiltInAnimationPreset,
  CodexAnimationPreset,
  PresetMotionOptions,
} from "./core/presets";
export {
  compileCodexAnimation,
  estimateCodexAnimationDuration,
  useCodexAnimation,
  useCodexAnimationEngine,
} from "./core/useCodexAnimation";
export type {
  CodexAnimationController,
  CodexAnimationEngine,
  CodexAnimationPlayOptions,
  CodexCompiledAnimation,
} from "./core/useCodexAnimation";
export { useTimeline } from "./core/useTimeline";
export type {
  StrxTimelineController,
  StrxTimelinePlayable,
  UseTimelineOptions,
} from "./core/useTimeline";
export { normalizeAnimate } from "./parser/normalize";
export type { StandardAnimConfig } from "./parser/normalize";
export type {
  AnimateLayoutToken,
  AnimateEntry,
  AnimateObject,
  AnimateProp,
  AnimateToken,
  AnimateValue,
  PlaybackMode,
} from "./types/animate";

export { createStrxComponent } from "./components/createStrxComponent";
export type {
  StrxComponentOptions,
  StrxComponentProps,
} from "./components/createStrxComponent";
export { Image as StrxImage } from "./components/Image";
export { ScrollView as StrxScrollView } from "./components/ScrollView";
export { TextInput as StrxTextInput } from "./components/TextInput";
export { Timeline as StrxTimeline } from "./components/Timeline";
export { View as StrxView } from "./components/View";
export { Text as StrxText } from "./components/Text";
export { Pressable as StrxPressable } from "./components/Pressable";

/**
 * Namespace API for STRX primitives.
 *
 * This is the recommended import style:
 *
 * ```tsx
 * import { Strx } from "react-native-strx";
 *
 * <Strx.View animate="fade-in layout-spring" />
 * ```
 */
export const Strx = Object.freeze({
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  Timeline,
  LayoutRoot: StrxLayoutRoot,
  LayoutGroup,
  useTimeline,
});
