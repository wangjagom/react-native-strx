---
title: Introduction
description: Tailwind-style animation tokens for React Native, powered by Reanimated 4.
---

`react-native-strx` (STRX) lets you write animation intent directly on React Native components, as a short string of tokens:

```tsx
import { Strx } from "react-native-strx";

<Strx.View animate="fade-in from:translate-y-12 layout-spring duration-400" />
```

That one prop fades the view in, slides it up from 12 points below, springs its size and position changes, and sets the entrance duration to 400ms. STRX parses the string once, caches it, and drives the animation with Reanimated on the UI thread.

<div data-demo="tokens" data-options="fade-in from:translate-y-12 duration-400|scale-in from:opacity-0|bounce|slide-right from:opacity-0 duration-500 ease-in-out"></div>

## What you can animate

STRX covers the motion most apps need, all through the same `animate` prop:

| Kind | Tokens | Page |
| --- | --- | --- |
| Entrance presets | `fade-in`, `slide-up`, `scale-in`, `bounce`, ... | [Presets](presets.html) |
| Custom keyframes | `from:opacity-0`, `to:scale-110`, ... | [Keyframes](keyframes.html) |
| Timing | `duration-300`, `delay-100`, `ease-out`, `play-3`, ... | [Timing & easing](timing.html) |
| Physics | `spring`, `damping-12`, `stiffness-180`, `mass-1` | [Springs](springs.html) |
| Unmount | `exit:opacity-0`, `exit:scale-90`, ... | [Exit animations](exit.html) |
| Style changes | `transition-colors`, `transition-transform`, ... | [Style transitions](transitions.html) |
| Size and position | `layout-spring`, `layout-linear`, ... | [Layout transitions](layout.html) |

On top of that, there are components for choreography ([`Strx.Timeline`](timeline.html), [`Strx.useTimeline`](use-timeline.html)), shared layout regions ([`Strx.LayoutGroup`](layout-group.html)), app-wide defaults and Reduce Motion ([`Strx.Provider`](provider.html)), and a way to add `animate` to any component ([`createStrxComponent`](custom-components.html)).

## Why tokens

- **Readable.** `fade-in slide-up` reads like what it does. Reviewers see the motion without opening another file.
- **Consistent.** Teams share a small vocabulary of presets and durations instead of hand-tuned `withTiming` calls.
- **Fast.** Strings are parsed once and cached. Animations run on the UI thread through Reanimated, and components without a layout token carry no layout-animation cost.
- **Checked.** Unknown tokens produce a development warning with a suggestion (`fade-inn` → `fade-in`), and the [VS Code extension](editor.html) autocompletes every token.

## Requirements

| Package | Version |
| --- | --- |
| `react` | 19 or newer |
| `react-native` | 0.78 or newer, New Architecture |
| `react-native-reanimated` | 4.1 or newer |
| `react-native-worklets` | 0.5 or newer |

Apps still on Reanimated 3 should stay on `react-native-strx@0.1.x`. Upgrading from 0.1? See the [migration guide](migration.html).

## Next steps

- [Install STRX](installation.html) and set up Babel.
- Follow the [quick start](quick-start.html) to build an animated screen.
- Read [the animate prop](animate-prop.html) to learn how token strings are parsed.
