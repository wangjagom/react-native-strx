---
title: useTimeline
description: Play, reverse, stop and reset animations from events, without re-rendering.
---

`Strx.useTimeline` creates a controller for animations that should run from an event, such as a button press or a completed payment, instead of on mount. Components register as targets with `strxId`, and the controller drives their Reanimated values directly: no React state, no re-render.

```tsx
import { Strx } from "react-native-strx";

function SuccessCard() {
  const timeline = Strx.useTimeline({
    playback: "stagger",
    interval: 80,
    playables: [
      { target: "coin", animate: "scale-in from:opacity-0 duration-280 delay-300" },
      { target: "title", animate: "fade-in from:translate-y-12 duration-260" },
      { target: "button", animate: "fade-in from:translate-y-12 duration-240" },
    ],
    onComplete: () => console.log("done"),
  });

  return (
    <>
      <Strx.View strxId="coin" style={styles.coin} />
      <Strx.Text strxId="title">Transfer complete</Strx.Text>
      <Strx.Pressable strxId="button" onPress={timeline.play}>
        <Strx.Text>Play again</Strx.Text>
      </Strx.Pressable>
    </>
  );
}
```

<div data-demo="timeline"></div>

## Setup

The hook needs a target registry above it: `Strx.Provider` includes one, or use `Strx.TimelineRoot` on its own. Targets must be inside the same root.

```tsx
<Strx.Provider>
  <SuccessCard />
</Strx.Provider>
```

## Options

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `playables` | `{ target: string; animate: AnimateProp }[]` | — | What to play. `target` matches a component's `strxId`. `animate` takes anything the `animate` prop takes. |
| `playback` | `"parallel" \| "serial" \| "stagger"` | `"parallel"` | How targets are scheduled |
| `interval` | `number` | `100` | Offset between targets in ms, for `stagger` |
| `playCount` | `number \| "infinite"` | — | How many times each target plays. `"infinite"` loops until `stop()`. |
| `onComplete` | `() => void` | — | Called once when every target of a finite `play()` or `reverse()` has finished |

Scheduling works like [`Strx.Timeline`](timeline.html): `serial` waits for each target's delay and duration, and `stagger` adds earlier targets' `delay-*` values to later offsets.

## Controller

| Method | Behavior |
| --- | --- |
| `play()` | Plays every target from its `from` frame to its `to` frame. |
| `reverse()` | Plays back toward `from`. If a target is currently showing this timeline's animation, it reverses from its current position; otherwise it plays the full `to → from` pass. |
| `stop()` | Cancels pending starts and freezes running animations where they are. |
| `reset()` | Immediately returns every target to its `from` frame. |

`reverse()` uses the same schedule, interval and play count as `play()`. You can pass the methods straight to `onPress`.

> [!TIP] Keep playables stable
> The timeline recompiles when the `playables` array changes identity. Define it outside the component, or wrap it in `useMemo`, so it isn't rebuilt on every render.

## onComplete

`onComplete` fires from the real end of the animations, once per run, after the last target finishes. It is **not** called:

- for `playCount="infinite"`,
- after `stop()` or `reset()`,
- when a newer `play()` or `reverse()` replaces the run.

That makes it safe for navigation or follow-up work:

```tsx
const timeline = Strx.useTimeline({
  playables: [{ target: "sheet", animate: "from:translate-y-400 to:translate-y-0 spring" }],
  onComplete: () => navigation.goBack(),
});

<Button title="Close" onPress={timeline.reverse} />;
```

## Targets

- Any STRX component, or a [custom component](custom-components.html), can be a target via `strxId`.
- A target may also have its own `animate`. Its mount animation and the timeline's animation are separate; the timeline takes over when it plays.
- `strxId` values must be unique within a root. A duplicate replaces the earlier target and warns in development; unmounting one of them doesn't unregister the other.
- If `play()` finds no component for a `target`, it skips it and warns in development: "Timeline target was not registered. Check strxId."
- `exit:` tokens in a playable are ignored by the timeline.

## Timeline vs. useTimeline

| | `Strx.Timeline` | `Strx.useTimeline` |
| --- | --- | --- |
| Runs | When the children mount | When you call `play()` / `reverse()` |
| Targets | Direct children | Any component with a matching `strxId` under the same root |
| Controls | — | `play`, `reverse`, `stop`, `reset`, `onComplete` |
| Re-renders | Render-time | None; drives shared values directly |
