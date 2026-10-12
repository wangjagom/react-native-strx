---
title: 디버깅
description: 개발 중 경고, 기기에서 보는 디버그 오버레이, 자주 겪는 문제를 정리했어요.
---

## 개발 중 경고 {#development-warnings}

적어 둔 대로 동작하지 않을 때, STRX는 개발 빌드에서 `console.warn`으로 알려 줘요. 같은 메시지는 한 번만 보여 주기 때문에, 리스트 행에서 경고가 나도 콘솔이 넘치지 않아요.

| 경고 | 이유 |
| --- | --- |
| `Ignored unknown animate token(s) "fade-inn" (did you mean "fade-in"?) in "..."` | 오타, 잘못된 숫자, 지원하지 않는 유틸리티, 또는 한 그룹에 프리셋을 두 개 쓴 경우예요. 나머지 토큰은 그대로 동작해요. |
| `Duplicate strxId "card" replaced an existing timeline target.` | 같은 루트 안에서 화면에 있는 컴포넌트 두 개가 같은 `strxId`를 쓰고 있어요. |
| `Timeline target was not registered. Check strxId.` | `timeline.play()`가 `target`에 맞는 컴포넌트를 찾지 못했어요. |

프로덕션 빌드에서는 이 경고를 보여 주지 않아요.

> [!TIP] 실행하기 전에 오타를 잡아 보세요
> [VS Code 확장](editor.html)이 입력하는 동안 같은 경고를 보여 주고, 클릭 한 번으로 고쳐 줘요.

## 디버그 오버레이 {#debug-overlay}

`StrxDebugOverlay`는 개발할 때 기기 화면에 띄우는 작은 HUD예요. `react-native-strx/debug`라는 별도 경로에 있어서, 직접 가져오지 않으면 앱 번들에 포함되지 않아요.

```tsx
import { Strx } from "react-native-strx";
import { StrxDebugOverlay } from "react-native-strx/debug";

export default function App() {
  return (
    <Strx.Provider>
      <AppScreens />
      {__DEV__ && <StrxDebugOverlay position="bottom-left" />}
    </Strx.Provider>
  );
}
```

타임라인 레지스트리를 볼 수 있도록 `Strx.Provider`(또는 `Strx.TimelineRoot`) 안에 넣어 주세요. 처음에는 작은 알약 모양이고, 누르면 펼쳐져요.

<div class="demo"><div class="demo-stage">
<div class="overlay-mock" aria-hidden="true">
<div class="row"><span>targets</span><span>3</span></div>
<div class="row"><span>last event</span><span>timeline play stagger</span></div>
<div class="row"><span>parser cache</span><span>12</span></div>
<div class="row"><span>motion</span><span>260ms · ease-out · system</span></div>
<div class="warn">Duplicate strxId "card" replaced an existing timeline target.</div>
</div>
</div><div class="demo-bar">펼친 오버레이를 그림으로 보여 드려요.</div></div>

펼친 오버레이에서 볼 수 있는 것:

- 등록된 타임라인 대상(`strxId`) 개수
- 가장 최근 타임라인 이벤트 (예: `timeline play stagger`)
- 최근 개발 경고
- 파서 캐시 크기
- 지금 적용된 모션 설정 (지속 시간, easing, 동작 줄이기)
- 작은 easing 미리보기

### Props {#props}

| Prop | 타입 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | `false`면 아무것도 그리지 않고 갱신도 멈춰요 |
| `position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"bottom-right"` | 화면 모서리 |
| `initialExpanded` | `boolean` | `false` | 알약 대신 펼친 상태로 시작해요 |
| `showMotionPreview` | `boolean` | `true` | easing 미리보기를 보여 줘요 |

## 자주 겪는 문제 {#common-problems}

### 아무것도 움직이지 않아요 {#nothing-animates}

- STRX 컴포넌트인지 확인해 주세요(`View`가 아니라 `Strx.View`). 일반 React Native 컴포넌트에 `animate`를 쓰면 TypeScript가 알려 줘요.
- 콘솔에 "Ignored unknown animate token" 경고가 있는지 확인해 주세요.
- `react-native-worklets/plugin`이 Babel 플러그인 중 **마지막**에 있는지 확인하고, Metro를 `--reset-cache`로 다시 시작해 주세요.
- 동작 줄이기가 켜져 있나요? 그러면 애니메이션이 바로 마지막 모습으로 바뀌어요. [접근성](accessibility.html)을 확인해 보세요.

### 프리셋이 하나만 재생돼요 {#only-one-of-my-presets-plays}

쉼표 그룹 하나에는 프리셋을 하나만 쓸 수 있어요. `"fade-in slide-up"` 대신 `"fade-in, slide-up"`으로 쓰거나, 프리셋 하나에 키프레임을 더해 주세요: `"fade-in from:translate-y-12"`.

### 지속 시간이 적용되지 않아요 {#my-duration-is-ignored}

프리셋은 자기 기본 지속 시간이 있고, 이 값이 `Strx.Provider`의 `motionPreset.duration`보다 먼저예요. 그룹에 `duration-*` 토큰을 넣어 주세요. 스프링(`bounce`, `spring`)은 지속 시간이 없으니 `damping`, `stiffness`, `mass`로 조절해 주세요. [타이밍](timing.html)을 확인해 보세요.

### 등장 애니메이션이 다시 재생돼요 {#the-entrance-replays}

`animate` 값이 바뀌면 등장 애니메이션이 다시 재생돼요. 바뀌는 값으로 지연을 만드는 템플릿 문자열처럼 상태에 따라 달라지는 문자열이라면, 그 값이 바뀔 때마다 다시 재생돼요. 스타일만 바뀌어서는 다시 재생되지 않아요.

### 부모 크기가 부드럽게 바뀌지 않아요 {#a-parent-doesnt-resize-smoothly}

레이아웃 트랜지션은 아래쪽으로만 물려줘요. 크기가 바뀌는 컨테이너에 `layout-*` 토큰을 달거나, 그 영역을 [`Strx.LayoutGroup`](layout-group.html)으로 감싸 주세요.

### 퇴장 애니메이션이 재생되지 않아요 {#exit-doesnt-play}

`exit:` 토큰은 그 자식이 아니라 실제로 없어지는 컴포넌트에 달아야 해요. 동작 줄이기가 켜져 있어도 퇴장은 재생되지 않아요. [퇴장 애니메이션](exit.html)을 확인해 보세요.

### 타임라인이 아무것도 하지 않아요 {#timeline-does-nothing}

`useTimeline` 위쪽에 `Strx.Provider`나 `Strx.TimelineRoot`가 있어야 하고, 각 `target`이 같은 루트 안에서 화면에 있는 컴포넌트의 `strxId`와 같아야 해요.
