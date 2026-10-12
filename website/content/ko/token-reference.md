---
title: 토큰 레퍼런스
description: 파서가 쓰는 토큰 데이터로 만든 전체 animate 토큰 목록이에요.
---

이 페이지는 `tokens.json`으로 만들어요. 파서, [에디터 확장](editor.html), 이 사이트의 미리보기가 모두 같은 데이터를 써서, 배포된 버전과 항상 같아요.

<div data-demo="sandbox" data-animate="fade-in from:translate-y-12 layout-spring duration-400 ease-out exit:opacity-0"></div>

## 문법 {#grammar}

```text
animate     = group ("," group)*
group       = token (" " token)*
token       = preset | keyframe | exit | timing | spring | transition | layout
keyframe    = ("from:" | "to:") utility
exit        = "exit:" utility
utility     = ["-"] name "-" number        e.g. opacity-50, -translate-y-20
number      = digits ["." digits]          unsigned decimal
```

- 공백은 한 그룹 안의 토큰을 나눠요. 순서는 상관없어요.
- 쉼표는 그룹을 나눠요. 그룹들은 각자의 타이밍으로 동시에 재생돼요.
- 그룹마다 프리셋은 하나까지 쓸 수 있어요.
- `transition-*`는 `animate` 값 하나에 하나만 적용돼요. 여러 개면 마지막 것을 따라요.
- 여러 그룹에 `layout-*` 토큰이 있으면 가장 강한 것을 따라요(linear보다 spring).

## 프리셋 {#presets}

<!-- strx:presets -->

커스텀 프리셋: [`definePreset`](presets.html)

## 키프레임 접두사 {#keyframe-prefixes}

<!-- strx:prefixes -->

## 유틸리티 {#utilities}

<!-- strx:utilities -->

퇴장 애니메이션은 `opacity`, `translateX`, `translateY`, `scale`을 움직여요. [퇴장 애니메이션](exit.html)을 확인해 보세요.

## 타이밍 {#timing}

<!-- strx:timing -->

## Easing과 스프링 {#easing-and-spring}

<!-- strx:easings -->

## 스타일 트랜지션 {#style-transitions}

<!-- strx:transitions -->

## 레이아웃 트랜지션 {#layout-transitions}

<!-- strx:layout -->
