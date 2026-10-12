---
title: 소개
description: Reanimated 4로 동작하는, React Native용 Tailwind 스타일 애니메이션 토큰이에요.
---

`react-native-strx`(STRX)를 쓰면 React Native 컴포넌트에 애니메이션을 짧은 토큰 문자열로 바로 적을 수 있어요.

```tsx
import { Strx } from "react-native-strx";

<Strx.View animate="fade-in from:translate-y-12 layout-spring duration-400" />
```

이 prop 하나로 뷰가 서서히 나타나면서 12포인트 아래에서 올라오고, 크기나 위치가 바뀌면 스프링처럼 부드럽게 움직여요. 등장 시간은 400ms예요. STRX는 문자열을 한 번만 해석해서 저장해 두고, Reanimated로 UI 스레드에서 애니메이션을 실행해요.

<div data-demo="tokens" data-options="fade-in from:translate-y-12 duration-400|scale-in from:opacity-0|bounce|slide-right from:opacity-0 duration-500 ease-in-out"></div>

## 이런 걸 움직일 수 있어요 {#what-you-can-animate}

앱에 필요한 모션 대부분을 `animate` prop 하나로 다룰 수 있어요.

| 종류 | 토큰 | 문서 |
| --- | --- | --- |
| 등장 프리셋 | `fade-in`, `slide-up`, `scale-in`, `bounce` 등 | [프리셋](presets.html) |
| 직접 만드는 키프레임 | `from:opacity-0`, `to:scale-110` 등 | [키프레임](keyframes.html) |
| 타이밍 | `duration-300`, `delay-100`, `ease-out`, `play-3` 등 | [타이밍과 이징](timing.html) |
| 물리 기반 모션 | `spring`, `damping-12`, `stiffness-180`, `mass-1` | [스프링](springs.html) |
| 사라질 때 | `exit:opacity-0`, `exit:scale-90` 등 | [퇴장 애니메이션](exit.html) |
| 스타일이 바뀔 때 | `transition-colors`, `transition-transform` 등 | [스타일 트랜지션](transitions.html) |
| 크기와 위치 | `layout-spring`, `layout-linear` 등 | [레이아웃 트랜지션](layout.html) |

그 밖에도 이런 기능이 있어요.

- 여러 컴포넌트를 함께 움직이는 [`Strx.Timeline`](timeline.html), [`Strx.useTimeline`](use-timeline.html)
- 한 영역에 레이아웃 트랜지션을 함께 적용하는 [`Strx.LayoutGroup`](layout-group.html)
- 앱 전체 기본값과 동작 줄이기를 관리하는 [`Strx.Provider`](provider.html)
- 어떤 컴포넌트에든 `animate`를 붙여 주는 [`createStrxComponent`](custom-components.html)

## 왜 토큰으로 쓰나요? {#why-tokens}

- **읽기 쉬워요.** `fade-in slide-up`은 읽는 그대로 움직여요. 다른 파일을 열어 보지 않아도 어떤 모션인지 바로 알 수 있어요.
- **팀 전체가 같은 모션을 써요.** 화면마다 `withTiming` 값을 따로 맞추는 대신, 모두가 같은 프리셋과 시간 값을 함께 써요.
- **빨라요.** 문자열은 한 번만 해석하고 저장해 둬요. 애니메이션은 Reanimated를 통해 UI 스레드에서 돌고, 레이아웃 토큰이 없는 컴포넌트에는 레이아웃 애니메이션 비용이 들지 않아요.
- **실수를 바로 알려 줘요.** 모르는 토큰을 쓰면 개발 중에 경고와 함께 수정 제안(`fade-inn` → `fade-in`)을 보여 줘요. [VS Code 확장](editor.html)을 쓰면 모든 토큰이 자동 완성돼요.

## 필요한 환경 {#requirements}

| 패키지 | 버전 |
| --- | --- |
| `react` | 19 이상 |
| `react-native` | 0.78 이상, New Architecture |
| `react-native-reanimated` | 4.1 이상 |
| `react-native-worklets` | 0.5 이상 |

아직 Reanimated 3을 쓰고 있다면 `react-native-strx@0.1.x`를 계속 써 주세요. 0.1 버전에서 넘어온다면 [마이그레이션 가이드](migration.html)를 먼저 확인해 보세요.

## 다음 단계 {#next-steps}

- [STRX를 설치](installation.html)하고 Babel을 설정해요.
- [빠른 시작](quick-start.html)을 따라 애니메이션이 들어간 화면을 만들어 봐요.
- [animate prop](animate-prop.html)에서 토큰 문자열을 읽는 규칙을 알아봐요.
