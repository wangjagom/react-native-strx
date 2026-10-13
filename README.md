# react-native-strx

<p align="center">
  <img src="https://raw.githubusercontent.com/wangjagom/react-native-strx/main/images/logo.png" alt="react-native-strx logo" width="160" />
</p>

<h1 align="center">react-native-strx</h1>

<p align="center">
  Tailwind-style declarative animation primitives for React Native.
</p>

<p align="center">
  <a href="https://wangjagom.github.io/react-native-strx/">Documentation</a>
  ·
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

> Full documentation with live previews: **[wangjagom.github.io/react-native-strx](https://wangjagom.github.io/react-native-strx/)**. Upgrading from 0.1.x? See [MIGRATION.md](./MIGRATION.md).

## Installation

### From npm

```sh
npm install react-native-strx@beta react-native-reanimated react-native-worklets
```

> This README documents the 1.0 beta, published under the `beta` tag. The npm `latest` tag still points to 0.1.x (Reanimated 3), so a plain `npm install react-native-strx` installs 0.1.x until 1.0.0 is released.

For Expo apps, prefer `npx expo install react-native-reanimated react-native-worklets` so the versions match your SDK.

> Recommended: install [STRX Animation IntelliSense](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense) for Tailwind-style autocomplete inside `animate=""`.

### From GitHub

Use this only when testing unreleased commits:

```sh
npm install github:wangjagom/react-native-strx
```

or with a release tag:

```sh
npm install github:wangjagom/react-native-strx#v1.0.0-beta.0
```

### Peer dependencies

`react-native-strx` expects these packages to be installed by the consuming app:

- `react` >= 19
- `react-native` >= 0.78 with the New Architecture
- `react-native-reanimated` >= 4.1
- `react-native-worklets` >= 0.5

Reanimated 3 is no longer supported; use `react-native-strx@0.1.x` with Reanimated 3.

## Required app setup

### Babel

Reanimated needs its worklet Babel plugin in the consuming app. Use `react-native-worklets/plugin` as the last plugin (Expo's `babel-preset-expo` already includes it):

```js
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: ["react-native-worklets/plugin"],
};
```

If the app already has plugins, keep the Worklets plugin last.

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
- `Strx.TimelineRoot`
- `Strx.LayoutGroup`
- `Strx.useTimeline`

Common STRX props:

| Prop                | Type                                      | Default      | Meaning                                                                                       |
| ------------------- | ----------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `animate`           | `AnimateProp`                             | `undefined`  | Animation token string, animation object, or array.                                           |
| `strxId`            | `string`                                  | `undefined`  | Registers the component as an event-playable target for `Strx.useTimeline`.                   |
| `playback`          | `parallel`, `serial`, or `stagger`        | `parallel`   | Orchestrates array `animate` entries.                                                         |
| `interval`          | `number`                                  | `100`        | Millisecond offset used by `playback="stagger"`.                                             |
| `layoutClip`        | `boolean`                                 | `false`      | Injects `overflow: 'hidden'` while a layout transition applies to this node.                  |
| `layoutPropagation` | `auto` or `none`                          | `auto`       | `none` ignores layout transitions inherited from ancestors (see Layout transitions).          |

### `Strx.Provider`

The recommended app or screen root. It installs global motion defaults, OS Reduce Motion handling, and the event timeline registry.

```tsx
<Strx.Provider
  motionPreset={{
    duration: 260,
    easing: "ease-out",
    reduceMotion: "system",
  }}
>
  <AppScreens />
</Strx.Provider>
```

| Prop           | Type                              | Default     | Meaning                                                                 |
| -------------- | --------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `motionPreset` | `{ duration?, easing?: StrxEasingName, reduceMotion? }` | `undefined` | Global fallback motion settings used when tokens do not override them. |
| `reduceMotion` | `system`, `always`, or `never`    | `system`    | Overrides `motionPreset.reduceMotion` for the subtree.                 |

`StrxEasingName` autocompletes `linear`, `ease`, `ease-in`, `ease-out`, and `ease-in-out`, while still allowing custom string names for userland easing adapters.

When Reduce Motion is enabled, STRX shortens explicit/style animation duration, removes delay/repeat, and turns layout transitions into stable no-op transitions. This keeps the UI accessible without changing component code.

### `useStrxMotion`

Reads the motion settings `Strx.Provider` resolved for the subtree. Use it to make your own animations (or skip them) consistently with STRX, for example honoring Reduce Motion:

```tsx
import { useStrxMotion } from "react-native-strx";

function Confetti() {
  const { isReduceMotionEnabled, duration, easing, reduceMotion } = useStrxMotion();
  if (isReduceMotionEnabled) return null;
  // ...
}
```

`duration` and `easing` are `undefined` unless the provider's `motionPreset` sets them. Outside a provider the hook returns `{ reduceMotion: "system", isReduceMotionEnabled: false }`.

### Debug overlay

The development overlay lives in a separate entry point so it never ships in the main bundle. Render it inside `Strx.Provider`:

```tsx
import { StrxDebugOverlay } from "react-native-strx/debug";

<Strx.Provider>
  <AppScreens />
  {__DEV__ && <StrxDebugOverlay position="bottom-left" />}
</Strx.Provider>;
```

| Prop                | Type                                                       | Default        | Meaning                                       |
| ------------------- | ---------------------------------------------------------- | -------------- | --------------------------------------------- |
| `enabled`           | `boolean`                                                  | `true`         | Renders nothing and stops polling when false. |
| `position`          | `top-left`, `top-right`, `bottom-left`, or `bottom-right` | `bottom-right` | Screen corner.                                |
| `initialExpanded`   | `boolean`                                                  | `false`        | Starts expanded instead of as a compact pill. |
| `showMotionPreview` | `boolean`                                                  | `true`         | Shows a small easing/timing preview.          |

The expanded HUD shows the number of timeline targets, the latest timeline event, recent dev warnings, the parser cache size, the active motion policy, and an easing preview.

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
  animate="fade-in, scale-in layout-linear"
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
  <Strx.View animate="fade-in from:translate-y-12" />
  <Strx.View animate="fade-in from:translate-y-12" />
  <Strx.View animate="fade-in from:translate-y-12" />
</Strx.Timeline>
```

`Strx.Timeline` props:

| Prop        | Type                               | Default     | Meaning                                                                                 |
| ----------- | ---------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `playback`  | `parallel`, `serial`, or `stagger` | `parallel`  | Controls how child animations are scheduled.                                            |
| `interval`  | `number`                           | `100`       | Millisecond offset between children when `playback="stagger"`.                         |
| `playCount` | `number` or `infinite`             | `undefined` | Repeats the whole child choreography a fixed number of total plays, or indefinitely.    |
| `children`  | `ReactNode`                        | required    | Child elements whose `animate` props should be orchestrated.                            |

### `Strx.TimelineRoot`

Low-level root provider for the event timeline registry (`strxId` + `Strx.useTimeline`). Most apps should use `Strx.Provider`, which includes it; use `Strx.TimelineRoot` directly only when you want the registry without global motion settings.

```tsx
<Strx.TimelineRoot>
  <ScreenContent />
</Strx.TimelineRoot>
```

### `Strx.LayoutGroup`

A provider that gives every STRX descendant a shared layout transition. Use it when nearby components should animate size and position changes as one coordinated region, without adding a `layout-*` token to each of them. The nearest group wins over transitions inherited from STRX ancestors outside it.

```tsx
<Strx.LayoutGroup transition="spring" damping={16}>
  {items.map(item => (
    <Strx.View key={item.id} animate="exit:opacity-0" />
  ))}
</Strx.LayoutGroup>
```

`Strx.LayoutGroup` props:

| Prop         | Type                 | Default              | Meaning                                                |
| ------------ | -------------------- | -------------------- | ------------------------------------------------------ |
| `id`         | `string`             | `undefined`          | Optional identifier for debugging or coordination.     |
| `transition` | `linear` or `spring` | `linear`             | Default layout transition inherited by descendants.    |
| `duration`   | `number`             | `300`                | Duration in milliseconds for `transition="linear"`.    |
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

The full token list also ships as machine-readable JSON at `react-native-strx/tokens.json` (presets with their values, easings, timing and keyframe prefixes, transitions, and layout tokens). Editor tooling such as STRX Animation IntelliSense reads it so completions match the installed version:

```ts
import tokens from "react-native-strx/tokens.json";

tokens.presets.map((p) => p.name); // ["fade-in", "fade-out", ...]
```

Named exports are also available for teams that prefer them: `StrxView`, `StrxText`, `StrxPressable`, `StrxImage`, `StrxScrollView`, `StrxTextInput`, `StrxTimeline`, `StrxProvider`, `StrxLayoutGroup`, and `StrxTimelineRoot`. Components are not exported under React Native's own names (`View`, `Text`, ...) to avoid shadowing them.

```tsx
<Strx.View animate="fade-in layout-spring transition-all duration-300 ease-out" />
```

### Composition rules

Use spaces to combine one preset with timing, layout, transition, and keyframe tokens. Token order inside a group does not matter:

```tsx
<Strx.View animate="fade-in layout-spring duration-300 ease-out" />
```

Each comma-separated part is a **group**. Timing tokens (`duration-*`, `delay-*`, easing, ...) apply to the preset, keyframes, `exit:`, and `transition-*` tokens in their own group.

A group may combine a preset with `from:/to:` keyframes. Keyframes override the preset per channel:

```tsx
// fade-in, but slide from 8px below instead of the default
<Strx.View animate="fade-in from:translate-y-8" />
```

Only one preset is allowed per group. Unknown or invalid tokens are ignored and reported once with a `console.warn` in development builds, including a suggestion when a close match exists (for example `fade-inn` → `fade-in`).

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

The `Default motion` values below are STRX preset defaults, not Reanimated defaults. Override them with tokens such as `duration-500`, `ease-out`, `linear`, or object configs.

Register your own presets with `definePreset` at module scope, before components using them render:

```tsx
import { definePreset } from "react-native-strx";

definePreset("pop-in", {
  initial: { opacity: 0, scale: 0.8 },
  target: { opacity: 1, scale: 1 },
  options: { driver: "spring", damping: 12, stiffness: 200 },
});

<Strx.View animate="pop-in" />;
```

`animationPresets` is a read-only view of the preset registry, built-ins plus anything registered with `definePreset`. Use it to list presets or inspect their values:

```tsx
import { animationPresets } from "react-native-strx";

Object.keys(animationPresets); // ["fade-in", "fade-out", ..., "pop-in"]
animationPresets["slide-up"].initial; // { translateY: 24 }
```

<!-- generated:presets -->

| Token | Starts from | Animates to | Default motion |
| --- | --- | --- | --- |
| `fade-in` | `opacity: 0` | `opacity: 1` | timing, 300ms |
| `fade-out` | `opacity: 1` | `opacity: 0` | timing, 250ms |
| `slide-up` | `translateY: 24` | `translateY: 0` | timing, 320ms |
| `slide-down` | `translateY: -24` | `translateY: 0` | timing, 320ms |
| `slide-left` | `translateX: 24` | `translateX: 0` | timing, 320ms |
| `slide-right` | `translateX: -24` | `translateX: 0` | timing, 320ms |
| `scale-up` | `scale: 0.92` | `scale: 1` | timing, 260ms |
| `scale-in` | `scale: 0.92` | `scale: 1` | timing, 260ms |
| `scale-down` | `scale: 1.08` | `scale: 1` | timing, 260ms |
| `scale-out` | `scale: 1` | `scale: 0.92` | timing, 220ms |
| `bounce` | `translateY: -16`, `scale: 0.96` | `translateY: 0`, `scale: 1` | spring, damping 8, stiffness 180, mass 0.9 |

<!-- /generated:presets -->

### Timing tokens

Timing tokens configure preset, `from:/to:`, `exit:`, and `transition-*` animations.

<!-- generated:timing -->

| Token | Meaning |
| --- | --- |
| `duration-300` | Duration in milliseconds. Precedence: token or object → preset default → `Strx.Provider` duration → 300ms. |
| `delay-100` | Delay in milliseconds before the animation starts. |
| `play-3`, `play-infinite` | Total number of plays. Positive integers only. |
| `repeat-3`, `repeat-infinite` | Same as `play-*`; kept for compatibility. |
| `linear` | Linear easing. |
| `ease` | Smoothstep easing. |
| `ease-in` | Cubic ease-in. |
| `ease-out` | Cubic ease-out. Default when no easing is set. |
| `ease-in-out` | Cubic ease-in-out. |
| `spring` | Uses the spring driver for numeric channels. |
| `damping-12`, `stiffness-180`, `mass-1` | Spring parameters. Defaults: damping 10, stiffness 100, mass 1. |

Numbers are unsigned decimals such as `300` or `0.5`. Without an easing token, animations use `ease-out` or the provider's easing.

<!-- /generated:timing -->

### Explicit keyframe prefixes

Prefix tokens turn a Tailwind-like utility into a `from`, `to`, or `exit` style.

| Prefix   | Meaning                                    |
| -------- | ------------------------------------------ |
| `from:*` | Initial style before the animation starts. |
| `to:*`   | Target style for the animation.            |
| `exit:*` | Style used when the component exits.       |

Supported prefixed utilities:

<!-- generated:utilities -->

| Utility | Result | Negative form |
| --- | --- | --- |
| `opacity-50` | `opacity: 0.5` | — |
| `translate-x-20` | `translateX: 20` | `-translate-x-20` |
| `translate-y-20` | `translateY: 20` | `-translate-y-20` |
| `scale-x-95` | `scaleX: 0.95` | — |
| `scale-y-105` | `scaleY: 1.05` | — |
| `scale-90` | `scale: 0.9` | — |
| `rotate-45` | `rotate: '45deg'` | `-rotate-45` |
| `w-120` | `width: 120` | — |
| `h-80` | `height: 80` | — |

<!-- /generated:utilities -->

Example:

```tsx
<Strx.View animate="from:opacity-0 from:-translate-y-20 to:opacity-100 to:translate-y-0 exit:opacity-0 duration-300" />
```

### Implicit transition tokens

Transition tokens animate changes in the static `style` prop. They compare the previous animatable style snapshot with the next one and animate only changed channels.

<!-- generated:transitions -->

| Token | Animated style subset |
| --- | --- |
| `transition`, `transition-all` | All supported numeric, color, and transform channels. |
| `transition-colors` | Color keys such as `backgroundColor` and `borderColor`. |
| `transition-opacity` | `opacity` only. |
| `transition-transform` | Transform channels such as `translateX`, `scale`, and `rotate`. |
| `transition-spacing` | `margin*` and `padding*` keys. |
| `transition-layout` | `width`, `height`, min/max sizes, and `top`/`right`/`bottom`/`left`. |

<!-- /generated:transitions -->

Example:

```tsx
<Strx.View
  animate="transition-colors duration-250 ease-out"
  style={{ backgroundColor: active ? "#22c55e" : "#ef4444" }}
/>
```

### Layout tokens

Layout tokens are passed to Reanimated's `layout` prop. They animate native size and position changes. See [Layout transitions](#layout-transitions) for inheritance rules.

<!-- generated:layout -->

| Token | Behavior | Motion |
| --- | --- | --- |
| `layout-linear` | Timing transition. | 300ms, or `duration-*` / provider duration |
| `layout-spring` | Spring transition. | damping 15, stiffness 120, mass 1 |
| `layout-fade` | Timing transition that also fades the view in. | 300ms, or `duration-*` / provider duration |
| `layout-spring-stiff` | Stiffer spring transition. | damping 20, stiffness 180, mass 0.9 |
| `layout-spring-bouncy` | Bouncier spring transition. | damping 10, stiffness 105, mass 1 |

<!-- /generated:layout -->

Components without a layout transition get no Reanimated `layout` prop at all, so they carry no layout-animation cost. Once a component has had a layout transition, it keeps a no-op transition instead of toggling the prop back off.

### Component props

| Prop                | Component                                                             | Meaning                                                                                       |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `animate`           | All STRX primitives and custom factory components                     | Animation token string or animation object/array.                                             |
| `strxId`            | All STRX primitives and custom factory components                     | Registers the component as an event-playable target for `Strx.useTimeline`.                   |
| `playback`          | All STRX primitives and custom factory components                     | Orchestrates array `animate` entries as `parallel`, `serial`, or `stagger`. Default is `parallel`. |
| `interval`          | All STRX primitives and custom factory components                     | Millisecond offset used by `playback="stagger"`. Default is `100`.                           |
| `layoutClip`        | All STRX primitives and custom factory components                     | When `true`, injects `overflow: 'hidden'` while a layout transition applies. Default is `false`. |
| `layoutPropagation` | All STRX primitives and custom factory components                     | `none` ignores layout transitions inherited from ancestors. Default is `auto`.                |
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
      { target: "coin", animate: "scale-in from:opacity-0 duration-280 delay-300" },
      { target: "title", animate: "fade-in from:translate-y-12 duration-260" },
      { target: "button", animate: "fade-in from:translate-y-12 duration-240" },
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
- `timeline.reverse()` plays targets back toward their `from` frames, continuing from the current position when the animation was already played or is in flight.
- `timeline.reset()` immediately returns targets to their declared `from` frames.
- `timeline.stop()` cancels pending starts and freezes running animations where they are.
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
| `onComplete` | `() => void`                      | `undefined` | Called once after every target of a finite `play()` or `reverse()` actually finishes. Not called if the run is stopped, reset, or replaced. |

Returned controller:

| Function             | Meaning                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `timeline.play()`    | Starts all configured target animations.                                 |
| `timeline.reverse()` | Plays all configured targets back toward `from`, from their current position. |
| `timeline.reset()`   | Immediately returns all configured targets to their declared `from` frames. |
| `timeline.stop()`    | Cancels pending starts and freezes running animations in place.          |

`Strx.useTimeline` must run under `Strx.Provider` or `Strx.TimelineRoot`, because the root owns the target registry.

`timeline.reverse()` uses the same playback schedule, interval, and play count as `timeline.play()`. If a target is currently showing this timeline's animation, it reverses from its current position; otherwise it plays the full `to -> from` pass.

## Preset animations

```tsx
<Strx.View animate="fade-in duration-500 ease-out">
  <Strx.Text>Fade in</Strx.Text>
</Strx.View>
```

See [Preset tokens](#preset-tokens) for every preset and its default motion.

## Explicit keyframes: from:/to:/exit:

```tsx
<Strx.View animate="from:opacity-0 from:translate-y-20 to:opacity-100 to:translate-y-0 exit:opacity-0 duration-300">
  <Strx.Text>Animated content</Strx.Text>
</Strx.View>
```

See [Explicit keyframe prefixes](#explicit-keyframe-prefixes) for every utility.

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

Transitions start from the values currently on screen, so changing the style again mid-transition continues smoothly instead of jumping. Style changes never replay a component's entrance animation.

See [Implicit transition tokens](#implicit-transition-tokens) for every token.

## Layout transitions

```tsx
<Strx.View animate="layout-spring">
  {open && <Strx.Text>Expanded content</Strx.Text>}
</Strx.View>
```

A STRX component animates its size and position changes when:

1. it has its own `layout-*` token, or
2. it inherits one: from the nearest STRX ancestor that has a layout transition, or from the nearest `Strx.LayoutGroup`.

Inheritance only flows **down**. A child with a `layout-*` token does not make its parent animate; when content appearing inside a container should also resize the container smoothly, put the token on the container (as above) or wrap the region in `Strx.LayoutGroup`.

`duration-*` tokens in the same group set the duration of `layout-linear` and `layout-fade`; otherwise `Strx.Provider`'s `motionPreset.duration` or 300ms is used. Springs use their own parameters.

See [Layout tokens](#layout-tokens) for every token.

Supported layout tokens:

- `layout-linear`
- `layout-spring`
- `layout-fade`
- `layout-spring-stiff`
- `layout-spring-bouncy`

## Layout isolation

Use `layoutPropagation="none"` to stop inherited layout transitions at a component. It then only uses its own `layout-*` token, and its descendants only inherit that:

```tsx
<Strx.View animate="layout-spring">
  <Strx.View layoutPropagation="none">
    <Strx.Text>Layout changes here are not animated.</Strx.Text>
  </Strx.View>
</Strx.View>
```

## Long lists

For long scrolling lists, prefer Reanimated's `Animated.FlatList` with `itemLayoutAnimation` over a `layout-*` token on every row. Rows can still use STRX for entrance and exit animations:

```tsx
import Animated, { LinearTransition } from "react-native-reanimated";

<Animated.FlatList
  data={items}
  keyExtractor={item => item.id}
  itemLayoutAnimation={LinearTransition}
  renderItem={({ item }) => (
    <Strx.View animate="fade-in exit:opacity-0">
      <Row item={item} />
    </Strx.View>
  )}
/>;
```

## Clipping

`layoutClip` is opt-in. By default, STRX does not inject `overflow: 'hidden'` so text is not clipped unexpectedly. It only applies while the component has a layout transition (its own or inherited).

```tsx
<Strx.View animate="layout-spring" layoutClip>
  {open && <Strx.Text>Clipped expandable content</Strx.Text>}
</Strx.View>
```

## Production notes

- Use `Strx.Provider` (or `Strx.TimelineRoot`) near the app root when using `strxId` and `Strx.useTimeline`.
- Prefer the namespace API, such as `Strx.View`, `Strx.Text`, `Strx.Pressable`, `Strx.Image`, `Strx.ScrollView`, and `Strx.TextInput`, for animated regions.
- Named `Strx*` exports are also available for teams that prefer named imports.
- Keep `react-native-worklets/plugin` last in your Babel plugins.
- Run `pod install` for iOS after installing Reanimated.
- Reset Metro cache after installation or Babel changes.
- Install [STRX Animation IntelliSense](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense) for the best `animate=""` authoring experience in VS Code.

## License

MIT
