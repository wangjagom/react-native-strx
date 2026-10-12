---
title: 동작 줄이기
nav: 접근성
description: STRX가 시스템의 동작 줄이기 설정을 어떻게 따르는지, 어떻게 조절하는지 알려 드려요.
---

큰 움직임이 불편해서 **동작 줄이기**(iOS)나 **애니메이션 삭제**(Android)를 켜 두는 분들이 있어요. 앱을 [`Strx.Provider`](provider.html)로 감싸면 STRX가 이 설정을 알아서 따라요. 컴포넌트는 고칠 필요가 없어요.

## 무엇이 바뀌나요 {#what-changes}

동작 줄이기가 켜져 있으면 이렇게 바뀌어요.

| 기능 | 이렇게 동작해요 |
| --- | --- |
| 등장, 키프레임 | 지속 시간과 지연이 0이 돼서, 컴포넌트가 처음부터 마지막 모습으로 나타나요 |
| 스프링 (`bounce`, `spring`) | 지연과 반복은 빠져요. OS 설정이 켜져 있으면 Reanimated가 스프링도 바로 끝내요. OS 설정은 꺼져 있고 `reduceMotion="always"`일 때는 스프링 자체는 그대로 움직여요. |
| `play-*` 반복 | 한 번만 재생해요 |
| `transition-*` | 스타일이 바로 바뀌어요 |
| `layout-*`, `LayoutGroup` | 레이아웃이 바로 바뀌어요 |
| `exit:` | 건너뛰고 컴포넌트를 바로 없애요 |
| `useTimeline` | 대상이 바로 마지막 모습이 되고, `onComplete`는 그대로 불려요 |

앱은 똑같이 동작하고, 움직이지만 않아요.

<div data-demo="reduce"></div>

## 직접 조절하기 {#controlling-it}

Provider의 `reduceMotion` prop(또는 `motionPreset.reduceMotion`)으로 모드를 정해요.

```tsx
// OS 설정을 따라요 (기본값)
<Strx.Provider reduceMotion="system">

// 앱 안의 "동작 줄이기" 스위치
<Strx.Provider reduceMotion={settings.reduceMotion ? "always" : "system"}>

// 데모나 녹화처럼 항상 움직여야 할 때
<Strx.Provider reduceMotion="never">
```

## 코드에서 읽기 {#reading-it-in-your-code}

STRX가 다루지 않는 애니메이션도 맞추고 싶다면 `useStrxMotion()`을 써 보세요.

```tsx
const { isReduceMotionEnabled } = useStrxMotion();

<LottieView autoPlay={!isReduceMotionEnabled} source={celebration} />;
```

## 이렇게 써 보세요 {#guidelines}

- 중요한 내용에는 크게 움직이는 것보다 페이드가 좋아요. 짧은 `fade-in`은 대부분 편하게 느껴요.
- 큰 요소에는 `play-infinite`를 피해 주세요. 반복되는 표시가 필요하다면 작게 만들거나 `isReduceMotionEnabled`를 확인해 주세요.
- 애니메이션만으로 정보를 전달하지 마세요. 동작 줄이기가 켜져 있어도 마지막 모습만으로 뜻이 통해야 해요.
