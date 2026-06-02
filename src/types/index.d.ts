import './react-native';

import { Pressable } from '../components/Pressable';
import { Text } from '../components/Text';
import { View } from '../components/View';
import { LayoutGroup } from '../context/LayoutGroupContext';
import { StrxLayoutRoot } from '../context/StrxLayoutContext';

export { Pressable } from '../components/Pressable';
export type { CodexPressableProps } from '../components/Pressable';
export { Text } from '../components/Text';
export type { CodexTextProps } from '../components/Text';
export { View } from '../components/View';
export type { CodexViewProps, LayoutPropagationMode } from '../components/View';
export { LayoutGroup, useLayoutGroup } from '../context/LayoutGroupContext';
export { LayoutNodeContext, useLayoutNode } from '../context/LayoutNodeContext';
export { StrxLayoutRoot, useStrxLayout } from '../context/StrxLayoutContext';
export type {
  StrxLayoutContextType,
  StrxLayoutDemand,
  StrxLayoutPropagationMode,
  StrxLayoutTransitionType,
  StrxMeasuredNode,
} from '../context/StrxLayoutContext';
export type {
  LayoutNodeContextType,
  LayoutTransitionType,
} from '../context/LayoutNodeContext';
export type {
  LayoutGroupContextValue,
  LayoutGroupProps,
  LayoutGroupTransition,
  LayoutTransitionBuilder,
} from '../context/LayoutGroupContext';
export { animationPresets } from '../core/presets';
export type {
  AnimatableChannel,
  BuiltInAnimationPreset,
  CodexAnimationPreset,
  PresetMotionOptions,
} from '../core/presets';
export { useCodexAnimation } from '../core/useCodexAnimation';
export { normalizeAnimate } from '../parser/normalize';
export type { StandardAnimConfig } from '../parser/normalize';
export type {
  AnimateEasing,
  AnimateLayoutToken,
  AnimateEntry,
  AnimateObject,
  AnimatePresetType,
  AnimateProp,
  AnimateScalar,
  AnimateStyle,
  AnimateToken,
  AnimateTransitionToken,
  AnimateTransformStyle,
  AnimateValue,
  CustomFromToAnimateObject,
  PresetAnimateObject,
} from './animate';

export { View as StrxView } from '../components/View';
export { Text as StrxText } from '../components/Text';
export { Pressable as StrxPressable } from '../components/Pressable';

export declare const Strx: Readonly<{
  View: typeof View;
  Text: typeof Text;
  Pressable: typeof Pressable;
  LayoutRoot: typeof StrxLayoutRoot;
  LayoutGroup: typeof LayoutGroup;
}>;
