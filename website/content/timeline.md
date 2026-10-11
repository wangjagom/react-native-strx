---
title: Strx.Timeline
description: Choreograph the entrances of several children at render time.
---

`Strx.Timeline` staggers or sequences the entrance animations of its direct children. It reads each child's `animate`, computes a start offset, and injects it as extra delay, so the children themselves stay unchanged.

```tsx
<Strx.Timeline playback="stagger" interval={80}>
  <Strx.View animate="fade-in from:translate-y-12" />
  <Strx.View animate="fade-in from:translate-y-12" />
  <Strx.View animate="fade-in from:translate-y-12" />
</Strx.Timeline>
```

<div data-demo="playback" data-mode="stagger" data-interval="80" data-entries="fade-in from:translate-y-12 duration-300|fade-in from:translate-y-12 duration-300|fade-in from:translate-y-12 duration-300"></div>

## Props

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `playback` | `"parallel" \| "serial" \| "stagger"` | `"parallel"` | How the children are scheduled |
| `interval` | `number` | `100` | Offset in ms between children, for `stagger`. Negative or invalid values become 0. |
| `playCount` | `number \| "infinite"` | — | Plays the whole choreography this many times in total |
| `children` | `ReactNode` | — | Children whose `animate` props are orchestrated |

`Strx.Timeline` renders a `Strx.View`, so it also accepts view props such as `style`, and layout props such as `layoutClip`.

## Scheduling

- **parallel**: every child starts at 0. Useful with `playCount` to loop a group together.
- **serial**: each child starts when the previous child's delay and duration have finished.
- **stagger**: child _n_ starts at _n_ × `interval`, plus the `delay-*` values of the children before it.

Offsets are **added** to each child's own `delay-*`, and they apply to every comma group in the child's `animate`:

```tsx
<Strx.Timeline playback="stagger" interval={100}>
  <Strx.Text animate="fade-in">Starts at 0ms</Strx.Text>
  <Strx.Text animate="fade-in delay-50">Starts at 150ms</Strx.Text>
  <Strx.Text animate="fade-in">Starts at 250ms (200 + the 50ms delay above)</Strx.Text>
</Strx.Timeline>
```

## Repeating the choreography

`playCount` repeats the whole timeline, not each child separately. STRX spaces the cycles by the estimated duration of the full timeline:

```tsx
<Strx.Timeline playback="stagger" interval={120} playCount="infinite">
  <Dot animate="from:opacity-30 to:opacity-100 duration-400" />
  <Dot animate="from:opacity-30 to:opacity-100 duration-400" />
  <Dot animate="from:opacity-30 to:opacity-100 duration-400" />
</Strx.Timeline>
```

## Things to know

- Only **direct** children are orchestrated. Fragments, strings and `null` children are rendered unchanged. To orchestrate nested components, give the nested component the `animate` prop and pass it through, or use [`Strx.useTimeline`](use-timeline.html).
- Children can be any component that accepts `animate`: STRX components and [custom components](custom-components.html).
- The timeline runs at render time, as the children mount. To play animations later, in response to a press or a network result, use [`Strx.useTimeline`](use-timeline.html).
- For a single component with several animations, use [array playback](playback.html).
