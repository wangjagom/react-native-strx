---
title: Provider
description: 앱 전체 모션 기본값, 동작 줄이기, 타임라인 레지스트리를 관리해요.
---

`Strx.Provider`는 STRX의 루트로 쓰길 추천하는 컴포넌트예요. 세 가지 일을 해요.

1. 따로 정하지 않은 애니메이션에 쓸 기본 **지속 시간**과 **easing**을 정해요.
2. 시스템의 **동작 줄이기** 설정을 따르거나, 직접 켜고 꺼요.
3. [`Strx.useTimeline`](use-timeline.html)과 `strxId`가 쓰는 **타임라인 레지스트리**를 가지고 있어요.

```tsx
import { Strx } from "react-native-strx";

export default function App() {
  return (
    <Strx.Provider motionPreset={{ duration: 260, easing: "ease-out", reduceMotion: "system" }}>
      <AppScreens />
    </Strx.Provider>
  );
}
```

일반 `animate` prop은 Provider 없이도 동작해요. 타임라인을 쓸 때만 Provider(또는 `Strx.TimelineRoot`)가 필요해요.

## Props {#props}

| Prop | 타입 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `motionPreset` | `StrxMotionPreset` | — | 기본 모션 설정이에요. 아래를 확인해 보세요. |
| `reduceMotion` | `"system" \| "always" \| "never"` | `"system"` | `motionPreset.reduceMotion`보다 먼저 적용돼요 |
| `children` | `ReactNode` | — | 앱이나 화면 |

`StrxMotionPreset`:

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `duration` | `number` | 기본 지속 시간(ms). 0 이상의 유한한 숫자여야 하고, 다른 값은 무시해요. |
| `easing` | `StrxEasingName` | 기본 easing: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out` |
| `reduceMotion` | `"system" \| "always" \| "never"` | 동작 줄이기 모드 |

## 기본값이 적용되는 순서 {#how-defaults-apply}

Provider는 빈 곳만 채워요. 지속 시간은 이 순서로 정해져요.

1. `duration-*` 토큰이나 객체의 `duration`
2. 프리셋의 기본값
3. `motionPreset.duration`
4. 300ms

그래서 `motionPreset.duration`은 주로 키프레임 애니메이션(`from:` / `to:`), `transition-*`, `layout-linear`, `layout-fade`에 적용돼요. 프리셋은 자기 기본값을 그대로 써요. 퇴장은 항상 300ms가 기본이에요. easing도 같아요. easing 토큰이 먼저고, 없으면 `motionPreset.easing`, 그것도 없으면 `ease-out`이에요.

## Provider 중첩하기 {#nesting-providers}

Provider는 겹쳐서 쓸 수 있어요. 안쪽 Provider가 그 아래 영역의 설정을 바꿔요. 예를 들어 온보딩 화면만 천천히 움직이게 할 수 있어요.

```tsx
<Strx.Provider motionPreset={{ duration: 240 }}>
  <Main />
  <Strx.Provider motionPreset={{ duration: 480, easing: "ease-in-out" }}>
    <Onboarding />
  </Strx.Provider>
</Strx.Provider>
```

Provider마다 타임라인 레지스트리도 따로 만들어요. 그래서 `useTimeline` 대상은 훅과 같은 Provider 안에 있어야 해요.

## 동작 줄이기 {#reduce-motion}

`reduceMotion`은 STRX가 동작을 줄일지 정해요.

| 모드 | 이렇게 동작해요 |
| --- | --- |
| `"system"` | OS 접근성 설정을 따라요 (기본값) |
| `"always"` | 항상 동작을 줄여요. 앱 안에 사용자 설정이 있을 때 써 보세요. |
| `"never"` | 동작을 줄이지 않아요. 화면을 녹화할 때 써 보세요. |

정확히 무엇이 바뀌는지는 [접근성](accessibility.html)에서 확인해 보세요.

## 설정 읽기: useStrxMotion {#reading-the-settings-usestrxmotion}

`useStrxMotion()`은 가장 가까운 Provider의 최종 설정을 돌려줘요. 직접 만든 애니메이션도 STRX와 맞추고 싶을 때 써 보세요.

```tsx
import { useStrxMotion } from "react-native-strx";

function Confetti() {
  const { isReduceMotionEnabled, duration } = useStrxMotion();

  if (isReduceMotionEnabled) return null;
  return <ConfettiCannon duration={duration ?? 300} />;
}
```

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `duration` | `number \| undefined` | 올바른 값이면 `motionPreset.duration` |
| `easing` | `StrxEasingName \| undefined` | 정했다면 `motionPreset.easing` |
| `reduceMotion` | `"system" \| "always" \| "never"` | 최종 모드 |
| `isReduceMotionEnabled` | `boolean` | 지금 동작을 줄이고 있는지 |

Provider 밖에서는 `{ reduceMotion: "system", isReduceMotionEnabled: false }`를 돌려줘요.

## Strx.TimelineRoot {#strxtimelineroot}

`Strx.TimelineRoot`는 모션 설정 없이 타임라인 레지스트리만 제공해요. 전역 기본값 없이 `strxId`와 `useTimeline`만 쓰고 싶을 때, 예를 들어 라이브러리 컴포넌트 안에서 써 보세요.

```tsx
<Strx.TimelineRoot>
  <ScreenContent />
</Strx.TimelineRoot>
```

`Strx.Provider`에 이미 들어 있으니 둘을 함께 쓸 필요는 없어요.
