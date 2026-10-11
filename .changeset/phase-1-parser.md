---
'react-native-strx': major
---

Unify `animate` parsing into a single parser shared by components, the animation engine, `Strx.Timeline`, and `Strx.useTimeline`.

- `exit:` tokens no longer leak into the `to` frame of timeline animations.
- One number grammar everywhere: unsigned decimals, `opacity-*` clamped to 0–100, exponent/hex values rejected.
- Token order within a group no longer matters (`layout-spring fade-in` now plays `fade-in`).
- A preset and `from:/to:` keyframes in the same group combine, with keyframes overriding per channel.
- Duration precedence is now token → preset default → `Strx.Provider` → 300ms (previously the provider overrode preset defaults).
- New `spring`, `damping-*`, `stiffness-*`, `mass-*` tokens; spring options on animation objects are respected.
- `exit:` animations honor easing tokens.
- `Strx.Timeline` offsets every comma group and adds to existing `delay-*` values instead of replacing them.
- Unknown tokens are reported once via `console.warn` in development, with suggestions.
- Strings longer than 512 characters are parsed instead of being silently ignored.
- New `definePreset(name, preset)` API for registering custom presets.
