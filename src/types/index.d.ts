import './react-native';

import { Image } from '../components/Image';
import { Pressable } from '../components/Pressable';
import { ScrollView } from '../components/ScrollView';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { View } from '../components/View';
import { LayoutGroup } from '../context/LayoutGroupContext';
import { StrxLayoutRoot } from '../context/StrxLayoutContext';

export { Image } from '../components/Image';
export type { CodexImageProps } from '../components/Image';
export { Pressable } from '../components/Pressable';
export type { CodexPressableProps } from '../components/Pressable';
export { ScrollView } from '../components/ScrollView';
export type { CodexScrollViewProps } from '../components/ScrollView';
export { Text } from '../components/Text';
export type { CodexTextProps } from '../components/Text';
export { TextInput } from '../components/TextInput';
export type { CodexTextInputProps } from '../components/TextInput';
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

export { createStrxComponent } from '../components/createStrxComponent';
export type { StrxComponentOptions, StrxComponentProps } from '../components/createStrxComponent';
export { Image as StrxImage } from '../components/Image';
export { ScrollView as StrxScrollView } from '../components/ScrollView';
export { TextInput as StrxTextInput } from '../components/TextInput';
export { View as StrxView } from '../components/View';
export { Text as StrxText } from '../components/Text';
export { Pressable as StrxPressable } from '../components/Pressable';

export declare const Strx: Readonly<{
  View: typeof View;
  Text: typeof Text;
  Pressable: typeof Pressable;
  Image: typeof Image;
  ScrollView: typeof ScrollView;
  TextInput: typeof TextInput;
  LayoutRoot: typeof StrxLayoutRoot;
  LayoutGroup: typeof LayoutGroup;
}>;
