import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Strx, animationPresets } from 'react-native-strx';

import { Button, colors, Row, Section } from '../ui';

const PRESETS = Object.keys(animationPresets);

/**
 * QA: the first frame must already show the `from` state (no flash of the
 * final state), and every preset should run once per replay.
 */
export function EntranceScreen() {
  const [run, setRun] = useState(0);

  return (
    <>
      <Section
        title="Presets"
        hint="Replay remounts every box. Watch for a flash of the final state before the animation starts."
      >
        <Button label="Replay" onPress={() => setRun(value => value + 1)} />
        <Row>
          {PRESETS.map(name => (
            <Strx.View
              key={`${name}-${run}`}
              animate={`${name} duration-600`}
              style={styles.box}
            >
              <Strx.Text style={styles.label}>{name}</Strx.Text>
            </Strx.View>
          ))}
        </Row>
      </Section>

      <Section
        title="Preset + keyframes"
        hint='"fade-in from:translate-y-40": fades in while rising 40px.'
      >
        <Strx.View
          key={`combo-${run}`}
          animate="fade-in from:translate-y-40 duration-700 ease-out"
          style={styles.wide}
        />
      </Section>

      <Section title="Spring" hint='"bounce" and "from:scale-50 spring damping-6"'>
        <Row>
          <Strx.View key={`b-${run}`} animate="bounce" style={styles.box} />
          <Strx.View
            key={`s-${run}`}
            animate="from:scale-50 spring damping-6 stiffness-160"
            style={styles.box}
          />
        </Row>
      </Section>

      <Section
        title="Unknown token warning"
        hint='"fade-inn" should log one dev warning suggesting "fade-in".'
      >
        <Strx.View animate="fade-inn" style={styles.box} />
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    height: 72,
    justifyContent: 'center',
    width: 96,
  },
  label: { color: 'white', fontSize: 11, fontWeight: '700' },
  wide: { backgroundColor: colors.green, borderRadius: 12, height: 56 },
});
