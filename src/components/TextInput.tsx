import type React from 'react';
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import {
  createStrxComponent,
  type StrxComponentProps,
} from './createStrxComponent';

export type CodexTextInputProps = StrxComponentProps<RNTextInputProps>;

export const TextInput = createStrxComponent<
  RNTextInputProps,
  React.ElementRef<typeof RNTextInput>
>(RNTextInput, { displayName: 'CodexAnimatedTextInput' });
