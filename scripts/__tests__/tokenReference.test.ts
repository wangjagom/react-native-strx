import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { renderReadme } from '../tokenReference';

const README = join(__dirname, '../../README.md');

describe('README token reference', () => {
  it('is generated from the current parser and presets', () => {
    const current = readFileSync(README, 'utf8');
    const expected = renderReadme(current);

    if (process.env.UPDATE_DOCS === '1') {
      writeFileSync(README, expected);
      return;
    }

    // Run `npm run docs:tokens` to regenerate.
    expect(current).toBe(expected);
  });
});
