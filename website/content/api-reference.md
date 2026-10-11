---
title: API reference
description: Every export of react-native-strx and react-native-strx/debug.
---

## Entry points

| Import path | Contents |
| --- | --- |
| `react-native-strx` | Components, hooks, `definePreset`, types |
| `react-native-strx/debug` | `StrxDebugOverlay` (development only) |
| `react-native-strx/tokens.json` | Token metadata ([schema](editor.html#token-metadata-for-other-tools)) |

## Strx namespace

```tsx
import { Strx } from "react-native-strx";
```

| Member | Docs |
| --- | --- |
| `Strx.View`, `Strx.Text`, `Strx.Pressable`, `Strx.Image`, `Strx.ScrollView`, `Strx.TextInput` | [Components](components.html) |
| `Strx.Timeline` | [Strx.Timeline](timeline.html) |
| `Strx.Provider` | [Provider](provider.html) |
| `Strx.TimelineRoot` | [Provider](provider.html#strxtimelineroot) |
| `Strx.LayoutGroup` | [LayoutGroup](layout-group.html) |
| `Strx.useTimeline` | [useTimeline](use-timeline.html) |

The namespace object is frozen.

## Named exports

### Components

| Export | Same as |
| --- | --- |
| `StrxView` | `Strx.View` |
| `StrxText` | `Strx.Text` |
| `StrxPressable` | `Strx.Pressable` |
| `StrxImage` | `Strx.Image` |
| `StrxScrollView` | `Strx.ScrollView` |
| `StrxTextInput` | `Strx.TextInput` |
| `StrxTimeline` | `Strx.Timeline` |
| `StrxProvider` | `Strx.Provider` |
| `StrxTimelineRoot` | `Strx.TimelineRoot` |
| `StrxLayoutGroup` | `Strx.LayoutGroup` |

### Functions and hooks

| Export | Signature | Docs |
| --- | --- | --- |
| `createStrxComponent` | `(Component, options?) => StrxComponent` | [Custom components](custom-components.html) |
| `useTimeline` | `(options: UseTimelineOptions) => StrxTimelineController` | [useTimeline](use-timeline.html) |
| `useStrxMotion` | `() => StrxMotionContextValue` | [Provider](provider.html#reading-the-settings-usestrxmotion) |
| `definePreset` | `(name: string, preset: StrxPreset) => void` | [Presets](presets.html#custom-presets-with-definepreset) |
| `animationPresets` | `Readonly<Record<string, Readonly<StrxPreset>>>` | [Presets](presets.html#reading-registered-presets) |

### Component prop types

| Type | For |
| --- | --- |
| `StrxViewProps` | `Strx.View` |
| `StrxTextProps` | `Strx.Text` |
| `StrxPressableProps` | `Strx.Pressable` |
| `StrxImageProps` | `Strx.Image` |
| `StrxScrollViewProps` | `Strx.ScrollView` |
| `StrxTextInputProps` | `Strx.TextInput` |
| `StrxTimelineProps` | `Strx.Timeline` |
| `StrxProviderProps` | `Strx.Provider` |
| `StrxLayoutGroupProps` | `Strx.LayoutGroup` |
| `StrxLayoutGroupTransition` | `"linear" \| "spring"` |
| `StrxComponentOptions` | `createStrxComponent` options |
| `StrxComponentProps<Props>` | Props of a component made with `createStrxComponent` |
| `StrxLayoutPropagationMode` | `"auto" \| "none"` |
| `StrxLayoutTransitionType` | Layout transition names used by `layout-*` tokens |

### Timeline types

| Type | Shape |
| --- | --- |
| `UseTimelineOptions` | `{ playables, playback?, interval?, playCount?, onComplete? }` |
| `StrxTimelinePlayable` | `{ target: string; animate: AnimateProp }` |
| `StrxTimelineController` | `{ play(); reverse(); reset(); stop() }` |

### Motion types

| Type | Shape |
| --- | --- |
| `StrxMotionPreset` | `{ duration?: number; easing?: StrxEasingName; reduceMotion?: StrxReduceMotionMode }` |
| `StrxMotionContextValue` | `{ duration?; easing?; reduceMotion; isReduceMotionEnabled }` |
| `StrxReduceMotionMode` | `"system" \| "always" \| "never"` |
| `StrxEasingName` | `"linear" \| "ease" \| "ease-in" \| "ease-out" \| "ease-in-out"`, or any string |

### Preset types

| Type | Shape |
| --- | --- |
| `StrxPreset` | `{ initial; target; options: PresetMotionOptions }` |
| `PresetMotionOptions` | `{ driver: "timing" \| "spring"; duration?; damping?; stiffness?; mass? }` |
| `AnimatableChannel` | `"opacity" \| "translateX" \| "translateY" \| "scale"` |
| `BuiltInAnimationPreset` | Names of the built-in presets |

### animate types

| Type | Meaning |
| --- | --- |
| `AnimateProp` | Anything the `animate` prop accepts: a token string, an object, or a (nested) array of them |
| `AnimateValue` | Same as `AnimateProp` |
| `AnimateEntry` | One token string or object |
| `AnimateToken` | Known tokens for editor hints; any string is accepted |
| `AnimateObject` | `PresetAnimateObject \| CustomFromToAnimateObject` |
| `PresetAnimateObject` | `{ type: string } & timing options` |
| `CustomFromToAnimateObject` | `{ from: AnimateStyle; to: AnimateStyle } & timing options` |
| `AnimateStyle` | Animatable style keys for keyframe objects ([list](keyframes.html#objects-any-animatable-style)) |
| `AnimateTransformStyle` | The transform subset of `AnimateStyle` |
| `AnimateScalar` | `number \| string` |
| `AnimateLayoutToken` | `layout-*` token names |
| `AnimateTransitionToken` | `transition-*` token names |
| `PlaybackMode` | `"parallel" \| "serial" \| "stagger"` |

## react-native-strx/debug

| Export | Docs |
| --- | --- |
| `StrxDebugOverlay` | [Debugging](debugging.html#debug-overlay) |
| `StrxDebugOverlayProps` | Its props |
| `StrxDebugOverlayPosition` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` |
