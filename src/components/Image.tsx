import type React from 'react';
import { Image as RNImage, type ImageProps as RNImageProps } from 'react-native';

import {
  createStrxComponent,
  type StrxComponentProps,
} from './createStrxComponent';

/**
 * Props for `Strx.Image`.
 *
 * Includes the normal React Native `Image` props, such as `source`,
 * `resizeMode`, `onLoad`, `onError`, and `style`, plus STRX animation props.
 */
export type CodexImageProps = StrxComponentProps<RNImageProps>;

/**
 * Animated STRX image component.
 *
 * Use it for image entrance, fade, scale, style transition, and layout
 * transition effects. As with React Native `Image`, provide explicit width and
 * height in `style` unless the parent layout gives the image stable dimensions.
 */
export const Image = createStrxComponent<
  RNImageProps,
  React.ElementRef<typeof RNImage>
>(RNImage, { displayName: 'CodexAnimatedImage' });
