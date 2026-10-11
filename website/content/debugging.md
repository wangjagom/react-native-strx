---
title: Debugging
description: Development warnings, the on-device debug overlay, and common problems.
---

## Development warnings

STRX logs a `console.warn` in development builds when something won't work as written. Each distinct message is logged once, so a warning in a list row doesn't flood the console.

| Warning | Cause |
| --- | --- |
| `Ignored unknown animate token(s) "fade-inn" (did you mean "fade-in"?) in "..."` | A typo, an invalid number, an unsupported utility, or a second preset in one group. The rest of the string still works. |
| `Duplicate strxId "card" replaced an existing timeline target.` | Two mounted components share an `strxId` under the same root. |
| `Timeline target was not registered. Check strxId.` | `timeline.play()` found no component for a `target`. |

Production builds don't log these warnings.

> [!TIP] Catch typos before running
> The [VS Code extension](editor.html) shows the same warnings as you type, with one-click fixes.

## Debug overlay

`StrxDebugOverlay` is a small on-device HUD for development. It lives in a separate entry point, `react-native-strx/debug`, so it is never part of your main bundle unless you import it.

```tsx
import { Strx } from "react-native-strx";
import { StrxDebugOverlay } from "react-native-strx/debug";

export default function App() {
  return (
    <Strx.Provider>
      <AppScreens />
      {__DEV__ && <StrxDebugOverlay position="bottom-left" />}
    </Strx.Provider>
  );
}
```

Render it inside `Strx.Provider` (or `Strx.TimelineRoot`) so it can see the timeline registry. It starts as a compact pill; tap it to expand.

<div class="demo"><div class="demo-stage">
<div class="overlay-mock" aria-hidden="true">
<div class="row"><span>targets</span><span>3</span></div>
<div class="row"><span>last event</span><span>timeline play stagger</span></div>
<div class="row"><span>parser cache</span><span>12</span></div>
<div class="row"><span>motion</span><span>260ms · ease-out · system</span></div>
<div class="warn">Duplicate strxId "card" replaced an existing timeline target.</div>
</div>
</div><div class="demo-bar">An illustration of the expanded overlay.</div></div>

The expanded overlay shows:

- the number of registered timeline targets (`strxId`s),
- the latest timeline event (for example `timeline play stagger`),
- recent development warnings,
- the parser cache size,
- the active motion policy (duration, easing, Reduce Motion),
- a small easing preview.

### Props

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Renders nothing and stops polling when `false` |
| `position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"bottom-right"` | Screen corner |
| `initialExpanded` | `boolean` | `false` | Start expanded instead of as a pill |
| `showMotionPreview` | `boolean` | `true` | Show the easing preview |

## Common problems

### Nothing animates

- Check that the component is a STRX component (`Strx.View`, not `View`). TypeScript reports `animate` on plain React Native components.
- Check the console for an "Ignored unknown animate token" warning.
- Make sure `react-native-worklets/plugin` is the **last** Babel plugin, then restart Metro with `--reset-cache`.
- Is Reduce Motion on? Under Reduce Motion, animations jump to their end state. See [Accessibility](accessibility.html).

### Only one of my presets plays

A comma group holds one preset. Write `"fade-in, slide-up"` instead of `"fade-in slide-up"`, or combine one preset with keyframes: `"fade-in from:translate-y-12"`.

### My duration is ignored

Presets have their own default duration, which wins over `Strx.Provider`'s `motionPreset.duration`. Add a `duration-*` token to the group. Springs (`bounce`, `spring`) have no duration; tune `damping`, `stiffness` and `mass` instead. See [Timing](timing.html).

### The entrance replays

An entrance replays when the `animate` value changes. A string built from changing state, such as a template string whose delay depends on a value that changes, replays it whenever that value changes. Style changes alone never replay entrances.

### A parent doesn't resize smoothly

Layout transitions are inherited downward only. Put the `layout-*` token on the container that changes size, or wrap the region in [`Strx.LayoutGroup`](layout-group.html).

### Exit doesn't play

The `exit:` token must be on the component that is actually removed, not on a child of it. Exits also don't run under Reduce Motion. See [Exit animations](exit.html).

### Timeline does nothing

`useTimeline` needs `Strx.Provider` or `Strx.TimelineRoot` above it, and each `target` must match a mounted component's `strxId` under the same root.
