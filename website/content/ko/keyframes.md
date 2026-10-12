---
title: 키프레임
description: from:·to: 유틸리티나 스타일 객체로 시작 값과 끝 값을 직접 적습니다.
---

맞는 프리셋이 없으면 `from:`과 `to:` 토큰으로 애니메이션을 직접 적습니다. 각각 `opacity-0`, `translate-y-20` 같은 유틸리티 앞에 붙여 씁니다.

```tsx
<Strx.View animate="from:opacity-0 from:-translate-y-20 to:opacity-100 to:translate-y-0 duration-300" />
```

<div data-demo="sandbox" data-animate="from:opacity-0 from:-translate-y-20 from:rotate-12 duration-500 ease-out"></div>

## 접두사 {#prefixes}

<!-- strx:prefixes -->

## 유틸리티 {#utilities}

<!-- strx:utilities -->

음수를 받는 유틸리티는 앞에 대시를 붙여 음수 값을 씁니다. 예: `from:-translate-x-24`, `from:-rotate-90`.

## 시작 값이나 끝 값이 없을 때 {#missing-start-or-end-values}

한쪽만 적어도 됩니다. `from:` 값만 있는 채널은 기본값(중립값)으로 움직이고, `to:` 값만 있는 채널은 기본값에서 시작합니다.

| 채널 | 기본값 |
| --- | --- |
| `opacity`, `scale`, `scaleX`, `scaleY` | `1` |
| `translateX`, `translateY` | `0` |
| `rotate` | `0deg` |

그래서 아래 두 줄은 같습니다.

```tsx
<Strx.View animate="from:opacity-0 from:scale-90" />
<Strx.View animate="from:opacity-0 to:opacity-100 from:scale-90 to:scale-100" />
```

## 프리셋과 함께 쓰기 {#with-a-preset}

한 그룹에서 프리셋과 키프레임을 함께 쓸 수 있습니다. 키프레임이 채널별로 프리셋 값을 덮어쓰고, 나머지는 프리셋 그대로 유지됩니다.

```tsx
// fade-in의 opacity에, 8pt 아래에서 올라오는 움직임을 더합니다
<Strx.View animate="fade-in from:translate-y-8" />

// slide-up이지만 더 먼 곳에서 출발합니다
<Strx.View animate="slide-up from:translate-y-80" />
```

<div data-demo="tokens" data-options="fade-in from:translate-y-8|slide-up from:translate-y-80 duration-500|scale-in from:rotate-12 from:opacity-0"></div>

## 키프레임 반복하기 {#looping-keyframes}

`play-*`를 더하면 반복합니다. 매번 `from` 프레임에서 다시 시작합니다.

```tsx
// 숨 쉬듯 커졌다 작아지는 배지
<Strx.View animate="from:scale-90 to:scale-110 duration-600 ease-in-out play-infinite" />
```

## 객체: 애니메이션 가능한 모든 스타일 {#objects-any-animatable-style}

토큰은 자주 쓰는 채널을 다룹니다. 색상, 모서리 반경, 여백처럼 그 밖의 스타일은 객체로 넘기세요.

```tsx
<Strx.View
  animate={{
    from: { opacity: 0, backgroundColor: "#eef1ff", borderRadius: 4, transform: [{ rotate: "-8deg" }] },
    to: { opacity: 1, backgroundColor: "#3552f0", borderRadius: 18, transform: [{ rotate: "0deg" }] },
    duration: 500,
    easing: "ease-out",
  }}
/>
```

`from` / `to` 객체에서 쓸 수 있는 키는 다음과 같습니다.

| 분류 | 키 |
| --- | --- |
| 불투명도 | `opacity` |
| 변형 | `translateX`, `translateY`, `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skewX`, `skewY`, `perspective` (키로 바로 쓰거나 `transform` 안에) |
| 크기 | `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight` |
| 위치 | `top`, `right`, `bottom`, `left` |
| 여백 | `margin*`, `padding*` (전체, 가로, 세로 모두) |
| 테두리 | `borderRadius`와 모서리별 반경, `borderWidth`와 변별 두께 |
| 색상 | `backgroundColor`, `borderColor`와 변별 테두리 색 |

크기, 위치, 여백에는 숫자나 `"50%"` 같은 퍼센트 문자열을 쓸 수 있습니다. 각도는 `"45deg"`처럼 문자열로 씁니다.

> [!TIP] 크기 애니메이션
> `w-*` / `h-*`나 객체의 `width` / `height`는 뷰 자체의 크기를 애니메이션하기 때문에, 매 프레임 자식의 레이아웃을 다시 계산합니다. 내용이 바뀌어서 생기는 크기 변화라면 [레이아웃 트랜지션](layout.html)을 쓰는 편이 좋습니다.

## 키프레임과 타임라인 {#keyframes-and-timelines}

키프레임은 [`Strx.useTimeline`](use-timeline.html)이 재생하는 내용도 정합니다. `play()`는 `from` 프레임에서 `to` 프레임으로, `reverse()`는 반대로 움직이고, `reset()`은 곧바로 `from`으로 돌아갑니다. `exit:` 값은 타임라인의 `to` 프레임에 포함되지 않습니다.
