---
title: animate prop
description: STRX가 토큰 문자열, 쉼표 그룹, 객체, 배열을 읽는 방법이에요.
---

모든 STRX 컴포넌트는 `animate` prop을 받아요. 값으로는 **토큰 문자열**, **객체**, 또는 둘을 담은 **배열**을 쓸 수 있어요.

```tsx
<Strx.View animate="fade-in duration-300" />
<Strx.View animate={{ type: "fade-in", duration: 300 }} />
<Strx.View animate={["fade-in", { from: { scale: 0.9 }, to: { scale: 1 } }]} />
```

## 토큰 문자열 {#token-strings}

토큰 문자열은 토큰을 공백으로 이어 쓴 거예요. 토큰마다 아래 종류 중 하나에 속해요.

| 종류 | 예시 | 하는 일 |
| --- | --- | --- |
| 프리셋 | `fade-in`, `slide-up`, `bounce` | 기본 타이밍까지 갖춘 등장 애니메이션 |
| 키프레임 | `from:opacity-0`, `to:scale-110` | 시작 값이나 끝 값을 직접 정해요 |
| 퇴장 | `exit:opacity-0` | 컴포넌트가 사라질 때 도착할 값 |
| 타이밍 | `duration-300`, `delay-100`, `ease-out`, `play-2` | 애니메이션이 진행되는 방식 |
| 스프링 | `spring`, `damping-12`, `stiffness-180`, `mass-1` | 스프링으로 바꾸고 세기를 조절해요 |
| 트랜지션 | `transition-colors`, `transition-all` | 나중에 바뀌는 `style`을 부드럽게 이어요 |
| 레이아웃 | `layout-spring`, `layout-linear` | 크기와 위치가 바뀔 때 움직여요 |

아래에 직접 문자열을 입력해 보세요. 토큰은 종류마다 색이 다르고, 모르는 토큰을 쓰면 수정 제안이 나타나요.

<div data-demo="sandbox" data-animate="fade-in from:translate-y-16 from:rotate-6 duration-500 ease-out"></div>

### 순서는 신경 쓰지 않아도 돼요 {#order-doesnt-matter}

그룹 안에서는 토큰을 어떤 순서로 적어도 괜찮아요. 아래 두 줄은 똑같이 움직여요.

```tsx
<Strx.View animate="fade-in layout-spring duration-300 ease-out" />
<Strx.View animate="ease-out duration-300 layout-spring fade-in" />
```

## 쉼표 그룹 {#comma-groups}

쉼표를 찍으면 새 **그룹**이 시작돼요. 그룹들은 동시에 재생되고, 그룹마다 타이밍을 따로 가져요. 타이밍 토큰은 같은 그룹 안의 프리셋, 키프레임, `exit:`, `transition-*` 토큰에만 적용돼요.

```tsx
// fade-in은 기본값인 300ms, slide-up은 100ms 뒤에 600ms 동안
<Strx.View animate="fade-in, slide-up duration-600 delay-100" />
```

<div data-demo="tokens" data-options="fade-in, slide-up duration-600 delay-100|fade-in duration-900, slide-up duration-300|fade-in, scale-in, slide-up duration-400"></div>

### 그룹마다 프리셋은 하나만 {#one-preset-per-group}

그룹 하나에는 프리셋을 **하나**만 쓸 수 있어요. 같은 그룹에 프리셋을 하나 더 쓰면 무시되고, 개발 중에 경고가 나와요.

```tsx allow-invalid
// fade-in만 재생하고 경고를 보여 줘요
<Strx.View animate="fade-in slide-up" />

// 둘 다 재생해요
<Strx.View animate="fade-in, slide-up" />
```

프리셋과 키프레임은 같은 그룹에서 함께 쓸 수 있어요. 이때는 키프레임이 채널별로 프리셋 값을 덮어써요.

```tsx
// fade-in에 더해, 8pt 아래에서 올라와요
<Strx.View animate="fade-in from:translate-y-8" />
```

### 두 그룹이 같은 채널을 움직일 때 {#when-groups-touch-the-same-channel}

두 그룹이 같은 채널을 움직이면(예: 둘 다 `opacity`를 바꾸면), 그 채널은 뒤에 적은 그룹을 따라요.

## 숫자 {#numbers}

토큰 안의 숫자는 부호 없는 십진수로 써요. `300`, `0.5`, `12.5`처럼요. `1e3` 같은 지수 표기는 쓸 수 없어요. 음수를 쓸 수 있는 유틸리티는 Tailwind처럼 앞에 대시를 붙여요. 예를 들면 `from:-translate-y-20`, `from:-rotate-45`처럼요.

`opacity-*`와 `scale-*`는 퍼센트로 적어요. `opacity-50`은 `0.5`, `scale-95`는 `0.95`예요. opacity는 0에서 100 사이로 맞춰져요.

## 객체 {#objects}

값을 변수에서 가져오거나, 토큰이 없는 채널(예: `backgroundColor`)을 움직이고 싶다면 객체를 써 보세요.

```tsx
// 타이밍을 정한 프리셋
<Strx.View animate={{ type: "slide-up", duration: 400, delay: 80, easing: "ease-out" }} />

// 애니메이션할 수 있는 스타일이라면 무엇이든 키프레임으로
<Strx.View
  animate={{
    from: { opacity: 0, backgroundColor: "#eef1ff", borderRadius: 4 },
    to: { opacity: 1, backgroundColor: "#3552f0", borderRadius: 16 },
    duration: 500,
  }}
/>
```

객체에서는 이런 옵션을 쓸 수 있어요.

| 옵션 | 타입 | 의미 |
| --- | --- | --- |
| `type` | `string` | 프리셋 이름(기본 프리셋이나 `definePreset`으로 등록한 것). `type`과 `from`/`to` 중 하나만 써 주세요. |
| `from`, `to` | `AnimateStyle` | 시작 스타일과 끝 스타일. 쓸 수 있는 키는 [키프레임](keyframes.html)에서 확인할 수 있어요. |
| `duration` | `number` | 밀리초 |
| `delay` | `number` | 밀리초 |
| `easing` | `string` | 이징 토큰, 스프링을 쓰려면 `"spring"` |
| `playCount` | `number \| "infinite"` | 모두 몇 번 재생할지 |
| `repeat` | `number \| "infinite"` | `playCount`의 예전 이름 |
| `damping`, `stiffness`, `mass` | `number` | 스프링 값 |

## 배열 {#arrays}

배열에는 문자열과 객체를 섞어 담을 수 있어요. 기본적으로는 모두 동시에 재생되고, `playback`을 정하면 차례로 또는 조금씩 시차를 두고 재생해요.

```tsx
<Strx.View
  playback="serial"
  animate={["fade-in duration-200", "slide-up duration-300"]}
/>
```

자세한 내용은 [배열 재생](playback.html)에서 확인해 보세요.

## 오타나 잘못된 토큰을 쓰면 {#typos-and-invalid-tokens}

모르는 토큰이나 잘못된 토큰은 건너뛰어요. 개발 중에는 문자열마다 한 번씩 `console.warn`으로 알려 주고, 비슷한 토큰이 있으면 수정 제안도 함께 보여 줘요.

```text
[react-native-strx] Ignored unknown animate token(s) "fade-inn" (did you mean "fade-in"?) in "fade-inn duration-300". Combine multiple presets with commas, e.g. "fade-in, slide-up".
```

나머지 토큰은 그대로 잘 동작해요. 프로덕션 빌드에서는 경고를 보여 주지 않아요.

## 실행 중에 animate 바꾸기 {#changing-animate-at-runtime}

문자열마다 해석한 결과를 저장해 두기 때문에, 렌더링할 때마다 같은 문자열을 넘겨도 부담이 없어요. 문자열이 바뀌면 새 등장 애니메이션이 재생돼요. `style`만 바뀌었을 때는 등장 애니메이션이 다시 재생되지 않아요. 스타일이 바뀌는 순간을 부드럽게 이으려면 [`transition-*`](transitions.html)을 써 보세요.
