---
title: Quick start
description: Build an animated card in five steps and meet each kind of STRX motion along the way.
---

This walkthrough builds a small profile card. Each step adds one kind of motion.

## 1. Add the provider

Wrap your app (or a screen) in `Strx.Provider`. It sets default timing, follows the system Reduce Motion setting, and connects [event timelines](use-timeline.html).

```tsx title="App.tsx"
import { Strx } from "react-native-strx";

export default function App() {
  return (
    <Strx.Provider motionPreset={{ duration: 280, easing: "ease-out" }}>
      <ProfileScreen />
    </Strx.Provider>
  );
}
```

The provider is optional for plain `animate` props, but you need it (or [`Strx.TimelineRoot`](provider.html)) for `Strx.useTimeline`.

## 2. Animate the entrance

Swap `View` and `Text` for their STRX versions and add `animate`. STRX components accept every prop of the React Native component they wrap.

```tsx allow-invalid
<Strx.View animate="fade-in slide-up" style={styles.card}>
  <Strx.Text style={styles.name}>Ada Lovelace</Strx.Text>
</Strx.View>
```

`fade-in` and `slide-up` are both presets, so this plays only `fade-in` and warns in development: a comma group holds one preset. To combine presets, separate them with commas, or combine one preset with [keyframes](keyframes.html):

```tsx
<Strx.View animate="fade-in, slide-up" />
<Strx.View animate="fade-in from:translate-y-24" />
```

<div data-demo="tokens" data-options="fade-in, slide-up|fade-in from:translate-y-24|fade-in, slide-up duration-600"></div>

## 3. Tune the timing

Add `duration-*`, `delay-*` and an easing token. Timing applies to its own comma group:

```tsx
<Strx.View animate="fade-in, slide-up duration-500 delay-100 ease-in-out" />
```

Here `fade-in` uses the provider's 280ms, and `slide-up` runs 500ms after a 100ms delay. See [Timing & easing](timing.html) for the full precedence rules.

## 4. Animate state changes

A `transition-*` token animates later changes to `style`. Here the card's border color follows a `selected` flag:

```tsx
<Strx.Pressable
  onPress={() => setSelected(value => !value)}
  animate="fade-in transition-colors duration-200"
  style={{ borderColor: selected ? "#3552f0" : "#e7e9ef", borderWidth: 2 }}
>
  <Strx.Text>Ada Lovelace</Strx.Text>
</Strx.Pressable>
```

`fade-in` still plays once on mount; the style change never replays it. See [Style transitions](transitions.html).

## 5. Animate layout and exit

Add `layout-spring` so the card springs to its new size when details appear, and `exit:` tokens on the details so they fade out when removed:

```tsx
<Strx.View animate="fade-in, slide-up layout-spring" layoutClip>
  <Strx.Text>Ada Lovelace</Strx.Text>
  {expanded && (
    <Strx.Text animate="fade-in exit:opacity-0 exit:translate-y-8">
      Wrote the first published algorithm.
    </Strx.Text>
  )}
</Strx.View>
```

Children inherit the card's layout transition, so the text block moves smoothly too. See [Layout transitions](layout.html) and [Exit animations](exit.html).

<div data-demo="layout" data-options="layout-spring|layout-linear"></div>

## What's next

- Learn the full grammar in [The animate prop](animate-prop.html).
- Coordinate several components with [`Strx.Timeline`](timeline.html) or [`Strx.useTimeline`](use-timeline.html).
- Browse every token in the [token reference](token-reference.html).
