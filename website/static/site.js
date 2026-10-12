/*
 * react-native-strx documentation site: theme, navigation, search, and the
 * interactive previews. Previews use the Web Animations API and the same
 * easing curves and token data as the library, so a token string plays here
 * the way it plays on a device.
 */
(function () {
  'use strict';

  var T = window.StrxTokens;
  var root = document.documentElement;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* UI text for the page's language; English strings are the keys. */
  var LANG = (root.getAttribute('lang') || 'en').slice(0, 2);
  var MESSAGES = {
    ko: {
      'Switch to light mode': '라이트 모드로 전환',
      'Switch to dark mode': '다크 모드로 전환',
      'Copy code': '코드 복사',
      Replay: '다시 재생',
      Unmount: '언마운트',
      Mount: '마운트',
      'Play exit': '퇴장 재생',
      'animate tokens': 'animate 토큰',
      'Each dot runs duration-900 with its easing token.': '점마다 duration-900 동안 각자의 이징으로 움직여요.',
      'Simulated with the same damping / stiffness / mass the tokens set.': '토큰에 적은 damping / stiffness / mass 값 그대로 움직여요.',
      Active: '활성',
      Inactive: '비활성',
      'Toggle style': '스타일 바꾸기',
      'Click twice quickly: it reverses from where it is.': '빠르게 두 번 눌러 보세요. 지금 위치에서 바로 되돌아가요.',
      'Press and hold': '길게 눌러 보세요',
      'Focus me': '여기를 눌러 보세요',
      'Example input': '예시 입력창',
      Expand: '펼치기',
      Collapse: '접기',
      'Remove item': '항목 삭제',
      Item: '항목',
      'Add item': '항목 추가',
      Shuffle: '섞기',
      entry: '항목',
      'starts at': '시작 시점',
      'Transfer complete': '송금 완료',
      Done: '확인',
      idle: '대기 중',
      'idle — press play()': '대기 중 — play()를 눌러 보세요',
      'reset() → back to from frames': 'reset() → from 프레임으로 돌아감',
      'reverse() → from the current position': 'reverse() → 현재 위치에서 되감기',
      'stop() → frozen in place': 'stop() → 그 자리에서 멈춤',
      'Reduce Motion: off': '동작 줄이기: 끔',
      'Reduce Motion: on': '동작 줄이기: 켬',
      'layout-* animates size and position changes; see the layout demo.': 'layout-* 토큰은 크기와 위치가 바뀔 때 움직여요. 레이아웃 데모에서 확인해 보세요.',
      'transition-* animates later style changes, not the entrance.': 'transition-* 토큰은 등장할 때가 아니라 나중에 스타일이 바뀔 때 움직여요.',
    },
  };

  function t(text) {
    var table = MESSAGES[LANG];
    return (table && table[text]) || text;
  }

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);

    Object.keys(attrs || {}).forEach(function (key) {
      if (key === 'text') node.textContent = attrs[key];
      else if (key === 'html') node.innerHTML = attrs[key];
      else if (key.slice(0, 2) === 'on') node.addEventListener(key.slice(2), attrs[key]);
      else node.setAttribute(key, attrs[key]);
    });

    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });

    return node;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------ Theme */

  function storedTheme() {
    try {
      return localStorage.getItem('strx-theme');
    } catch (error) {
      return null;
    }
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);

    if (persist) {
      try {
        localStorage.setItem('strx-theme', theme);
      } catch (error) {
        /* storage unavailable */
      }
    }

    $all('.theme-toggle').forEach(function (button) {
      button.setAttribute('aria-label', theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode'));
    });
  }

  setTheme(root.getAttribute('data-theme') || 'light', false);

  $all('.theme-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (event) {
    if (!storedTheme()) setTheme(event.matches ? 'dark' : 'light', false);
  });

  /* ------------------------------------------------------------ Copy */

  var COPY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>';
  var CHECK_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>';

  function copyText(text, button) {
    function done() {
      button.innerHTML = CHECK_ICON;
      button.classList.add('copied');
      setTimeout(function () {
        button.innerHTML = COPY_ICON;
        button.classList.remove('copied');
      }, 1400);
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(done, function () {});
    }
  }

  $all('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      copyText(button.getAttribute('data-copy'), button);
    });
  });

  /** Text of a code block as shown: the visible variant, without line numbers. */
  function codeText(block) {
    var pre = $('pre:not([hidden])', block) || $('pre', block);
    var lines = $all('.line', pre);

    if (!lines.length) return pre.textContent;

    return lines
      .map(function (line) {
        var number = $('.ln', line);
        return line.textContent.slice(number ? number.textContent.length : 0);
      })
      .join('\n');
  }

  $all('.codeblock').forEach(function (block) {
    var button = el('button', {
      type: 'button',
      class: 'icon-btn copy-code',
      'aria-label': t('Copy code'),
      html: COPY_ICON,
    });
    button.addEventListener('click', function () {
      copyText(codeText(block), button);
    });
    block.appendChild(button);
  });

  /* Package manager tabs on install commands; the choice is remembered. */
  var pmBlocks = $all('[data-pm-block]');

  function showPackageManager(name) {
    pmBlocks.forEach(function (block) {
      $all('.pm-tab', block).forEach(function (tab) {
        tab.setAttribute('aria-pressed', tab.getAttribute('data-pm') === name ? 'true' : 'false');
      });
      $all('pre[data-pm]', block).forEach(function (pre) {
        pre.hidden = pre.getAttribute('data-pm') !== name;
      });
    });
  }

  if (pmBlocks.length) {
    try {
      var savedPm = localStorage.getItem('strx-pm');
      if (savedPm === 'npm' || savedPm === 'yarn' || savedPm === 'pnpm') showPackageManager(savedPm);
    } catch (error) {
      /* storage unavailable */
    }

    pmBlocks.forEach(function (block) {
      $all('.pm-tab', block).forEach(function (tab) {
        tab.addEventListener('click', function () {
          var name = tab.getAttribute('data-pm');
          showPackageManager(name);
          try {
            localStorage.setItem('strx-pm', name);
          } catch (error) {
            /* storage unavailable */
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------ Docs nav */

  var menuButton = $('.menu-btn');
  var scrim = $('.scrim');

  function closeNav() {
    document.body.classList.remove('nav-open');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
  }

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      var open = !document.body.classList.contains('nav-open');
      document.body.classList.toggle('nav-open', open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  if (scrim) scrim.addEventListener('click', closeNav);

  // Bring the current page's link into view inside the sidebar only.
  // scrollIntoView() would also scroll the window, so pages listed low in
  // the sidebar would open scrolled down instead of at the top.
  var sidebarNav = $('.sidebar');
  var current = $('.sidebar a[aria-current="page"]');
  if (sidebarNav && current) {
    var linkTop = current.getBoundingClientRect().top - sidebarNav.getBoundingClientRect().top + sidebarNav.scrollTop;
    sidebarNav.scrollTop = Math.max(0, linkTop - sidebarNav.clientHeight / 2);
  }

  var tocLinks = $all('.toc a');

  if (tocLinks.length && 'IntersectionObserver' in window) {
    var headings = tocLinks
      .map(function (link) {
        return document.getElementById(link.getAttribute('href').slice(1));
      })
      .filter(Boolean);
    var visible = {};

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });

        var active = headings.filter(function (heading) {
          return visible[heading.id];
        })[0];

        if (!active) return;

        tocLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + active.id);
        });
      },
      { rootMargin: '-60px 0px -60% 0px' },
    );

    headings.forEach(function (heading) {
      observer.observe(heading);
    });
  }

  /* ------------------------------------------------------------ Search */

  var dialog = $('.search-dialog');

  if (dialog && window.STRX_SEARCH) {
    var input = $('input', dialog);
    var list = $('.search-results', dialog);
    var base = document.body.getAttribute('data-base') || '';
    var activeIndex = 0;

    function render() {
      var query = input.value.trim().toLowerCase();
      var terms = query.split(/\s+/).filter(Boolean);
      var results = window.STRX_SEARCH.filter(function (entry) {
        var haystack = (entry.title + ' ' + entry.page + ' ' + entry.text).toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) >= 0;
        });
      });

      results.sort(function (a, b) {
        var aTitle = a.title.toLowerCase().indexOf(query) >= 0 ? 0 : 1;
        var bTitle = b.title.toLowerCase().indexOf(query) >= 0 ? 0 : 1;
        return aTitle - bTitle;
      });

      results = results.slice(0, terms.length ? 12 : 8);
      activeIndex = 0;

      if (!results.length) {
        list.innerHTML =
          '<li class="search-empty">' +
          (LANG === 'ko'
            ? '“' + escapeHtml(input.value) + '”에 대한 검색 결과가 없어요'
            : 'No results for “' + escapeHtml(input.value) + '”') +
          '</li>';
        return;
      }

      list.innerHTML = results
        .map(function (entry, index) {
          return (
            '<li><a href="' + base + entry.url + '"' + (index === 0 ? ' class="active"' : '') + '>' +
            escapeHtml(entry.title) + '<span>' + escapeHtml(entry.page) + '</span></a></li>'
          );
        })
        .join('');
    }

    function open() {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      input.value = '';
      render();
      input.focus();
    }

    $all('.search-btn').forEach(function (button) {
      button.addEventListener('click', open);
    });

    document.addEventListener('keydown', function (event) {
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName))) {
        event.preventDefault();
        open();
      }
    });

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (event) {
      var links = $all('a', list);

      if (!links.length) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        links[activeIndex].classList.remove('active');
        activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links[activeIndex].classList.add('active');
        links[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        window.location.href = links[activeIndex].href;
      }
    });

    list.addEventListener('click', function (event) {
      if (event.target.closest('a')) dialog.close();
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  /* ------------------------------------------------------------ Motion core */

  var EASING_CSS = {
    linear: 'linear',
    ease: 'cubic-bezier(0.333, 0, 0.667, 1)',
    'ease-in': 'cubic-bezier(0.32, 0, 0.67, 0)',
    'ease-out': 'cubic-bezier(0.33, 1, 0.68, 1)',
    'ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
  };

  function frameStyle(values) {
    var style = {};
    var transform = [];

    if ('opacity' in values) style.opacity = values.opacity;
    if (values.translateX || values.translateY) {
      transform.push('translate(' + (values.translateX || 0) + 'px, ' + (values.translateY || 0) + 'px)');
    }
    if ('scale' in values) transform.push('scale(' + values.scale + ')');
    if ('scaleX' in values) transform.push('scaleX(' + values.scaleX + ')');
    if ('scaleY' in values) transform.push('scaleY(' + values.scaleY + ')');
    if (values.rotate) transform.push('rotate(' + values.rotate + 'deg)');
    style.transform = transform.length ? transform.join(' ') : 'none';
    if (values.width != null) style.width = values.width + 'px';
    if (values.height != null) style.height = values.height + 'px';

    return style;
  }

  /**
   * Samples per-channel motion into WAAPI keyframes. `channels` maps a style
   * key to { from, to, curve, delay, play }.
   */
  function sampleChannels(channels, reduce) {
    var keys = Object.keys(channels);
    var total = 0;
    var infinite = false;

    keys.forEach(function (key) {
      var channel = channels[key];
      if (reduce) {
        channel.delay = 0;
        channel.play = 1;
      }
      if (channel.play === Infinity) infinite = true;
      var plays = channel.play === Infinity ? 1 : channel.play;
      total = Math.max(total, channel.delay + channel.curve.duration * plays);
    });

    if (reduce || total === 0) {
      var end = {};
      keys.forEach(function (key) {
        end[key] = channels[key].to;
      });
      return { keyframes: [frameStyle(end), frameStyle(end)], duration: 1, infinite: false };
    }

    var steps = Math.max(2, Math.min(240, Math.ceil(total / 16)));
    var keyframes = [];

    for (var i = 0; i <= steps; i += 1) {
      var time = (i / steps) * total;
      var values = {};

      keys.forEach(function (key) {
        var channel = channels[key];
        var local = time - channel.delay;
        var duration = channel.curve.duration;
        var plays = channel.play === Infinity ? 1 : channel.play;
        var progress;

        if (local <= 0) progress = 0;
        else if (local >= duration * plays) progress = 1;
        else progress = channel.curve.at(local % duration);

        if (channel.from == null || channel.to == null) return;
        values[key] = channel.from + (channel.to - channel.from) * progress;
      });

      var frame = frameStyle(values);
      frame.offset = i / steps;
      keyframes.push(frame);
    }

    return { keyframes: keyframes, duration: total, infinite: infinite };
  }

  var EXIT_CHANNELS = ['opacity', 'translateX', 'translateY', 'scale'];

  function channelsFor(resolved, kind) {
    var channels = {};

    resolved.groups.forEach(function (group) {
      if (kind === 'exit') {
        // Mirrors src/core/exit.ts: opacity, translate and scale only, from
        // neutral values, 300ms and `ease` unless the group sets its own.
        var explicit = group.explicit || {};
        var exitCurve = T.curveFor({
          driver: 'timing',
          duration: explicit.duration != null ? explicit.duration : 300,
          easing: explicit.easing && explicit.easing !== 'spring' ? explicit.easing : 'ease',
        });
        var keys = Object.keys(group.exit).filter(function (key) {
          return EXIT_CHANNELS.indexOf(key) >= 0;
        });

        if (!keys.length) return;

        EXIT_CHANNELS.forEach(function (key) {
          channels[key] = {
            from: T.neutral[key],
            to: key in group.exit ? group.exit[key] : T.neutral[key],
            curve: exitCurve,
            delay: explicit.delay || 0,
            play: 1,
          };
        });
        return;
      }

      var curve = T.curveFor(group.timing);

      Object.keys(group.from).forEach(function (key) {
        channels[key] = {
          from: group.from[key],
          to: group.to[key],
          curve: curve,
          delay: group.timing.delay,
          play: group.timing.play,
        };
      });
    });

    return channels;
  }

  function runningAnimations(node) {
    if (!node.__strx) node.__strx = [];
    return node.__strx;
  }

  function cancel(node) {
    runningAnimations(node).forEach(function (animation) {
      animation.cancel();
    });
    node.__strx = [];
  }

  /** Plays an animate string's enter (or exit) motion on a DOM node. */
  function playAnimate(node, input, options) {
    options = options || {};
    var resolved = typeof input === 'string' ? T.resolve(input) : input;
    var sampled = sampleChannels(channelsFor(resolved, options.kind || 'enter'), options.reduce);

    cancel(node);

    if (!sampled.keyframes.length || !node.animate) {
      if (options.onFinish) options.onFinish();
      return null;
    }

    var animation = node.animate(sampled.keyframes, {
      duration: sampled.duration,
      easing: 'linear',
      fill: 'both',
      iterations: sampled.infinite ? Infinity : 1,
    });

    runningAnimations(node).push(animation);
    if (options.onFinish) animation.onfinish = options.onFinish;

    return animation;
  }

  /** Spring keyframes for a single CSS property between two values. */
  function springKeyframes(property, from, to, params, unit) {
    var spring = T.springCurve(params.damping, params.stiffness, params.mass);
    var steps = Math.max(2, Math.ceil(spring.duration / 16));
    var frames = [];

    for (var i = 0; i <= steps; i += 1) {
      var p = spring.at((i / steps) * spring.duration);
      var frame = { offset: i / steps };
      frame[property] = from + (to - from) * p + (unit || 'px');
      frames.push(frame);
    }

    return { frames: frames, duration: spring.duration };
  }

  var LAYOUT = {};
  T.data.layout.forEach(function (layout) {
    var spring = /damping ([\d.]+), stiffness ([\d.]+), mass ([\d.]+)/.exec(layout.motion);
    LAYOUT[layout.token] = spring
      ? { damping: Number(spring[1]), stiffness: Number(spring[2]), mass: Number(spring[3]) }
      : null;
  });

  /** FLIP-animates an element's box change, like a Reanimated layout transition. */
  function animateLayout(nodes, mutate, token, duration) {
    var before = nodes().map(function (node) {
      return { node: node, rect: node.getBoundingClientRect() };
    });

    mutate();

    before.forEach(function (item) {
      if (!item.node.isConnected) return;

      var after = item.node.getBoundingClientRect();
      var dx = item.rect.left - after.left;
      var dy = item.rect.top - after.top;
      var dw = item.rect.width;
      var dh = item.rect.height;

      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(dw - after.width) < 0.5 && Math.abs(dh - after.height) < 0.5) {
        return;
      }

      var spring = LAYOUT[token];
      var frames = [];
      var total;

      if (reduceQuery.matches) return;

      if (spring) {
        var curve = T.springCurve(spring.damping, spring.stiffness, spring.mass);
        total = curve.duration;
        var steps = Math.ceil(total / 16);
        for (var i = 0; i <= steps; i += 1) {
          var p = curve.at((i / steps) * total);
          frames.push({
            offset: i / steps,
            transform: 'translate(' + dx * (1 - p) + 'px,' + dy * (1 - p) + 'px)',
            width: dw + (after.width - dw) * p + 'px',
            height: dh + (after.height - dh) * p + 'px',
          });
        }
      } else {
        total = duration || 300;
        frames = [
          { transform: 'translate(' + dx + 'px,' + dy + 'px)', width: dw + 'px', height: dh + 'px', opacity: token === 'layout-fade' ? 0 : 1 },
          { transform: 'none', width: after.width + 'px', height: after.height + 'px', opacity: 1 },
        ];
      }

      item.node.animate(frames, {
        duration: total,
        easing: spring ? 'linear' : 'cubic-bezier(0.45, 0, 0.55, 1)',
        fill: 'none',
      });
    });
  }

  /* ------------------------------------------------------------ Token rendering */

  function tokenChips(input) {
    return T.split(input)
      .map(function (group, index) {
        return (
          (index > 0 ? '<span class="tok-sep">,</span>' : '') +
          group
            .map(function (token) {
              return '<span class="tok ' + T.classify(token) + '">' + escapeHtml(token) + '</span>';
            })
            .join('')
        );
      })
      .join('');
  }

  function highlightAnimate(input) {
    return input
      .split(/(\s+|,)/)
      .map(function (part) {
        if (!part.trim() || part === ',') return escapeHtml(part);
        var kind = T.classify(part);
        return kind === 'invalid'
          ? '<span class="squiggle">' + escapeHtml(part) + '</span>'
          : '<span class="tk-' + kind + '">' + escapeHtml(part) + '</span>';
      })
      .join('');
  }

  function messagesFor(resolved, onFix) {
    var box = document.createDocumentFragment();

    resolved.invalid.forEach(function (item) {
      var line = el('div', { class: 'warn' });

      if (item.reason === 'second-preset') {
        line.textContent =
          LANG === 'ko'
            ? '“' + item.token + '”는 건너뛰었어요. 그룹마다 프리셋은 하나만 쓸 수 있어요. 쉼표로 나눠 주세요. 예: “fade-in, ' + item.token + '”'
            : '“' + item.token + '” ignored: one preset per group. Use a comma, e.g. “fade-in, ' + item.token + '”.';
      } else {
        line.appendChild(document.createTextNode((LANG === 'ko' ? '알 수 없는 토큰 “' : 'Unknown token “') + item.token + '”'));
        if (item.suggestion) {
          line.appendChild(document.createTextNode(LANG === 'ko' ? ' — 혹시 ' : ' — did you mean '));
          var fix = el('button', { type: 'button', text: item.suggestion });
          fix.addEventListener('click', function () {
            onFix(item.token, item.suggestion);
          });
          line.appendChild(fix);
          line.appendChild(document.createTextNode(LANG === 'ko' ? '인가요?' : '?'));
        }
      }

      box.appendChild(line);
    });

    var notes = {};
    resolved.notes.forEach(function (note) {
      notes[note] = true;
    });
    if (notes.layout) box.appendChild(el('div', { text: t('layout-* animates size and position changes; see the layout demo.') }));
    if (notes.transition) box.appendChild(el('div', { text: t('transition-* animates later style changes, not the entrance.') }));

    return box;
  }

  /* ------------------------------------------------------------ Playground */

  function setupPlayground(container) {
    var input = $('.pg-input', container);
    var chipsBox = $('.pg-tokens', container);
    var messages = $('.pg-messages', container);
    var code = $('.pg-code', container);
    var target = $('.demo-card', container);
    var exited = false;

    function replay() {
      var value = input.value;
      var resolved = T.resolve(value);

      chipsBox.innerHTML = tokenChips(value);
      messages.innerHTML = '';
      messages.appendChild(
        messagesFor(resolved, function (bad, good) {
          input.value = input.value.replace(bad, good);
          sync();
          replay();
        }),
      );
      if (code) code.innerHTML = highlightAnimate(value);
      target.style.visibility = '';
      exited = false;
      playAnimate(target, resolved, { reduce: reduceQuery.matches });
    }

    function sync() {
      var tokens = input.value.split(/[\s,]+/);
      $all('.chip[data-token]', container).forEach(function (chip) {
        chip.setAttribute('aria-pressed', tokens.indexOf(chip.getAttribute('data-token')) >= 0 ? 'true' : 'false');
      });
    }

    $all('.chip[data-token]', container).forEach(function (chip) {
      chip.addEventListener('click', function () {
        var token = chip.getAttribute('data-token');
        var group = chip.getAttribute('data-group');
        var groups = T.split(input.value);
        var first = groups[0] || [];
        var active = first.indexOf(token) >= 0;

        if (active && chip.hasAttribute('data-toggle')) {
          first = first.filter(function (item) {
            return item !== token;
          });
        } else if (!active) {
          first = first.filter(function (item) {
            var kind = T.classify(item);
            if (group === 'preset') return kind !== 'preset';
            if (group === 'duration') return !/^duration-/.test(item);
            if (group === 'delay') return !/^delay-/.test(item);
            if (group === 'easing') return !(T.data.easings.some(function (easing) { return easing.token === item; }) || item === 'spring');
            return true;
          });
          if (!(group === 'delay' && token === 'delay-0')) first.push(token);
        }

        groups[0] = first;
        input.value = groups
          .map(function (tokens) {
            return tokens.join(' ');
          })
          .join(', ');
        sync();
        replay();
      });
    });

    var timer;
    input.addEventListener('input', function () {
      sync();
      clearTimeout(timer);
      timer = setTimeout(replay, 350);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') replay();
    });

    $all('[data-action="replay"]', container).forEach(function (button) {
      button.addEventListener('click', replay);
    });

    $all('[data-action="exit"]', container).forEach(function (button) {
      button.addEventListener('click', function () {
        if (exited) {
          replay();
          return;
        }

        var resolved = T.resolve(input.value);
        var hasExit = resolved.groups.some(function (group) {
          return Object.keys(group.exit).length > 0;
        });

        exited = true;

        if (!hasExit) {
          cancel(target);
          target.style.visibility = 'hidden';
          return;
        }

        playAnimate(target, resolved, {
          kind: 'exit',
          reduce: reduceQuery.matches,
          onFinish: function () {
            target.style.visibility = 'hidden';
          },
        });
      });
    });

    sync();
    replay();
  }

  $all('[data-playground]').forEach(setupPlayground);

  /* ------------------------------------------------------------ Doc demos */

  function demoShell(container, stage, bar) {
    container.classList.add('demo');
    container.appendChild(stage);
    if (bar) container.appendChild(bar);
  }

  function replayButton(label, onClick) {
    return el('button', {
      type: 'button',
      class: 'ghost',
      onclick: onClick,
      html:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 3v6h6"></path></svg>' +
        escapeHtml(t(label || 'Replay')),
    });
  }

  var demos = {};

  /** One box, a set of animate strings to switch between. */
  demos.tokens = function (container) {
    var options = container.getAttribute('data-options').split('|');
    var exit = container.hasAttribute('data-exit');
    var current = options[0];
    var box = el('div', { class: 'box' });
    var stage = el('div', { class: 'demo-stage' }, [box]);
    var chips = el('div', { class: 'pg-chips' });
    var code = el('code', {});
    var bar = el('div', { class: 'demo-bar' }, [chips]);
    var gone = false;

    function play() {
      gone = false;
      box.style.visibility = '';
      code.innerHTML = 'animate="' + highlightAnimate(current) + '"';
      playAnimate(box, current, { reduce: reduceQuery.matches });
    }

    options.forEach(function (option) {
      var chip = el('button', { type: 'button', class: 'chip', text: option, 'aria-pressed': option === current ? 'true' : 'false' });
      chip.addEventListener('click', function () {
        current = option;
        $all('.chip', chips).forEach(function (other) {
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        play();
      });
      chips.appendChild(chip);
    });

    var footer = el('div', { class: 'demo-bar' }, [el('span', { class: 'grow' }, [code])]);

    if (exit) {
      var exitButton = el('button', { type: 'button', class: 'ghost', text: t('Unmount') });
      exitButton.addEventListener('click', function () {
        if (gone) {
          exitButton.textContent = t('Unmount');
          play();
          return;
        }
        gone = true;
        exitButton.textContent = t('Mount');
        playAnimate(box, current, {
          kind: 'exit',
          reduce: reduceQuery.matches,
          onFinish: function () {
            box.style.visibility = 'hidden';
          },
        });
      });
      footer.appendChild(exitButton);
    }

    footer.appendChild(replayButton('Replay', play));
    demoShell(container, stage, bar);
    container.appendChild(footer);
    if (options.length < 2) bar.remove();
    play();
  };

  /** Editable sandbox: type any token string. */
  demos.sandbox = function (container) {
    var initial = container.getAttribute('data-animate') || 'fade-in from:translate-y-16';
    var input = el('input', { class: 'pg-input', value: initial, 'aria-label': t('animate tokens'), spellcheck: 'false', autocomplete: 'off' });
    var tokens = el('div', { class: 'pg-tokens' });
    var messages = el('div', { class: 'pg-messages' });
    var box = el('div', { class: 'box' });
    var stage = el('div', { class: 'demo-stage' }, [box]);
    var bar = el('div', { class: 'demo-bar', style: 'flex-direction: column; align-items: stretch' }, [input, tokens, messages]);

    function play() {
      var resolved = T.resolve(input.value);
      tokens.innerHTML = tokenChips(input.value);
      messages.innerHTML = '';
      messages.appendChild(
        messagesFor(resolved, function (bad, good) {
          input.value = input.value.replace(bad, good);
          play();
        }),
      );
      box.style.visibility = '';
      playAnimate(box, resolved, { reduce: reduceQuery.matches });
    }

    var timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(play, 350);
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') play();
    });

    var row = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, [
      replayButton('Replay', play),
      el('button', {
        type: 'button',
        class: 'ghost',
        text: t('Play exit'),
        onclick: function () {
          playAnimate(box, input.value, { kind: 'exit', reduce: reduceQuery.matches });
        },
      }),
    ]);
    bar.appendChild(row);
    demoShell(container, stage, bar);
    play();
  };

  /** Easing curves side by side. */
  demos.easing = function (container) {
    var grid = el('div', { class: 'curve-grid' });
    var dots = [];
    var names = (container.getAttribute('data-options') || 'linear|ease|ease-in|ease-out|ease-in-out').split('|');

    names.forEach(function (name) {
      var fn = T.easings[name];
      var points = [];
      for (var i = 0; i <= 40; i += 1) {
        var t = i / 40;
        points.push((t * 100).toFixed(1) + ',' + (60 - fn(t) * 60).toFixed(1));
      }
      var dot = el('div', { class: 'dot' });
      dots.push({ dot: dot, name: name });
      grid.appendChild(
        el('div', { class: 'curve' }, [
          el('span', { text: name }),
          el('div', {
            html:
              '<svg viewBox="-2 -4 104 68" aria-hidden="true"><path d="M0 60H100M0 0V60" stroke="var(--line-strong)" fill="none" stroke-width="1"/><polyline points="' +
              points.join(' ') +
              '" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          }),
          el('div', { class: 'track' }, [dot]),
        ]),
      );
    });

    function play() {
      dots.forEach(function (item) {
        var width = item.dot.parentNode.clientWidth - 14;
        playAnimate(item.dot, {
          groups: [
            {
              from: { translateX: 0 },
              to: { translateX: width },
              exit: {},
              timing: { driver: 'timing', duration: 900, delay: 0, easing: item.name, play: 1 },
            },
          ],
        }, { reduce: reduceQuery.matches });
      });
    }

    var stage = el('div', { class: 'demo-stage' }, [grid]);
    var bar = el('div', { class: 'demo-bar' }, [
      el('span', { class: 'grow', text: t('Each dot runs duration-900 with its easing token.') }),
      replayButton('Replay', play),
    ]);
    demoShell(container, stage, bar);
    play();
  };

  /** Spring parameter comparison lanes. */
  demos.springs = function (container) {
    var configs = container
      .getAttribute('data-options')
      .split('|')
      .map(function (option) {
        return option.trim();
      });
    var lanes = el('div', { class: 'lanes' });
    var boxes = [];

    configs.forEach(function (config) {
      var box = el('div', { class: 'box sm' });
      boxes.push({ box: box, config: config });
      lanes.appendChild(
        el('div', { class: 'lane' }, [
          el('span', { text: config.replace(/^spring /, '') || 'spring' }),
          el('div', { class: 'lane-track' }, [box]),
        ]),
      );
    });

    function play() {
      boxes.forEach(function (item) {
        var resolved = T.resolve(item.config);
        var group = resolved.groups[0];
        var width = item.box.parentNode.clientWidth - 40;
        group.from = { translateX: 0 };
        group.to = { translateX: width };
        group.timing.driver = 'spring';
        playAnimate(item.box, resolved, { reduce: reduceQuery.matches });
      });
    }

    var stage = el('div', { class: 'demo-stage' }, [lanes]);
    var bar = el('div', { class: 'demo-bar' }, [
      el('span', { class: 'grow', text: t('Simulated with the same damping / stiffness / mass the tokens set.') }),
      replayButton('Replay', play),
    ]);
    demoShell(container, stage, bar);
    play();
  };

  /** transition-* style changes, interruptible. */
  demos.transition = function (container) {
    var variant = container.getAttribute('data-variant') || 'all';
    var on = false;
    var easing = EASING_CSS['ease-out'];
    var target;
    var trigger;
    var stage = el('div', { class: 'demo-stage' });
    var code = el('code', {});

    function apply() {
      if (variant === 'all') {
        target.style.width = on ? '220px' : '120px';
        target.style.backgroundColor = on ? 'var(--t-key)' : 'var(--accent)';
        target.style.transform = on ? 'scale(1)' : 'scale(0.92)';
        target.style.opacity = on ? '1' : '0.6';
        code.innerHTML = 'animate="' + highlightAnimate('transition-all duration-300') + '" style={{ width: ' + (on ? 220 : 120) + ', … }}';
      } else if (variant === 'colors') {
        target.style.backgroundColor = on ? 'var(--t-trans)' : 'var(--t-exit)';
        target.textContent = on ? t('Active') : t('Inactive');
        target.style.color = '#fff';
        code.innerHTML = 'animate="' + highlightAnimate('transition-colors duration-250') + '" backgroundColor: ' + (on ? 'green' : 'red');
      }
    }

    if (variant === 'all') {
      target = el('div', { style: 'height:56px;border-radius:14px;transition:width 300ms ' + easing + ',background-color 300ms ' + easing + ',transform 300ms ' + easing + ',opacity 300ms ' + easing });
    } else {
      target = el('div', { class: 'switch-btn', style: 'display:flex;align-items:center;justify-content:center;transition:background-color 250ms ' + easing });
    }

    trigger = el('button', {
      type: 'button',
      class: 'ghost',
      text: t('Toggle style'),
      'aria-pressed': 'false',
      onclick: function () {
        on = !on;
        trigger.setAttribute('aria-pressed', on ? 'true' : 'false');
        apply();
      },
    });

    stage.appendChild(target);
    stage.appendChild(trigger);
    apply();
    demoShell(container, stage, el('div', { class: 'demo-bar' }, [el('span', { class: 'grow' }, [code]), el('span', { text: t('Click twice quickly: it reverses from where it is.') })]));
  };

  /** Pressable scale on press with transition-transform. */
  demos.pressable = function (container) {
    var button = el('button', {
      type: 'button',
      class: 'btn',
      text: t('Press and hold'),
      style: 'transition: transform 150ms ' + EASING_CSS['ease-out'] + ', background-color 150ms',
    });
    function down() {
      button.style.transform = 'scale(0.96)';
    }
    function up() {
      button.style.transform = 'scale(1)';
    }
    button.addEventListener('pointerdown', down);
    button.addEventListener('pointerup', up);
    button.addEventListener('pointerleave', up);
    button.addEventListener('keydown', function (event) {
      if (event.key === ' ' || event.key === 'Enter') down();
    });
    button.addEventListener('keyup', up);
    var code = el('code', { html: 'animate="' + highlightAnimate('transition-transform duration-150') + '" style={({ pressed }) => …}' });
    demoShell(container, el('div', { class: 'demo-stage' }, [button]), el('div', { class: 'demo-bar' }, [code]));
  };

  /** TextInput focus ring with transition-colors. */
  demos.focus = function (container) {
    var input = el('input', {
      class: 'demo-input',
      placeholder: t('Focus me'),
      'aria-label': t('Example input'),
      style: 'transition: border-color 200ms ' + EASING_CSS['ease-out'],
    });
    input.addEventListener('focus', function () {
      input.style.borderColor = 'var(--accent)';
    });
    input.addEventListener('blur', function () {
      input.style.borderColor = '';
    });
    var code = el('code', { html: 'animate="' + highlightAnimate('transition-colors duration-200') + '"' });
    demoShell(container, el('div', { class: 'demo-stage' }, [input]), el('div', { class: 'demo-bar' }, [code]));
  };

  /** Expand / collapse with a layout token. */
  demos.layout = function (container) {
    var tokens = (container.getAttribute('data-options') || 'layout-spring|layout-linear|layout-spring-bouncy|layout-spring-stiff|layout-fade').split('|');
    var token = tokens[0];
    var open = false;
    var extra = el('div', { style: 'display:none;flex-direction:column;gap:8px' }, [
      el('div', { class: 'bar', style: 'width:90%' }),
      el('div', { class: 'bar', style: 'width:80%' }),
      el('div', { class: 'bar', style: 'width:70%' }),
      el('div', { class: 'bar', style: 'width:85%' }),
    ]);
    var card = el('div', { class: 'expander' }, [el('div', { class: 'bar head' }), el('div', { class: 'bar', style: 'width:75%' }), extra]);
    var below = el('div', { class: 'row-item', style: 'width:260px' }, [el('i', {}), el('b', {})]);
    var toggle = el('button', { type: 'button', class: 'ghost', text: t('Expand'), 'aria-expanded': 'false' });
    var code = el('code', {});

    function renderCode() {
      code.innerHTML = '&lt;Strx.View animate="' + highlightAnimate(token) + '"&gt;';
    }

    toggle.addEventListener('click', function () {
      animateLayout(
        function () {
          return [card, below];
        },
        function () {
          open = !open;
          extra.style.display = open ? 'flex' : 'none';
          toggle.textContent = open ? t('Collapse') : t('Expand');
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        },
        token,
        300,
      );
      card.style.overflow = 'hidden';
    });

    var chips = el('div', { class: 'pg-chips' });
    tokens.forEach(function (option) {
      var chip = el('button', { type: 'button', class: 'chip', text: option, 'aria-pressed': option === token ? 'true' : 'false' });
      chip.addEventListener('click', function () {
        token = option;
        $all('.chip', chips).forEach(function (other) {
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        renderCode();
      });
      chips.appendChild(chip);
    });

    renderCode();
    var stage = el('div', { class: 'demo-stage', style: 'justify-content:flex-start;min-height:300px' }, [card, below, toggle]);
    demoShell(container, stage, el('div', { class: 'demo-bar' }, [chips]));
    container.appendChild(el('div', { class: 'demo-bar' }, [el('span', { class: 'grow' }, [code])]));
  };

  /** A LayoutGroup list: add, remove (with exit), and shuffle. */
  demos.list = function (container) {
    var stack = el('div', { class: 'stack' });
    var colors = ['var(--t-preset)', 'var(--t-key)', 'var(--t-layout)', 'var(--t-time)', 'var(--t-exit)', 'var(--t-trans)'];
    var next = 1;
    var enter = container.getAttribute('data-enter') || 'fade-in from:translate-y-12';
    var exit = container.getAttribute('data-exit-tokens') || 'exit:opacity-0 exit:translate-x-24';
    var transition = container.getAttribute('data-transition') || 'layout-spring';

    function rows() {
      return $all('.row-item', stack);
    }

    function makeRow() {
      var id = next;
      next += 1;
      var remove = el('button', { type: 'button', 'aria-label': t('Remove item') + ' ' + id, text: '✕' });
      var row = el('div', { class: 'row-item' }, [el('i', { style: 'background:' + colors[id % colors.length] }), el('span', { text: t('Item') + ' ' + id }), el('b', {}), remove]);
      remove.addEventListener('click', function () {
        playAnimate(row, enter + ' ' + exit, {
          kind: 'exit',
          reduce: reduceQuery.matches,
          onFinish: function () {
            animateLayout(rows, function () {
              row.remove();
            }, transition);
          },
        });
      });
      return row;
    }

    for (var i = 0; i < 3; i += 1) stack.appendChild(makeRow());

    var add = el('button', {
      type: 'button',
      class: 'ghost',
      text: t('Add item'),
      onclick: function () {
        var row = makeRow();
        animateLayout(rows, function () {
          stack.insertBefore(row, stack.firstChild);
        }, transition);
        playAnimate(row, enter, { reduce: reduceQuery.matches });
      },
    });
    var shuffle = el('button', {
      type: 'button',
      class: 'ghost',
      text: t('Shuffle'),
      onclick: function () {
        animateLayout(rows, function () {
          var items = rows();
          items.sort(function () {
            return Math.random() - 0.5;
          });
          items.forEach(function (item) {
            stack.appendChild(item);
          });
        }, transition);
      },
    });

    var stage = el('div', { class: 'demo-stage', style: 'justify-content:flex-start;min-height:320px' }, [stack]);
    var code = el('code', { html: '&lt;Strx.LayoutGroup transition="spring"&gt; … animate="' + highlightAnimate(enter + ' ' + exit) + '"' });
    demoShell(container, stage, el('div', { class: 'demo-bar' }, [el('span', { class: 'grow' }, [code]), add, shuffle]));
  };

  /** Array playback modes on three entries. */
  demos.playback = function (container) {
    var entries = (container.getAttribute('data-entries') || 'fade-in from:translate-y-12 duration-300|fade-in from:translate-y-12 duration-300|fade-in from:translate-y-12 duration-300').split('|');
    var modes = ['parallel', 'serial', 'stagger'];
    var mode = container.getAttribute('data-mode') || 'stagger';
    var interval = Number(container.getAttribute('data-interval') || 120);
    var lanes = el('div', { class: 'lanes' });
    var boxes = [];
    var code = el('code', {});

    entries.forEach(function (entry, index) {
      var box = el('div', { class: 'box sm' });
      boxes.push(box);
      lanes.appendChild(el('div', { class: 'lane' }, [el('span', { text: t('entry') + ' ' + (index + 1) }), el('div', { class: 'lane-track', style: 'background:transparent;border-style:dashed' }, [box])]));
    });

    function offsets() {
      var result = [];
      var cursor = 0;
      var extra = 0;
      entries.forEach(function (entry, index) {
        var group = T.resolve(entry).groups[0];
        var duration = T.curveFor(group.timing).duration;
        if (mode === 'parallel') result.push(0);
        else if (mode === 'serial') {
          result.push(cursor);
          cursor += group.timing.delay + duration;
        } else {
          result.push(index * interval + extra);
          extra += group.timing.delay;
        }
      });
      return result;
    }

    function play() {
      var starts = offsets();
      code.innerHTML = 'playback="' + mode + '"' + (mode === 'stagger' ? ' interval={' + interval + '}' : '') + ' → ' + t('starts at') + ' ' + starts.map(function (s) { return s + 'ms'; }).join(', ');
      boxes.forEach(function (box, index) {
        var resolved = T.resolve(entries[index]);
        resolved.groups.forEach(function (group) {
          group.timing.delay += starts[index];
        });
        playAnimate(box, resolved, { reduce: reduceQuery.matches });
      });
    }

    var chips = el('div', { class: 'pg-chips' });
    modes.forEach(function (option) {
      var chip = el('button', { type: 'button', class: 'chip', text: option, 'aria-pressed': option === mode ? 'true' : 'false' });
      chip.addEventListener('click', function () {
        mode = option;
        $all('.chip', chips).forEach(function (other) {
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        play();
      });
      chips.appendChild(chip);
    });

    var stage = el('div', { class: 'demo-stage' }, [lanes]);
    demoShell(container, stage, el('div', { class: 'demo-bar' }, [chips, el('span', { class: 'grow' }), replayButton('Replay', play)]));
    container.appendChild(el('div', { class: 'demo-bar' }, [code]));
    play();
  };

  /** useTimeline controller: play, reverse, reset, stop. */
  demos.timeline = function (container) {
    var targets = [
      { node: el('div', { class: 'coin' }), animate: 'scale-in from:opacity-0 duration-280 delay-300' },
      { node: el('div', { class: 'scene-title', text: t('Transfer complete') }), animate: 'fade-in from:translate-y-12 duration-260' },
      { node: el('div', { class: 'scene-btn', text: t('Done') }), animate: 'fade-in from:translate-y-12 duration-240' },
    ];
    var mode = container.getAttribute('data-mode') || 'stagger';
    var interval = 80;
    var status = el('code', { text: t('idle') });
    var animations = [];
    var scene = el('div', { class: 'timeline-scene' }, targets.map(function (target) { return target.node; }));

    function fromFrame(target) {
      return frameStyle(T.resolve(target.animate).groups[0].from);
    }

    function reset() {
      animations.forEach(function (animation) {
        animation.cancel();
      });
      animations = [];
      targets.forEach(function (target) {
        Object.assign(target.node.style, fromFrame(target));
      });
      status.textContent = t('reset() → back to from frames');
    }

    function play() {
      reset();
      var extra = 0;
      targets.forEach(function (target, index) {
        var resolved = T.resolve(target.animate);
        var offset = mode === 'stagger' ? index * interval + extra : 0;
        extra += resolved.groups[0].timing.delay;
        resolved.groups[0].timing.delay += offset;
        target.node.style.opacity = '';
        target.node.style.transform = '';
        var animation = playAnimate(target.node, resolved, { reduce: reduceQuery.matches });
        if (animation) animations.push(animation);
      });
      status.textContent = 'play() → ' + mode;
      Promise.all(animations.map(function (animation) { return animation.finished; })).then(function () {
        status.textContent = 'onComplete()';
      }, function () {});
    }

    function reverse() {
      if (!animations.length) {
        play();
        animations.forEach(function (animation) {
          animation.finish();
        });
      }
      animations.forEach(function (animation) {
        animation.reverse();
      });
      status.textContent = t('reverse() → from the current position');
    }

    function stop() {
      animations.forEach(function (animation) {
        animation.pause();
      });
      status.textContent = t('stop() → frozen in place');
    }

    var buttons = el('div', { class: 'pg-actions' }, [
      el('button', { type: 'button', class: 'ghost', text: 'play()', onclick: play }),
      el('button', { type: 'button', class: 'ghost', text: 'reverse()', onclick: reverse }),
      el('button', { type: 'button', class: 'ghost', text: 'stop()', onclick: stop }),
      el('button', { type: 'button', class: 'ghost', text: 'reset()', onclick: reset }),
    ]);

    demoShell(container, el('div', { class: 'demo-stage', style: 'min-height:240px' }, [scene]), el('div', { class: 'demo-bar' }, [buttons, el('span', { class: 'grow' }), status]));
    reset();
    status.textContent = t('idle — press play()');
  };

  /** Reduce Motion on/off. */
  demos.reduce = function (container) {
    var reduce = false;
    var animate = container.getAttribute('data-animate') || 'fade-in from:translate-y-24 duration-600 delay-200';
    var box = el('div', { class: 'box' });
    var code = el('code', {});
    var toggle = el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', text: t('Reduce Motion: off') });

    function play() {
      code.textContent = reduce ? 'duration → 0, delay → 0, play → 1' : 'animate="' + animate + '"';
      playAnimate(box, animate, { reduce: reduce });
    }

    toggle.addEventListener('click', function () {
      reduce = !reduce;
      toggle.setAttribute('aria-pressed', reduce ? 'true' : 'false');
      toggle.textContent = reduce ? t('Reduce Motion: on') : t('Reduce Motion: off');
      play();
    });

    demoShell(container, el('div', { class: 'demo-stage' }, [box]), el('div', { class: 'demo-bar' }, [toggle, el('span', { class: 'grow' }, [code]), replayButton('Replay', play)]));
    play();
  };

  $all('[data-demo]').forEach(function (container) {
    var demo = demos[container.getAttribute('data-demo')];
    if (demo) demo(container);
  });

  // The editor page runs the VS Code extension's own logic; load it only there.
  if ($('[data-editor-demo]')) {
    var assets = (document.body.getAttribute('data-base') || '') + 'assets/';
    var load = function (file, next) {
      var script = document.createElement('script');
      script.src = assets + file;
      script.onload = next;
      document.body.appendChild(script);
    };
    load('editor-extension.js', function () {
      load('editor-demo.js');
    });
  }

  /* ------------------------------------------------------------ Landing extras */

  $all('[data-landing-transition]').forEach(function (stage) {
    var target = $('.lt-target', stage);
    var button = $('button', stage);
    var on = false;
    button.addEventListener('click', function () {
      on = !on;
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      target.style.width = on ? '200px' : '120px';
      target.style.backgroundColor = on ? 'var(--t-key)' : 'var(--accent)';
    });
  });

  $all('[data-landing-layout]').forEach(function (stage) {
    var card = $('.expander', stage);
    var extra = $('.extra', stage);
    var button = $('button', stage);
    var open = false;
    button.addEventListener('click', function () {
      animateLayout(function () { return [card]; }, function () {
        open = !open;
        extra.style.display = open ? 'flex' : 'none';
        button.textContent = open ? t('Collapse') : t('Expand');
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
      }, 'layout-spring');
    });
  });

  $all('[data-landing-timeline]').forEach(function (stage) {
    var rows = $all('.row-item', stage);
    function play() {
      rows.forEach(function (row, index) {
        playAnimate(row, 'fade-in from:translate-y-12 duration-420 delay-' + index * 100, { reduce: reduceQuery.matches });
      });
    }
    $('button', stage).addEventListener('click', play);
  });
})();
