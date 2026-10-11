import type React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import {
  createStrxComponent,
  type StrxComponentProps,
} from './createStrxComponent';

/**
 * Props for `Strx.Text`.
 *
 * Includes the normal React Native `Text` props, such as `children`, `style`,
 * `numberOfLines`, and accessibility props, plus STRX animation props.
 */
export interface StrxTextProps extends StrxComponentProps<RNTextProps> {}

/**
 * Animated STRX text component.
 *
 * Use it anywhere you would normally use React Native `Text` when the text
 * should fade, slide, transition style changes, exit, or follow inherited
 * layout transitions.
 */
export const Text = createStrxComponent<
  RNTextProps,
  React.ElementRef<typeof RNText>
>(RNText, { displayName: 'Strx.Text', nativeView: false });
