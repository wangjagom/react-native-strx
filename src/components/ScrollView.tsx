import type React from 'react';
import {
  ScrollView as RNScrollView,
  type ScrollViewProps as RNScrollViewProps,
} from 'react-native';

import {
  createStrxComponent,
  type StrxComponentProps,
} from './createStrxComponent';

/**
 * Props for `Strx.ScrollView`.
 *
 * Includes the normal React Native `ScrollView` props, such as
 * `contentContainerStyle`, `horizontal`, `onScroll`, and refresh props, plus
 * STRX animation props.
 */
export type CodexScrollViewProps = StrxComponentProps<RNScrollViewProps>;

/**
 * Animated STRX scroll container.
 *
 * Use it when scrollable content should participate in STRX layout context or
 * when the scroll container itself needs entrance, style, or layout animation.
 */
export const ScrollView = createStrxComponent<
  RNScrollViewProps,
  React.ElementRef<typeof RNScrollView>
>(RNScrollView, { displayName: 'CodexAnimatedScrollView' });
