/**
 * Generates the README token reference from the parser and preset
 * definitions, so the documentation cannot drift from the implementation.
 *
 * `npm run docs:tokens` rewrites the generated blocks in README.md;
 * `scripts/__tests__/tokenReference.test.ts` fails when they are stale.
 */
import { DEFAULT_LAYOUT_DURATION, SPRING_PRESETS } from '../src/core/layout';
import { DEFAULT_DURATION, DEFAULT_EASING } from '../src/core/engine/plan';
import { animationPresets, type StrxPreset } from '../src/core/presets';
import {
  applyUtility,
  EASING_TOKENS,
  LAYOUT_TOKENS,
  TRANSITION_TOKENS,
  UTILITIES,
  type TransitionKind,
} from '../src/parser/tokens';
import type { LayoutTransitionType } from '../src/context/LayoutNodeContext';

const EASING_DESCRIPTIONS: Record<(typeof EASING_TOKENS)[number], string> = {
  linear: 'Linear easing.',
  ease: 'Smoothstep easing.',
  'ease-in': 'Cubic ease-in.',
  'ease-out': `Cubic ease-out. Default when no easing is set.`,
  'ease-in-out': 'Cubic ease-in-out.',
};

const TRANSITION_DESCRIPTIONS: Record<TransitionKind, string> = {
  all: 'All supported numeric, color, and transform channels.',
  colors: 'Color keys such as `backgroundColor` and `borderColor`.',
  opacity: '`opacity` only.',
  transform: 'Transform channels such as `translateX`, `scale`, and `rotate`.',
  spacing: '`margin*` and `padding*` keys.',
  layout:
    '`width`, `height`, min/max sizes, and `top`/`right`/`bottom`/`left`.',
};

const LAYOUT_DESCRIPTIONS: Record<LayoutTransitionType, string> = {
  linear: 'Timing transition.',
  fade: 'Timing transition that also fades the view in.',
  spring: 'Spring transition.',
  'spring-stiff': 'Stiffer spring transition.',
  'spring-bouncy': 'Bouncier spring transition.',
};

const UTILITY_SAMPLES: Record<string, number> = {
  'opacity-': 50,
  'translate-x-': 20,
  'translate-y-': 20,
  'scale-x-': 95,
  'scale-y-': 105,
  'scale-': 90,
  'rotate-': 45,
  'w-': 120,
  'h-': 80,
};

function code(value: string): string {
  return `\`${value}\``;
}

function formatValue(value: unknown): string {
  return typeof value === 'string' ? `'${value}'` : String(value);
}

function formatFrame(frame: Partial<Record<string, number>>): string {
  return Object.entries(frame)
    .map(([key, value]) => code(`${key}: ${formatValue(value)}`))
    .join(', ');
}

function table(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function describeMotion(preset: StrxPreset): string {
  const { options } = preset;

  if (options.driver === 'spring') {
    return `spring, damping ${options.damping ?? 10}, stiffness ${options.stiffness ?? 100}, mass ${options.mass ?? 1}`;
  }

  return `timing, ${options.duration ?? DEFAULT_DURATION}ms`;
}

function presetsBlock(): string {
  return table(
    ['Token', 'Starts from', 'Animates to', 'Default motion'],
    Object.entries(animationPresets).map(([name, preset]) => [
      code(name),
      formatFrame(preset.initial),
      formatFrame(preset.target),
      describeMotion(preset),
    ]),
  );
}

function timingBlock(): string {
  return table(
    ['Token', 'Meaning'],
    [
      [
        code('duration-300'),
        `Duration in milliseconds. Precedence: token or object → preset default → \`Strx.Provider\` duration → ${DEFAULT_DURATION}ms.`,
      ],
      [code('delay-100'), 'Delay in milliseconds before the animation starts.'],
      [
        `${code('play-3')}, ${code('play-infinite')}`,
        'Total number of plays. Positive integers only.',
      ],
      [
        `${code('repeat-3')}, ${code('repeat-infinite')}`,
        `Same as ${code('play-*')}; kept for compatibility.`,
      ],
      ...EASING_TOKENS.map(token => [code(token), EASING_DESCRIPTIONS[token]]),
      [code('spring'), 'Uses the spring driver for numeric channels.'],
      [
        `${code('damping-12')}, ${code('stiffness-180')}, ${code('mass-1')}`,
        'Spring parameters. Defaults: damping 10, stiffness 100, mass 1.',
      ],
    ],
  ).concat(
    `\n\nNumbers are unsigned decimals such as \`300\` or \`0.5\`. Without an easing token, animations use \`${DEFAULT_EASING}\` or the provider's easing.`,
  );
}

function utilitiesBlock(): string {
  return table(
    ['Utility', 'Result', 'Negative form'],
    UTILITIES.map(utility => {
      const sample = UTILITY_SAMPLES[utility.prefix];

      if (sample === undefined) {
        throw new Error(`Missing README sample for utility ${utility.prefix}`);
      }

      const token = `${utility.prefix}${sample}`;
      const style: Record<string, unknown> = {};
      applyUtility(style, token);

      return [
        code(token),
        formatFrame(style as Record<string, number>),
        utility.signed ? code(`-${token}`) : '—',
      ];
    }),
  );
}

function transitionsBlock(): string {
  const tokensByKind = new Map<TransitionKind, string[]>();

  for (const [token, kind] of TRANSITION_TOKENS) {
    tokensByKind.set(kind, [...(tokensByKind.get(kind) ?? []), token]);
  }

  return table(
    ['Token', 'Animated style subset'],
    [...tokensByKind].map(([kind, tokens]) => [
      tokens.map(code).join(', '),
      TRANSITION_DESCRIPTIONS[kind],
    ]),
  );
}

function layoutBlock(): string {
  return table(
    ['Token', 'Behavior', 'Motion'],
    [...LAYOUT_TOKENS].map(([token, type]) => {
      const spring = SPRING_PRESETS[type];

      return [
        code(token),
        LAYOUT_DESCRIPTIONS[type],
        spring
          ? `damping ${spring.damping}, stiffness ${spring.stiffness}, mass ${spring.mass}`
          : `${DEFAULT_LAYOUT_DURATION}ms, or \`duration-*\` / provider duration`,
      ];
    }),
  );
}

export const GENERATED_BLOCKS: Record<string, () => string> = {
  presets: presetsBlock,
  timing: timingBlock,
  utilities: utilitiesBlock,
  transitions: transitionsBlock,
  layout: layoutBlock,
};

/** Replaces every `<!-- generated:name -->` block in `readme`. */
export function renderReadme(readme: string): string {
  let result = readme;

  for (const [name, render] of Object.entries(GENERATED_BLOCKS)) {
    const start = `<!-- generated:${name} -->`;
    const end = `<!-- /generated:${name} -->`;
    const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);

    if (!pattern.test(result)) {
      throw new Error(`README is missing the ${start} block`);
    }

    result = result.replace(pattern, () => `${start}\n\n${render()}\n\n${end}`);
  }

  return result;
}
