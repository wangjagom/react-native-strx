---
title: Editor extension
description: Autocomplete, animated previews, and typo fixes for animate tokens in VS Code.
---

**STRX Animation IntelliSense** helps you write `animate` strings in VS Code: it suggests tokens as you type, previews how each one moves, and fixes typos before you run the app.

[Install from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=strx.strx-animation-intellisense), or search for "STRX Animation IntelliSense" in the Extensions view. It works in VS Code 1.120+ and VS Code–based editors such as Cursor, in `.tsx`, `.jsx`, `.ts` and `.js` files.

## Completions with previews {#completions}

Typing a quote, space, comma or `:` inside an `animate` string opens suggestions. The details pane shows **how the selected token moves**. Try it below: this editor runs the extension's own code.

<div data-editor-demo="completion"></div>

Suggestions follow the grammar:

- Once a group has a preset, other presets aren't suggested. Start a new group with a comma to get them back.
- Picking `from:`, `to:` or `exit:` goes straight on to values such as `opacity-*` and `translate-y-*`.
- An easing, `duration-*` or `layout-*` already in the group isn't suggested again.

## A preview for every token {#previews}

Tokens that change shape play on a **moving card**. Tokens that change timing get **charts and timelines** instead, because 300ms and 500ms are hard to tell apart on a moving card. Dashed lines show the default.

<div data-editor-demo="previews"></div>

## Hover docs {#hover}

Hover a token to see its docs and preview. When the string has several tokens, the hover also previews **the whole value**, and a value with several comma groups gets a timeline with one row per group. Hover (or tap) the tokens below.

<div data-editor-demo="hover"></div>

## Diagnostics and quick fixes {#diagnostics}

Tokens the runtime would ignore get a squiggle: unknown tokens, invalid numbers, or a second preset in one group. The rules match the warnings the library logs in development, so you catch them before running the app.

- `fade-inn` → **Replace with "fade-in"**
- `fade-in slide-up` → **Start a new group with a comma** (`fade-in, slide-up`)
- invalid numbers such as `opacity-1e3`

Type `fade-inn slide-up` in the editor above to try the fixes in the Problems panel.

## Where it looks {#where-it-looks}

The extension finds animate values wherever you write them, not only in JSX attributes:

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

Presets registered with `definePreset("name", ...)` anywhere in the workspace are suggested and accepted. The token list comes from the `react-native-strx` version installed in your project (its `tokens.json`), so the extension never suggests a token your version doesn't have.

## Settings and commands {#settings-and-commands}

| Setting | Default | Meaning |
| --- | --- | --- |
| `strxAnimation.diagnostics.enable` | `true` | Show warnings for unknown or invalid tokens |
| `strxAnimation.preview.enable` | `true` | Show previews in completion details and hovers. Hidden when `workbench.reduceMotion` is `on`; still when the OS asks for reduced motion. |

**STRX Animation: Reload Token Metadata** re-reads `tokens.json`. This also happens automatically when the installed package changes.

## Token metadata for other tools {#token-metadata-for-other-tools}

The token list is published with the package as `react-native-strx/tokens.json`. It's generated from the parser, so it always matches the installed version. Use it to build your own tooling, such as lint rules or design-token docs:

```ts
import tokens from "react-native-strx/tokens.json";

tokens.presets.map(preset => preset.name); // ["fade-in", "fade-out", ...]
```

The file has a `schemaVersion` field (currently `1`) and these lists: `presets`, `easings`, `spring`, `numericTiming`, `countTiming`, `keyframePrefixes`, `utilities`, `transitions` and `layout`. This documentation site's token tables, previews and the demos on this page use the same file.
