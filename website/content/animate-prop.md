---
title: The animate prop
description: How STRX reads token strings, comma groups, objects and arrays.
---

Every STRX component takes an `animate` prop. It accepts a **token string**, an **object**, or an **array** of either.

```tsx
<Strx.View animate="fade-in duration-300" />
<Strx.View animate={{ type: "fade-in", duration: 300 }} />
<Strx.View animate={["fade-in", { from: { scale: 0.9 }, to: { scale: 1 } }]} />
```

## Token strings

A token string is a list of tokens separated by spaces. Each token belongs to one category:

| Category | Examples | What it does |
| --- | --- | --- |
| Preset | `fade-in`, `slide-up`, `bounce` | A named entrance with its own default timing |
| Keyframe | `from:opacity-0`, `to:scale-110` | Explicit start or end values for a channel |
| Exit | `exit:opacity-0` | Values to animate to when the component unmounts |
| Timing | `duration-300`, `delay-100`, `ease-out`, `play-2` | How the animation runs |
| Spring | `spring`, `damping-12`, `stiffness-180`, `mass-1` | Switches to and tunes the spring driver |
| Transition | `transition-colors`, `transition-all` | Animates later changes to `style` |
| Layout | `layout-spring`, `layout-linear` | Animates size and position changes |

Try typing your own string. Tokens are colored by category, and unknown tokens get a suggestion:

<div data-demo="sandbox" data-animate="fade-in from:translate-y-16 from:rotate-6 duration-500 ease-out"></div>

### Order doesn't matter

Inside a group, tokens can appear in any order. These are equivalent:

```tsx
<Strx.View animate="fade-in layout-spring duration-300 ease-out" />
<Strx.View animate="ease-out duration-300 layout-spring fade-in" />
```

## Comma groups

A comma starts a new **group**. Groups play in parallel, and each group has its own timing. Timing tokens only affect the preset, keyframes, `exit:` and `transition-*` tokens in their own group.

```tsx
// fade-in uses its default 300ms; slide-up runs 600ms after 100ms
<Strx.View animate="fade-in, slide-up duration-600 delay-100" />
```

<div data-demo="tokens" data-options="fade-in, slide-up duration-600 delay-100|fade-in duration-900, slide-up duration-300|fade-in, scale-in, slide-up duration-400"></div>

### One preset per group

A group can hold **one** preset. A second preset in the same group is ignored and reported in development:

```tsx allow-invalid
// plays only fade-in, and warns
<Strx.View animate="fade-in slide-up" />

// plays both
<Strx.View animate="fade-in, slide-up" />
```

A preset and keyframes in the same group combine. Keyframes override the preset per channel:

```tsx
// fade-in, but slide from 8pt below as well
<Strx.View animate="fade-in from:translate-y-8" />
```

### When groups touch the same channel

If two groups animate the same channel (for example both set `opacity`), the later group wins for that channel.

## Numbers

Numbers in tokens are unsigned decimals: `300`, `0.5`, `12.5`. Exponents such as `1e3` are rejected. Utilities that accept negative values use a leading dash on the whole utility, like Tailwind: `from:-translate-y-20`, `from:-rotate-45`.

`opacity-*` and `scale-*` values are percentages: `opacity-50` is `0.5`, `scale-95` is `0.95`. Opacity is clamped to 0–100.

## Objects

Use an object when values come from variables or when a channel has no token (for example `backgroundColor`):

```tsx
// a preset with timing
<Strx.View animate={{ type: "slide-up", duration: 400, delay: 80, easing: "ease-out" }} />

// explicit keyframes for any animatable style
<Strx.View
  animate={{
    from: { opacity: 0, backgroundColor: "#eef1ff", borderRadius: 4 },
    to: { opacity: 1, backgroundColor: "#3552f0", borderRadius: 16 },
    duration: 500,
  }}
/>
```

Object timing options:

| Option | Type | Meaning |
| --- | --- | --- |
| `type` | `string` | A preset name (built-in or from `definePreset`). Use either `type` or `from`/`to`. |
| `from`, `to` | `AnimateStyle` | Start and end styles. See [Keyframes](keyframes.html) for the supported keys. |
| `duration` | `number` | Milliseconds |
| `delay` | `number` | Milliseconds |
| `easing` | `string` | An easing token, or `"spring"` for the spring driver |
| `playCount` | `number \| "infinite"` | Total number of plays |
| `repeat` | `number \| "infinite"` | Legacy alias of `playCount` |
| `damping`, `stiffness`, `mass` | `number` | Spring parameters |

## Arrays

An array combines entries, which can be strings or objects. By default the entries play in parallel; set `playback` to run them in sequence or staggered:

```tsx
<Strx.View
  playback="serial"
  animate={["fade-in duration-200", "slide-up duration-300"]}
/>
```

See [Array playback](playback.html).

## Typos and invalid tokens

Unknown or invalid tokens are ignored, and STRX logs one `console.warn` per string in development, with a suggestion when a close match exists:

```text
[react-native-strx] Ignored unknown animate token(s) "fade-inn" (did you mean "fade-in"?) in "fade-inn duration-300". Combine multiple presets with commas, e.g. "fade-in, slide-up".
```

The rest of the string still works. Production builds do not warn.

## Changing animate at runtime

The parsed result for each string is cached, so passing the same string on every render costs nothing. When the string changes, the new entrance plays. Changing only `style` never replays an entrance; use [`transition-*`](transitions.html) to animate style changes.
