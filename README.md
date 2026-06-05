# react-native-strx

<p align="center">
  <img src="https://raw.githubusercontent.com/wangjagom/react-native-strx/main/images/logo.png" alt="react-native-strx logo" width="160" />
</p>

<h1 align="center">react-native-strx</h1>

<p align="center">
  Tailwind-style declarative animation primitives for React Native.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-strx">npm</a>
  ·
  <a href="https://github.com/wangjagom/react-native-strx">GitHub</a>
  ·
  <a href="https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense">VS Code IntelliSense</a>
</p>

Tailwind-style declarative animations and layout transitions for React Native Reanimated.

`react-native-strx` lets you write animation intent directly on React Native primitives:

```tsx
<Strx.View animate="fade-in layout-spring transition-all duration-300" />
```

It supports preset animations, explicit `from:/to:/exit:` keyframes, implicit `transition-*` style transitions, and Reanimated layout transitions.

## Installation

### From npm

```sh
npm install react-native-strx react-native-reanimated
```

> Recommended: install [STRX Animation IntelliSense](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense) for Tailwind-style autocomplete inside `animate=""`.

If your Reanimated version requires Worklets as a separate package, also install:

```sh
npm install react-native-worklets
```

### From GitHub

Use this only when testing unreleased commits:

```sh
npm install github:wangjagom/react-native-strx
```

or with a release tag:

```sh
npm install github:wangjagom/react-native-strx#v0.1.11
```

### Peer dependencies

`react-native-strx` expects these packages to be installed by the consuming app:

- `react` >= 18
- `react-native` >= 0.74
- `react-native-reanimated` >= 3
- `react-native-worklets` when required by your Reanimated version

## Required app setup

### Babel

Reanimated needs its worklet Babel plugin in the consuming app.

For **Reanimated 4**, use `react-native-worklets/plugin` as the last plugin:

```js
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: ["react-native-worklets/plugin"],
};
```

For **Reanimated 3**, use `react-native-reanimated/plugin` as the last plugin:

```js
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: ["react-native-reanimated/plugin"],
};
```

If the app already has plugins, keep the Reanimated/Worklets plugin last.

### iOS

After installing dependencies:

```sh
cd ios
pod install
cd ..
```

or:

```sh
npx pod-install
```

### Metro cache

After first install or Babel changes:

```sh
npx react-native start --reset-cache
```

## Basic Usage

```tsx
import { Strx } from "react-native-strx";

export default function App() {
  return (
    <Strx.Provider
      motionPreset={{ duration: 260, easing: "ease-out", reduceMotion: "system" }}
      debug={__DEV__}
    >
      <Strx.View animate="fade-in layout-spring">
        <Strx.Text>Hello STRX</Strx.Text>
      </Strx.View>
    </Strx.Provider>
  );
}
```

## VS Code IntelliSense

For the best development experience, install **STRX Animation IntelliSense**.

[Install STRX Animation IntelliSense](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense)

The extension provides rich autocomplete suggestions for `animate=""` tokens used by `react-native-strx`.

```tsx
<Strx.View animate="fade-in layout-spring duration-300 ease-out" />
```

It suggests tokens such as:

- `fade-in`
- `slide-up`
- `transition-all`
- `duration-300`
- `layout-spring`
- `from:opacity-0`
- `to:opacity-100`
- `exit:opacity-0`

The runtime package keeps `animate` flexible and accepts custom string tokens. TypeScript still provides minimal token hints for common presets, layout tokens, `transition-*`, and `from:/to:/exit:` prefixes, but string-literal IntelliSense is intentionally lightweight. Install the VS Code extension for rich token autocomplete when typing inside `animate=""`.

## Components

The recommended API is the `Strx` namespace. It keeps animated STRX primitives visually separate from React Native built-ins.

All STRX primitives keep the original React Native component props and event handlers, then add STRX animation props. For example, `Strx.Pressable` still accepts `onPress`, `onPressIn`, and `onLongPress`; `Strx.TextInput` still accepts `value`, `onChangeText`, `onFocus`, and `onBlur`; `Strx.Image` still accepts `source`, `onLoad`, and `onError`.

The built-in namespace includes:

- `Strx.View`
- `Strx.Text`
- `Strx.Pressable`
- `Strx.Image`
- `Strx.ScrollView`
- `Strx.TextInput`
- `Strx.Timeline`
- `Strx.Provider`
- `Strx.DebugOverlay`
- `Strx.LayoutRoot`
- `Strx.LayoutGroup`
- `Strx.useTimeline`

Common STRX props:

| Prop                | Type                                      | Default      | Meaning                                                                                       |
| ------------------- | ----------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `animate`           | `AnimateProp`                             | `undefined`  | Animation token string, animation object, or array.                                           |
| `strxId`            | `string`                                  | `undefined`  | Registers the component as an event-playable target for `Strx.useTimeline`.                   |
| `playback`          | `parallel`, `serial`, or `stagger`        | `parallel`   | Orchestrates array `animate` entries.                                                         |
| `interval`          | `number`                                  | `100`        | Millisecond offset used by `playback="stagger"`.                                             |
| `layoutClip`        | `boolean`                                 | `false`      | Injects `overflow: 'hidden'` while an active layout transition is running.                    |
| `layoutPropagation` | `auto` or `none`                          | `auto`       | Use `none` to stop layout animation demand from bubbling past this subtree.                   |

### `Strx.Provider`

The recommended app or screen root. It installs global motion defaults, OS Reduce Motion handling, event timeline registry, layout registry, and an optional debug overlay.

```tsx
<Strx.Provider
  motionPreset={{
    duration: 260,
    easing: "ease-out",
    reduceMotion: "system",
  }}
  debug={__DEV__}
  debugPosition="bottom-right"
  debugInitialExpanded={false}
>
  <AppScreens />
</Strx.Provider>
```

| Prop           | Type                              | Default     | Meaning                                                                 |
| -------------- | --------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `motionPreset` | `{ duration?, easing?: StrxEasingName, reduceMotion? }` | `undefined` | Global fallback motion settings used when tokens do not override them. |
| `reduceMotion` | `system`, `always`, or `never`    | `system`    | Overrides `motionPreset.reduceMotion` for the subtree.                 |
| `debug`        | `boolean`                         | `false`     | Shows `Strx.DebugOverlay` with aggregate runtime counts.               |
| `debugPosition` | `top-left`, `top-right`, `bottom-left`, or `bottom-right` | `bottom-right` | Chooses the debug overlay corner. |
| `debugInitialExpanded` | `boolean` | `false` | Starts the overlay expanded instead of as a compact pill. |
| `debugShowMotionPreview` | `boolean` | `true` | Shows a tiny visual timing/easing preview. |

`StrxEasingName` autocompletes `linear`, `ease`, `ease-in`, `ease-out`, and `ease-in-out`, while still allowing custom string names for userland easing adapters.

When Reduce Motion is enabled, STRX shortens explicit/style animation duration, removes delay/repeat, and turns layout transitions into stable no-op transitions. This keeps the UI accessible without changing component code.

### `Strx.DebugOverlay`

`Strx.Provider debug` renders this automatically. The overlay starts collapsed so it does not cover the screen; tap the STRX pill to expand the full HUD. You can also mount it manually under a provider:

```tsx
<Strx.DebugOverlay
  enabled={__DEV__}
  position="bottom-left"
  initialExpanded={false}
  showMotionPreview
/>
```

The expanded HUD shows aggregate counts, the last sanitized STRX event, dev warnings, parser cache size, active motion policy, and a tiny visual timing/easing preview. It intentionally avoids exposing coordinates, node IDs, or user-provided target names.

### `Strx.View`

The primary animated container. Use it for preset animations, explicit `from:/to:/exit:` keyframes, implicit `transition-*` style transitions, and Reanimated layout transitions.

```tsx
<Strx.View animate="fade-in layout-spring duration-300">
  <Strx.Text>Card content</Strx.Text>
</Strx.View>
```

### `Strx.Text`

A layout-aware text primitive. It supports direct `animate` tokens and also participates in inherited layout transitions from `Strx.View` and `Strx.LayoutGroup`.

```tsx
<Strx.Text animate="fade-in from:translate-y-8 to:translate-y-0">
  Animated text
</Strx.Text>
```

### `Strx.Pressable`

A layout-aware press target for buttons and touchable rows. It supports direct `animate` tokens and implicit transitions for style changes caused by pressed, selected, or disabled state.

```tsx
<Strx.Pressable
  animate="transition-transform duration-150"
  onPress={onToggle}
  style={({ pressed }) => ({
    transform: [{ scale: pressed ? 0.96 : 1 }],
  })}
>
  <Strx.Text>Toggle</Strx.Text>
</Strx.Pressable>
```

### `Strx.Image`

An animated image primitive for image entrance, fade, scale, and layout transitions. Keep image dimensions explicit, as React Native images without dimensions may not render predictably.

```tsx
<Strx.Image
  animate="fade-in scale-in layout-linear"
  source={{ uri: avatarUrl }}
  style={{ width: 72, height: 72, borderRadius: 36 }}
/>
```

### `Strx.ScrollView`

A scroll container that can receive layout transitions and provide STRX layout context to children. Use it for screens where sections expand, collapse, or shift inside a scrollable area.

```tsx
<Strx.ScrollView animate="layout-linear" contentContainerStyle={{ gap: 12 }}>
  <Strx.View animate="fade-in layout-spring" />
</Strx.ScrollView>
```

### `Strx.TextInput`

An animated input primitive for focus, validation, and color/spacing transitions. Prefer `transition-colors` for focus rings and validation states.

```tsx
<Strx.TextInput
  animate="transition-colors duration-200"
  value={value}
  onChangeText={setValue}
  style={{ borderColor: focused ? "#2563eb" : "#d1d5db" }}
/>
```

### `Strx.Timeline`

A wrapper for entrance choreography. It injects timing into child `animate` props without changing the child components themselves.

```tsx
<Strx.Timeline playback="stagger" interval={80} playCount={1}>
  <Strx.View animate="fade-in slide-up" />
  <Strx.View animate="fade-in slide-up" />
  <Strx.View animate="fade-in slide-up" />
</Strx.Timeline>
```

`Strx.Timeline` props:

| Prop        | Type                               | Default     | Meaning                                                                                 |
| ----------- | ---------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `playback`  | `parallel`, `serial`, or `stagger` | `parallel`  | Controls how child animations are scheduled.                                            |
| `interval`  | `number`                           | `100`       | Millisecond offset between children when `playback="stagger"`.                         |
| `playCount` | `number` or `infinite`             | `undefined` | Repeats the whole child choreography a fixed number of total plays, or indefinitely.    |
| `children`  | `ReactNode`                        | required    | Child elements whose `animate` props should be orchestrated.                            |

### `Strx.LayoutRoot`

Low-level root provider for event timelines and layout propagation. Most apps should use `Strx.Provider`; use `Strx.LayoutRoot` directly only when you want the registry without global motion settings.

```tsx
<Strx.LayoutRoot>
  <ScreenContent />
</Strx.LayoutRoot>
```

### `Strx.LayoutGroup`

A provider that gives descendants a shared default layout transition. Use it when nearby components should animate size and position changes as one coordinated region.

```tsx
<Strx.LayoutGroup transition="spring" duration={420} damping={16}>
  <Strx.View animate="layout-spring" />
  <Strx.View animate="layout-spring" />
</Strx.LayoutGroup>
```

`Strx.LayoutGroup` props:

| Prop         | Type                 | Default              | Meaning                                                |
| ------------ | -------------------- | -------------------- | ------------------------------------------------------ |
| `id`         | `string`             | `undefined`          | Optional identifier for debugging or coordination.     |
| `transition` | `linear` or `spring` | `linear`             | Default layout transition inherited by descendants.    |
| `duration`   | `number`             | `300` or `400`       | Transition duration in milliseconds.                   |
| `damping`    | `number`             | `15`                 | Spring damping when `transition="spring"`.             |
| `children`   | `ReactNode`          | required             | Descendant STRX nodes that share the transition.       |

### `createStrxComponent`

Use `createStrxComponent` to adapt your own component to STRX. The wrapped component receives `animate`, `layoutClip`, `layoutPropagation`, `playback`, `interval`, and `strxId` while preserving its original props and style type when possible.

```tsx
import { createStrxComponent } from "react-native-strx";
import { SafeAreaView } from "react-native-safe-area-context";

const StrxSafeAreaView = createStrxComponent(SafeAreaView, {
  displayName: "Strx.SafeAreaView",
});

<StrxSafeAreaView animate="fade-in layout-linear" />;
```

Security and stability notes:

- `animate` strings are capped and cached before parsing to avoid repeated heavy work.
- Layout transitions keep a stable no-op worklet when inactive, which avoids native layout tree churn.
- Use `layoutPropagation="none"` around untrusted or independent subtrees to stop layout demand bubbling.
- `layoutClip` is opt-in so text and images are not clipped unexpectedly.

## Token Reference

`animate` accepts token strings, comma-separated preset groups, arrays, and object configs.

The recommended import style is the namespace API, which keeps STRX components visually distinct from React Native built-ins:

```tsx
import { Strx } from "react-native-strx";

<Strx.View animate="fade-in" />;
```

Alias exports are also available: `StrxView`, `StrxText`, `StrxPressable`, `StrxImage`, `StrxScrollView`, and `StrxTextInput`. The plain component exports remain for backward compatibility.

```tsx
<Strx.View animate="fade-in layout-spring transition-all duration-300 ease-out" />
```

### Composition rules

Use spaces to combine one preset with timing, layout, transition, and keyframe tokens:

```tsx
<Strx.View animate="fade-in layout-spring duration-300 ease-out" />
```

Use commas when you want multiple presets to participate in one animation plan:

```tsx
<Strx.View animate="fade-in, slide-up, scale-in duration-400" />
```

You can also pass an array. Array entries are normalized in declaration order and then merged into a single plan:

```tsx
<Strx.View
  animate={[
    'fade-in duration-250',
    'slide-up duration-300 delay-100',
    { from: { scale: 0.96 }, to: { scale: 1 }, duration: 300 },
  ]}
/>
```

Most composition runs in parallel. Use `delay-*` when you want a staged sequence. If two entries animate the same style or transform channel, the later entry wins for that channel.

For array entries on a single component, use `playback` when you want STRX to orchestrate the entries for you:

```tsx
<Strx.View
  playback="serial"
  animate={['fade-in duration-200', 'slide-up duration-300']}
/>
```

`playback="parallel"` starts array entries together. `playback="serial"` starts the next entry after the previous entry's own `delay-*` and duration finish. `playback="stagger"` starts entries at `interval` millisecond offsets, and previous entries' explicit `delay-*` values push later stagger entries back as well.

### Preset tokens

Preset tokens create an explicit animation plan with predefined `from` and `to` values.

The `Default motion` values below are STRX preset defaults, not Reanimated defaults. They were chosen as opinionated starter timings for each motion family, and you can override them with tokens such as `duration-500`, `ease-out`, `linear`, or object configs.

| Token         | Starts from                      | Animates to                 | Default motion                             |
| ------------- | -------------------------------- | --------------------------- | ------------------------------------------ |
| `fade-in`     | `opacity: 0`                     | `opacity: 1`                | timing, 300ms                              |
| `fade-out`    | `opacity: 1`                     | `opacity: 0`                | timing, 250ms                              |
| `slide-up`    | `translateY: 24`                 | `translateY: 0`             | timing, 320ms                              |
| `slide-down`  | `translateY: -24`                | `translateY: 0`             | timing, 320ms                              |
| `slide-left`  | `translateX: 24`                 | `translateX: 0`             | timing, 320ms                              |
| `slide-right` | `translateX: -24`                | `translateX: 0`             | timing, 320ms                              |
| `scale-in`    | `scale: 0.92`                    | `scale: 1`                  | timing, 260ms                              |
| `scale-up`    | `scale: 0.92`                    | `scale: 1`                  | timing, 260ms                              |
| `scale-down`  | `scale: 1.08`                    | `scale: 1`                  | timing, 260ms                              |
| `scale-out`   | `scale: 1`                       | `scale: 0.92`               | timing, 220ms                              |
| `bounce`      | `translateY: -16`, `scale: 0.96` | `translateY: 0`, `scale: 1` | spring, damping 8, stiffness 180, mass 0.9 |

### Timing tokens

Timing tokens configure preset, `from:/to:`, `exit:`, and `transition-*` animations.

| Token             | Meaning                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| `duration-300`    | Sets duration to `300` milliseconds. Any finite number is accepted.    |
| `delay-100`       | Delays animation by `100` milliseconds. Any finite number is accepted. |
| `repeat-2`        | Repeats explicit preset/from-to animation 2 times.                     |
| `repeat-infinite` | Repeats explicit preset/from-to animation indefinitely.                |
| `play-3`          | Plays the full animation 3 total times, then stops.                    |
| `play-infinite`   | Plays the full animation indefinitely.                                 |
| `linear`          | Linear easing.                                                         |
| `ease`            | Smoothstep default easing.                                             |
| `ease-in`         | Cubic ease-in.                                                         |
| `ease-out`        | Cubic ease-out.                                                        |
| `ease-in-out`     | Cubic ease-in-out.                                                     |

### Explicit keyframe prefixes

Prefix tokens turn a Tailwind-like utility into a `from`, `to`, or `exit` style.

| Prefix   | Meaning                                    |
| -------- | ------------------------------------------ |
| `from:*` | Initial style before the animation starts. |
| `to:*`   | Target style for the animation.            |
| `exit:*` | Style used when the component exits.       |

Supported prefixed utilities:

| Utility                      | Result                                                |
| ---------------------------- | ----------------------------------------------------- |
| `opacity-0` to `opacity-100` | `opacity` from `0` to `1`. Values are divided by 100. |
| `translate-x-20`             | `translateX: 20`                                      |
| `-translate-x-20`            | `translateX: -20`                                     |
| `translate-y-20`             | `translateY: 20`                                      |
| `-translate-y-20`            | `translateY: -20`                                     |
| `scale-90`                   | `scale: 0.9`                                          |
| `scale-x-95`                 | `scaleX: 0.95`                                        |
| `scale-y-105`                | `scaleY: 1.05`                                        |
| `rotate-45`                  | `rotate: '45deg'`                                     |
| `-rotate-45`                 | `rotate: '-45deg'`                                    |
| `w-120`                      | `width: 120`                                          |
| `h-80`                       | `height: 80`                                          |

Example:

```tsx
<Strx.View animate="from:opacity-0 from:-translate-y-20 to:opacity-100 to:translate-y-0 exit:opacity-0 duration-300" />
```

### Implicit transition tokens

Transition tokens animate changes in the static `style` prop. They compare the previous animatable style snapshot with the next one and animate only changed channels.

| Token                          | Animated style subset                                                             |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `transition`, `transition-all` | All supported numeric/color/transform channels.                                   |
| `transition-colors`            | Color style keys such as `backgroundColor`, `borderColor`, `borderTopColor`, etc. |
| `transition-opacity`           | `opacity` only.                                                                   |
| `transition-transform`         | Transform channels such as `translateX`, `translateY`, `scale`, `rotate`, etc.    |
| `transition-spacing`           | `margin*` and `padding*` keys.                                                    |
| `transition-layout`            | `width`, `height`, min/max dimensions, and positional keys.                       |

Example:

```tsx
<Strx.View
  animate="transition-colors duration-250 ease-out"
  style={{ backgroundColor: active ? "#22c55e" : "#ef4444" }}
/>
```

### Layout tokens

Layout tokens are passed to Reanimated's `layout` prop through stable worklet transitions. They animate native layout changes such as size and position changes.

| Token                  | Behavior                                                                   |
| ---------------------- | -------------------------------------------------------------------------- |
| `layout-linear`        | 300ms timing layout transition.                                            |
| `layout-spring`        | Spring layout transition with damping 15, stiffness 120, mass 1.           |
| `layout-fade`          | 300ms timing layout transition with opacity fade-in.                       |
| `layout-spring-stiff`  | Stiffer spring layout transition with damping 20, stiffness 180, mass 0.9. |
| `layout-spring-bouncy` | Bouncier spring layout transition with damping 10, stiffness 105, mass 1.  |

`layout` is never toggled to `undefined`; inactive nodes receive a stable no-op layout worklet to keep the Reanimated native layout tree stable.

### Component props

| Prop                | Component                                                             | Meaning                                                                                       |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `animate`           | All STRX primitives and custom factory components                     | Animation token string or animation object/array.                                             |
| `strxId`            | All STRX primitives and custom factory components                     | Registers the component as an event-playable target for `Strx.useTimeline`.                   |
| `playback`          | All STRX primitives and custom factory components                     | Orchestrates array `animate` entries as `parallel`, `serial`, or `stagger`. Default is `parallel`. |
| `interval`          | All STRX primitives and custom factory components                     | Millisecond offset used by `playback="stagger"`. Default is `100`.                           |
| `layoutClip`        | All STRX primitives and custom factory components                     | When `true`, injects `overflow: 'hidden'` during active layout animation. Default is `false`. |
| `layoutPropagation` | All STRX primitives and custom factory components                     | Use `layoutPropagation="none"` to stop layout demand from bubbling past this boundary.        |
| `playCount`         | `Strx.Timeline`                                                       | Repeats the whole child choreography cycle a fixed number of total plays, or `infinite`.      |

## Event timelines

Use `Strx.useTimeline` when an animation should run from an event instead of immediately from render. Targets are registered with `strxId`, and `timeline.play()` drives their Reanimated shared values directly without calling React state setters.

```tsx
import { Strx } from "react-native-strx";

function SuccessCard() {
  return (
    <Strx.Provider>
      <SuccessCardContent />
    </Strx.Provider>
  );
}

function SuccessCardContent() {
  const timeline = Strx.useTimeline({
    playback: "stagger",
    interval: 80,
    playables: [
      { target: "coin", animate: "scale-in fade-in duration-280 delay-300" },
      { target: "title", animate: "fade-in slide-up duration-260" },
      { target: "button", animate: "fade-in slide-up duration-240" },
    ],
    onComplete: () => {
      console.log("Timeline finished");
    },
  });

  return (
    <>
      <Strx.View strxId="coin" />
      <Strx.Text strxId="title">송금 완료</Strx.Text>
      <Strx.Pressable strxId="button" onPress={timeline.play}>
        <Strx.Text>다시 보기</Strx.Text>
      </Strx.Pressable>
      <Strx.Pressable onPress={timeline.reverse}>
        <Strx.Text>되감기</Strx.Text>
      </Strx.Pressable>
    </>
  );
}
```

Timeline controls:

- `timeline.play()` starts all registered target animations.
- `timeline.reverse()` starts the same target animations from each declared `to` frame back to `from`.
- `timeline.reset()` immediately returns targets to their declared `from` frames.
- `timeline.stop()` cancels pending frame starts and running animations.
- `playback="parallel"` starts all targets together.
- `playback="serial"` starts each target after the previous target's estimated `delay + duration` window.
- `playback="stagger"` starts targets at `interval` millisecond offsets, with previous targets' explicit `delay-*` values added to later offsets.

`Strx.useTimeline` options:

| Option      | Type                               | Default     | Meaning                                                                            |
| ----------- | ---------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `playables` | `{ target: string; animate: AnimateProp }[]` | required    | Target animations controlled by this timeline. `target` must match a component `strxId`. |
| `playback`  | `parallel`, `serial`, or `stagger` | `parallel`  | Controls how target animations are scheduled.                                      |
| `interval`  | `number`                           | `100`       | Millisecond offset between targets when `playback="stagger"`.                     |
| `playCount` | `number` or `infinite`             | `undefined` | Number of times each target animation should play.                                |
| `onComplete` | `() => void`                      | `undefined` | Called once after a finite `play()` or `reverse()` timeline is expected to finish. |

Returned controller:

| Function             | Meaning                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `timeline.play()`    | Starts all configured target animations.                                 |
| `timeline.reverse()` | Starts all configured target animations as declared `to -> from` motion. |
| `timeline.reset()`   | Immediately returns all configured targets to their declared `from` frames. |
| `timeline.stop()`    | Cancels pending starts and running animations for all configured targets. |

`Strx.useTimeline` must run under `Strx.Provider` or `Strx.LayoutRoot`, because the root owns the target registry.

`timeline.reverse()` is a declarative reverse pass. It uses the same playback schedule, interval, and play count as `timeline.play()`, but swaps each target's normalized `from` and `to` frames. It does not scrub an already-running animation from its exact current progress value.

## Preset animations

```tsx
<Strx.View animate="fade-in duration-500 ease-out">
  <Strx.Text>Fade in</Strx.Text>
</Strx.View>
```

Common tokens:

- `fade-in`
- `fade-out`
- `slide-up`
- `slide-down`
- `slide-left`
- `slide-right`
- `scale-in`
- `scale-out`
- `scale-up`
- `scale-down`
- `bounce`
- `duration-300`
- `delay-100`
- `ease`, `ease-in`, `ease-out`, `ease-in-out`, `linear`
- `repeat-2`, `repeat-infinite`
- `play-3`, `play-infinite`

## Explicit keyframes: from:/to:/exit:

```tsx
<Strx.View animate="from:opacity-0 from:translate-y-20 to:opacity-100 to:translate-y-0 exit:opacity-0 duration-300">
  <Strx.Text>Animated content</Strx.Text>
</Strx.View>
```

Supported utility examples:

- `from:opacity-0`, `to:opacity-100`, `exit:opacity-0`
- `from:translate-y-20`, `from:-translate-y-20`, `to:translate-y-0`
- `from:translate-x-20`, `to:translate-x-0`
- `from:scale-90`, `to:scale-100`
- `from:rotate-45`, `to:rotate-0`

## Implicit style transitions

Animate changes in the static `style` prop:

```tsx
<Strx.View
  animate="transition-all duration-300 ease-out"
  style={{
    width: open ? 220 : 120,
    opacity: open ? 1 : 0.5,
    backgroundColor: open ? "#4f46e5" : "#e5e7eb",
    transform: [{ scale: open ? 1 : 0.92 }],
  }}
/>
```

Supported transition tokens:

- `transition`, `transition-all`
- `transition-colors`
- `transition-opacity`
- `transition-transform`
- `transition-spacing`
- `transition-layout`

## Layout transitions

```tsx
<Strx.View animate="layout-spring">
  {open && <Strx.Text>Expanded content</Strx.Text>}
</Strx.View>
```

Supported layout tokens:

- `layout-linear`
- `layout-spring`
- `layout-fade`
- `layout-spring-stiff`
- `layout-spring-bouncy`

## Layout isolation

Use `layoutPropagation="none"` to isolate untrusted or independent subtrees:

```tsx
<Strx.View layoutPropagation="none">
  <Strx.View animate="layout-spring">
    <Strx.Text>This layout demand stays inside this boundary.</Strx.Text>
  </Strx.View>
</Strx.View>
```

## Clipping

`layoutClip` is opt-in. By default, STRX does not inject `overflow: 'hidden'` so text is not clipped unexpectedly.

```tsx
<Strx.View animate="layout-spring" layoutClip>
  {open && <Strx.Text>Clipped expandable content</Strx.Text>}
</Strx.View>
```

## Production notes

- Use `Strx.LayoutRoot` near the screen or app root.
- Prefer the namespace API, such as `Strx.View`, `Strx.Text`, `Strx.Pressable`, `Strx.Image`, `Strx.ScrollView`, and `Strx.TextInput`, for animated regions.
- Alias exports are also available for teams that prefer named imports.
- Keep `react-native-worklets/plugin` last for Reanimated 4, or `react-native-reanimated/plugin` last for Reanimated 3.
- Run `pod install` for iOS after installing Reanimated.
- Reset Metro cache after installation or Babel changes.
- Install [STRX Animation IntelliSense](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense) for the best `animate=""` authoring experience in VS Code.

## License

MIT
