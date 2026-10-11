import type React from 'react';
import { View as RNView, type ViewProps as RNViewProps } from 'react-native';

import {
  createStrxComponent,
  type StrxComponentProps,
} from './createStrxComponent';

export type { LayoutPropagationMode } from '../core/layout';

/**
 * Props for `Strx.View`.
 *
 * `Strx.View` keeps the normal React Native `View` API, including props such
 * as `style`, `children`, `onLayout`, and accessibility props, and adds STRX
 * animation props for declarative entrance, exit, style, and layout motion.
 */
export interface CodexViewProps extends StrxComponentProps<RNViewProps> {}

/**
 * Animated STRX container component.
 *
 * Use this as the default wrapper for animated cards, rows, panels, and layout
 * regions. It supports all React Native `View` props plus STRX props such as
 * `animate`, `layoutClip`, `layoutPropagation`, `playback`, `interval`, and
 * `strxId`.
 */
export const View = createStrxComponent<
  RNViewProps,
  React.ElementRef<typeof RNView>
>(RNView, { displayName: 'Strx.View' });
