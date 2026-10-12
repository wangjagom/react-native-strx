---
title: 프리셋
description: 이름이 붙은 등장 애니메이션을 쓰고, definePreset으로 나만의 프리셋을 만들어 봐요.
---

프리셋은 시작 모습, 끝 모습, 기본 모션을 미리 정해 둔 애니메이션이에요. 컴포넌트가 처음 나타날 때 재생되고, `animate` 문자열이 바뀌면 다시 재생돼요.

```tsx
<Strx.View animate="slide-up" />
```

<div data-demo="tokens" data-options="fade-in|slide-up|slide-down|slide-left|slide-right|scale-in|scale-down|scale-out|bounce"></div>

## 기본 프리셋 {#built-in-presets}

<!-- strx:presets -->

`scale-up`과 `scale-in`은 같은 애니메이션이라 더 읽기 편한 쪽을 쓰면 돼요. `fade-out`과 `scale-out`은 나타날 때 오히려 사라지거나 작아지는 방향으로 움직여요. 컴포넌트가 사라지는 순간을 움직이고 싶다면 [`exit:` 토큰](exit.html)을 써 주세요.

"기본 모션"은 Reanimated의 기본값이 아니라 프리셋마다 정해 둔 값이에요. `bounce`는 스프링으로 움직이고, 다른 프리셋은 이징 토큰을 따로 적지 않으면 `ease-out`으로 움직여요.

## 프리셋 값 바꾸기 {#overriding-a-preset}

같은 그룹에 토큰을 더하면 프리셋의 어떤 값이든 바꿀 수 있어요.

```tsx
// 타이밍 바꾸기
<Strx.View animate="slide-up duration-600 delay-100 ease-in-out" />

// 타이밍 대신 스프링으로
<Strx.View animate="scale-in spring damping-14" />

// 시작 위치 바꾸기: 키프레임이 채널별로 프리셋 값을 덮어써요
<Strx.View animate="slide-up from:translate-y-60" />
```

지속 시간은 `duration-*` 토큰(또는 객체의 `duration`) → 프리셋 기본값 → `Strx.Provider`의 duration → 300ms 순서로 정해져요. 그래서 `motionPreset={{ duration: 200 }}`을 정해 두어도, `duration-*` 토큰이 없으면 `slide-up`은 320ms로 움직여요.

## 프리셋 여러 개 함께 쓰기 {#combining-presets}

쉼표로 그룹을 나누고, 그룹마다 프리셋을 하나씩 써 주세요.

```tsx
<Strx.View animate="fade-in, slide-up, scale-in duration-400" />
```

<div data-demo="tokens" data-options="fade-in, slide-up|fade-in, scale-in|fade-in, slide-right duration-500, scale-in duration-250"></div>

## definePreset으로 나만의 프리셋 만들기 {#custom-presets-with-definepreset}

프리셋은 파일 맨 위에서, 그 프리셋을 쓰는 컴포넌트가 그려지기 전에 한 번만 등록해 주세요. 등록하고 나면 문자열, 객체(`{ type: "pop-in" }`), 타임라인, 개발 중 토큰 검사까지 어디서든 기본 프리셋처럼 쓸 수 있어요.

```tsx title="motion.ts"
import { definePreset } from "react-native-strx";

definePreset("pop-in", {
  initial: { opacity: 0, scale: 0.8 },
  target: { opacity: 1, scale: 1 },
  options: { driver: "spring", damping: 12, stiffness: 200 },
});

definePreset("drop-in", {
  initial: { opacity: 0, translateY: -40 },
  target: { opacity: 1, translateY: 0 },
  options: { driver: "timing", duration: 450 },
});
```

```tsx
import "./motion";

<Strx.View animate="pop-in" />
<Strx.View animate="drop-in delay-150" />
```

### 프리셋 구조 {#the-preset-shape}

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `initial` | `Partial<Record<AnimatableChannel, number>>` | 시작 모습 |
| `target` | `Partial<Record<AnimatableChannel, number>>` | 끝 모습 |
| `options.driver` | `"timing" \| "spring"` | 어떤 방식으로 움직일지 |
| `options.duration` | `number` | 타이밍 프리셋의 기본 지속 시간 |
| `options.damping`, `stiffness`, `mass` | `number` | 기본 스프링 값 |

`AnimatableChannel`은 `"opacity" | "translateX" | "translateY" | "scale"`이에요. 회전, 색상, 크기처럼 다른 값을 움직이고 싶다면 [키프레임](keyframes.html)이나 객체형 `animate`를 써 주세요.

### 이것만 지켜 주세요 {#rules}

- 이름에는 영문 소문자, 숫자, 대시만 쓸 수 있고, 영문자로 시작해야 해요(`/^[a-z][a-z0-9-]*$/`). 규칙에 맞지 않으면 오류가 나요.
- 같은 이름으로 `definePreset`을 다시 부르면 기존 프리셋을 덮어써요. 기본 프리셋 이름도 덮어쓸 수 있고, 그러면 앱 전체에서 바뀌어요.
- 프리셋은 화면을 그리기 전에 등록해 주세요. 이미 예전 프리셋으로 그려진 컴포넌트는 애니메이션이 새로 만들어질 때 바뀐 내용을 반영해요.

### 등록된 프리셋 확인하기 {#reading-registered-presets}

`animationPresets`에는 기본 프리셋과 직접 등록한 프리셋이 모두 들어 있어요. 읽기만 할 수 있어요.

```tsx
import { animationPresets } from "react-native-strx";

Object.keys(animationPresets); // ["fade-in", "fade-out", ..., "pop-in"]
```

TypeScript를 쓴다면 `BuiltInAnimationPreset` 타입으로 기본 프리셋 이름을, `StrxPreset` 타입으로 프리셋 구조를 확인할 수 있어요.
