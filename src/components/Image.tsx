import type React from 'react';
import { Image as RNImage, type ImageProps as RNImageProps } from 'react-native';

import {
  createStrxComponent,
  type StrxComponentProps,
} from './createStrxComponent';

export type CodexImageProps = StrxComponentProps<RNImageProps>;

export const Image = createStrxComponent<
  RNImageProps,
  React.ElementRef<typeof RNImage>
>(RNImage, { displayName: 'CodexAnimatedImage' });
