---
'react-native-strx': major
---

Simplify layout transitions.

- Components without a `layout-*` token or an inherited transition no longer receive a Reanimated `layout` prop, removing layout-animation overhead from plain animated components.
- Layout transitions are inherited only downward through context: from the nearest STRX ancestor with a layout transition or the nearest `Strx.LayoutGroup` (the nearest group wins). Children no longer make their parents animate; put the token on the container or use `Strx.LayoutGroup`.
- `layoutPropagation="none"` now means "ignore inherited layout transitions".
- `layout-linear` and `layout-fade` honor `duration-*` tokens and the provider duration.
- Removed the unused layout node registry and per-render child tree scan: `StrxLayoutContextType` no longer has `registerNode`, `unregisterNode`, `publishLayoutDemand`, `getNode`, or `isNodeInfluenced`; `LayoutGroupContextValue` no longer has `isInsideGroup`, `layoutKey`, or `triggerReflow`; the `StrxLayoutDemand`, `StrxMeasuredNode`, and `LayoutTransitionBuilder` types were removed.
- `Strx.Text` and `Strx.Pressable` now support `exit:` animations.
- Unmounting a component with a duplicate `strxId` no longer unregisters the other component's timeline target.
- Exit animations are skipped under reduce motion.
