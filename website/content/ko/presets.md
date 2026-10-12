---
title: 프리셋
description: 이름이 붙은 등장 애니메이션과, definePreset으로 직접 프리셋을 등록하는 방법.
---

프리셋은 시작 프레임, 끝 프레임, 기본 모션을 갖춘 이름 붙은 애니메이션입니다. 컴포넌트가 마운트될 때 재생되고, `animate` 문자열이 바뀌면 다시 재생됩니다.

```tsx
<Strx.View animate="slide-up" />
```

<div data-demo="tokens" data-options="fade-in|slide-up|slide-down|slide-left|slide-right|scale-in|scale-down|scale-out|bounce"></div>

## 기본 프리셋 {#built-in-presets}

<!-- strx:presets -->

`scale-up`과 `scale-in`은 같은 애니메이션이니, 읽기 편한 쪽을 쓰면 됩니다. `fade-out`과 `scale-out`은 마운트될 때 보이지 않거나 작아진 상태 _로_ 움직입니다. 컴포넌트가 사라질 때의 애니메이션은 [`exit:` 토큰](exit.html)을 쓰세요.

"기본 모션" 열은 Reanimated의 기본값이 아니라 각 프리셋이 가진 기본값입니다. `bounce`는 스프링으로 움직이고, 나머지 프리셋은 이징 토큰을 따로 주지 않으면 `ease-out` 타이밍으로 움직입니다.

## 프리셋 값 바꾸기 {#overriding-a-preset}

같은 그룹 안에서 프리셋의 모든 부분을 바꿀 수 있습니다.

```tsx
// 타이밍
<Strx.View animate="slide-up duration-600 delay-100 ease-in-out" />

// 타이밍 대신 스프링
<Strx.View animate="scale-in spring damping-14" />

// 시작 위치 바꾸기: 키프레임이 채널별로 프리셋 값을 덮어씁니다
<Strx.View animate="slide-up from:translate-y-60" />
```

지속 시간은 `duration-*` 토큰(또는 객체의 `duration`) → 프리셋 고유 기본값 → `Strx.Provider`의 duration → 300ms 순으로 정해집니다. 그래서 `motionPreset={{ duration: 200 }}`을 지정해도, `duration-*` 토큰을 따로 주지 않으면 `slide-up`은 320ms로 움직입니다.

## 프리셋 여러 개 함께 쓰기 {#combining-presets}

쉼표로 나눈 그룹마다 프리셋을 하나씩 씁니다.

```tsx
<Strx.View animate="fade-in, slide-up, scale-in duration-400" />
```

<div data-demo="tokens" data-options="fade-in, slide-up|fade-in, scale-in|fade-in, slide-right duration-500, scale-in duration-250"></div>

## definePreset으로 프리셋 만들기 {#custom-presets-with-definepreset}

프리셋은 모듈 최상단에서, 그 프리셋을 쓰는 컴포넌트가 렌더링되기 전에 한 번 등록합니다. 등록하고 나면 문자열, 객체(`{ type: "pop-in" }`), 타임라인, 개발 중 토큰 검사까지 어디서든 기본 토큰처럼 동작합니다.

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

### 프리셋의 구조 {#the-preset-shape}

| 필드 | 타입 | 의미 |
| --- | --- | --- |
| `initial` | `Partial<Record<AnimatableChannel, number>>` | 시작 프레임 |
| `target` | `Partial<Record<AnimatableChannel, number>>` | 끝 프레임 |
| `options.driver` | `"timing" \| "spring"` | 사용할 드라이버 |
| `options.duration` | `number` | 타이밍 프리셋의 기본 지속 시간 |
| `options.damping`, `stiffness`, `mass` | `number` | 기본 스프링 값 |

`AnimatableChannel`은 `"opacity" | "translateX" | "translateY" | "scale"`입니다. 회전, 색상, 크기 같은 다른 채널은 [키프레임](keyframes.html)이나 객체형 `animate`를 쓰세요.

### 규칙 {#rules}

- 이름은 영문 소문자, 숫자, 대시만 쓸 수 있고 영문자로 시작해야 합니다(`/^[a-z][a-z0-9-]*$/`). 규칙에 맞지 않으면 오류가 발생합니다.
- 같은 이름으로 `definePreset`을 다시 호출하면 기존 프리셋을 덮어씁니다. 기본 프리셋 이름도 덮어쓸 수 있고, 그러면 앱 전체에서 바뀝니다.
- 프리셋은 렌더링 전에 등록하세요. 이미 예전 정의로 렌더링된 컴포넌트는 다음에 애니메이션이 새로 만들어질 때 바뀐 정의를 반영합니다.

### 등록된 프리셋 읽기 {#reading-registered-presets}

`animationPresets`는 기본 프리셋과 직접 등록한 프리셋을 모두 담은 읽기 전용 객체입니다.

```tsx
import { animationPresets } from "react-native-strx";

Object.keys(animationPresets); // ["fade-in", "fade-out", ..., "pop-in"]
```

TypeScript를 쓴다면 `BuiltInAnimationPreset` 타입에 기본 프리셋 이름이 담겨 있고, `StrxPreset`이 프리셋의 구조입니다.
