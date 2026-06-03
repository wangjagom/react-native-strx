import type React from 'react';
import { Image as RNImage, type ImageProps as RNImageProps } from 'react-native';

import { createStrxComponent } from './createStrxComponent';

export interface CodexImageProps extends RNImageProps {}

export const Image = createStrxComponent<
  CodexImageProps,
  React.ElementRef<typeof RNImage>
>(RNImage, { displayName: 'CodexAnimatedImage' });
