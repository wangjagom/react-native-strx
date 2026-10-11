import { resetWarnings } from '../../utils/warn';
import {
  clearNormalizeAnimateCache,
  getNormalizeAnimateCacheSize,
  normalizeAnimate,
} from '../normalize';

/**
 * `normalizeAnimate` is the explicit-animation view of the unified parser.
 * These cases started as characterization tests for 0.1.x; intentional
 * behavior changes from the v1 plan are noted inline.
 */
describe('normalizeAnimate', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    clearNormalizeAnimateCache();
    resetWarnings();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('returns an empty list for nullish input', () => {
    expect(normalizeAnimate(undefined)).toEqual([]);
    expect(normalizeAnimate(null)).toEqual([]);
  });

  it.each([
    ['fade-in', [{ type: 'fade-in' }]],
    ['  fade-in\tslide-up ', [{ type: 'fade-in' }]],
    [
      'fade-in duration-300 delay-100 ease-in repeat-2 play-3',
      [
        {
          type: 'fade-in',
          duration: 300,
          delay: 100,
          easing: 'ease-in',
          repeat: 2,
          playCount: 3,
        },
      ],
    ],
    ['duration-300 fade-in', [{ type: 'fade-in', duration: 300 }]],
    ['fade-in repeat-infinite', [{ type: 'fade-in', repeat: 'infinite' }]],
    ['fade-in play-infinite', [{ type: 'fade-in', playCount: 'infinite' }]],
    ['fade-in play-0', [{ type: 'fade-in' }]],
    ['fade-in play-1.5', [{ type: 'fade-in' }]],
    ['fade-in duration-abc', [{ type: 'fade-in' }]],
    ['fade-in spring', [{ type: 'fade-in', easing: 'spring' }]],
    [
      'bounce damping-20 stiffness-200 mass-0.5',
      [{ type: 'bounce', damping: 20, stiffness: 200, mass: 0.5 }],
    ],
    [
      'fade-in, slide-up duration-400',
      [{ type: 'fade-in' }, { type: 'slide-up', duration: 400 }],
    ],
    ['fade-in,,slide-up', [{ type: 'fade-in' }, { type: 'slide-up' }]],
  ])('parses preset string %j', (input, expected) => {
    expect(normalizeAnimate(input)).toEqual(expected);
  });

  it('keeps layout and transition tokens out of preset configs', () => {
    expect(
      normalizeAnimate('fade-in layout-spring transition-all duration-300'),
    ).toEqual([{ type: 'fade-in', duration: 300 }]);
  });

  it('finds the preset regardless of token order', () => {
    // 0.1.x treated the first non-timing token, e.g. `layout-spring`, as the preset.
    expect(normalizeAnimate('layout-spring transition-all fade-in')).toEqual([
      { type: 'fade-in' },
    ]);
  });

  it.each([
    [
      'from:opacity-0 to:opacity-100',
      { from: { opacity: 0 }, to: { opacity: 1 } },
    ],
    ['from:translate-x-20', { from: { translateX: 20 }, to: {} }],
    ['from:-translate-x-20', { from: { translateX: -20 }, to: {} }],
    ['from:translate-y-12', { from: { translateY: 12 }, to: {} }],
    ['from:-translate-y-12', { from: { translateY: -12 }, to: {} }],
    ['from:scale-90', { from: { scale: 0.9 }, to: {} }],
    ['from:scale-x-95', { from: { scaleX: 0.95 }, to: {} }],
    ['from:scale-y-105', { from: { scaleY: 1.05 }, to: {} }],
    ['from:rotate-45', { from: { rotate: '45deg' }, to: {} }],
    ['from:-rotate-45', { from: { rotate: '-45deg' }, to: {} }],
    ['from:w-120 to:h-80', { from: { width: 120 }, to: { height: 80 } }],
  ])('parses keyframe utility %j', (input, expected) => {
    expect(normalizeAnimate(input)).toEqual([expected]);
  });

  it('applies timing tokens to keyframe configs', () => {
    expect(
      normalizeAnimate(
        'from:opacity-0 to:opacity-100 duration-300 delay-50 linear',
      ),
    ).toEqual([
      {
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: 300,
        delay: 50,
        easing: 'linear',
      },
    ]);
  });

  it('keeps the preset alongside keyframes so keyframes override per channel', () => {
    // 0.1.x silently dropped the preset when keyframes were present.
    expect(
      normalizeAnimate('fade-in from:translate-y-10 duration-200'),
    ).toEqual([
      { type: 'fade-in', duration: 200 },
      { from: { translateY: 10 }, to: {}, duration: 200 },
    ]);
  });

  it('drops unknown keyframe utilities with a dev warning', () => {
    expect(normalizeAnimate('from:blur-4')).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('flattens nested arrays and keeps objects', () => {
    expect(
      normalizeAnimate([
        'fade-in duration-250',
        ['slide-up delay-100'],
        { from: { scale: 0.96 }, to: { scale: 1 }, duration: 300 },
        { type: 'bounce', delay: 20 },
      ]),
    ).toEqual([
      { type: 'fade-in', duration: 250 },
      { type: 'slide-up', delay: 100 },
      { from: { scale: 0.96 }, to: { scale: 1 }, duration: 300 },
      { type: 'bounce', delay: 20 },
    ]);
  });

  it('parses long strings instead of silently ignoring them', () => {
    // 0.1.x returned [] for strings over 512 characters.
    const padding = ' duration-300'.repeat(50);

    expect(normalizeAnimate(`fade-in${padding}`)).toEqual([
      { type: 'fade-in', duration: 300 },
    ]);
  });

  it('returns fresh copies so callers cannot mutate the cache', () => {
    const first = normalizeAnimate('fade-in duration-300');
    first[0]!.duration = 9999;

    expect(normalizeAnimate('fade-in duration-300')).toEqual([
      { type: 'fade-in', duration: 300 },
    ]);
    expect(getNormalizeAnimateCacheSize()).toBe(1);
  });

  it('caps the string cache at 256 entries', () => {
    for (let index = 0; index < 300; index += 1) {
      normalizeAnimate(`fade-in duration-${index}`);
    }

    expect(getNormalizeAnimateCacheSize()).toBe(256);
  });

  // Fixed bugs from the v1 plan ----------------------------------------------

  it('B3: keeps exit: utilities out of the to frame', () => {
    expect(normalizeAnimate('from:opacity-0 exit:opacity-50')).toEqual([
      { from: { opacity: 0 }, to: {} },
    ]);
  });

  it('B8: clamps opacity to 0..1 like the View parser', () => {
    expect(normalizeAnimate('from:opacity-150')).toEqual([
      { from: { opacity: 1 }, to: {} },
    ]);
  });

  it('B8: rejects exponent notation like the View parser', () => {
    expect(normalizeAnimate('from:translate-x-1e3')).toEqual([]);
  });
});
