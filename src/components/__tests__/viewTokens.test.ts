import {
  getExitTokenState,
  getLayoutTokenState,
  getStyleAnimateProp,
} from '../View';

/**
 * Characterization tests for the token parsers embedded in `View.tsx`.
 * `it.failing` marks known bugs from the v1 plan.
 */
describe('getLayoutTokenState', () => {
  it.each([
    ['fade-in', null],
    ['layout-linear', 'linear'],
    ['fade-in layout-spring', 'spring'],
    ['layout-fade', 'fade'],
    ['layout-spring-stiff', 'spring-stiff'],
    ['layout-spring-bouncy', 'spring-bouncy'],
    ['layout-linear layout-fade', 'fade'],
    ['layout-linear layout-spring-bouncy', 'spring-bouncy'],
    ['layout-spring, layout-linear', 'spring'],
  ])('%j -> %j', (input, expected) => {
    expect(getLayoutTokenState(input).explicitTransitionType).toBe(expected);
  });

  it('ignores non-string and oversized input', () => {
    expect(
      getLayoutTokenState({ type: 'fade-in' }).explicitTransitionType,
    ).toBeNull();
    expect(
      getLayoutTokenState(`layout-spring ${'x'.repeat(600)}`)
        .explicitTransitionType,
    ).toBeNull();
  });
});

describe('getStyleAnimateProp', () => {
  it('strips layout and exit tokens from preset strings', () => {
    expect(
      getStyleAnimateProp('fade-in layout-spring exit:opacity-0 duration-300'),
    ).toBe('fade-in duration-300');
  });

  it('returns undefined when only layout tokens remain', () => {
    expect(getStyleAnimateProp('layout-spring')).toBeUndefined();
  });

  it('keeps transition tokens for the engine', () => {
    expect(getStyleAnimateProp('transition-colors duration-250')).toBe(
      'transition-colors duration-250',
    );
  });

  it('converts from:/to: tokens into a completed keyframe object', () => {
    expect(
      getStyleAnimateProp(
        'from:opacity-0 from:-translate-y-20 to:opacity-100 duration-300 ease-in play-2',
      ),
    ).toEqual({
      from: { opacity: 0, translateY: -20 },
      to: { opacity: 1, translateY: 0 },
      duration: 300,
      easing: 'ease-in',
      playCount: 2,
    });
  });

  it('fills neutral values for missing keyframe channels', () => {
    expect(getStyleAnimateProp('from:scale-90 from:rotate-10')).toEqual({
      from: { scale: 0.9, rotate: '10deg' },
      to: { scale: 1, rotate: '0deg' },
    });
  });

  it('clamps opacity to 0..100', () => {
    expect(getStyleAnimateProp('from:opacity-150')).toEqual({
      from: { opacity: 1 },
      to: { opacity: 1 },
    });
  });

  it('passes objects and arrays through unchanged', () => {
    const object = { type: 'fade-in' };
    const array = ['fade-in', 'slide-up'];

    expect(getStyleAnimateProp(object)).toBe(object);
    expect(getStyleAnimateProp(array)).toBe(array);
  });
});

describe('getExitTokenState', () => {
  it('returns an empty state without exit tokens', () => {
    expect(getExitTokenState('fade-in').hasExitToken).toBe(false);
  });

  it('collects exit utilities and timing', () => {
    expect(
      getExitTokenState(
        'exit:opacity-0 exit:-translate-y-10 duration-200 delay-50',
      ),
    ).toEqual({
      hasExitToken: true,
      style: { opacity: 0, translateY: -10 },
      duration: 200,
      delay: 50,
    });
  });

  it('ignores exit tokens inside object input', () => {
    expect(getExitTokenState(['exit:opacity-0']).hasExitToken).toBe(false);
  });

  it.failing('B7: carries easing into the exit animation', () => {
    expect(getExitTokenState('exit:opacity-0 ease-in')).toMatchObject({
      easing: 'ease-in',
    });
  });
});
