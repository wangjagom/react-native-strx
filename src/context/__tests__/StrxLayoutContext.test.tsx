import React from 'react';
import { render } from '@testing-library/react-native';

import { View } from '../../components/View';
import { resetWarnings } from '../../utils/warn';
import {
  StrxLayoutRoot,
  useStrxLayout,
  type StrxLayoutContextType,
} from '../StrxLayoutContext';

describe('StrxLayoutRoot', () => {
  it('keeps the live target when a duplicate strxId unmounts', async () => {
    resetWarnings();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let registry: StrxLayoutContextType | null = null;

    function Capture() {
      registry = useStrxLayout();
      return null;
    }

    function Tree({ showFirst }: { showFirst: boolean }) {
      return (
        <StrxLayoutRoot>
          <Capture />
          {showFirst ? <View strxId="card" /> : null}
          <View strxId="card" />
        </StrxLayoutRoot>
      );
    }

    const view = await render(<Tree showFirst />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Duplicate strxId "card"'),
    );

    await view.rerender(<Tree showFirst={false} />);

    expect(registry!.getPlayable('card')).toBeDefined();
    warn.mockRestore();
  });
});
