---
title: 레시피
description: 자주 쓰는 UI 모션을 바로 복사해서 쓸 수 있게 모았어요.
---

모든 레시피는 공개된 STRX API만 써요. 토큰은 원하는 대로 바꿔 보세요.

## 리스트 차례로 등장하기 {#staggered-list-entrance}

```tsx
<Strx.Timeline playback="stagger" interval={50}>
  {items.map(item => (
    <Strx.View key={item.id} animate="fade-in from:translate-y-12 duration-260">
      <Row item={item} />
    </Strx.View>
  ))}
</Strx.Timeline>
```

간격은 짧게(40–80ms), 리스트도 짧게 유지해 주세요. 긴 리스트라면 첫 화면에 보이는 항목만 차례로 등장시키는 게 좋아요.

## 토스트 {#toast}

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

등장은 스프링으로 튀어 오르고, 퇴장은 다른 그룹에 있어서 짧은 타이밍을 따로 가져요.

## 바텀 시트 {#bottom-sheet}

```tsx
<Strx.View
  animate="from:translate-y-600 to:translate-y-0 spring damping-20 stiffness-180, exit:translate-y-600 duration-220 ease-in"
  style={styles.sheet}
>
  <SheetContent />
</Strx.View>
```

## 아코디언 {#accordion}

```tsx
<Strx.View animate="layout-spring" layoutClip style={styles.panel}>
  <Strx.Pressable onPress={() => setOpen(value => !value)}>
    <Strx.Text>{title}</Strx.Text>
  </Strx.Pressable>
  {open && <Strx.Text animate="fade-in exit:opacity-0 duration-150">{body}</Strx.Text>}
</Strx.View>
```

## 선택할 수 있는 칩 {#selectable-chip}

```tsx
<Strx.Pressable
  animate="transition-all duration-160"
  onPress={() => setSelected(!selected)}
  style={({ pressed }) => ({
    backgroundColor: selected ? "#3552f0" : "#f2f4f7",
    transform: [{ scale: pressed ? 0.96 : 1 }],
  })}
>
  <Strx.Text style={{ color: selected ? "#fff" : "#0b1020" }}>디자인</Strx.Text>
</Strx.Pressable>
```

## 입력 오류 흔들기 {#validation-shake}

`useTimeline`으로 이벤트가 생겼을 때 짧은 키프레임 애니메이션을 재생해요.

```tsx
const shake = Strx.useTimeline({
  playables: [{ target: "field", animate: "from:-translate-x-8 to:translate-x-0 spring damping-4 stiffness-400" }],
});

<Strx.TextInput strxId="field" onSubmitEditing={() => !valid && shake.play()} />;
```

## 깜빡이는 표시 {#pulsing-indicator}

```tsx
<Strx.View
  animate="from:opacity-40 to:opacity-100 from:scale-90 to:scale-100 duration-700 ease-in-out play-infinite"
  style={styles.dot}
/>
```

반복 애니메이션은 작게 유지해 주세요. [동작 줄이기](accessibility.html)가 켜져 있으면 한 번만 재생해요.

## 스켈레톤에서 콘텐츠로 {#skeleton-to-content}

```tsx
{loading ? (
  <Strx.View animate="exit:opacity-0 duration-150" style={styles.skeleton} />
) : (
  <Strx.View animate="fade-in duration-250">
    <Content />
  </Strx.View>
)}
```

## 완료 화면 {#success-screen}

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

## 순서를 바꿀 수 있는 리스트 {#reorderable-list}

```tsx
<Strx.LayoutGroup transition="spring" damping={18}>
  {sorted.map(item => (
    <Strx.View key={item.id} animate="fade-in exit:opacity-0 exit:scale-95">
      <Row item={item} />
    </Strx.View>
  ))}
</Strx.LayoutGroup>
```

`sorted` 순서가 바뀌면 행이 새 자리로 스프링처럼 움직이고, 지워진 행은 먼저 흐려지며 사라져요.
