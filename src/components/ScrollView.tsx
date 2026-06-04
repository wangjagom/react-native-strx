import type React from 'react';
import {
  ScrollView as RNScrollView,
  type ScrollViewProps as RNScrollViewProps,
} from 'react-native';

import {
  createStrxComponent,
  type StrxComponentProps,
} from './createStrxComponent';

export type CodexScrollViewProps = StrxComponentProps<RNScrollViewProps>;

export const ScrollView = createStrxComponent<
  RNScrollViewProps,
  React.ElementRef<typeof RNScrollView>
>(RNScrollView, { displayName: 'CodexAnimatedScrollView' });
