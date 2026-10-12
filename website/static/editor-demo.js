/*
 * Interactive demos for the editor extension page. They run the extension's
 * own language logic (editor-extension.js) against the site's token data, so
 * completions, hovers, diagnostics, and previews match VS Code.
 */
(function () {
  'use strict';

  var X = window.StrxEditorExtension;
  var tokens = window.STRX_TOKENS;

  if (!X || !tokens) {
    return;
  }

  var LANG = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2);
  var context = { metadata: tokens, customPresets: new Set(['pop-in']) };

  var TEXT = {
    en: {
      value: 'animate value',
      suggestions: 'Suggested tokens',
      problems: 'Problems',
      output: 'Output',
      terminal: 'Terminal',
      noProblems: 'No problems have been detected in the workspace.',
      replace: function (s) { return 'Replace with "' + s + '"'; },
      comma: 'Start a new group with a comma',
      didYouMean: function (s) { return ' Did you mean "' + s + '"?'; },
      keys: [['↑ ↓', 'move'], ['Enter / Tab', 'insert'], ['Esc', 'close']],
      keysNote: 'Make a typo to see quick fixes in the Problems panel.',
      examples: 'Pick an example',
      preview: function (s) { return s + ' preview'; },
      gallery: [
        ['slide-up', 'Presets move from their start frame to their end frame.'],
        ['exit:', '<code>exit:</code> rests, then leaves.'],
        ['transition-colors', '<code>transition-*</code> changes a style and back.'],
        ['layout-spring', '<code>layout-*</code> shows a size change.'],
        ['ease-in-out', 'Easing: the progress curve over the default (dashed).'],
        ['duration-500', '<code>duration-*</code>: a bar next to the default 300ms.'],
        ['delay-200', '<code>delay-*</code>: the wait, then the motion.'],
        ['damping-4', 'Spring values: overshoot and settle time.'],
        ['play-3', '<code>play-*</code>: one bar per play and the total time.'],
      ],
    },
    ko: {
      value: 'animate 값',
      suggestions: '추천 토큰',
      problems: '문제',
      output: '출력',
      terminal: '터미널',
      noProblems: '작업 영역에서 문제가 발견되지 않았어요.',
      replace: function (s) { return '"' + s + '"(으)로 바꾸기'; },
      comma: '쉼표로 새 그룹 시작하기',
      didYouMean: function (s) { return ' Did you mean "' + s + '"?'; },
      keys: [['↑ ↓', '항목 이동'], ['Enter / Tab', '넣기'], ['Esc', '닫기']],
      keysNote: '오타를 내면 아래 문제 패널에 빠른 수정이 나와요.',
      examples: '예시 고르기',
      preview: function (s) { return s + ' 미리보기'; },
      gallery: [
        ['slide-up', '프리셋: 시작 모습에서 끝 모습으로 움직여요.'],
        ['exit:', '<code>exit:</code>: 머물다가 사라지는 모습이에요.'],
        ['transition-colors', '<code>transition-*</code>: 스타일이 바뀌었다 돌아와요.'],
        ['layout-spring', '<code>layout-*</code>: 크기가 바뀔 때의 움직임이에요.'],
        ['ease-in-out', 'easing: 진행도 곡선과 기본 곡선(점선)을 비교해요.'],
        ['duration-500', '<code>duration-*</code>: 기본 300ms 막대와 길이를 비교해요.'],
        ['delay-200', '<code>delay-*</code>: 기다리는 구간과 움직이는 구간을 나눠요.'],
        ['damping-4', '스프링 값: 넘치는 정도와 멈추는 시점을 표시해요.'],
        ['play-3', '<code>play-*</code>: 재생 횟수와 총 시간을 보여 줘요.'],
      ],
    },
  }[LANG === 'ko' ? 'ko' : 'en'];

  var ICON = {
    preset: ['P', '#75beff'],
    keyframePrefix: ['K', '#c586c0'],
    utility: ['U', '#c586c0'],
    layout: ['L', '#4ec9b0'],
    transition: ['T', '#4ec9b0'],
    easing: ['E', '#dcdcaa'],
    timing: ['#', '#dcdcaa'],
    legacy: ['#', '#6e7681'],
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function dataUri(svg) {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  /** The small Markdown subset the extension writes for docs and hovers. */
  function markdown(source) {
    return source
      .split(/\n{2,}/)
      .map(function (block) {
        if (/^---$/.test(block.trim())) return '<hr>';
        var image = /^!\[([^\]]*)\]\((data:[^)]+)\)$/.exec(block.trim());
        if (image) return '<img alt="' + escapeHtml(image[1]) + '" src="' + image[2] + '">';
        var html = escapeHtml(block)
          .replace(/\*\*`([^`]+)`\*\*/g, '<b><code>$1</code></b>')
          .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');
        return '<p>' + html + '</p>';
      })
      .join('');
  }

  function tabbar(file) {
    return (
      '<div class="ed-tabbar" aria-hidden="true"><span class="ed-dot"></span><span class="ed-dot"></span><span class="ed-dot"></span>' +
      '<span class="ed-file"><i></i>' + file + '</span></div>'
    );
  }

  // ------------------------------------------------------------ completion

  function setupCompletion(container) {
    container.innerHTML =
      '<div class="ed-vs">' + tabbar('PaymentDone.tsx') +
      '<div class="ed-body ed-body-completion">' +
      '<div class="ed-line"><span class="ed-ln">12</span><span class="ed-pun">&lt;</span><span class="ed-comp">Strx.View</span></div>' +
      '<div class="ed-line ed-flow"><span class="ed-ln">13</span><span class="ed-code"><span class="ed-ind"></span><span class="ed-attr">animate</span><span class="ed-pun">=</span><span class="ed-str">"</span>' +
      '<span class="ed-field"><span class="ed-marks" aria-hidden="true"></span>' +
      '<textarea rows="1" aria-label="' + TEXT.value + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">duration-800 delay-200 </textarea></span></span></div>' +
      '<div class="ed-line"><span class="ed-ln">14</span><span class="ed-ind"></span><span class="ed-attr">style</span><span class="ed-pun">={</span>styles.card<span class="ed-pun">}</span></div>' +
      '<div class="ed-line"><span class="ed-ln">15</span><span class="ed-pun">/&gt;</span></div>' +
      '<div class="ed-suggest" hidden><div class="ed-list" role="listbox" aria-label="' + TEXT.suggestions + '"></div><div class="ed-details ed-md"></div></div>' +
      '</div><div class="ed-panel"></div></div>' +
      '<ul class="ed-keys">' +
      TEXT.keys.map(function (pair) { return '<li><kbd>' + pair[0] + '</kbd> ' + pair[1] + '</li>'; }).join('') +
      '<li>' + TEXT.keysNote + '</li></ul>';

    var body = container.querySelector('.ed-body');
    var input = container.querySelector('textarea');
    var marks = container.querySelector('.ed-marks');
    var suggest = container.querySelector('.ed-suggest');
    var list = container.querySelector('.ed-list');
    var details = container.querySelector('.ed-details');
    var panel = container.querySelector('.ed-panel');
    var state = { items: [], index: 0, range: [0, 0], typed: '', open: false };

    /** Caret position measured on the mirror, which wraps like the textarea. */
    function caretRect(index) {
      var saved = marks.innerHTML;
      var probe = document.createElement('span');
      marks.textContent = input.value.slice(0, index);
      probe.textContent = '​';
      marks.appendChild(probe);
      var rect = probe.getBoundingClientRect();
      marks.innerHTML = saved;
      return rect;
    }

    function renderMarks() {
      var value = input.value;
      var analyzed = X.analyze(value, context);
      var html = '';
      var at = 0;

      analyzed.forEach(function (token) {
        html += escapeHtml(value.slice(at, token.start));
        var text = escapeHtml(value.slice(token.start, token.end));
        html += token.issue ? '<span class="ed-bad">' + text + '</span>' : text;
        at = token.end;
      });

      // The closing quote follows the text, wherever the last line ends.
      marks.innerHTML = html + escapeHtml(value.slice(at)) + '<span class="ed-q">"</span>';
      renderProblems(analyzed);
    }

    function renderProblems(analyzed) {
      var issues = analyzed.filter(function (token) { return token.issue; });
      var head =
        '<div class="ed-ptabs"><span class="on">' + TEXT.problems + '<span class="ed-count">' + issues.length + '</span></span>' +
        '<span>' + TEXT.output + '</span><span>' + TEXT.terminal + '</span></div>';

      if (!issues.length) {
        panel.innerHTML = head + '<div class="ed-ok">' + TEXT.noProblems + '</div>';
        return;
      }

      panel.innerHTML = head + '<ul>' + issues.map(function (token, index) {
        var issue = token.issue;
        var fixes = '';
        if (issue.suggestion) fixes += '<button type="button" data-fix="' + index + '" data-kind="replace">' + escapeHtml(TEXT.replace(issue.suggestion)) + '</button>';
        if (issue.needsComma) fixes += '<button type="button" data-fix="' + index + '" data-kind="comma">' + TEXT.comma + '</button>';
        return (
          '<li><span class="ed-warn" aria-hidden="true">!</span><span>' + escapeHtml(issue.message) +
          (issue.suggestion ? escapeHtml(TEXT.didYouMean(issue.suggestion)) : '') +
          '</span><span class="ed-src">strx · Ln 13</span>' + fixes + '</li>'
        );
      }).join('') + '</ul>';

      panel.onclick = function (event) {
        var button = event.target.closest('[data-fix]');
        if (!button) return;
        var token = issues[Number(button.getAttribute('data-fix'))];
        var value = input.value;

        if (button.getAttribute('data-kind') === 'replace') {
          value = value.slice(0, token.start) + token.issue.suggestion + value.slice(token.end);
        } else {
          value = value.slice(0, token.start).replace(/\s+$/, '') + ', ' + value.slice(token.start);
        }

        input.value = value;
        refresh(false);
        input.focus();
        input.setSelectionRange(value.length, value.length);
      };
    }

    function highlight(label, typed) {
      var n = 0;
      while (n < typed.length && label[n] && label[n].toLowerCase() === typed[n].toLowerCase()) n += 1;
      return '<b>' + escapeHtml(label.slice(0, n)) + '</b>' + escapeHtml(label.slice(n));
    }

    function openSuggest() {
      var value = input.value;
      var caret = input.selectionStart == null ? value.length : input.selectionStart;
      var result = X.computeCompletions(value, caret, context);
      var typed = value.slice(result.replaceStart, caret).toLowerCase();

      state.items = result.items.filter(function (item) {
        var label = item.label.toLowerCase();
        return !typed || label.replace('{number}', '').indexOf(typed) === 0 || label.indexOf(typed) >= 0;
      });
      state.range = [result.replaceStart, result.replaceEnd];
      state.typed = typed;
      if (state.index >= state.items.length) state.index = 0;
      state.open = state.items.length > 0;
      renderSuggest();
    }

    function renderSuggest() {
      if (!state.open) {
        suggest.hidden = true;
        return;
      }

      list.innerHTML = state.items.map(function (item, index) {
        var icon = ICON[item.category] || ['•', '#999'];
        var selected = index === state.index;
        return (
          '<div class="ed-item' + (selected ? ' sel' : '') + '" role="option" data-index="' + index + '" aria-selected="' + selected + '">' +
          '<span class="ed-ic" style="background:' + icon[1] + '">' + icon[0] + '</span>' +
          '<span class="ed-label">' + highlight(item.label, state.typed) + '</span>' +
          '<span class="ed-meta">' + escapeHtml(item.detail.replace(/^STRX /, '')) + '</span></div>'
        );
      }).join('');

      var item = state.items[state.index];
      // Previews follow the rest of the comma group, like in VS Code.
      var preview = X.tokenPreviewMarkdown(item.label, context.metadata, item.groupTokens);
      details.innerHTML =
        '<div class="ed-head">' + escapeHtml(item.detail) + '</div>' +
        markdown(item.documentation + (preview ? '\n\n' + preview : ''));

      var selectedRow = list.querySelector('.sel');
      if (selectedRow) {
        var top = selectedRow.offsetTop;
        var bottom = top + selectedRow.offsetHeight;
        if (top < list.scrollTop) list.scrollTop = top;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
      }

      var box = body.getBoundingClientRect();
      var caret = caretRect(state.range[0]);
      suggest.style.left = Math.max(8, Math.min(caret.left - box.left, box.width - 570)) + 'px';
      suggest.style.top = caret.bottom - box.top + 4 + 'px';
      suggest.hidden = false;
    }

    function accept() {
      var item = state.items[state.index];
      if (!item) return;
      var text = item.insertText.replace(/\$\{1:([^}]*)\}/, '$1');
      var value = input.value;
      var next = value.slice(0, state.range[0]) + text + value.slice(state.range[1]);
      var caret = state.range[0] + text.length;

      if (!item.retrigger && caret === next.length) {
        next += ' ';
        caret += 1;
      }

      input.value = next;
      input.setSelectionRange(caret, caret);
      state.index = 0;
      refresh(true);
    }

    function refresh(open) {
      renderMarks();
      if (open) {
        openSuggest();
      } else {
        state.open = false;
        renderSuggest();
      }
    }

    input.addEventListener('input', function () {
      // animate values are one line; pasted line breaks become spaces.
      if (/\n/.test(input.value)) {
        var caret = input.selectionStart;
        input.value = input.value.replace(/\n/g, ' ');
        input.setSelectionRange(caret, caret);
      }
      state.index = 0;
      refresh(true);
    });
    input.addEventListener('click', function () { refresh(true); });
    input.addEventListener('focus', function () { refresh(true); });
    input.addEventListener('keydown', function (event) {
      if (!state.open) {
        if (event.key === ' ' && event.ctrlKey) {
          event.preventDefault();
          refresh(true);
        }
        if (event.key === 'Enter') event.preventDefault();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        state.index = (state.index + 1) % state.items.length;
        renderSuggest();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        state.index = (state.index - 1 + state.items.length) % state.items.length;
        renderSuggest();
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        accept();
      } else if (event.key === 'Escape') {
        state.open = false;
        renderSuggest();
      }
    });
    input.addEventListener('keyup', function (event) {
      if (/^(ArrowLeft|ArrowRight|Home|End)$/.test(event.key)) refresh(true);
    });
    list.addEventListener('mousedown', function (event) {
      var row = event.target.closest('[data-index]');
      if (!row) return;
      event.preventDefault();
      var index = Number(row.getAttribute('data-index'));
      if (index === state.index) {
        accept();
      } else {
        state.index = index;
        renderSuggest();
      }
    });
    document.addEventListener('mousedown', function (event) {
      if (!container.contains(event.target)) {
        state.open = false;
        renderSuggest();
      }
    });
    window.addEventListener('resize', function () {
      if (state.open) renderSuggest();
    });

    // Start in a realistic state: a slow, delayed group with slide-up selected.
    renderMarks();
    input.setSelectionRange(input.value.length, input.value.length);
    openSuggest();
    state.items.some(function (item, index) {
      if (item.label === 'slide-up') {
        state.index = index;
        return true;
      }
      return false;
    });
    renderSuggest();
  }

  // --------------------------------------------------------------- gallery

  function setupPreviews(container) {
    container.innerHTML =
      '<div class="ed-gallery">' +
      TEXT.gallery.map(function (entry) {
        var svg = X.tokenPreviewSvg(entry[0], context.metadata);
        return svg
          ? '<figure><img alt="' + escapeHtml(TEXT.preview(entry[0])) + '" src="' + dataUri(svg) + '"><figcaption>' + entry[1] + '</figcaption></figure>'
          : '';
      }).join('') +
      '</div>';
  }

  // ----------------------------------------------------------------- hover

  var EXAMPLES = [
    'slide-up duration-800 delay-200 ease-in-out',
    'fade-in from:translate-y-12 spring',
    'fade-in duration-200, slide-up delay-150 duration-500 ease-in-out',
    'scale-in spring damping-4 stiffness-180',
    'fade-in exit:opacity-0 exit:translate-y-24 duration-180',
  ];

  function setupHover(container) {
    container.innerHTML =
      '<div class="ed-vs">' + tabbar('Toast.tsx') +
      '<div class="ed-body ed-body-hover">' +
      '<div class="ed-line ed-flow"><span class="ed-ln">8</span><span class="ed-code"><span class="ed-pun">&lt;</span><span class="ed-comp">Strx.View</span>&nbsp;<span class="ed-attr">animate</span><span class="ed-pun">=</span><span class="ed-str">"<span class="ed-hover-line"></span>"</span>&nbsp;<span class="ed-pun">/&gt;</span></span></div>' +
      '<div class="ed-hovercard ed-md" hidden></div>' +
      '</div></div>' +
      '<div class="ed-examples" role="group" aria-label="' + TEXT.examples + '">' +
      EXAMPLES.map(function (value, index) {
        return '<button type="button" data-ex="' + index + '" aria-pressed="' + (index === 0) + '">' + escapeHtml(value) + '</button>';
      }).join('') +
      '</div>';

    var body = container.querySelector('.ed-body');
    var line = container.querySelector('.ed-hover-line');
    var card = container.querySelector('.ed-hovercard');
    var value = EXAMPLES[0];
    var current = 0;

    function renderLine() {
      var analyzed = X.analyze(value, context);
      var html = '';
      var at = 0;
      analyzed.forEach(function (token, index) {
        html += escapeHtml(value.slice(at, token.start));
        html += '<span class="ed-tok" tabindex="0" data-tok="' + index + '">' + escapeHtml(value.slice(token.start, token.end)) + '</span>';
        at = token.end;
      });
      line.innerHTML = html + escapeHtml(value.slice(at));
      show(current);
    }

    function show(index) {
      var token = X.analyze(value, context)[index];
      if (!token) return;
      current = index;
      var hover = X.computeHover(value, token.start, context, { previews: true });
      if (!hover) {
        card.hidden = true;
        return;
      }
      card.innerHTML = markdown(hover.markdown);
      Array.prototype.forEach.call(line.querySelectorAll('.ed-tok'), function (el) {
        el.classList.toggle('on', Number(el.getAttribute('data-tok')) === index);
      });
      var span = line.querySelector('[data-tok="' + index + '"]');
      var box = body.getBoundingClientRect();
      var rect = span.getBoundingClientRect();
      card.style.left = Math.max(8, Math.min(rect.left - box.left, box.width - 330)) + 'px';
      card.style.top = rect.bottom - box.top + 4 + 'px';
      card.hidden = false;
    }

    function pick(event) {
      var el = event.target.closest('[data-tok]');
      if (el) show(Number(el.getAttribute('data-tok')));
    }

    line.addEventListener('mouseover', pick);
    line.addEventListener('focusin', pick);
    line.addEventListener('click', pick);
    container.querySelector('.ed-examples').addEventListener('click', function (event) {
      var button = event.target.closest('[data-ex]');
      if (!button) return;
      value = EXAMPLES[Number(button.getAttribute('data-ex'))];
      current = 0;
      Array.prototype.forEach.call(button.parentNode.children, function (el) {
        el.setAttribute('aria-pressed', String(el === button));
      });
      renderLine();
    });
    window.addEventListener('resize', function () { show(current); });

    renderLine();
  }

  var SETUP = { completion: setupCompletion, previews: setupPreviews, hover: setupHover };

  Array.prototype.forEach.call(document.querySelectorAll('[data-editor-demo]'), function (container) {
    var setup = SETUP[container.getAttribute('data-editor-demo')];
    if (setup) setup(container);
  });
})();
