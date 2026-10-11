import { getExitTokenState } from '../exit';

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
