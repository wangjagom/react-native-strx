import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Strx, type AnimateProp, type PlaybackMode } from 'react-native-strx';

import { Button, colors, Row, Section } from '../ui';

const STEPS: AnimateProp = [
  'fade-in duration-300',
  'from:translate-x-0 to:translate-x-120 duration-400',
  'from:scale-100 to:scale-70 duration-300',
];

/** QA: array entries play together, in sequence, or staggered. */
export function PlaybackScreen() {
  const [run, setRun] = useState(0);

  return (
    <>
      <Button label="Replay" onPress={() => setRun(value => value + 1)} />
      {(['parallel', 'serial', 'stagger'] as PlaybackMode[]).map(playback => (
        <Section key={playback} title={`playback="${playback}"`}>
          <Strx.View
            key={`${playback}-${run}`}
            animate={STEPS}
            playback={playback}
            interval={200}
            style={styles.box}
          />
        </Section>
      ))}
      <Section title="Repeat" hint='"from:rotate-0 to:rotate-360 duration-1200 linear play-infinite"'>
        <Row>
          <Strx.View
            animate="from:rotate-0 to:rotate-360 duration-1200 linear play-infinite"
            style={styles.box}
          />
        </Row>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.accent, borderRadius: 12, height: 56, width: 56 },
});
