---
title: LayoutGroup
description: 리스트나 폼처럼 한 영역 전체에 레이아웃 트랜지션을 함께 적용해요.
---

`Strx.LayoutGroup`으로 감싸면, 안에 있는 모든 STRX 컴포넌트에 `layout-*` 토큰을 하나씩 달지 않아도 기본 레이아웃 트랜지션이 적용돼요. 가까이 있는 컴포넌트들의 크기와 위치가 한 덩어리처럼 함께 움직여야 할 때 써 보세요.

```tsx
<Strx.LayoutGroup transition="spring" damping={16}>
  {items.map(item => (
    <Strx.View key={item.id} animate="fade-in exit:opacity-0">
      <Row item={item} />
    </Strx.View>
  ))}
</Strx.LayoutGroup>
```

<div data-demo="list"></div>

## Props {#props}

| Prop | 타입 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `transition` | `"linear" \| "spring"` | `"linear"` | 자식들이 물려받을 레이아웃 트랜지션 |
| `duration` | `number` | `300` | 지속 시간(ms). `transition="linear"`일 때만 써요 |
| `damping` | `number` | `15` | 스프링 damping. `transition="spring"`일 때 써요 |
| `id` | `string` | — | 디버깅용 이름(선택) |
| `children` | `ReactNode` | — | 감쌀 영역 |

`transition="spring"`은 `layout-spring`과 같은 스프링(stiffness 120, mass 1)에 넘겨준 `damping` 값을 써요.

`LayoutGroup`은 뷰를 따로 그리지 않고, context만 전달해요.

## 어떤 트랜지션이 적용되나요? {#which-transition-wins}

STRX는 컴포넌트마다 이 순서로 골라요.

1. 자기에게 `layout-*` 토큰이 있다면 그 토큰
2. 없다면 위로 가장 가까운 것. 같은 그룹 **안에서** 레이아웃 트랜지션이 있는 가장 가까운 STRX 부모나, 그룹 자신이에요.

그룹 바깥에 있는 STRX 부모보다 가장 가까운 `LayoutGroup`이 먼저예요. 그래서 그룹으로 감싸면 그 영역의 트랜지션만 바꿀 수 있어요.

```tsx
<Strx.View animate="layout-spring-bouncy">
  <Header />                                   {/* 통통 튀는 스프링 */}
  <Strx.LayoutGroup transition="linear" duration={200}>
    <List />                                   {/* linear, 200ms */}
  </Strx.LayoutGroup>
</Strx.View>
```

`layoutPropagation="none"`인 컴포넌트는 그룹 설정도 따르지 않아요.

## 이렇게 써 보세요 {#patterns}

### 아코디언 {#accordion}

```tsx
<Strx.LayoutGroup transition="spring">
  {sections.map(section => (
    <Strx.View key={section.id} layoutClip>
      <Strx.Pressable onPress={() => toggle(section.id)}>
        <Strx.Text>{section.title}</Strx.Text>
      </Strx.Pressable>
      {openId === section.id && (
        <Strx.Text animate="fade-in exit:opacity-0">{section.body}</Strx.Text>
      )}
    </Strx.View>
  ))}
</Strx.LayoutGroup>
```

### 오류 메시지가 있는 폼 {#form-with-validation-messages}

```tsx
<Strx.LayoutGroup transition="linear" duration={180}>
  <Field label="이메일" />
  {error && <Strx.Text animate="fade-in exit:opacity-0">{error}</Strx.Text>}
  <SubmitButton />
</Strx.LayoutGroup>
```

오류 메시지가 나타나면 제출 버튼이 툭 튀지 않고 부드럽게 아래로 내려가요.
