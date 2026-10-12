---
title: 스프링
description: damping, stiffness, mass로 조절하는 물리 기반 모션이에요.
---

그룹에 `spring`을 더하면, 정해진 곡선 대신 스프링으로 숫자 값들을 움직여요. 스프링은 자연스럽게 멈추고 반응이 빨라서, 크기나 위치를 움직일 때 특히 잘 어울려요.

```tsx
<Strx.View animate="scale-in spring" />
<Strx.View animate="from:translate-y-40 spring damping-14 stiffness-200" />
```

## 스프링 토큰 {#spring-tokens}

| 토큰 | 의미 | 기본값 |
| --- | --- | --- |
| `spring` | 이 그룹을 스프링으로 움직여요 | — |
| `damping-*` | 마찰이에요. 낮을수록 더 많이 튕겨요. | 10 |
| `stiffness-*` | 탄성이에요. 높을수록 더 빨리 움직여요. | 100 |
| `mass-*` | 무게예요. 높을수록 묵직하고 느리게 움직여요. | 1 |

`bounce`처럼 프리셋에 스프링 값이 있으면 그 값을 먼저 쓰고, 없으면 위의 기본값을 써요.

<div data-demo="springs" data-options="spring|spring damping-6|spring damping-20 stiffness-200|spring stiffness-300 mass-0.6|spring mass-3"></div>

## 스프링은 얼마나 오래 움직이나요? {#how-long-does-a-spring-run}

스프링에는 정해진 지속 시간이 없어요. 자연스럽게 멈출 때까지 움직이기 때문에 `duration-*`와 이징 토큰이 적용되지 않아요. 더 빠르게 하고 싶다면 `stiffness`를 높이거나 `mass`를 낮추고, 더 차분하게 하고 싶다면 `damping`을 높여 보세요.

## 스프링을 쓰는 프리셋 {#presets-that-use-springs}

`bounce`는 기본으로 스프링을 써요(damping 8, stiffness 180, mass 0.9). 다른 프리셋도 `spring` 토큰만 더하면 스프링으로 바뀌어요.

```tsx
<Strx.View animate="bounce" />
<Strx.View animate="slide-up spring damping-18" />
```

<div data-demo="tokens" data-options="bounce|slide-up spring damping-18|scale-in spring damping-8 stiffness-260|fade-in, slide-up spring"></div>

직접 만드는 프리셋도 기본으로 스프링을 쓰게 할 수 있어요. [`definePreset`](presets.html)을 확인해 보세요.

## 객체로 쓰기 {#objects}

객체에서는 `easing: "spring"`을 적고, 값은 이름으로 넣어 주세요.

```tsx
<Strx.View animate={{ type: "scale-in", easing: "spring", damping: 12, stiffness: 220 }} />
```

## 레이아웃 스프링 {#layout-springs}

레이아웃 트랜지션에는 미리 값을 맞춰 둔 스프링 토큰이 따로 있어요. `layout-spring`, `layout-spring-stiff`, `layout-spring-bouncy`예요. `spring` 토큰과는 따로 동작해요. [레이아웃 트랜지션](layout.html)에서 확인해 보세요.
