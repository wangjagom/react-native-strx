---
title: Style transitions
description: Animate changes to the style prop with transition-* tokens, like CSS transitions.
---

A `transition-*` token makes a component animate whenever its `style` changes. You keep writing ordinary state-driven styles; STRX interpolates between the old and new values.

```tsx
<Strx.View
  animate="transition-colors duration-250 ease-out"
  style={{ backgroundColor: active ? "#16a34a" : "#dc2626" }}
/>
```

<div data-demo="transition" data-variant="colors"></div>

## Transition tokens

<!-- strx:transitions -->

An `animate` value has one style transition. If you list several `transition-*` tokens, even in different comma groups, the last one wins; use `transition-all` to cover several kinds at once.

Pick the narrowest token that covers what changes. `transition-all` is convenient, but a narrower token keeps unrelated style changes instant: with `transition-colors`, a width change in the same update still snaps.

<div data-demo="transition" data-variant="all"></div>

## Interruptions

Transitions start from the values currently on screen. If the style changes again mid-transition, the new transition continues from where the old one was, with no jump. Try clicking the toggles above twice quickly.

## Transitions and entrances

A component can have both an entrance and a transition. The entrance plays once on mount; later style changes run the transition and never replay the entrance:

```tsx
<Strx.View
  animate="fade-in from:translate-y-8 transition-colors duration-200"
  style={{ backgroundColor: selected ? "#eef1ff" : "#ffffff" }}
/>
```

The group's timing tokens apply to both. To time them separately, use two groups: `"fade-in duration-400, transition-colors duration-150"`.

## Pressed states

`Strx.Pressable` accepts function styles. With a `transition-*` token, the change between the pressed and released style animates:

```tsx
<Strx.Pressable
  animate="transition-transform duration-150"
  onPress={onSubmit}
  style={({ pressed }) => ({
    transform: [{ scale: pressed ? 0.96 : 1 }],
  })}
>
  <Strx.Text>Submit</Strx.Text>
</Strx.Pressable>
```

<div data-demo="pressable"></div>

Your own `onPressIn` / `onPressOut` handlers still run.

## Focus and validation

`Strx.TextInput` works the same way. Track focus in state and let `transition-colors` animate the border:

```tsx
function Field() {
  const [focused, setFocused] = useState(false);

  return (
    <Strx.TextInput
      animate="transition-colors duration-200"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ borderWidth: 2, borderColor: focused ? "#3552f0" : "#d3d8e2" }}
    />
  );
}
```

<div data-demo="focus"></div>

## Size transitions

`transition-layout` animates `width`, `height`, min/max sizes and `top` / `right` / `bottom` / `left` when you change them in `style`:

```tsx
<Strx.View
  animate="transition-layout duration-300"
  style={{ width: expanded ? 280 : 120, height: 48 }}
/>
```

This animates the style values you set. When a size change comes from content (a child appears, text wraps), use a [layout transition](layout.html) instead: it measures the native layout and animates to it.

## Reduce Motion

Under Reduce Motion, style changes apply immediately. See [Accessibility](accessibility.html).
