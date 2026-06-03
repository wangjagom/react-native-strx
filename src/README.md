# Source Structure

Current project shape:

```text
src/
  types/
    animate.d.ts
    index.d.ts
    react-native.d.ts
  parser/
    normalize.ts
    README.md
  core/
    presets.ts
    useCodexAnimation.ts
    interop.tsx
    README.md
  components/
    View.tsx
    Text.tsx
    Pressable.tsx
    Image.tsx
    ScrollView.tsx
    TextInput.tsx
    createStrxComponent.tsx
  index.ts
App.tsx
```

`src/types` owns public TypeScript contracts and React Native module augmentation.
`src/parser` will own Tailwind-like string parsing.
`src/core` will own the Reanimated runtime implementation.
`src/components` owns STRX component wrappers and the `createStrxComponent` adapter factory.
