---
title: 설치
description: Expo 앱이나 bare React Native 앱에 STRX와 Reanimated 4를 추가합니다.
---

STRX는 Reanimated 위에 얹힌 얇은 레이어입니다. 그래서 설정의 대부분은 일반적인 Reanimated 설정과 같습니다.

## 패키지 설치 {#install-the-packages}

### Expo {#expo}

STRX는 npm으로, Reanimated 패키지는 SDK에 맞는 버전이 설치되도록 `expo install`로 설치합니다.

```sh
npm install react-native-strx
npx expo install react-native-reanimated react-native-worklets
```

`babel-preset-expo`에 Worklets Babel 플러그인이 이미 들어 있어서 따로 설정할 것이 없습니다. 사용하는 SDK에 Reanimated 4.1 이상이 포함되어 있다면 Expo Go에서도 동작하고, 그렇지 않다면 development build를 사용하세요.

### Bare React Native {#bare-react-native}

```sh
npm install react-native-strx react-native-reanimated react-native-worklets
```

그다음 `babel.config.js`에 Worklets 플러그인을 추가합니다. 반드시 **맨 마지막** 플러그인이어야 합니다.

```js title="babel.config.js"
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    // ...다른 플러그인
    "react-native-worklets/plugin",
  ],
};
```

iOS pod를 설치합니다.

```sh
npx pod-install
```

## Metro 캐시 비우기 {#clear-the-metro-cache}

설치한 직후나 Babel 설정을 바꾼 뒤에는 캐시를 비우고 Metro를 다시 시작하세요.

```sh
npx react-native start --reset-cache
# Expo라면
npx expo start -c
```

## Peer dependency {#peer-dependencies}

| 패키지 | 버전 | 비고 |
| --- | --- | --- |
| `react` | `>=19` | |
| `react-native` | `>=0.78` | Reanimated 4에 New Architecture(Fabric) 필요 |
| `react-native-reanimated` | `>=4.1.0` | |
| `react-native-worklets` | `>=0.5.0` | Reanimated 4에 필요 |

> [!NOTE] Reanimated 3
> STRX 1.0은 Reanimated 4만 지원합니다. 앱을 Reanimated 3에 계속 두어야 한다면 `react-native-strx@0.1.x`를 설치하세요.

## 배포 전 커밋 설치하기 {#installing-an-unreleased-commit}

npm에 배포되기 전의 커밋을 GitHub에서 바로 써 보려면 다음과 같이 설치합니다.

```sh
npm install github:wangjagom/react-native-strx
```

## 설정 확인하기 {#verify-the-setup}

화면에 보이는 곳에 STRX 컴포넌트를 하나 렌더링해 보세요. 서서히 나타나면 Reanimated와 Babel 플러그인이 제대로 동작하는 것입니다.

```tsx
import { Strx } from "react-native-strx";

export function SetupCheck() {
  return (
    <Strx.View animate="fade-in duration-1000">
      <Strx.Text>STRX가 동작합니다</Strx.Text>
    </Strx.View>
  );
}
```

worklets나 Babel 플러그인이 없다는 오류가 나오면 `react-native-worklets/plugin`이 Babel 플러그인 목록의 맨 마지막인지 확인하고, `--reset-cache`로 Metro를 다시 시작하세요.

## 선택: 에디터 확장 {#optional-editor-extension}

`animate=""` 안에서 토큰 자동 완성, 마우스 오버 설명, 오타 수정을 쓰려면 [STRX Animation IntelliSense](editor.html)를 설치하세요.
