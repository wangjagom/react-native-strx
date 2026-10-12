---
title: 빠른 시작
description: 다섯 단계로 애니메이션이 들어간 카드를 만들면서 STRX의 모션 종류를 하나씩 살펴봅니다.
---

작은 프로필 카드를 만들어 보겠습니다. 단계마다 모션을 한 가지씩 더합니다.

## 1. Provider 추가하기 {#1-add-the-provider}

앱(또는 화면 하나)을 `Strx.Provider`로 감쌉니다. Provider는 기본 타이밍을 정하고, 시스템의 동작 줄이기 설정을 따르며, [이벤트 타임라인](use-timeline.html)을 연결합니다.

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

`animate` prop만 쓸 때는 Provider가 없어도 됩니다. 하지만 `Strx.useTimeline`을 쓰려면 Provider(또는 [`Strx.TimelineRoot`](provider.html))가 필요합니다.

## 2. 등장 애니메이션 넣기 {#2-animate-the-entrance}

`View`와 `Text`를 STRX 버전으로 바꾸고 `animate`를 추가합니다. STRX 컴포넌트는 원래 React Native 컴포넌트의 prop을 모두 그대로 받습니다.

```tsx allow-invalid
<Strx.View animate="fade-in slide-up" style={styles.card}>
  <Strx.Text style={styles.name}>Ada Lovelace</Strx.Text>
</Strx.View>
```

`fade-in`과 `slide-up`은 둘 다 프리셋입니다. 쉼표로 구분한 그룹 하나에는 프리셋이 하나만 들어갈 수 있어서, 이 코드는 `fade-in`만 재생하고 개발 중에 경고를 띄웁니다. 프리셋을 함께 쓰려면 쉼표로 나누거나, 프리셋 하나에 [키프레임](keyframes.html)을 조합하세요.

```tsx
<Strx.View animate="fade-in, slide-up" />
<Strx.View animate="fade-in from:translate-y-24" />
```

<div data-demo="tokens" data-options="fade-in, slide-up|fade-in from:translate-y-24|fade-in, slide-up duration-600"></div>

## 3. 타이밍 조절하기 {#3-tune-the-timing}

`duration-*`, `delay-*`, 이징 토큰을 더합니다. 타이밍은 자기가 속한 그룹에만 적용됩니다.

```tsx
<Strx.View animate="fade-in, slide-up duration-500 delay-100 ease-in-out" />
```

여기서 `fade-in`은 Provider에 정한 280ms를 쓰고, `slide-up`은 100ms 기다린 뒤 500ms 동안 움직입니다. 우선순위 규칙은 [타이밍과 이징](timing.html)에 정리되어 있습니다.

## 4. 상태 변화에 애니메이션 주기 {#4-animate-state-changes}

`transition-*` 토큰을 쓰면 나중에 `style`이 바뀔 때 그 변화가 애니메이션됩니다. 아래 예시에서는 카드 테두리 색이 `selected` 값을 따라 바뀝니다.

```tsx
<Strx.Pressable
  onPress={() => setSelected(value => !value)}
  animate="fade-in transition-colors duration-200"
  style={{ borderColor: selected ? "#3552f0" : "#e7e9ef", borderWidth: 2 }}
>
  <Strx.Text>Ada Lovelace</Strx.Text>
</Strx.Pressable>
```

`fade-in`은 마운트될 때 한 번만 재생되고, 스타일이 바뀐다고 다시 재생되지는 않습니다. 자세한 내용은 [스타일 트랜지션](transitions.html)을 참고하세요.

## 5. 레이아웃과 퇴장 애니메이션 넣기 {#5-animate-layout-and-exit}

카드에 `layout-spring`을 더하면 상세 내용이 나타날 때 카드가 새 크기로 부드럽게 늘어납니다. 상세 내용에는 `exit:` 토큰을 달아 사라질 때 서서히 없어지게 합니다.

```tsx
<Strx.View animate="fade-in, slide-up layout-spring" layoutClip>
  <Strx.Text>Ada Lovelace</Strx.Text>
  {expanded && (
    <Strx.Text animate="fade-in exit:opacity-0 exit:translate-y-8">
      최초로 공개된 알고리즘을 작성했습니다.
    </Strx.Text>
  )}
</Strx.View>
```

자식은 카드의 레이아웃 트랜지션을 물려받기 때문에, 텍스트 블록도 함께 부드럽게 움직입니다. [레이아웃 트랜지션](layout.html)과 [퇴장 애니메이션](exit.html)에서 더 알아보세요.

<div data-demo="layout" data-options="layout-spring|layout-linear"></div>

## 다음으로 {#whats-next}

- [animate prop](animate-prop.html)에서 전체 문법을 익힙니다.
- [`Strx.Timeline`](timeline.html)이나 [`Strx.useTimeline`](use-timeline.html)으로 여러 컴포넌트를 함께 움직입니다.
- [토큰 레퍼런스](token-reference.html)에서 모든 토큰을 둘러봅니다.
