import {
  compileCodexAnimation,
  estimateCodexAnimationDelay,
  estimateCodexAnimationDuration,
  reverseCodexAnimation,
} from '../useCodexAnimation';
import type { AnimateProp } from '../../types/animate';

/**
 * Characterization tests for `compileCodexAnimation`, the path used by
 * `Strx.useTimeline`. `it.failing` marks known bugs from the v1 plan.
 */
function compile(animate: AnimateProp, options = {}) {
  const compiled = compileCodexAnimation(animate, options);

  if (!compiled) {
    throw new Error(`expected ${JSON.stringify(animate)} to compile`);
  }

  return compiled.plan;
}

describe('compileCodexAnimation', () => {
  it('returns null for empty or unknown animations', () => {
    expect(compileCodexAnimation(undefined)).toBeNull();
    expect(compileCodexAnimation('not-a-preset')).toBeNull();
    expect(compileCodexAnimation('layout-spring')).toBeNull();
  });

  it('compiles a timing preset with its defaults', () => {
    expect(compile('fade-in')).toEqual({
      duration: 300,
      delay: 0,
      easing: 'ease-out',
      repeat: undefined,
      driver: 'timing',
      spring: { damping: 10, stiffness: 100, mass: 1 },
      from: { style: { opacity: 0 }, transform: {} },
      to: { style: { opacity: 1 }, transform: {} },
    });
  });

  it('compiles a spring preset', () => {
    const plan = compile('bounce');

    expect(plan.driver).toBe('spring');
    expect(plan.spring).toEqual({ damping: 8, stiffness: 180, mass: 0.9 });
    expect(plan.from.transform).toEqual({ translateY: -16, scale: 0.96 });
    expect(plan.to.transform).toEqual({ translateY: 0, scale: 1 });
  });

  it('lets tokens override preset timing', () => {
    const plan = compile('slide-up duration-500 delay-100 linear');

    expect(plan.duration).toBe(500);
    expect(plan.delay).toBe(100);
    expect(plan.easing).toBe('linear');
  });

  it('merges comma groups with later groups winning per channel', () => {
    const plan = compile('fade-in, slide-up duration-400');

    expect(plan.duration).toBe(400);
    expect(plan.from).toEqual({
      style: { opacity: 0 },
      transform: { translateY: 24 },
    });
  });

  it('compiles from/to keyframes with neutral completion', () => {
    const plan = compile({ from: { opacity: 0, scale: 0.9 }, to: {} });

    expect(plan.from).toEqual({ style: { opacity: 0 }, transform: { scale: 0.9 } });
    expect(plan.to).toEqual({ style: { opacity: 1 }, transform: { scale: 1 } });
  });

  it('uses the provider duration over preset defaults (current behavior)', () => {
    expect(compile('slide-up', { duration: 200 }).duration).toBe(200);
  });

  it('zeroes timing under reduce motion', () => {
    const plan = compile('fade-in duration-500 delay-100 play-infinite', {
      reduceMotionEnabled: true,
    });

    expect(plan.duration).toBe(0);
    expect(plan.delay).toBe(0);
    expect(plan.repeat).toBe(1);
  });

  it('falls back to the provider easing for unknown easing names', () => {
    expect(compile({ type: 'fade-in', easing: 'bogus' }, { easing: 'linear' }).easing).toBe(
      'linear',
    );
  });

  it('estimates duration including delay and play count', () => {
    const compiled = compileCodexAnimation('fade-in duration-200 delay-100 play-3')!;

    expect(estimateCodexAnimationDuration(compiled)).toBe(700);
    expect(estimateCodexAnimationDelay(compiled)).toBe(100);
    expect(
      estimateCodexAnimationDuration(compileCodexAnimation('fade-in play-infinite')!),
    ).toBe(Infinity);
  });

  it('reverses frames while keeping timing', () => {
    const compiled = compileCodexAnimation('fade-in duration-200')!;
    const reversed = reverseCodexAnimation(compiled).plan;

    expect(reversed.from).toEqual(compiled.plan.to);
    expect(reversed.to).toEqual(compiled.plan.from);
    expect(reversed.duration).toBe(200);
  });

  // Known bugs (v1 plan) ------------------------------------------------------

  it.failing('B3: does not treat exit: tokens as the to frame', () => {
    expect(compile('from:opacity-0 exit:opacity-50').to.style.opacity).toBe(1);
  });

  it.failing('B4: respects spring options on animation objects', () => {
    const plan = compile({ type: 'bounce', damping: 20 } as AnimateProp);

    expect(plan.spring.damping).toBe(20);
  });

  it.failing('B9: preset durations win over the provider default', () => {
    expect(compile('slide-up', { duration: 200 }).duration).toBe(320);
  });
});
