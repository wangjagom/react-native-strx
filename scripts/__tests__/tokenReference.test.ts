import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { renderReadme, renderTokenMetadata } from '../tokenReference';

const ROOT = join(__dirname, '../..');
const README = join(ROOT, 'README.md');
const TOKENS = join(ROOT, 'tokens.json');
const update = process.env.UPDATE_DOCS === '1';

// Run `npm run docs:tokens` to regenerate both files.
describe('generated token documentation', () => {
  it('keeps the README token reference in sync', () => {
    const current = readFileSync(README, 'utf8');
    const expected = renderReadme(current);

    if (update) {
      writeFileSync(README, expected);
      return;
    }

    expect(current).toBe(expected);
  });

  it('keeps tokens.json in sync', () => {
    const { version } = JSON.parse(
      readFileSync(join(ROOT, 'package.json'), 'utf8'),
    ) as { version: string };
    const expected = renderTokenMetadata(version);

    if (update) {
      writeFileSync(TOKENS, expected);
      return;
    }

    expect(existsSync(TOKENS) ? readFileSync(TOKENS, 'utf8') : '').toBe(
      expected,
    );
  });
});
