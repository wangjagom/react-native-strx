---
title: 스타일 트랜지션
description: CSS 트랜지션처럼, transition-* 토큰으로 style 변화를 부드럽게 이어요.
---

`transition-*` 토큰을 쓰면 컴포넌트의 `style`이 바뀔 때마다 부드럽게 움직여요. 스타일은 평소처럼 상태에 따라 적으면 되고, 이전 값과 새 값 사이는 STRX가 이어 줘요.

```tsx
<Strx.View
  animate="transition-colors duration-250 ease-out"
  style={{ backgroundColor: active ? "#16a34a" : "#dc2626" }}
/>
```

<div data-demo="transition" data-variant="colors"></div>

## 트랜지션 토큰 {#transition-tokens}

<!-- strx:transitions -->

`animate` 값 하나에는 스타일 트랜지션이 하나만 적용돼요. `transition-*` 토큰을 여러 개 적으면, 쉼표 그룹이 달라도 마지막 토큰을 따라요. 여러 종류를 한 번에 움직이려면 `transition-all`을 써 주세요.

바뀌는 값만 딱 맞게 고르는 게 좋아요. `transition-all`이 편하긴 하지만, 좁은 토큰을 쓰면 상관없는 스타일 변화는 바로 바뀌어요. 예를 들어 `transition-colors`를 쓰면, 같은 순간에 너비가 바뀌어도 너비는 바로 바뀌어요.

<div data-demo="transition" data-variant="all"></div>

## 중간에 다시 바뀌어도 괜찮아요 {#interruptions}

트랜지션은 지금 화면에 보이는 값에서 시작해요. 움직이는 도중에 스타일이 또 바뀌면, 튀지 않고 그 자리에서 이어서 움직여요. 위의 버튼을 빠르게 두 번 눌러 보세요.

## 트랜지션과 등장 애니메이션 {#transitions-and-entrances}

컴포넌트에 등장 애니메이션과 트랜지션을 함께 쓸 수 있어요. 등장 애니메이션은 처음 나타날 때 한 번만 재생되고, 그 뒤로 스타일이 바뀌면 트랜지션만 움직여요. 등장 애니메이션이 다시 재생되지는 않아요.

```tsx
<Strx.View
  animate="fade-in from:translate-y-8 transition-colors duration-200"
  style={{ backgroundColor: selected ? "#eef1ff" : "#ffffff" }}
/>
```

같은 그룹의 타이밍 토큰은 둘 다에 적용돼요. 타이밍을 따로 주고 싶다면 그룹을 나눠 주세요. 예: `"fade-in duration-400, transition-colors duration-150"`.

## 눌렀을 때 {#pressed-states}

`Strx.Pressable`은 함수형 style도 받아요. `transition-*` 토큰을 더하면 누를 때와 뗄 때의 스타일 변화가 부드럽게 이어져요.

```tsx
<Strx.Pressable
  animate="transition-transform duration-150"
  onPress={onSubmit}
  style={({ pressed }) => ({
    transform: [{ scale: pressed ? 0.96 : 1 }],
  })}
>
  <Strx.Text>제출하기</Strx.Text>
</Strx.Pressable>
```

<div data-demo="pressable"></div>

직접 넣은 `onPressIn` / `onPressOut` 핸들러도 그대로 실행돼요.

## 포커스와 입력 검사 {#focus-and-validation}

`Strx.TextInput`도 똑같이 쓸 수 있어요. 포커스 상태를 저장해 두고, `transition-colors`로 테두리 색을 바꿔 보세요.

```tsx
function Field() {
  const [focused, setFocused] = useState(false);

  return (
    <Strx.TextInput
      animate="transition-colors duration-200"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ borderWidth: 2, borderColor: focused ? "#3552f0" : "#d3d8e2" }}
    />
  );
}
```

<div data-demo="focus"></div>

## 크기 트랜지션 {#size-transitions}

`transition-layout`은 `style`에서 `width`, `height`, 최소·최대 크기, `top` / `right` / `bottom` / `left`를 바꿀 때 부드럽게 움직여요.

```tsx
<Strx.View
  animate="transition-layout duration-300"
  style={{ width: expanded ? 280 : 120, height: 48 }}
/>
```

이 토큰은 직접 정한 스타일 값을 움직여요. 자식이 나타나거나 글자가 줄바꿈되는 것처럼 내용 때문에 크기가 바뀐다면 [레이아웃 트랜지션](layout.html)을 써 주세요. 실제로 그려진 크기를 재서 그 크기로 움직여요.

## 동작 줄이기 {#reduce-motion}

동작 줄이기가 켜져 있으면 스타일 변화가 바로 적용돼요. 자세한 내용은 [접근성](accessibility.html)에서 확인해 보세요.
