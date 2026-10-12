#!/usr/bin/env node
/**
 * Builds the documentation site into website/dist.
 *
 * - Pages are Markdown files in website/content (see NAV for their order).
 * - Token tables are generated from tokens.json, so they always match the
 *   parser.
 * - Every animate string in a code block is checked against the token data,
 *   and every internal link and anchor is checked, so the build fails when
 *   the docs drift from the library.
 *
 * Usage: node scripts/build-site.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'website');
const OUT = path.join(SITE, 'dist');
const REPO = 'https://github.com/wangjagom/react-native-strx';
// Absolute URL the site is served from. Used for canonical links, social
// cards and the sitemap. Override with SITE_URL when using a custom domain.
const SITE_URL = (process.env.SITE_URL || 'https://wangjagom.github.io/react-native-strx/').replace(/\/?$/, '/');
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || 'Y4f7LAiSm2Qm78evDJuH8WvByOelDiSEHPQGnUzwaPk';
const BUILD_DATE =new Date().toISOString().slice(0, 10);
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens.json'), 'utf8'));

const NAV = [
  {
    title: 'Getting started',
    pages: ['introduction', 'installation', 'quick-start'],
  },
  {
    title: 'Core concepts',
    pages: ['animate-prop', 'presets', 'keyframes', 'timing', 'springs', 'exit'],
  },
  {
    title: 'Interaction & layout',
    pages: ['transitions', 'layout', 'layout-group'],
  },
  {
    title: 'Choreography',
    pages: ['playback', 'timeline', 'use-timeline'],
  },
  {
    title: 'Components & app',
    pages: ['components', 'custom-components', 'provider', 'accessibility'],
  },
  {
    title: 'Tooling',
    pages: ['debugging', 'editor', 'recipes'],
  },
  {
    title: 'Reference',
    pages: ['token-reference', 'api-reference', 'migration'],
  },
];

// ------------------------------------------------------------- locales

/**
 * Site languages. English lives at the root; other languages live under
 * their prefix and fall back to the English body for untranslated pages
 * (content/<code>/<slug>.md overrides content/<slug>.md).
 */
const LOCALES = {
  en: {
    code: 'en',
    prefix: '',
    ogLocale: 'en_US',
    name: 'English',
    ui: {
      skip: 'Skip to content',
      openNav: 'Open navigation',
      searchDocs: 'Search docs',
      searchPlaceholder: 'Search the docs…',
      docs: 'Docs',
      playground: 'Playground',
      tokens: 'Tokens',
      switchTheme: 'Switch theme',
      onThisPage: 'On this page',
      previous: 'Previous',
      next: 'Next',
      editPage: 'Edit this page on GitHub',
      changelog: 'Changelog',
      license: 'MIT License',
      untranslated: '',
      sections: {},
      navTitles: {},
    },
  },
  ko: {
    code: 'ko',
    prefix: 'ko/',
    ogLocale: 'ko_KR',
    name: '한국어',
    ui: {
      skip: '본문으로 건너뛰기',
      openNav: '메뉴 열기',
      searchDocs: '문서 검색',
      searchPlaceholder: '문서 검색…',
      docs: '문서',
      playground: '플레이그라운드',
      tokens: '토큰',
      switchTheme: '테마 전환',
      onThisPage: '이 페이지에서',
      previous: '이전',
      next: '다음',
      editPage: 'GitHub에서 이 페이지 수정하기',
      changelog: '변경 내역',
      license: 'MIT 라이선스',
      untranslated: '이 페이지는 아직 번역하고 있어요. 우선 영어 원문으로 보여 드릴게요.',
      sections: {
        'Getting started': '시작하기',
        'Core concepts': '핵심 개념',
        'Interaction & layout': '인터랙션과 레이아웃',
        Choreography: '연출',
        'Components & app': '컴포넌트와 앱',
        Tooling: '도구',
        Reference: '레퍼런스',
      },
      navTitles: {
        introduction: '소개',
        installation: '설치',
        'quick-start': '빠른 시작',
        'animate-prop': 'animate prop',
        presets: '프리셋',
        keyframes: '키프레임',
        timing: '타이밍과 이징',
        springs: '스프링',
        exit: '퇴장 애니메이션',
        transitions: '스타일 트랜지션',
        layout: '레이아웃 트랜지션',
        'layout-group': 'LayoutGroup',
        playback: '배열 재생',
        timeline: 'Strx.Timeline',
        'use-timeline': 'useTimeline',
        components: '컴포넌트',
        'custom-components': '커스텀 컴포넌트',
        provider: 'Provider',
        accessibility: '접근성',
        debugging: '디버깅',
        editor: '에디터 확장',
        recipes: '레시피',
        'token-reference': '토큰 레퍼런스',
        'api-reference': 'API 레퍼런스',
        migration: '0.1에서 마이그레이션',
      },
    },
  },
};

/** Relative path from a file in `fromDir` (site-relative) to a site-relative target. */
function relativeTo(fromDir, target) {
  const relative = path.posix.relative(fromDir || '.', target);
  return relative || './';
}

// ------------------------------------------------------------- token engine

const engineSource = fs.readFileSync(path.join(SITE, 'static/token-engine.js'), 'utf8');
const sandbox = { STRX_TOKENS: tokens };
sandbox.globalThis = sandbox;
vm.runInNewContext(engineSource, sandbox);
const T = sandbox.StrxTokens;

// ------------------------------------------------------------- helpers

const errors = [];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/`/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9\u3131-\u318e\uac00-\ud7a3\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

// ------------------------------------------------------------- highlighting

function highlightAnimateString(quote, body) {
  const parts = body.split(/(\s+|,)/).map(part => {
    if (!part.trim() || part === ',') return escapeHtml(part);
    return `<span class="tk-${T.classify(part)}">${escapeHtml(part)}</span>`;
  });

  return `<span class="hl-s">${quote}</span>${parts.join('')}<span class="hl-s">${quote}</span>`;
}

const KEYWORDS =
  /^(import|from|export|default|const|let|var|function|return|if|else|true|false|null|undefined|new|typeof|as|type|interface|extends|async|await|module|require)$/;

function highlightCode(code, lang, context) {
  if (lang === 'sh' || lang === 'bash') {
    return code
      .split('\n')
      .map(line => {
        if (/^\s*#/.test(line)) return `<span class="hl-c">${escapeHtml(line)}</span>`;
        const [command, comment] = line.split(/(?=\s#)/);
        const words = command.split(/(\s+)/).map((word, index) => {
          if (!word.trim()) return word;
          if (index === 0) return `<span class="hl-f">${escapeHtml(word)}</span>`;
          if (/^--?[a-z]/.test(word)) return `<span class="hl-a">${escapeHtml(word)}</span>`;
          if (/^(react-native|@|github:|expo-)/.test(word)) return `<span class="hl-t">${escapeHtml(word)}</span>`;
          return escapeHtml(word);
        });
        return words.join('') + (comment ? `<span class="hl-c">${escapeHtml(comment)}</span>` : '');
      })
      .join('\n');
  }

  if (lang === 'text' || lang === 'txt') {
    return escapeHtml(code);
  }

  const pattern =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Z][\w.]*|<\/?[a-z][\w]*(?=[\s>/]))|(\b[A-Za-z_$][\w$]*\b)|(\b\d+(?:\.\d+)?\b)|(=>|[{}()[\];,])/g;
  let out = '';
  let last = 0;
  let match;

  while ((match = pattern.exec(code))) {
    out += escapeHtml(code.slice(last, match.index));
    last = pattern.lastIndex;
    const [text, comment, string, tag, word, number, punctuation] = match;

    if (comment) {
      out += `<span class="hl-c">${escapeHtml(text)}</span>`;
    } else if (string) {
      const quote = string[0];
      const body = string.slice(1, -1);

      if (quote !== '`' && T.isAnimateString(body)) {
        out += highlightAnimateString(quote, body);
      } else {
        out += `<span class="hl-s">${escapeHtml(text)}</span>`;
      }

      checkAnimateString(body, quote, code, match.index, context);
    } else if (tag) {
      const slash = tag.startsWith('</') ? '&lt;/' : '&lt;';
      out += `<span class="hl-p">${slash}</span><span class="hl-t">${escapeHtml(tag.replace(/^<\/?/, ''))}</span>`;
    } else if (word) {
      const rest = code.slice(last);
      const isKey = /^\s*:/.test(rest);

      if (KEYWORDS.test(word) && !isKey) {
        out += `<span class="hl-k">${word}</span>`;
      } else if (/^=(?!=)/.test(rest) && /[\s{]$/.test(code.slice(0, match.index))) {
        // JSX attribute or prop: animate="…", onPress={…}
        out += `<span class="hl-a">${word}</span>`;
      } else if (/^\(/.test(rest) || /function\s+$/.test(code.slice(0, match.index))) {
        out += `<span class="hl-f">${word}</span>`;
      } else {
        out += escapeHtml(word);
      }
    } else if (number) {
      out += `<span class="hl-n">${number}</span>`;
    } else if (punctuation) {
      out += `<span class="hl-p">${escapeHtml(punctuation)}</span>`;
    }
  }

  return out + escapeHtml(code.slice(last));
}

/**
 * Fails the build when a code sample passes an unknown token to animate.
 * Only strings assigned to `animate=` / `animate:` or inside an `animate={[...]}`
 * array are checked; blocks marked `allow-invalid` are skipped.
 */
function checkAnimateString(body, quote, code, index, context) {
  if (!context || context.allowInvalid || quote === '`') return;

  const before = code.slice(Math.max(0, index - 200), index);
  const direct = /animate\s*[=:]\s*\{?\s*$/.test(before);
  const inArray = /animate=\{\[[^\]]*$/.test(before);

  if (!direct && !inArray) return;
  if (!/[a-z]/.test(body)) return;

  validateAnimate(body, context);
}

function validateAnimate(body, context) {
  const custom = context.customPresets || [];
  const groups = T.split(body);
  const bad = groups
    .flat()
    .filter(token => T.classify(token) === 'invalid' && !custom.includes(token));

  if (bad.length) {
    errors.push(`${context.file}: unknown animate token(s) ${bad.join(', ')} in "${body}"`);
  }

  for (const group of groups) {
    const presets = group.filter(token => T.classify(token) === 'preset' || custom.includes(token));

    if (presets.length > 1) {
      errors.push(`${context.file}: more than one preset in a group (${presets.join(', ')}) in "${body}"`);
    }
  }
}

/** Splits highlighted HTML into lines, closing and reopening spans that cross a line break. */
function splitHighlightedLines(html) {
  const lines = [];
  let open = [];

  for (const raw of html.split('\n')) {
    let line = open.join('') + raw;
    const stack = [...open];

    for (const tag of raw.matchAll(/<span[^>]*>|<\/span>/g)) {
      if (tag[0] === '</span>') stack.pop();
      else stack.push(tag[0]);
    }

    line += '</span>'.repeat(stack.length);
    open = stack;
    lines.push(line);
  }

  return lines;
}

/** Parses `{2,5-7}` in a fence's meta into a set of highlighted line numbers. */
function highlightedLines(meta) {
  const set = new Set();
  const match = /\{([\d,\s-]+)\}/.exec(meta || '');

  if (!match) return set;

  for (const part of match[1].split(',')) {
    const [from, to] = part.trim().split('-').map(Number);
    for (let line = from; line <= (to || from); line += 1) set.add(line);
  }

  return set;
}

const PACKAGE_MANAGERS = [
  ['npm', line => line],
  ['yarn', line => line.replace(/^npm install\b/, 'yarn add')],
  ['pnpm', line => line.replace(/^npm install\b/, 'pnpm add')],
];

const DOTS = '<span class="codeblock-dots" aria-hidden="true"><i></i><i></i><i></i></span>';

function codeBlock(code, lang, meta, context) {
  const title = /title="([^"]+)"/.exec(meta || '');
  const allowInvalid = /allow-invalid/.test(meta || '');
  const isShell = lang === 'sh' || lang === 'bash';
  const commands = code.split('\n').filter(line => line.trim() && !/^\s*#/.test(line));

  // An install-only shell block gets npm / yarn / pnpm tabs.
  if (isShell && commands.length > 0 && commands.every(line => /^npm install\b/.test(line))) {
    const tabs = PACKAGE_MANAGERS.map(
      ([name], index) =>
        `<button type="button" class="pm-tab" data-pm="${name}" aria-pressed="${index === 0}">${name}</button>`,
    ).join('');
    const variants = PACKAGE_MANAGERS.map(
      ([name, convert], index) =>
        `<pre data-pm="${name}"${index === 0 ? '' : ' hidden'}><code class="lang-sh">${highlightCode(
          code.split('\n').map(convert).join('\n'),
          'sh',
        )}</code></pre>`,
    ).join('');

    return `<div class="codeblock" data-pm-block><div class="codeblock-title">${tabs}</div>${variants}</div>`;
  }

  let body = highlightCode(code, lang, { ...context, allowInvalid });
  const isScript = /^(tsx|ts|jsx|js)$/.test(lang || '');
  const marked = highlightedLines(meta);
  let numbered = false;

  if (isScript && (code.split('\n').length >= 4 || marked.size)) {
    numbered = true;
    body = splitHighlightedLines(body)
      .map(
        (line, index) =>
          `<span class="line${marked.has(index + 1) ? ' hl' : ''}"><span class="ln">${index + 1}</span>${line}</span>`,
      )
      .join('');
  }

  const bar = title
    ? `<div class="codeblock-title">${DOTS}<span>${escapeHtml(title[1])}</span>${
        lang ? `<span class="codeblock-lang">${escapeHtml(lang)}</span>` : ''
      }</div>`
    : '';

  return (
    `<div class="codeblock">${bar}` +
    `<pre${numbered ? ' class="numbered"' : ''}><code class="lang-${escapeHtml(lang || 'text')}">${body}</code></pre></div>`
  );
}

// ------------------------------------------------------------- generated tables

function table(head, rows) {
  return (
    '<div class="table-wrap"><table><thead><tr>' +
    head.map(cell => `<th scope="col">${cell}</th>`).join('') +
    '</tr></thead><tbody>' +
    rows.map(row => '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>').join('') +
    '</tbody></table></div>'
  );
}

function tokenCode(token, kind) {
  return `<code class="tk-${kind || T.classify(token)}">${escapeHtml(token)}</code>`;
}

function frame(values) {
  return Object.entries(values)
    .map(
      ([key, value]) =>
        `<code class="kv"><span class="kv-k">${key}</span>: <span class="kv-v">${value}</span></code>`,
    )
    .join(', ');
}

function inlineMarkdown(text) {
  return text
    .split(/`([^`]+)`/)
    .map((part, index) => (index % 2 ? inlineCode(part) : escapeHtml(part)))
    .join('');
}

/** Korean text for generated tables; keys are the English strings. */
const GENERATED_KO = {
  Token: '토큰',
  'Starts from': '시작 값',
  'Animates to': '도착 값',
  'Default motion': '기본 모션',
  Curve: '곡선',
  Meaning: '의미',
  Utility: '유틸리티',
  Result: '결과',
  'Negative form': '음수 형태',
  Notes: '비고',
  Prefix: '접두사',
  'Animated style subset': '애니메이션되는 스타일',
  Behavior: '동작',
  Motion: '모션',
  'Percent, clamped to 0–100': '퍼센트, 0–100 사이',
  'Percent (100 = 1)': '퍼센트 (100 = 1)',
  Degrees: '도(degree)',
  Points: '포인트',
  'from:': '애니메이션을 시작하기 전 모습이에요.',
  'to:': '애니메이션이 도착할 모습이에요.',
  'exit:': '컴포넌트가 사라질 때 도착할 모습이에요.',
  'Linear easing.': '일정한 속도로 움직여요.',
  'Smoothstep easing.': '부드럽게 시작하고 부드럽게 멈춰요(smoothstep).',
  'Cubic ease-in.': '천천히 시작해서 빨라져요(cubic).',
  'Cubic ease-out. Default when no easing is set.': '빠르게 시작해서 천천히 멈춰요(cubic). easing을 정하지 않으면 이 값을 써요.',
  'Cubic ease-in-out.': '천천히 시작하고 천천히 멈춰요(cubic).',
  'Uses the spring driver for numeric channels.': '숫자 값을 스프링으로 움직여요.',
  'Duration in milliseconds. Precedence: token or object → preset default → Strx.Provider duration → 300ms.':
    '지속 시간(ms)이에요. 우선순위: 토큰이나 객체 → 프리셋 기본값 → Strx.Provider 지속 시간 → 300ms',
  'Delay in milliseconds before the animation starts.': '애니메이션이 시작하기 전에 기다리는 시간(ms)이에요.',
  'Spring damping. Default 10.': '스프링 감쇠(damping)예요. 기본값은 10이에요.',
  'Spring stiffness. Default 100.': '스프링 강성(stiffness)이에요. 기본값은 100이에요.',
  'Spring mass. Default 1.': '스프링 질량(mass)이에요. 기본값은 1이에요.',
  'Total number of plays, or `play-infinite`.': '전체 재생 횟수예요. 계속 반복하려면 `play-infinite`를 써요.',
  'Same as `play-*`; kept for compatibility.': '`play-*`와 같아요. 호환성을 위해 남겨 뒀어요.',
  'All supported numeric, color, and transform channels.': '지원하는 숫자, 색, transform 값 전부',
  'Color keys such as `backgroundColor` and `borderColor`.': '`backgroundColor`, `borderColor` 같은 색 키',
  '`opacity` only.': '`opacity`만',
  'Transform channels such as `translateX`, `scale`, and `rotate`.': '`translateX`, `scale`, `rotate` 같은 transform 값',
  '`margin*` and `padding*` keys.': '`margin*`, `padding*` 키',
  '`width`, `height`, min/max sizes, and `top`/`right`/`bottom`/`left`.':
    '`width`, `height`, 최소/최대 크기, `top`/`right`/`bottom`/`left`',
  'Timing transition.': '타이밍으로 움직여요.',
  'Spring transition.': '스프링으로 움직여요.',
  'Timing transition that also fades the view in.': '타이밍으로 움직이면서 뷰가 서서히 나타나요.',
  'Stiffer spring transition.': '더 단단한 스프링으로 움직여요.',
  'Bouncier spring transition.': '더 통통 튀는 스프링으로 움직여요.',
  '(legacy)': '(이전 방식)',
};

function translateGenerated(lang, text) {
  return lang === 'ko' && GENERATED_KO[text] ? GENERATED_KO[text] : text;
}

function describe(lang, text) {
  return inlineMarkdown(translateGenerated(lang, text));
}

function layoutMotion(lang, motion) {
  if (lang !== 'ko') return inlineMarkdown(motion);
  return inlineMarkdown(motion.replace(/^(\d+ms), or (.+) \/ provider duration$/, '$1, 또는 $2 / Provider 지속 시간'));
}

function presetMotion(lang, motion) {
  if (lang !== 'ko') return escapeHtml(motion);
  return escapeHtml(motion.replace(/^timing/, '타이밍').replace(/^spring/, '스프링'));
}

const GENERATED = {
  presets: (lang = 'en') =>
    table(
      ['Token', 'Starts from', 'Animates to', 'Default motion'].map(text => translateGenerated(lang, text)),
      tokens.presets.map(preset => [
        tokenCode(preset.name, 'preset'),
        frame(preset.initial),
        frame(preset.target),
        presetMotion(lang, preset.motion),
      ]),
    ),
  easings: (lang = 'en') =>
    table(
      ['Token', 'Curve'].map(text => translateGenerated(lang, text)),
      tokens.easings
        .map(easing => [tokenCode(easing.token, 'timing'), describe(lang, easing.description)])
        .concat([[tokenCode(tokens.spring.token, 'timing'), describe(lang, tokens.spring.description)]]),
    ),
  timing: (lang = 'en') =>
    table(
      ['Token', 'Meaning'].map(text => translateGenerated(lang, text)),
      tokens.numericTiming
        .map(item => [tokenCode(item.example, 'timing'), describe(lang, item.description)])
        .concat(
          tokens.countTiming.map(item => [
            `${tokenCode(item.example, 'timing')} ${tokenCode(item.prefix + 'infinite', 'timing')}`,
            describe(lang, item.description) + (item.legacy ? ` <em>${translateGenerated(lang, '(legacy)')}</em>` : ''),
          ]),
        ),
    ),
  utilities: (lang = 'en') =>
    table(
      ['Utility', 'Result', 'Negative form', 'Notes'].map(text => translateGenerated(lang, text)),
      tokens.utilities.map(utility => [
        `<code>${escapeHtml(utility.example)}</code>`,
        `<code>${escapeHtml(utility.result)}</code>`,
        utility.signed ? `<code>-${escapeHtml(utility.example)}</code>` : '—',
        translateGenerated(
          lang,
          utility.property === 'opacity'
            ? 'Percent, clamped to 0–100'
            : /^scale/.test(utility.property)
              ? 'Percent (100 = 1)'
              : utility.property === 'rotate'
                ? 'Degrees'
                : 'Points',
        ),
      ]),
    ),
  prefixes: (lang = 'en') =>
    table(
      ['Prefix', 'Meaning'].map(text => translateGenerated(lang, text)),
      tokens.keyframePrefixes.map(prefix => [
        tokenCode(prefix.prefix + '*', prefix.prefix === 'exit:' ? 'exit' : 'keyframe'),
        lang === 'ko' && GENERATED_KO[prefix.prefix]
          ? escapeHtml(GENERATED_KO[prefix.prefix])
          : inlineMarkdown(prefix.description),
      ]),
    ),
  transitions: (lang = 'en') =>
    table(
      ['Token', 'Animated style subset'].map(text => translateGenerated(lang, text)),
      tokens.transitions.map(item => [tokenCode(item.token, 'transition'), describe(lang, item.description)]),
    ),
  layout: (lang = 'en') =>
    table(
      ['Token', 'Behavior', 'Motion'].map(text => translateGenerated(lang, text)),
      tokens.layout.map(item => [
        tokenCode(item.token, 'layout'),
        describe(lang, item.description),
        layoutMotion(lang, item.motion),
      ]),
    ),
};

// ------------------------------------------------------------- markdown

function renderInline(text) {
  const codes = [];
  let html = text.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });

  html = escapeHtml(html)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,:;]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const external = /^https?:/.test(href);
      return `<a href="${href}"${external ? ' rel="noopener"' : ''}>${label}</a>`;
    });

  return html.replace(/\u0000(\d+)\u0000/g, (_, index) => inlineCode(codes[Number(index)]));
}

/** Category of an inline-code token, including wildcards such as `layout-*` and `from:`. */
function tokenKind(text) {
  const kind = T.classify(text);

  if (kind !== 'invalid') return kind;
  if (/^(from|to):(\*|[a-z-]+\*?)?$/.test(text)) return 'keyframe';
  if (/^exit:(\*|[a-z-]+\*?)?$/.test(text)) return 'exit';
  if (/^layout-\*$/.test(text)) return 'layout';
  if (/^transition-\*$/.test(text)) return 'transition';
  if (/^(duration|delay|play|repeat|damping|stiffness|mass)-(\*|\{number\})$/.test(text)) return 'timing';
  return null;
}

/** Inline code: animate tokens become colored badges, whole animate strings get colored tokens. */
function inlineCode(text) {
  const kind = tokenKind(text);

  if (kind) return `<code class="tk-${kind}">${escapeHtml(text)}</code>`;

  if (/[\s,]/.test(text.trim()) && T.isAnimateString(text)) {
    const parts = text.split(/(\s+|,)/).map(part =>
      !part.trim() || part === ',' ? escapeHtml(part) : `<span class="tk-${T.classify(part)}">${escapeHtml(part)}</span>`,
    );
    return `<code class="tk-string">${parts.join('')}</code>`;
  }

  return `<code>${escapeHtml(text)}</code>`;
}

function parseFrontmatter(source) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  const meta = {};

  if (!match) return { meta, body: source };

  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  });

  return { meta, body: source.slice(match[0].length) };
}

function renderMarkdown(source, context) {
  const lines = source.split('\n');
  const html = [];
  const headings = [];
  let i = 0;

  function isBlockStart(line) {
    return (
      /^(#{1,4})\s/.test(line) ||
      /^```/.test(line) ||
      /^\s*[-*]\s/.test(line) ||
      /^\s*\d+\.\s/.test(line) ||
      /^>/.test(line) ||
      /^\|/.test(line) ||
      /^<(?!code|a |strong|em)/.test(line)
    );
  }

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = /^```(\w*)\s*(.*)$/.exec(line);
    if (fence) {
      const code = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      html.push(codeBlock(code.join('\n'), fence[1], fence[2], context));
      continue;
    }

    const generated = /^<!--\s*strx:(\w+)\s*-->$/.exec(line.trim());
    if (generated) {
      if (!GENERATED[generated[1]]) errors.push(`${context.file}: unknown generated block ${generated[1]}`);
      else html.push(GENERATED[generated[1]](context.lang));
      i += 1;
      continue;
    }

    const heading = /^(#{2,4})\s+(.*?)(?:\s+\{#([a-z0-9-]+)\})?$/.exec(line);
    if (heading) {
      const depth = heading[1].length;
      const inner = renderInline(heading[2]);
      // `## 제목 {#id}` keeps a translated heading's anchor equal to the English one.
      const baseId = heading[3] || slugify(heading[2]);
      let id = baseId;
      let n = 2;
      while (headings.some(item => item.id === id)) {
        id = `${baseId}-${n}`;
        n += 1;
      }
      headings.push({ depth, id, text: stripTags(inner) });
      html.push(`<h${depth} id="${id}"><a class="anchor" href="#${id}">${inner}</a></h${depth}>`);
      i += 1;
      continue;
    }

    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const split = row =>
        row
          .trim()
          .replace(/^\||\|$/g, '')
          .split(/(?<!\\)\|/)
          .map(cell => renderInline(cell.trim().replace(/\\\|/g, '|')));
      const head = split(line);
      const rows = [];
      i += 2;
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(split(lines[i]));
        i += 1;
      }
      html.push(table(head, rows));
      continue;
    }

    if (/^>/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      const kind = /^\[!(NOTE|TIP|WARNING|IMPORTANT)\]\s*(.*)$/.exec(quote[0]);
      if (kind) quote.shift();
      const title = kind && kind[2] ? `<span class="callout-title">${renderInline(kind[2])}</span>` : '';
      const paragraphs = quote
        .join('\n')
        .split(/\n\s*\n/)
        .map(paragraph => `<p>${renderInline(paragraph.replace(/\n/g, ' '))}</p>`)
        .join('');
      const variant = kind && kind[1] === 'WARNING' ? ' warning' : '';
      html.push(`<div class="callout${variant}">${title}${paragraphs}</div>`);
      continue;
    }

    const list = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (list) {
      const ordered = /\d/.test(list[2]);
      const items = [];
      while (i < lines.length) {
        const item = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (item) {
          items.push(item[3]);
          i += 1;
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i += 1;
        } else {
          break;
        }
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.map(item => `<li>${renderInline(item)}</li>`).join('')}</${tag}>`);
      continue;
    }

    if (/^</.test(line)) {
      const block = [];
      while (i < lines.length && lines[i].trim()) {
        block.push(lines[i]);
        i += 1;
      }
      const raw = block.join('\n');
      for (const attr of raw.matchAll(/data-(?:options|animate|entries|enter|exit-tokens)="([^"]*)"/g)) {
        attr[1].split('|').forEach(value => validateAnimate(value, context));
      }
      html.push(raw);
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && (paragraph.length === 0 || !isBlockStart(lines[i]))) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return { html: html.join('\n'), headings };
}

// ------------------------------------------------------------- templates

const ICONS = {
  github:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
  sun: '<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  search:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  globe:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/></svg>',
  arrow:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
};

const THEME_SCRIPT =
  "(function(){var t;try{t=localStorage.getItem('strx-theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)})();";

function head({
  title,
  description,
  base,
  path: pagePath = '',
  type = 'website',
  jsonLd,
  noindex,
  locale = LOCALES.en,
  alternates,
}) {
  const url = SITE_URL + pagePath;
  const hreflang = alternates
    ? Object.entries(alternates)
        .map(([code, target]) => `<link rel="alternate" hreflang="${code}" href="${SITE_URL}${target}">`)
        .concat(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}${alternates.en}">`)
        .join('\n')
    : '';
  const image = `${SITE_URL}assets/og.png`;
  const structured = jsonLd
    ? `\n<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
    : '';

  return `<!doctype html>
<html lang="${locale.code}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
${hreflang}
<meta name="description" content="${escapeHtml(description)}">
<meta name="google-site-verification" content="${escapeHtml(GOOGLE_SITE_VERIFICATION)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta property="og:site_name" content="react-native-strx">
<meta property="og:locale" content="${locale.ogLocale}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="react-native-strx: motion for React Native, written as tokens">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${image}">
<link rel="apple-touch-icon" href="${base}assets/logo.png">${structured}
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b0e17" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${base}assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">${
  locale.code === 'ko'
    ? '\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">'
    : ''
}
<script>${THEME_SCRIPT}</script>
<link rel="stylesheet" href="${base}assets/site.css">
</head>`;
}

/**
 * `base` reaches the site root (assets), `home` reaches this language's
 * root, and `alternate` is this page in the other language.
 */
function topNav({ base, home = base, active, withMenu, locale = LOCALES.en, alternate }) {
  const ui = locale.ui;
  const other = locale.code === 'en' ? LOCALES.ko : LOCALES.en;
  return `<header class="topnav">
<div class="topnav-inner">
${withMenu ? `<button type="button" class="icon-btn menu-btn" aria-label="${ui.openNav}" aria-expanded="false">${ICONS.menu}</button>` : ''}
<a class="brand" href="${home}index.html">
<img src="${base}assets/logo.png" alt="" width="28" height="28">
<span class="brand-name">react-native-strx</span>
<span class="pill">v${escapeHtml(pkg.version)}</span>
</a>
<nav class="topnav-links" aria-label="Main">
<button type="button" class="search-btn">${ICONS.search}<span class="search-label">${ui.searchDocs}</span><kbd>⌘K</kbd></button>
<a class="hide-sm" href="${home}docs/introduction.html"${active === 'docs' ? ' aria-current="page"' : ''}>${ui.docs}</a>
<a class="hide-sm" href="${home}index.html#playground">${ui.playground}</a>
<a class="hide-sm" href="${home}docs/token-reference.html">${ui.tokens}</a>
${alternate ? `<a class="lang-switch" href="${alternate}" hreflang="${other.code}" lang="${other.code}">${ICONS.globe}<span>${other.name}</span></a>` : ''}
<button type="button" class="icon-btn theme-toggle" aria-label="${ui.switchTheme}">${ICONS.sun}${ICONS.moon}</button>
<a class="icon-btn" href="${REPO}" aria-label="GitHub repository">${ICONS.github}</a>
</nav>
</div>
</header>`;
}

function searchDialog(locale = LOCALES.en) {
  const ui = locale.ui;
  return `<dialog class="search-dialog" aria-label="${ui.searchDocs}">
<div class="search-field">${ICONS.search}<input type="search" placeholder="${ui.searchPlaceholder}" aria-label="${ui.searchDocs}" autocomplete="off" spellcheck="false"><kbd class="mono" style="font-size:11px">Esc</kbd></div>
<ul class="search-results" role="list"></ul>
</dialog>`;
}

function scripts(base, locale = LOCALES.en) {
  const index = locale.code === 'en' ? 'search-index.js' : `search-index.${locale.code}.js`;
  return `<script src="${base}assets/tokens-data.js"></script>
<script src="${base}assets/token-engine.js"></script>
<script src="${base}assets/${index}"></script>
<script src="${base}assets/site.js"></script>`;
}

function footer(home, locale = LOCALES.en) {
  const ui = locale.ui;
  return `<footer class="band"><div class="frame footer">
<span>react-native-strx · ${ui.license}</span>
<nav aria-label="Footer">
<a href="${home}docs/introduction.html">${ui.docs}</a>
<a href="${REPO}">GitHub</a>
<a href="https://www.npmjs.com/package/react-native-strx">npm</a>
<a href="${REPO}/blob/main/CHANGELOG.md">${ui.changelog}</a>
</nav>
</div></footer>`;
}

function docPage(page, pages, locale = LOCALES.en) {
  const ui = locale.ui;
  const dir = `${locale.prefix}docs`;
  const base = relativeTo(dir, '.').replace(/\/?$/, '/');
  const home = '../';
  const flat = NAV.flatMap(section => section.pages);
  const index = flat.indexOf(page.slug);
  const prev = pages.get(flat[index - 1]);
  const next = pages.get(flat[index + 1]);
  const section = NAV.find(item => item.pages.includes(page.slug));
  const sectionTitle = ui.sections[section.title] || section.title;
  const navTitle = target => ui.navTitles[target.slug] || target.meta.nav || target.meta.title;
  const other = locale.code === 'en' ? LOCALES.ko : LOCALES.en;
  const alternate = relativeTo(dir, `${other.prefix}docs/${page.slug}.html`);

  const sidebar = NAV.map(
    item =>
      `<h5>${escapeHtml(ui.sections[item.title] || item.title)}</h5><ul>` +
      item.pages
        .map(slug => {
          const target = pages.get(slug);
          if (!target) return '';
          const current = slug === page.slug ? ' aria-current="page"' : '';
          return `<li><a href="${slug}.html"${current}>${escapeHtml(navTitle(target))}</a></li>`;
        })
        .join('') +
      '</ul>',
  ).join('');

  const toc = page.headings.filter(heading => heading.depth <= 3);
  const tocHtml = toc.length
    ? `<h5>${ui.onThisPage}</h5><ul>${toc
        .map(heading => `<li><a class="depth-${heading.depth}" href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`)
        .join('')}</ul>`
    : '';

  const title = stripTags(renderInline(page.meta.title));
  const description = page.meta.description ? stripTags(renderInline(page.meta.description)) : pkg.description;
  const pagePath = `${dir}/${page.slug}.html`;
  const pageUrl = `${SITE_URL}${pagePath}`;
  const source = page.meta.include || page.source;
  const notice = page.fallback && ui.untranslated ? `<div class="callout lang-notice"><p>${ui.untranslated}</p></div>` : '';

  return `${head({
    title: `${title} · react-native-strx`,
    description,
    base,
    path: pagePath,
    type: 'article',
    locale,
    alternates: Object.fromEntries(
      Object.values(LOCALES).map(item => [item.code, `${item.prefix}docs/${page.slug}.html`]),
    ),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          headline: title,
          description,
          url: pageUrl,
          dateModified: BUILD_DATE,
          inLanguage: page.fallback ? 'en' : locale.code,
          isPartOf: { '@type': 'WebSite', name: 'react-native-strx', url: SITE_URL },
          about: { '@type': 'SoftwareSourceCode', name: 'react-native-strx', codeRepository: REPO },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'react-native-strx', item: `${SITE_URL}${locale.prefix}` },
            { '@type': 'ListItem', position: 2, name: sectionTitle, item: `${SITE_URL}${dir}/${section.pages[0]}.html` },
            { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
          ],
        },
      ],
    },
  })}
<body data-base="${base}">
<a class="sr-only" href="#main">${ui.skip}</a>
${topNav({ base, home, active: 'docs', withMenu: true, locale, alternate })}
<div class="docs">
<aside class="sidebar" aria-label="${ui.docs}">${sidebar}</aside>
<main class="content" id="main">
<article class="article"${page.fallback ? ' lang="en"' : ''}>
<p class="crumb">${escapeHtml(sectionTitle)}</p>
<h1>${renderInline(page.meta.title)}</h1>
${page.meta.description ? `<p class="description">${renderInline(page.meta.description)}</p>` : ''}
${notice}
${page.html}
<nav class="pager" aria-label="Pagination">
${prev ? `<a class="prev" href="${prev.slug}.html"><span>${ui.previous}</span>${escapeHtml(navTitle(prev))}</a>` : ''}
${next ? `<a class="next" href="${next.slug}.html"><span>${ui.next}</span>${escapeHtml(navTitle(next))}</a>` : ''}
</nav>
<p class="edit-link"><a href="${REPO}/edit/main/${source}">${ui.editPage}</a></p>
</article>
</main>
<aside class="toc" aria-label="${ui.onThisPage}">${tocHtml}</aside>
</div>
<div class="scrim"></div>
${searchDialog(locale)}
${scripts(base, locale)}
</body>
</html>
`;
}

// ------------------------------------------------------------- landing

const LANDING_COPY = {
  en: {
    title: 'react-native-strx — Tailwind-style animations for React Native',
    description:
      'Animate React Native with tokens like animate="fade-in layout-spring". Entrances, exits, style and layout transitions and timelines, powered by Reanimated 4.',
  },
  ko: {
    title: 'react-native-strx — React Native를 위한 Tailwind 스타일 애니메이션',
    description:
      'animate="fade-in layout-spring"처럼 토큰만 적으면 React Native 애니메이션이 완성돼요. 등장, 퇴장, 스타일·레이아웃 트랜지션, 타임라인까지 Reanimated 4로 움직여요.',
  },
};

function renderLanding(locale = LOCALES.en) {
  // The landing page sits at the language root: `index.html` or `ko/index.html`.
  const base = locale.prefix ? '../' : '';
  const home = '';
  const other = locale.code === 'en' ? LOCALES.ko : LOCALES.en;
  const alternate = `${base}${other.prefix}index.html`;
  const template = locale.code === 'en' ? 'templates/landing.html' : `templates/landing.${locale.code}.html`;
  let html = fs.readFileSync(path.join(SITE, template), 'utf8');

  html = html.replace(/<pre data-hl="(\w+)">([\s\S]*?)<\/pre>/g, (_, lang, code) =>
    codeBlock(
      code.replace(/^\n/, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
      lang,
      '',
      { file: template },
    ),
  );

  const presetRows = tokens.presets
    .map(
      preset =>
        `<tr><td>${tokenCode(preset.name, 'preset')}</td><td>${frame(preset.initial)}</td><td>${frame(preset.target)}</td><td>${escapeHtml(preset.motion)}</td></tr>`,
    )
    .join('');

  const replacements = {
    HEAD: head({
      title: LANDING_COPY[locale.code].title,
      description: LANDING_COPY[locale.code].description,
      base,
      path: locale.prefix,
      locale,
      alternates: Object.fromEntries(Object.values(LOCALES).map(item => [item.code, item.prefix])),
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'react-native-strx',
            url: SITE_URL,
          },
          {
            '@type': 'SoftwareSourceCode',
            name: 'react-native-strx',
            description: pkg.description,
            url: SITE_URL,
            inLanguage: locale.code,
            codeRepository: REPO,
            programmingLanguage: 'TypeScript',
            runtimePlatform: 'React Native',
            license: 'https://opensource.org/licenses/MIT',
            version: pkg.version,
            keywords: (pkg.keywords || []).join(', '),
          },
        ],
      },
    }),
    NAV: topNav({ base, home, active: 'home', withMenu: false, locale, alternate }),
    FOOTER: footer(home, locale),
    SEARCH: searchDialog(locale),
    SCRIPTS: scripts(base, locale),
    VERSION: escapeHtml(pkg.version),
    PRESET_ROWS: presetRows,
    ICON_ARROW: ICONS.arrow,
    ICON_COPY: ICONS.copy,
  };

  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in replacements)) {
      errors.push(`${template}: unknown placeholder ${match}`);
      return match;
    }
    return replacements[key];
  });
}

// ------------------------------------------------------------- build

function loadPages(locale = LOCALES.en) {
  const pages = new Map();
  const customPresets = [];

  for (const slug of NAV.flatMap(section => section.pages)) {
    const file = path.join(SITE, 'content', `${slug}.md`);
    const translated = locale.prefix ? path.join(SITE, 'content', locale.code, `${slug}.md`) : null;
    const useTranslation = translated && fs.existsSync(translated);

    if (!fs.existsSync(file)) {
      errors.push(`missing page website/content/${slug}.md`);
      continue;
    }

    const sourceFile = useTranslation ? translated : file;
    const parsed = parseFrontmatter(fs.readFileSync(sourceFile, 'utf8'));
    const { meta } = parsed;
    let { body } = parsed;

    if (meta.include) {
      // Pages such as the migration guide reuse a root Markdown file; its
      // own H1 is replaced by the page title.
      body = fs.readFileSync(path.join(ROOT, meta.include), 'utf8').replace(/^# .*\n/, '');
    }

    for (const match of body.matchAll(/definePreset\(\s*["']([a-z][a-z0-9-]*)["']/g)) {
      customPresets.push(match[1]);
    }

    pages.set(slug, {
      slug,
      meta,
      body,
      fallback: Boolean(locale.prefix) && !useTranslation,
      source: path.relative(ROOT, sourceFile),
    });
  }

  const contentDir = path.join(SITE, 'content', locale.prefix ? locale.code : '');
  for (const file of fs.readdirSync(contentDir)) {
    if (!file.endsWith('.md')) continue;
    if (!pages.has(file.replace(/\.md$/, ''))) {
      errors.push(`${path.relative(ROOT, path.join(contentDir, file))} is not listed in NAV`);
    }
  }

  for (const page of pages.values()) {
    if (!page.meta.title) errors.push(`${page.source}: missing title`);
    const rendered = renderMarkdown(page.body, {
      file: page.source,
      customPresets,
      lang: page.fallback ? 'en' : locale.code,
    });
    page.html = rendered.html;
    page.headings = rendered.headings;
  }

  return pages;
}

function searchIndex(pages, locale = LOCALES.en) {
  const dir = `${locale.prefix}docs`;
  const navTitle = page => locale.ui.navTitles[page.slug] || stripTags(renderInline(page.meta.title));
  const entries = [];

  for (const page of pages.values()) {
    const title = page.fallback ? navTitle(page) : stripTags(renderInline(page.meta.title));
    entries.push({
      title,
      page: page.meta.description && !page.fallback ? stripTags(renderInline(page.meta.description)) : title,
      url: `${dir}/${page.slug}.html`,
      text: '',
    });

    const sections = page.html.split(/(?=<h[23] id=")/);
    for (const section of sections) {
      const heading = /^<h[23] id="([^"]+)">([\s\S]*?)<\/h[23]>/.exec(section);
      if (!heading) continue;
      const text = stripTags(section.slice(heading[0].length)).replace(/\s+/g, ' ').trim().slice(0, 240);
      entries.push({ title: stripTags(heading[2]), page: title, url: `${dir}/${page.slug}.html#${heading[1]}`, text });
    }
  }

  return entries;
}

/**
 * Reference-table coloring: names in the first column, type unions split
 * into pills, and literal defaults.
 */
function colorCell(content, label, column) {
  if (column === 0) {
    return content.replace(/^<code>([^<]*)<\/code>/, '<code class="prop">$1</code>');
  }

  if (label === 'Type' || label === '타입') {
    return content.replace(/<code>([^<]*)<\/code>/g, (_, inner) => {
      const parts = inner.split(/\s+\|\s+/);
      const pills = parts.map(part => `<code class="ty">${part}</code>`).join('');
      return parts.length > 1 ? `<span class="ty-union">${pills}</span>` : pills;
    });
  }

  if (label === 'Default' || label === '기본값') {
    return content.replace(/<code>(-?\d[\d.]*|true|false)<\/code>/g, '<code class="num">$1</code>');
  }

  return content;
}

/**
 * Adds each column's header text to its cells as `data-label`, so phones can
 * show tables as labelled cards (see site.css).
 */
function labelTableCells(html) {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (table, inner) => {
    const head = /<thead>([\s\S]*?)<\/thead>/.exec(inner);

    if (!head) return table;

    const labels = [...head[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(match =>
      escapeHtml(stripTags(match[1]).trim()),
    );

    return table.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
      let index = 0;
      const labelled = cells.replace(/<td>([\s\S]*?)<\/td>/g, (_, content) => {
        const column = index;
        const label = labels[index++] ?? '';
        return `<td data-label="${label}"><div class="cell">${colorCell(content, label, column)}</div></td>`;
      });
      return `<tr>${labelled}</tr>`;
    });
  });
}

function checkLinks(files) {
  const ids = new Map();

  for (const [file, html] of files) {
    ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1])));
  }

  for (const [file, html] of files) {
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1];
      if (/^(https?:|mailto:)/.test(href)) continue;

      const [target, hash] = href.split('#');
      const resolved = target ? path.posix.normalize(path.posix.join(path.posix.dirname(file), target)) : file;

      if (/\.(css|png|js)$/.test(resolved)) {
        if (!fs.existsSync(path.join(OUT, resolved)) && !resolved.startsWith('assets/')) {
          errors.push(`${file}: broken asset link ${href}`);
        }
        continue;
      }

      if (!ids.has(resolved)) {
        errors.push(`${file}: broken link ${href}`);
      } else if (hash && !ids.get(resolved).has(hash)) {
        errors.push(`${file}: missing anchor ${href}`);
      }
    }
  }
}

function build() {
  const files = new Map();
  const indexes = new Map();
  const indexable = [];
  const first = NAV[0].pages[0];

  for (const locale of Object.values(LOCALES)) {
    const pages = loadPages(locale);
    const dir = `${locale.prefix}docs`;

    for (const page of pages.values()) {
      files.set(`${dir}/${page.slug}.html`, docPage(page, pages, locale));
      if (!page.fallback) indexable.push(`${dir}/${page.slug}.html`);
    }

    files.set(
      `${dir}/index.html`,
      `<!doctype html><meta charset="utf-8"><title>Documentation · react-native-strx</title><meta name="robots" content="noindex"><link rel="icon" href="${relativeTo(dir, 'assets/logo.png')}"><meta http-equiv="refresh" content="0; url=${first}.html"><link rel="canonical" href="${SITE_URL}${dir}/${first}.html"><a href="${first}.html" id="redirect">Documentation</a>`,
    );
    files.set(`${locale.prefix}index.html`, renderLanding(locale));
    indexable.push(locale.prefix);
    indexes.set(locale, searchIndex(pages, locale));
  }

  checkLinks(files);

  if (errors.length) {
    console.error(`Site build failed:\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

  for (const [file, html] of files) {
    fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
    fs.writeFileSync(path.join(OUT, file), labelTableCells(html));
  }

  for (const asset of fs.readdirSync(path.join(SITE, 'static'))) {
    fs.copyFileSync(path.join(SITE, 'static', asset), path.join(OUT, 'assets', asset));
  }

  fs.writeFileSync(path.join(OUT, 'assets/tokens-data.js'), `globalThis.STRX_TOKENS = ${JSON.stringify(tokens)};\n`);
  for (const [locale, entries] of indexes) {
    const name = locale.code === 'en' ? 'search-index.js' : `search-index.${locale.code}.js`;
    fs.writeFileSync(path.join(OUT, 'assets', name), `window.STRX_SEARCH = ${JSON.stringify(entries)};\n`);
  }
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

  fs.writeFileSync(
    path.join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
      .map(item => `  <url><loc>${SITE_URL}${item}</loc><lastmod>${BUILD_DATE}</lastmod></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);

  if (process.env.SITE_CNAME) {
    fs.writeFileSync(path.join(OUT, 'CNAME'), `${process.env.SITE_CNAME}\n`);
  }
  fs.writeFileSync(
    path.join(OUT, '404.html'),
    `${head({ title: 'Not found · react-native-strx', description: pkg.description, base: SITE_URL, noindex: true })}<body data-base="${SITE_URL}">${topNav({ base: SITE_URL, active: '', withMenu: false })}<main class="frame cta"><h1 class="h-section">Page not found</h1><p>That page doesn't exist. Try the <a href="${SITE_URL}docs/introduction.html">documentation</a>.</p></main>${searchDialog()}${scripts(SITE_URL)}</body></html>`,
  );

  console.log(`Built ${files.size} pages into ${path.relative(ROOT, OUT)}/`);
}

build();
