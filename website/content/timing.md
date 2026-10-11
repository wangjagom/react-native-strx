---
title: Timing & easing
description: Duration, delay, easing and repeat tokens, and the order STRX resolves them in.
---

Timing tokens configure the preset, keyframes, `exit:` and `transition-*` tokens in their own comma group.

```tsx
<Strx.View animate="slide-up duration-500 delay-150 ease-in-out" />
```

## Timing tokens

<!-- strx:timing -->

## Duration

`duration-*` is in milliseconds. STRX picks the first value that is set:

1. a `duration-*` token, or `duration` in an object
2. the preset's own default (for example `slide-up` is 320ms)
3. `Strx.Provider`'s `motionPreset.duration`
4. 300ms

```tsx
<Strx.Provider motionPreset={{ duration: 200 }}>
  <Strx.View animate="fade-in" />              {/* 300ms: fade-in's default */}
  <Strx.View animate="from:opacity-0" />       {/* 200ms: provider */}
  <Strx.View animate="fade-in duration-600" /> {/* 600ms: token */}
</Strx.Provider>
```

`duration-*` also sets the duration of `layout-linear` and `layout-fade` in the same group.

## Delay

`delay-*` waits before the animation starts. It applies once, not before every repeat.

```tsx
<Strx.View animate="fade-in, slide-up delay-200" />
```

Delays are a simple way to stage a sequence by hand. For lists, [`Strx.Timeline`](timeline.html) computes the offsets for you.

## Easing

Easing tokens set the curve of timing animations. Without one, STRX uses the provider's `motionPreset.easing`, or `ease-out`.

<!-- strx:easings -->

<div data-demo="easing"></div>

Easing has no effect on spring animations. For springs, see [Springs](springs.html).

## Repeating

`play-*` sets the **total** number of plays: `play-3` plays three times. `play-infinite` loops until the component unmounts or its animation changes. `repeat-*` is an older name for the same thing.

```tsx
<Strx.View animate="from:opacity-40 to:opacity-100 duration-800 ease-in-out play-infinite" />
```

Each play starts again from the `from` frame. To loop a whole choreography of several components, use `playCount` on [`Strx.Timeline`](timeline.html).

## Reduce Motion

When Reduce Motion is on, durations and delays become 0 and repeats play once, so the UI jumps straight to the end state. See [Accessibility](accessibility.html).

## Global defaults

Set app-wide fallbacks on the provider. Tokens always win:

```tsx
<Strx.Provider motionPreset={{ duration: 260, easing: "ease-out" }}>
  <App />
</Strx.Provider>
```
