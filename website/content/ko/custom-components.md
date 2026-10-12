---
title: 커스텀 컴포넌트
description: createStrxComponent로 어떤 컴포넌트든 animate prop을 쓸 수 있게 만들어요.
---

`createStrxComponent`로 컴포넌트를 감싸면 `animate`와 다른 STRX prop을 쓸 수 있어요. 원래 prop과 style 타입은 그대로 남아요.

```tsx
import { createStrxComponent } from "react-native-strx";
import { SafeAreaView } from "react-native-safe-area-context";

const StrxSafeAreaView = createStrxComponent(SafeAreaView, {
  displayName: "Strx.SafeAreaView",
});

<StrxSafeAreaView animate="fade-in layout-linear" style={{ flex: 1 }} />;
```

감싼 컴포넌트는 STRX 기능을 모두 쓸 수 있어요. 등장 애니메이션, 키프레임, `exit:`, `transition-*`, 레이아웃 트랜지션과 상속, `playback`, 타임라인용 `strxId`까지요.

## 시그니처 {#signature}

```tsx
function createStrxComponent<Props extends object, RefType = unknown>(
  Component: React.ComponentType<Props>,
  options?: StrxComponentOptions,
): React.ForwardRefExoticComponent<StrxComponentProps<Props> & React.RefAttributes<RefType>>;
```

| 옵션 | 타입 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `displayName` | `string` | `Strx.<ComponentName>` | React DevTools에 보이는 이름 |
| `nativeView` | `boolean` | `true` | 최적화로 사라질 수 있는 네이티브 뷰를 그리는 컴포넌트인지 정해요. `true`면 STRX가 `collapsable={false}`를 넣어서 애니메이션이 실제 뷰에 적용되게 해요. 텍스트 같은 컴포넌트에는 `false`를 써 주세요. |

`StrxComponentProps<Props>`는 원래 prop에 `animate`, `playback`, `interval`, `strxId`, `layoutClip`, `layoutPropagation`을 더한 타입이에요. `style`은 원래 컴포넌트의 style 타입을 그대로 써요.

## 감쌀 컴포넌트가 지켜야 할 것 {#requirements-for-the-wrapped-component}

감싼 컴포넌트는 Reanimated의 `createAnimatedComponent`를 거치기 때문에, 이 조건을 지켜 주세요.

- `style` prop을 네이티브 뷰까지 전달해야 해요. 애니메이션 값이 거기에 쓰여요.
- 레이아웃 애니메이션과 퇴장 애니메이션을 쓰려면 가장 바깥 요소가 그 네이티브 뷰여야 해요.
- 감싼 컴포넌트는 렌더 함수 안이 아니라 모듈 최상위에서 한 번만 만들어 주세요.

ref도 그대로 전달돼요. STRX 컴포넌트에 단 ref는 감싼 컴포넌트에 닿아요.

## 예시 {#examples}

### 그라디언트 {#a-gradient}

```tsx
import { LinearGradient } from "expo-linear-gradient";

const StrxGradient = createStrxComponent(LinearGradient);

<StrxGradient
  colors={["#3552f0", "#7b93ff"]}
  animate="fade-in, scale-in duration-500"
  style={{ height: 160, borderRadius: 20 }}
/>;
```

### 직접 만든 카드 {#your-own-card}

```tsx
type CardProps = { title: string; style?: StyleProp<ViewStyle>; children?: React.ReactNode };

function CardBase({ title, style, children }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

export const Card = createStrxComponent(CardBase, { displayName: "Card" });

<Card title="프로필" animate="fade-in from:translate-y-12 layout-spring" />;
```

### 텍스트 같은 컴포넌트 {#a-text-like-component}

```tsx
const StrxHeading = createStrxComponent(Heading, { nativeView: false });
```

### 타임라인에서 쓰기 {#in-a-timeline}

감싼 컴포넌트는 [`Strx.Timeline`](timeline.html)의 자식으로도, [`useTimeline`](use-timeline.html)의 대상으로도 쓸 수 있어요.

```tsx
<Strx.Timeline playback="stagger" interval={60}>
  <Card title="하나" animate="fade-in from:translate-y-12" />
  <Card title="둘" animate="fade-in from:translate-y-12" />
</Strx.Timeline>
```

## 리스트 {#lists}

리스트 행이라면 `FlatList`를 통째로 감싸기보다, 행 안의 내용을 `Strx.View`로 감싸는 편이 대개 더 간단해요. [긴 리스트](layout.html#long-lists)를 확인해 보세요.
