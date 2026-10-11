---
title: Presets
description: Named entrance animations, and how to register your own with definePreset.
---

A preset is a named animation with a start frame, an end frame and default motion. Presets play when the component mounts (and again when the `animate` string changes).

```tsx
<Strx.View animate="slide-up" />
```

<div data-demo="tokens" data-options="fade-in|slide-up|slide-down|slide-left|slide-right|scale-in|scale-down|scale-out|bounce"></div>

## Built-in presets

<!-- strx:presets -->

`scale-up` and `scale-in` are the same animation; use whichever reads better. `fade-out` and `scale-out` animate _to_ an invisible or smaller state on mount. For animating a component out as it unmounts, use [`exit:` tokens](exit.html) instead.

The "default motion" column is the preset's own default, not Reanimated's. `bounce` uses the spring driver; every other preset uses timing with `ease-out` unless you add an easing token.

## Overriding a preset

Every part of a preset can be overridden in the same group:

```tsx
// timing
<Strx.View animate="slide-up duration-600 delay-100 ease-in-out" />

// spring instead of timing
<Strx.View animate="scale-in spring damping-14" />

// a different start position: keyframes override the preset per channel
<Strx.View animate="slide-up from:translate-y-60" />
```

Duration precedence is: `duration-*` token or object `duration` → the preset's own default → `Strx.Provider` duration → 300ms. So with `motionPreset={{ duration: 200 }}`, `slide-up` still runs 320ms unless you add a `duration-*` token.

## Combining presets

Use one preset per comma group:

```tsx
<Strx.View animate="fade-in, slide-up, scale-in duration-400" />
```

<div data-demo="tokens" data-options="fade-in, slide-up|fade-in, scale-in|fade-in, slide-right duration-500, scale-in duration-250"></div>

## Custom presets with definePreset

Register a preset once at module scope, before any component that uses it renders. After that, it works like a built-in token everywhere: in strings, objects (`{ type: "pop-in" }`), timelines and the dev-time token checker.

```tsx title="motion.ts"
import { definePreset } from "react-native-strx";

definePreset("pop-in", {
  initial: { opacity: 0, scale: 0.8 },
  target: { opacity: 1, scale: 1 },
  options: { driver: "spring", damping: 12, stiffness: 200 },
});

definePreset("drop-in", {
  initial: { opacity: 0, translateY: -40 },
  target: { opacity: 1, translateY: 0 },
  options: { driver: "timing", duration: 450 },
});
```

```tsx
import "./motion";

<Strx.View animate="pop-in" />
<Strx.View animate="drop-in delay-150" />
```

### The preset shape

| Field | Type | Meaning |
| --- | --- | --- |
| `initial` | `Partial<Record<AnimatableChannel, number>>` | Start frame |
| `target` | `Partial<Record<AnimatableChannel, number>>` | End frame |
| `options.driver` | `"timing" \| "spring"` | Which driver to use |
| `options.duration` | `number` | Default duration for timing presets |
| `options.damping`, `stiffness`, `mass` | `number` | Default spring parameters |

`AnimatableChannel` is `"opacity" | "translateX" | "translateY" | "scale"`. For other channels (rotation, colors, size), use [keyframes](keyframes.html) or an object `animate`.

### Rules

- Names must be lowercase letters, digits and dashes, starting with a letter (`/^[a-z][a-z0-9-]*$/`). Other names throw.
- Calling `definePreset` again with the same name replaces the preset. Built-in names can be replaced too, which changes them app-wide.
- Register presets before rendering. Components that already rendered with the old definition pick up the change the next time their animation is recreated.

### Reading registered presets

`animationPresets` is a read-only record of every registered preset, built-in and custom:

```tsx
import { animationPresets } from "react-native-strx";

Object.keys(animationPresets); // ["fade-in", "fade-out", ..., "pop-in"]
```

If you use TypeScript, the `BuiltInAnimationPreset` type lists the built-in names, and `StrxPreset` is the preset shape.
