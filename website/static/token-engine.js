/*
 * Token engine shared by the documentation site and its build script.
 *
 * It mirrors the parts of the react-native-strx parser the site needs:
 * classifying tokens for syntax highlighting and resolving a token string
 * into per-group keyframes for the browser previews. Token data comes from
 * the package's generated tokens.json (exposed as globalThis.STRX_TOKENS).
 */
(function (root) {
  'use strict';

  var data = root.STRX_TOKENS;
  var presetMap = {};
  var easingSet = {};
  var transitionSet = {};
  var layoutSet = {};
  var utilities = data.utilities.slice().sort(function (a, b) {
    return b.prefix.length - a.prefix.length;
  });

  data.presets.forEach(function (preset) {
    presetMap[preset.name] = preset;
  });
  data.easings.forEach(function (easing) {
    easingSet[easing.token] = true;
  });
  data.transitions.forEach(function (transition) {
    transitionSet[transition.token] = true;
  });
  data.layout.forEach(function (layout) {
    layoutSet[layout.token] = true;
  });

  var NUMBER = /^\d+(\.\d+)?$/;
  var NUMERIC_TIMING = ['duration', 'delay', 'damping', 'stiffness', 'mass'];

  function parseUtility(body) {
    var negative = body.charAt(0) === '-';
    var rest = negative ? body.slice(1) : body;

    for (var i = 0; i < utilities.length; i += 1) {
      var utility = utilities[i];

      if (rest.indexOf(utility.prefix) !== 0) {
        continue;
      }

      var raw = rest.slice(utility.prefix.length);

      if (!NUMBER.test(raw) || (negative && !utility.signed)) {
        return null;
      }

      var value = Number(raw);
      var property = utility.property;

      if (property === 'opacity') {
        value = Math.min(value, utility.max || 100) / 100;
      } else if (/^scale/.test(property)) {
        value = value / 100;
      }

      return { property: property, value: negative ? -value : value };
    }

    return null;
  }

  /** Category of a single token, or 'invalid'. */
  function classify(token) {
    if (presetMap[token]) return 'preset';
    if (layoutSet[token]) return 'layout';
    if (transitionSet[token]) return 'transition';
    if (easingSet[token] || token === 'spring') return 'timing';

    var colon = token.indexOf(':');

    if (colon > 0) {
      var prefix = token.slice(0, colon);
      var body = token.slice(colon + 1);

      if (prefix === 'from' || prefix === 'to') {
        return parseUtility(body) ? 'keyframe' : 'invalid';
      }

      if (prefix === 'exit') {
        return parseUtility(body) ? 'exit' : 'invalid';
      }

      return 'invalid';
    }

    var match = /^([a-z]+)-(.+)$/.exec(token);

    if (match) {
      if (NUMERIC_TIMING.indexOf(match[1]) >= 0 && NUMBER.test(match[2])) {
        return 'timing';
      }

      if (
        (match[1] === 'play' || match[1] === 'repeat') &&
        (match[2] === 'infinite' || /^[1-9]\d*$/.test(match[2]))
      ) {
        return 'timing';
      }
    }

    return 'invalid';
  }

  /** Splits an animate string into comma groups of tokens. */
  function split(input) {
    return input
      .split(',')
      .map(function (group) {
        return group.trim().split(/\s+/).filter(Boolean);
      })
      .filter(function (group) {
        return group.length > 0;
      });
  }

  /** True when every token in the string is a known STRX token. */
  function isAnimateString(input) {
    if (!/[a-z]/.test(input) || /[^a-z0-9.:,\s-]/.test(input)) {
      return false;
    }

    var groups = split(input);
    var known = 0;
    var total = 0;

    groups.forEach(function (group) {
      group.forEach(function (token) {
        total += 1;
        if (classify(token) !== 'invalid') known += 1;
      });
    });

    return total > 0 && known === total;
  }

  function levenshtein(a, b) {
    var previous = [];
    var i;
    var j;

    for (j = 0; j <= b.length; j += 1) previous[j] = j;

    for (i = 1; i <= a.length; i += 1) {
      var current = [i];

      for (j = 1; j <= b.length; j += 1) {
        current[j] = Math.min(
          previous[j] + 1,
          current[j - 1] + 1,
          previous[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1),
        );
      }

      previous = current;
    }

    return previous[b.length];
  }

  var suggestionPool = Object.keys(presetMap)
    .concat(Object.keys(layoutSet), Object.keys(transitionSet))
    .concat(Object.keys(easingSet), ['spring', 'play-infinite']);

  function suggest(token) {
    var colon = token.indexOf(':');
    var pool = suggestionPool;
    var best;
    var bestDistance = 3;

    if (colon > 0) {
      var number = /(\d+(\.\d+)?)$/.exec(token);
      var sign = token.charAt(colon + 1) === '-' ? '-' : '';
      pool = [];
      data.keyframePrefixes.forEach(function (keyframe) {
        data.utilities.forEach(function (utility) {
          pool.push(keyframe.prefix + sign + utility.prefix + (number ? number[1] : '0'));
        });
      });
    }

    pool.forEach(function (candidate) {
      var distance = levenshtein(token, candidate);

      if (distance > 0 && distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    });

    return best;
  }

  var NEUTRAL = {
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    width: null,
    height: null,
  };

  function parseMotion(motion) {
    var result = { driver: 'timing' };
    var duration = /(\d+)ms/.exec(motion || '');

    if (/^spring/.test(motion || '')) result.driver = 'spring';
    if (duration) result.duration = Number(duration[1]);

    ['damping', 'stiffness', 'mass'].forEach(function (key) {
      var match = new RegExp(key + ' ([\\d.]+)').exec(motion || '');
      if (match) result[key] = Number(match[1]);
    });

    return result;
  }

  /**
   * Resolves an animate string into groups the previews can play.
   *
   * Each group has `from`, `to`, and `exit` frames plus timing. Later groups
   * win per channel, like the library.
   */
  function resolve(input) {
    var groups = [];
    var invalid = [];
    var notes = [];

    split(input || '').forEach(function (tokens) {
      var group = {
        preset: null,
        from: {},
        to: {},
        exit: {},
        layout: null,
        transition: null,
        timing: {},
      };

      tokens.forEach(function (token) {
        var kind = classify(token);

        if (kind === 'invalid') {
          invalid.push({ token: token, suggestion: suggest(token) });
          return;
        }

        if (kind === 'preset') {
          if (group.preset) {
            invalid.push({ token: token, suggestion: null, reason: 'second-preset' });
          } else {
            group.preset = presetMap[token];
          }
          return;
        }

        if (kind === 'layout') {
          group.layout = token;
          return;
        }

        if (kind === 'transition') {
          group.transition = token;
          return;
        }

        if (kind === 'keyframe' || kind === 'exit') {
          var colon = token.indexOf(':');
          var frame = group[token.slice(0, colon)];
          var utility = parseUtility(token.slice(colon + 1));
          frame[utility.property] = utility.value;
          return;
        }

        if (easingSet[token] || token === 'spring') {
          group.timing.easing = token;
          return;
        }

        var match = /^([a-z]+)-(.+)$/.exec(token);

        if (match[1] === 'play' || match[1] === 'repeat') {
          group.timing.play = match[2] === 'infinite' ? Infinity : Number(match[2]);
        } else {
          group.timing[match[1]] = Number(match[2]);
        }
      });

      if (group.layout) notes.push('layout');
      if (group.transition) notes.push('transition');

      var presetMotion = group.preset ? parseMotion(group.preset.motion) : {};
      var from = Object.assign({}, group.preset ? group.preset.initial : {}, group.from);
      var to = Object.assign({}, group.preset ? group.preset.target : {}, group.to);

      Object.keys(from).forEach(function (key) {
        if (!(key in to)) to[key] = NEUTRAL[key];
      });
      Object.keys(to).forEach(function (key) {
        if (!(key in from)) from[key] = NEUTRAL[key];
      });

      var spring = group.timing.easing === 'spring' || presetMotion.driver === 'spring';

      groups.push({
        tokens: tokens,
        preset: group.preset ? group.preset.name : null,
        from: from,
        to: to,
        exit: group.exit,
        layout: group.layout,
        transition: group.transition,
        explicit: group.timing,
        timing: {
          driver: spring ? 'spring' : 'timing',
          duration: group.timing.duration != null ? group.timing.duration : presetMotion.duration != null ? presetMotion.duration : 300,
          delay: group.timing.delay || 0,
          easing: group.timing.easing && group.timing.easing !== 'spring' ? group.timing.easing : 'ease-out',
          damping: group.timing.damping != null ? group.timing.damping : presetMotion.damping != null ? presetMotion.damping : 10,
          stiffness: group.timing.stiffness != null ? group.timing.stiffness : presetMotion.stiffness != null ? presetMotion.stiffness : 100,
          mass: group.timing.mass != null ? group.timing.mass : presetMotion.mass != null ? presetMotion.mass : 1,
          play: group.timing.play || 1,
        },
      });
    });

    return { groups: groups, invalid: invalid, notes: notes };
  }

  /** Library easing curves (src/core/easing.ts). */
  var EASINGS = {
    linear: function (t) { return t; },
    ease: function (t) { return t * t * (3 - 2 * t); },
    'ease-in': function (t) { return t * t * t; },
    'ease-out': function (t) { return 1 - Math.pow(1 - t, 3); },
    'ease-in-out': function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
  };

  /**
   * Simulates a damped spring from 0 to 1. Returns samples at 1ms steps and
   * the settle time.
   */
  function springCurve(damping, stiffness, mass) {
    var x = 0;
    var v = 0;
    var dt = 1 / 1000;
    var samples = [0];
    var t;

    for (t = 1; t <= 4000; t += 1) {
      var force = -stiffness * (x - 1) - damping * v;
      v += (force / mass) * dt;
      x += v * dt;
      samples.push(x);

      if (t > 50 && Math.abs(x - 1) < 0.002 && Math.abs(v) < 0.02) break;
    }

    samples[samples.length - 1] = 1;

    return {
      duration: samples.length - 1,
      at: function (ms) {
        var index = Math.max(0, Math.min(samples.length - 1, Math.round(ms)));
        return samples[index];
      },
    };
  }

  /** Progress function and active length for a group's timing. */
  function curveFor(timing) {
    if (timing.driver === 'spring') {
      var spring = springCurve(timing.damping, timing.stiffness, timing.mass);
      return {
        duration: spring.duration,
        at: function (ms) { return spring.at(ms); },
      };
    }

    var ease = EASINGS[timing.easing] || EASINGS.ease;
    var duration = Math.max(1, timing.duration);

    return {
      duration: duration,
      at: function (ms) { return ease(Math.max(0, Math.min(1, ms / duration))); },
    };
  }

  root.StrxTokens = {
    data: data,
    classify: classify,
    split: split,
    isAnimateString: isAnimateString,
    resolve: resolve,
    suggest: suggest,
    easings: EASINGS,
    springCurve: springCurve,
    curveFor: curveFor,
    neutral: NEUTRAL,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
