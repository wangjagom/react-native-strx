---
title: Token reference
description: Every animate token, generated from the token data the parser uses.
---

This page is generated from `tokens.json`, the same data the parser, the [editor extension](editor.html) and the previews on this site use, so it always matches the published version.

<div data-demo="sandbox" data-animate="fade-in from:translate-y-12 layout-spring duration-400 ease-out exit:opacity-0"></div>

## Grammar

```text
animate     = group ("," group)*
group       = token (" " token)*
token       = preset | keyframe | exit | timing | spring | transition | layout
keyframe    = ("from:" | "to:") utility
exit        = "exit:" utility
utility     = ["-"] name "-" number        e.g. opacity-50, -translate-y-20
number      = digits ["." digits]          unsigned decimal
```

- Spaces separate tokens in a group; order doesn't matter.
- Commas separate groups; groups play in parallel with their own timing.
- At most one preset per group.
- One `transition-*` per `animate` value; the last one wins.
- If several groups have `layout-*` tokens, the strongest wins (spring over linear).

## Presets

<!-- strx:presets -->

Custom presets: [`definePreset`](presets.html).

## Keyframe prefixes

<!-- strx:prefixes -->

## Utilities

<!-- strx:utilities -->

Exit animations use `opacity`, `translateX`, `translateY` and `scale`. See [Exit animations](exit.html).

## Timing

<!-- strx:timing -->

## Easing and spring

<!-- strx:easings -->

## Style transitions

<!-- strx:transitions -->

## Layout transitions

<!-- strx:layout -->
