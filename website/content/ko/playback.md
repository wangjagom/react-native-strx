---
title: 배열 재생
description: 컴포넌트 하나에 여러 애니메이션을 동시에, 차례로, 또는 시차를 두고 실행해요.
---

`animate`에 배열을 넘기면 컴포넌트 하나에 여러 애니메이션을 함께 쓸 수 있어요. 언제 재생할지는 `playback` prop으로 정해요.

```tsx
<Strx.View
  playback="serial"
  animate={["fade-in duration-200", "scale-in duration-300"]}
/>
```

<div data-demo="playback" data-mode="serial" data-entries="fade-in duration-300|from:translate-x-24 duration-300|from:rotate-45 duration-300"></div>

## 재생 방식 {#playback-modes}

| `playback` | 이렇게 재생해요 |
| --- | --- |
| `parallel` (기본값) | 쉼표 그룹처럼 모두 한꺼번에 시작해요. |
| `serial` | 앞 항목의 `delay-*`와 지속 시간이 끝나면 다음 항목이 시작해요. |
| `stagger` | `interval` ms 간격으로 하나씩 시작해요. 앞 항목에 적은 `delay-*`만큼 뒤 항목도 더 늦게 시작해요. |

`interval` 기본값은 `100` ms이고, `stagger`일 때만 써요.

```tsx
<Strx.View
  playback="stagger"
  interval={80}
  animate={["fade-in", "from:translate-y-12", "from:scale-90 spring"]}
/>
```

## 배열과 쉼표 그룹은 뭐가 다른가요? {#arrays-vs-comma-groups}

둘 다 여러 애니메이션을 실행하고, `parallel`이면 똑같이 동작해요.

```tsx
<Strx.View animate="fade-in, slide-up duration-500" />
<Strx.View animate={["fade-in", "slide-up duration-500"]} />
```

`serial`이나 `stagger`가 필요할 때, 항목이 객체일 때, 코드에서 목록을 만들 때는 배열이 편해요.

```tsx
const entrance = [
  "fade-in duration-200",
  { from: { backgroundColor: "#ffffff" }, to: { backgroundColor: "#eef1ff" }, duration: 400 },
];

<Strx.View playback="serial" animate={entrance} />;
```

## 두 항목이 같은 값을 움직일 때 {#same-channel-in-two-entries}

두 항목이 같은 값을 움직이면 뒤에 있는 항목을 따라요. `serial`과 `stagger`에서는 뒤 항목이 시작하는 순간부터 그 값을 이어받아요.

## 여러 컴포넌트를 함께 움직이려면 {#several-components}

`playback`은 컴포넌트 **하나** 안에서만 순서를 정해요. 여러 컴포넌트를 함께 움직이려면, 화면이 그려질 때 재생하는 [`Strx.Timeline`](timeline.html)으로 감싸거나, 원하는 순간에 재생하는 [`Strx.useTimeline`](use-timeline.html)을 써 주세요.
