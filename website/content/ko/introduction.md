---
title: 소개
description: Reanimated 4로 동작하는, React Native를 위한 Tailwind 스타일 애니메이션 토큰.
---

`react-native-strx`(STRX)는 애니메이션을 React Native 컴포넌트에 짧은 토큰 문자열로 바로 적을 수 있게 해 줍니다.

```tsx
import { Strx } from "react-native-strx";

<Strx.View animate="fade-in from:translate-y-12 layout-spring duration-400" />
```

prop 하나로 뷰가 서서히 나타나고, 12포인트 아래에서 위로 올라오고, 크기와 위치가 바뀔 때는 스프링처럼 움직이며, 등장 시간은 400ms가 됩니다. STRX는 이 문자열을 한 번만 해석해 캐시해 두고, Reanimated로 UI 스레드에서 애니메이션을 실행합니다.

<div data-demo="tokens" data-options="fade-in from:translate-y-12 duration-400|scale-in from:opacity-0|bounce|slide-right from:opacity-0 duration-500 ease-in-out"></div>

## 무엇을 움직일 수 있나요 {#what-you-can-animate}

앱에 필요한 대부분의 모션을 모두 같은 `animate` prop으로 다룹니다.

| 종류 | 토큰 | 문서 |
| --- | --- | --- |
| 등장 프리셋 | `fade-in`, `slide-up`, `scale-in`, `bounce` 등 | [프리셋](presets.html) |
| 커스텀 키프레임 | `from:opacity-0`, `to:scale-110` 등 | [키프레임](keyframes.html) |
| 타이밍 | `duration-300`, `delay-100`, `ease-out`, `play-3` 등 | [타이밍과 이징](timing.html) |
| 물리 기반 | `spring`, `damping-12`, `stiffness-180`, `mass-1` | [스프링](springs.html) |
| 언마운트 | `exit:opacity-0`, `exit:scale-90` 등 | [퇴장 애니메이션](exit.html) |
| 스타일 변화 | `transition-colors`, `transition-transform` 등 | [스타일 트랜지션](transitions.html) |
| 크기와 위치 | `layout-spring`, `layout-linear` 등 | [레이아웃 트랜지션](layout.html) |

이 밖에도 여러 컴포넌트를 함께 움직이는 연출 도구([`Strx.Timeline`](timeline.html), [`Strx.useTimeline`](use-timeline.html)), 레이아웃 트랜지션을 영역 단위로 공유하는 [`Strx.LayoutGroup`](layout-group.html), 앱 전체 기본값과 동작 줄이기를 다루는 [`Strx.Provider`](provider.html), 어떤 컴포넌트에든 `animate`를 붙이는 [`createStrxComponent`](custom-components.html)가 있습니다.

## 왜 토큰인가요 {#why-tokens}

- **읽기 쉽습니다.** `fade-in slide-up`은 읽는 그대로 동작합니다. 리뷰어가 다른 파일을 열어 보지 않아도 어떤 모션인지 알 수 있습니다.
- **일관됩니다.** 화면마다 `withTiming`을 손으로 조율하는 대신, 팀 전체가 작은 프리셋·시간 어휘를 함께 씁니다.
- **빠릅니다.** 문자열은 한 번만 해석해 캐시합니다. 애니메이션은 Reanimated를 통해 UI 스레드에서 실행되고, 레이아웃 토큰이 없는 컴포넌트에는 레이아웃 애니메이션 비용이 전혀 들지 않습니다.
- **틀리기 어렵습니다.** 알 수 없는 토큰은 개발 중에 경고와 함께 수정 제안(`fade-inn` → `fade-in`)을 보여 주고, [VS Code 확장](editor.html)이 모든 토큰을 자동 완성합니다.

## 요구 사항 {#requirements}

| 패키지 | 버전 |
| --- | --- |
| `react` | 19 이상 |
| `react-native` | 0.78 이상, New Architecture |
| `react-native-reanimated` | 4.1 이상 |
| `react-native-worklets` | 0.5 이상 |

아직 Reanimated 3을 쓰는 앱은 `react-native-strx@0.1.x`를 계속 사용하세요. 0.1에서 올라오신다면 [마이그레이션 가이드](migration.html)를 확인하세요.

## 다음 단계 {#next-steps}

- [STRX를 설치](installation.html)하고 Babel을 설정합니다.
- [빠른 시작](quick-start.html)을 따라 애니메이션이 들어간 화면을 만들어 봅니다.
- [animate prop](animate-prop.html)에서 토큰 문자열을 해석하는 규칙을 알아봅니다.
