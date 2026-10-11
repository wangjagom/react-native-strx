import React, { type ReactNode } from 'react';
import { renderHook } from '@testing-library/react-native';
import type { LayoutAnimationsValues } from 'react-native-reanimated';

import { LayoutGroup } from '../../context/LayoutGroupContext';
import { LayoutNodeContext } from '../../context/LayoutNodeContext';
import { StrxMotionProvider } from '../../context/StrxMotionContext';
import type { AnimateProp } from '../../types/animate';
import {
  getLayoutTransition,
  stableNoOpTransition,
  useLayoutTransition,
  type LayoutPropagationMode,
} from '../layout';

function values(overrides: Partial<LayoutAnimationsValues> = {}) {
  return {
    currentOriginX: 0,
    currentOriginY: 0,
    currentWidth: 100,
    currentHeight: 100,
    targetOriginX: 0,
    targetOriginY: 0,
    targetWidth: 100,
    targetHeight: 100,
    ...overrides,
  } as LayoutAnimationsValues;
}

describe('getLayoutTransition', () => {
  it('returns a stable function per type and options', () => {
    expect(getLayoutTransition('spring')).toBe(getLayoutTransition('spring'));
    expect(getLayoutTransition('linear', { duration: 300 })).toBe(
      getLayoutTransition('linear'),
    );
    expect(getLayoutTransition('linear', { duration: 500 })).not.toBe(
      getLayoutTransition('linear'),
    );
  });

  it('applies sub-point movement immediately', () => {
    const result = getLayoutTransition('linear')(
      values({ targetWidth: 100.2 }),
    );

    expect(result.initialValues).toEqual({
      originX: 0,
      originY: 0,
      width: 100.2,
      height: 100,
    });
  });

  it('animates from the current layout', () => {
    const result = getLayoutTransition('spring')(values({ targetHeight: 200 }));

    expect(result.initialValues).toEqual({
      originX: 0,
      originY: 0,
      width: 100,
      height: 100,
    });
    expect(Object.keys(result.animations)).toEqual([
      'originX',
      'originY',
      'width',
      'height',
    ]);
  });

  it('fades in for layout-fade', () => {
    const result = getLayoutTransition('fade')(values({ targetHeight: 200 }));

    expect(result.initialValues).toMatchObject({ opacity: 0 });
    expect(result.animations).toHaveProperty('opacity');
  });
});

describe('useLayoutTransition', () => {
  async function resolve(
    animate: AnimateProp | undefined,
    {
      propagation,
      wrapper,
    }: {
      propagation?: LayoutPropagationMode;
      wrapper?: (props: { children: ReactNode }) => React.ReactElement;
    } = {},
  ) {
    const { result } = await renderHook(
      () => useLayoutTransition(animate, propagation),
      { wrapper },
    );

    return result.current;
  }

  const parentWith =
    (type: 'spring' | 'linear') =>
    ({ children }: { children: ReactNode }) => (
      <LayoutNodeContext.Provider
        value={{ inheritedTransition: getLayoutTransition(type) }}
      >
        {children}
      </LayoutNodeContext.Provider>
    );

  it('skips the layout prop without a token or inherited transition', async () => {
    const state = await resolve('fade-in');

    expect(state.layout).toBeUndefined();
    expect(state.isActive).toBe(false);
    expect(state.nodeContextValue.inheritedTransition).toBeUndefined();
  });

  it('uses its own layout token and passes it to descendants', async () => {
    const state = await resolve('fade-in layout-spring');

    expect(state.layout).toBe(getLayoutTransition('spring'));
    expect(state.nodeContextValue.inheritedTransition).toBe(state.layout);
  });

  it('applies duration tokens and the provider duration', async () => {
    expect((await resolve('layout-linear duration-500')).layout).toBe(
      getLayoutTransition('linear', { duration: 500 }),
    );

    const state = await resolve('layout-linear', {
      wrapper: ({ children }) => (
        <StrxMotionProvider motionPreset={{ duration: 450 }}>
          {children}
        </StrxMotionProvider>
      ),
    });

    expect(state.layout).toBe(getLayoutTransition('linear', { duration: 450 }));
  });

  it('inherits from the nearest STRX ancestor', async () => {
    const state = await resolve(undefined, { wrapper: parentWith('spring') });

    expect(state.layout).toBe(getLayoutTransition('spring'));
    expect(state.isActive).toBe(true);
  });

  it('prefers its own token over the inherited transition', async () => {
    const state = await resolve('layout-linear', {
      wrapper: parentWith('spring'),
    });

    expect(state.layout).toBe(getLayoutTransition('linear'));
  });

  it('ignores inherited transitions with layoutPropagation="none"', async () => {
    const state = await resolve(undefined, {
      propagation: 'none',
      wrapper: parentWith('spring'),
    });

    expect(state.layout).toBeUndefined();
    expect(state.nodeContextValue.inheritedTransition).toBeUndefined();
  });

  it('uses the nearest LayoutGroup, replacing outer node transitions', async () => {
    const Outer = parentWith('linear');
    const state = await resolve(undefined, {
      wrapper: ({ children }) => (
        <Outer>
          <LayoutGroup transition="spring">{children}</LayoutGroup>
        </Outer>
      ),
    });

    expect(state.layout).toBe(getLayoutTransition('spring'));
  });

  it('uses the no-op transition under reduce motion', async () => {
    const state = await resolve('layout-spring', {
      wrapper: ({ children }) => (
        <StrxMotionProvider reduceMotion="always">
          {children}
        </StrxMotionProvider>
      ),
    });

    expect(state.layout).toBe(stableNoOpTransition);
  });

  it('never toggles a used layout prop back to undefined', async () => {
    const { result, rerender } = await renderHook(
      ({ animate }: { animate?: string }) => useLayoutTransition(animate),
      { initialProps: { animate: 'layout-spring' } },
    );

    expect(result.current.layout).toBe(getLayoutTransition('spring'));

    await rerender({ animate: undefined });

    expect(result.current.layout).toBe(stableNoOpTransition);
    expect(result.current.isActive).toBe(false);
  });
});
