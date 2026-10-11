import React, { useImperativeHandle, type Ref } from 'react';
import { act, render, screen } from '@testing-library/react-native';
import type { ViewStyle } from 'react-native';
import * as Reanimated from 'react-native-reanimated';

import { Strx, type StrxTimelineController } from '../../index';
import type { AnimateProp, PlaybackMode } from '../../types/animate';

/**
 * Engine behavior over time, driven by Jest fake timers. Reanimated's Jest
 * setup advances animations with the timers, so these tests observe the
 * values a device would render frame by frame.
 */
jest.useFakeTimers();

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

async function run(callback: () => void) {
  await act(async () => {
    callback();
  });
}

// The published types describe the web stub; under Jest it takes a component.
const getAnimatedStyle = Reanimated.getAnimatedStyle as unknown as (
  component: unknown,
) => Record<string, unknown>;

/** Static style merged with the animated style, as rendered. */
function animatedStyle(testID = 'box') {
  return getAnimatedStyle(screen.getByTestId(testID));
}

/** Only the values produced by the animated style, without the static style. */
function animatedLayer(testID = 'box') {
  return (
    screen.getByTestId(testID).props as {
      jestAnimatedStyle: { value: Record<string, unknown> };
    }
  ).jestAnimatedStyle.value;
}

function Box(props: {
  animate?: AnimateProp;
  style?: ViewStyle;
  playback?: PlaybackMode;
}) {
  return <Strx.View testID="box" {...props} />;
}

describe('explicit animations', () => {
  it('renders the from frame on the first paint and animates to the target', async () => {
    await render(<Box animate="fade-in duration-300 linear" />);

    expect(animatedStyle().opacity).toBe(0);

    await advance(150);
    expect(animatedStyle().opacity).toBeCloseTo(0.5, 1);

    await advance(300);
    expect(animatedStyle().opacity).toBe(1);
  });

  it('honors delay', async () => {
    await render(<Box animate="fade-in duration-100 delay-200 linear" />);

    await advance(150);
    expect(animatedStyle().opacity).toBe(0);

    await advance(300);
    expect(animatedStyle().opacity).toBe(1);
  });

  it('interpolates unit and color channels', async () => {
    await render(
      <Box
        animate={{
          from: { rotate: '0deg', backgroundColor: '#000000' },
          to: { rotate: '90deg', backgroundColor: '#ffffff' },
          duration: 200,
          easing: 'linear',
        }}
      />,
    );

    await advance(100);
    const style = animatedStyle();

    expect(style.transform).toEqual([
      { rotate: expect.stringMatching(/deg$/) },
    ]);
    expect(
      parseFloat((style.transform as { rotate: string }[])[0]!.rotate),
    ).toBeCloseTo(45, 0);
    expect(style.backgroundColor).toMatch(/^rgba?\(/);
  });

  it('keeps static transforms while animating other transform channels', async () => {
    await render(
      <Box
        animate="slide-up duration-100"
        style={{ transform: [{ rotate: '10deg' }] }}
      />,
    );

    await advance(200);

    expect(animatedStyle().transform).toEqual([
      { translateY: 0 },
      { rotate: '10deg' },
    ]);
  });

  it('replays when the animate value changes', async () => {
    const view = await render(<Box animate="fade-in duration-100" />);

    await advance(200);
    expect(animatedStyle().opacity).toBe(1);

    await view.rerender(<Box animate="fade-out duration-100" />);
    await advance(200);
    expect(animatedStyle().opacity).toBe(0);
  });

  it('hands channels back to the static style when animate is removed', async () => {
    const view = await render(
      <Box animate="fade-in duration-100" style={{ opacity: 0.4 }} />,
    );

    await advance(200);
    await view.rerender(<Box style={{ opacity: 0.4 }} />);
    await advance(16);

    expect(animatedStyle().opacity).toBe(0.4);
  });

  it('plays serial array entries one after another', async () => {
    await render(
      <Box
        playback="serial"
        animate={[
          'fade-in duration-100 linear',
          'scale-in duration-100 linear',
        ]}
      />,
    );

    await advance(50);
    expect(animatedStyle().opacity).toBeCloseTo(0.5, 1);

    await advance(100);
    const style = animatedStyle();
    expect(style.opacity).toBe(1);
    expect((style.transform as { scale: number }[])[0]!.scale).toBeLessThan(1);

    await advance(200);
    expect(animatedStyle().transform).toEqual([{ scale: 1 }]);
  });
});

describe('transitions', () => {
  it('B1: does not replay the entrance animation when the style changes', async () => {
    const view = await render(
      <Box
        animate="fade-in transition-colors duration-200"
        style={{ backgroundColor: '#ff0000' }}
      />,
    );

    await advance(400);
    expect(animatedStyle().opacity).toBe(1);

    await view.rerender(
      <Box
        animate="fade-in transition-colors duration-200"
        style={{ backgroundColor: '#0000ff' }}
      />,
    );
    await advance(16);

    expect(animatedStyle().opacity).toBe(1);
    expect(animatedStyle().backgroundColor).toMatch(/^rgba?\(/);
  });

  it('animates only after the first change', async () => {
    await render(<Box animate="transition-opacity" style={{ opacity: 0.5 }} />);
    await advance(16);

    expect(animatedLayer().opacity).toBeUndefined();
  });

  it('B2: continues from the current value when interrupted', async () => {
    const animate = 'transition-opacity duration-1000 linear';
    const view = await render(<Box animate={animate} style={{ opacity: 0 }} />);

    await view.rerender(<Box animate={animate} style={{ opacity: 1 }} />);
    await advance(500);
    const midway = animatedStyle().opacity as number;
    expect(midway).toBeCloseTo(0.5, 1);

    await view.rerender(<Box animate={animate} style={{ opacity: 0 }} />);
    await advance(16);
    const afterInterrupt = animatedStyle().opacity as number;

    expect(Math.abs(afterInterrupt - midway)).toBeLessThan(0.05);

    await advance(1100);
    expect(animatedStyle().opacity).toBe(0);
  });

  it('only animates channels of its kind', async () => {
    const animate = 'transition-colors duration-100';
    const view = await render(
      <Box animate={animate} style={{ opacity: 1, backgroundColor: '#000' }} />,
    );

    await view.rerender(
      <Box
        animate={animate}
        style={{ opacity: 0.2, backgroundColor: '#fff' }}
      />,
    );
    await advance(16);

    expect(animatedLayer().opacity).toBeUndefined();
    expect(animatedLayer().backgroundColor).toBeDefined();
    expect(animatedStyle().opacity).toBe(0.2);
  });
});

describe('timeline controller', () => {
  function Harness({
    controllerRef,
    onComplete,
  }: {
    controllerRef: Ref<StrxTimelineController>;
    onComplete?: () => void;
  }) {
    const timeline = Strx.useTimeline({
      playables: PLAYABLES,
      onComplete,
    });

    useImperativeHandle(controllerRef, () => timeline, [timeline]);

    return <Strx.View testID="box" strxId="target" />;
  }

  const PLAYABLES = [
    {
      target: 'target',
      animate: 'from:opacity-0 to:opacity-100 duration-1000 linear',
    },
  ];

  async function setup(onComplete?: () => void) {
    const ref = React.createRef<StrxTimelineController>();

    await render(
      <Strx.TimelineRoot>
        <Harness controllerRef={ref} onComplete={onComplete} />
      </Strx.TimelineRoot>,
    );

    return () => ref.current!;
  }

  it('plays, stops in place, and reverses from the current value', async () => {
    const timeline = await setup();

    await run(() => timeline().play());
    await advance(400);
    expect(animatedStyle().opacity).toBeCloseTo(0.4, 1);

    await run(() => timeline().stop());
    await advance(300);
    expect(animatedStyle().opacity).toBeCloseTo(0.4, 1);

    await run(() => timeline().reverse());
    await advance(16);
    expect(animatedStyle().opacity as number).toBeLessThan(0.45);
    await advance(1000);
    expect(animatedStyle().opacity).toBe(0);
  });

  it('reset applies the from frame immediately', async () => {
    const timeline = await setup();

    await run(() => timeline().play());
    await advance(1100);
    await run(() => timeline().reset());
    await advance(16);

    expect(animatedStyle().opacity).toBe(0);
  });

  it('calls onComplete when targets finish, but not after stop', async () => {
    const onComplete = jest.fn();
    const timeline = await setup(onComplete);

    await run(() => timeline().play());
    await advance(500);
    await run(() => timeline().stop());
    await advance(1000);
    expect(onComplete).not.toHaveBeenCalled();

    await run(() => timeline().play());
    await advance(1100);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
