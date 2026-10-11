import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';

import { Strx } from '../../index';

jest.useFakeTimers();

const getAnimatedStyle = Reanimated.getAnimatedStyle as unknown as (
  component: unknown,
) => Record<string, unknown>;

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

describe('Strx.Pressable', () => {
  it('B6: animates function styles with transition tokens', async () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();

    await render(
      <Strx.Pressable
        testID="button"
        animate="transition-opacity duration-200 linear"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      />,
    );
    const button = () => screen.getByTestId('button');

    expect(getAnimatedStyle(button()).opacity).toBe(1);

    await act(async () => {
      fireEvent(button(), 'pressIn', {});
    });
    await advance(100);

    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(getAnimatedStyle(button()).opacity).toBeCloseTo(0.75, 1);

    await advance(200);
    expect(getAnimatedStyle(button()).opacity).toBe(0.5);

    await act(async () => {
      fireEvent(button(), 'pressOut', {});
    });
    await advance(300);

    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(getAnimatedStyle(button()).opacity).toBe(1);
  });
});
