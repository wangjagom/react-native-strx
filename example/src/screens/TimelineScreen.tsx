import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Strx, type PlaybackMode } from 'react-native-strx';

import { Button, colors, Row, Section } from '../ui';

const TARGETS = ['one', 'two', 'three'];

/**
 * QA: play/reverse/stop/reset across three targets. "stop" freezes values in
 * place, "reverse" continues backward from the current position, and
 * onComplete fires only for runs that actually finish.
 */
export function TimelineScreen() {
  const [playback, setPlayback] = useState<PlaybackMode>('stagger');
  const [completed, setCompleted] = useState(0);
  const timeline = Strx.useTimeline({
    playback,
    interval: 150,
    playables: TARGETS.map(target => ({
      target,
      animate: 'from:opacity-20 from:translate-x-0 to:opacity-100 to:translate-x-160 duration-900 ease-in-out',
    })),
    onComplete: () => setCompleted(value => value + 1),
  });

  return (
    <>
      <Section title="Event timeline" hint={`playback="${playback}"`}>
        <Row>
          <Button label="Play" onPress={timeline.play} />
          <Button label="Reverse" onPress={timeline.reverse} />
          <Button label="Stop" onPress={timeline.stop} />
          <Button label="Reset" onPress={timeline.reset} />
        </Row>
        <Row>
          {(['parallel', 'serial', 'stagger'] as const).map(mode => (
            <Button key={mode} label={mode} onPress={() => setPlayback(mode)} />
          ))}
        </Row>
        <Text style={styles.counter}>onComplete calls: {completed}</Text>
        {TARGETS.map(target => (
          <Strx.View key={target} strxId={target} style={styles.dot} />
        ))}
      </Section>

      <Section
        title="Strx.Timeline (render-time)"
        hint="Children enter one after another (serial)."
      >
        <Strx.Timeline playback="serial">
          <Strx.View animate="fade-in duration-300" style={styles.bar} />
          <Strx.View animate="slide-right duration-300" style={styles.bar} />
          <Strx.View animate="scale-in duration-300" style={styles.bar} />
        </Strx.Timeline>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  counter: { color: colors.muted, fontSize: 13 },
  dot: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    height: 40,
    opacity: 0.2,
    width: 40,
  },
  bar: {
    backgroundColor: colors.green,
    borderRadius: 8,
    height: 24,
    marginBottom: 8,
  },
});
