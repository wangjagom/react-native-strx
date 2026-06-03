import type React from 'react';
import {
  ScrollView as RNScrollView,
  type ScrollViewProps as RNScrollViewProps,
} from 'react-native';

import { createStrxComponent } from './createStrxComponent';

export interface CodexScrollViewProps extends RNScrollViewProps {}

export const ScrollView = createStrxComponent<
  CodexScrollViewProps,
  React.ElementRef<typeof RNScrollView>
>(RNScrollView, { displayName: 'CodexAnimatedScrollView' });
