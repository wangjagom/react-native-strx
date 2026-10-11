import { getExitTokenState, getLayoutTokenState } from '../View';

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

  it('reads layout tokens from array entries', () => {
    expect(
      getLayoutTokenState(['fade-in', 'layout-spring']).explicitTransitionType,
    ).toBe('spring');
  });

  it('ignores animation objects', () => {
    expect(
      getLayoutTokenState({ type: 'fade-in' }).explicitTransitionType,
    ).toBeNull();
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

  it('reads exit tokens from array entries', () => {
    expect(getExitTokenState(['fade-in', 'exit:opacity-0']).hasExitToken).toBe(
      true,
    );
  });

  it('B7: carries easing into the exit animation', () => {
    expect(getExitTokenState('exit:opacity-0 ease-in')).toMatchObject({
      easing: 'ease-in',
    });
  });
});
