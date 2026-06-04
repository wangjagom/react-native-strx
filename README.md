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
npm install github:wangjagom/react-native-strx#v0.1.8
```

### Peer dependencies

`react-native-strx` expects these packages to be installed by the consuming app:

- `react` >= 18
- `react-native` >= 0.74
- `react-native-reanimated` >= 3
- `react-native-worklets` when required by your Reanimated version

## Required app setup

### Babel

Add the Reanimated plugin as the last plugin in the consuming app's `babel.config.js`:

```js
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: ["react-native-reanimated/plugin"],
};
```

If the app already has plugins, keep `react-native-reanimated/plugin` last.

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
    <Strx.LayoutRoot>
      <Strx.View animate="fade-in layout-spring">
        <Strx.Text>Hello STRX</Strx.Text>
      </Strx.View>
    </Strx.LayoutRoot>
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

The runtime package keeps `animate` flexible and accepts custom string tokens, while the VS Code extension provides the best autocomplete experience for known STRX animation tokens.

## Components

The recommended API is the `Strx` namespace. It keeps animated STRX primitives visually separate from React Native built-ins.

### `Strx.View`

The primary animated container. Use it for preset animations, explicit `from:/to:/exit:` keyframes, implicit `transition-*` style transitions, and Reanimated layout transitions.

```tsx
<Strx.View animate="fade-in layout-spring duration-300">
  <Strx.Text>Card content</Strx.Text>
</Strx.View>
```

### `Strx.Text`

A layout-aware text primitive. It participates in inherited layout transitions from `Strx.View` and `Strx.LayoutGroup`, which helps text move with surrounding animated layout changes.

```tsx
<Strx.Text>Animated layout text</Strx.Text>
```

### `Strx.Pressable`

A layout-aware press target for buttons and touchable rows. Use it when a button should move with a surrounding layout transition.

```tsx
<Strx.Pressable onPress={onToggle}>
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

### `createStrxComponent`

Use `createStrxComponent` to adapt your own component to STRX. The wrapped component receives `animate`, `layoutClip`, and `layoutPropagation` while preserving its original props.

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

`animate` is a whitespace-separated token string. Tokens can be combined in one string.

The recommended import style is the namespace API, which keeps STRX components visually distinct from React Native built-ins:

```tsx
import { Strx } from "react-native-strx";

<Strx.View animate="fade-in" />;
```

Alias exports are also available: `StrxView`, `StrxText`, `StrxPressable`, `StrxImage`, `StrxScrollView`, and `StrxTextInput`. The plain component exports remain for backward compatibility.

```tsx
<Strx.View animate="fade-in layout-spring transition-all duration-300 ease-out" />
```

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
| `animate`           | `View`, `Image`, `ScrollView`, `TextInput`, custom factory components | Animation token string or animation object/array.                                             |
| `layoutClip`        | `View`, `Image`, `ScrollView`, `TextInput`, custom factory components | When `true`, injects `overflow: 'hidden'` during active layout animation. Default is `false`. |
| `layoutPropagation` | `View`, `Image`, `ScrollView`, `TextInput`, custom factory components | Use `layoutPropagation="none"` to stop layout demand from bubbling past this boundary.        |

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
- Keep `react-native-reanimated/plugin` last in Babel config.
- Run `pod install` for iOS after installing Reanimated.
- Reset Metro cache after installation or Babel changes.
- Install [STRX Animation IntelliSense](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense) for the best `animate=""` authoring experience in VS Code.

## Maintainer publishing

The package is configured for public npm publishing. Before publishing, make sure you are logged in with an npm account that can claim or maintain `react-native-strx`:

```sh
npm login
npm whoami
```

Run the verification steps:

```sh
npm install
npm run typecheck
npm run pack:check
```

Publish the current version:

```sh
npm publish --access public
```

For the first publish, npm will claim the `react-native-strx` package name under your account. For later releases, bump `package.json` with `npm version patch`, `npm version minor`, or `npm version major`, then publish again.

After publishing, users can install it with:

```sh
npm install react-native-strx
```

## License

MIT
