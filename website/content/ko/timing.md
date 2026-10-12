---
title: 타이밍과 이징
description: 지속 시간, 지연, 이징, 반복 토큰과 STRX가 값을 정하는 순서를 알아봐요.
---

타이밍 토큰은 같은 쉼표 그룹 안의 프리셋, 키프레임, `exit:`, `transition-*` 토큰에 적용돼요.

```tsx
<Strx.View animate="slide-up duration-500 delay-150 ease-in-out" />
```

## 타이밍 토큰 {#timing-tokens}

<!-- strx:timing -->

## 지속 시간 {#duration}

`duration-*`는 밀리초 단위예요. STRX는 아래 순서대로 살펴보고, 가장 먼저 정해진 값을 써요.

1. `duration-*` 토큰, 또는 객체의 `duration`
2. 프리셋 기본값 (예: `slide-up`은 320ms)
3. `Strx.Provider`의 `motionPreset.duration`
4. 300ms

```tsx
<Strx.Provider motionPreset={{ duration: 200 }}>
  <Strx.View animate="fade-in" />              {/* 300ms: fade-in 기본값 */}
  <Strx.View animate="from:opacity-0" />       {/* 200ms: Provider 값 */}
  <Strx.View animate="fade-in duration-600" /> {/* 600ms: 토큰 값 */}
</Strx.Provider>
```

`duration-*`는 같은 그룹 안의 `layout-linear`, `layout-fade` 지속 시간도 함께 정해요.

## 지연 {#delay}

`delay-*`만큼 기다렸다가 애니메이션을 시작해요. 반복할 때마다 기다리지 않고, 처음 한 번만 기다려요.

```tsx
<Strx.View animate="fade-in, slide-up delay-200" />
```

지연을 쓰면 순서대로 움직이는 장면을 손쉽게 만들 수 있어요. 리스트라면 [`Strx.Timeline`](timeline.html)이 간격을 알아서 계산해 줘요.

## 이징 {#easing}

이징 토큰은 타이밍 애니메이션의 속도 곡선을 정해요. 따로 적지 않으면 Provider의 `motionPreset.easing`을, 그것도 없으면 `ease-out`을 써요.

<!-- strx:easings -->

<div data-demo="easing"></div>

이징은 스프링 애니메이션에는 적용되지 않아요. 스프링은 [스프링](springs.html) 문서를 확인해 주세요.

## 반복하기 {#repeating}

`play-*`는 **모두 몇 번** 재생할지 정해요. `play-3`이면 세 번 재생해요. `play-infinite`는 컴포넌트가 사라지거나 애니메이션이 바뀔 때까지 계속 반복해요. `repeat-*`는 같은 기능의 예전 이름이에요.

```tsx
<Strx.View animate="from:opacity-40 to:opacity-100 duration-800 ease-in-out play-infinite" />
```

매번 `from` 모습에서 다시 시작해요. 여러 컴포넌트로 된 장면 전체를 반복하려면 [`Strx.Timeline`](timeline.html)의 `playCount`를 써 보세요.

## 동작 줄이기 {#reduce-motion}

동작 줄이기가 켜져 있으면 지속 시간과 지연은 0이 되고 반복은 한 번만 해요. 그래서 화면이 곧바로 마지막 모습으로 바뀌어요. 자세한 내용은 [접근성](accessibility.html)에서 확인해 보세요.

## 앱 전체 기본값 {#global-defaults}

Provider에서 앱 전체 기본값을 정할 수 있어요. 토큰에 적은 값이 항상 먼저예요.

```tsx
<Strx.Provider motionPreset={{ duration: 260, easing: "ease-out" }}>
  <App />
</Strx.Provider>
```
