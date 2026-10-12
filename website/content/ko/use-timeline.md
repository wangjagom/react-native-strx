---
title: useTimeline
description: 다시 렌더링하지 않고, 원하는 순간에 애니메이션을 재생하고 되감고 멈춰요.
---

`Strx.useTimeline`은 버튼을 눌렀을 때나 결제가 끝났을 때처럼, 화면에 나타날 때가 아니라 원하는 순간에 재생할 애니메이션을 관리해요. 컴포넌트에 `strxId`를 달아 대상으로 등록하면, 컨트롤러가 그 컴포넌트의 Reanimated 값을 직접 움직여요. React 상태도, 다시 렌더링도 필요 없어요.

```tsx
import { Strx } from "react-native-strx";

function SuccessCard() {
  const timeline = Strx.useTimeline({
    playback: "stagger",
    interval: 80,
    playables: [
      { target: "coin", animate: "scale-in from:opacity-0 duration-280 delay-300" },
      { target: "title", animate: "fade-in from:translate-y-12 duration-260" },
      { target: "button", animate: "fade-in from:translate-y-12 duration-240" },
    ],
    onComplete: () => console.log("끝났어요"),
  });

  return (
    <>
      <Strx.View strxId="coin" style={styles.coin} />
      <Strx.Text strxId="title">송금 완료</Strx.Text>
      <Strx.Pressable strxId="button" onPress={timeline.play}>
        <Strx.Text>다시 보기</Strx.Text>
      </Strx.Pressable>
    </>
  );
}
```

<div data-demo="timeline"></div>

## 준비하기 {#setup}

이 훅을 쓰려면 위쪽에 대상을 모아 두는 곳이 있어야 해요. `Strx.Provider`에 이미 들어 있고, `Strx.TimelineRoot`만 따로 써도 돼요. 대상 컴포넌트는 같은 Provider(또는 Root) 안에 있어야 해요.

```tsx
<Strx.Provider>
  <SuccessCard />
</Strx.Provider>
```

## 옵션 {#options}

| 옵션 | 타입 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `playables` | `{ target: string; animate: AnimateProp }[]` | — | 재생할 내용이에요. `target`은 컴포넌트의 `strxId`와 같아야 하고, `animate`에는 `animate` prop에 쓰는 값을 무엇이든 넣을 수 있어요. |
| `playback` | `"parallel" \| "serial" \| "stagger"` | `"parallel"` | 대상들을 어떤 순서로 재생할지 |
| `interval` | `number` | `100` | `stagger`일 때 대상 사이 간격(ms) |
| `playCount` | `number \| "infinite"` | — | 대상마다 몇 번 재생할지. `"infinite"`는 `stop()`할 때까지 반복해요. |
| `onComplete` | `() => void` | — | 횟수가 정해진 `play()`나 `reverse()`가 모든 대상에서 끝나면 한 번 불려요 |

재생 순서는 [`Strx.Timeline`](timeline.html)과 같아요. `serial`은 대상마다 지연과 지속 시간이 끝나길 기다리고, `stagger`는 앞 대상의 `delay-*`만큼 뒤 대상을 더 늦게 시작해요.

## 컨트롤러 {#controller}

| 메서드 | 하는 일 |
| --- | --- |
| `play()` | 모든 대상을 `from` 모습에서 `to` 모습으로 재생해요. |
| `reverse()` | `from` 쪽으로 되감아요. 대상이 지금 이 타임라인의 애니메이션을 보여 주고 있다면 현재 위치에서 되감고, 아니라면 `to → from`을 처음부터 재생해요. |
| `stop()` | 아직 시작하지 않은 재생은 취소하고, 움직이던 애니메이션은 그 자리에서 멈춰요. |
| `reset()` | 모든 대상을 바로 `from` 모습으로 돌려놓아요. |

`reverse()`도 `play()`와 같은 순서, 간격, 재생 횟수를 써요. 메서드는 `onPress`에 바로 넘겨도 돼요.

> [!TIP] playables는 한 번만 만들어 두세요
> `playables` 배열이 새로 만들어질 때마다 타임라인도 다시 계산해요. 컴포넌트 바깥에 정의하거나 `useMemo`로 감싸서, 렌더링할 때마다 새로 만들어지지 않게 해 주세요.

## onComplete {#oncomplete}

`onComplete`는 애니메이션이 실제로 끝난 순간에, 마지막 대상까지 끝나면 한 번 불려요. 이럴 때는 **불리지 않아요**.

- `playCount="infinite"`일 때
- `stop()`이나 `reset()`을 부른 뒤
- 더 새로운 `play()`나 `reverse()`가 이전 재생을 대신할 때

그래서 화면 이동이나 다음 작업을 안심하고 맡길 수 있어요.

```tsx
const timeline = Strx.useTimeline({
  playables: [{ target: "sheet", animate: "from:translate-y-400 to:translate-y-0 spring" }],
  onComplete: () => navigation.goBack(),
});

<Button title="닫기" onPress={timeline.reverse} />;
```

## 대상 {#targets}

- STRX 컴포넌트나 [커스텀 컴포넌트](custom-components.html)라면 `strxId`를 달아 대상으로 만들 수 있어요.
- 대상에도 따로 `animate`를 쓸 수 있어요. 처음 나타날 때의 애니메이션과 타임라인 애니메이션은 따로 움직이고, 타임라인을 재생하면 타임라인이 이어받아요.
- `strxId`는 한 Provider(또는 Root) 안에서 겹치지 않아야 해요. 겹치면 나중 것이 앞의 것을 대신하고 개발 중에 경고를 보여 줘요. 둘 중 하나가 사라져도 다른 하나는 그대로 등록되어 있어요.
- `play()`할 때 `target`에 맞는 컴포넌트가 없으면 건너뛰고, 개발 중에 "Timeline target was not registered. Check strxId." 경고를 보여 줘요.
- playable에 적은 `exit:` 토큰은 타임라인에서 쓰지 않아요.

## Timeline과 useTimeline은 뭐가 다른가요? {#timeline-vs-usetimeline}

| | `Strx.Timeline` | `Strx.useTimeline` |
| --- | --- | --- |
| 언제 재생하나요 | 자식이 화면에 나타날 때 | `play()` / `reverse()`를 부를 때 |
| 대상 | 바로 아래 자식들 | 같은 Provider 안에서 `strxId`가 맞는 컴포넌트 |
| 제어 | — | `play`, `reverse`, `stop`, `reset`, `onComplete` |
| 다시 렌더링 | 렌더링할 때 계산해요 | 없어요. 값을 직접 움직여요 |
