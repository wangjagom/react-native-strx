---
title: Springs
description: Physical motion with the spring driver, tuned by damping, stiffness and mass.
---

Add `spring` to a group to animate its numeric channels with a spring instead of a timed curve. Springs settle naturally and feel responsive, especially for scale and position.

```tsx
<Strx.View animate="scale-in spring" />
<Strx.View animate="from:translate-y-40 spring damping-14 stiffness-200" />
```

## Spring tokens

| Token | Meaning | Default |
| --- | --- | --- |
| `spring` | Use the spring driver for this group | — |
| `damping-*` | Friction. Lower values bounce more. | 10 |
| `stiffness-*` | Strength. Higher values move faster. | 100 |
| `mass-*` | Weight. Higher values feel heavier and slower. | 1 |

Defaults come from the preset when it has its own spring settings (like `bounce`), then from the values above.

<div data-demo="springs" data-options="spring|spring damping-6|spring damping-20 stiffness-200|spring stiffness-300 mass-0.6|spring mass-3"></div>

## How long does a spring run?

A spring has no fixed duration. It runs until it settles, so `duration-*` and easing tokens do not apply to it. To make a spring faster, raise `stiffness` or lower `mass`; to make it calmer, raise `damping`.

## Presets that use springs

`bounce` uses the spring driver by default (damping 8, stiffness 180, mass 0.9). Any timing preset can switch to a spring with the `spring` token:

```tsx
<Strx.View animate="bounce" />
<Strx.View animate="slide-up spring damping-18" />
```

<div data-demo="tokens" data-options="bounce|slide-up spring damping-18|scale-in spring damping-8 stiffness-260|fade-in, slide-up spring"></div>

Custom presets can default to a spring too: see [`definePreset`](presets.html).

## Objects

In an object, set `easing: "spring"` and the parameters by name:

```tsx
<Strx.View animate={{ type: "scale-in", easing: "spring", damping: 12, stiffness: 220 }} />
```

## Layout springs

Layout transitions have their own spring tokens with tuned parameters: `layout-spring`, `layout-spring-stiff` and `layout-spring-bouncy`. They are independent of the `spring` token. See [Layout transitions](layout.html).
