---
title: 에디터 확장
description: VS Code에서 animate 토큰을 자동 완성하고, 움직임을 미리 보고, 오타를 바로 고쳐요.
---

**STRX Animation IntelliSense**는 VS Code에서 `animate` 문자열을 쓸 때 도와주는 확장이에요. 입력하는 대로 토큰을 추천하고, 토큰마다 어떻게 움직이는지 미리 보여 주고, 앱을 실행하기 전에 오타를 고쳐 줘요.

[Visual Studio Marketplace에서 설치](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense)하거나, 확장 보기에서 "STRX Animation IntelliSense"를 검색해 보세요. VS Code 1.120 이상과 Cursor 같은 VS Code 기반 에디터의 `.tsx`, `.jsx`, `.ts`, `.js` 파일에서 동작해요.

## 입력하면 미리보기와 함께 추천해요 {#completions}

`animate` 문자열 안에서 따옴표, 공백, 쉼표, `:`를 입력하면 추천 목록이 열려요. 항목을 고르면 설명에 **그 토큰이 어떻게 움직이는지** 미리보기가 나와요. 아래 편집기에 직접 입력해 보세요. 실제 확장과 같은 코드로 동작해요.

<div data-editor-demo="completion"></div>

문법을 따라 추천해요.

- 그룹에 프리셋이 이미 있으면 다른 프리셋은 추천하지 않아요. 쉼표로 새 그룹을 시작하면 다시 나와요.
- `from:`, `to:`, `exit:`를 고르면 바로 이어서 `opacity-*`, `translate-y-*` 같은 값을 추천해요.
- 그룹에 이미 있는 easing, `duration-*`, `layout-*`는 다시 추천하지 않아요.

## 토큰마다 알맞은 미리보기 {#previews}

모양이 바뀌는 토큰은 **움직이는 카드**로, 속도와 리듬을 바꾸는 토큰은 **그래프와 타임라인**으로 보여 줘요. 같은 카드로 300ms와 500ms를 비교하면 차이가 잘 안 느껴지기 때문이에요. 흐린 점선은 기본값이에요.

<div data-editor-demo="previews"></div>

## 마우스를 올리면 설명과 미리보기 {#hover}

토큰에 마우스를 올리면 설명과 미리보기가 나와요. 문자열에 토큰이 여러 개 있으면 **문자열 전체**의 결과도 함께 보여 주고, 쉼표 그룹이 여러 개라면 그룹마다 언제 시작하고 끝나는지 타임라인으로 보여 줘요. 아래 토큰에 마우스를 올리거나 눌러 보세요.

<div data-editor-demo="hover"></div>

## 오타는 바로 알려 주고 고쳐 줘요 {#diagnostics}

알 수 없는 토큰, 잘못된 숫자, 한 그룹에 프리셋 두 개처럼 런타임에 무시될 토큰에 물결 밑줄을 그어요. 라이브러리가 개발 중에 보여 주는 경고와 같은 규칙이라, 앱을 실행하기 전에 미리 잡을 수 있어요.

- `fade-inn` → **"fade-in"(으)로 바꾸기**
- `fade-in slide-up` → **쉼표로 새 그룹 시작하기** (`fade-in, slide-up`)
- `opacity-1e3`처럼 형식이 틀린 숫자

위 편집기에 `fade-inn slide-up`을 입력해 보세요. 아래 문제 패널에서 바로 고칠 수 있어요.

## 어디에서 동작하나요 {#where-it-looks}

JSX 속성만이 아니라 `animate` 값을 쓰는 곳이면 대부분 찾아요.

```tsx
<Strx.View animate="fade-in layout-spring" />
<Strx.View animate={open ? "fade-in" : "fade-out"} />
<Strx.View animate={["fade-in", "slide-up duration-200"]} playback="serial" />
<Strx.View animate={`fade-in delay-${index * 50}`} />
<Strx.View animate={{ type: "bounce" }} />

Strx.useTimeline({
  playables: [{ target: "card", animate: "from:opacity-0 to:opacity-100" }],
});
```

워크스페이스 어디서든 `definePreset("name", ...)`으로 등록한 프리셋도 추천하고 올바른 토큰으로 인식해요. 토큰 목록은 프로젝트에 설치된 `react-native-strx` 버전의 `tokens.json`에서 읽어서, 내 버전에 없는 토큰은 추천하지 않아요.

## 설정과 명령 {#settings-and-commands}

| 설정 | 기본값 | 의미 |
| --- | --- | --- |
| `strxAnimation.diagnostics.enable` | `true` | 알 수 없거나 잘못된 토큰에 경고를 보여 줘요 |
| `strxAnimation.preview.enable` | `true` | 자동 완성 설명과 마우스 오버에 미리보기를 보여 줘요. `workbench.reduceMotion`이 `on`이면 숨기고, OS에서 동작 줄이기를 켜 두면 멈춘 그림으로 보여요. |

**STRX Animation: Reload Token Metadata** 명령은 `tokens.json`을 다시 읽어요. 설치된 패키지가 바뀌면 자동으로도 다시 읽어요.

## 다른 도구에서 토큰 정보 쓰기 {#token-metadata-for-other-tools}

토큰 목록은 패키지에 `react-native-strx/tokens.json`으로 함께 배포돼요. 파서에서 만들어지기 때문에 설치된 버전과 항상 같아요. 린트 규칙이나 디자인 토큰 문서처럼 직접 도구를 만들 때 써 보세요.

```ts
import tokens from "react-native-strx/tokens.json";

tokens.presets.map(preset => preset.name); // ["fade-in", "fade-out", ...]
```

파일에는 `schemaVersion` 필드(지금은 `1`)와 `presets`, `easings`, `spring`, `numericTiming`, `countTiming`, `keyframePrefixes`, `utilities`, `transitions`, `layout` 목록이 있어요. 이 문서 사이트의 토큰 표와 미리보기, 그리고 이 페이지의 데모도 같은 파일을 써요.
