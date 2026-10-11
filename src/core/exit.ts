import {
  withDelay,
  withTiming,
  type EntryExitAnimationFunction,
  type ExitAnimationsValues,
} from 'react-native-reanimated';

import { parseAnimate } from '../parser/resolve';
import type { AnimateProp, AnimateStyle } from '../types/animate';
import { applyEasing } from './easing';

export interface ExitTokenState {
  hasExitToken: boolean;
  style: AnimateStyle;
  duration?: number;
  delay?: number;
  easing?: string;
}

const EMPTY_EXIT_TOKEN_STATE: ExitTokenState = Object.freeze({
  hasExitToken: false,
  style: Object.freeze({}),
});

/** Reads the unmount animation requested by `exit:` tokens. */
export function getExitTokenState(
  animate: AnimateProp | undefined,
): ExitTokenState {
  const exit = parseAnimate(animate).exit;

  if (!exit) {
    return EMPTY_EXIT_TOKEN_STATE;
  }

  const { duration, delay, easing } = exit.timing;

  return {
    hasExitToken: true,
    style: exit.style,
    ...(duration === undefined ? null : { duration }),
    ...(delay === undefined ? null : { delay }),
    ...(easing === undefined ? null : { easing }),
  };
}

export function getExitAnimation(
  exitTokenState: ExitTokenState,
): EntryExitAnimationFunction | undefined {
  if (!exitTokenState.hasExitToken) {
    return undefined;
  }

  const duration = exitTokenState.duration ?? 300;
  const delay = exitTokenState.delay ?? 0;
  const easing = exitTokenState.easing ?? 'ease';
  const opacity =
    typeof exitTokenState.style.opacity === 'number'
      ? exitTokenState.style.opacity
      : 0;
  const translateX =
    typeof exitTokenState.style.translateX === 'number'
      ? exitTokenState.style.translateX
      : 0;
  const translateY =
    typeof exitTokenState.style.translateY === 'number'
      ? exitTokenState.style.translateY
      : 0;
  const scale =
    typeof exitTokenState.style.scale === 'number'
      ? exitTokenState.style.scale
      : 1;

  return (values: ExitAnimationsValues) => {
    'worklet';
    return {
      initialValues: {
        originX: values.currentOriginX,
        originY: values.currentOriginY,
        width: values.currentWidth,
        height: values.currentHeight,
        opacity: 1,
        transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
      },
      animations: {
        originX: withTiming(values.currentOriginX, { duration: 0 }),
        originY: withTiming(values.currentOriginY, { duration: 0 }),
        width: withTiming(values.currentWidth, { duration: 0 }),
        height: withTiming(values.currentHeight, { duration: 0 }),
        opacity: animateExitValue(opacity, duration, delay, easing),
        transform: [
          { translateX: animateExitValue(translateX, duration, delay, easing) },
          { translateY: animateExitValue(translateY, duration, delay, easing) },
          { scale: animateExitValue(scale, duration, delay, easing) },
        ],
      },
    };
  };
}

function animateExitValue(
  value: number,
  duration: number,
  delay: number,
  easing: string,
) {
  'worklet';
  const animation = withTiming(value, {
    duration,
    easing: (t: number) => {
      'worklet';
      return applyEasing(easing, t);
    },
  });

  return delay > 0 ? withDelay(delay, animation) : animation;
}
