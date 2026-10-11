---
title: Exit animations
description: Animate a component out when it unmounts with exit: tokens.
---

`exit:` tokens describe where a component animates to when React removes it. Reanimated keeps the view on screen until the exit animation finishes.

```tsx
{visible && (
  <Strx.View animate="fade-in exit:opacity-0 exit:translate-y-12">
    <Strx.Text>Toast message</Strx.Text>
  </Strx.View>
)}
```

<div data-demo="tokens" data-exit data-options="fade-in exit:opacity-0|slide-up exit:opacity-0 exit:translate-y-24|scale-in exit:scale-80 exit:opacity-0 duration-200|fade-in exit:opacity-0 exit:-translate-x-60 ease-in"></div>

## Exit channels

Exit animations run as a Reanimated `exiting` animation on four channels:

| Token | Exits to |
| --- | --- |
| `exit:opacity-0` | Fully transparent (any `opacity-*` value works) |
| `exit:translate-x-24`, `exit:-translate-x-24` | 24pt right or left |
| `exit:translate-y-24`, `exit:-translate-y-24` | 24pt down or up |
| `exit:scale-90` | Smaller (or larger, with `exit:scale-110`) |

The exit starts from the neutral values (`opacity: 1`, no translation, `scale: 1`) and animates the channels you list; channels you don't list stay neutral. Other utilities such as `exit:rotate-*` or `exit:w-*` are valid tokens but are not animated on exit.

## Exit timing

Exits use the timing tokens of their own comma group. Without them, an exit runs **300ms with `ease`**; the preset's default duration and the provider's duration don't apply to exits.

```tsx
// the whole group: entrance and exit both run 180ms, ease-in
<Strx.View animate="fade-in exit:opacity-0 exit:scale-95 duration-180 ease-in" />
```

To time the entrance and the exit separately, put the exit in its own group:

```tsx
<Strx.View animate="fade-in from:translate-y-12 duration-400, exit:opacity-0 duration-150 ease-in" />
```

`delay-*` delays the exit. Springs don't apply to exits; `spring` falls back to `ease`.

## Lists

Combine `exit:` with a [layout transition](layout.html) so the remaining items move into the gap:

```tsx
<Strx.LayoutGroup transition="spring">
  {items.map(item => (
    <Strx.View key={item.id} animate="fade-in from:translate-y-12 exit:opacity-0 exit:translate-x-24">
      <Row item={item} />
    </Strx.View>
  ))}
</Strx.LayoutGroup>
```

<div data-demo="list"></div>

## Supported components

Every STRX component supports `exit:`: `Strx.View`, `Strx.Text`, `Strx.Pressable`, `Strx.Image`, `Strx.ScrollView`, `Strx.TextInput`, and components made with [`createStrxComponent`](custom-components.html).

## Things to know

- An exit runs when the component itself unmounts. When a parent unmounts, the whole subtree goes with it, as with any Reanimated exiting animation; put `exit:` on the outermost element that is removed.
- Remove the item from your state right away. Don't wait for the animation in JS; Reanimated keeps the view on screen while it exits.
- Under Reduce Motion, exits are skipped and the component is removed immediately. See [Accessibility](accessibility.html).
- `exit:` values are never part of a [timeline](use-timeline.html) animation.
