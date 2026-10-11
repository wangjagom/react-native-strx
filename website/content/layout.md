---
title: Layout transitions
description: Animate size and position changes with layout-* tokens, and control how they are inherited.
---

When a component's size or position changes, because content appeared, text wrapped, or a sibling was removed, a `layout-*` token animates it to the new layout on the UI thread.

```tsx
<Strx.View animate="layout-spring">
  <Strx.Text>Title</Strx.Text>
  {open && <Strx.Text>Expanded content</Strx.Text>}
</Strx.View>
```

<div data-demo="layout"></div>

## Layout tokens

<!-- strx:layout -->

Layout tokens are passed to Reanimated's `layout` prop. The linear and fade transitions use `duration-*` from the same group, then `Strx.Provider`'s `motionPreset.duration`, then 300ms. Spring transitions use their own parameters.

```tsx
<Strx.View animate="layout-linear duration-180" />
```

A layout token combines freely with an entrance, transition or exit in the same group:

```tsx
<Strx.View animate="fade-in from:translate-y-12 layout-spring exit:opacity-0" />
```

## Inheritance

A STRX component animates its layout when:

1. it has its own `layout-*` token, or
2. it inherits one, from the nearest STRX ancestor that has a layout transition, or from the nearest [`Strx.LayoutGroup`](layout-group.html).

So one token on a container animates every STRX descendant inside it:

```tsx
<Strx.View animate="layout-spring">
  <Strx.View>{/* inherits layout-spring */}</Strx.View>
  <Strx.Text>{/* inherits layout-spring */}</Strx.Text>
</Strx.View>
```

Inheritance only flows **down**. A child with a `layout-*` token does not make its parent animate. When content appearing inside a container should also resize the container smoothly, put the token on the container, or wrap the region in a `Strx.LayoutGroup`:

```tsx
// the card resizes smoothly; the new text fades in
<Strx.View animate="layout-spring">
  {open && <Strx.Text animate="fade-in">Details</Strx.Text>}
</Strx.View>
```

> [!NOTE] Only STRX components
> Inheritance passes through React context to STRX components. Plain React Native `View`s in between don't break the chain, but they don't animate either.

## Stopping inheritance

Set `layoutPropagation="none"` to ignore inherited transitions for a component and its descendants. The component then only uses its own `layout-*` token, if any, and that is what its children inherit:

```tsx
<Strx.View animate="layout-spring">
  <Strx.View layoutPropagation="none">
    <Strx.Text>Layout changes here are not animated.</Strx.Text>
  </Strx.View>
</Strx.View>
```

Use it for regions that change size often (a live counter, a text input) where animation would feel laggy, or for independent widgets inside an animated container.

## Clipping

While a view animates to a smaller size, its content can overflow. `layoutClip` adds `overflow: "hidden"` while a layout transition applies (own or inherited):

```tsx
<Strx.View animate="layout-spring" layoutClip>
  {open && <LongContent />}
</Strx.View>
```

It's opt-in so text shadows and badges aren't clipped unexpectedly.

## Cost

Components without a layout transition get no Reanimated `layout` prop at all, so adding STRX to a large tree costs nothing for layout. Once a component has had a layout transition, it keeps a no-op transition instead of removing the prop, which avoids churn in the native view tree.

## Long lists

For long scrolling lists, prefer Reanimated's `Animated.FlatList` with `itemLayoutAnimation` over a `layout-*` token on every row. Rows can still use STRX for entrance and exit:

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

## Reduce Motion

Under Reduce Motion, layout changes apply immediately. See [Accessibility](accessibility.html).

## Layout transitions vs. transition-layout

| | `layout-*` | `transition-layout` |
| --- | --- | --- |
| Triggered by | Any native layout change (content, siblings, flexbox) | Changes to `width`/`height`/position in your `style` |
| Animates to | The measured layout | The value you set |
| Inherited | Yes, by STRX descendants | No |
