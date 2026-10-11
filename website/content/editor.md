---
title: Editor extension
description: Autocomplete, hover docs and typo fixes for animate tokens in VS Code.
---

**STRX Animation IntelliSense** is a VS Code extension for writing `animate` strings.

[Install from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense), or search for "STRX Animation IntelliSense" in the Extensions view. It also works in VS Code–based editors such as Cursor.

## Features

- **Completions** for every token: presets, `from:` / `to:` / `exit:` utilities, `transition-*`, `layout-*`, easing, `spring`, and `duration-*`, `delay-*`, `play-*`, `damping-*`, `stiffness-*`, `mass-*`. Suggestions follow the grammar, so once a group has a preset it stops suggesting another one.
- **Hover docs** for each token, including a preset's start and end values and default motion.
- **Diagnostics** for unknown or invalid tokens, matching the runtime warnings, with quick fixes such as `fade-inn` → `fade-in` and inserting a comma between two presets.
- **Custom presets** registered with `definePreset("name", ...)` anywhere in the workspace are suggested and accepted.
- **Version-matched tokens.** The extension reads the token list from the `react-native-strx` version installed in your project (via its `tokens.json`), so it never suggests a token your version doesn't have.

## Where it looks

The extension finds animate strings in `.tsx`, `.jsx`, `.ts` and `.js` files:

```tsx
<Strx.View animate="fade-in layout-spring" />
<Strx.View animate={open ? "fade-in" : "fade-out"} />
<Strx.View animate={["fade-in", "slide-up duration-200"]} playback="serial" />
<Strx.View animate={{ type: "bounce" }} />

Strx.useTimeline({
  playables: [{ target: "card", animate: "from:opacity-0 to:opacity-100" }],
});
```

## Settings and commands

| Setting | Default | Meaning |
| --- | --- | --- |
| `strxAnimation.diagnostics.enable` | `true` | Show warnings for unknown or invalid tokens |

**STRX Animation: Reload Token Metadata** re-reads `tokens.json`. This also happens automatically when the installed package changes.

## Token metadata for other tools

The token list is published with the package as `react-native-strx/tokens.json`. It's generated from the parser, so it always matches the installed version. Use it to build your own tooling, such as lint rules or design-token docs:

```ts
import tokens from "react-native-strx/tokens.json";

tokens.presets.map(preset => preset.name); // ["fade-in", "fade-out", ...]
```

The file has a `schemaVersion` field (currently `1`) and these lists: `presets`, `easings`, `spring`, `numericTiming`, `countTiming`, `keyframePrefixes`, `utilities`, `transitions` and `layout`. This documentation site's token tables and previews are generated from the same file.
