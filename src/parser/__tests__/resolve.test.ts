import { definePreset } from '../../core/presets';
import { compileCodexAnimation } from '../../core/useCodexAnimation';
import { resetWarnings } from '../../utils/warn';
import { clearParseCache, parseAnimate } from '../resolve';
import { applyUtility, parseUnsignedNumber } from '../tokens';

describe('parseAnimate', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    clearParseCache();
    resetWarnings();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('splits one string into explicit, exit, transition, and layout parts', () => {
    expect(
      parseAnimate(
        'fade-in from:translate-y-8 exit:opacity-0 transition-colors layout-spring duration-250 ease-in',
      ),
    ).toEqual({
      groups: [
        {
          preset: 'fade-in',
          from: { translateY: 8 },
          to: {},
          timing: { duration: 250, easing: 'ease-in' },
        },
      ],
      exit: {
        style: { opacity: 0 },
        timing: { duration: 250, easing: 'ease-in' },
      },
      transition: {
        kind: 'colors',
        timing: { duration: 250, easing: 'ease-in' },
      },
      layout: 'spring',
      layoutTiming: { duration: 250, easing: 'ease-in' },
      invalidTokens: [],
    });
  });

  it('scopes timing tokens to their comma group', () => {
    const spec = parseAnimate('fade-in duration-100, slide-up transition-all');

    expect(spec.groups.map(group => group.timing)).toEqual([
      { duration: 100 },
      {},
    ]);
    expect(spec.transition).toEqual({ kind: 'all', timing: {} });
  });

  it('omits groups that only carry timing, transition, or layout tokens', () => {
    expect(
      parseAnimate('transition-opacity duration-200 layout-linear').groups,
    ).toEqual([]);
  });

  it('parses objects and merges arrays', () => {
    const spec = parseAnimate([
      { type: 'fade-in', duration: 200, damping: 5 },
      { from: { opacity: 0 }, to: { opacity: 1 } },
      'exit:scale-90 layout-linear',
      'layout-spring-bouncy',
    ]);

    expect(spec.groups).toEqual([
      { preset: 'fade-in', timing: { duration: 200, damping: 5 } },
      { from: { opacity: 0 }, to: { opacity: 1 }, timing: {} },
    ]);
    expect(spec.exit).toEqual({ style: { scale: 0.9 }, timing: {} });
    expect(spec.layout).toBe('spring-bouncy');
  });

  it('caches string results', () => {
    expect(parseAnimate('fade-in')).toBe(parseAnimate('fade-in'));
  });

  it.each([
    'fade-inn',
    'fade-in slide-up',
    'duration-fast',
    'play-0',
    'from:blur-2',
    'from:-scale-50',
  ])('reports invalid tokens in %j', input => {
    expect(parseAnimate(input).invalidTokens).toHaveLength(1);
  });

  it('warns once per string with a suggestion', () => {
    parseAnimate('fade-inn duration-300');
    clearParseCache();
    parseAnimate('fade-inn duration-300');

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('did you mean "fade-in"');
  });

  it('suggests keyframe utilities for typos', () => {
    parseAnimate('from:opacty-0');

    expect(warn.mock.calls[0]?.[0]).toContain('did you mean "from:opacity-0"');
  });
});

describe('token primitives', () => {
  it.each([
    ['300', 300],
    ['0.5', 0.5],
    ['', undefined],
    ['-1', undefined],
    ['1e3', undefined],
    ['0x10', undefined],
    ['1.2.3', undefined],
  ])('parseUnsignedNumber(%j) -> %j', (input, expected) => {
    expect(parseUnsignedNumber(input)).toBe(expected);
  });

  it('applies signed utilities only where a sign makes sense', () => {
    const style = {};

    expect(applyUtility(style, '-rotate-45')).toBe(true);
    expect(applyUtility(style, '-translate-x-4')).toBe(true);
    expect(applyUtility(style, '-opacity-50')).toBe(false);
    expect(applyUtility(style, '-w-10')).toBe(false);
    expect(style).toEqual({ rotate: '-45deg', translateX: -4 });
  });
});

describe('definePreset', () => {
  it('registers a preset usable from tokens', () => {
    definePreset('test-pop', {
      initial: { opacity: 0, scale: 0.5 },
      target: { opacity: 1, scale: 1 },
      options: { driver: 'timing', duration: 120 },
    });

    const plan = compileCodexAnimation('test-pop')?.plan;

    expect(plan?.duration).toBe(120);
    expect(plan?.from.transform).toEqual({ scale: 0.5 });
  });

  it('rejects names that cannot be tokens', () => {
    expect(() =>
      definePreset('Bad Name', {
        initial: {},
        target: {},
        options: { driver: 'timing' },
      }),
    ).toThrow('Invalid preset name');
  });
});

describe('preset lookup', () => {
  it('does not treat inherited object keys as presets', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(parseAnimate('constructor').invalidTokens).toEqual(['constructor']);
    expect(compileCodexAnimation('constructor')).toBeNull();
  });
});
