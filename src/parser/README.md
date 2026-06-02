# Parser

This folder will contain the string/object parser for the `animate` prop.

Planned responsibilities:

- Convert Tailwind-like animation strings into normalized animation objects.
- Merge array entries in declaration order.
- Validate and normalize timing tokens such as `duration-300` and `delay-100`.

`normalize.ts` contains the first normalization pass.

## Example Checks

```ts
normalizeAnimate('fade-in duration-300 delay-150 ease-in');
// [{ type: 'fade-in', duration: 300, delay: 150, easing: 'ease-in' }]

normalizeAnimate('fade-in, slide-up duration-200');
// [{ type: 'fade-in' }, { type: 'slide-up', duration: 200 }]

normalizeAnimate({ type: 'fade-in', duration: 300 });
// [{ type: 'fade-in', duration: 300 }]

normalizeAnimate(['fade-in', [{ type: 'slide-up', delay: 100 }]]);
// [{ type: 'fade-in' }, { type: 'slide-up', delay: 100 }]
```
