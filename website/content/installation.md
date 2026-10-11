---
title: Installation
description: Add STRX and Reanimated 4 to an Expo or bare React Native app.
---

STRX is a thin layer over Reanimated, so most of the setup is the standard Reanimated setup.

## Install the packages

### Expo

Install STRX with npm, and the Reanimated packages with `expo install` so their versions match your SDK:

```sh
npm install react-native-strx
npx expo install react-native-reanimated react-native-worklets
```

`babel-preset-expo` already includes the Worklets Babel plugin, so there is nothing else to configure. Expo Go works as long as your SDK ships Reanimated 4.1 or newer; otherwise use a development build.

### Bare React Native

```sh
npm install react-native-strx react-native-reanimated react-native-worklets
```

Then add the Worklets plugin to `babel.config.js`. It must be the **last** plugin:

```js title="babel.config.js"
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    // ...other plugins
    "react-native-worklets/plugin",
  ],
};
```

Install the iOS pods:

```sh
npx pod-install
```

## Clear the Metro cache

After installing, or after any Babel change, restart Metro with a clean cache:

```sh
npx react-native start --reset-cache
# or, in Expo
npx expo start -c
```

## Peer dependencies

| Package | Version | Notes |
| --- | --- | --- |
| `react` | `>=19` | |
| `react-native` | `>=0.78` | New Architecture (Fabric) required by Reanimated 4 |
| `react-native-reanimated` | `>=4.1.0` | |
| `react-native-worklets` | `>=0.5.0` | Required by Reanimated 4 |

> [!NOTE] Reanimated 3
> STRX 1.0 only supports Reanimated 4. If your app must stay on Reanimated 3, install `react-native-strx@0.1.x`.

## Installing an unreleased commit

To try a commit from GitHub before it is published:

```sh
npm install github:wangjagom/react-native-strx
```

## Verify the setup

Render a STRX component somewhere visible. If it fades in, Reanimated and the Babel plugin are working:

```tsx
import { Strx } from "react-native-strx";

export function SetupCheck() {
  return (
    <Strx.View animate="fade-in duration-1000">
      <Strx.Text>STRX is working</Strx.Text>
    </Strx.View>
  );
}
```

If you see an error about worklets or a missing Babel plugin, check that `react-native-worklets/plugin` is the last Babel plugin and restart Metro with `--reset-cache`.

## Optional: editor extension

Install [STRX Animation IntelliSense](editor.html) for token autocomplete, hover docs and typo fixes inside `animate=""`.
