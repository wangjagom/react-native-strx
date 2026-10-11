---
title: LayoutGroup
description: Share one layout transition across a region, such as a list or a form.
---

`Strx.LayoutGroup` gives every STRX component inside it a default layout transition, without adding a `layout-*` token to each one. Use it when nearby components should animate size and position changes as one coordinated region.

```tsx
<Strx.LayoutGroup transition="spring" damping={16}>
  {items.map(item => (
    <Strx.View key={item.id} animate="fade-in exit:opacity-0">
      <Row item={item} />
    </Strx.View>
  ))}
</Strx.LayoutGroup>
```

<div data-demo="list"></div>

## Props

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `transition` | `"linear" \| "spring"` | `"linear"` | The layout transition descendants inherit |
| `duration` | `number` | `300` | Duration in ms, for `transition="linear"` only |
| `damping` | `number` | `15` | Spring damping, for `transition="spring"` |
| `id` | `string` | — | Optional identifier, for debugging |
| `children` | `ReactNode` | — | The region |

`transition="spring"` uses the same spring as `layout-spring` (stiffness 120, mass 1), with the `damping` you pass.

`LayoutGroup` doesn't render a view of its own; it only provides context.

## Which transition wins

For any STRX component, STRX picks:

1. its own `layout-*` token, if it has one;
2. otherwise the nearest source above it: the nearest STRX ancestor with a layout transition **inside** the same group, or the group itself.

The nearest `LayoutGroup` wins over transitions inherited from STRX ancestors outside it, so a group lets you change the transition for a region:

```tsx
<Strx.View animate="layout-spring-bouncy">
  <Header />                                   {/* bouncy */}
  <Strx.LayoutGroup transition="linear" duration={200}>
    <List />                                   {/* linear, 200ms */}
  </Strx.LayoutGroup>
</Strx.View>
```

A component with `layoutPropagation="none"` ignores the group too.

## Patterns

### Accordion

```tsx
<Strx.LayoutGroup transition="spring">
  {sections.map(section => (
    <Strx.View key={section.id} layoutClip>
      <Strx.Pressable onPress={() => toggle(section.id)}>
        <Strx.Text>{section.title}</Strx.Text>
      </Strx.Pressable>
      {openId === section.id && (
        <Strx.Text animate="fade-in exit:opacity-0">{section.body}</Strx.Text>
      )}
    </Strx.View>
  ))}
</Strx.LayoutGroup>
```

### Form with validation messages

```tsx
<Strx.LayoutGroup transition="linear" duration={180}>
  <Field label="Email" />
  {error && <Strx.Text animate="fade-in exit:opacity-0">{error}</Strx.Text>}
  <SubmitButton />
</Strx.LayoutGroup>
```

When the error appears, the submit button slides down instead of jumping.
