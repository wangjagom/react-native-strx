import {
  clearNormalizeAnimateCache,
  getNormalizeAnimateCacheSize,
  normalizeAnimate,
} from '../normalize';

/**
 * Characterization tests for the 0.1.x `normalizeAnimate` parser.
 *
 * They pin down current behavior before the v1 parser rewrite. Cases marked
 * `it.failing` document known bugs from the v1 plan; flip them to `it` once
 * the rewrite fixes them.
 */
describe('normalizeAnimate', () => {
  beforeEach(() => {
    clearNormalizeAnimateCache();
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
    ['fade-in spring', [{ type: 'fade-in' }]],
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

  it('treats a leading layout token as the preset type', () => {
    // Current quirk: the first non-control token always becomes `type`.
    expect(normalizeAnimate('layout-spring fade-in')).toEqual([
      { type: 'layout-spring' },
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

  it('drops the preset type when keyframe tokens are present', () => {
    expect(normalizeAnimate('fade-in from:opacity-50')).toEqual([
      { from: { opacity: 0.5 }, to: {} },
    ]);
  });

  it('silently drops unknown keyframe utilities', () => {
    expect(normalizeAnimate('from:blur-4')).toEqual([]);
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

  it('ignores strings longer than 512 characters', () => {
    expect(normalizeAnimate(`fade-in ${'x'.repeat(600)}`)).toEqual([]);
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

  // Known bugs (v1 plan) ------------------------------------------------------

  it.failing('B3: keeps exit: utilities out of the to frame', () => {
    expect(normalizeAnimate('from:opacity-0 exit:opacity-50')).toEqual([
      { from: { opacity: 0 }, to: {} },
    ]);
  });

  it.failing('B8: clamps opacity to 0..1 like the View parser', () => {
    expect(normalizeAnimate('from:opacity-150')).toEqual([
      { from: { opacity: 1 }, to: {} },
    ]);
  });

  it.failing('B8: rejects exponent notation like the View parser', () => {
    expect(normalizeAnimate('from:translate-x-1e3')).toEqual([]);
  });
});
