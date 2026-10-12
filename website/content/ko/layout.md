---
title: 레이아웃 트랜지션
description: layout-* 토큰으로 크기와 위치 변화를 움직이고, 자식에게 물려주는 방식을 정해요.
---

내용이 나타나거나, 글자가 줄바꿈되거나, 옆 요소가 사라지면서 컴포넌트의 크기나 위치가 바뀔 때가 있어요. 이때 `layout-*` 토큰을 쓰면 새 레이아웃까지 UI 스레드에서 부드럽게 움직여요.

```tsx
<Strx.View animate="layout-spring">
  <Strx.Text>제목</Strx.Text>
  {open && <Strx.Text>펼쳐진 내용</Strx.Text>}
</Strx.View>
```

<div data-demo="layout"></div>

## 레이아웃 토큰 {#layout-tokens}

<!-- strx:layout -->

레이아웃 토큰은 Reanimated의 `layout` prop으로 전달돼요. linear와 fade 트랜지션은 같은 그룹의 `duration-*`를 먼저 쓰고, 없으면 `Strx.Provider`의 `motionPreset.duration`, 그것도 없으면 300ms를 써요. 스프링 트랜지션은 각자 정해진 값으로 움직여요.

```tsx
<Strx.View animate="layout-linear duration-180" />
```

레이아웃 토큰은 같은 그룹 안에서 등장, 트랜지션, 퇴장 토큰과 자유롭게 함께 쓸 수 있어요.

```tsx
<Strx.View animate="fade-in from:translate-y-12 layout-spring exit:opacity-0" />
```

## 물려받기 {#inheritance}

STRX 컴포넌트는 이럴 때 레이아웃 변화를 움직여요.

1. 자기에게 `layout-*` 토큰이 있을 때
2. 물려받은 트랜지션이 있을 때. 레이아웃 트랜지션이 있는 가장 가까운 STRX 부모나, 가장 가까운 [`Strx.LayoutGroup`](layout-group.html)에서 물려받아요.

그래서 컨테이너에 토큰 하나만 달아도 안에 있는 STRX 컴포넌트가 모두 함께 움직여요.

```tsx
<Strx.View animate="layout-spring">
  <Strx.View>{/* layout-spring을 물려받아요 */}</Strx.View>
  <Strx.Text>{/* layout-spring을 물려받아요 */}</Strx.Text>
</Strx.View>
```

물려받기는 **아래로만** 흘러요. 자식에게 `layout-*` 토큰이 있다고 부모까지 움직이지는 않아요. 안에 내용이 나타날 때 컨테이너 크기도 부드럽게 바뀌어야 한다면, 컨테이너에 토큰을 달거나 그 영역을 `Strx.LayoutGroup`으로 감싸 주세요.

```tsx
// 카드 크기는 부드럽게 바뀌고, 새 텍스트는 서서히 나타나요
<Strx.View animate="layout-spring">
  {open && <Strx.Text animate="fade-in">상세 내용</Strx.Text>}
</Strx.View>
```

> [!NOTE] STRX 컴포넌트만 물려받아요
> 물려받기는 React context를 통해 STRX 컴포넌트에게 전달돼요. 중간에 일반 React Native `View`가 끼어 있어도 연결은 끊기지 않지만, 그 `View` 자체는 움직이지 않아요.

## 물려받지 않게 하기 {#stopping-inheritance}

`layoutPropagation="none"`을 쓰면 그 컴포넌트와 자식들은 물려받은 트랜지션을 쓰지 않아요. 자기 `layout-*` 토큰이 있다면 그것만 쓰고, 자식들도 그 토큰을 물려받아요.

```tsx
<Strx.View animate="layout-spring">
  <Strx.View layoutPropagation="none">
    <Strx.Text>여기서는 레이아웃이 바뀌어도 움직이지 않아요.</Strx.Text>
  </Strx.View>
</Strx.View>
```

실시간 카운터나 입력창처럼 크기가 자주 바뀌어서 애니메이션이 오히려 답답하게 느껴지는 곳, 또는 움직이는 컨테이너 안에 있는 독립된 위젯에 써 보세요.

## 넘치는 내용 자르기 {#clipping}

뷰가 작아지는 동안에는 안의 내용이 밖으로 삐져나올 수 있어요. `layoutClip`을 쓰면 레이아웃 트랜지션이 적용되는 동안(직접 단 것이든 물려받은 것이든) `overflow: "hidden"`을 넣어 줘요.

```tsx
<Strx.View animate="layout-spring" layoutClip>
  {open && <LongContent />}
</Strx.View>
```

글자 그림자나 배지가 예상치 못하게 잘리지 않도록, 필요할 때만 켜게 되어 있어요.

## 성능 부담 {#cost}

레이아웃 트랜지션이 없는 컴포넌트에는 Reanimated `layout` prop을 아예 넘기지 않아요. 그래서 큰 화면에 STRX를 써도 레이아웃 비용이 들지 않아요. 한 번 레이아웃 트랜지션이 적용된 컴포넌트는 prop을 없애는 대신 아무것도 하지 않는 트랜지션을 유지해서, 네이티브 뷰가 불필요하게 다시 만들어지지 않게 해요.

## 긴 리스트 {#long-lists}

스크롤이 긴 리스트라면 모든 행에 `layout-*` 토큰을 다는 것보다 Reanimated의 `Animated.FlatList`와 `itemLayoutAnimation`을 쓰는 게 좋아요. 각 행의 등장·퇴장은 여전히 STRX로 처리할 수 있어요.

```tsx
import Animated, { LinearTransition } from "react-native-reanimated";

<Animated.FlatList
  data={items}
  keyExtractor={item => item.id}
  itemLayoutAnimation={LinearTransition}
  renderItem={({ item }) => (
    <Strx.View animate="fade-in exit:opacity-0">
      <Row item={item} />
    </Strx.View>
  )}
/>;
```

## 동작 줄이기 {#reduce-motion}

동작 줄이기가 켜져 있으면 레이아웃 변화가 바로 적용돼요. 자세한 내용은 [접근성](accessibility.html)에서 확인해 보세요.

## layout-*와 transition-layout은 어떻게 다른가요? {#layout-transitions-vs-transition-layout}

| | `layout-*` | `transition-layout` |
| --- | --- | --- |
| 언제 움직이나요 | 내용, 옆 요소, flexbox 등으로 실제 레이아웃이 바뀔 때 | `style`의 `width`/`height`/위치 값을 바꿀 때 |
| 어디까지 움직이나요 | 실제로 잰 레이아웃까지 | 직접 정한 값까지 |
| 자식에게 물려주나요 | 네, STRX 자식 컴포넌트에게 | 아니요 |
