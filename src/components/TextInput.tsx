import type React from 'react';
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { createStrxComponent } from './createStrxComponent';

export interface CodexTextInputProps extends RNTextInputProps {}

export const TextInput = createStrxComponent<
  CodexTextInputProps,
  React.ElementRef<typeof RNTextInput>
>(RNTextInput, { displayName: 'CodexAnimatedTextInput' });
