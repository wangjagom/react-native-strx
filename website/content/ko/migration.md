---
title: 0.1에서 옮겨 오기
description: react-native-strx 0.1.x에서 1.0으로 업그레이드하는 방법이에요.
---

`react-native-strx` 1.0은 `animate="..."` 토큰 문법은 그대로 두고, 파서와 애니메이션 엔진, 레이아웃 처리를 새로 만들었어요. 대부분의 앱은 **꼭 바꿔야 할 것**만 따라 하면 돼요. 나머지는 달라진 동작을 정리한 거라, 관련된 화면이 있다면 확인해 보세요.

## 꼭 바꿔야 할 것 {#required-changes}

### 1. Reanimated 4로 업그레이드하기 {#1-upgrade-to-reanimated-4}

| 패키지 | 0.1.x | 1.0 |
| --- | --- | --- |
| `react` | >= 18 | >= 19 |
| `react-native` | >= 0.74 | >= 0.78, New Architecture 사용 |
| `react-native-reanimated` | >= 3 | >= 4.1 |
| `react-native-worklets` | 선택 | >= 0.5 (필수) |

`react-native-worklets/plugin`을 Babel 플러그인 중 마지막에 넣어 주세요. Expo의 `babel-preset-expo`에는 이미 들어 있어요. Reanimated 3을 계속 써야 하는 앱이라면 `react-native-strx@0.1.x`를 그대로 써 주세요.

### 2. import 이름 바꾸기 {#2-rename-imports}

| 0.1.x | 1.0 |
| --- | --- |
| `import { View, Text, ... } from "react-native-strx"` | `import { Strx } from "react-native-strx"` 후 `Strx.View`, 또는 이름으로 `StrxView`, `StrxText`, ... |
| `Strx.LayoutRoot`, `StrxLayoutRoot` | `Strx.TimelineRoot`, `StrxTimelineRoot` |
| `Strx.DebugOverlay`, `<Strx.Provider debug>` | `import { StrxDebugOverlay } from "react-native-strx/debug"` |
| `CodexViewProps`, `CodexTextProps`, `CodexPressableProps` | `StrxViewProps`, `StrxTextProps`, `StrxPressableProps` |
| `CodexImageProps`, `CodexScrollViewProps`, `CodexTextInputProps` | `StrxImageProps`, `StrxScrollViewProps`, `StrxTextInputProps` |
| `TimelineProps` | `StrxTimelineProps` |
| `CodexAnimationPreset` | `StrxPreset` |
| `LayoutGroupProps`, `LayoutGroupTransition` | `StrxLayoutGroupProps`, `StrxLayoutGroupTransition` |
| `animationPresets[name] = ...`로 직접 바꾸기 | `definePreset(name, preset)` |

예전 이름은 지원 중단 단계 없이 바로 없어졌어요. 이름만 쓰던 `View`, `Text`, `Pressable`, `Image`, `ScrollView`, `TextInput`, `Timeline`, `Provider`도 React Native 기본 컴포넌트를 가려서 더 이상 내보내지 않아요.

### 3. 디버그 오버레이 옮기기 {#3-move-the-debug-overlay}

```tsx
// 0.1.x
<Strx.Provider debug={__DEV__} debugPosition="bottom-left">
  <App />
</Strx.Provider>

// 1.0
import { StrxDebugOverlay } from "react-native-strx/debug";

<Strx.Provider>
  <App />
  {__DEV__ && <StrxDebugOverlay position="bottom-left" />}
</Strx.Provider>;
```

레이아웃 노드 레지스트리가 없어져서, 오버레이에 레이아웃 노드 개수는 더 이상 나오지 않아요.

### 4. 일반 React Native 컴포넌트의 `animate` 고치기 {#4-fix-animate-on-plain-react-native-components}

0.1.x는 React Native의 모든 `ViewProps`에 `animate`를 더해서, `react-native`의 `<View animate="fade-in" />`도 타입 검사를 통과하고 아무 일도 하지 않았어요. 이제는 그렇지 않아서 TypeScript가 그런 곳을 알려 줘요. `Strx.View`로 바꿔 주세요.

### 5. 없어진 저수준 API {#5-removed-low-level-apis}

내부용이던 이 API들은 더 이상 내보내지 않아요: `useCodexAnimation`, `useCodexAnimationEngine`, `compileCodexAnimation`, `reverseCodexAnimation`, `estimateCodexAnimationDuration`, `estimateCodexAnimationDelay`, `Codex*` 컨트롤러/엔진 타입, `normalizeAnimate`, `clearNormalizeAnimateCache`, `getNormalizeAnimateCacheSize`, `StandardAnimConfig`, `LayoutNodeContext`, `useLayoutNode`, `StrxMotionProvider`, `useStrxLayout`, `StrxLayoutContextType`. 커스텀 컴포넌트를 움직이려면 `createStrxComponent`를, 원하는 순간에 재생하려면 `Strx.useTimeline`을 써 주세요. 이 중 꼭 필요한 API가 있었다면, 어떤 상황에서 쓰는지 이슈로 알려 주세요.

## 확인해 볼 동작 변화 {#behavior-changes-to-check}

### 레이아웃 트랜지션 {#layout-transitions}

- **자식 때문에 부모가 움직이지 않아요.** 0.1.x에서는 자식에 `layout-*` 토큰이 있으면 STRX 조상까지 레이아웃 변화를 애니메이션했어요. 1.0에서는 아래쪽으로만 물려줘요. 내용이 바뀔 때 컨테이너 크기가 부드럽게 바뀌어야 한다면, 컨테이너에 토큰을 달거나 그 영역을 `Strx.LayoutGroup`으로 감싸 주세요.

  ```tsx
  <Strx.View animate="layout-spring">
    {open && <Strx.Text animate="fade-in">자세히</Strx.Text>}
  </Strx.View>
  ```

- 이제 `layoutPropagation="none"`은 그 컴포넌트와 그 아래 모든 컴포넌트가 물려받은 레이아웃 트랜지션을 쓰지 않는다는 뜻이에요.
- 가장 가까운 `Strx.LayoutGroup`이 그 바깥의 STRX 조상에게서 물려받은 트랜지션보다 먼저예요.
- 레이아웃 트랜지션이 없는 컴포넌트에는 Reanimated `layout` prop을 넘기지 않아요.
- `layout-linear`와 `layout-fade`가 `duration-*` 토큰과 `Strx.Provider`의 `motionPreset.duration`을 따라요.
- `Strx.LayoutGroup`의 `duration`은 `transition="linear"`일 때만 적용돼요. 스프링 그룹은 스프링 값을 써요.

### 토큰 해석 {#token-parsing}

- **지속 시간 우선순위**는 토큰 → 프리셋 기본값 → `Strx.Provider` 지속 시간 → 300ms 순서예요. 0.1.x에서는 Provider 지속 시간이 프리셋 기본값을 덮어써서, `motionPreset={{ duration: 200 }}`일 때 `slide-up`이 200ms였는데 이제는 320ms예요. 예전 동작이 필요한 곳에는 `duration-*` 토큰을 넣어 주세요.
- 그룹 안에서 토큰 순서는 상관없어요. `layout-spring fade-in`도 이제 `fade-in`을 재생해요.
- 같은 그룹의 프리셋과 `from:/to:` 키프레임은 합쳐지고, 겹치는 값은 키프레임을 따라요. 0.1.x에서는 프리셋이 빠졌어요.
- 쉼표 그룹마다 프리셋은 하나만 쓸 수 있어요. `fade-in slide-up`은 `fade-in`만 재생하고 경고를 보여 줘요. `fade-in, slide-up`으로 써 주세요.
- 숫자는 부호 없는 소수(`300`, `0.5`)여야 해요. `1e3` 같은 지수 표기는 받지 않고, `opacity-*`는 0–100으로 맞춰져요.
- `Strx.useTimeline` 애니메이션의 `to` 프레임에 `exit:` 토큰이 섞여 들어가지 않아요.
- 512자보다 긴 문자열도 무시하지 않고 해석해요.
- 알 수 없는 토큰은 개발 중에 추천 토큰과 함께 경고를 보여 줘요. 문자열마다 한 번만요.
- `Strx.Timeline`은 지연 오프셋을 모든 쉼표 그룹에 적용하고, 원래 있던 `delay-*` 값을 대신하지 않고 더해요.

### 애니메이션 엔진 {#animation-engine}

- 화면에 나타날 때 첫 프레임부터 `from` 모습으로 그려요.
- `transition-*`이 있는 컴포넌트의 `style`이 바뀌어도 등장 애니메이션을 다시 재생하지 않아요.
- 중간에 끊긴 트랜지션은 화면에 보이는 값에서 이어서 움직여요.
- 다른 transform 값이 움직이는 동안에도 고정된 transform은 그대로 남아요.
- `animate`를 없애면 움직이던 값이 원래 정적 스타일로 돌아가요.
- `timeline.stop()`은 애니메이션을 그 자리에서 멈춰요. 0.1.x에서는 사실상 끝까지 재생됐어요.
- `timeline.reverse()`는 애니메이션이 이미 적용되어 있으면 지금 위치에서 거꾸로 이어 가요.
- `onComplete`는 애니메이션이 실제로 끝났을 때 불리고, `stop()`, `reset()`, 더 새로운 `play()`/`reverse()` 뒤에는 불리지 않아요.
- 퇴장 애니메이션이 easing 토큰을 따르고, 동작 줄이기가 켜져 있으면 건너뛰어요.

### 컴포넌트 {#components}

- `Strx.Text`와 `Strx.Pressable`에서 `exit:` 토큰을 쓸 수 있어요.
- `Strx.Pressable`의 함수형 style(`({ pressed }) => ...`)이 `transition-*` 토큰과 함께 동작하고, 자식에게 레이아웃 트랜지션을 물려줘요.
- 같은 `strxId`를 쓰는 두 컴포넌트 중 하나가 사라져도 다른 하나의 등록은 그대로예요.

## 1.0에서 새로 생긴 것 {#new-in-10}

- 커스텀 프리셋을 등록하는 `definePreset(name, preset)`
- `spring`, `damping-*`, `stiffness-*`, `mass-*` 토큰
- `StrxDebugOverlay`를 위한 `react-native-strx/debug` 경로
- 타입 선언이 생성되는 컴파일된 `lib/` 결과물
