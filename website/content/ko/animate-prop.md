---
title: animate prop
description: STRX가 토큰 문자열, 쉼표 그룹, 객체, 배열을 해석하는 방식.
---

모든 STRX 컴포넌트는 `animate` prop을 받습니다. 값으로는 **토큰 문자열**, **객체**, 또는 이 둘을 담은 **배열**을 쓸 수 있습니다.

```tsx
<Strx.View animate="fade-in duration-300" />
<Strx.View animate={{ type: "fade-in", duration: 300 }} />
<Strx.View animate={["fade-in", { from: { scale: 0.9 }, to: { scale: 1 } }]} />
```

## 토큰 문자열 {#token-strings}

토큰 문자열은 공백으로 구분한 토큰 목록입니다. 토큰은 각각 아래 종류 중 하나에 속합니다.

| 종류 | 예시 | 하는 일 |
| --- | --- | --- |
| 프리셋 | `fade-in`, `slide-up`, `bounce` | 기본 타이밍을 갖춘, 이름 붙은 등장 애니메이션 |
| 키프레임 | `from:opacity-0`, `to:scale-110` | 채널의 시작 값이나 끝 값을 직접 지정 |
| 퇴장 | `exit:opacity-0` | 컴포넌트가 언마운트될 때 도달할 값 |
| 타이밍 | `duration-300`, `delay-100`, `ease-out`, `play-2` | 애니메이션이 진행되는 방식 |
| 스프링 | `spring`, `damping-12`, `stiffness-180`, `mass-1` | 스프링으로 전환하고 값을 조절 |
| 트랜지션 | `transition-colors`, `transition-all` | 나중에 바뀌는 `style`을 애니메이션 |
| 레이아웃 | `layout-spring`, `layout-linear` | 크기와 위치 변화를 애니메이션 |

직접 문자열을 입력해 보세요. 토큰은 종류별로 색이 다르고, 알 수 없는 토큰에는 수정 제안이 나타납니다.

<div data-demo="sandbox" data-animate="fade-in from:translate-y-16 from:rotate-6 duration-500 ease-out"></div>

### 순서는 상관없습니다 {#order-doesnt-matter}

그룹 안에서는 토큰을 어떤 순서로 적어도 됩니다. 아래 두 줄은 같습니다.

```tsx
<Strx.View animate="fade-in layout-spring duration-300 ease-out" />
<Strx.View animate="ease-out duration-300 layout-spring fade-in" />
```

## 쉼표 그룹 {#comma-groups}

쉼표를 찍으면 새 **그룹**이 시작됩니다. 그룹들은 동시에 재생되고, 그룹마다 타이밍을 따로 가집니다. 타이밍 토큰은 같은 그룹 안의 프리셋, 키프레임, `exit:`, `transition-*` 토큰에만 적용됩니다.

```tsx
// fade-in은 기본값 300ms, slide-up은 100ms 뒤에 600ms 동안
<Strx.View animate="fade-in, slide-up duration-600 delay-100" />
```

<div data-demo="tokens" data-options="fade-in, slide-up duration-600 delay-100|fade-in duration-900, slide-up duration-300|fade-in, scale-in, slide-up duration-400"></div>

### 그룹당 프리셋은 하나 {#one-preset-per-group}

그룹 하나에는 프리셋이 **하나**만 들어갑니다. 같은 그룹에 둘째 프리셋을 쓰면 무시되고, 개발 중에 경고가 나옵니다.

```tsx allow-invalid
// fade-in만 재생하고 경고를 띄웁니다
<Strx.View animate="fade-in slide-up" />

// 둘 다 재생합니다
<Strx.View animate="fade-in, slide-up" />
```

같은 그룹 안에서 프리셋과 키프레임은 함께 쓸 수 있습니다. 이때 키프레임이 채널별로 프리셋 값을 덮어씁니다.

```tsx
// fade-in에 더해, 8pt 아래에서 올라옵니다
<Strx.View animate="fade-in from:translate-y-8" />
```

### 그룹끼리 같은 채널을 건드릴 때 {#when-groups-touch-the-same-channel}

두 그룹이 같은 채널을 애니메이션하면(예: 둘 다 `opacity`를 지정), 그 채널은 뒤쪽 그룹의 값을 따릅니다.

## 숫자 {#numbers}

토큰 안의 숫자는 부호 없는 십진수입니다. `300`, `0.5`, `12.5`처럼 씁니다. `1e3` 같은 지수 표기는 허용되지 않습니다. 음수가 가능한 유틸리티는 Tailwind처럼 유틸리티 앞에 대시를 붙입니다. 예를 들어 `from:-translate-y-20`, `from:-rotate-45`입니다.

`opacity-*`와 `scale-*` 값은 퍼센트입니다. `opacity-50`은 `0.5`, `scale-95`는 `0.95`입니다. opacity는 0–100 범위로 제한됩니다.

## 객체 {#objects}

값을 변수에서 가져오거나, 토큰이 없는 채널(예: `backgroundColor`)을 다룰 때는 객체를 씁니다.

```tsx
// 타이밍을 지정한 프리셋
<Strx.View animate={{ type: "slide-up", duration: 400, delay: 80, easing: "ease-out" }} />

// 애니메이션 가능한 스타일이면 무엇이든 키프레임으로
<Strx.View
  animate={{
    from: { opacity: 0, backgroundColor: "#eef1ff", borderRadius: 4 },
    to: { opacity: 1, backgroundColor: "#3552f0", borderRadius: 16 },
    duration: 500,
  }}
/>
```

객체에서 쓸 수 있는 옵션은 다음과 같습니다.

| 옵션 | 타입 | 의미 |
| --- | --- | --- |
| `type` | `string` | 프리셋 이름(기본 프리셋 또는 `definePreset`으로 등록한 것). `type`과 `from`/`to` 중 하나만 씁니다. |
| `from`, `to` | `AnimateStyle` | 시작 스타일과 끝 스타일. 지원하는 키는 [키프레임](keyframes.html)을 참고하세요. |
| `duration` | `number` | 밀리초 |
| `delay` | `number` | 밀리초 |
| `easing` | `string` | 이징 토큰, 또는 스프링을 쓰려면 `"spring"` |
| `playCount` | `number \| "infinite"` | 전체 재생 횟수 |
| `repeat` | `number \| "infinite"` | `playCount`의 예전 이름 |
| `damping`, `stiffness`, `mass` | `number` | 스프링 값 |

## 배열 {#arrays}

배열에는 문자열과 객체를 섞어 담을 수 있습니다. 기본적으로는 모두 동시에 재생되고, `playback`을 지정하면 차례로 또는 시차를 두고 재생합니다.

```tsx
<Strx.View
  playback="serial"
  animate={["fade-in duration-200", "slide-up duration-300"]}
/>
```

[배열 재생](playback.html)에서 더 알아보세요.

## 오타와 잘못된 토큰 {#typos-and-invalid-tokens}

알 수 없거나 잘못된 토큰은 무시됩니다. 개발 중에는 문자열마다 한 번 `console.warn`을 남기고, 비슷한 토큰이 있으면 수정 제안도 함께 보여 줍니다.

```text
[react-native-strx] Ignored unknown animate token(s) "fade-inn" (did you mean "fade-in"?) in "fade-inn duration-300". Combine multiple presets with commas, e.g. "fade-in, slide-up".
```

나머지 토큰은 정상적으로 동작합니다. 프로덕션 빌드에서는 경고를 띄우지 않습니다.

## 실행 중에 animate 바꾸기 {#changing-animate-at-runtime}

문자열마다 해석 결과를 캐시하므로, 렌더링할 때마다 같은 문자열을 넘겨도 비용이 들지 않습니다. 문자열이 바뀌면 새 등장 애니메이션이 재생됩니다. `style`만 바뀌어서는 등장 애니메이션이 다시 재생되지 않습니다. 스타일 변화를 애니메이션하려면 [`transition-*`](transitions.html)을 쓰세요.
