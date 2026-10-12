---
title: API 레퍼런스
description: react-native-strx와 react-native-strx/debug가 내보내는 모든 것을 정리했어요.
---

## 가져오는 경로 {#entry-points}

| 경로 | 들어 있는 것 |
| --- | --- |
| `react-native-strx` | 컴포넌트, 훅, `definePreset`, 타입 |
| `react-native-strx/debug` | `StrxDebugOverlay` (개발용) |
| `react-native-strx/tokens.json` | 토큰 정보 ([스키마](editor.html#token-metadata-for-other-tools)) |

## Strx 네임스페이스 {#strx-namespace}

```tsx
import { Strx } from "react-native-strx";
```

| 멤버 | 문서 |
| --- | --- |
| `Strx.View`, `Strx.Text`, `Strx.Pressable`, `Strx.Image`, `Strx.ScrollView`, `Strx.TextInput` | [컴포넌트](components.html) |
| `Strx.Timeline` | [Strx.Timeline](timeline.html) |
| `Strx.Provider` | [Provider](provider.html) |
| `Strx.TimelineRoot` | [Provider](provider.html#strxtimelineroot) |
| `Strx.LayoutGroup` | [LayoutGroup](layout-group.html) |
| `Strx.useTimeline` | [useTimeline](use-timeline.html) |

네임스페이스 객체는 고정(freeze)되어 있어서 바꿀 수 없어요.

## 이름으로 내보내는 것 {#named-exports}

### 컴포넌트 {#components}

| 이름 | 같은 것 |
| --- | --- |
| `StrxView` | `Strx.View` |
| `StrxText` | `Strx.Text` |
| `StrxPressable` | `Strx.Pressable` |
| `StrxImage` | `Strx.Image` |
| `StrxScrollView` | `Strx.ScrollView` |
| `StrxTextInput` | `Strx.TextInput` |
| `StrxTimeline` | `Strx.Timeline` |
| `StrxProvider` | `Strx.Provider` |
| `StrxTimelineRoot` | `Strx.TimelineRoot` |
| `StrxLayoutGroup` | `Strx.LayoutGroup` |

### 함수와 훅 {#functions-and-hooks}

| 이름 | 시그니처 | 문서 |
| --- | --- | --- |
| `createStrxComponent` | `(Component, options?) => StrxComponent` | [커스텀 컴포넌트](custom-components.html) |
| `useTimeline` | `(options: UseTimelineOptions) => StrxTimelineController` | [useTimeline](use-timeline.html) |
| `useStrxMotion` | `() => StrxMotionContextValue` | [Provider](provider.html#reading-the-settings-usestrxmotion) |
| `definePreset` | `(name: string, preset: StrxPreset) => void` | [프리셋](presets.html#custom-presets-with-definepreset) |
| `animationPresets` | `Readonly<Record<string, Readonly<StrxPreset>>>` | [프리셋](presets.html#reading-registered-presets) |

### 컴포넌트 prop 타입 {#component-prop-types}

| 타입 | 대상 |
| --- | --- |
| `StrxViewProps` | `Strx.View` |
| `StrxTextProps` | `Strx.Text` |
| `StrxPressableProps` | `Strx.Pressable` |
| `StrxImageProps` | `Strx.Image` |
| `StrxScrollViewProps` | `Strx.ScrollView` |
| `StrxTextInputProps` | `Strx.TextInput` |
| `StrxTimelineProps` | `Strx.Timeline` |
| `StrxProviderProps` | `Strx.Provider` |
| `StrxLayoutGroupProps` | `Strx.LayoutGroup` |
| `StrxLayoutGroupTransition` | `"linear" \| "spring"` |
| `StrxComponentOptions` | `createStrxComponent` 옵션 |
| `StrxComponentProps<Props>` | `createStrxComponent`로 만든 컴포넌트의 prop |
| `StrxLayoutPropagationMode` | `"auto" \| "none"` |
| `StrxLayoutTransitionType` | `layout-*` 토큰이 쓰는 레이아웃 트랜지션 이름 |

### 타임라인 타입 {#timeline-types}

| 타입 | 모양 |
| --- | --- |
| `UseTimelineOptions` | `{ playables, playback?, interval?, playCount?, onComplete? }` |
| `StrxTimelinePlayable` | `{ target: string; animate: AnimateProp }` |
| `StrxTimelineController` | `{ play(); reverse(); reset(); stop() }` |

### 모션 타입 {#motion-types}

| 타입 | 모양 |
| --- | --- |
| `StrxMotionPreset` | `{ duration?: number; easing?: StrxEasingName; reduceMotion?: StrxReduceMotionMode }` |
| `StrxMotionContextValue` | `{ duration?; easing?; reduceMotion; isReduceMotionEnabled }` |
| `StrxReduceMotionMode` | `"system" \| "always" \| "never"` |
| `StrxEasingName` | `"linear" \| "ease" \| "ease-in" \| "ease-out" \| "ease-in-out"`, 또는 아무 문자열 |

### 프리셋 타입 {#preset-types}

| 타입 | 모양 |
| --- | --- |
| `StrxPreset` | `{ initial; target; options: PresetMotionOptions }` |
| `PresetMotionOptions` | `{ driver: "timing" \| "spring"; duration?; damping?; stiffness?; mass? }` |
| `AnimatableChannel` | `"opacity" \| "translateX" \| "translateY" \| "scale"` |
| `BuiltInAnimationPreset` | 기본 프리셋 이름 |

### animate 타입 {#animate-types}

| 타입 | 의미 |
| --- | --- |
| `AnimateProp` | `animate` prop에 쓸 수 있는 모든 값: 토큰 문자열, 객체, 또는 이들의 (중첩) 배열 |
| `AnimateValue` | `AnimateProp`과 같아요 |
| `AnimateEntry` | 토큰 문자열이나 객체 하나 |
| `AnimateToken` | 에디터 힌트용 토큰 목록이에요. 문자열이라면 무엇이든 받아요 |
| `AnimateObject` | `PresetAnimateObject \| CustomFromToAnimateObject` |
| `PresetAnimateObject` | `{ type: string } & 타이밍 옵션` |
| `CustomFromToAnimateObject` | `{ from: AnimateStyle; to: AnimateStyle } & 타이밍 옵션` |
| `AnimateStyle` | 키프레임 객체에 쓸 수 있는 스타일 키 ([목록](keyframes.html#objects-any-animatable-style)) |
| `AnimateTransformStyle` | `AnimateStyle` 중 transform 부분 |
| `AnimateScalar` | `number \| string` |
| `AnimateLayoutToken` | `layout-*` 토큰 이름 |
| `AnimateTransitionToken` | `transition-*` 토큰 이름 |
| `PlaybackMode` | `"parallel" \| "serial" \| "stagger"` |

## react-native-strx/debug {#react-native-strxdebug}

| 이름 | 문서 |
| --- | --- |
| `StrxDebugOverlay` | [디버깅](debugging.html#debug-overlay) |
| `StrxDebugOverlayProps` | 오버레이의 prop |
| `StrxDebugOverlayPosition` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` |
