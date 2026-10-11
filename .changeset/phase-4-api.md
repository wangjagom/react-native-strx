---
'react-native-strx': major
---

Clean up the public API for v1.

Renamed (old names removed):

| 0.1.x | 1.0 |
| --- | --- |
| `CodexViewProps`, `CodexTextProps`, `CodexPressableProps`, `CodexImageProps`, `CodexScrollViewProps`, `CodexTextInputProps` | `StrxViewProps`, `StrxTextProps`, `StrxPressableProps`, `StrxImageProps`, `StrxScrollViewProps`, `StrxTextInputProps` |
| `TimelineProps` | `StrxTimelineProps` |
| `CodexAnimationPreset` | `StrxPreset` |
| `Strx.LayoutRoot`, `StrxLayoutRoot` | `Strx.TimelineRoot`, `StrxTimelineRoot` |
| `Strx.DebugOverlay`, `<Strx.Provider debug>` | `StrxDebugOverlay` from `react-native-strx/debug` |

Removed:

- Plain component exports that shadow React Native names (`View`, `Text`, `Pressable`, `Image`, `ScrollView`, `TextInput`, `Timeline`, `Provider`). Use the `Strx` namespace or `StrxView`-style named exports.
- `Strx.Provider` props `debug`, `debugPosition`, `debugInitialExpanded`, `debugShowMotionPreview`, and the `debug` field of the motion context.
- The global `react-native` `ViewProps` augmentation, so `animate` on a plain React Native `View` is now a type error instead of being silently ignored.
- Low-level exports: `useCodexAnimation`, `useCodexAnimationEngine`, `compileCodexAnimation`, `reverseCodexAnimation`, `estimateCodexAnimationDuration`, `estimateCodexAnimationDelay`, the `Codex*` engine/controller types, `normalizeAnimate`, `clearNormalizeAnimateCache`, `getNormalizeAnimateCacheSize`, `StandardAnimConfig`, `LayoutNodeContext`, `useLayoutNode`, `StrxMotionProvider`, `useStrxLayout`, and `StrxLayoutContextType`.

Fixed:

- `Strx.Pressable` function styles (`({ pressed }) => ...`) now work with `transition-*` tokens.
- `Strx.Pressable` passes layout transitions to its children and supports `layoutClip` and `layoutPropagation`.
- `animationPresets` is exported as a read-only record; use `definePreset` to add presets.
