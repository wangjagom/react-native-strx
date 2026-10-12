---
title: 에디터 확장
description: VS Code에서 animate 토큰 자동 완성, 마우스 오버 문서, 오타 고치기를 지원해요.
---

**STRX Animation IntelliSense**는 `animate` 문자열을 쓸 때 도와주는 VS Code 확장이에요.

[Visual Studio Marketplace에서 설치](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense)하거나, 확장 보기에서 "STRX Animation IntelliSense"를 검색해 보세요. Cursor처럼 VS Code 기반 에디터에서도 쓸 수 있어요.

## 기능 {#features}

- **자동 완성**: 프리셋, `from:` / `to:` / `exit:` 유틸리티, `transition-*`, `layout-*`, easing, `spring`, 그리고 `duration-*`, `delay-*`, `play-*`, `damping-*`, `stiffness-*`, `mass-*`까지 모든 토큰을 추천해요. 문법을 따라 추천해서, 그룹에 프리셋이 이미 있으면 다른 프리셋은 추천하지 않아요.
- **마우스 오버 문서**: 토큰마다 설명을 보여 줘요. 프리셋이라면 시작 값, 끝 값, 기본 모션까지 보여 줘요.
- **진단**: 알 수 없거나 잘못된 토큰을 런타임 경고와 똑같이 알려 줘요. `fade-inn` → `fade-in`처럼 바로 고치거나, 두 프리셋 사이에 쉼표를 넣어 주기도 해요.
- **커스텀 프리셋**: 워크스페이스 어디서든 `definePreset("name", ...)`으로 등록한 프리셋도 추천하고 올바른 토큰으로 인식해요.
- **버전에 맞는 토큰**: 프로젝트에 설치된 `react-native-strx` 버전의 `tokens.json`에서 토큰 목록을 읽어요. 그래서 내 버전에 없는 토큰은 추천하지 않아요.

## 어디에서 찾나요 {#where-it-looks}

`.tsx`, `.jsx`, `.ts`, `.js` 파일에서 animate 문자열을 찾아요.

```tsx
<Strx.View animate="fade-in layout-spring" />
<Strx.View animate={open ? "fade-in" : "fade-out"} />
<Strx.View animate={["fade-in", "slide-up duration-200"]} playback="serial" />
<Strx.View animate={{ type: "bounce" }} />

Strx.useTimeline({
  playables: [{ target: "card", animate: "from:opacity-0 to:opacity-100" }],
});
```

## 설정과 명령 {#settings-and-commands}

| 설정 | 기본값 | 의미 |
| --- | --- | --- |
| `strxAnimation.diagnostics.enable` | `true` | 알 수 없거나 잘못된 토큰에 경고를 보여 줘요 |

**STRX Animation: Reload Token Metadata** 명령은 `tokens.json`을 다시 읽어요. 설치된 패키지가 바뀌면 자동으로도 다시 읽어요.

## 다른 도구에서 토큰 정보 쓰기 {#token-metadata-for-other-tools}

토큰 목록은 패키지에 `react-native-strx/tokens.json`으로 함께 배포돼요. 파서에서 만들어지기 때문에 설치된 버전과 항상 같아요. 린트 규칙이나 디자인 토큰 문서처럼 직접 도구를 만들 때 써 보세요.

```ts
import tokens from "react-native-strx/tokens.json";

tokens.presets.map(preset => preset.name); // ["fade-in", "fade-out", ...]
```

파일에는 `schemaVersion` 필드(지금은 `1`)와 `presets`, `easings`, `spring`, `numericTiming`, `countTiming`, `keyframePrefixes`, `utilities`, `transitions`, `layout` 목록이 있어요. 이 문서 사이트의 토큰 표와 미리보기도 같은 파일로 만들어요.
