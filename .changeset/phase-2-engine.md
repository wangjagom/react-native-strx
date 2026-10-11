---
'react-native-strx': major
---

Rewrite the animation engine around progress-driven layers sampled on the UI thread.

- Requires Reanimated 4.1+ and react-native-worklets 0.5+ (New Architecture). Reanimated 3 is no longer supported.
- Mount animations render their `from` frame on the first paint instead of relying on a double `requestAnimationFrame`.
- Style changes with `transition-*` no longer replay entrance animations.
- Interrupted transitions continue from the values currently on screen instead of jumping.
- Static transforms are kept while other transform channels animate, and channels are handed back to the static style when an animation is removed.
- `timeline.stop()` freezes animations in place; `timeline.reverse()` continues from the current position.
- `useTimeline` `onComplete` fires from real animation completion callbacks, and not for stopped, reset, or replaced runs.
- Controller `play`/`reverse` accept an `onFinish` callback.
