import { Image } from './components/Image';
import { Pressable } from './components/Pressable';
import { Provider } from './components/Provider';
import { ScrollView } from './components/ScrollView';
import { Text } from './components/Text';
import { TextInput } from './components/TextInput';
import { Timeline } from './components/Timeline';
import { View } from './components/View';
import { LayoutGroup } from './context/LayoutGroupContext';
import { StrxTimelineRoot } from './context/TimelineRegistry';
import {
  animationPresets as presetRegistry,
  type StrxPreset,
} from './core/presets';
import { useTimeline } from './core/useTimeline';

// Components ------------------------------------------------------------------

export { View as StrxView } from './components/View';
export { Text as StrxText } from './components/Text';
export { Pressable as StrxPressable } from './components/Pressable';
export { Image as StrxImage } from './components/Image';
export { ScrollView as StrxScrollView } from './components/ScrollView';
export { TextInput as StrxTextInput } from './components/TextInput';
export { Timeline as StrxTimeline } from './components/Timeline';
export { Provider as StrxProvider } from './components/Provider';
export { LayoutGroup as StrxLayoutGroup } from './context/LayoutGroupContext';
export { StrxTimelineRoot } from './context/TimelineRegistry';
export { createStrxComponent } from './components/createStrxComponent';

export type { StrxViewProps } from './components/View';
export type { StrxTextProps } from './components/Text';
export type { StrxPressableProps } from './components/Pressable';
export type { StrxImageProps } from './components/Image';
export type { StrxScrollViewProps } from './components/ScrollView';
export type { StrxTextInputProps } from './components/TextInput';
export type { StrxTimelineProps } from './components/Timeline';
export type { StrxProviderProps } from './components/Provider';
export type {
  LayoutGroupProps as StrxLayoutGroupProps,
  LayoutGroupTransition as StrxLayoutGroupTransition,
} from './context/LayoutGroupContext';
export type {
  StrxComponentOptions,
  StrxComponentProps,
} from './components/createStrxComponent';
export type { LayoutPropagationMode as StrxLayoutPropagationMode } from './core/layout';
export type { LayoutTransitionType as StrxLayoutTransitionType } from './context/LayoutNodeContext';

// Hooks -----------------------------------------------------------------------

export { useTimeline } from './core/useTimeline';
export type {
  StrxTimelineController,
  StrxTimelinePlayable,
  UseTimelineOptions,
} from './core/useTimeline';
export { useStrxMotion } from './context/StrxMotionContext';
export type {
  StrxEasingName,
  StrxMotionContextValue,
  StrxMotionPreset,
  StrxReduceMotionMode,
} from './context/StrxMotionContext';

// Presets ---------------------------------------------------------------------

export { definePreset } from './core/presets';
export type {
  AnimatableChannel,
  BuiltInAnimationPreset,
  PresetMotionOptions,
  StrxPreset,
} from './core/presets';

/** Registered presets, including built-ins and `definePreset` additions. */
export const animationPresets: Readonly<Record<string, Readonly<StrxPreset>>> =
  presetRegistry;

// Token types -----------------------------------------------------------------

export type {
  AnimateEntry,
  AnimateLayoutToken,
  AnimateObject,
  AnimateProp,
  AnimateScalar,
  AnimateStyle,
  AnimateToken,
  AnimateTransformStyle,
  AnimateTransitionToken,
  AnimateValue,
  CustomFromToAnimateObject,
  PlaybackMode,
  PresetAnimateObject,
} from './types/animate';

// Namespace -------------------------------------------------------------------

/**
 * Namespace API for STRX primitives.
 *
 * Prefer this import style so animated STRX components stay visually
 * distinct from React Native built-ins:
 *
 * ```tsx
 * import { Strx } from "react-native-strx";
 *
 * <Strx.View animate="fade-in layout-spring" />
 * ```
 */
export const Strx: Readonly<{
  /** Animated `View` with STRX animation props. */
  View: typeof View;
  /** Animated `Text` with STRX animation props. */
  Text: typeof Text;
  /**
   * Animated `Pressable`. Function styles such as `({ pressed }) => ...`
   * work with `transition-*` tokens.
   */
  Pressable: typeof Pressable;
  /** Animated `Image` with STRX animation props. */
  Image: typeof Image;
  /** Animated `ScrollView` with STRX animation props. */
  ScrollView: typeof ScrollView;
  /** Animated `TextInput` with STRX animation props. */
  TextInput: typeof TextInput;
  /** Render-time choreography: injects timing into child `animate` props. */
  Timeline: typeof Timeline;
  /** Root provider: motion defaults, reduce motion, and the timeline registry. */
  Provider: typeof Provider;
  /** Timeline registry only, for apps that do not use `Strx.Provider`. */
  TimelineRoot: typeof StrxTimelineRoot;
  /** Gives STRX descendants a shared layout transition. */
  LayoutGroup: typeof LayoutGroup;
  /** Event-driven animation timelines controlled by `play`, `reverse`, `reset`, and `stop`. */
  useTimeline: typeof useTimeline;
}> = Object.freeze({
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  Timeline,
  Provider,
  TimelineRoot: StrxTimelineRoot,
  LayoutGroup,
  useTimeline,
});
