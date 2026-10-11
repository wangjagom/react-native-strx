import * as api from '../index';
import * as debug from '../debug';

/**
 * Guards the v1 public surface. Update deliberately when adding or removing
 * exports, and record the change in a changeset.
 */
describe('public API', () => {
  it('exports only the documented runtime values', () => {
    expect(Object.keys(api).sort()).toEqual([
      'Strx',
      'StrxImage',
      'StrxLayoutGroup',
      'StrxPressable',
      'StrxProvider',
      'StrxScrollView',
      'StrxText',
      'StrxTextInput',
      'StrxTimeline',
      'StrxTimelineRoot',
      'StrxView',
      'animationPresets',
      'createStrxComponent',
      'definePreset',
      'useStrxMotion',
      'useTimeline',
    ]);
  });

  it('keeps the Strx namespace members', () => {
    expect(Object.keys(api.Strx).sort()).toEqual([
      'Image',
      'LayoutGroup',
      'Pressable',
      'Provider',
      'ScrollView',
      'Text',
      'TextInput',
      'Timeline',
      'TimelineRoot',
      'View',
      'useTimeline',
    ]);
  });

  it('ships the debug overlay from the debug entry only', () => {
    expect(Object.keys(debug)).toEqual(['StrxDebugOverlay']);
    expect(api).not.toHaveProperty('DebugOverlay');
  });
});
