---
title: 설치
description: Expo 앱이나 bare React Native 앱에 STRX와 Reanimated 4를 추가해요.
---

STRX는 Reanimated 위에 얹은 얇은 레이어예요. 그래서 설정은 대부분 평소 하던 Reanimated 설정과 같아요.

## 패키지 설치하기 {#install-the-packages}

> [!NOTE] 1.0은 베타 버전이에요
> STRX 1.0은 `beta` 태그로 배포되어 있어서 `react-native-strx@beta`로 설치해야 해요. 그냥 `npm install react-native-strx`를 실행하면 1.0.0 정식 출시 전까지는 0.1.x가 설치돼요.

### Expo {#expo}

STRX는 npm으로 설치하고, Reanimated 패키지는 SDK에 맞는 버전이 들어가도록 `expo install`로 설치해 주세요.

```sh
npm install react-native-strx@beta
npx expo install react-native-reanimated react-native-worklets
```

`babel-preset-expo`에 Worklets Babel 플러그인이 이미 들어 있어서 따로 설정하지 않아도 돼요. 쓰고 있는 SDK에 Reanimated 4.1 이상이 들어 있다면 Expo Go에서도 바로 동작해요. 그렇지 않다면 development build를 써 주세요.

### Bare React Native {#bare-react-native}

```sh
npm install react-native-strx@beta react-native-reanimated react-native-worklets
```

그다음 `babel.config.js`에 Worklets 플러그인을 넣어 주세요. 꼭 **맨 마지막** 플러그인이어야 해요.

```js title="babel.config.js"
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    // ...다른 플러그인
    "react-native-worklets/plugin",
  ],
};
```

iOS pod도 설치해 주세요.

```sh
npx pod-install
```

## Metro 캐시 비우기 {#clear-the-metro-cache}

처음 설치했거나 Babel 설정을 바꿨다면, 캐시를 비우고 Metro를 다시 시작해 주세요.

```sh
npx react-native start --reset-cache
# Expo라면
npx expo start -c
```

## 함께 필요한 패키지 {#peer-dependencies}

| 패키지 | 버전 | 참고 |
| --- | --- | --- |
| `react` | `>=19` | |
| `react-native` | `>=0.78` | Reanimated 4에는 New Architecture(Fabric)가 필요해요 |
| `react-native-reanimated` | `>=4.1.0` | |
| `react-native-worklets` | `>=0.5.0` | Reanimated 4에 필요해요 |

> [!NOTE] Reanimated 3을 쓰고 있다면
> STRX 1.0은 Reanimated 4에서만 동작해요. 앱이 Reanimated 3을 계속 써야 한다면 `react-native-strx@0.1.x`를 설치해 주세요.

## 아직 배포되지 않은 버전 써 보기 {#installing-an-unreleased-commit}

npm에 올라가기 전의 커밋을 GitHub에서 바로 받아 쓸 수도 있어요.

```sh
npm install github:wangjagom/react-native-strx
```

## 잘 설치됐는지 확인하기 {#verify-the-setup}

화면에 보이는 곳에 STRX 컴포넌트를 하나 띄워 보세요. 서서히 나타나면 Reanimated와 Babel 플러그인이 잘 동작하고 있는 거예요.

```tsx
import { Strx } from "react-native-strx";

export function SetupCheck() {
  return (
    <Strx.View animate="fade-in duration-1000">
      <Strx.Text>STRX가 잘 동작해요</Strx.Text>
    </Strx.View>
  );
}
```

worklets나 Babel 플러그인 관련 오류가 보이면, `react-native-worklets/plugin`이 Babel 플러그인 목록의 맨 마지막에 있는지 확인하고 `--reset-cache`로 Metro를 다시 시작해 보세요.

## 함께 쓰면 좋아요: 에디터 확장 {#optional-editor-extension}

[STRX Animation IntelliSense](editor.html)를 설치하면 `animate=""` 안에서 토큰 자동 완성, 마우스를 올렸을 때 설명, 오타 수정을 쓸 수 있어요.
