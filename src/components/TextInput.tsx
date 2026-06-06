import type React from 'react';
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import {
  createStrxComponent,
  type StrxComponentProps,
} from './createStrxComponent';

/**
 * Props for `Strx.TextInput`.
 *
 * Includes the normal React Native `TextInput` props, such as `value`,
 * `onChangeText`, `onFocus`, `onBlur`, `placeholder`, and `style`, plus STRX
 * animation props.
 */
export type CodexTextInputProps = StrxComponentProps<RNTextInputProps>;

/**
 * Animated STRX text input component.
 *
 * Use it for focus, validation, color, spacing, and layout transitions while
 * keeping the normal React Native `TextInput` event callbacks.
 */
export const TextInput = createStrxComponent<
  RNTextInputProps,
  React.ElementRef<typeof RNTextInput>
>(RNTextInput, { displayName: 'CodexAnimatedTextInput' });
