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
