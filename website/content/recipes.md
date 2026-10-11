---
title: Recipes
description: Copy-ready patterns for common UI motion.
---

Each recipe uses only public STRX APIs. Adjust tokens to taste.

## Staggered list entrance

```tsx
<Strx.Timeline playback="stagger" interval={50}>
  {items.map(item => (
    <Strx.View key={item.id} animate="fade-in from:translate-y-12 duration-260">
      <Row item={item} />
    </Strx.View>
  ))}
</Strx.Timeline>
```

Keep the interval small (40–80ms) and the list short; for long lists, only stagger the first screenful.

## Toast

```tsx
{toast && (
  <Strx.View
    animate="fade-in from:translate-y-24 spring damping-16, exit:opacity-0 exit:translate-y-24 duration-180 ease-in"
    style={styles.toast}
  >
    <Strx.Text>{toast.message}</Strx.Text>
  </Strx.View>
)}
```

The entrance springs in; the exit, in its own group, has its own short timing.

## Bottom sheet

```tsx
<Strx.View
  animate="from:translate-y-600 to:translate-y-0 spring damping-20 stiffness-180, exit:translate-y-600 duration-220 ease-in"
  style={styles.sheet}
>
  <SheetContent />
</Strx.View>
```

## Accordion

```tsx
<Strx.View animate="layout-spring" layoutClip style={styles.panel}>
  <Strx.Pressable onPress={() => setOpen(value => !value)}>
    <Strx.Text>{title}</Strx.Text>
  </Strx.Pressable>
  {open && <Strx.Text animate="fade-in exit:opacity-0 duration-150">{body}</Strx.Text>}
</Strx.View>
```

## Selectable chip

```tsx
<Strx.Pressable
  animate="transition-all duration-160"
  onPress={() => setSelected(!selected)}
  style={({ pressed }) => ({
    backgroundColor: selected ? "#3552f0" : "#f2f4f7",
    transform: [{ scale: pressed ? 0.96 : 1 }],
  })}
>
  <Strx.Text style={{ color: selected ? "#fff" : "#0b1020" }}>Design</Strx.Text>
</Strx.Pressable>
```

## Validation shake

Play a short keyframe animation from an event with `useTimeline`:

```tsx
const shake = Strx.useTimeline({
  playables: [{ target: "field", animate: "from:-translate-x-8 to:translate-x-0 spring damping-4 stiffness-400" }],
});

<Strx.TextInput strxId="field" onSubmitEditing={() => !valid && shake.play()} />;
```

## Pulsing indicator

```tsx
<Strx.View
  animate="from:opacity-40 to:opacity-100 from:scale-90 to:scale-100 duration-700 ease-in-out play-infinite"
  style={styles.dot}
/>
```

Keep looping animations small. Under [Reduce Motion](accessibility.html) they play once.

## Skeleton to content

```tsx
{loading ? (
  <Strx.View animate="exit:opacity-0 duration-150" style={styles.skeleton} />
) : (
  <Strx.View animate="fade-in duration-250">
    <Content />
  </Strx.View>
)}
```

## Success screen

```tsx
const celebrate = Strx.useTimeline({
  playback: "stagger",
  interval: 90,
  playables: [
    { target: "badge", animate: "bounce" },
    { target: "headline", animate: "fade-in from:translate-y-12" },
    { target: "cta", animate: "fade-in from:translate-y-12" },
  ],
});

useEffect(() => {
  if (paid) celebrate.play();
}, [paid]);
```

## Reorderable list

```tsx
<Strx.LayoutGroup transition="spring" damping={18}>
  {sorted.map(item => (
    <Strx.View key={item.id} animate="fade-in exit:opacity-0 exit:scale-95">
      <Row item={item} />
    </Strx.View>
  ))}
</Strx.LayoutGroup>
```

When `sorted` changes order, rows spring to their new positions; removed rows fade out first.
