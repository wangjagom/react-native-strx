---
title: Provider
description: App-wide motion defaults, Reduce Motion, and the timeline registry.
---

`Strx.Provider` is the recommended root for STRX. It does three things:

1. sets fallback **duration** and **easing** for animations that don't specify them;
2. follows the system **Reduce Motion** setting (or forces it on or off);
3. hosts the **timeline registry** that [`Strx.useTimeline`](use-timeline.html) and `strxId` use.

```tsx
import { Strx } from "react-native-strx";

export default function App() {
  return (
    <Strx.Provider motionPreset={{ duration: 260, easing: "ease-out", reduceMotion: "system" }}>
      <AppScreens />
    </Strx.Provider>
  );
}
```

Plain `animate` props work without a provider; you need one (or `Strx.TimelineRoot`) for timelines.

## Props

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `motionPreset` | `StrxMotionPreset` | — | Fallback motion settings, see below |
| `reduceMotion` | `"system" \| "always" \| "never"` | `"system"` | Overrides `motionPreset.reduceMotion` |
| `children` | `ReactNode` | — | Your app or screen |

`StrxMotionPreset`:

| Field | Type | Meaning |
| --- | --- | --- |
| `duration` | `number` | Fallback duration in ms. Must be a finite number ≥ 0; other values are ignored. |
| `easing` | `StrxEasingName` | Fallback easing: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out` |
| `reduceMotion` | `"system" \| "always" \| "never"` | Reduce Motion mode |

## How defaults apply

The provider only fills gaps. For duration the order is:

1. `duration-*` token or object `duration`
2. the preset's own default
3. `motionPreset.duration`
4. 300ms

So `motionPreset.duration` mainly affects keyframe animations (`from:` / `to:`), `transition-*`, `layout-linear` and `layout-fade`; presets keep their own defaults. Exits always default to 300ms. Easing follows the same idea: an easing token wins, otherwise `motionPreset.easing`, otherwise `ease-out`.

## Nesting providers

Providers can be nested. The inner provider replaces the settings for its subtree, for example to slow down an onboarding flow:

```tsx
<Strx.Provider motionPreset={{ duration: 240 }}>
  <Main />
  <Strx.Provider motionPreset={{ duration: 480, easing: "ease-in-out" }}>
    <Onboarding />
  </Strx.Provider>
</Strx.Provider>
```

Each provider also creates its own timeline registry, so `useTimeline` targets must be inside the same provider as the hook.

## Reduce Motion

`reduceMotion` controls whether STRX treats motion as reduced:

| Mode | Behavior |
| --- | --- |
| `"system"` | Follow the OS accessibility setting (default) |
| `"always"` | Always reduce motion, e.g. for a user preference in your app |
| `"never"` | Never reduce motion, e.g. for a screen recording |

See [Accessibility](accessibility.html) for exactly what changes.

## Reading the settings: useStrxMotion

`useStrxMotion()` returns the resolved settings of the nearest provider. Use it to keep your own animations consistent with STRX:

```tsx
import { useStrxMotion } from "react-native-strx";

function Confetti() {
  const { isReduceMotionEnabled, duration } = useStrxMotion();

  if (isReduceMotionEnabled) return null;
  return <ConfettiCannon duration={duration ?? 300} />;
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| `duration` | `number \| undefined` | `motionPreset.duration`, if valid |
| `easing` | `StrxEasingName \| undefined` | `motionPreset.easing`, if set |
| `reduceMotion` | `"system" \| "always" \| "never"` | The resolved mode |
| `isReduceMotionEnabled` | `boolean` | Whether motion is reduced right now |

Outside a provider it returns `{ reduceMotion: "system", isReduceMotionEnabled: false }`.

## Strx.TimelineRoot

`Strx.TimelineRoot` is only the timeline registry, without motion settings. Use it when you want `strxId` and `useTimeline` but no global defaults, for example inside a library component:

```tsx
<Strx.TimelineRoot>
  <ScreenContent />
</Strx.TimelineRoot>
```

`Strx.Provider` already includes one, so you don't need both.
