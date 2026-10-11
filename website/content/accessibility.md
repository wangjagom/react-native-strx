---
title: Reduce Motion
nav: Accessibility
description: How STRX respects the system Reduce Motion setting, and how to control it.
---

Some people turn on **Reduce Motion** (iOS) or **Remove animations** (Android) because large movement makes them uncomfortable. STRX follows this setting automatically when your app is wrapped in [`Strx.Provider`](provider.html), without changes to your components.

## What changes

When Reduce Motion is on:

| Feature | Behavior |
| --- | --- |
| Entrances, keyframes | Duration and delay become 0; the component appears in its final state |
| Springs (`bounce`, `spring`) | Delay and repeats are dropped. With the OS setting on, Reanimated also completes springs immediately; with `reduceMotion="always"` and the OS setting off, the spring itself still runs. |
| `play-*` repeats | Play once |
| `transition-*` | Style changes apply immediately |
| `layout-*`, `LayoutGroup` | Layout changes apply immediately |
| `exit:` | Skipped; the component is removed right away |
| `useTimeline` | Targets jump to their end state; `onComplete` still fires |

Your app keeps working the same way; it just doesn't move.

<div data-demo="reduce"></div>

## Controlling it

The provider's `reduceMotion` prop (or `motionPreset.reduceMotion`) sets the mode:

```tsx
// follow the OS (default)
<Strx.Provider reduceMotion="system">

// an in-app "Reduce motion" switch
<Strx.Provider reduceMotion={settings.reduceMotion ? "always" : "system"}>

// a demo or recording where motion must always play
<Strx.Provider reduceMotion="never">
```

## Reading it in your code

Use `useStrxMotion()` to adapt animations STRX doesn't control:

```tsx
const { isReduceMotionEnabled } = useStrxMotion();

<LottieView autoPlay={!isReduceMotionEnabled} source={celebration} />;
```

## Guidelines

- Prefer fades over large movement for important content; a short `fade-in` is comfortable for most people.
- Avoid `play-infinite` on large elements. If you need a looping indicator, keep it small, or check `isReduceMotionEnabled`.
- Don't rely on an animation to convey information. Under Reduce Motion the end state should still make sense on its own.
