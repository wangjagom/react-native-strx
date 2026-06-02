# react-native-strx

Tailwind-style declarative animations and layout transitions for React Native Reanimated.

`react-native-strx` lets you write animation intent directly on React Native primitives:

```tsx
<View animate="fade-in layout-spring transition-all duration-300" />
```

It supports preset animations, explicit `from:/to:/exit:` keyframes, implicit `transition-*` style transitions, and Reanimated layout transitions.

## Installation

### From GitHub

```sh
npm install github:wangjagom/react-native-strx
```

or with a release tag:

```sh
npm install github:wangjagom/react-native-strx#v0.1.0
```

### Peer dependencies

Install Reanimated in the consuming app:

```sh
npm install react-native-reanimated
```

For Reanimated versions that require Worklets as a separate package, also install:

```sh
npm install react-native-worklets
```

## Required app setup

### Babel

Add the Reanimated plugin as the last plugin in the consuming app's `babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
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
import { StrxLayoutRoot, View, Text, Pressable } from 'react-native-strx';

export default function App() {
  return (
    <StrxLayoutRoot>
      <View animate="fade-in layout-spring">
        <Text>Hello STRX</Text>
      </View>
    </StrxLayoutRoot>
  );
}
```


## Token Reference

`animate` is a whitespace-separated token string. Tokens can be combined in one string:

```tsx
<View animate="fade-in layout-spring transition-all duration-300 ease-out" />
```

### Preset tokens

Preset tokens create an explicit animation plan with predefined `from` and `to` values.

| Token | Starts from | Animates to | Default motion |
| --- | --- | --- | --- |
| `fade-in` | `opacity: 0` | `opacity: 1` | timing, 300ms |
| `fade-out` | `opacity: 1` | `opacity: 0` | timing, 250ms |
| `slide-up` | `translateY: 24` | `translateY: 0` | timing, 320ms |
| `slide-down` | `translateY: -24` | `translateY: 0` | timing, 320ms |
| `slide-left` | `translateX: 24` | `translateX: 0` | timing, 320ms |
| `slide-right` | `translateX: -24` | `translateX: 0` | timing, 320ms |
| `scale-in` | `scale: 0.92` | `scale: 1` | timing, 260ms |
| `scale-up` | `scale: 0.92` | `scale: 1` | timing, 260ms |
| `scale-down` | `scale: 1.08` | `scale: 1` | timing, 260ms |
| `scale-out` | `scale: 1` | `scale: 0.92` | timing, 220ms |
| `bounce` | `translateY: -16`, `scale: 0.96` | `translateY: 0`, `scale: 1` | spring, damping 8, stiffness 180, mass 0.9 |

### Timing tokens

Timing tokens configure preset, `from:/to:`, `exit:`, and `transition-*` animations.

| Token | Meaning |
| --- | --- |
| `duration-300` | Sets duration to `300` milliseconds. Any finite number is accepted. |
| `delay-100` | Delays animation by `100` milliseconds. Any finite number is accepted. |
| `repeat-2` | Repeats explicit preset/from-to animation 2 times. |
| `repeat-infinite` | Repeats explicit preset/from-to animation indefinitely. |
| `linear` | Linear easing. |
| `ease` | Smoothstep default easing. |
| `ease-in` | Cubic ease-in. |
| `ease-out` | Cubic ease-out. |
| `ease-in-out` | Cubic ease-in-out. |

### Explicit keyframe prefixes

Prefix tokens turn a Tailwind-like utility into a `from`, `to`, or `exit` style.

| Prefix | Meaning |
| --- | --- |
| `from:*` | Initial style before the animation starts. |
| `to:*` | Target style for the animation. |
| `exit:*` | Style used when the component exits/unmounts. |

Supported prefixed utilities:

| Utility | Result |
| --- | --- |
| `opacity-0` to `opacity-100` | `opacity` from `0` to `1`. Values are divided by 100. |
| `translate-x-20` | `translateX: 20` |
| `-translate-x-20` | `translateX: -20` |
| `translate-y-20` | `translateY: 20` |
| `-translate-y-20` | `translateY: -20` |
| `scale-90` | `scale: 0.9` |
| `scale-x-95` | `scaleX: 0.95` |
| `scale-y-105` | `scaleY: 1.05` |
| `rotate-45` | `rotate: '45deg'` |
| `-rotate-45` | `rotate: '-45deg'` |
| `w-120` | `width: 120` |
| `h-80` | `height: 80` |

Example:

```tsx
<View
  animate="from:opacity-0 from:-translate-y-20 to:opacity-100 to:translate-y-0 exit:opacity-0 duration-300"
/>
```

### Implicit transition tokens

Transition tokens animate changes in the static `style` prop. They compare the previous animatable style snapshot with the next one and animate only changed channels.

| Token | Animated style subset |
| --- | --- |
| `transition`, `transition-all` | All supported numeric/color/transform channels. |
| `transition-colors` | Color style keys such as `backgroundColor`, `borderColor`, `borderTopColor`, etc. |
| `transition-opacity` | `opacity` only. |
| `transition-transform` | Transform channels such as `translateX`, `translateY`, `scale`, `rotate`, etc. |
| `transition-spacing` | `margin*` and `padding*` keys. |
| `transition-layout` | `width`, `height`, min/max dimensions, and positional keys `top/right/bottom/left`. |

Example:

```tsx
<View
  animate="transition-colors duration-250 ease-out"
  style={{ backgroundColor: active ? '#22c55e' : '#ef4444' }}
/>
```

### Layout tokens

Layout tokens are passed to Reanimated's `layout` prop through stable worklet transitions. They animate native layout changes such as size and position changes.

| Token | Behavior |
| --- | --- |
| `layout-linear` | 300ms timing layout transition. |
| `layout-spring` | Spring layout transition with damping 15, stiffness 120, mass 1. |
| `layout-fade` | 300ms timing layout transition with opacity fade-in. |
| `layout-spring-stiff` | Stiffer spring layout transition with damping 20, stiffness 180, mass 0.9. |
| `layout-spring-bouncy` | Bouncier spring layout transition with damping 10, stiffness 105, mass 1. |

`layout` is never toggled to `undefined`; inactive nodes receive a stable no-op layout worklet to keep the Reanimated native layout tree stable.

### Component props

| Prop | Component | Meaning |
| --- | --- | --- |
| `animate` | `View` | Animation token string or animation object/array. |
| `layoutClip` | `View` | When `true`, injects `overflow: 'hidden'` during active layout animation. Default is `false`. |
| `layoutPropagation` | `View` | Use `layoutPropagation="none"` to stop layout demand from bubbling past this boundary. |

## Preset animations

```tsx
<View animate="fade-in duration-500 ease-out">
  <Text>Fade in</Text>
</View>
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
<View
  animate="from:opacity-0 from:translate-y-20 to:opacity-100 to:translate-y-0 exit:opacity-0 duration-300"
>
  <Text>Animated content</Text>
</View>
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
<View
  animate="transition-all duration-300 ease-out"
  style={{
    width: open ? 220 : 120,
    opacity: open ? 1 : 0.5,
    backgroundColor: open ? '#4f46e5' : '#e5e7eb',
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
<View animate="layout-spring">
  {open && <Text>Expanded content</Text>}
</View>
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
<View layoutPropagation="none">
  <View animate="layout-spring">
    <Text>This layout demand stays inside this boundary.</Text>
  </View>
</View>
```

## Clipping

`layoutClip` is opt-in. By default, STRX does not inject `overflow: 'hidden'` so text is not clipped unexpectedly.

```tsx
<View animate="layout-spring" layoutClip>
  {open && <Text>Clipped expandable content</Text>}
</View>
```

## Production notes

- Use `StrxLayoutRoot` near the screen or app root.
- Prefer `View`, `Text`, and `Pressable` from `react-native-strx` for animated regions.
- Keep `react-native-reanimated/plugin` last in Babel config.
- Run `pod install` for iOS after installing Reanimated.
- Reset Metro cache after installation or Babel changes.

## License

MIT
