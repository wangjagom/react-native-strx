---
title: 퇴장 애니메이션
description: exit: 토큰으로 컴포넌트가 사라질 때의 모션을 정해요.
---

`exit:` 토큰은 React가 컴포넌트를 없앨 때 어디로 움직이며 사라질지 정해요. 퇴장 애니메이션이 끝날 때까지 Reanimated가 뷰를 화면에 남겨 둬요.

```tsx
{visible && (
  <Strx.View animate="fade-in exit:opacity-0 exit:translate-y-12">
    <Strx.Text>토스트 메시지</Strx.Text>
  </Strx.View>
)}
```

<div data-demo="tokens" data-exit data-options="fade-in exit:opacity-0|slide-up exit:opacity-0 exit:translate-y-24|scale-in exit:scale-80 exit:opacity-0 duration-200|fade-in exit:opacity-0 exit:-translate-x-60 ease-in"></div>

## 움직일 수 있는 값 {#exit-channels}

퇴장 애니메이션은 Reanimated의 `exiting` 애니메이션으로, 아래 네 가지 값을 움직여요.

| 토큰 | 이렇게 사라져요 |
| --- | --- |
| `exit:opacity-0` | 완전히 투명해져요 (`opacity-*` 값은 무엇이든 쓸 수 있어요) |
| `exit:translate-x-24`, `exit:-translate-x-24` | 오른쪽이나 왼쪽으로 24pt |
| `exit:translate-y-24`, `exit:-translate-y-24` | 아래나 위로 24pt |
| `exit:scale-90` | 작아져요 (`exit:scale-110`이면 커져요) |

퇴장은 기본 모습(`opacity: 1`, 이동 없음, `scale: 1`)에서 시작해서 적어 둔 값만 움직여요. 적지 않은 값은 그대로예요. `exit:rotate-*`나 `exit:w-*` 같은 유틸리티도 토큰으로는 쓸 수 있지만, 퇴장할 때는 움직이지 않아요.

## 퇴장 타이밍 {#exit-timing}

퇴장은 같은 쉼표 그룹의 타이밍 토큰을 따라요. 타이밍 토큰이 없으면 **300ms 동안 `ease`**로 움직여요. 프리셋 기본값이나 Provider의 지속 시간은 퇴장에 적용되지 않아요.

```tsx
// 그룹 전체에 적용돼요: 등장과 퇴장 모두 180ms, ease-in
<Strx.View animate="fade-in exit:opacity-0 exit:scale-95 duration-180 ease-in" />
```

등장과 퇴장의 타이밍을 따로 주고 싶다면 퇴장을 다른 그룹으로 나눠 주세요.

```tsx
<Strx.View animate="fade-in from:translate-y-12 duration-400, exit:opacity-0 duration-150 ease-in" />
```

`delay-*`를 쓰면 퇴장도 잠시 기다렸다가 시작해요. 스프링은 퇴장에 적용되지 않아서, `spring`을 쓰면 `ease`로 움직여요.

## 리스트에서 쓰기 {#lists}

`exit:`를 [레이아웃 트랜지션](layout.html)과 함께 쓰면, 항목이 사라진 자리로 나머지 항목들이 부드럽게 채워져요.

```tsx
<Strx.LayoutGroup transition="spring">
  {items.map(item => (
    <Strx.View key={item.id} animate="fade-in from:translate-y-12 exit:opacity-0 exit:translate-x-24">
      <Row item={item} />
    </Strx.View>
  ))}
</Strx.LayoutGroup>
```

<div data-demo="list"></div>

## 쓸 수 있는 컴포넌트 {#supported-components}

모든 STRX 컴포넌트에서 `exit:`를 쓸 수 있어요. `Strx.View`, `Strx.Text`, `Strx.Pressable`, `Strx.Image`, `Strx.ScrollView`, `Strx.TextInput`, 그리고 [`createStrxComponent`](custom-components.html)로 만든 컴포넌트까지요.

## 알아 두면 좋아요 {#things-to-know}

- 퇴장 애니메이션은 그 컴포넌트가 직접 사라질 때 재생돼요. 부모가 사라지면 다른 Reanimated exiting 애니메이션처럼 자식도 함께 사라져요. 그래서 `exit:`는 실제로 없어지는 가장 바깥 요소에 달아 주세요.
- 상태에서는 항목을 바로 지워 주세요. JS에서 애니메이션이 끝나기를 기다릴 필요가 없어요. 사라지는 동안에는 Reanimated가 뷰를 화면에 남겨 둬요.
- 동작 줄이기가 켜져 있으면 퇴장 애니메이션 없이 바로 사라져요. [접근성](accessibility.html)에서 확인해 보세요.
- `exit:` 값은 [타임라인](use-timeline.html) 애니메이션에 포함되지 않아요.
