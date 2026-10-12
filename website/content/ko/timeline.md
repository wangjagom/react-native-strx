---
title: Strx.Timeline
description: 화면이 그려질 때 여러 자식의 등장 순서를 연출해요.
---

`Strx.Timeline`은 바로 아래 자식들의 등장 애니메이션을 차례로 또는 시차를 두고 재생해요. 자식마다 `animate`를 읽어서 시작 시점을 계산하고, 그만큼 지연을 더해 줘요. 자식 코드는 그대로 두면 돼요.

```tsx
<Strx.Timeline playback="stagger" interval={80}>
  <Strx.View animate="fade-in from:translate-y-12" />
  <Strx.View animate="fade-in from:translate-y-12" />
  <Strx.View animate="fade-in from:translate-y-12" />
</Strx.Timeline>
```

<div data-demo="playback" data-mode="stagger" data-interval="80" data-entries="fade-in from:translate-y-12 duration-300|fade-in from:translate-y-12 duration-300|fade-in from:translate-y-12 duration-300"></div>

## Props {#props}

| Prop | 타입 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `playback` | `"parallel" \| "serial" \| "stagger"` | `"parallel"` | 자식들을 어떤 순서로 재생할지 |
| `interval` | `number` | `100` | `stagger`일 때 자식 사이 간격(ms). 음수나 잘못된 값은 0이 돼요. |
| `playCount` | `number \| "infinite"` | — | 전체 장면을 모두 몇 번 재생할지 |
| `children` | `ReactNode` | — | `animate`를 연출할 자식들 |

`Strx.Timeline`은 `Strx.View`를 그리기 때문에 `style` 같은 뷰 prop이나 `layoutClip` 같은 레이아웃 prop도 쓸 수 있어요.

## 재생 순서 {#scheduling}

- **parallel**: 모든 자식이 0ms에 시작해요. `playCount`와 함께 쓰면 한 덩어리로 반복할 수 있어요.
- **serial**: 앞 자식의 지연과 지속 시간이 끝나면 다음 자식이 시작해요.
- **stagger**: _n_번째 자식은 _n_ × `interval`에 시작하고, 앞 자식들의 `delay-*`만큼 더 늦게 시작해요.

계산한 시작 시점은 자식이 원래 가진 `delay-*`에 **더해지고**, 자식 `animate`의 모든 쉼표 그룹에 적용돼요.

```tsx
<Strx.Timeline playback="stagger" interval={100}>
  <Strx.Text animate="fade-in">0ms에 시작해요</Strx.Text>
  <Strx.Text animate="fade-in delay-50">150ms에 시작해요</Strx.Text>
  <Strx.Text animate="fade-in">250ms에 시작해요 (200 + 위의 50ms 지연)</Strx.Text>
</Strx.Timeline>
```

## 장면 전체 반복하기 {#repeating-the-choreography}

`playCount`는 자식을 하나씩 반복하는 게 아니라 타임라인 전체를 반복해요. 한 바퀴의 간격은 전체 타임라인의 예상 길이로 맞춰져요.

```tsx
<Strx.Timeline playback="stagger" interval={120} playCount="infinite">
  <Dot animate="from:opacity-30 to:opacity-100 duration-400" />
  <Dot animate="from:opacity-30 to:opacity-100 duration-400" />
  <Dot animate="from:opacity-30 to:opacity-100 duration-400" />
</Strx.Timeline>
```

## 알아 두면 좋아요 {#things-to-know}

- **바로 아래** 자식만 연출해요. Fragment, 문자열, `null` 자식은 그대로 그려요. 더 안쪽 컴포넌트를 연출하려면 그 컴포넌트가 `animate` prop을 받아서 전달하게 하거나, [`Strx.useTimeline`](use-timeline.html)을 써 주세요.
- `animate`를 받는 컴포넌트라면 무엇이든 자식이 될 수 있어요. STRX 컴포넌트도, [커스텀 컴포넌트](custom-components.html)도 돼요.
- 타임라인은 자식이 화면에 나타날 때 재생돼요. 버튼을 누르거나 응답을 받은 뒤처럼 나중에 재생하고 싶다면 [`Strx.useTimeline`](use-timeline.html)을 써 주세요.
- 컴포넌트 하나에 여러 애니메이션을 쓰고 싶다면 [배열 재생](playback.html)을 확인해 보세요.
