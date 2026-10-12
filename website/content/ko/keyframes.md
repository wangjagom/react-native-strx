---
title: 키프레임
description: from:·to: 유틸리티나 스타일 객체로 시작 값과 끝 값을 직접 정해요.
---

맞는 프리셋이 없다면 `from:`과 `to:` 토큰으로 애니메이션을 직접 적어 보세요. `opacity-0`, `translate-y-20` 같은 유틸리티 앞에 붙여 쓰면 돼요.

```tsx
<Strx.View animate="from:opacity-0 from:-translate-y-20 to:opacity-100 to:translate-y-0 duration-300" />
```

<div data-demo="sandbox" data-animate="from:opacity-0 from:-translate-y-20 from:rotate-12 duration-500 ease-out"></div>

## 접두사 {#prefixes}

<!-- strx:prefixes -->

## 유틸리티 {#utilities}

<!-- strx:utilities -->

음수를 쓸 수 있는 유틸리티는 앞에 대시를 붙여요. 예를 들면 `from:-translate-x-24`, `from:-rotate-90`처럼요.

## 시작 값이나 끝 값 하나만 써도 돼요 {#missing-start-or-end-values}

한쪽만 적어도 괜찮아요. `from:` 값만 있으면 기본값으로 돌아오며 움직이고, `to:` 값만 있으면 기본값에서 출발해요.

| 채널 | 기본값 |
| --- | --- |
| `opacity`, `scale`, `scaleX`, `scaleY` | `1` |
| `translateX`, `translateY` | `0` |
| `rotate` | `0deg` |

그래서 아래 두 줄은 똑같이 움직여요.

```tsx
<Strx.View animate="from:opacity-0 from:scale-90" />
<Strx.View animate="from:opacity-0 to:opacity-100 from:scale-90 to:scale-100" />
```

## 프리셋과 함께 쓰기 {#with-a-preset}

한 그룹에서 프리셋과 키프레임을 함께 쓸 수 있어요. 키프레임이 채널별로 프리셋 값을 덮어쓰고, 나머지는 프리셋 그대로 움직여요.

```tsx
// fade-in에 더해, 8pt 아래에서 올라와요
<Strx.View animate="fade-in from:translate-y-8" />

// slide-up인데, 더 멀리서 출발해요
<Strx.View animate="slide-up from:translate-y-80" />
```

<div data-demo="tokens" data-options="fade-in from:translate-y-8|slide-up from:translate-y-80 duration-500|scale-in from:rotate-12 from:opacity-0"></div>

## 반복하기 {#looping-keyframes}

`play-*`를 더하면 반복해요. 매번 `from` 모습에서 다시 시작해요.

```tsx
// 숨 쉬듯 커졌다 작아지는 배지
<Strx.View animate="from:scale-90 to:scale-110 duration-600 ease-in-out play-infinite" />
```

## 객체로 모든 스타일 움직이기 {#objects-any-animatable-style}

토큰은 자주 쓰는 값만 다뤄요. 색상, 모서리 둥글기, 여백처럼 다른 스타일을 움직이고 싶다면 객체를 넘겨 주세요.

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

`from` / `to` 객체에서는 이런 키를 쓸 수 있어요.

| 분류 | 키 |
| --- | --- |
| 투명도 | `opacity` |
| 변형 | `translateX`, `translateY`, `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skewX`, `skewY`, `perspective` (바로 쓰거나 `transform` 안에) |
| 크기 | `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight` |
| 위치 | `top`, `right`, `bottom`, `left` |
| 여백 | `margin*`, `padding*` (전체, 가로, 세로 모두) |
| 테두리 | `borderRadius`와 모서리별 둥글기, `borderWidth`와 방향별 두께 |
| 색상 | `backgroundColor`, `borderColor`와 방향별 테두리 색 |

크기, 위치, 여백에는 숫자나 `"50%"` 같은 퍼센트 문자열을 쓸 수 있어요. 각도는 `"45deg"`처럼 문자열로 적어요.

> [!TIP] 크기를 움직일 때
> `w-*` / `h-*`나 객체의 `width` / `height`는 뷰의 크기를 직접 바꾸기 때문에, 매 프레임 자식 컴포넌트의 배치를 다시 계산해요. 내용이 바뀌면서 크기가 달라지는 경우라면 [레이아웃 트랜지션](layout.html)을 쓰는 게 더 좋아요.

## 키프레임과 타임라인 {#keyframes-and-timelines}

키프레임은 [`Strx.useTimeline`](use-timeline.html)이 재생할 내용도 정해요. `play()`는 `from`에서 `to`로, `reverse()`는 그 반대로 움직이고, `reset()`은 바로 `from`으로 돌아가요. `exit:` 값은 타임라인에 포함되지 않아요.
