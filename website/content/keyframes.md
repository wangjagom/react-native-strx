---
title: Keyframes
description: Write start and end values directly with from: and to: utilities, or with style objects.
---

When no preset fits, describe the animation with `from:` and `to:` tokens. Each prefixes a utility such as `opacity-0` or `translate-y-20`.

```tsx
<Strx.View animate="from:opacity-0 from:-translate-y-20 to:opacity-100 to:translate-y-0 duration-300" />
```

<div data-demo="sandbox" data-animate="from:opacity-0 from:-translate-y-20 from:rotate-12 duration-500 ease-out"></div>

## Prefixes

<!-- strx:prefixes -->

## Utilities

<!-- strx:utilities -->

Use a leading dash for negative values on signed utilities: `from:-translate-x-24`, `from:-rotate-90`.

## Missing start or end values

You only need one side. A channel with only a `from:` value animates to its neutral value; a channel with only a `to:` value starts from neutral:

| Channel | Neutral value |
| --- | --- |
| `opacity`, `scale`, `scaleX`, `scaleY` | `1` |
| `translateX`, `translateY` | `0` |
| `rotate` | `0deg` |

So these two lines are the same:

```tsx
<Strx.View animate="from:opacity-0 from:scale-90" />
<Strx.View animate="from:opacity-0 to:opacity-100 from:scale-90 to:scale-100" />
```

## With a preset

A group may combine a preset with keyframes. The keyframes override the preset per channel and the rest of the preset stays:

```tsx
// fade-in's opacity, plus a slide from 8pt below
<Strx.View animate="fade-in from:translate-y-8" />

// slide-up, but from further away
<Strx.View animate="slide-up from:translate-y-80" />
```

<div data-demo="tokens" data-options="fade-in from:translate-y-8|slide-up from:translate-y-80 duration-500|scale-in from:rotate-12 from:opacity-0"></div>

## Looping keyframes

Add `play-*` to repeat. Each play starts again from the `from` frame:

```tsx
// a pulsing badge
<Strx.View animate="from:scale-90 to:scale-110 duration-600 ease-in-out play-infinite" />
```

## Objects: any animatable style

Tokens cover the most common channels. For anything else, including colors, border radius and spacing, pass an object:

```tsx
<Strx.View
  animate={{
    from: { opacity: 0, backgroundColor: "#eef1ff", borderRadius: 4, transform: [{ rotate: "-8deg" }] },
    to: { opacity: 1, backgroundColor: "#3552f0", borderRadius: 18, transform: [{ rotate: "0deg" }] },
    duration: 500,
    easing: "ease-out",
  }}
/>
```

Supported keys for `from` / `to` objects:

| Group | Keys |
| --- | --- |
| Opacity | `opacity` |
| Transform | `translateX`, `translateY`, `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skewX`, `skewY`, `perspective` (as keys or inside `transform`) |
| Size | `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight` |
| Position | `top`, `right`, `bottom`, `left` |
| Spacing | `margin*`, `padding*` (all sides, horizontal, vertical) |
| Border | `borderRadius` and per-corner radii, `borderWidth` and per-side widths |
| Color | `backgroundColor`, `borderColor` and per-side border colors |

Size, position and spacing accept numbers or percentage strings such as `"50%"`. Angles are strings such as `"45deg"`.

> [!TIP] Size animations
> `w-*` / `h-*` and object `width` / `height` animate the view's own size, which re-lays out its children every frame. To animate a size change caused by content, prefer a [layout transition](layout.html).

## Keyframes and timelines

Keyframes also define what [`Strx.useTimeline`](use-timeline.html) plays: `play()` goes from the `from` frame to the `to` frame, `reverse()` goes back, and `reset()` jumps to `from`. `exit:` values are never part of a timeline's `to` frame.
