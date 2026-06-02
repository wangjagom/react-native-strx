# Core

This folder will contain the React Native Reanimated integration layer.

Planned responsibilities:

- Convert normalized animation definitions into Reanimated shared values/styles.
- Provide composition helpers for presets such as `fade-in` and `slide-up`.
- Keep runtime animation behavior separate from parsing and TypeScript declarations.

`useCodexAnimation.ts` contains the first Reanimated runtime hook.
`interop.tsx` contains the first animated `View` wrapper.
`presets.ts` contains the built-in animation preset dictionary.

## Runtime Sketch

```tsx
import { View } from '../src';

export function Example() {
  return (
    <View animate="fade-in duration-300, slide-up delay-100">
      ...
    </View>
  );
}
```

Built-in presets:

- `fade-in`: animates `opacity` from `0` to `1`.
- `fade-out`: animates `opacity` from `1` to `0`.
- `slide-up`: animates `translateY` from `24` to `0`.
- `slide-down`: animates `translateY` from `-24` to `0`.
- `slide-left`: animates `translateX` from `24` to `0`.
- `slide-right`: animates `translateX` from `-24` to `0`.
- `scale-up`: animates `scale` from `0.92` to `1`.
- `scale-in`: alias-style scale entrance from `0.92` to `1`.
- `scale-down`: animates `scale` from `1.08` to `1`.
- `scale-out`: scale exit from `1` to `0.92`.
- `bounce`: spring-animates `translateY` and `scale`.

When multiple presets are provided, channel-specific values are merged into a
single animated style object. For example, `fade-in` and `slide-up` produce one
style with both `opacity` and `transform: [{ translateY }]`.
