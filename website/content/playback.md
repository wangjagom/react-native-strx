---
title: Array playback
description: Run several animations on one component in parallel, one after another, or staggered.
---

Pass an array to `animate` to combine several animations on one component. The `playback` prop decides how the entries are scheduled.

```tsx
<Strx.View
  playback="serial"
  animate={["fade-in duration-200", "scale-in duration-300"]}
/>
```

<div data-demo="playback" data-mode="serial" data-entries="fade-in duration-300|from:translate-x-24 duration-300|from:rotate-45 duration-300"></div>

## Playback modes

| `playback` | Behavior |
| --- | --- |
| `parallel` (default) | All entries start together, like comma groups. |
| `serial` | Each entry starts after the previous entry's `delay-*` and duration have finished. |
| `stagger` | Entries start at `interval` ms offsets. Explicit `delay-*` values of earlier entries push later entries back too. |

`interval` defaults to `100` ms and only applies to `stagger`.

```tsx
<Strx.View
  playback="stagger"
  interval={80}
  animate={["fade-in", "from:translate-y-12", "from:scale-90 spring"]}
/>
```

## Arrays vs. comma groups

Both run several animations, and in parallel mode they behave the same:

```tsx
<Strx.View animate="fade-in, slide-up duration-500" />
<Strx.View animate={["fade-in", "slide-up duration-500"]} />
```

Arrays are useful when you need `serial` or `stagger`, when entries are objects, or when you build the list in code:

```tsx
const entrance = [
  "fade-in duration-200",
  { from: { backgroundColor: "#ffffff" }, to: { backgroundColor: "#eef1ff" }, duration: 400 },
];

<Strx.View playback="serial" animate={entrance} />;
```

## Same channel in two entries

If two entries animate the same channel, the later entry wins for that channel. In `serial` and `stagger` mode, the later entry takes over when it starts.

## Several components

`playback` schedules entries on **one** component. To schedule several components, wrap them in [`Strx.Timeline`](timeline.html) for render-time choreography, or use [`Strx.useTimeline`](use-timeline.html) to play them from an event.
