import React from 'react';
import { render } from '@testing-library/react-native';

import { Timeline } from '../Timeline';
import type { AnimateProp, PlaybackMode } from '../../types/animate';

interface ProbeProps {
  id: string;
  animate?: AnimateProp;
  playback?: PlaybackMode;
  interval?: number;
}

/**
 * Renders children through `Strx.Timeline` and returns the props each child
 * received after Timeline injected its timing controls.
 */
async function collect(
  timelineProps: Omit<React.ComponentProps<typeof Timeline>, 'children'>,
  animates: AnimateProp[],
) {
  const received: Record<string, Omit<ProbeProps, 'id'>> = {};

  function Probe({ id, ...props }: ProbeProps) {
    received[id] = props;
    return null;
  }

  await render(
    <Timeline {...timelineProps}>
      {animates.map((animate, index) => (
        <Probe key={index} id={String(index)} animate={animate} />
      ))}
    </Timeline>,
  );

  return animates.map((_, index) => received[String(index)]);
}

describe('Strx.Timeline', () => {
  it('leaves parallel children untouched', async () => {
    const [first, second] = await collect({}, ['fade-in', 'slide-up']);

    expect(first?.animate).toBe('fade-in');
    expect(second?.animate).toBe('slide-up');
  });

  it('offsets serial children by the previous estimated duration', async () => {
    const result = await collect({ playback: 'serial' }, [
      'fade-in',
      'slide-up duration-200',
      'scale-in',
    ]);

    expect(result.map(props => props?.animate)).toEqual([
      'fade-in',
      'slide-up duration-200 delay-300',
      'scale-in delay-500',
    ]);
  });

  it('staggers children by interval and carries explicit delays', async () => {
    const result = await collect({ playback: 'stagger', interval: 50 }, [
      'fade-in delay-100',
      'fade-in',
      'fade-in',
    ]);

    expect(result.map(props => props?.animate)).toEqual([
      'fade-in delay-100',
      'fade-in delay-150',
      'fade-in delay-200',
    ]);
  });

  it('adds delay to object animations', async () => {
    const [, second] = await collect({ playback: 'stagger', interval: 80 }, [
      { type: 'fade-in' },
      { type: 'fade-in', delay: 20 },
    ]);

    expect(second?.animate).toEqual({ type: 'fade-in', delay: 100 });
  });

  it('appends play-count tokens for infinite timelines', async () => {
    const [first] = await collect({ playCount: 'infinite' }, ['fade-in']);

    expect(first?.animate).toBe('fade-in play-infinite');
  });

  it('expands finite play counts into staggered cycles', async () => {
    const [first] = await collect({ playCount: 2 }, ['fade-in duration-200']);

    expect(first).toEqual({
      animate: ['fade-in duration-200', 'fade-in duration-200'],
      playback: 'stagger',
      interval: 300,
    });
  });
});
