import type React from 'react';

/** Combines two refs into one callback ref. */
export function mergeRefs<T>(
  primaryRef: React.Ref<T>,
  secondaryRef: React.ForwardedRef<T>,
) {
  return (instance: T | null) => {
    setRef(primaryRef, instance);
    setRef(secondaryRef, instance);
  };
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  try {
    (ref as React.MutableRefObject<T | null>).current = value;
  } catch {
    return;
  }
}
