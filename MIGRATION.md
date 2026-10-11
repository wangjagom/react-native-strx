# Migrating from 0.1.x to 1.0

`react-native-strx` 1.0 keeps the `animate="..."` token syntax but rebuilds the parser, animation engine, and layout handling. Most apps only need the steps in **Required changes**. The rest of this guide lists behavior that changed so you can check screens that depend on it.

## Required changes

### 1. Upgrade to Reanimated 4

| Package                   | 0.1.x       | 1.0                            |
| ------------------------- | ----------- | ------------------------------ |
| `react`                   | >= 18       | >= 19                          |
| `react-native`            | >= 0.74     | >= 0.78 with New Architecture  |
| `react-native-reanimated` | >= 3        | >= 4.1                         |
| `react-native-worklets`   | optional    | >= 0.5 (required)              |

Use `react-native-worklets/plugin` as the last Babel plugin (Expo's `babel-preset-expo` already includes it). Apps that must stay on Reanimated 3 should stay on `react-native-strx@0.1.x`.

### 2. Rename imports

| 0.1.x                                                                                         | 1.0                                                                                           |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `import { View, Text, ... } from "react-native-strx"`                                         | `import { Strx } from "react-native-strx"` and `Strx.View`, or named `StrxView`, `StrxText`, ... |
| `Strx.LayoutRoot`, `StrxLayoutRoot`                                                           | `Strx.TimelineRoot`, `StrxTimelineRoot`                                                       |
| `Strx.DebugOverlay`, `<Strx.Provider debug>`                                                  | `import { StrxDebugOverlay } from "react-native-strx/debug"`                                 |
| `CodexViewProps`, `CodexTextProps`, `CodexPressableProps`                                     | `StrxViewProps`, `StrxTextProps`, `StrxPressableProps`                                        |
| `CodexImageProps`, `CodexScrollViewProps`, `CodexTextInputProps`                              | `StrxImageProps`, `StrxScrollViewProps`, `StrxTextInputProps`                                 |
| `TimelineProps`                                                                               | `StrxTimelineProps`                                                                           |
| `CodexAnimationPreset`                                                                        | `StrxPreset`                                                                                  |
| `LayoutGroupProps`, `LayoutGroupTransition`                                                   | `StrxLayoutGroupProps`, `StrxLayoutGroupTransition`                                           |
| Mutating `animationPresets[name] = ...`                                                       | `definePreset(name, preset)`                                                                  |

The old names are removed, not deprecated. The plain `View`, `Text`, `Pressable`, `Image`, `ScrollView`, `TextInput`, `Timeline`, and `Provider` exports were removed because they shadowed React Native's own components.

### 3. Move the debug overlay

```tsx
// 0.1.x
<Strx.Provider debug={__DEV__} debugPosition="bottom-left">
  <App />
</Strx.Provider>

// 1.0
import { StrxDebugOverlay } from "react-native-strx/debug";

<Strx.Provider>
  <App />
  {__DEV__ && <StrxDebugOverlay position="bottom-left" />}
</Strx.Provider>;
```

The overlay no longer shows layout node counts, because the layout node registry was removed.

### 4. Fix `animate` on plain React Native components

0.1.x added `animate` to every React Native `ViewProps`, so `<View animate="fade-in" />` from `react-native` type-checked and silently did nothing. That augmentation is gone; TypeScript now reports these places. Replace them with `Strx.View`.

### 5. Removed low-level APIs

These were internal and are no longer exported: `useCodexAnimation`, `useCodexAnimationEngine`, `compileCodexAnimation`, `reverseCodexAnimation`, `estimateCodexAnimationDuration`, `estimateCodexAnimationDelay`, the `Codex*` controller/engine types, `normalizeAnimate`, `clearNormalizeAnimateCache`, `getNormalizeAnimateCacheSize`, `StandardAnimConfig`, `LayoutNodeContext`, `useLayoutNode`, `StrxMotionProvider`, `useStrxLayout`, and `StrxLayoutContextType`. Use `createStrxComponent` to animate custom components and `Strx.useTimeline` for imperative playback. If you depended on one of these, please open an issue describing the use case.

## Behavior changes to check

### Layout transitions

- **Children no longer make their parents animate.** In 0.1.x, a child with a `layout-*` token caused its STRX ancestors to animate layout changes. In 1.0, transitions are only inherited downward. If a container should resize smoothly when its content changes, put the token on the container or wrap the region in `Strx.LayoutGroup`:

  ```tsx
  <Strx.View animate="layout-spring">
    {open && <Strx.Text animate="fade-in">Details</Strx.Text>}
  </Strx.View>
  ```

- `layoutPropagation="none"` now means "ignore inherited layout transitions" for that component and its descendants.
- The nearest `Strx.LayoutGroup` wins over transitions inherited from STRX ancestors outside it.
- Components without a layout transition no longer receive a Reanimated `layout` prop.
- `layout-linear` and `layout-fade` now honor `duration-*` tokens and `Strx.Provider`'s `motionPreset.duration`.
- `Strx.LayoutGroup`'s `duration` only applies to `transition="linear"`; spring groups use spring parameters.

### Token parsing

- **Duration precedence** is now token → the preset's own default → `Strx.Provider` duration → 300ms. In 0.1.x the provider duration overrode preset defaults, so with `motionPreset={{ duration: 200 }}`, `slide-up` now runs 320ms instead of 200ms. Add `duration-*` tokens where you relied on the old behavior.
- Token order inside a group no longer matters: `layout-spring fade-in` now plays `fade-in`.
- A preset and `from:/to:` keyframes in the same group combine, with keyframes overriding per channel. 0.1.x dropped the preset.
- Only one preset per comma group. `fade-in slide-up` plays `fade-in` and warns; use `fade-in, slide-up`.
- Numbers must be unsigned decimals (`300`, `0.5`). Exponents such as `1e3` are rejected, and `opacity-*` is clamped to 0–100.
- `exit:` tokens no longer leak into the `to` frame of `Strx.useTimeline` animations.
- Strings longer than 512 characters are parsed instead of ignored.
- Unknown tokens log a development warning with a suggestion, once per string.
- `Strx.Timeline` applies delay offsets to every comma group and adds them to existing `delay-*` values instead of replacing them.

### Animation engine

- Mount animations render their `from` frame on the first paint.
- Changing `style` on a component with `transition-*` no longer replays its entrance animation.
- Interrupted transitions continue from the values on screen.
- Static transforms are kept while other transform channels animate.
- Removing `animate` hands animated channels back to the static style.
- `timeline.stop()` freezes animations in place (0.1.x effectively let them finish).
- `timeline.reverse()` continues backward from the current position when the animation is already applied.
- `onComplete` fires from real animation completion and is not called after `stop()`, `reset()`, or a newer `play()`/`reverse()`.
- Exit animations honor easing tokens and are skipped under Reduce Motion.

### Components

- `Strx.Text` and `Strx.Pressable` support `exit:` tokens.
- `Strx.Pressable` function styles (`({ pressed }) => ...`) work with `transition-*` tokens, and it passes layout transitions to its children.
- Unmounting one of two components that share a `strxId` no longer unregisters the other.

## New in 1.0

- `definePreset(name, preset)` registers custom presets.
- `spring`, `damping-*`, `stiffness-*`, and `mass-*` tokens.
- `react-native-strx/debug` entry point for `StrxDebugOverlay`.
- Compiled `lib/` output with generated type declarations.
