---
title: Custom components
description: Give any component the animate prop with createStrxComponent.
---

`createStrxComponent` wraps a component so it accepts `animate` and the other STRX props, while keeping its own props and style type.

```tsx
import { createStrxComponent } from "react-native-strx";
import { SafeAreaView } from "react-native-safe-area-context";

const StrxSafeAreaView = createStrxComponent(SafeAreaView, {
  displayName: "Strx.SafeAreaView",
});

<StrxSafeAreaView animate="fade-in layout-linear" style={{ flex: 1 }} />;
```

The wrapped component gets every STRX feature: entrances, keyframes, `exit:`, `transition-*`, layout transitions and inheritance, `playback`, and `strxId` for timelines.

## Signature

```tsx
function createStrxComponent<Props extends object, RefType = unknown>(
  Component: React.ComponentType<Props>,
  options?: StrxComponentOptions,
): React.ForwardRefExoticComponent<StrxComponentProps<Props> & React.RefAttributes<RefType>>;
```

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `displayName` | `string` | `Strx.<ComponentName>` | Name shown in React DevTools |
| `nativeView` | `boolean` | `true` | Whether the component renders a native view that could be flattened away. STRX then sets `collapsable={false}` so animations target a real view. Use `false` for text-like components. |

`StrxComponentProps<Props>` is the original props, with `style` kept as the component's own style type, plus `animate`, `playback`, `interval`, `strxId`, `layoutClip` and `layoutPropagation`.

## Requirements for the wrapped component

The wrapped component goes through Reanimated's `createAnimatedComponent`, so:

- it must pass its `style` prop to a native view (animated values are written there);
- for layout and exit animations, its root should be that native view;
- define the wrapped component once, at module scope, not inside a render function.

Refs are forwarded: a ref on the STRX component reaches the wrapped component.

## Examples

### A gradient

```tsx
import { LinearGradient } from "expo-linear-gradient";

const StrxGradient = createStrxComponent(LinearGradient);

<StrxGradient
  colors={["#3552f0", "#7b93ff"]}
  animate="fade-in, scale-in duration-500"
  style={{ height: 160, borderRadius: 20 }}
/>;
```

### Your own card

```tsx
type CardProps = { title: string; style?: StyleProp<ViewStyle>; children?: React.ReactNode };

function CardBase({ title, style, children }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

export const Card = createStrxComponent(CardBase, { displayName: "Card" });

<Card title="Profile" animate="fade-in from:translate-y-12 layout-spring" />;
```

### A text-like component

```tsx
const StrxHeading = createStrxComponent(Heading, { nativeView: false });
```

### In a timeline

Wrapped components work as [`Strx.Timeline`](timeline.html) children and [`useTimeline`](use-timeline.html) targets:

```tsx
<Strx.Timeline playback="stagger" interval={60}>
  <Card title="One" animate="fade-in from:translate-y-12" />
  <Card title="Two" animate="fade-in from:translate-y-12" />
</Strx.Timeline>
```

## Lists

For list rows, wrapping each row's content in `Strx.View` is usually simpler than wrapping `FlatList` itself. See [Long lists](layout.html#long-lists).
