import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { Strx } from '../index';

describe('Strx primitives', () => {
  it('renders View and Text inside Provider', async () => {
    await render(
      <Strx.Provider>
        <Strx.View animate="fade-in layout-spring" testID="box">
          <Strx.Text animate="slide-up">Hello STRX</Strx.Text>
        </Strx.View>
      </Strx.Provider>,
    );

    expect(screen.getByTestId('box')).toBeTruthy();
    expect(screen.getByText('Hello STRX')).toBeTruthy();
  });
});
