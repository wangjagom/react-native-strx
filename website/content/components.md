---
title: Components
description: The STRX primitives, their shared props, and how to import them.
---

STRX ships animated versions of the core React Native primitives. Each keeps every prop and event of the component it wraps and adds the STRX props below.

```tsx
import { Strx } from "react-native-strx";

<Strx.View animate="fade-in" style={styles.card} onLayout={onLayout} />
```

## Importing

The `Strx` namespace is the recommended style. It keeps animated components visually distinct from React Native's own:

```tsx
import { Strx } from "react-native-strx";

<Strx.View />
<Strx.Text />
```

Named exports are available too:

```tsx
import { StrxView, StrxText, StrxPressable } from "react-native-strx";
```

| Namespace | Named export | Wraps |
| --- | --- | --- |
| `Strx.View` | `StrxView` | `View` |
| `Strx.Text` | `StrxText` | `Text` |
| `Strx.Pressable` | `StrxPressable` | `Pressable` |
| `Strx.Image` | `StrxImage` | `Image` |
| `Strx.ScrollView` | `StrxScrollView` | `ScrollView` |
| `Strx.TextInput` | `StrxTextInput` | `TextInput` |
| `Strx.Timeline` | `StrxTimeline` | A `Strx.View` that orchestrates its children ([docs](timeline.html)) |
| `Strx.Provider` | `StrxProvider` | App-level settings ([docs](provider.html)) |
| `Strx.TimelineRoot` | `StrxTimelineRoot` | Timeline registry only ([docs](provider.html)) |
| `Strx.LayoutGroup` | `StrxLayoutGroup` | Shared layout transition ([docs](layout-group.html)) |
| `Strx.useTimeline` | `useTimeline` | Event timelines ([docs](use-timeline.html)) |

STRX does not export components under React Native's names (`View`, `Text`, ...), so it never shadows them. The `animate` prop only exists on STRX components; TypeScript reports `animate` on a plain `View`.

## Shared props

Every STRX component, including ones made with [`createStrxComponent`](custom-components.html), accepts:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `animate` | `AnimateProp` | — | Token string, object, or array. See [the animate prop](animate-prop.html). |
| `playback` | `"parallel" \| "serial" \| "stagger"` | `"parallel"` | How array entries are scheduled. See [Array playback](playback.html). |
| `interval` | `number` | `100` | Offset in ms for `playback="stagger"` |
| `strxId` | `string` | — | Registers the component as a [`useTimeline`](use-timeline.html) target |
| `layoutClip` | `boolean` | `false` | Adds `overflow: "hidden"` while a layout transition applies. See [Layout](layout.html). |
| `layoutPropagation` | `"auto" \| "none"` | `"auto"` | `"none"` ignores inherited layout transitions. See [Layout](layout.html). |

Refs are forwarded to the underlying native component.

## Strx.View

The general-purpose animated container. Use it for cards, sections, overlays and anything else you would build with `View`.

```tsx
<Strx.View animate="fade-in from:translate-y-12 layout-spring" style={styles.card}>
  <Strx.Text>Card content</Strx.Text>
</Strx.View>
```

## Strx.Text

Animated text. It supports every token, including `exit:`, and inherits layout transitions from STRX ancestors, so text that rewraps moves smoothly.

```tsx
<Strx.Text animate="fade-in from:translate-y-8 duration-400">
  Welcome back
</Strx.Text>
```

## Strx.Pressable

A press target for buttons and rows. Function styles (`({ pressed }) => ...`) work with `transition-*` tokens, so pressed states animate. Your `onPressIn`, `onPressOut`, `onPress` and `onLongPress` handlers still run, and children inherit layout transitions.

```tsx
<Strx.Pressable
  animate="transition-all duration-150"
  onPress={onToggle}
  style={({ pressed }) => ({
    backgroundColor: pressed ? "#2440d6" : "#3552f0",
    transform: [{ scale: pressed ? 0.97 : 1 }],
  })}
>
  <Strx.Text style={{ color: "white" }}>Toggle</Strx.Text>
</Strx.Pressable>
```

An `animate` string has one style transition: if you list several `transition-*` tokens, the last one wins. To animate both color and transform, use `transition-all` as above.

<div data-demo="pressable"></div>

## Strx.Image

An animated image for avatars, thumbnails and hero images. Give images explicit dimensions so their layout is predictable.

```tsx
<Strx.Image
  animate="fade-in, scale-in layout-linear"
  source={{ uri: avatarUrl }}
  style={{ width: 72, height: 72, borderRadius: 36 }}
/>
```

## Strx.ScrollView

A scroll container that can animate and pass layout transitions to its children. Use it for screens where sections expand and collapse.

```tsx
<Strx.ScrollView animate="layout-linear" contentContainerStyle={{ gap: 12 }}>
  {sections.map(section => (
    <Strx.View key={section.id} animate="fade-in">
      <Section {...section} />
    </Strx.View>
  ))}
</Strx.ScrollView>
```

For long, virtualized lists see [Long lists](layout.html#long-lists).

## Strx.TextInput

An animated input for focus rings and validation states. Prefer `transition-colors` for borders and backgrounds.

```tsx
<Strx.TextInput
  animate="transition-colors duration-200"
  value={value}
  onChangeText={setValue}
  style={{ borderWidth: 2, borderColor: invalid ? "#dc2626" : "#d3d8e2" }}
/>
```

## Other components

Need `SafeAreaView`, `FlatList` items, `LinearGradient` or your own component? Wrap it with [`createStrxComponent`](custom-components.html).
