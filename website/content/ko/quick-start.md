---
title: 빠른 시작
description: 다섯 단계로 애니메이션이 들어간 카드를 만들면서 STRX 모션을 하나씩 익혀 봐요.
---

작은 프로필 카드를 함께 만들어 볼게요. 단계마다 모션을 하나씩 더해요.

## 1. Provider 추가하기 {#1-add-the-provider}

앱(또는 화면 하나)을 `Strx.Provider`로 감싸 주세요. Provider는 기본 타이밍을 정하고, 기기의 동작 줄이기 설정을 따르고, [이벤트 타임라인](use-timeline.html)을 이어 줘요.

```tsx title="App.tsx"
import { Strx } from "react-native-strx";

export default function App() {
  return (
    <Strx.Provider motionPreset={{ duration: 280, easing: "ease-out" }}>
      <ProfileScreen />
    </Strx.Provider>
  );
}
```

`animate` prop만 쓴다면 Provider가 없어도 괜찮아요. `Strx.useTimeline`을 쓰려면 Provider(또는 [`Strx.TimelineRoot`](provider.html))가 꼭 필요해요.

## 2. 등장 애니메이션 넣기 {#2-animate-the-entrance}

`View`와 `Text`를 STRX 버전으로 바꾸고 `animate`를 적어 주세요. STRX 컴포넌트는 원래 React Native 컴포넌트의 prop을 모두 그대로 받아요.

```tsx allow-invalid
<Strx.View animate="fade-in slide-up" style={styles.card}>
  <Strx.Text style={styles.name}>Ada Lovelace</Strx.Text>
</Strx.View>
```

그런데 `fade-in`과 `slide-up`은 둘 다 프리셋이에요. 그룹 하나에는 프리셋을 하나만 쓸 수 있어서, 이 코드는 `fade-in`만 재생하고 개발 중에 경고를 보여 줘요. 프리셋을 함께 쓰고 싶다면 쉼표로 나누거나, 프리셋 하나에 [키프레임](keyframes.html)을 더해 주세요.

```tsx
<Strx.View animate="fade-in, slide-up" />
<Strx.View animate="fade-in from:translate-y-24" />
```

<div data-demo="tokens" data-options="fade-in, slide-up|fade-in from:translate-y-24|fade-in, slide-up duration-600"></div>

## 3. 타이밍 조절하기 {#3-tune-the-timing}

`duration-*`, `delay-*`, 이징 토큰을 더해 보세요. 타이밍은 같은 그룹 안에서만 적용돼요.

```tsx
<Strx.View animate="fade-in, slide-up duration-500 delay-100 ease-in-out" />
```

`fade-in`은 Provider에서 정한 280ms로 움직이고, `slide-up`은 100ms 기다렸다가 500ms 동안 움직여요. 어떤 값이 먼저 적용되는지는 [타이밍과 이징](timing.html)에서 확인할 수 있어요.

## 4. 상태가 바뀔 때 움직이기 {#4-animate-state-changes}

`transition-*` 토큰을 쓰면, 나중에 `style`이 바뀔 때 그 변화가 부드럽게 이어져요. 아래 예시에서는 카드 테두리 색이 `selected` 값에 따라 바뀌어요.

```tsx
<Strx.Pressable
  onPress={() => setSelected(value => !value)}
  animate="fade-in transition-colors duration-200"
  style={{ borderColor: selected ? "#3552f0" : "#e7e9ef", borderWidth: 2 }}
>
  <Strx.Text>Ada Lovelace</Strx.Text>
</Strx.Pressable>
```

`fade-in`은 처음 나타날 때 한 번만 재생돼요. 스타일이 바뀌어도 다시 재생되지 않아요. 더 알고 싶다면 [스타일 트랜지션](transitions.html)을 확인해 보세요.

## 5. 레이아웃과 퇴장 애니메이션 넣기 {#5-animate-layout-and-exit}

카드에 `layout-spring`을 더하면, 상세 내용이 나타날 때 카드가 새 크기로 부드럽게 늘어나요. 상세 내용에는 `exit:` 토큰을 달아서 사라질 때도 자연스럽게 없어지게 해요.

```tsx
<Strx.View animate="fade-in, slide-up layout-spring" layoutClip>
  <Strx.Text>Ada Lovelace</Strx.Text>
  {expanded && (
    <Strx.Text animate="fade-in exit:opacity-0 exit:translate-y-8">
      최초로 공개된 알고리즘을 작성했어요.
    </Strx.Text>
  )}
</Strx.View>
```

자식 컴포넌트는 카드의 레이아웃 트랜지션을 물려받아서 텍스트도 함께 부드럽게 움직여요. [레이아웃 트랜지션](layout.html)과 [퇴장 애니메이션](exit.html)에서 더 자세히 알아볼 수 있어요.

<div data-demo="layout" data-options="layout-spring|layout-linear"></div>

## 다음으로 해 볼 것 {#whats-next}

- [animate prop](animate-prop.html)에서 전체 문법을 익혀 보세요.
- [`Strx.Timeline`](timeline.html)이나 [`Strx.useTimeline`](use-timeline.html)으로 여러 컴포넌트를 함께 움직여 보세요.
- [토큰 레퍼런스](token-reference.html)에서 모든 토큰을 살펴보세요.
