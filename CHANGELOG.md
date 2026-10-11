# react-native-strx

## 1.0.0-beta.0

### Major Changes

- f892dca: Unify `animate` parsing into a single parser shared by components, the animation engine, `Strx.Timeline`, and `Strx.useTimeline`.

  - `exit:` tokens no longer leak into the `to` frame of timeline animations.
  - One number grammar everywhere: unsigned decimals, `opacity-*` clamped to 0–100, exponent/hex values rejected.
  - Token order within a group no longer matters (`layout-spring fade-in` now plays `fade-in`).
  - A preset and `from:/to:` keyframes in the same group combine, with keyframes overriding per channel.
  - Duration precedence is now token → preset default → `Strx.Provider` → 300ms (previously the provider overrode preset defaults).
  - New `spring`, `damping-*`, `stiffness-*`, `mass-*` tokens; spring options on animation objects are respected.
  - `exit:` animations honor easing tokens.
  - `Strx.Timeline` offsets every comma group and adds to existing `delay-*` values instead of replacing them.
  - Unknown tokens are reported once via `console.warn` in development, with suggestions.
  - Strings longer than 512 characters are parsed instead of being silently ignored.
  - New `definePreset(name, preset)` API for registering custom presets.

- ca6eb09: Rewrite the animation engine around progress-driven layers sampled on the UI thread.

  - Requires Reanimated 4.1+ and react-native-worklets 0.5+ (New Architecture). Reanimated 3 is no longer supported.
  - Mount animations render their `from` frame on the first paint instead of relying on a double `requestAnimationFrame`.
  - Style changes with `transition-*` no longer replay entrance animations.
  - Interrupted transitions continue from the values currently on screen instead of jumping.
  - Static transforms are kept while other transform channels animate, and channels are handed back to the static style when an animation is removed.
  - `timeline.stop()` freezes animations in place; `timeline.reverse()` continues from the current position.
  - `useTimeline` `onComplete` fires from real animation completion callbacks, and not for stopped, reset, or replaced runs.
  - Controller `play`/`reverse` accept an `onFinish` callback.

- b4ac41d: Simplify layout transitions.

  - Components without a `layout-*` token or an inherited transition no longer receive a Reanimated `layout` prop, removing layout-animation overhead from plain animated components.
  - Layout transitions are inherited only downward through context: from the nearest STRX ancestor with a layout transition or the nearest `Strx.LayoutGroup` (the nearest group wins). Children no longer make their parents animate; put the token on the container or use `Strx.LayoutGroup`.
  - `layoutPropagation="none"` now means "ignore inherited layout transitions".
  - `layout-linear` and `layout-fade` honor `duration-*` tokens and the provider duration.
  - Removed the unused layout node registry and per-render child tree scan: `StrxLayoutContextType` no longer has `registerNode`, `unregisterNode`, `publishLayoutDemand`, `getNode`, or `isNodeInfluenced`; `LayoutGroupContextValue` no longer has `isInsideGroup`, `layoutKey`, or `triggerReflow`; the `StrxLayoutDemand`, `StrxMeasuredNode`, and `LayoutTransitionBuilder` types were removed.
  - `Strx.Text` and `Strx.Pressable` now support `exit:` animations.
  - Unmounting a component with a duplicate `strxId` no longer unregisters the other component's timeline target.
  - Exit animations are skipped under reduce motion.

- ebca5df: Clean up the public API for v1.

  Renamed (old names removed):

  | 0.1.x                                                                                                                       | 1.0                                                                                                                   |
  | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
  | `CodexViewProps`, `CodexTextProps`, `CodexPressableProps`, `CodexImageProps`, `CodexScrollViewProps`, `CodexTextInputProps` | `StrxViewProps`, `StrxTextProps`, `StrxPressableProps`, `StrxImageProps`, `StrxScrollViewProps`, `StrxTextInputProps` |
  | `TimelineProps`                                                                                                             | `StrxTimelineProps`                                                                                                   |
  | `CodexAnimationPreset`                                                                                                      | `StrxPreset`                                                                                                          |
  | `Strx.LayoutRoot`, `StrxLayoutRoot`                                                                                         | `Strx.TimelineRoot`, `StrxTimelineRoot`                                                                               |
  | `Strx.DebugOverlay`, `<Strx.Provider debug>`                                                                                | `StrxDebugOverlay` from `react-native-strx/debug`                                                                     |

  Removed:

  - Plain component exports that shadow React Native names (`View`, `Text`, `Pressable`, `Image`, `ScrollView`, `TextInput`, `Timeline`, `Provider`). Use the `Strx` namespace or `StrxView`-style named exports.
  - `Strx.Provider` props `debug`, `debugPosition`, `debugInitialExpanded`, `debugShowMotionPreview`, and the `debug` field of the motion context.
  - The global `react-native` `ViewProps` augmentation, so `animate` on a plain React Native `View` is now a type error instead of being silently ignored.
  - Low-level exports: `useCodexAnimation`, `useCodexAnimationEngine`, `compileCodexAnimation`, `reverseCodexAnimation`, `estimateCodexAnimationDuration`, `estimateCodexAnimationDelay`, the `Codex*` engine/controller types, `normalizeAnimate`, `clearNormalizeAnimateCache`, `getNormalizeAnimateCacheSize`, `StandardAnimConfig`, `LayoutNodeContext`, `useLayoutNode`, `StrxMotionProvider`, `useStrxLayout`, and `StrxLayoutContextType`.

  Fixed:

  - `Strx.Pressable` function styles (`({ pressed }) => ...`) now work with `transition-*` tokens.
  - `Strx.Pressable` passes layout transitions to its children and supports `layoutClip` and `layoutPropagation`.
  - `animationPresets` is exported as a read-only record; use `definePreset` to add presets.

### Patch Changes

- 7cdedf6: Ship compiled `lib/` output built with react-native-builder-bob and generated type declarations instead of raw TypeScript sources with a hand-written `index.d.ts`. Public exports are unchanged.
