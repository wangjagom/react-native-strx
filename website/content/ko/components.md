---
title: 컴포넌트
description: STRX 기본 컴포넌트와 공통 prop, 그리고 가져오는 방법이에요.
---

STRX는 React Native 기본 컴포넌트를 애니메이션할 수 있게 만든 버전을 제공해요. 원래 컴포넌트의 prop과 이벤트는 모두 그대로 쓸 수 있고, 아래 STRX prop이 더해져요.

```tsx
import { Strx } from "react-native-strx";

<Strx.View animate="fade-in" style={styles.card} onLayout={onLayout} />
```

## 가져오기 {#importing}

`Strx` 네임스페이스로 쓰는 걸 추천해요. 애니메이션 컴포넌트가 React Native 기본 컴포넌트와 한눈에 구분돼요.

```tsx
import { Strx } from "react-native-strx";

<Strx.View />
<Strx.Text />
```

이름으로 하나씩 가져올 수도 있어요.

```tsx
import { StrxView, StrxText, StrxPressable } from "react-native-strx";
```

| 네임스페이스 | 이름으로 가져오기 | 감싼 컴포넌트 |
| --- | --- | --- |
| `Strx.View` | `StrxView` | `View` |
| `Strx.Text` | `StrxText` | `Text` |
| `Strx.Pressable` | `StrxPressable` | `Pressable` |
| `Strx.Image` | `StrxImage` | `Image` |
| `Strx.ScrollView` | `StrxScrollView` | `ScrollView` |
| `Strx.TextInput` | `StrxTextInput` | `TextInput` |
| `Strx.Timeline` | `StrxTimeline` | 자식들을 연출하는 `Strx.View` ([문서](timeline.html)) |
| `Strx.Provider` | `StrxProvider` | 앱 전체 설정 ([문서](provider.html)) |
| `Strx.TimelineRoot` | `StrxTimelineRoot` | 타임라인 대상만 관리 ([문서](provider.html)) |
| `Strx.LayoutGroup` | `StrxLayoutGroup` | 함께 쓰는 레이아웃 트랜지션 ([문서](layout-group.html)) |
| `Strx.useTimeline` | `useTimeline` | 이벤트 타임라인 ([문서](use-timeline.html)) |

STRX는 `View`, `Text`처럼 React Native와 같은 이름으로 컴포넌트를 내보내지 않아서, 기본 컴포넌트를 가릴 일이 없어요. `animate` prop은 STRX 컴포넌트에만 있어서, 일반 `View`에 쓰면 TypeScript가 알려 줘요.

## 공통 prop {#shared-props}

[`createStrxComponent`](custom-components.html)로 만든 컴포넌트를 포함해, 모든 STRX 컴포넌트가 이 prop을 받아요.

| Prop | 타입 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `animate` | `AnimateProp` | — | 토큰 문자열, 객체, 배열. [animate prop](animate-prop.html)을 확인해 보세요. |
| `playback` | `"parallel" \| "serial" \| "stagger"` | `"parallel"` | 배열 항목을 어떤 순서로 재생할지. [배열 재생](playback.html)을 확인해 보세요. |
| `interval` | `number` | `100` | `playback="stagger"`일 때 간격(ms) |
| `strxId` | `string` | — | [`useTimeline`](use-timeline.html) 대상으로 등록해요 |
| `layoutClip` | `boolean` | `false` | 레이아웃 트랜지션이 적용되는 동안 `overflow: "hidden"`을 넣어요. [레이아웃](layout.html)을 확인해 보세요. |
| `layoutPropagation` | `"auto" \| "none"` | `"auto"` | `"none"`이면 물려받은 레이아웃 트랜지션을 쓰지 않아요. [레이아웃](layout.html)을 확인해 보세요. |

ref는 안쪽 네이티브 컴포넌트까지 그대로 전달돼요.

## Strx.View {#strxview}

어디에나 쓰는 애니메이션 컨테이너예요. 카드, 섹션, 오버레이처럼 `View`로 만들던 건 무엇이든 만들 수 있어요.

```tsx
<Strx.View animate="fade-in from:translate-y-12 layout-spring" style={styles.card}>
  <Strx.Text>카드 내용</Strx.Text>
</Strx.View>
```

## Strx.Text {#strxtext}

애니메이션되는 텍스트예요. `exit:`를 포함한 모든 토큰을 쓸 수 있고, STRX 부모의 레이아웃 트랜지션을 물려받아서 줄바꿈이 바뀌어도 부드럽게 움직여요.

```tsx
<Strx.Text animate="fade-in from:translate-y-8 duration-400">
  다시 오신 걸 환영해요
</Strx.Text>
```

## Strx.Pressable {#strxpressable}

버튼이나 목록 행처럼 누를 수 있는 컴포넌트예요. 함수형 style(`({ pressed }) => ...`)과 `transition-*` 토큰을 함께 쓰면 누르는 순간이 부드럽게 움직여요. 직접 넣은 `onPressIn`, `onPressOut`, `onPress`, `onLongPress`도 그대로 실행되고, 자식은 레이아웃 트랜지션을 물려받아요.

```tsx
<Strx.Pressable
  animate="transition-all duration-150"
  onPress={onToggle}
  style={({ pressed }) => ({
    backgroundColor: pressed ? "#2440d6" : "#3552f0",
    transform: [{ scale: pressed ? 0.97 : 1 }],
  })}
>
  <Strx.Text style={{ color: "white" }}>바꾸기</Strx.Text>
</Strx.Pressable>
```

`animate` 문자열 하나에는 스타일 트랜지션이 하나만 적용돼요. `transition-*` 토큰을 여러 개 적으면 마지막 것을 따라요. 색과 크기를 함께 움직이려면 위처럼 `transition-all`을 써 주세요.

<div data-demo="pressable"></div>

## Strx.Image {#strximage}

프로필 사진, 썸네일, 큰 배너 이미지에 쓰는 애니메이션 이미지예요. 레이아웃이 예상대로 그려지도록 크기를 꼭 정해 주세요.

```tsx
<Strx.Image
  animate="fade-in, scale-in layout-linear"
  source={{ uri: avatarUrl }}
  style={{ width: 72, height: 72, borderRadius: 36 }}
/>
```

## Strx.ScrollView {#strxscrollview}

애니메이션할 수 있고, 자식에게 레이아웃 트랜지션을 물려주는 스크롤 컨테이너예요. 섹션이 펼쳐지고 접히는 화면에 써 보세요.

```tsx
<Strx.ScrollView animate="layout-linear" contentContainerStyle={{ gap: 12 }}>
  {sections.map(section => (
    <Strx.View key={section.id} animate="fade-in">
      <Section {...section} />
    </Strx.View>
  ))}
</Strx.ScrollView>
```

긴 가상화 리스트라면 [긴 리스트](layout.html#long-lists)를 확인해 보세요.

## Strx.TextInput {#strxtextinput}

포커스 테두리나 입력 검사 상태를 표현하는 애니메이션 입력창이에요. 테두리와 배경에는 `transition-colors`를 추천해요.

```tsx
<Strx.TextInput
  animate="transition-colors duration-200"
  value={value}
  onChangeText={setValue}
  style={{ borderWidth: 2, borderColor: invalid ? "#dc2626" : "#d3d8e2" }}
/>
```

## 다른 컴포넌트 {#other-components}

`SafeAreaView`, `FlatList`의 항목, `LinearGradient`, 직접 만든 컴포넌트도 움직이고 싶다면 [`createStrxComponent`](custom-components.html)로 감싸 주세요.
